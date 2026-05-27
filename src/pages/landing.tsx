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
    desc: "Tap any highlighted line for a plain-English explanation of what broke and why. Your last 5 checks are saved locally so you can jump back instantly.",
  },
];

export default function Landing() {
  const [, navigate] = useLocation();

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 20% 10%, hsla(262,83%,65%,0.22) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 85% 20%, hsla(262,83%,65%,0.16) 0%, transparent 55%),
          radial-gradient(ellipse 50% 35% at 50% 60%, hsla(190,70%,50%,0.10) 0%, transparent 55%),
          hsl(220 8% 9%)
        `,
      }}
    >
      <Helmet>
        <title>PasteCheck — Free Online Code Error Checker</title>
        <meta name="description" content="Paste your JavaScript, TypeScript, Python, HTML or CSS and instantly see every error highlighted. Free, no sign-up, works on mobile." />
        <meta property="og:title" content="PasteCheck — Free Online Code Error Checker" />
        <meta property="og:description" content="Paste your JavaScript, TypeScript, Python, HTML or CSS and instantly see every error highlighted. Free, no sign-up, works on mobile." />
      </Helmet>

      <div className="mx-auto w-full max-w-2xl px-5 flex flex-col flex-1">

        {/* Nav */}
        <NavMenu />

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center py-14">
          <div className="mb-3">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                background: "rgba(167,139,250,0.15)",
                color: "rgb(167,139,250)",
                border: "1px solid rgba(167,139,250,0.3)",
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
              color: "hsl(262 83% 75%)",
              textShadow: "0 0 30px hsla(262,83%,75%,0.5)",
            }}>Instantly.</span>
          </h1>

          <p
            className="text-base leading-relaxed mb-6 max-w-sm"
            style={{ color: "hsl(215 14% 58%)" }}
          >
            Paste your JavaScript, TypeScript, Python, HTML or CSS and see every error highlighted instantly — with plain-English explanations, not just line numbers.
          </p>

          {/* Annotated hero snippet */}
          <div
            className="rounded-xl overflow-hidden mb-10"
            style={{ border: "1px solid hsl(220 13% 22%)", background: "hsl(220 8% 11%)" }}
          >
            {/* File header */}
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{ background: "hsl(220 8% 12%)", borderBottom: "1px solid hsl(220 13% 18%)" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium" style={{ color: "hsl(210 20% 72%)" }}>example.js</span>
                <span className="text-xs font-semibold" style={{ color: "rgb(250,204,21)" }}>JavaScript</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(220,38,38,0.18)", color: "rgb(248,113,113)" }}>1 error</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(234,179,8,0.14)", color: "rgb(253,224,71)" }}>1 warning</span>
              </div>
            </div>

            {/* Code lines */}
            <div style={{ fontFamily: "var(--app-font-mono)", fontSize: "12.5px", lineHeight: "1.7" }}>

              {/* Line 1 — normal */}
              <div className="flex" style={{ borderLeft: "3px solid transparent" }}>
                <span className="select-none text-right shrink-0 px-3 py-0.5" style={{ color: "hsl(215 14% 35%)", minWidth: "42px" }}>1</span>
                <span className="whitespace-pre py-0.5" style={{ color: "hsl(210 20% 82%)" }}>{"function greet(name) {"}</span>
              </div>

              {/* Line 2 — warning */}
              <div className="flex" style={{ background: "rgba(234,179,8,0.10)", borderLeft: "3px solid rgb(234,179,8)" }}>
                <span className="select-none text-right shrink-0 px-3 py-0.5" style={{ color: "hsl(215 14% 35%)", minWidth: "42px" }}>2</span>
                <span className="whitespace-pre py-0.5 flex-1" style={{ color: "rgb(253,224,71)" }}>{"  var message = 'Hello, ' + name;"}</span>
                <span className="shrink-0 px-2 py-0.5 self-center text-xs" style={{ color: "rgba(253,224,71,0.6)", fontFamily: "var(--app-font-sans)" }}>›</span>
              </div>
              {/* Warning explanation */}
              <div style={{ background: "rgba(234,179,8,0.06)", borderLeft: "3px solid rgba(234,179,8,0.45)" }}>
                <div className="px-3 py-1 text-xs flex items-start gap-1.5" style={{ fontFamily: "var(--app-font-sans)", color: "rgb(253,224,71)" }}>
                  <span className="mt-px shrink-0">⚠</span>
                  <span style={{ opacity: 0.9 }}>{"Avoid 'var' — use 'const' or 'let' instead. 'var' leaks out of blocks and causes hard-to-find bugs."}</span>
                </div>
              </div>

              {/* Line 3 — normal */}
              <div className="flex" style={{ borderLeft: "3px solid transparent" }}>
                <span className="select-none text-right shrink-0 px-3 py-0.5" style={{ color: "hsl(215 14% 35%)", minWidth: "42px" }}>3</span>
                <span className="whitespace-pre py-0.5" style={{ color: "hsl(210 20% 82%)" }}>{"  console.log(message)"}</span>
              </div>

              {/* Line 4 — error */}
              <div className="flex" style={{ background: "rgba(220,38,38,0.14)", borderLeft: "3px solid rgb(220,38,38)" }}>
                <span className="select-none text-right shrink-0 px-3 py-0.5" style={{ color: "hsl(215 14% 35%)", minWidth: "42px" }}>4</span>
                <span className="whitespace-pre py-0.5 flex-1" style={{ color: "rgb(252,165,165)" }}>{"}"}</span>
                <span className="shrink-0 px-2 py-0.5 self-center text-xs" style={{ color: "rgba(252,165,165,0.6)", fontFamily: "var(--app-font-sans)" }}>›</span>
              </div>
              {/* Error explanation */}
              <div style={{ background: "rgba(220,38,38,0.07)", borderLeft: "3px solid rgba(220,38,38,0.45)" }}>
                <div className="px-3 py-1 text-xs flex items-start gap-1.5" style={{ fontFamily: "var(--app-font-sans)", color: "rgb(252,165,165)" }}>
                  <span className="mt-px shrink-0">✕</span>
                  <span style={{ opacity: 0.9 }}>{"Missing return statement — the function exits without returning 'message'. Add: return message;"}</span>
                </div>
              </div>

            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/check")}
            className="w-full rounded-2xl py-4 text-base font-bold tracking-wide transition-all duration-150 active:scale-[0.97] mb-4"
            style={{
              background: "hsl(262 83% 75%)",
              color: "hsl(220 8% 6%)",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 40px hsla(262,83%,75%,0.45), 0 4px 16px hsla(262,83%,75%,0.3)",
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
              background: "linear-gradient(135deg, hsl(220 8% 15%) 0%, hsl(220 8% 13%) 100%)",
              border: "1px solid hsla(262,83%,75%,0.35)",
              boxShadow: "0 0 24px hsla(262,83%,75%,0.12), inset 0 1px 0 hsla(262,83%,75%,0.08)",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "hsl(262 83% 75%)",
                  color: "hsl(220 8% 6%)",
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
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch("/api/create-checkout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ plan: "annual" }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } catch {
                    alert("Something went wrong. Please try again.");
                  }
                }}
                className="w-full rounded-xl py-3 text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
                style={{
                  background: "hsl(262 83% 75%)",
                  color: "hsl(220 8% 6%)",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 0 16px hsla(262,83%,75%,0.3)",
                }}
              >
                Upgrade to Pro — £35/year <span style={{ opacity: 0.7, fontSize: "0.75rem" }}>(save £13)</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch("/api/create-checkout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ plan: "monthly" }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } catch {
                    alert("Something went wrong. Please try again.");
                  }
                }}
                className="w-full rounded-xl py-3 text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
                style={{
                  background: "transparent",
                  color: "hsl(262 83% 75%)",
                  border: "1px solid hsla(262,83%,75%,0.4)",
                  cursor: "pointer",
                }}
              >
                Upgrade to Pro — £4/month
              </button>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="pb-12 flex flex-col gap-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-4 rounded-2xl px-5 py-4"
              style={{
                background: "hsl(220 8% 13%)",
                border: "1px solid hsl(220 13% 22%)",
              }}
            >
              <span
                className="shrink-0 mt-0.5 flex items-center justify-center rounded-xl w-10 h-10"
                style={{
                  background: "hsl(220 13% 19%)",
                  color: "hsl(262 83% 75%)",
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