import { useState } from "react";
import { Link } from "react-router-dom";

const IconMenu = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const IconSearch = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
  </svg>
);

const IconBell = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

export default function Navbar({ onSidebarToggle }) {
  const [query, setQuery] = useState("");

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 px-4 h-14"
      style={{
        background: "rgba(10,13,24,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "0.5px solid #1e2535",
      }}
    >
      {/* Sidebar Toggle */}
      <button
        onClick={onSidebarToggle}
        className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
      >
        <IconMenu />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-xl">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          <IconSearch />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search features, roadmap, companies..."
          className="w-full bg-[#0f1420] border border-[#1e2535] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#2a3550] transition-colors"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 ml-auto flex-shrink-0">
        <Link to="/login" className="text-gray-300 hover:text-white text-sm font-medium transition-colors hidden sm:block">
          Sign in
        </Link>
        <Link
          to="/signup"
          className="text-sm font-semibold px-4 py-1.5 rounded-lg text-white"
          style={{ background: "linear-gradient(90deg,#7C3AED,#06B6D4)" }}
        >
          Sign up
        </Link>
        <button className="text-gray-400 hover:text-white transition-colors">
          <IconBell />
        </button>
        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#7C3AED,#06B6D4)" }}
          >
            SG
          </div>
          <div className="hidden md:block leading-tight">
            <div className="text-white text-sm font-semibold">Sneha Gupta</div>
            <div className="text-gray-500 text-[11px]">CSE • 2026</div>
          </div>
        </div>
      </div>
    </header>
  );
}
