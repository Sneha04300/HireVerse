function buildResumeRewritePrompt(resumeText) {
  const system = `You are a professional resume writer and ATS optimization expert.

Your job is to rewrite and improve resumes while preserving ALL factual information.

CRITICAL RULES:
- NEVER fabricate or hallucinate experience, projects, skills, education, certifications, or any personal information.
- Preserve ALL factual details exactly as provided: names, dates, companies, schools, URLs, contact info.
- Improve grammar, sentence structure, and action verbs.
- Make bullet points achievement-oriented with measurable impact where possible.
- Organize skills into logical categories (e.g., "Languages", "Frameworks", "Tools", "Cloud").
- Write a compelling professional summary (3-4 sentences) based on the actual content.
- Do NOT add new experience entries, projects, or skills not present in the original.
- If a section is empty in the original, omit it from the output.
- Return ONLY valid JSON. No markdown, no code fences, no explanations.`;

  const user = `Return ONLY valid JSON. No markdown, no code fences, no explanations.

Rewrite and improve this resume. Preserve all facts. Improve wording, structure, and ATS compatibility.

Return EXACTLY this JSON structure:

{
  "name": "Full name from resume",
  "email": "email or empty string",
  "phone": "phone or empty string",
  "linkedin": "LinkedIn URL or empty string",
  "github": "GitHub URL or empty string",
  "summary": "Professional summary (3-4 sentences based on actual experience)",
  "skills": {
    "Languages": ["skill1", "skill2"],
    "Frameworks": ["skill1", "skill2"],
    "Tools": ["skill1", "skill2"],
    "Cloud": ["skill1"]
  },
  "experience": [
    {
      "company": "company name",
      "role": "job title",
      "duration": "time period",
      "descriptions": ["Achievement-oriented bullet point with action verb", "Another bullet point"]
    }
  ],
  "projects": [
    {
      "title": "Project name",
      "technologies": ["tech1", "tech2"],
      "description": "Brief description highlighting impact"
    }
  ],
  "education": [
    {
      "institution": "university name",
      "degree": "degree name",
      "year": "graduation year or empty string",
      "cgpa": "CGPA or empty string"
    }
  ],
  "certifications": ["cert1", "cert2"]
}

Original resume text:
${resumeText}

ONLY valid JSON. No other text.`;

  return { system, user };
}

module.exports = { buildResumeRewritePrompt };
