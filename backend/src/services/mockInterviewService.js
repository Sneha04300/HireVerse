const MockInterview = require("../models/MockInterview");
const groqService = require("./groqService");

const QUESTIONS_PER_INTERVIEW = 6;

const appendTranscriptLine = (doc, speaker, text) => {
  doc.transcript.push({ speaker, text, timestamp: new Date() });
  return doc;
};

const startInterview = async (userId, { type, difficulty }) => {
  const question = await groqService.generateInterviewQuestion(type, difficulty);

  const questions = [
    {
      question,
      answer: "",
      score: null,
      generatedBy: "groq-llama",
      createdAt: new Date(),
    },
  ];

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

  appendTranscriptLine(doc, "AI", question);
  doc.status = "in_progress";
  await doc.save();

  return doc;
};

const submitAnswer = async (doc, answerText) => {
  const idx = doc.currentQuestionIndex;

  if (idx >= doc.questions.length) {
    throw new Error("Interview already has all questions answered.");
  }

  doc.questions[idx].answer = answerText;

  const evaluation = await groqService.scoreAnswer(
    doc.questions[idx].question,
    answerText
  );
  doc.questions[idx].score = Math.round(
    (evaluation.communication +
      evaluation.technical +
      evaluation.confidence +
      evaluation.problemSolving) /
      4
  );

  appendTranscriptLine(doc, "User", answerText);

  const isLastQuestion = idx >= QUESTIONS_PER_INTERVIEW - 1;

  if (!isLastQuestion) {
    const previousQAs = doc.questions.map((q) => ({
      question: q.question,
      answer: q.answer || null,
    }));

    const nextQuestion = await groqService.generateInterviewQuestion(
      doc.type,
      doc.difficulty,
      previousQAs
    );

    doc.questions.push({
      question: nextQuestion,
      answer: "",
      score: null,
      generatedBy: "groq-llama",
      createdAt: new Date(),
    });

    doc.currentQuestionIndex += 1;
    appendTranscriptLine(doc, "AI", nextQuestion);
  }

  await doc.save();
  return { doc, isLastQuestion };
};

const DECISION_MAP = {
  "Excellent": "Strong Hire",
  "Good": "Likely Shortlist",
  "Average": "Average Candidate",
  "Needs Improvement": "Needs Improvement",
};

const endInterview = async (doc) => {
  doc.status = "completed";
  doc.endedAt = new Date();
  doc.duration = Math.max(0, Math.round((doc.endedAt - doc.startedAt) / 1000));

  const qaPairs = doc.questions.map((q) => ({
    question: q.question,
    answer: q.answer || "",
  }));

  const report = await groqService.generateFinalReport(
    doc.transcript,
    qaPairs.map((p) => p.question),
    qaPairs.map((p) => p.answer),
    doc.type,
    doc.difficulty
  );

  doc.report = {
    ...report,
    score: report.overallScore,
    verdict: DECISION_MAP[report.decision] || "Average Candidate",
  };
  await doc.save();
  return doc;
};

module.exports = {
  QUESTIONS_PER_INTERVIEW,
  appendTranscriptLine,
  startInterview,
  submitAnswer,
  endInterview,
};
