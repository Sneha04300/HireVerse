const User = require("../models/user");
const Profile = require("../models/Profile");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const ATSReport = require("../models/ATSReport");
const DSAProgress = require("../models/DSAProgress");
const MockInterview = require("../models/MockInterview");
const Roadmap = require("../models/Roadmap");
const WeeklyPlan = require("../models/WeeklyPlan");
const Internship = require("../models/Internship");
const GithubReport = require("../models/GithubReport");
const LeetcodeReport = require("../models/LeetcodeReport");
const CareerCopilot = require("../models/CareerCopilot");
const { buildCareerCopilotPrompt } = require("../prompts/careerCopilotPrompt");
const { generateResponse } = require("./groqService");

const NA = "Not Available";

function formatList(arr) {
  if (!arr || arr.length === 0) return NA;
  return arr.join(", ");
}

function safe(fn) {
  try {
    return fn();
  } catch {
    return NA;
  }
}

async function generateCareerResponse(userId, userMessage) {
  console.log("[Career Copilot] Service Hit");
  const [
    user,
    profile,
    latestResume,
    latestATS,
    dsa,
    recentInterviews,
    latestRoadmap,
    latestWeeklyPlan,
    internships,
    github,
    leetcode,
    copilot,
  ] = await Promise.all([
    User.findById(userId).select("-password").lean().catch(() => null),
    Profile.findOne({ userId }).lean().catch(() => null),
    ResumeAnalysis.findOne({ userId }).sort({ createdAt: -1 }).lean().catch(() => null),
    ATSReport.findOne({ userId }).sort({ createdAt: -1 }).lean().catch(() => null),
    DSAProgress.findOne({ userId }).lean().catch(() => null),
    MockInterview.find({ userId }).sort({ createdAt: -1 }).limit(5).lean().catch(() => null),
    Roadmap.findOne({ userId }).sort({ createdAt: -1 }).lean().catch(() => null),
    WeeklyPlan.findOne({ userId }).sort({ createdAt: -1 }).lean().catch(() => null),
    Internship.find({ userId }).sort({ createdAt: -1 }).lean().catch(() => null),
    GithubReport.findOne({ userId }).sort({ createdAt: -1 }).lean().catch(() => null),
    LeetcodeReport.findOne({ userId }).sort({ createdAt: -1 }).lean().catch(() => null),
    CareerCopilot.findOne({ userId }).lean().catch(() => null),
  ]);

  const context = {
    name: user?.name || NA,

    college: profile?.college || NA,
    graduationYear: profile?.graduationYear != null ? String(profile.graduationYear) : NA,
    branch: profile?.branch || NA,

    skills: profile?.skills?.length ? formatList(profile.skills) : NA,

    resumeScore: latestResume?.atsScore != null ? `${latestResume.atsScore}/100` : NA,

    atsScore: latestATS?.score != null ? `${latestATS.score}/100` : NA,

    dsaProgress: safe(() => {
      if (!dsa) return NA;
      const parts = [];
      parts.push(`Total Solved: ${dsa.totalProblemsSolved}`);
      parts.push(`Current Streak: ${dsa.currentStreak} days`);
      parts.push(`Daily Average: ${dsa.dailyAverage}`);
      if (dsa.strongTopics?.length) parts.push(`Strong Topics: ${dsa.strongTopics.join(", ")}`);
      if (dsa.weakTopics?.length) parts.push(`Weak Topics: ${dsa.weakTopics.join(", ")}`);
      return parts.join(" | ");
    }),

    mockInterviewScores: safe(() => {
      if (!recentInterviews || recentInterviews.length === 0) return NA;
      return recentInterviews
        .map((i) => {
          const score = i.report?.overallScore != null ? `${i.report.overallScore}/100` : "No score";
          return `${i.type} (${i.difficulty}): ${score}`;
        })
        .join(" | ");
    }),

    previousCareerRoadmap: safe(() => {
      if (!latestRoadmap) return NA;
      const role = latestRoadmap.targetRole || "Not specified";
      const phases = (latestRoadmap.roadmap || [])
        .map((p) => `Month ${p.month}: ${p.phase} - ${formatList(p.topics)}`)
        .join(" | ");
      return `Target Role: ${role} | ${phases || NA}`;
    }),

    weeklyGoals: safe(() => {
      if (!latestWeeklyPlan) return NA;
      const tasks = (latestWeeklyPlan.tasks || [])
        .map((t) => `${t.day}: ${t.task} [${t.completed ? "Done" : "Pending"}]`)
        .join(" | ");
      return `Progress: ${latestWeeklyPlan.progress || 0}% | ${tasks || NA}`;
    }),

    internshipProgress: safe(() => {
      if (!internships || internships.length === 0) return NA;
      return internships
        .map((i) => `${i.company} - ${i.role} (${i.status})`)
        .join(" | ");
    }),

    placementReadiness: safe(() => {
      if (!copilot?.readiness) return NA;
      const r = copilot.readiness;
      return `Score: ${r.overallScore || 0}/100 | Target: ${r.companyTarget || NA} | Est. ${r.estimatedMonths || 0} months`;
    }),

    githubStats: safe(() => {
      if (!github) return NA;
      return `Repos: ${github.repositories || 0} | Commits: ${github.commits || 0} | Stars: ${github.stars || 0} | Score: ${github.githubScore || 0}`;
    }),

    leetcodeStats: safe(() => {
      if (!leetcode) return NA;
      return `Solved: ${leetcode.solved || 0} (E:${leetcode.easy || 0} M:${leetcode.medium || 0} H:${leetcode.hard || 0}) | Rating: ${leetcode.contestRating || 0}`;
    }),
  };

  const { system, user: promptUser } = buildCareerCopilotPrompt(context, userMessage);

  console.log("[Career Copilot] Sending prompt to Groq");
  const reply = await generateResponse(system, promptUser, { maxTokens: 1000, temperature: 0.7 });

  return {
    reply,
    timestamp: new Date().toISOString(),
  };
}

module.exports = { generateCareerResponse };
