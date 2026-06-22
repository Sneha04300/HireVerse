import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ReadinessCard from "./ReadinessCard";
import ActionPlanCard from "./ActionPlanCard";

const IconSend = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default function CopilotChat({ messages, readinessData, planData, inputValue, onInputChange, onSend }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) onSend(inputValue.trim());
  };

  return (
    <div
      className="rounded-2xl flex flex-col overflow-hidden"
      style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}
    >
      {/* Messages */}
      <div ref={scrollRef} className="flex flex-col gap-5 p-6 max-h-[600px] overflow-y-auto">
        {messages.map((m) => {
          if (m.role === "ai-card" && m.cardType === "readiness") {
            return <ReadinessCard key={m.id} data={readinessData} />;
          }
          if (m.role === "ai-card" && m.cardType === "plan") {
            return <ActionPlanCard key={m.id} plan={planData} />;
          }
          return <ChatMessage key={m.id} message={m} />;
        })}
      </div>

      {/* Sticky input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 p-4 border-t"
        style={{ borderColor: "#1e2535", background: "#0a0d16" }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Ask anything..."
          className="flex-1 bg-[#1a1f2e] border border-[#252d3d] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#4B5563] transition-colors"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg,#7C3AED,#06B6D4)" }}
        >
          <IconSend />
        </button>
      </form>
    </div>
  );
}
