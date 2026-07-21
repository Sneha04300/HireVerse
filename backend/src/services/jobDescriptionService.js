const { buildJDAnalysisPrompt } = require("../prompts/jobDescriptionAnalysisPrompt");
const { generateResponse } = require("./groqService");
const { extractText } = require("./resumeService");

function safeParseJSON(text) {
  let cleaned = text.trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleaned = jsonMatch[0];
  return JSON.parse(cleaned);
}

function clamp(v) {
  return Math.min(98, Math.max(0, v ?? 0));
}

function calculateDeterministicScore(parsed, resumeText, jobDescription) {
  const matchedKeywords = Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords : [];
  const missingKeywords = Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [];
  const matchedSkills = Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [];
  const missingSkills = Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [];

  const totalKeywords = matchedKeywords.length + missingKeywords.length;
  const totalSkills = matchedSkills.length + missingSkills.length;

  const keywordRatio = totalKeywords > 0 ? matchedKeywords.length / totalKeywords : 0.5;
  const skillRatio = totalSkills > 0 ? matchedSkills.length / totalSkills : 0.5;

  const lowerText = resumeText.toLowerCase();
  const lowerJD = jobDescription.toLowerCase();

  const expWords = ["experience", "intern", "work", "developed", "built", "led", "managed", "created", "designed", "implemented"];
  const jdExpWords = expWords.filter((w) => lowerJD.includes(w));
  const resumeExpWords = jdExpWords.filter((w) => lowerText.includes(w));
  const expRatio = jdExpWords.length > 0 ? resumeExpWords.length / jdExpWords.length : 0.5;

  const eduWords = ["bachelor", "master", "phd", "b.tech", "m.tech", "b.e.", "m.e.", "b.s.", "m.s.", "bca", "mca"];
  const jdEduWords = eduWords.filter((w) => lowerJD.includes(w));
  const resumeEduWords = jdEduWords.filter((w) => lowerText.includes(w));
  const eduRatio = jdEduWords.length > 0 ? resumeEduWords.length / jdEduWords.length : 0.5;

  const projWords = ["project", "built", "developed", "created", "designed", "implemented"];
  const jdProjWords = projWords.filter((w) => lowerJD.includes(w));
  const resumeProjWords = jdProjWords.filter((w) => lowerText.includes(w));
  const projRatio = jdProjWords.length > 0 ? resumeProjWords.length / jdProjWords.length : 0.5;

  const finalScore = Math.round(
    keywordRatio * 30 +
    skillRatio * 25 +
    expRatio * 20 +
    eduRatio * 10 +
    projRatio * 15
  );

  const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];

  suggestions.forEach((s) => {
    const lower = s.toLowerCase();
    if (lower.includes("docker") && !lowerText.includes("docker")) {
      if (!missingKeywords.some((k) => k.toLowerCase() === "docker")) {
        if (!missingKeywords.includes("Docker")) missingKeywords.push("Docker");
      }
    }
    if (lower.includes("kubernetes") && !lowerText.includes("kubernetes")) {
      if (!missingKeywords.some((k) => k.toLowerCase() === "kubernetes")) {
        if (!missingKeywords.includes("Kubernetes")) missingKeywords.push("Kubernetes");
      }
    }
    if (lower.includes("aws") && !lowerText.includes("aws")) {
      if (!missingKeywords.some((k) => k.toLowerCase() === "aws")) {
        if (!missingKeywords.includes("AWS")) missingKeywords.push("AWS");
      }
    }
    if (lower.includes("ci/cd") && !lowerText.includes("ci/cd")) {
      if (!missingKeywords.some((k) => k.toLowerCase() === "ci/cd")) {
        if (!missingKeywords.includes("CI/CD")) missingKeywords.push("CI/CD");
      }
    }
  });

  return clamp(finalScore);
}

async function analyzeJobMatch(filePath, jobDescription) {
  if (!jobDescription || jobDescription.trim().length < 10) {
    throw new Error("Job description is required and must be at least 10 characters.");
  }

  const rawText = await extractText(filePath);
  if (!rawText || rawText.trim().length < 20) {
    throw new Error("Could not extract text from the resume file.");
  }

  const { system, user } = buildJDAnalysisPrompt(rawText, jobDescription);
  const llmResponse = await generateResponse(system, user, {
    maxTokens: 2000,
    temperature: 0.3,
  });

  const parsed = safeParseJSON(llmResponse);

  const matchScore = calculateDeterministicScore(parsed, rawText, jobDescription);

  const ensureArray = (v) => (Array.isArray(v) ? v : []);
  const dedupe = (arr) => [...new Set(arr)];

  return {
    matchScore,
    matchedKeywords: dedupe(ensureArray(parsed.matchedKeywords).slice(0, 20)),
    missingKeywords: dedupe(ensureArray(parsed.missingKeywords).slice(0, 20)),
    matchedSkills: dedupe(ensureArray(parsed.matchedSkills).slice(0, 15)),
    missingSkills: dedupe(ensureArray(parsed.missingSkills).slice(0, 15)),
    strengths: ensureArray(parsed.strengths).slice(0, 8),
    weaknesses: ensureArray(parsed.weaknesses).slice(0, 8),
    suggestions: ensureArray(parsed.suggestions).slice(0, 10),
  };
}

module.exports = { analyzeJobMatch };
