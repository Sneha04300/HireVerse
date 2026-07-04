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
import { LoadingState, EmptyState } from "../components/resume/ResumeStates";
import api from "../services/api";

export default function ResumeAnalyzerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [data, setData] = useState(null);

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

    const sectionEntries = Object.entries(result.sectionScores || {});

    const breakdown = sectionEntries.map(([key, score]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      score,
      status: score >= 70 ? "Good" : score >= 50 ? "Average" : "Needs Work",
    }));

    const sections = sectionEntries.map(([key, score]) => ({
      id: key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      score,
      feedback: `Your ${key} section scored ${score}/100. ${
        score >= 70 ? "This is performing well." : score >= 50 ? "Consider improving this area." : "This needs significant improvement."
      }`,
      suggestions: [
        score < 70 && `Add more relevant ${key} content to your resume.`,
        score < 50 && `Review best practices for the ${key} section structure.`,
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

  const handleFileChange = (f) => {
    setFile(f);
    setAnalyzed(false);
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#0a0d18 0%,#080f1a 50%,#050d14 100%)" }}>
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
            <h1 className="text-3xl font-extrabold text-white">Resume Analyzer</h1>
            <p className="text-gray-500 text-sm mt-2 max-w-xl">
              Upload your resume and receive ATS insights, keyword analysis and improvement recommendations.
            </p>
          </div>

          {/* ── Upload Card (always visible) ── */}
          <div className="mb-6">
            <ResumeUpload
              file={file}
              onFileChange={handleFileChange}
              onAnalyze={handleAnalyze}
              analyzing={analyzing}
            />
          </div>

          {/* ── Loading State ── */}
          {analyzing && (
            <div className="rounded-2xl" style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}>
              <LoadingState />
            </div>
          )}

          {/* ── Empty State ── */}
          {!analyzing && !analyzed && (
            <div className="rounded-2xl" style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}>
              <EmptyState />
            </div>
          )}

          {/* ── Results ── */}
          {!analyzing && analyzed && (
            <div className="flex flex-col gap-6 animate-fade-in">

              {/* Quick Actions */}
              <ResumeQuickActions onAction={(id) => {
                if (id === "reanalyze") handleAnalyze();
              }} />

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
                    onGenerate={() => alert("Generating improved resume…")}
                  />

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
