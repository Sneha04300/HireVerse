/**
 * mockInterviewService.js
 * Core business logic for AI Mock Interview — question selection, transcript
 * management, scoring engine, and report generation.
 */

const MockInterview = require("../models/MockInterview");

const QUESTIONS_PER_INTERVIEW = 6;

// ─────────────────────────────────────────────────────────────────────────────
// Question banks — by type, then by difficulty
// ─────────────────────────────────────────────────────────────────────────────
const QUESTION_BANK = {
  Technical: {
    Easy: [
      "Tell me about yourself.",
      "What is the difference between an array and a linked list?",
      "Explain the difference between SQL and NoSQL databases.",
      "What is the time complexity of binary search?",
      "What is a REST API?",
      "Explain the concept of OOP and its four pillars.",
      "What is the difference between == and === in JavaScript?",
      "What is a hash map and how does it work?",
    ],
    Medium: [
      "Tell me about yourself.",
      "Walk me through how you would design a URL shortening service.",
      "Explain the CAP theorem with a real-world example.",
      "How would you optimize a slow SQL query?",
      "Describe a challenging bug you fixed and how you debugged it.",
      "Explain the difference between process and thread.",
      "How does garbage collection work in JavaScript?",
      "Design a rate limiter for an API.",
      "Explain how indexing improves database performance.",
    ],
    Hard: [
      "Tell me about yourself.",
      "Design a distributed cache system like Redis.",
      "How would you scale a system to handle 10 million concurrent users?",
      "Explain consistent hashing and where it's used.",
      "Walk me through designing a real-time chat application's backend.",
      "How would you design a system to detect fraud in real time?",
      "Explain trade-offs between microservices and monolith architecture.",
      "Design an autocomplete/typeahead system at scale.",
    ],
  },
  HR: {
    Easy: [
      "Tell me about yourself.",
      "Why do you want to work at our company?",
      "What are your strengths and weaknesses?",
      "Where do you see yourself in 5 years?",
      "Why should we hire you?",
      "What motivates you at work?",
    ],
    Medium: [
      "Tell me about yourself.",
      "Describe a time you faced conflict in a team and how you resolved it.",
      "Tell me about a time you failed and what you learned.",
      "How do you handle tight deadlines and pressure?",
      "Describe a situation where you had to convince a teammate of your idea.",
      "What would your previous manager/professor say about you?",
      "Tell me about a time you took initiative without being asked.",
    ],
    Hard: [
      "Tell me about yourself.",
      "Describe a time you disagreed with a decision your team made and what you did.",
      "Tell me about your biggest professional failure and how you recovered.",
      "How do you prioritize when everything seems urgent?",
      "Tell me about a time you had to deliver difficult feedback to someone.",
      "Describe a time you had to make a decision with incomplete information.",
    ],
  },
  Mixed: {
    Easy: [
      "Tell me about yourself.",
      "Why do you want to work at our company?",
      "What is a REST API?",
      "What are your strengths and weaknesses?",
      "Explain the difference between SQL and NoSQL databases.",
      "Where do you see yourself in 5 years?",
    ],
    Medium: [
      "Tell me about yourself.",
      "Walk me through a project you're proud of and the technical decisions you made.",
      "Describe a time you faced conflict in a team and how you resolved it.",
      "Explain the CAP theorem with a real-world example.",
      "Tell me about a time you failed and what you learned.",
      "How would you optimize a slow SQL query?",
      "How do you handle tight deadlines and pressure?",
    ],
    Hard: [
      "Tell me about yourself.",
      "Design a distributed cache system like Redis.",
      "Describe a time you disagreed with a decision your team made and what you did.",
      "How would you scale a system to handle 10 million concurrent users?",
      "Tell me about your biggest professional failure and how you recovered.",
      "Explain trade-offs between microservices and monolith architecture.",
    ],
  },
};

const FEEDBACK_BANK = {
  lowCommunication:  "Speak more confidently in the first 30 seconds — lead with a strong opening line.",
  lowConfidence:      "Avoid filler words like 'um' and 'maybe' — state your answer with conviction.",
  lowTechnical:       "Go deeper into the 'why' behind your technical choices, not just the 'what'.",
  lowProblemSolving:  "Structure answers using the STAR method (Situation, Task, Action, Result).",
  noMetrics:          "Add measurable impact while explaining projects — numbers make answers memorable.",
  goodPace:           "Good pacing overall — your answers were neither rushed nor overly long.",
  goodStructure:      "Your answers were well-structured and easy to follow.",
  strongClosing:      "Strong closing statements — you tied your answers back to the role well.",
  needsExamples:      "Back up claims with specific examples rather than general statements.",
  goodTechnicalDepth: "Solid technical depth — you explained trade-offs clearly.",
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Question selection
// ─────────────────────────────────────────────────────────────────────────────
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const generateQuestions = (type, difficulty) => {
  const pool = QUESTION_BANK[type]?.[difficulty];
  if (!pool) {
    throw new Error(`No question bank found for type="${type}" difficulty="${difficulty}"`);
  }

  // "Tell me about yourself" always leads, the rest shuffled & deduped
  const [opener, ...rest] = pool;
  const shuffledRest = shuffle(rest).slice(0, QUESTIONS_PER_INTERVIEW - 1);
  const selected = [opener, ...shuffledRest];

  // Pad with repeats from the bank if not enough unique questions exist
  while (selected.length < QUESTIONS_PER_INTERVIEW) {
    selected.push(pool[selected.length % pool.length]);
  }

  return selected.slice(0, QUESTIONS_PER_INTERVIEW).map((q) => ({
    question: q,
    answer:   "",
    score:    null,
  }));
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Per-answer scoring (heuristic — swap with real NLP/LLM scoring later)
// ─────────────────────────────────────────────────────────────────────────────
const scoreAnswer = (answerText) => {
  if (!answerText || !answerText.trim()) return 0;

  const words        = answerText.trim().split(/\s+/);
  const wordCount     = words.length;
  const hasNumbers    = /\d/.test(answerText);
  const hasStarWords  = /(situation|task|action|result|because|therefore|so that)/i.test(answerText);
  const fillerCount   = (answerText.match(/\b(um|uh|like|maybe|i guess|sort of)\b/gi) || []).length;

  let score = 50; // baseline

  // Length signal — too short or excessively long both hurt
  if (wordCount >= 40 && wordCount <= 180) score += 20;
  else if (wordCount >= 20 && wordCount < 40) score += 10;
  else if (wordCount < 10) score -= 15;

  if (hasNumbers)    score += 10;   // quantified impact
  if (hasStarWords)  score += 10;   // structured reasoning
  score -= fillerCount * 3;         // filler words penalty

  return Math.max(0, Math.min(100, Math.round(score)));
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Transcript helpers
// ─────────────────────────────────────────────────────────────────────────────
const appendTranscriptLine = (doc, speaker, text) => {
  doc.transcript.push({ speaker, text, timestamp: new Date() });
  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Aggregate scoring across all answered questions
// ─────────────────────────────────────────────────────────────────────────────
const clampScore = (n) => Math.max(0, Math.min(100, Math.round(n)));

// Deterministic small pseudo-variance per metric so the 4 sub-scores feel
// distinct without being random on every recompute.
const variance = (doc, key) => {
  const seedStr = `${doc._id}${key}`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) hash = (hash * 31 + seedStr.charCodeAt(i)) % 1000;
  return (hash % 13) - 6; // range: -6 to +6
};

const calculateAggregateScores = (doc) => {
  const answered = doc.questions.filter((q) => q.answer && q.answer.trim());

  if (!answered.length) {
    return { communication: 0, confidence: 0, technical: 0, problemSolving: 0 };
  }

  const avgScore = answered.reduce((sum, q) => sum + (q.score || 0), 0) / answered.length;

  const communication   = clampScore(avgScore + variance(doc, "comm"));
  const confidence       = clampScore(avgScore + variance(doc, "conf"));
  const technical         = doc.type === "HR"
    ? clampScore(avgScore - 8 + variance(doc, "tech"))
    : clampScore(avgScore + variance(doc, "tech"));
  const problemSolving    = clampScore(avgScore + variance(doc, "prob"));

  return { communication, confidence, technical, problemSolving };
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Feedback generator
// ─────────────────────────────────────────────────────────────────────────────
const generateFeedback = (doc, scores) => {
  const feedback = [];
  const answered = doc.questions.filter((q) => q.answer && q.answer.trim());
  const hasNumbersOverall = answered.some((q) => /\d/.test(q.answer));
  const hasStarOverall    = answered.some((q) => /(situation|task|action|result)/i.test(q.answer));

  if (scores.confidence < 70)      feedback.push(FEEDBACK_BANK.lowCommunication);
  if (scores.confidence < 65)      feedback.push(FEEDBACK_BANK.lowConfidence);
  if (!hasNumbersOverall)          feedback.push(FEEDBACK_BANK.noMetrics);
  if (!hasStarOverall)             feedback.push(FEEDBACK_BANK.lowProblemSolving);
  if (doc.type !== "HR" && scores.technical < 70) feedback.push(FEEDBACK_BANK.lowTechnical);

  if (scores.communication >= 75)  feedback.push(FEEDBACK_BANK.goodStructure);
  if (scores.technical >= 80 && doc.type !== "HR") feedback.push(FEEDBACK_BANK.goodTechnicalDepth);

  // Always return at least 3 actionable points
  if (feedback.length < 3) {
    feedback.push(FEEDBACK_BANK.needsExamples, FEEDBACK_BANK.goodPace);
  }

  return [...new Set(feedback)].slice(0, 5);
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. Verdict from overall score
// ─────────────────────────────────────────────────────────────────────────────
const calculateVerdict = (overallScore) => {
  if (overallScore >= 85) return "Strong Hire";
  if (overallScore >= 70) return "Likely Shortlist";
  if (overallScore >= 55) return "Average Candidate";
  return "Needs Improvement";
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. Full report builder — called on /end and /report
// ─────────────────────────────────────────────────────────────────────────────
const buildReport = (doc) => {
  const { communication, confidence, technical, problemSolving } = calculateAggregateScores(doc);
  const overallScore = clampScore((communication + confidence + technical + problemSolving) / 4);
  const verdict       = calculateVerdict(overallScore);
  const feedback       = generateFeedback(doc, { communication, confidence, technical, problemSolving });

  return { overallScore, communication, confidence, technical, problemSolving, feedback, verdict };
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. Master pipeline: start a new interview
// ─────────────────────────────────────────────────────────────────────────────
const startInterview = async (userId, { type, difficulty }) => {
  const questions = generateQuestions(type, difficulty);

  const doc = await MockInterview.create({
    userId,
    type,
    difficulty,
    status: "started",
    startedAt: new Date(),
    currentQuestionIndex: 0,
    questions,
    transcript: [],
  });

  appendTranscriptLine(doc, "AI", questions[0].question);
  doc.status = "in_progress";
  await doc.save();

  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. Master pipeline: submit an answer, advance to next question
// ─────────────────────────────────────────────────────────────────────────────
const submitAnswer = async (doc, answerText) => {
  const idx = doc.currentQuestionIndex;

  if (idx >= doc.questions.length) {
    throw new Error("Interview already has all questions answered.");
  }

  // Store answer + score on the current question
  doc.questions[idx].answer = answerText;
  doc.questions[idx].score  = scoreAnswer(answerText);

  // Transcript: user's answer, then (if more questions remain) the next AI question
  appendTranscriptLine(doc, "User", answerText);

  const isLastQuestion = idx === doc.questions.length - 1;

  if (!isLastQuestion) {
    doc.currentQuestionIndex += 1;
    const nextQuestion = doc.questions[doc.currentQuestionIndex].question;
    appendTranscriptLine(doc, "AI", nextQuestion);
  }

  await doc.save();
  return { doc, isLastQuestion };
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. Master pipeline: end interview, finalize report
// ─────────────────────────────────────────────────────────────────────────────
const endInterview = async (doc) => {
  doc.status   = "completed";
  doc.endedAt  = new Date();
  doc.duration = Math.max(0, Math.round((doc.endedAt - doc.startedAt) / 1000));
  doc.report   = buildReport(doc);

  await doc.save();
  return doc;
};

module.exports = {
  QUESTIONS_PER_INTERVIEW,
  generateQuestions,
  scoreAnswer,
  appendTranscriptLine,
  calculateAggregateScores,
  generateFeedback,
  calculateVerdict,
  buildReport,
  startInterview,
  submitAnswer,
  endInterview,
};
