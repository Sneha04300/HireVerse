function buildInterviewPrompt(interviewType, difficulty, previousQuestions = []) {
  const noRepeatRule = previousQuestions.length > 0
    ? "\n- Do NOT repeat or rephrase any previously asked question."
    : "";
  const previousContext = previousQuestions.length > 0
    ? `\n\nPreviously asked questions:\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\nAsk a completely different question that has not been asked.`
    : "";

  return {
    system: `You are a Senior Technical Interviewer.

Your job is to conduct a realistic interview.

Rules:
- Ask ONLY ONE interview question.
- Never answer it.
- Never number the question.
- Never add explanation.
- Never greet.
- Keep it below 35 words.
- Match the requested difficulty.
- Match the requested interview type.${noRepeatRule}
- Question should feel natural and professional.`,
    user: `Interview Type: ${interviewType}
Difficulty: ${difficulty}${previousContext}

Return only the interview question.`,
  };
}

function buildEvaluationPrompt(questions) {
  const qaBlock = questions
    .map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer || "(no answer)"}`)
    .join("\n\n");

  return {
    system: `You are an expert interview evaluator. Analyze the candidate's answers and return ONLY a valid JSON object with no additional text, markdown, or explanation.

Evaluate these dimensions on a scale of 0-100:
- communication: clarity, structure, articulation
- confidence: decisiveness, certainty, conviction
- technical: accuracy, depth, domain knowledge
- problemSolving: logic, creativity, analytical thinking

Then compute:
- overallScore: weighted average of the four dimensions
- feedback: array of 2-4 concise, constructive feedback strings
- verdict: one of "Strong Hire", "Likely Shortlist", "Average Candidate", "Needs Improvement"`,
    user: qaBlock + `\n\nReturn a JSON object with keys: overallScore, communication, confidence, technical, problemSolving, feedback (array), verdict`,
  };
}

function buildFinalReportPrompt(questions, answers, evaluations, averages, interviewType, difficulty) {
  const qaBlock = questions
    .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || "(no answer)"}`)
    .join("\n\n");

  const evalBlock = evaluations
    .map((e, i) => `Q${i + 1} Evaluation:\n${JSON.stringify(e, null, 2)}`)
    .join("\n\n");

  return {
    system: `You are a senior hiring manager generating a final interview report.

Analyze the candidate's answers and per-question evaluations.

Return ONLY valid JSON. No markdown. No explanation. No code blocks.

JSON format:
{
  "overallScore": <0-100>,
  "communication": <0-100>,
  "technicalKnowledge": <0-100>,
  "confidence": <0-100>,
  "problemSolving": <0-100>,
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."],
  "recommendations": ["...", "...", "..."],
  "summary": "...",
  "hiringDecision": "Recommended",
  "difficultyLevel": "Medium"
}

Use the average scores as reference but adjust based on overall impression.
hiringDecision must be one of: "Strongly Recommended", "Recommended", "Consider", "Not Recommended"
difficultyLevel must be one of: "Easy", "Medium", "Hard"`,
    user: `Interview Type: ${interviewType}
Difficulty: ${difficulty}

Average Scores:
${JSON.stringify(averages, null, 2)}

Questions and Answers:
${qaBlock}

Per-Question Evaluations:
${evalBlock}

Generate the final report JSON.`,
  };
}

function buildAnswerEvaluationPrompt(question, answer, interviewType, difficulty) {
  return {
    system: `You are an expert interview evaluator.

Evaluate the candidate's answer to the given interview question.

Return ONLY valid JSON. No markdown. No explanation. No code blocks.

JSON format:
{
  "technicalScore": <0-100>,
  "communicationScore": <0-100>,
  "confidenceScore": <0-100>,
  "problemSolvingScore": <0-100>,
  "overallScore": <0-100>,
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "feedback": "...",
  "idealAnswer": "..."
}`,
    user: `Interview Type: ${interviewType}
Difficulty: ${difficulty}

Question: ${question}

Candidate Answer: ${answer}

Evaluate the answer and return only the JSON.`,
  };
}

module.exports = { buildInterviewPrompt, buildEvaluationPrompt, buildAnswerEvaluationPrompt, buildFinalReportPrompt };
