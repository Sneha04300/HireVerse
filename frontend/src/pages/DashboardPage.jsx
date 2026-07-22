import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import HeroCard from "../components/dashboard/HeroCard";
import UpcomingGoals from "../components/dashboard/UpcomingGoals";
import StatCards from "../components/dashboard/StatCards";
import SkillBreakdown from "../components/dashboard/SkillBreakdown";
import QuickActions from "../components/dashboard/QuickActions";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-gradient-card)" }}
    >
      <Navbar onSidebarToggle={() => setSidebarOpen((v) => !v)} />
      <Sidebar open={sidebarOpen} />

      {/* Main content */}
      <main
        className="transition-all duration-300 pt-14"
        style={{ marginLeft: sidebarOpen ? "220px" : "0px" }}
      >
        <div className="px-6 py-8 max-w-[1400px]">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-brand mb-2">
                Dashboard
              </p>
              <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">
                Welcome back, Sneha 👋
              </h1>
              <p className="text-[var(--text-muted)] text-sm mt-1.5">
                Here's where you stand today, and the next moves that matter most.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                className="px-5 py-2.5 rounded-xl text-[var(--text-primary)] text-sm font-semibold transition-colors"
                style={{ background: "var(--bg-card-alt)", border: "0.5px solid var(--border)" }}
              >
                Share Profile
              </button>
              <button
                className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 transition-opacity hover:opacity-90 btn-gradient"
              >
                Plan My Week
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Row 1: Hero + Goals ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            <div className="lg:col-span-2">
              <HeroCard />
            </div>
            <div>
              <UpcomingGoals />
            </div>
          </div>

          {/* ── Row 2: Stat Cards ── */}
          <div className="mb-5">
            <StatCards />
          </div>

          {/* ── Row 3: Skill Breakdown + Quick Actions ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <SkillBreakdown />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
