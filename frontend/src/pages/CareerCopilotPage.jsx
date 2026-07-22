import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import CopilotChat from "../components/copilot/CopilotChat";
import SuggestedPrompts from "../components/copilot/SuggestedPrompts";
import { ReadinessRingCard } from "../components/copilot/ReadinessCard";
import FocusAreas from "../components/copilot/FocusAreas";
import QuickInsights, { WeeklyChecklistCard } from "../components/copilot/QuickInsights";
import { CopilotLoadingState, CopilotEmptyState } from "../components/copilot/CopilotStates";
import api from "../services/api";
import {
  CHAT_HISTORY,
  AMAZON_READINESS,
  THIRTY_DAY_PLAN,
  SUGGESTED_PROMPTS,
  PLACEMENT_READINESS,
  FOCUS_AREAS,
  WEEKLY_CHECKLIST,
  AI_INSIGHTS,
} from "../data/copilotDummyData";

// Change to "loading" | "empty" | "data" to preview states
const PAGE_STATE = "data";

let nextId = 1000;

export default function CareerCopilotPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pageState, setPageState] = useState(PAGE_STATE);
  const [messages, setMessages] = useState(PAGE_STATE === "empty" ? [] : CHAT_HISTORY);
  const [inputValue, setInputValue] = useState("");

  const handleSend = async (text) => {
    setPageState("data");
    const userMsg = { id: nextId++, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    try {
      const { data } = await api.post("/copilot/chat", { message: text });
      const aiMsg = {
        id: nextId++,
        role: "ai",
        text: data.reply,
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

          {/* ── States ── */}
          {pageState === "loading" && <CopilotLoadingState />}

          {pageState === "empty" && (
            <div className="rounded-2xl" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
              <CopilotEmptyState onPromptClick={handleSend} />
            </div>
          )}

          {pageState === "data" && (
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 animate-fade-in">

              {/* ── Left column (70%) ── */}
              <div className="flex flex-col gap-6 min-w-0">
                <CopilotChat
                  messages={messages}
                  readinessData={AMAZON_READINESS}
                  planData={THIRTY_DAY_PLAN}
                  inputValue={inputValue}
                  onInputChange={setInputValue}
                  onSend={handleSend}
                />
                <SuggestedPrompts prompts={SUGGESTED_PROMPTS} onSelect={handlePromptSelect} />
              </div>

              {/* ── Right column (30%) ── */}
              <div className="flex flex-col gap-6 xl:sticky xl:top-20 xl:self-start">
                <ReadinessRingCard score={PLACEMENT_READINESS.score} label={PLACEMENT_READINESS.label} />
                <FocusAreas areas={FOCUS_AREAS} />
                <WeeklyChecklistCard checklist={WEEKLY_CHECKLIST} />
                <QuickInsights insights={AI_INSIGHTS} />
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
