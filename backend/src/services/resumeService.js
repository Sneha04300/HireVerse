/**
 * resumeService.js
 * Orchestrator — tries AI (Groq) parsing first, falls back to regex parser.
 * Never runs both parsers simultaneously.
 */

const fs       = require("fs");
const path     = require("path");
const pdfParse = require("pdf-parse");
const { buildResumeAnalysisPrompt } = require("../prompts/resumeAnalysisPrompt");
const { generateResponse } = require("./groqService");
const { calculateAllScores } = require("./resumeScoringService");
const { parseWithFallback } = require("./resumeFallbackParser");

// ─────────────────────────────────────────────────────────────────────────────
// 1. PDF text extraction
// ─────────────────────────────────────────────────────────────────────────────
const extractTextFromPDF = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const data   = await pdfParse(buffer);
  return data.text || "";
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. DOCX text extraction (reads raw XML text from the ZIP container)
// ─────────────────────────────────────────────────────────────────────────────
const extractTextFromDOCX = (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const content = buffer.toString("utf-8");
  const matches = content.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
  if (matches) {
    return matches.map((m) => m.replace(/<[^>]+>/g, "")).join(" ");
  }
  return "";
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Universal text extractor (handles PDF and DOCX)
// ─────────────────────────────────────────────────────────────────────────────
const extractText = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".pdf") {
    return await extractTextFromPDF(filePath);
  }
  if (ext === ".docx") {
    return extractTextFromDOCX(filePath);
  }
  throw new Error(`Unsupported file format: ${ext}. Only PDF and DOCX are supported.`);
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Helpers
// ─────────────────────────────────────────────────────────────────────────────
function safeParseJSON(text) {
  let cleaned = text.trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  return JSON.parse(cleaned);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. AI-POWERED resume analysis (primary path)
//    PDF → extractText → Groq → scoring → return
//    If Groq fails → regex fallback parser → scoring → return
// ─────────────────────────────────────────────────────────────────────────────
const analyzeResumeWithAI = async (filePath) => {
  const rawText = await extractText(filePath);

  if (!rawText || rawText.trim().length < 20) {
    return buildFallback(rawText || "");
  }

  try {
    const { system, user } = buildResumeAnalysisPrompt(rawText);
    const llmResponse = await generateResponse(system, user, { maxTokens: 2000, temperature: 0.3 });

    const parsed = safeParseJSON(llmResponse);

    const extractedData = {
      email: parsed.extractedData?.email || "",
      phone: parsed.extractedData?.phone || "",
      linkedin: parsed.extractedData?.linkedin || "",
      github: parsed.extractedData?.github || "",
      skills: Array.isArray(parsed.extractedData?.skills) ? parsed.extractedData.skills : [],
      education: Array.isArray(parsed.extractedData?.education) ? parsed.extractedData.education : [],
      experience: Array.isArray(parsed.extractedData?.experience) ? parsed.extractedData.experience : [],
      projects: Array.isArray(parsed.extractedData?.projects) ? parsed.extractedData.projects : [],
      certifications: Array.isArray(parsed.extractedData?.certifications) ? parsed.extractedData.certifications : [],
    };

    const scores = calculateAllScores(extractedData, rawText);

    const sectionScoresRaw = {
      formatting: scores.sectionScores.formatting.score,
      keywords:   scores.sectionScores.keywords.score,
      skills:     scores.sectionScores.skills.score,
      projects:   scores.sectionScores.projects.score,
      experience: scores.sectionScores.experience.score,
      education:  scores.sectionScores.education.score,
    };

    return {
      atsScore: scores.atsScore,
      sectionScores: scores.sectionScores,
      sectionScoresRaw,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 8) : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 8) : [],
      missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords.slice(0, 12) : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 10) : [],
      extractedData,
      resumeRank: scores.resumeRank,
      topPercentile: scores.topPercentile,
    };
  } catch (err) {
    console.error("[resumeService] Groq parsing failed, falling back to regex parser:", err.message);
    return buildFallback(rawText);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. Fallback: regex parser (only used when Groq fails or text is too short)
// ─────────────────────────────────────────────────────────────────────────────
function buildFallback(rawText) {
  const { extractedData, strengths, weaknesses, missingKeywords, suggestions } = parseWithFallback(rawText);
  const scores = calculateAllScores(extractedData, rawText);

  const sectionScoresRaw = {
    formatting: scores.sectionScores.formatting.score,
    keywords:   scores.sectionScores.keywords.score,
    skills:     scores.sectionScores.skills.score,
    projects:   scores.sectionScores.projects.score,
    experience: scores.sectionScores.experience.score,
    education:  scores.sectionScores.education.score,
  };

  return {
    atsScore: scores.atsScore,
    sectionScores: scores.sectionScores,
    sectionScoresRaw,
    strengths,
    weaknesses,
    missingKeywords,
    suggestions,
    extractedData,
    resumeRank: scores.resumeRank,
    topPercentile: scores.topPercentile,
  };
}

module.exports = { analyzeResumeWithAI, extractText };
