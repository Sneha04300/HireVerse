function buildJDAnalysisPrompt(resumeText, jobDescription) {
  const system = `You are a senior ATS optimization expert and career coach.

Your job is to compare a resume against a job description and identify gaps and matches.

CRITICAL RULES:
- Extract ONLY factual matches. Do NOT invent skills or keywords.
- Be thorough — identify every relevant match and every significant gap.
- matchedKeywords: technologies, tools, and terms from the JD that appear in the resume.
- missingKeywords: important technologies, tools, or terms from the JD that are absent from the resume.
- matchedSkills: broader skill areas from the JD that the resume demonstrates.
- missingSkills: skill areas from the JD where the resume has no evidence.
- strengths: what the resume does well SPECIFICALLY for THIS job.
- weaknesses: where the resume falls short for THIS specific job.
- suggestions: actionable improvements to close the gap for THIS job.
- Return ONLY valid JSON. No markdown, no code fences, no explanations.`;

  const user = `Return ONLY valid JSON. No markdown, no code fences, no explanations.

Compare this resume against the job description and return the EXACT JSON structure below.

{
  "matchedKeywords": ["keyword found in resume that JD asks for"],
  "missingKeywords": ["keyword required by JD but missing from resume"],
  "matchedSkills": ["skill area from JD that resume demonstrates"],
  "missingSkills": ["skill area required by JD but resume lacks"],
  "strengths": ["specific resume strength relevant to this job"],
  "weaknesses": ["specific resume gap for this job"],
  "suggestions": ["actionable step to improve resume for this JD"]
}

=== RESUME ===
${resumeText}

=== JOB DESCRIPTION ===
${jobDescription}

ONLY valid JSON. No other text.`;

  return { system, user };
}

module.exports = { buildJDAnalysisPrompt };
