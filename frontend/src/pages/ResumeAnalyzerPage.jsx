import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import ResumeUpload from "../components/resume/ResumeUpload";
import ATSScoreCard from "../components/resume/ATSScoreCard";
import KeywordAnalysis from "../components/resume/KeywordAnalysis";
import StrengthsCard from "../components/resume/StrengthsCard";
import SuggestionsCard from "../components/resume/SuggestionsCard";
import ResumeSectionAnalysis from "../components/resume/ResumeSectionAnalysis";
import ResumeReadiness from "../components/resume/ResumeReadiness";
import ResumeInsightsPanel from "../components/resume/ResumeInsightsPanel";
import ResumeQuickActions from "../components/resume/ResumeQuickActions";
import { LoadingState, EmptyState, GeneratingState } from "../components/resume/ResumeStates";
import api from "../services/api";

const API_ORIGIN = api.defaults.baseURL.replace(/\/api$/, "");

export default function ResumeAnalyzerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [data, setData] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState(null);
  const [docxUrl, setDocxUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jdMatchData, setJdMatchData] = useState(null);
  const [jdMatching, setJdMatching] = useState(false);

  const handleAnalyze = async () => {

  if (!file) {
    alert("Please upload a resume.");
    return;
  }

  try {

    setAnalyzing(true);
    setAnalyzed(false);

    const formData = new FormData();

    formData.append("resume", file);

    const response = await api.post(
      "/resume/analyze",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const result = response.data.data;

    setResumeId(result.resumeId);

    const sectionEntries = Object.entries(result.sectionScores || {});

    const breakdown = sectionEntries.map(([key, section]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      score: section.score,
      status: section.score >= 70 ? "Good" : section.score >= 50 ? "Average" : "Needs Work",
    }));

    const sections = sectionEntries.map(([key, section]) => ({
      id: key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      score: section.score,
      feedback: section.reason,
      suggestions: [
        section.score < 70 && `Add more relevant ${key} content to your resume.`,
        section.score < 50 && `Review best practices for the ${key} section structure.`,
        "Tailor this section to match job description requirements.",
      ].filter(Boolean),
    }));

    const missingKeywords = result.missingKeywords || [];

    setData({
      atsScore: result.atsScore,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      missingKeywords,
      suggestions: result.suggestions,
      breakdown,
      sections,
      placementImpact: "Excellent",
      batchRank: "Top 20%",
      atsTrend: [result.atsScore - 15, result.atsScore - 10, result.atsScore - 5, result.atsScore - 2, result.atsScore],
      industryBenchmark: 65,
      topMissingSkills: missingKeywords.slice(0, 4),
      resumeRank: Math.max(1, 100 - result.atsScore + 1),
      totalResumes: 10000,
    });

    setAnalyzed(true);

    if (jobDescription.trim().length >= 10) {
      handleJobMatch(result.resumeId);
    }

  } catch (error) {

    console.error(error);

    alert(
      error.response?.data?.message ||
      "Resume analysis failed."
    );

  } finally {

    setAnalyzing(false);

  }

};

  const handleGenerate = async () => {
    if (!resumeId) {
      alert("Please analyze a resume first.");
      return;
    }

    try {
      setGenerating(true);
      setGeneratedPreview(null);
      setDocxUrl("");
      setPdfUrl("");

      const body = { resumeId };
      if (jobDescription.trim().length >= 10) body.jobDescription = jobDescription.trim();
      const response = await api.post("/resume/rewrite", body);
      const result = response.data.data;

      setGeneratedPreview(result.preview);
      setDocxUrl(`${API_ORIGIN}${result.docxUrl}`);
      setPdfUrl(`${API_ORIGIN}${result.pdfUrl}`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Resume rewrite failed.");
    } finally {
      setGenerating(false);
    }
  };

  const handleJobMatch = async (id) => {
    const jd = jobDescription.trim();
    if (!jd || jd.length < 10 || !id) return;

    try {
      setJdMatching(true);
      const response = await api.post("/resume/job-match", {
        resumeId: id,
        jobDescription: jd,
      });
      setJdMatchData(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setJdMatching(false);
    }
  };

  const handleFileChange = (f) => {
    setFile(f);
    setAnalyzed(false);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <Navbar onSidebarToggle={() => setSidebarOpen((v) => !v)} />
      <Sidebar open={sidebarOpen} />

      <main
        className="transition-all duration-300 pt-14"
        style={{ marginLeft: sidebarOpen ? "220px" : "0px" }}
      >
        <div className="px-6 py-8 max-w-[1400px]">

          {/* ── Hero Header ── */}
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 mb-2">Analyze</p>
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Resume Analyzer</h1>
            <p className="text-[var(--text-muted)] text-sm mt-2 max-w-xl">
              Upload your resume and receive ATS insights, keyword analysis, job description matching, and improvement recommendations.
            </p>
          </div>

          {/* ── Upload Card (always visible) ── */}
          <div className="mb-4">
            <ResumeUpload
              file={file}
              onFileChange={handleFileChange}
              onAnalyze={handleAnalyze}
              analyzing={analyzing}
            />
          </div>

          {/* ── Optional Job Description ── */}
          <div className="mb-6 rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3 block">
              Paste Job Description <span className="text-[var(--text-tertiary)] normal-case tracking-normal text-[10px]">(Optional)</span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste a job description here to check your resume's fit and get tailored suggestions…"
              rows={4}
              className="w-full rounded-xl px-4 py-3 text-sm text-[var(--text-secondary)] placeholder-[var(--text-tertiary)] resize-none outline-none transition-all"
              style={{ background: "var(--bg-base)", border: "0.5px solid var(--border)" }}
            />
            {jobDescription.trim().length >= 10 && analyzed && (
              <button
                onClick={() => handleJobMatch(resumeId)}
                disabled={jdMatching}
                className="mt-3 px-5 py-2 rounded-xl text-white font-bold text-xs tracking-wide transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
                style={{ background: "linear-gradient(90deg,#7C3AED,#06B6D4)" }}
              >
                {jdMatching ? "Analyzing…" : "Check Match"}
              </button>
            )}
          </div>

          {/* ── Loading State ── */}
          {analyzing && (
            <div className="rounded-2xl" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
              <LoadingState />
            </div>
          )}

          {/* ── Empty State ── */}
          {!analyzing && !analyzed && (
            <div className="rounded-2xl" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
              <EmptyState />
            </div>
          )}

          {/* ── Results ── */}
          {!analyzing && analyzed && (
            <div className="flex flex-col gap-6 animate-fade-in">

              {/* Quick Actions */}
              <ResumeQuickActions onAction={(id) => {
                if (id === "reanalyze") handleAnalyze();
                if (id === "generate") handleGenerate();
                if (id === "download" && generatedPreview) {
                  window.open(docxUrl || pdfUrl, "_blank");
                }
              }} />

              {/* ── JD Match Results ── */}
              {jdMatchData && (
                <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,58,237,0.12)", border: "0.5px solid rgba(124,58,237,0.3)" }}>
                      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[var(--text-primary)] font-bold text-base leading-snug">Job Description Match</h3>
                      <p className="text-[var(--text-muted)] text-xs">Resume fit score for the pasted job</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-2xl font-extrabold" style={{ color: jdMatchData.matchScore >= 70 ? "#06B6D4" : jdMatchData.matchScore >= 50 ? "#eab308" : "#ef4444" }}>
                        {jdMatchData.matchScore}%
                      </span>
                      <span className="text-[var(--text-muted)] text-xs">Match</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Matched Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {jdMatchData.matchedKeywords.length > 0 ? jdMatchData.matchedKeywords.map((k, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: "rgba(6,182,212,0.12)", border: "0.5px solid rgba(6,182,212,0.3)", color: "#06B6D4" }}>{k}</span>
                        )) : <span className="text-[var(--text-tertiary)] text-xs">No matches found</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Missing Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {jdMatchData.missingKeywords.length > 0 ? jdMatchData.missingKeywords.map((k, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: "rgba(239,68,68,0.1)", border: "0.5px solid rgba(239,68,68,0.25)", color: "#ef4444" }}>{k}</span>
                        )) : <span className="text-[var(--text-tertiary)] text-xs">No gaps found</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Matched Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {jdMatchData.matchedSkills.length > 0 ? jdMatchData.matchedSkills.map((s, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: "rgba(6,182,212,0.12)", border: "0.5px solid rgba(6,182,212,0.3)", color: "#06B6D4" }}>{s}</span>
                        )) : <span className="text-[var(--text-tertiary)] text-xs">No matches found</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Missing Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {jdMatchData.missingSkills.length > 0 ? jdMatchData.missingSkills.map((s, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: "rgba(239,68,68,0.1)", border: "0.5px solid rgba(239,68,68,0.25)", color: "#ef4444" }}>{s}</span>
                        )) : <span className="text-[var(--text-tertiary)] text-xs">No gaps found</span>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Suggestions</p>
                    <div className="flex flex-col gap-2">
                      {jdMatchData.suggestions.length > 0 ? jdMatchData.suggestions.map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5" style={{ background: "rgba(124,58,237,0.2)", border: "0.5px solid rgba(124,58,237,0.4)", color: "#a78bfa" }}>{i + 1}</span>
                          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{s}</p>
                        </div>
                        )) : <span className="text-[var(--text-tertiary)] text-xs">No suggestions</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* 2-col grid: main content + insights panel */}
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">

                {/* ── Left: main content ── */}
                <div className="flex flex-col gap-6">

                  {/* Resume Readiness Meter */}
                  <ResumeReadiness
                    atsScore={data.atsScore}
                    placementImpact={data.placementImpact}
                    batchRank={data.batchRank}
                  />

                  {/* ATS Score + Breakdown */}
                  <ATSScoreCard
                    atsScore={data.atsScore}
                    batchRank={data.batchRank}
                    breakdown={data.breakdown}
                  />

                  {/* Strengths & Weaknesses */}
                  <StrengthsCard
                    strengths={data.strengths}
                    weaknesses={data.weaknesses}
                  />

                  {/* Missing Keywords */}
                  <KeywordAnalysis missingKeywords={data.missingKeywords} />

                  {/* Section Analysis Accordion */}
                  <ResumeSectionAnalysis sections={data.sections} />

                  {/* AI Suggestions */}
                  <SuggestionsCard
                    suggestions={data.suggestions}
                    onGenerate={handleGenerate}
                  />

                  {/* Generate loading state */}
                  {generating && <GeneratingState />}

                  {/* Generated resume download buttons */}
                  {generatedPreview && !generating && (
                    <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(6,182,212,0.12)", border: "0.5px solid rgba(6,182,212,0.3)" }}>
                          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[var(--text-primary)] font-bold text-base leading-snug">Improved Resume Ready</h3>
                          <p className="text-[var(--text-muted)] text-xs">Download your AI-optimized resume</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <a
                          href={docxUrl}
                          download
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm tracking-wide transition-opacity hover:opacity-90"
                          style={{ background: "linear-gradient(90deg,#7C3AED,#06B6D4)" }}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download DOCX
                        </a>
                        <a
                          href={pdfUrl}
                          download
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm tracking-wide transition-opacity hover:opacity-90"
                          style={{ background: "var(--bg-card-alt)", border: "0.5px solid var(--border)", color: "var(--text-secondary)" }}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Download PDF
                        </a>
                      </div>
                    </div>
                  )}

                </div>

                {/* ── Right: insights panel ── */}
                <div className="xl:sticky xl:top-20 xl:self-start">
                  <ResumeInsightsPanel data={data} />
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
