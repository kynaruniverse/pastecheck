import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";

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
    title: "Tap for Details",
    desc: "Tap any highlighted line for a plain-English explanation. Your last 10 checks are saved so you can jump back instantly.",
  },
];

export default function Landing() {
  const [, navigate] = useLocation();

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ background: "hsl(222 16% 10%)" }}
    >
      <Helmet>
        <title>PasteCheck — Free Online Code Error Checker</title>
        <meta name="description" content="Paste your JavaScript, TypeScript, Python, HTML or CSS and instantly see every error highlighted. Free, no sign-up, works on mobile." />
        <meta property="og:title" content="PasteCheck — Free Online Code Error Checker" />
        <meta property="og:description" content="Paste your JavaScript, TypeScript, Python, HTML or CSS and instantly see every error highlighted. Free, no sign-up, works on mobile." />
      </Helmet>
      <div className="mx-auto w-full max-w-2xl px-5 flex flex-col flex-1">

        {/* Nav */}
        <div className="pt-8 flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center rounded-lg w-8 h-8 text-sm font-bold shrink-0"
            style={{ background: "hsl(210 80% 60%)", color: "hsl(222 16% 6%)" }}
          >
            P
          </span>
          <span
            className="text-base font-bold tracking-tight"
            style={{ color: "hsl(210 20% 92%)" }}
          >
            PasteCheck
          </span>
        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center py-14">
          <div className="mb-3">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                background: "rgba(96,165,250,0.12)",
                color: "rgb(96,165,250)",
                border: "1px solid rgba(96,165,250,0.2)",
              }}
            >
              Free &amp; instant
            </span>
          </div>

          <h1
            className="text-4xl font-extrabold leading-tight tracking-tight mb-4"
            style={{ color: "hsl(210 20% 95%)" }}
          >
            Catch Code Errors
            <br />
            <span style={{ color: "hsl(210 80% 65%)" }}>Instantly.</span>
          </h1>

          <p
            className="text-base leading-relaxed mb-10 max-w-sm"
            style={{ color: "hsl(215 14% 58%)" }}
          >
            Paste your JavaScript, TypeScript, Python, HTML or CSS and see every error highlighted in seconds.
          </p>

          <button
            onClick={() => navigate("/check")}
            className="w-full rounded-2xl py-4 text-base font-bold tracking-wide transition-all duration-150 active:scale-[0.97] mb-4"
            style={{
              background: "hsl(210 80% 60%)",
              color: "hsl(222 16% 6%)",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 32px hsla(210,80%,60%,0.25)",
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
        </div>

        {/* Feature cards */}
        <div className="pb-12 flex flex-col gap-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-4 rounded-2xl px-5 py-4"
              style={{
                background: "hsl(222 16% 14%)",
                border: "1px solid hsl(220 13% 21%)",
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
