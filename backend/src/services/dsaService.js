const DSAProgress = require("../models/DSAProgress");

const createProblem = async (userId, data) => {
  const problem = await DSAProgress.create({ userId, ...data });
  return problem;
};

const updateProblem = async (userId, problemId, data) => {
  const problem = await DSAProgress.findOneAndUpdate(
    { _id: problemId, userId },
    { $set: data },
    { new: true, runValidators: true }
  );
  return problem;
};

const deleteProblem = async (userId, problemId) => {
  const problem = await DSAProgress.findOneAndDelete({ _id: problemId, userId });
  return problem;
};

const getProblem = async (userId, problemId) => {
  const problem = await DSAProgress.findOne({ _id: problemId, userId });
  return problem;
};

const getAllProblems = async (userId, filters = {}) => {
  const query = { userId, ...filters };
  const problems = await DSAProgress.find(query).sort({ solvedAt: -1 });
  return problems;
};

const toggleBookmark = async (userId, problemId) => {
  const problem = await DSAProgress.findOne({ _id: problemId, userId });
  if (!problem) return null;

  problem.bookmarked = !problem.bookmarked;
  await problem.save();
  return problem;
};

const incrementRevision = async (userId, problemId) => {
  const problem = await DSAProgress.findOneAndUpdate(
    { _id: problemId, userId },
    { $inc: { revisionCount: 1 } },
    { new: true }
  );
  return problem;
};

module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblem,
  getAllProblems,
  toggleBookmark,
  incrementRevision,
};
