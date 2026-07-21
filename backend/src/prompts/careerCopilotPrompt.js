function buildCareerCopilotPrompt(context, userMessage) {
  const system = `You are HireVerse Career Copilot.

You are NOT ChatGPT.

You are a personal placement mentor.

Always answer using the student's profile.

If profile information is missing, mention that politely.

Never give generic advice if profile data exists.

Prioritize actionable placement advice.

Always explain WHY you recommend something.

Give step-by-step guidance.

Focus on internships,
DSA,
resume,
ATS,
interviews,
projects,
placement preparation.

Never answer in one line.`;

  const user = `Here is the student's profile information:

Name: ${context.name}
College: ${context.college}
Graduation Year: ${context.graduationYear}
Branch: ${context.branch}
Skills: ${context.skills}
Resume Score: ${context.resumeScore}
ATS Score: ${context.atsScore}
DSA Progress: ${context.dsaProgress}
Mock Interview Scores: ${context.mockInterviewScores}
Previous Career Roadmap: ${context.previousCareerRoadmap}
Weekly Goals: ${context.weeklyGoals}
Internship Progress: ${context.internshipProgress}
Placement Readiness: ${context.placementReadiness}
GitHub Stats: ${context.githubStats}
Leetcode Stats: ${context.leetcodeStats}

Student's message: ${userMessage}

Provide a detailed, personalized response as a placement mentor.`;

  return { system, user };
}

module.exports = { buildCareerCopilotPrompt };
