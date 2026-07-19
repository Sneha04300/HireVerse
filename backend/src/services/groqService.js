const Groq = require("groq-sdk");
const fs = require("fs");

const STT_MODEL = "whisper-large-v3-turbo";
const LLM_MODEL = "llama-3.3-70b-versatile";

function getClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

async function transcribeAudio(filePath) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }

  const client = getClient();
  const transcription = await client.audio.transcriptions.create({
    model: STT_MODEL,
    file: fs.createReadStream(filePath),
    response_format: "json",
  });

  return transcription.text;
}

async function generateInterviewQuestion(type, difficulty, previousConversation = []) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }

  let context = "";
  if (previousConversation.length > 0) {
    context = "\n\nPrevious questions and answers:";
    for (const entry of previousConversation) {
      context += `\nQ: ${entry.question}`;
      if (entry.answer) context += `\nA: ${entry.answer}`;
    }
    context += "\n\nGenerate the NEXT logical interview question. Do not repeat any previous question.";
  } else {
    context = "\n\nThis is the FIRST question of the interview.";
  }

  const prompt = `You are an experienced FAANG interviewer conducting a ${type} interview at ${difficulty} difficulty.${context}

Return ONLY the question text. No numbering. No explanation. No extra text.`;

  const client = getClient();
  const response = await client.chat.completions.create({
    model: LLM_MODEL,
    messages: [
      { role: "system", content: "You are a FAANG interviewer. Generate one interview question at a time. Never repeat questions." },
      { role: "user", content: prompt },
    ],
    max_tokens: 200,
    temperature: 0.7,
  });

  const question = response.choices[0]?.message?.content?.trim();
  if (!question) throw new Error("Groq returned an empty question response.");
  return question;
}

async function scoreAnswer(interviewQuestion, userAnswer) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }

  const prompt = `Evaluate this interview answer and return ONLY valid JSON.

Question: "${interviewQuestion}"
Answer: "${userAnswer}"

Score each category 0-100:
- communication: clarity, structure, articulation
- technical: depth of technical knowledge
- confidence: certainty, conviction, lack of filler words
- problemSolving: logical reasoning, structured thinking, STAR method

Return ONLY this JSON object. No markdown. No explanation:
{
  "communication": 0-100,
  "technical": 0-100,
  "confidence": 0-100,
  "problemSolving": 0-100,
  "feedback": [
    "specific feedback point 1",
    "specific feedback point 2",
    "specific feedback point 3"
  ]
}`;

  const client = getClient();
  const response = await client.chat.completions.create({
    model: LLM_MODEL,
    messages: [
      { role: "system", content: "You are an expert interview evaluator. Return ONLY valid JSON. No markdown." },
      { role: "user", content: prompt },
    ],
    max_tokens: 400,
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("Groq returned empty evaluation.");

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    throw new Error("Failed to parse Groq evaluation response.");
  }

  const score = {
    communication: clampScore(parsed.communication),
    technical: clampScore(parsed.technical),
    confidence: clampScore(parsed.confidence),
    problemSolving: clampScore(parsed.problemSolving),
    feedback: Array.isArray(parsed.feedback) ? parsed.feedback : [],
  };

  validateScoreShape(score);
  return score;
}

async function generateFinalReport(transcript, questions, answers, type, difficulty) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }

  const qaText = questions
    .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || "(no answer)"}`)
    .join("\n\n");

  const transcriptText = transcript
    .map((line) => `${line.speaker}: ${line.text}`)
    .join("\n");

  const prompt = `Generate a complete interview report as JSON.

Interview Type: ${type}
Difficulty: ${difficulty}

Questions and Answers:
${qaText}

Full Transcript:
${transcriptText}

Return ONLY this JSON object. No markdown. No explanation:
{
  "overallScore": 0-100,
  "communication": 0-100,
  "technical": 0-100,
  "confidence": 0-100,
  "problemSolving": 0-100,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "feedback": ["actionable feedback 1", "actionable feedback 2", "actionable feedback 3"],
  "decision": "Excellent|Good|Average|Needs Improvement"
}`;

  const client = getClient();
  const response = await client.chat.completions.create({
    model: LLM_MODEL,
    messages: [
      { role: "system", content: "You are an expert interview report generator. Return ONLY valid JSON. No markdown." },
      { role: "user", content: prompt },
    ],
    max_tokens: 600,
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("Groq returned empty report.");

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    throw new Error("Failed to parse Groq report response.");
  }

  const report = {
    overallScore: clampScore(parsed.overallScore),
    communication: clampScore(parsed.communication),
    technical: clampScore(parsed.technical),
    confidence: clampScore(parsed.confidence),
    problemSolving: clampScore(parsed.problemSolving),
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
    feedback: Array.isArray(parsed.feedback) ? parsed.feedback : [],
    decision: validateDecision(parsed.decision),
  };

  validateReportShape(report);
  return report;
}

function clampScore(n) {
  const num = Number(n);
  if (isNaN(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function validateDecision(decision) {
  const valid = ["Excellent", "Good", "Average", "Needs Improvement"];
  if (valid.includes(decision)) return decision;
  return "Average";
}

function validateScoreShape(score) {
  const keys = ["communication", "technical", "confidence", "problemSolving"];
  for (const key of keys) {
    if (typeof score[key] !== "number" || isNaN(score[key])) {
      score[key] = 0;
    }
  }
  if (!Array.isArray(score.feedback)) {
    score.feedback = [];
  }
}

function validateReportShape(report) {
  const keys = ["overallScore", "communication", "technical", "confidence", "problemSolving"];
  for (const key of keys) {
    if (typeof report[key] !== "number" || isNaN(report[key])) {
      report[key] = 0;
    }
  }
  if (!Array.isArray(report.strengths)) report.strengths = [];
  if (!Array.isArray(report.weaknesses)) report.weaknesses = [];
  if (!Array.isArray(report.feedback)) report.feedback = [];
  if (!["Excellent", "Good", "Average", "Needs Improvement"].includes(report.decision)) {
    report.decision = "Average";
  }
}

module.exports = {
  transcribeAudio,
  generateInterviewQuestion,
  scoreAnswer,
  generateFinalReport,
};
