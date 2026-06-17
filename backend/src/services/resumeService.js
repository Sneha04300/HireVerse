/**
 * resumeService.js
 * Core business logic for resume parsing, ATS scoring, and analysis.
 */

const fs      = require("fs");
const path    = require("path");
const pdfParse = require("pdf-parse");

// ─────────────────────────────────────────────────────────────────────────────
// Keyword bank used for ATS matching
// ─────────────────────────────────────────────────────────────────────────────
const ATS_KEYWORD_BANK = [
  // Languages
  "javascript","typescript","python","java","c++","c#","go","rust","swift","kotlin","php","ruby",
  // Frontend
  "react","vue","angular","next.js","html","css","tailwind","redux","webpack","vite",
  // Backend
  "node.js","express","fastapi","django","spring boot","rest api","graphql","grpc",
  // Databases
  "mongodb","postgresql","mysql","redis","firebase","dynamodb","cassandra","elasticsearch",
  // Cloud & DevOps
  "aws","azure","gcp","docker","kubernetes","ci/cd","jenkins","github actions","terraform","linux",
  // Tools
  "git","github","postman","jira","figma","vs code",
  // Soft / role keywords
  "system design","data structures","algorithms","agile","scrum","machine learning","deep learning",
];

const SDE_MUST_HAVE = ["docker","aws","system design","rest api","typescript","kubernetes","ci/cd"];

// ─────────────────────────────────────────────────────────────────────────────
// 1. PDF text extraction
// ─────────────────────────────────────────────────────────────────────────────
const extractTextFromPDF = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const data   = await pdfParse(buffer);
  return data.text || "";
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Field extractors (regex-based)
// ─────────────────────────────────────────────────────────────────────────────
const extractEmail = (text) => {
  const match = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : "";
};

const extractPhone = (text) => {
  const match = text.match(/(\+?\d[\d\s\-().]{8,14}\d)/);
  return match ? match[1].trim() : "";
};

const extractLinkedIn = (text) => {
  const match = text.match(/linkedin\.com\/in\/[a-zA-Z0-9\-_%]+/i);
  return match ? `https://${match[0]}` : "";
};

const extractGitHub = (text) => {
  const match = text.match(/github\.com\/[a-zA-Z0-9\-]+/i);
  return match ? `https://${match[0]}` : "";
};

const extractName = (text) => {
  // Heuristic: first non-empty line that is NOT an email/url/phone
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 6)) {
    if (
      !line.includes("@") &&
      !line.match(/https?:\/\//) &&
      !line.match(/^\+?\d/) &&
      line.split(" ").length <= 5 &&
      line.length >= 3
    ) {
      return line;
    }
  }
  return "";
};

const extractSkills = (text) => {
  const lower    = text.toLowerCase();
  const detected = ATS_KEYWORD_BANK.filter((kw) => lower.includes(kw));
  return [...new Set(detected)];
};

// Section splitter: finds content between headings
const getSectionText = (text, headings, nextHeadings = []) => {
  const lower  = text.toLowerCase();
  let start    = -1;

  for (const h of headings) {
    const idx = lower.indexOf(h.toLowerCase());
    if (idx !== -1) { start = idx; break; }
  }
  if (start === -1) return "";

  let end = text.length;
  for (const h of nextHeadings) {
    const idx = lower.indexOf(h.toLowerCase(), start + 1);
    if (idx !== -1 && idx < end) end = idx;
  }
  return text.slice(start, end).trim();
};

const extractEducation = (text) => {
  const section = getSectionText(
    text,
    ["education", "academic background", "qualifications"],
    ["experience", "skills", "projects", "internship", "work"]
  );
  if (!section) return [];

  const lines = section.split("\n").filter((l) => l.trim().length > 5);
  const edu   = [];

  for (let i = 1; i < lines.length - 1; i++) {
    const line = lines[i].trim();
    const yearMatch = line.match(/\b(19|20)\d{2}\b/);
    const cgpaMatch = line.match(/\b[0-9]\.[0-9]{1,2}\b/);
    if (yearMatch || cgpaMatch) {
      edu.push({
        institution: lines[i - 1]?.trim() || "",
        degree:      line,
        year:        yearMatch?.[0] || "",
        cgpa:        cgpaMatch?.[0] || "",
      });
    }
  }
  return edu.slice(0, 4);
};

const extractExperience = (text) => {
  const section = getSectionText(
    text,
    ["experience", "work experience", "internship", "employment"],
    ["projects", "skills", "education", "certifications"]
  );
  if (!section) return [];

  const lines  = section.split("\n").filter((l) => l.trim());
  const blocks = [];
  let current  = null;

  for (const line of lines.slice(1)) {
    const trimmed   = line.trim();
    const dateMatch = trimmed.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|20\d\d|present)/i);
    if (dateMatch && trimmed.length < 80) {
      if (current) blocks.push(current);
      current = { company: "", role: trimmed, duration: trimmed, description: [] };
    } else if (current && trimmed.startsWith("•") || trimmed.startsWith("-")) {
      current.description.push(trimmed.replace(/^[•\-]\s*/, ""));
    } else if (current && trimmed.length > 3) {
      if (!current.company) current.company = trimmed;
    }
  }
  if (current) blocks.push(current);
  return blocks.slice(0, 5);
};

const extractProjects = (text) => {
  const section = getSectionText(
    text,
    ["projects", "personal projects", "academic projects"],
    ["experience", "skills", "education", "certifications", "achievements"]
  );
  if (!section) return [];

  const lines    = section.split("\n").filter((l) => l.trim());
  const projects = [];
  let current    = null;

  for (const line of lines.slice(1)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const techMatch = trimmed.match(/tech(?:nologies)?[:\s]+(.+)/i);
    if (techMatch) {
      if (current) current.tech = techMatch[1].split(/[,|]/).map((t) => t.trim());
    } else if (trimmed.match(/https?:\/\//)) {
      if (current) current.link = trimmed;
    } else if (trimmed.length > 5 && trimmed.length < 80 && !trimmed.startsWith("•") && !trimmed.startsWith("-")) {
      if (current) projects.push(current);
      current = { title: trimmed, description: "", tech: [], link: "" };
    } else if (current && (trimmed.startsWith("•") || trimmed.startsWith("-"))) {
      current.description += (current.description ? " " : "") + trimmed.replace(/^[•\-]\s*/, "");
    }
  }
  if (current) projects.push(current);
  return projects.slice(0, 6);
};

const extractCertifications = (text) => {
  const section = getSectionText(
    text,
    ["certifications", "certificates", "courses"],
    ["skills", "education", "experience", "projects"]
  );
  if (!section) return [];
  return section
    .split("\n")
    .slice(1)
    .map((l) => l.trim())
    .filter((l) => l.length > 5)
    .slice(0, 8);
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Full extraction pipeline
// ─────────────────────────────────────────────────────────────────────────────
const extractDataFromText = (text) => ({
  name:           extractName(text),
  email:          extractEmail(text),
  phone:          extractPhone(text),
  linkedin:       extractLinkedIn(text),
  github:         extractGitHub(text),
  skills:         extractSkills(text),
  education:      extractEducation(text),
  experience:     extractExperience(text),
  projects:       extractProjects(text),
  certifications: extractCertifications(text),
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. ATS scoring engine
// ─────────────────────────────────────────────────────────────────────────────
const scoreResume = (extractedData, rawText) => {
  const lower = rawText.toLowerCase();

  /* Skills section (25 pts) */
  const skillCount    = extractedData.skills.length;
  const skillsScore   = Math.min(25, Math.round((skillCount / 15) * 25));

  /* Projects section (20 pts) */
  const projCount     = extractedData.projects.length;
  const projScore     = Math.min(20, Math.round((projCount / 4) * 20));

  /* Experience section (20 pts) */
  const expCount      = extractedData.experience.length;
  const expScore      = Math.min(20, Math.round((expCount / 3) * 20));

  /* Education section (10 pts) */
  const eduScore      = extractedData.education.length > 0 ? 10 : 4;

  /* Keywords hit (15 pts) */
  const keyHits       = ATS_KEYWORD_BANK.filter((k) => lower.includes(k)).length;
  const keywordsScore = Math.min(15, Math.round((keyHits / 20) * 15));

  /* Formatting / contact completeness (10 pts) */
  let formatScore = 0;
  if (extractedData.email)    formatScore += 2;
  if (extractedData.phone)    formatScore += 2;
  if (extractedData.linkedin) formatScore += 2;
  if (extractedData.github)   formatScore += 2;
  if (extractedData.name)     formatScore += 2;

  const atsScore = Math.min(
    100,
    skillsScore + projScore + expScore + eduScore + keywordsScore + formatScore
  );

  return {
    atsScore,
    sectionScores: {
      formatting: formatScore * 10,     // scaled to /100 for display
      keywords:   Math.round((keywordsScore / 15) * 100),
      experience: Math.round((expScore / 20) * 100),
      skills:     Math.round((skillsScore / 25) * 100),
      projects:   Math.round((projScore / 20) * 100),
      education:  eduScore * 10,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Strengths & weaknesses detector
// ─────────────────────────────────────────────────────────────────────────────
const analyzeStrengthsWeaknesses = (extractedData, rawText) => {
  const strengths  = [];
  const weaknesses = [];

  // Strengths
  if (extractedData.projects.length >= 3)     strengths.push("Strong measurable projects section");
  if (extractedData.skills.length >= 10)      strengths.push("Solid and diverse skills section");
  if (extractedData.experience.length >= 1)   strengths.push("Internship or work experience present");
  if (extractedData.github)                   strengths.push("GitHub profile linked");
  if (extractedData.linkedin)                 strengths.push("LinkedIn profile present");
  if (extractedData.certifications.length > 0) strengths.push("Certifications listed");
  if (/\d+%|\d+ (times|x|users|requests|ms)/i.test(rawText))
    strengths.push("Contains quantified impact metrics");
  if (/clean|well.?formatted|consistent/i.test(rawText) || extractedData.education.length > 0)
    strengths.push("Clean formatting and structure");

  // Weaknesses
  if (extractedData.skills.length < 6)        weaknesses.push("Too few skills listed");
  if (extractedData.experience.length === 0)  weaknesses.push("No work or internship experience found");
  if (extractedData.projects.length < 2)      weaknesses.push("Fewer than 2 projects — add more");
  if (!extractedData.github)                  weaknesses.push("No GitHub link found");
  if (!extractedData.linkedin)                weaknesses.push("No LinkedIn URL found");
  if (extractedData.certifications.length === 0) weaknesses.push("No certifications detected");
  if (!/\d+%|\d+ (times|x|users|requests|ms)/i.test(rawText))
    weaknesses.push("No impact metrics in bullet points");

  const lower = rawText.toLowerCase();
  if (!lower.includes("summary") && !lower.includes("objective"))
    weaknesses.push("Missing professional summary or objective");

  return { strengths, weaknesses };
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. Missing keywords
// ─────────────────────────────────────────────────────────────────────────────
const findMissingKeywords = (extractedData) => {
  const present = new Set(extractedData.skills.map((s) => s.toLowerCase()));
  return SDE_MUST_HAVE.filter((k) => !present.has(k));
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. AI-style improvement suggestions
// ─────────────────────────────────────────────────────────────────────────────
const generateSuggestions = (extractedData, rawText, weaknesses) => {
  const suggestions = [];

  if (weaknesses.includes("No impact metrics in bullet points"))
    suggestions.push('Quantify achievements: e.g. "Reduced API latency by 38%" instead of "Improved performance".');

  if (!extractedData.github)
    suggestions.push("Add your GitHub profile link in the header/contact section.");

  if (extractedData.skills.length < 10)
    suggestions.push("Expand your skills section — aim for 12–15 relevant technologies.");

  if (!rawText.toLowerCase().includes("summary") && !rawText.toLowerCase().includes("objective"))
    suggestions.push("Add a 2–3 line professional summary leading with your role and top strength.");

  if (extractedData.certifications.length === 0)
    suggestions.push("Add relevant certifications (AWS Cloud Practitioner, Meta React Dev, etc.) to boost ATS score.");

  const missingKeywords = findMissingKeywords(extractedData);
  if (missingKeywords.length > 0)
    suggestions.push(`Surface these keywords in your Skills or Projects section: ${missingKeywords.join(", ")}.`);

  if (extractedData.projects.length < 3)
    suggestions.push("Add at least 2–3 projects with tech stack, GitHub link and a short impact statement.");

  if (extractedData.experience.length === 0)
    suggestions.push("No experience found. Add internships, freelance work, or open-source contributions.");

  suggestions.push("Tailor your resume keywords to match the specific JD you are targeting.");

  return suggestions.slice(0, 8);
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. Master analysis function
// ─────────────────────────────────────────────────────────────────────────────
const analyzeResume = async (filePath) => {
  const rawText      = await extractTextFromPDF(filePath);
  const extractedData = extractDataFromText(rawText);
  const { atsScore, sectionScores } = scoreResume(extractedData, rawText);
  const { strengths, weaknesses }   = analyzeStrengthsWeaknesses(extractedData, rawText);
  const missingKeywords             = findMissingKeywords(extractedData);
  const suggestions                 = generateSuggestions(extractedData, rawText, weaknesses);

  return {
    atsScore,
    sectionScores,
    strengths,
    weaknesses,
    suggestions,
    missingKeywords,
    extractedData,
  };
};

module.exports = { analyzeResume };
