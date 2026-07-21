/**
 * resumeFallbackParser.js
 * Regex-based resume parser used ONLY when Groq AI parsing fails.
 * No AI involved. Pure deterministic extraction.
 */

const ATS_KEYWORD_BANK = [
  "javascript","typescript","python","java","c++","c#","go","rust","swift","kotlin","php","ruby",
  "react","vue","angular","next.js","html","css","tailwind","redux","webpack","vite",
  "node.js","express","fastapi","django","spring boot","rest api","graphql","grpc",
  "mongodb","postgresql","mysql","redis","firebase","dynamodb","cassandra","elasticsearch",
  "aws","azure","gcp","docker","kubernetes","ci/cd","jenkins","github actions","terraform","linux",
  "git","github","postman","jira","figma","vs code",
  "system design","data structures","algorithms","agile","scrum","machine learning","deep learning",
];

const SDE_MUST_HAVE = ["docker","aws","system design","rest api","typescript","kubernetes","ci/cd"];

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

const extractSkills = (text) => {
  const lower    = text.toLowerCase();
  const detected = ATS_KEYWORD_BANK.filter((kw) => lower.includes(kw));
  return [...new Set(detected)];
};

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

const extractDataFromText = (text) => ({
  email: extractEmail(text),
  phone: extractPhone(text),
  linkedin: extractLinkedIn(text),
  github: extractGitHub(text),
  skills: extractSkills(text),
  education: extractEducation(text),
  experience: extractExperience(text),
  projects: extractProjects(text),
  certifications: extractCertifications(text),
});

const analyzeStrengthsWeaknesses = (extractedData, rawText) => {
  const strengths  = [];
  const weaknesses = [];

  if (extractedData.projects.length >= 3)     strengths.push("Strong measurable projects section");
  if (extractedData.skills.length >= 10)      strengths.push("Solid and diverse skills section");
  if (extractedData.experience.length >= 1)   strengths.push("Internship or work experience present");
  if (extractedData.github)                   strengths.push("GitHub profile linked");
  if (extractedData.linkedin)                 strengths.push("LinkedIn profile present");
  if (extractedData.certifications.length > 0) strengths.push("Certifications listed");
  if (/\d+%|\d+ (times|x|users|requests|ms)/i.test(rawText))
    strengths.push("Contains quantified impact metrics");

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

const findMissingKeywords = (extractedData) => {
  const present = new Set(extractedData.skills.map((s) => s.toLowerCase()));
  return SDE_MUST_HAVE.filter((k) => !present.has(k));
};

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

function parseWithFallback(rawText) {
  const extracted = extractDataFromText(rawText);
  const { strengths, weaknesses } = analyzeStrengthsWeaknesses(extracted, rawText);
  const missingKeywords = findMissingKeywords(extracted);
  const suggestions = generateSuggestions(extracted, rawText, weaknesses);

  return { extractedData: extracted, strengths, weaknesses, missingKeywords, suggestions };
}

module.exports = { parseWithFallback };
