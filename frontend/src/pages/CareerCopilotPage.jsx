import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import CopilotChat from "../components/copilot/CopilotChat";
import SuggestedPrompts from "../components/copilot/SuggestedPrompts";
import { ReadinessRingCard } from "../components/copilot/ReadinessCard";
import FocusAreas from "../components/copilot/FocusAreas";
import QuickInsights, { WeeklyChecklistCard } from "../components/copilot/QuickInsights";
import { CopilotLoadingState, CopilotEmptyState } from "../components/copilot/CopilotStates";
import api from "../services/api";

const SUGGESTED_PROMPTS = [
  "Build me a 30-day Amazon prep plan",
  "Review my last mock interview",
  "Compare my profile vs Google bar",
  "What should I learn next week?",
];

let nextId = 1000;

const toChatMessage = (item) => ({
  id: nextId++,
  role: item.role === "user" ? "user" : "ai",
  text: item.message || item.text || "",
});

export default function CareerCopilotPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [sending, setSending] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await api.get("/copilot/dashboard");
      setDashboard(res.data.data);
    } catch (err) {
      console.error("[CareerCopilotPage] Dashboard error", err);
      setError(true);
    }
  }, []);

  const loadChat = useCallback(async () => {
    try {
      const res = await api.get("/copilot/chat");
      const history = res.data.data?.chatHistory || [];
      setMessages(history.map(toChatMessage));
    } catch (err) {
      console.error("[CareerCopilotPage] Chat history error", err);
    }
  }, []);

  useEffect(() => {
    Promise.all([loadDashboard(), loadChat()]).finally(() => setLoading(false));
  }, [loadDashboard, loadChat]);

  const handleSend = async (text) => {
    if (!text.trim() || sending) return;
    setSending(true);
    setError(false);

    const userMsg = { id: nextId++, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    try {
      const { data } = await api.post("/copilot/chat", { message: text });
      const aiMsg = {
        id: nextId++,
        role: "ai",
        text: data.reply || "I couldn't process that request. Please try again.",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("[CareerCopilotPage] Chat error", err);
      const errMsg = {
        id: nextId++,
        role: "ai",
        text: "Sorry, I couldn't process that request. Please try again.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  const handlePromptSelect = (prompt) => {
    setInputValue(prompt);
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

          {/* ── Hero ── */}
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand mb-2">AI</p>
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Career Copilot</h1>
            <p className="text-[var(--text-muted)] text-sm mt-2 max-w-xl">
              Ask anything about your placement journey. Trained on your profile and goals.
            </p>
          </div>

          {/* ── Loading ── */}
          {loading && <CopilotLoadingState />}

          {/* ── Error ── */}
          {!loading && error && (
            <div className="rounded-2xl p-8 flex flex-col items-center gap-4 text-center" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
              <p className="text-[var(--text-primary)] font-semibold">Couldn't load your Copilot data</p>
              <button
                onClick={() => { setLoading(true); setError(false); Promise.all([loadDashboard(), loadChat()]).finally(() => setLoading(false)); }}
                className="px-5 py-2.5 rounded-xl text-white font-bold text-sm btn-gradient"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Empty (no messages yet) ── */}
          {!loading && !error && messages.length === 0 && (
            <div className="rounded-2xl" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
              <CopilotEmptyState onPromptClick={handleSend} />
            </div>
          )}

          {/* ── Data ── */}
          {!loading && !error && messages.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 animate-fade-in">

              {/* ── Left column ── */}
              <div className="flex flex-col gap-6 min-w-0">
                <CopilotChat
                  messages={messages}
                  readinessData={dashboard?.readiness || null}
                  planData={dashboard?.actionPlan || []}
                  inputValue={inputValue}
                  onInputChange={setInputValue}
                  onSend={handleSend}
                />
                <SuggestedPrompts prompts={SUGGESTED_PROMPTS} onSelect={handlePromptSelect} />
              </div>

              {/* ── Right column ── */}
              <div className="flex flex-col gap-6 xl:sticky xl:top-20 xl:self-start">
                <ReadinessRingCard
                  score={dashboard?.readiness?.score ?? 0}
                  label={`${dashboard?.readiness?.company || "Placement"} readiness`}
                />
                <FocusAreas areas={dashboard?.focusAreas || []} />
                <WeeklyChecklistCard checklist={dashboard?.weeklyGoals || []} />
                <QuickInsights insights={dashboard?.insights || []} />
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
