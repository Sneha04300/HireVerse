const MockInterview = require("../models/MockInterview");
const groqService = require("./groqService");

const QUESTIONS_PER_INTERVIEW = 6;

const appendTranscriptLine = (doc, speaker, text) => {
  doc.transcript.push({ speaker, text, timestamp: new Date() });
  return doc;
};

const startInterview = async (userId, { type, difficulty }) => {
  const questionText = await groqService.generateInterviewQuestion(type, difficulty);

  const doc = await MockInterview.create({
    userId,
    type,
    difficulty,
    status: "started",
    startedAt: new Date(),
    currentQuestionIndex: 0,
    questions: [
      {
        number: 1,
        question: questionText,
        answer: "",
        source: "groq",
        generatedBy: "groq-llama",
        createdAt: new Date(),
      },
    ],
    transcript: [],
  });

  console.log("[Interview] Interview Started");

  return doc;
};

const evaluateWithRetry = async (question, answer, type, difficulty, retries = 1) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await groqService.evaluateSingleAnswer(question, answer, type, difficulty);
      return result;
    } catch (err) {
      console.error(`[Interview] Evaluation attempt ${attempt + 1}/${retries + 1} failed:`, err.message);
      if (attempt < retries) {
        console.log("[Interview] Retrying evaluation...");
      } else {
        throw err;
      }
    }
  }
};

const generateReport = async (doc) => {
  const answered = doc.questions.filter((q) => q.answer && q.answer.trim());
  const questions = answered.map((q) => q.question);
  const answers = answered.map((q) => q.answer);
  const evaluations = answered.map((q) => q.evaluation).filter(Boolean);

  const avg = (arr, key) => {
    const vals = arr.map((e) => e[key]).filter((v) => v != null);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  };

  const averages = {
    overallScore: avg(evaluations, "overallScore"),
    communication: avg(evaluations, "communicationScore"),
    technicalKnowledge: avg(evaluations, "technicalScore"),
    confidence: avg(evaluations, "confidenceScore"),
    problemSolving: avg(evaluations, "problemSolvingScore"),
  };

  try {
    const report = await groqService.generateFinalReport(
      questions, answers, evaluations, averages, doc.type, doc.difficulty
    );
    doc.report = report;
    console.log("[Interview] Final report generated");
  } catch (err) {
    console.error("[Interview] Final report generation failed:", err.message);
    doc.report = {
      overallScore: averages.overallScore,
      communication: averages.communication,
      technicalKnowledge: averages.technicalKnowledge,
      confidence: averages.confidence,
      problemSolving: averages.problemSolving,
      strengths: [],
      weaknesses: [],
      recommendations: [],
      summary: "Report could not be fully generated. Average scores are shown.",
      hiringDecision: "Consider",
      difficultyLevel: doc.difficulty,
    };
  }

  doc.status = "completed";
  doc.endedAt = new Date();
  doc.duration = Math.max(0, Math.round((doc.endedAt - doc.startedAt) / 1000));
  await doc.save();

  return doc;
};

const submitAnswer = async (doc, answerText) => {
  const idx = doc.currentQuestionIndex;

  if (idx >= doc.questions.length) {
    throw new Error("Interview already has all questions answered.");
  }

  doc.questions[idx].answer = answerText;

  appendTranscriptLine(doc, "User", answerText);

  doc.status = "in_progress";

  // Evaluate the answer (with retry, don't crash on failure)
  const q = doc.questions[idx];
  try {
    const evaluation = await evaluateWithRetry(q.question, answerText, doc.type, doc.difficulty);
    q.evaluation = evaluation;
    console.log(`[Interview] Evaluation saved for Q${idx + 1}: overallScore=${evaluation.overallScore}`);
  } catch (err) {
    console.error(`[Interview] Evaluation failed for Q${idx + 1} after retries:`, err.message);
  }

  let nextQuestion = null;
  let nextQuestionNumber = null;
  let report = null;
  const nextNum = idx + 2;

  if (nextNum <= QUESTIONS_PER_INTERVIEW) {
    const previousQuestions = doc.questions
      .filter((q) => q.question)
      .map((q) => q.question);

    nextQuestion = await groqService.generateInterviewQuestion(doc.type, doc.difficulty, previousQuestions);
    nextQuestionNumber = nextNum;

    doc.questions.push({
      number: nextNum,
      question: nextQuestion,
      answer: "",
      source: "groq",
      generatedBy: "groq-llama",
      createdAt: new Date(),
    });
    doc.currentQuestionIndex = idx + 1;

    console.log(`[Interview] Question ${nextQuestionNumber} generated:`, JSON.stringify(nextQuestion).slice(0, 80));
  } else {
    // Last question — auto-generate report and complete interview
    const completed = await generateReport(doc);
    report = completed.report;
  }

  await doc.save();

  console.log(`[Interview] Answer saved for Q${idx + 1}. Next: Q${nextQuestionNumber || "none"}`);

  return { doc, nextQuestion, nextQuestionNumber, report };
};

const endInterview = async (doc) => {
  const answeredQuestions = doc.questions.filter((q) => q.answer && q.answer.trim());

  if (answeredQuestions.length > 0) {
    try {
      const evaluation = await groqService.evaluateInterview(
        answeredQuestions.map((q) => ({ question: q.question, answer: q.answer }))
      );
      doc.report = evaluation;
      answeredQuestions.forEach((q, i) => {
        if (doc.questions[i]) doc.questions[i].score = evaluation.overallScore;
      });
    } catch (err) {
      console.error("[Interview] Evaluation failed:", err.message);
      doc.report = {
        overallScore: 0,
        communication: 0,
        confidence: 0,
        technical: 0,
        problemSolving: 0,
        feedback: ["Evaluation could not be completed due to an error."],
        verdict: "Average Candidate",
      };
    }
  }

  doc.status = "completed";
  doc.endedAt = new Date();
  doc.duration = Math.max(0, Math.round((doc.endedAt - doc.startedAt) / 1000));
  await doc.save();
  return doc;
};

module.exports = {
  QUESTIONS_PER_INTERVIEW,
  appendTranscriptLine,
  startInterview,
  submitAnswer,
  endInterview,
  generateReport,
};
