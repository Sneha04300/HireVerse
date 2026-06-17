export const DUMMY_RESUME = {
  fileName: "SnehaGupta_Resume_v4.pdf",
  fileSize: "284 KB",
  atsScore: 84,
  placementImpact: +12,
  batchRank: "Top 18%",

  breakdown: [
    { label: "Formatting",  score: 90, status: "Excellent" },
    { label: "Keywords",    score: 72, status: "Good" },
    { label: "Experience",  score: 85, status: "Excellent" },
    { label: "Skills",      score: 80, status: "Good" },
    { label: "Projects",    score: 92, status: "Excellent" },
  ],

  missingKeywords: [
    "REST API", "Docker", "AWS", "MongoDB", "Node.js",
    "System Design", "CI/CD", "Kubernetes", "TypeScript", "Redis",
  ],

  strengths: [
    "Strong, measurable projects",
    "Solid skills section",
    "Clean formatting",
    "Internship experience present",
  ],

  weaknesses: [
    "No impact metrics in bullets",
    "Weak professional summary",
    "Missing keywords for SDE roles",
  ],

  suggestions: [
    "Rewrite summary to lead with role + 2 years strongest impact.",
    'Add numbers: "reduced load time by 38%" instead of "improved performance".',
    "Surface REST API and Docker keywords in your skills section.",
    "Add a Certifications section to boost ATS match.",
    "Include your GitHub profile link in the header.",
  ],

  sections: [
    {
      id: "education",
      label: "Education",
      score: 88,
      feedback: "Good structure. CGPA is visible and formatting is clean.",
      suggestions: ["Add relevant coursework", "Include expected graduation date"],
    },
    {
      id: "skills",
      label: "Skills",
      score: 72,
      feedback: "Covers core stack but missing cloud and DevOps tools.",
      suggestions: ["Add Docker, AWS, Kubernetes", "Separate languages from frameworks"],
    },
    {
      id: "projects",
      label: "Projects",
      score: 92,
      feedback: "Projects are strong with tech stack details and GitHub links.",
      suggestions: ["Quantify impact with metrics", "Add live demo links"],
    },
    {
      id: "experience",
      label: "Experience",
      score: 80,
      feedback: "Internship experience is present but bullets lack metrics.",
      suggestions: ["Start bullets with action verbs", "Quantify every achievement"],
    },
    {
      id: "certifications",
      label: "Certifications",
      score: 40,
      feedback: "No certifications detected. This is hurting your ATS score.",
      suggestions: ["Add AWS Cloud Practitioner", "Add Google Data Analytics or Meta React cert"],
    },
  ],

  atsTrend: [62, 68, 74, 79, 84],
  industryBenchmark: 76,
  topMissingSkills: ["Docker", "AWS", "System Design", "TypeScript"],
  resumeRank: 142,
  totalResumes: 1200,
};
