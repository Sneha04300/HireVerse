import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

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

const IconMoon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const IconSun = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export default function Navbar({ onSidebarToggle }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isDark = theme === "dark";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 px-4 h-14"
      style={{
        background: isDark ? "rgba(10,13,24,0.92)" : "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: isDark ? "0.5px solid #1e2535" : "0.5px solid #e2e8f0",
      }}
    >
      {/* Sidebar Toggle */}
      <button
        onClick={onSidebarToggle}
        className={`transition-colors flex-shrink-0 ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
      >
        <IconMenu />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-xl">
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          <IconSearch />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search features, roadmap, companies..."
          className={`w-full rounded-lg pl-9 pr-4 py-2 text-sm placeholder-gray-600 focus:outline-none transition-colors ${
            isDark
              ? "bg-[#0f1420] border border-[#1e2535] text-white focus:border-[#2a3550]"
              : "bg-white border border-[#e2e8f0] text-gray-900 focus:border-[#94a3b8]"
          }`}
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 ml-auto flex-shrink-0">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`transition-colors ${isDark ? "text-gray-400 hover:text-yellow-400" : "text-gray-500 hover:text-yellow-500"}`}
          title={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
          {isDark ? <IconSun /> : <IconMoon />}
        </button>

        {isAuthenticated ? (
          <>
            <button className={`transition-colors ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
              <IconBell />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogout} title="Logout">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#7C3AED,#06B6D4)" }}
              >
                {initials}
              </div>
              <div className="hidden md:block leading-tight">
                <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{user?.name}</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className={`text-sm font-medium transition-colors hidden sm:block ${isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>
              Sign in
            </Link>
            <Link
              to="/signup"
              className="text-sm font-semibold px-4 py-1.5 rounded-lg text-white"
              style={{ background: "linear-gradient(90deg,#7C3AED,#06B6D4)" }}
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
