function buildResumeAnalysisPrompt(resumeText) {
  const system = `You are a senior resume analyst and ATS optimization expert.

Your job is to extract structured information from resumes and provide qualitative feedback.

Rules:
- Extract ALL skills, projects, experience entries, and education details you can find.
- Be thorough — list every technology, tool, and framework mentioned.
- Base strengths and weaknesses on ACTUAL content, not generic statements.
- Suggest specific, actionable improvements.
- Identify commonly expected ATS keywords that are missing from the resume.
- Never fabricate information. If something is not present, return an empty array or empty string.`;

  const user = `Return ONLY valid JSON. No markdown, no code fences, no explanations.

Extract information from this resume and return EXACTLY this JSON structure:

{
  "strengths": ["Clear, specific strength based on resume content"],
  "weaknesses": ["Specific area for improvement based on resume content"],
  "missingKeywords": ["Keyword that is expected but not found"],
  "suggestions": ["Actionable improvement suggestion"],
  "extractedData": {
    "skills": ["skill1", "skill2"],
    "projects": [
      {
        "title": "project name",
        "description": "brief description",
        "tech": ["tech1", "tech2"],
        "link": "project URL or empty string"
      }
    ],
    "experience": [
      {
        "company": "company name",
        "role": "job title",
        "duration": "time period",
        "description": ["achievement 1", "achievement 2"]
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
    "certifications": ["cert1", "cert2"],
    "github": "GitHub URL or empty string",
    "linkedin": "LinkedIn URL or empty string",
    "email": "email or empty string",
    "phone": "phone or empty string"
  }
}

Resume text:
${resumeText}

ONLY valid JSON. No other text.`;

  return { system, user };
}

module.exports = { buildResumeAnalysisPrompt };
