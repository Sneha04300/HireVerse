import Logo from "../ui/Logo";
import FeaturePills from "../ui/FeaturePills";

export default function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "linear-gradient(135deg, #1a1040 0%, #0f172a 40%, #0a2a2a 100%)",
      }}
    >
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #06B6D4 0%, transparent 70%)" }}
        />

        <Logo />

        <div className="relative z-10">
          <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
            One Destination for{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, #A78BFA, #06B6D4)" }}
            >
              Every
              <br />
              Career Decision.
            </span>
          </h2>
          <p className="mt-4 text-gray-400 text-base leading-relaxed max-w-xs">
            Resume scoring, ATS checks, DSA tracking, mock interviews and a
            personalised roadmap — all wired into one placement co-pilot.
          </p>
          <FeaturePills />
        </div>

        <p className="text-gray-600 text-sm relative z-10">
          Trusted by 12,000+ students across 80+ campuses.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-10 sm:px-10 xl:px-16 relative">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8">
          <Logo />
        </div>

        <div
          className="w-full max-w-md mx-auto rounded-2xl p-7 sm:p-8"
          style={{
            background: "rgba(17, 24, 39, 0.85)",
            backdropFilter: "blur(16px)",
            border: "1px solid #252d3d",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
