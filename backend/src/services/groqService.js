const Groq = require("groq-sdk");
const { buildInterviewPrompt, buildEvaluationPrompt, buildAnswerEvaluationPrompt, buildFinalReportPrompt } = require("../prompts/interviewPrompts");

const LLM_MODEL = "openai/gpt-oss-20b";
const MAX_QUESTION_RETRIES = 2;
const QUESTION_RETRY_DELAY_MS = 1500;

function getClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// ── Question validation ─────────────────────────────────────────────────────
// Rejects: null, empty, whitespace-only, truncated fragments, obviously incomplete
function isValidQuestion(text) {
  if (typeof text !== "string") return false;
  let t = text.trim();
  if (!t) return false;

  // Strip surrounding quotes
  t = t.replace(/^["']|["']$/g, "").trim();
  if (!t) return false;

  // If it looks like JSON, try to extract
  if (t.startsWith("{")) {
    try {
      const parsed = JSON.parse(t);
      const extracted = parsed.question || parsed.text || parsed.q || parsed.content || null;
      if (typeof extracted === "string" && extracted.trim().length > 10) {
        t = extracted.trim();
      } else {
        return false;
      }
    } catch (_) {
      return false;
    }
  }

  // Must be at least 15 characters (rejects very short fragments)
  if (t.length < 15) return false;

  // Must end with a question mark or be a valid imperative question
  // (some interview questions are commands like "Explain...")
  const endsWithPunctuation = /[?.!]$/.test(t);
  const startsWithQuestionWord = /^(what|how|why|when|where|who|which|can|could|would|do|does|describe|explain|tell|walk|give|compare|design|implement|analyze)/i.test(t);
  if (!endsWithPunctuation && !startsWithQuestionWord) return false;

  // Reject obviously truncated (ends mid-word or with preposition/connector)
  const truncatedPatterns = /\b(for|the|a|an|in|on|at|to|of|with|and|or|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|can|shall)\s*$/i;
  if (truncatedPatterns.test(t)) return false;

  return true;
}

// Normalize a question for duplicate comparison
function normalizeForCompare(text) {
  if (typeof text !== "string") return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isDuplicateQuestion(newQ, previousQuestions) {
  const normalized = normalizeForCompare(newQ);
  if (!normalized) return true;
  return previousQuestions.some((pq) => normalizeForCompare(pq) === normalized);
}

async function generateInterviewQuestion(interviewType, difficulty, previousQuestions = []) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }

  const client = getClient();
  const maxAttempts = MAX_QUESTION_RETRIES + 1;

  // Build the primary prompt using the existing prompt builder
  const { system: primarySystem, user: primaryUser } = buildInterviewPrompt(interviewType, difficulty, previousQuestions);

  // Build a compact fallback prompt (shorter, more direct)
  const prevList = previousQuestions.length > 0
    ? `\nPreviously asked (do NOT repeat):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n`
    : "";

  const fallbackSystem = `You are an interview question generator. Generate exactly ONE interview question. Rules: one question only, no answer, no explanation, no greeting, no numbering, max 25 words, match the type and difficulty. Return ONLY the question text.`;

  const fallbackUser = `Type: ${interviewType}\nDifficulty: ${difficulty}${prevList}\nGenerate one NEW interview question. Return ONLY the question text. No answer. No explanation.`;

  // This model may use reasoning tokens internally. We need sufficient budget.
  const tokenBudget = 500;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Attempt 1 uses primary prompt; attempts 2+ use fallback prompt
      const isFallback = attempt > 1;
      const systemPrompt = isFallback ? fallbackSystem : primarySystem;
      const userPrompt = isFallback ? fallbackUser : primaryUser;

      const response = await client.chat.completions.create({
        model: LLM_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: tokenBudget,
        temperature: isFallback ? 0.9 : 0.7,
      });

      const finishReason = response.choices?.[0]?.finish_reason;
      const rawContent = response.choices?.[0]?.message?.content;
      const reasoningContent = response.choices?.[0]?.message?.reasoning_content;
      const rawLen = (rawContent || "").length;
      const reasoningLen = (reasoningContent || "").length;
      const usage = response.usage || {};

      console.log(`[Groq] Q-gen attempt ${attempt}/${maxAttempts}: finish=${finishReason}, content_len=${rawLen}, reasoning_len=${reasoningLen}, max_tokens=${tokenBudget}, prompt_tokens=${usage.prompt_tokens || "?"}, completion_tokens=${usage.completion_tokens || "?"}`);

      // If finish_reason is length AND content is empty, the model ran out of tokens
      // before producing output (likely consumed by reasoning). Treat as failure.
      if (finishReason === "length" && rawLen < 20) {
        console.error(`[Groq] Attempt ${attempt}: token budget exhausted (finish=length, content_len=${rawLen}, reasoning_len=${reasoningLen})`);
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, QUESTION_RETRY_DELAY_MS * attempt));
        }
        continue;
      }

      const question = extractQuestion(rawContent);

      // Validate the question is not a duplicate
      if (question && isDuplicateQuestion(question, previousQuestions)) {
        console.error(`[Groq] Attempt ${attempt}: duplicate question detected, retrying`);
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, QUESTION_RETRY_DELAY_MS * attempt));
        }
        continue;
      }

      if (question) {
        console.log(`[Groq] Question generated on attempt ${attempt}${isFallback ? " (fallback)" : ""}`);
        return question;
      }

      console.error(`[Groq] Attempt ${attempt}: invalid content (len=${rawLen}, finish=${finishReason})`);
    } catch (err) {
      console.error(`[Groq] Attempt ${attempt} error: ${err.message}`);
    }

    // Backoff between attempts
    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, QUESTION_RETRY_DELAY_MS * attempt));
    }
  }

  throw new Error("Groq failed to generate a valid interview question after all attempts.");
}

function extractContent(raw) {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed;
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

  let content = extractContent(response.choices?.[0]?.message?.content);
  if (!content) throw new Error("Groq returned an empty evaluation response.");

  // Strip markdown code fences if present
  content = content.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Groq did not return valid JSON for evaluation.");

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (parseErr) {
    throw new Error(`Groq returned malformed JSON for evaluation: ${parseErr.message}`);
  }

  console.log("[Groq] Evaluation Complete");

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

  let content = extractContent(response.choices?.[0]?.message?.content);
  if (!content) throw new Error("Groq returned an empty evaluation response.");

  // Strip markdown code fences if present: ```json\n...\n``` or ```\n...\n```
  content = content.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Groq did not return valid JSON for answer evaluation.");

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (parseErr) {
    throw new Error(`Groq returned malformed JSON for answer evaluation: ${parseErr.message}`);
  }

  const clamp = (v) => Math.min(100, Math.max(0, v ?? 0));
  const ensureArray = (v) => (Array.isArray(v) ? v : []);

  console.log("[Groq] Answer Evaluation Complete");

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
