/**
 * resumeScoringService.js
 * Deterministic scoring engine — same input always produces same scores.
 * No AI involved. All scores are computed from extracted data and raw text.
 * Each section returns { score, reason } explaining the result.
 */

// ─────────────────────────────────────────────────────────────────────────────
// ATS keyword bank
// ─────────────────────────────────────────────────────────────────────────────
const ATS_KEYWORD_BANK = [
  "javascript","typescript","python","java","c++","c#","go","rust","swift","kotlin","php","ruby",
  "react","vue","angular","next.js","html","css","tailwind","redux","webpack","vite",
  "node.js","express","fastapi","django","spring boot","rest api","graphql","grpc",
  "mongodb","postgresql","mysql","redis","firebase","dynamodb","cassandra","elasticsearch",
  "aws","azure","gcp","docker","kubernetes","ci/cd","jenkins","github actions","terraform","linux",
  "git","github","postman","jira","figma","vs code",
  "system design","data structures","algorithms","agile","scrum","machine learning","deep learning",
];

const KEYWORD_CATEGORIES = {
  "Languages":    ["javascript","typescript","python","java","c++","c#","go","rust","swift","kotlin","php","ruby"],
  "Frontend":     ["react","vue","angular","next.js","html","css","tailwind","redux","webpack","vite"],
  "Backend":      ["node.js","express","fastapi","django","spring boot","rest api","graphql","grpc"],
  "Databases":    ["mongodb","postgresql","mysql","redis","firebase","dynamodb","cassandra","elasticsearch"],
  "Cloud/DevOps": ["aws","azure","gcp","docker","kubernetes","ci/cd","jenkins","github actions","terraform","linux"],
  "Tools":        ["git","github","postman","jira","figma","vs code"],
  "Core CS":      ["system design","data structures","algorithms","agile","scrum","machine learning","deep learning"],
};

const WEIGHTS = {
  formatting: 0.15,
  keywords:   0.20,
  skills:     0.15,
  projects:   0.20,
  experience: 0.20,
  education:  0.10,
};

const SECTION_MAX = {
  formatting: 95,
  keywords:   94,
  skills:     95,
  projects:   93,
  experience: 92,
  education:  95,
};

const ATS_MAX = 96;

const cap = (score, max) => Math.min(score, max);

// ─────────────────────────────────────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────────────────────────────────────
function scoreFormatting(extractedData) {
  const checks = [
    { key: "email",   label: "email address" },
    { key: "phone",   label: "phone number" },
    { key: "linkedin", label: "LinkedIn URL" },
    { key: "github",   label: "GitHub URL" },
  ];

  const hasContent =
    (Array.isArray(extractedData.skills) && extractedData.skills.length > 0) ||
    (Array.isArray(extractedData.projects) && extractedData.projects.length > 0) ||
    (Array.isArray(extractedData.experience) && extractedData.experience.length > 0);

  const present = checks.filter((c) => extractedData[c.key]);
  const missing = checks.filter((c) => !extractedData[c.key]);

  const contactScore = Math.round((present.length / 4) * 75);
  const contentScore = hasContent ? 20 : 0;
  const score = cap(contactScore + contentScore, SECTION_MAX.formatting);

  const parts = [];
  if (present.length > 0) {
    parts.push(`Contact section includes ${present.map((c) => c.label).join(", ")}.`);
  }
  if (missing.length > 0) {
    parts.push(`Missing ${missing.map((c) => c.label).join(", ")}.`);
  }
  if (!hasContent) {
    parts.push("No skills, projects, or experience found.");
  }

  return { score, reason: parts.join(" ") || "Formatting analysis complete." };
}

// ─────────────────────────────────────────────────────────────────────────────
// Keywords
// ─────────────────────────────────────────────────────────────────────────────
function scoreKeywords(extractedData, rawText) {
  if (!rawText) return { score: 0, reason: "No extractable text to analyze for keywords." };

  const lower = rawText.toLowerCase();
  const matches = ATS_KEYWORD_BANK.filter((kw) => lower.includes(kw));
  const score = cap(Math.min(100, Math.round((matches.length / 30) * 100)), SECTION_MAX.keywords);

  const categoryHits = Object.entries(KEYWORD_CATEGORIES).map(([cat, kws]) => {
    const hit = kws.filter((kw) => matches.includes(kw));
    return { category: cat, count: hit.length, total: kws.length, keywords: hit };
  });

  const strongCats = categoryHits.filter((c) => c.count >= Math.ceil(c.total * 0.4)).map((c) => c.category);
  const weakCats = categoryHits.filter((c) => c.count === 0).map((c) => c.category);

  const parts = [];
  parts.push(`Matched ${matches.length} ATS keywords across your resume.`);
  if (strongCats.length > 0) {
    parts.push(`Strong coverage in ${strongCats.join(", ")}.`);
  }
  if (weakCats.length > 0) {
    parts.push(`No keywords detected in ${weakCats.join(", ")} — consider adding relevant terms.`);
  }

  return { score, reason: parts.join(" ") };
}

// ─────────────────────────────────────────────────────────────────────────────
// Skills
// ─────────────────────────────────────────────────────────────────────────────
function scoreSkills(extractedData) {
  const skills = Array.isArray(extractedData.skills) ? extractedData.skills : [];
  const score = cap(Math.min(100, Math.round((skills.length / 20) * 100)), SECTION_MAX.skills);

  if (skills.length === 0) {
    return { score: 0, reason: "No skills detected. Add a dedicated skills section." };
  }

  const categorized = Object.entries(KEYWORD_CATEGORIES).map(([cat, kws]) => {
    const hit = skills.filter((s) => kws.includes(s.toLowerCase()));
    return { category: cat, skills: hit };
  });

  const coveredCats = categorized.filter((c) => c.skills.length > 0).map((c) => c.category);
  const missingCats = categorized.filter((c) => c.skills.length === 0).map((c) => c.category);

  const parts = [];
  parts.push(`${skills.length} technical skills listed.`);
  if (coveredCats.length > 0) {
    parts.push(`Coverage across ${coveredCats.join(", ")}.`);
  }
  if (missingCats.length > 0) {
    parts.push(`No skills in ${missingCats.join(", ")}.`);
  }
  if (skills.length < 8) {
    parts.push("Consider expanding your skill set to 10–15 relevant technologies.");
  }

  return { score, reason: parts.join(" ") };
}

// ─────────────────────────────────────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────────────────────────────────────
function scoreProjects(extractedData) {
  const projects = Array.isArray(extractedData.projects) ? extractedData.projects : [];
  if (projects.length === 0) {
    return { score: 0, reason: "No projects found. Add 2–4 projects with tech stack and impact." };
  }

  const countScore = Math.min(30, projects.length * 7);
  const hasDesc = projects.filter((p) => p.description && p.description.length > 5).length;
  const descScore = Math.min(25, Math.round((hasDesc / projects.length) * 25));
  const hasTech = projects.filter((p) => Array.isArray(p.tech) && p.tech.length > 0).length;
  const techScore = Math.min(25, Math.round((hasTech / projects.length) * 25));
  const hasLink = projects.filter((p) => p.link).length;
  const linkScore = Math.min(15, Math.round((hasLink / projects.length) * 15));

  const raw = countScore + descScore + techScore + linkScore;
  const score = cap(raw, SECTION_MAX.projects);

  const parts = [];
  parts.push(`${projects.length} project${projects.length > 1 ? "s" : ""} listed.`);
  if (hasDesc === projects.length) {
    parts.push("All projects include descriptions.");
  } else if (hasDesc > 0) {
    parts.push(`${hasDesc} of ${projects.length} projects have descriptions — add details to the rest.`);
  } else {
    parts.push("Projects lack descriptions — add context and your role.");
  }
  if (hasTech > 0) {
    parts.push("Tech stacks are documented.");
  } else {
    parts.push("No tech stacks mentioned — list technologies used.");
  }
  if (hasLink > 0) {
    parts.push("Project links provided.");
  } else {
    parts.push("Consider adding GitHub or live demo links.");
  }

  return { score, reason: parts.join(" ") };
}

// ─────────────────────────────────────────────────────────────────────────────
// Experience
// ─────────────────────────────────────────────────────────────────────────────
function scoreExperience(extractedData) {
  const experience = Array.isArray(extractedData.experience) ? extractedData.experience : [];
  if (experience.length === 0) {
    return { score: 0, reason: "No work or internship experience found. Add internships, freelance, or open-source contributions." };
  }

  const countScore = Math.min(30, experience.length * 10);
  const hasDesc = experience.filter((e) => Array.isArray(e.description) && e.description.length > 0).length;
  const descScore = Math.min(30, Math.round((hasDesc / experience.length) * 30));
  const hasCompany = experience.filter((e) => e.company && e.company.length > 0).length;
  const companyScore = Math.min(20, Math.round((hasCompany / experience.length) * 20));

  const raw = countScore + descScore + companyScore;
  const score = cap(raw, SECTION_MAX.experience);

  const parts = [];
  parts.push(`${experience.length} experience entr${experience.length > 1 ? "ies" : "y"} found.`);
  if (hasDesc === experience.length) {
    parts.push("All entries include detailed descriptions.");
  } else if (hasDesc > 0) {
    parts.push(`${hasDesc} of ${experience.length} entr${experience.length > 1 ? "ies" : "y"} have descriptions — strengthen the rest with measurable achievements.`);
  } else {
    parts.push("Entries lack descriptions — add bullet points with impact metrics.");
  }
  if (hasCompany === experience.length) {
    parts.push("Company names are clearly listed.");
  } else if (hasCompany > 0) {
    parts.push("Some entries are missing company names.");
  }

  return { score, reason: parts.join(" ") };
}

// ─────────────────────────────────────────────────────────────────────────────
// Education
// ─────────────────────────────────────────────────────────────────────────────
function scoreEducation(extractedData) {
  const education = Array.isArray(extractedData.education) ? extractedData.education : [];
  if (education.length === 0) {
    return { score: 0, reason: "No education section detected. Add your academic background." };
  }

  const entry = education[0];
  let raw = 30;
  const parts = [];

  if (entry.degree && entry.degree.length > 0) {
    raw += 20;
  } else {
    parts.push("Degree information missing.");
  }
  if (entry.cgpa && entry.cgpa.length > 0) {
    raw += 25;
  } else {
    parts.push("CGPA not mentioned.");
  }
  if (entry.year && entry.year.length > 0) {
    raw += 25;
  } else {
    parts.push("Graduation year not specified.");
  }

  const score = cap(Math.min(100, raw), SECTION_MAX.education);
  parts.unshift(`Education from ${entry.institution || "an institution"}.`);

  return { score, reason: parts.join(" ") };
}

// ─────────────────────────────────────────────────────────────────────────────
// Top-level calculator
// ─────────────────────────────────────────────────────────────────────────────
function calculateAllScores(extractedData, rawText) {
  const formatting = scoreFormatting(extractedData);
  const keywords   = scoreKeywords(extractedData, rawText);
  const skills     = scoreSkills(extractedData);
  const projects   = scoreProjects(extractedData);
  const experience = scoreExperience(extractedData);
  const education  = scoreEducation(extractedData);

  const sectionScores = { formatting, keywords, skills, projects, experience, education };

  const numeric = {
    formatting: formatting.score,
    keywords:   keywords.score,
    skills:     skills.score,
    projects:   projects.score,
    experience: experience.score,
    education:  education.score,
  };

  const atsScore = cap(
    Math.round(
      numeric.formatting * WEIGHTS.formatting +
      numeric.keywords   * WEIGHTS.keywords +
      numeric.skills     * WEIGHTS.skills +
      numeric.projects   * WEIGHTS.projects +
      numeric.experience * WEIGHTS.experience +
      numeric.education  * WEIGHTS.education
    ),
    ATS_MAX
  );

  const resumeRank = Math.max(1, 101 - atsScore);

  let topPercentile;
  if (atsScore >= 90) topPercentile = "Top 5%";
  else if (atsScore >= 80) topPercentile = "Top 10%";
  else if (atsScore >= 70) topPercentile = "Top 20%";
  else if (atsScore >= 60) topPercentile = "Top 35%";
  else if (atsScore >= 50) topPercentile = "Top 50%";
  else topPercentile = "Bottom 50%";

  return {
    sectionScores,
    atsScore,
    resumeRank,
    topPercentile,
  };
}

module.exports = { calculateAllScores };
