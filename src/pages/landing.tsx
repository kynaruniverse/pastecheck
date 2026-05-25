import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import NavMenu from "@/components/NavMenu";
import Logo from "@/components/Logo";

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Instant Detection",
    desc: "Results appear the moment you press the button — no waiting, no server round-trips.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Visual Highlighting",
    desc: "Errors glow red, warnings glow yellow — see every problem at a glance.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    title: "Understand, Not Just Find",
    desc: "Tap any highlighted line for a plain-English explanation of what broke and why. Your last 10 checks are saved so you can jump back instantly.",
  },
];

export default function Landing() {
  const [, navigate] = useLocation();

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 20% 10%, hsla(210,80%,55%,0.22) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 85% 20%, hsla(250,70%,60%,0.16) 0%, transparent 55%),
          radial-gradient(ellipse 50% 35% at 50% 60%, hsla(190,70%,50%,0.10) 0%, transparent 55%),
          hsl(222 16% 10%)
        `,
      }}
    >
      <Helmet>
        <title>PasteCheck — Free Online Code Error Checker</title>
        <meta name="description" content="Paste your JavaScript, TypeScript, Python, HTML or CSS and instantly see every error highlighted. Free, no sign-up, works on mobile." />
        <meta property="og:title" content="PasteCheck — Free Online Code Error Checker" />
        <meta property="og:description" content="Paste your JavaScript, TypeScript, Python, HTML or CSS and instantly see every error highlighted. Free, no sign-up, works on mobile." />
        <style>{`
          @keyframes probadgepulse {
            0%, 100% { box-shadow: 0 0 0 0 hsla(210,80%,60%,0.5); }
            50% { box-shadow: 0 0 0 5px hsla(210,80%,60%,0); }
          }
        `}</style>
      </Helmet>

      <div className="mx-auto w-full max-w-2xl px-5 flex flex-col flex-1">

        {/* Nav */}
        <div className="pt-8">
          <Logo size="sm" />
        </div>
        <NavMenu />

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center py-14">
          <div className="mb-3">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                background: "rgba(96,165,250,0.15)",
                color: "rgb(96,165,250)",
                border: "1px solid rgba(96,165,250,0.3)",
              }}
            >
              Free · Pro available
            </span>
          </div>

          <h1
            className="text-4xl font-extrabold leading-tight tracking-tight mb-4"
            style={{ color: "hsl(210 20% 95%)" }}
          >
            Catch Code Errors
            <br />
            <span style={{
              color: "hsl(210 80% 65%)",
              textShadow: "0 0 30px hsla(210,80%,65%,0.5)",
            }}>Instantly.</span>
          </h1>

          <p
            className="text-base leading-relaxed mb-10 max-w-sm"
            style={{ color: "hsl(215 14% 58%)" }}
          >
            Paste your JavaScript, TypeScript, Python, HTML or CSS and see every error highlighted instantly — with plain-English explanations, not just line numbers.
          </p>

          <button
            onClick={() => navigate("/check")}
            className="w-full rounded-2xl py-4 text-base font-bold tracking-wide transition-all duration-150 active:scale-[0.97] mb-4"
            style={{
              background: "hsl(210 80% 60%)",
              color: "hsl(222 16% 6%)",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 40px hsla(210,80%,60%,0.45), 0 4px 16px hsla(210,80%,60%,0.3)",
            }}
          >
            Check My Code
          </button>

          <p
            className="text-xs text-center"
            style={{ color: "hsl(215 14% 40%)" }}
          >
            No sign-up. No installs. Works in your browser.
          </p>
          <p
            className="text-xs text-center mt-1"
            style={{ color: "hsl(215 14% 35%)" }}
          >
            🔒 Your code never leaves your browser.
          </p>
        </div>

        {/* Pro section */}
        <div className="pb-6 flex flex-col gap-3">
          <div
            className="rounded-2xl px-5 py-5 flex flex-col gap-4"
            style={{
              background: "linear-gradient(135deg, hsl(222 16% 16%) 0%, hsl(224 20% 14%) 100%)",
              border: "1px solid hsla(210,80%,60%,0.35)",
              boxShadow: "0 0 24px hsla(210,80%,60%,0.12), inset 0 1px 0 hsla(210,80%,80%,0.08)",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "hsl(210 80% 60%)",
                  color: "hsl(222 16% 6%)",
                  animation: "probadgepulse 2.5s ease-in-out infinite",
                }}
              >PRO</span>
              <span className="text-sm font-semibold" style={{ color: "hsl(210 20% 92%)" }}>
                £4/month — everything unlocked
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                { icon: "📂", label: "Multi-file mode", desc: "Check up to 5 files at once with per-file results." },
                { icon: "🔗", label: "Shareable links", desc: "Generate a permanent URL for any check result." },
                { icon: "📁", label: "Saved collections", desc: "Save checks to named collections, synced across devices." },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <span className="text-xs font-semibold" style={{ color: "hsl(210 20% 88%)" }}>{item.label}</span>
                    <span className="text-xs" style={{ color: "hsl(215 14% 52%)" }}> — {item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/check")}
              className="w-full rounded-xl py-3 text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
              style={{
                background: "hsl(210 80% 60%)",
                color: "hsl(222 16% 6%)",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 0 16px hsla(210,80%,60%,0.3)",
              }}
            >
              Start Free — Upgrade Anytime
            </button>
          </div>
        </div>

        {/* Feature cards */}
        <div className="pb-12 flex flex-col gap-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-4 rounded-2xl px-5 py-4"
              style={{
                background: "hsl(222 16% 14%)",
                border: "1px solid hsl(220 13% 22%)",
              }}
            >
              <span
                className="shrink-0 mt-0.5 flex items-center justify-center rounded-xl w-10 h-10"
                style={{
                  background: "hsl(220 13% 19%)",
                  color: "hsl(210 80% 65%)",
                }}
              >
                {f.icon}
              </span>
              <div>
                <p
                  className="text-sm font-semibold mb-0.5"
                  style={{ color: "hsl(210 20% 90%)" }}
                >
                  {f.title}
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "hsl(215 14% 52%)" }}
                >
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}