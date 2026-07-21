const Groq = require("groq-sdk");
const { buildInterviewPrompt, buildEvaluationPrompt, buildAnswerEvaluationPrompt, buildFinalReportPrompt } = require("../prompts/interviewPrompts");

const LLM_MODEL = "llama-3.3-70b-versatile";

function getClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

async function generateInterviewQuestion(interviewType, difficulty, previousQuestions = []) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }

  const { system, user } = buildInterviewPrompt(interviewType, difficulty, previousQuestions);

  const client = getClient();
  const response = await client.chat.completions.create({
    model: LLM_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    max_tokens: 150,
    temperature: 0.7,
  });

  const question = response.choices[0]?.message?.content?.trim();
  if (!question) throw new Error("Groq returned an empty question response.");

  console.log("[GroQ] Question Generated");
  return question;
}

async function evaluateInterview(questions) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }

  const { system, user } = buildEvaluationPrompt(questions);

  const client = getClient();
  const response = await client.chat.completions.create({
    model: LLM_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    max_tokens: 500,
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("Groq returned an empty evaluation response.");

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Groq did not return valid JSON for evaluation.");

  const parsed = JSON.parse(jsonMatch[0]);

  console.log("[GroQ] Evaluation Complete");

  return {
    overallScore: Math.min(100, Math.max(0, parsed.overallScore)),
    communication: Math.min(100, Math.max(0, parsed.communication)),
    confidence: Math.min(100, Math.max(0, parsed.confidence)),
    technical: Math.min(100, Math.max(0, parsed.technical)),
    problemSolving: Math.min(100, Math.max(0, parsed.problemSolving)),
    feedback: Array.isArray(parsed.feedback) ? parsed.feedback : [],
    verdict: ["Strong Hire", "Likely Shortlist", "Average Candidate", "Needs Improvement"].includes(parsed.verdict)
      ? parsed.verdict
      : "Average Candidate",
  };
}

async function evaluateSingleAnswer(question, answer, interviewType, difficulty) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }

  const { system, user } = buildAnswerEvaluationPrompt(question, answer, interviewType, difficulty);

  const client = getClient();
  const response = await client.chat.completions.create({
    model: LLM_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    max_tokens: 500,
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("Groq returned an empty evaluation response.");

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Groq did not return valid JSON for answer evaluation.");

  const parsed = JSON.parse(jsonMatch[0]);

  const clamp = (v) => Math.min(100, Math.max(0, v ?? 0));
  const ensureArray = (v) => (Array.isArray(v) ? v : []);

  console.log("[GroQ] Answer Evaluation Complete");

  return {
    technicalScore: clamp(parsed.technicalScore),
    communicationScore: clamp(parsed.communicationScore),
    confidenceScore: clamp(parsed.confidenceScore),
    problemSolvingScore: clamp(parsed.problemSolvingScore),
    overallScore: clamp(parsed.overallScore),
    strengths: ensureArray(parsed.strengths),
    weaknesses: ensureArray(parsed.weaknesses),
    feedback: typeof parsed.feedback === "string" ? parsed.feedback : "",
    idealAnswer: typeof parsed.idealAnswer === "string" ? parsed.idealAnswer : "",
  };
}

async function generateFinalReport(questions, answers, evaluations, averages, interviewType, difficulty) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }

  const { system, user } = buildFinalReportPrompt(questions, answers, evaluations, averages, interviewType, difficulty);

  const client = getClient();
  const response = await client.chat.completions.create({
    model: LLM_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    max_tokens: 1000,
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("Groq returned an empty final report response.");

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Groq did not return valid JSON for final report.");

  const parsed = JSON.parse(jsonMatch[0]);

  const clamp = (v) => Math.min(100, Math.max(0, v ?? 0));
  const ensureArray = (v) => (Array.isArray(v) ? v : []);

  const validDecisions = ["Strongly Recommended", "Recommended", "Consider", "Not Recommended"];

  console.log("[GroQ] Final Report Generated");

  return {
    overallScore: clamp(parsed.overallScore),
    communication: clamp(parsed.communication),
    technicalKnowledge: clamp(parsed.technicalKnowledge),
    confidence: clamp(parsed.confidence),
    problemSolving: clamp(parsed.problemSolving),
    strengths: ensureArray(parsed.strengths),
    weaknesses: ensureArray(parsed.weaknesses),
    recommendations: ensureArray(parsed.recommendations),
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    hiringDecision: validDecisions.includes(parsed.hiringDecision) ? parsed.hiringDecision : "Consider",
    difficultyLevel: ["Easy", "Medium", "Hard"].includes(parsed.difficultyLevel) ? parsed.difficultyLevel : "Medium",
  };
}

async function generateResponse(systemPrompt, userPrompt, options = {}) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }

  const client = getClient();
  const response = await client.chat.completions.create({
    model: LLM_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: options.maxTokens || 1000,
    temperature: options.temperature ?? 0.7,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("Groq returned an empty response.");

  return content;
}

module.exports = { generateInterviewQuestion, evaluateInterview, evaluateSingleAnswer, generateFinalReport, generateResponse };
