import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import { toast } from "sonner";

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
    desc: "Tap any highlighted line for a plain-English explanation of what broke and why.",
  },
];

export default function Landing() {
  const [, navigate] = useLocation();

  async function handleCheckout(plan: "annual" | "monthly") {
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

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
        <title>PasteCheck — Is Your AI-Generated Code Safe to Run?</title>
        <meta name="description" content="Paste code from ChatGPT, Claude, Copilot or any AI tool and instantly see if it's safe to run. Free checker for JavaScript, TypeScript, Python, HTML and CSS — no sign-up needed." />
        <meta property="og:title" content="PasteCheck — Is Your AI-Generated Code Safe to Run?" />
        <meta property="og:description" content="Paste code from ChatGPT, Claude, Copilot or any AI tool and instantly see if it's safe to run. Free checker — no sign-up needed." />
        <meta property="og:image" content="https://www.pastecheck.co.uk/opengraph.jpg" />
        <link rel="canonical" href="https://www.pastecheck.co.uk/" />
      </Helmet>

      <div className="mx-auto w-full max-w-5xl px-5 flex flex-col flex-1">

        {/* Nav */}
        <NavMenu />

        {/* Hero */}
        <main className="flex-1 flex flex-col justify-center py-14 md:py-20">
          <div className="md:grid md:grid-cols-2 md:gap-10 md:items-center">
          <div>
          <div className="mb-3">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full"
              style={{
                background: "rgba(167,139,250,0.15)",
                color: "rgb(196,181,253)",
                border: "1px solid rgba(167,139,250,0.3)",
              }}
            >
              Free · Pro available
            </span>
          </div>

          <h1
            className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-2"
            style={{ color: "hsl(210 20% 95%)" }}
          >
            Is Your AI Code
            <br />
            <span style={{
              color: "hsl(262 83% 75%)",
              textShadow: "0 0 30px hsla(262,83%,75%,0.5)",
            }}>Safe to Run?</span>
          </h1>

          <p
            className="text-sm font-semibold tracking-widest uppercase mb-4"
            style={{ color: "hsl(262 83% 75%)", letterSpacing: "0.12em" }}
          >
            Paste. Check. Ship.
          </p>

          <p
            className="text-base leading-relaxed mb-6 max-w-md"
            style={{ color: "hsl(215 16% 70%)" }}
          >
            Paste code from ChatGPT, Claude, Copilot or any AI tool and see every error highlighted instantly — with plain-English explanations, not just line numbers.
          </p>
          </div>

          {/* Annotated hero snippet */}
          <div
            className="rounded-xl overflow-hidden mb-6 md:mb-0"
            style={{ border: "1px solid hsl(220 13% 22%)", background: "hsl(220 8% 11%)" }}
          >
            {/* File header */}
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{ background: "hsl(220 8% 12%)", borderBottom: "1px solid hsl(220 13% 18%)" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium" style={{ color: "hsl(210 20% 72%)" }}>chatgpt-code.js</span>
                <span className="text-xs font-semibold" style={{ color: "rgb(250,204,21)" }}>JavaScript</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(220,38,38,0.18)", color: "rgb(248,113,113)", animation: "heroErrorPulse 2.5s ease-in-out infinite" }}>1 error</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(234,179,8,0.14)", color: "rgb(253,224,71)", animation: "heroWarningPulse 2.5s ease-in-out infinite 0.5s" }}>1 warning</span>
              </div>
            </div>

            {/* Status strip */}
            <div className="flex items-center gap-1 px-4 py-1.5" style={{ borderBottom: "1px solid hsl(220 13% 18%)", background: "hsl(220 8% 10%)" }}>
              <span className="text-xs font-semibold" style={{ color: "hsl(142 71% 55%)" }}>✓ Pasted</span>
              <span className="text-xs" style={{ color: "hsl(215 16% 38%)" }}>→</span>
              <span className="text-xs font-semibold" style={{ color: "hsl(262 83% 75%)" }}>✓ Checked</span>
              <span className="text-xs" style={{ color: "hsl(215 16% 38%)" }}>→</span>
              <span className="text-xs font-semibold" style={{ color: "hsl(210 20% 78%)" }}>Explained</span>
              <div className="flex-1 ml-2 h-1 rounded-full overflow-hidden" style={{ background: "hsl(220 13% 20%)" }}>
                <div style={{ height: "100%", width: "100%", background: "linear-gradient(90deg, hsl(142 71% 45%), hsl(262 83% 75%))", animation: "heroStepProgress 3s ease-in-out infinite" }} />
              </div>
            </div>

            {/* Code lines */}
            <div style={{ fontFamily: "var(--app-font-mono)", fontSize: "12.5px", lineHeight: "1.7" }}>

              {/* Line 1 — normal */}
              <div className="flex" style={{ borderLeft: "3px solid transparent", animation: "heroLineReveal 0.4s ease-out 0.2s both" }}>
                <span className="select-none text-right shrink-0 px-3 py-0.5" style={{ color: "hsl(215 14% 35%)", minWidth: "42px" }}>1</span>
                <span className="whitespace-pre py-0.5" style={{ color: "hsl(210 20% 82%)" }}>{"const API_KEY = \"sk-abc123realkey\";"}</span>
              </div>

              {/* Line 2 — error */}
              <div className="flex" style={{ background: "rgba(220,38,38,0.14)", borderLeft: "3px solid rgb(220,38,38)", animation: "heroLineReveal 0.4s ease-out 0.6s both" }}>
                <span className="select-none text-right shrink-0 px-3 py-0.5" style={{ color: "hsl(215 14% 35%)", minWidth: "42px" }}>2</span>
                <span className="whitespace-pre py-0.5 flex-1" style={{ color: "rgb(252,165,165)" }}>{""}</span>
                <span className="shrink-0 px-2 py-0.5 self-center text-xs" style={{ color: "rgba(252,165,165,0.6)", fontFamily: "var(--app-font-sans)" }}>›</span>
              </div>
              {/* Error explanation */}
              <div style={{ background: "rgba(220,38,38,0.07)", borderLeft: "3px solid rgba(220,38,38,0.45)", animation: "heroLineReveal 0.4s ease-out 0.8s both" }}>
                <div className="px-3 py-1 text-xs flex items-start gap-1.5" style={{ fontFamily: "var(--app-font-sans)", color: "rgb(252,165,165)" }}>
                  <span className="mt-px shrink-0">✕</span>
                  <span style={{ opacity: 0.9 }}>{"Possible hardcoded secret detected — move API_KEY to an environment variable."}</span>
                </div>
              </div>

              {/* Line 3 — normal */}
              <div className="flex" style={{ borderLeft: "3px solid transparent", animation: "heroLineReveal 0.4s ease-out 1.0s both" }}>
                <span className="select-none text-right shrink-0 px-3 py-0.5" style={{ color: "hsl(215 14% 35%)", minWidth: "42px" }}>3</span>
                <span className="whitespace-pre py-0.5" style={{ color: "hsl(210 20% 82%)" }}>{"async function getUser(id) {"}</span>
              </div>

              {/* Line 4 — warning */}
              <div className="flex" style={{ background: "rgba(234,179,8,0.10)", borderLeft: "3px solid rgb(234,179,8)", animation: "heroLineReveal 0.4s ease-out 1.4s both" }}>
                <span className="select-none text-right shrink-0 px-3 py-0.5" style={{ color: "hsl(215 14% 35%)", minWidth: "42px" }}>4</span>
                <span className="whitespace-pre py-0.5 flex-1" style={{ color: "rgb(253,224,71)" }}>{"  const res = fetch(\"/api/users/\" + id);"}</span>
                <span className="shrink-0 px-2 py-0.5 self-center text-xs" style={{ color: "rgba(253,224,71,0.6)", fontFamily: "var(--app-font-sans)" }}>›</span>
              </div>
              {/* Warning explanation */}
              <div style={{ background: "rgba(234,179,8,0.06)", borderLeft: "3px solid rgba(234,179,8,0.45)", animation: "heroLineReveal 0.4s ease-out 1.6s both" }}>
                <div className="px-3 py-1 text-xs flex items-start gap-1.5" style={{ fontFamily: "var(--app-font-sans)", color: "rgb(253,224,71)" }}>
                  <span className="mt-px shrink-0">⚠</span>
                  <span style={{ opacity: 0.9 }}>{"'fetch()' is called without 'await' inside an async function — the response will be a Promise, not the data you expect."}</span>
                </div>
              </div>

            </div>
          </div>
          </div>

          <div className="md:max-w-md">
          <button
            type="button"
            onClick={() => navigate("/check")}
            className="w-full rounded-2xl py-4 text-base font-bold tracking-wide transition-all duration-150 active:scale-[0.97] mb-3"
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
            style={{ color: "hsl(215 16% 58%)" }}
          >
            Free — no sign-up, no install, runs in your browser.
          </p>
          <p
            className="text-xs text-center mt-1"
            style={{ color: "hsl(215 16% 52%)" }}
          >
            🔒 Your code never leaves your browser.
          </p>
          </div>

          {/* Trust strip */}
          <div className="md:col-span-2 mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {[
              { icon: "⚡", label: "Instant results" },
              { icon: "🔒", label: "No code upload" },
              { icon: "🌐", label: "5 languages" },
              { icon: "✨", label: "No sign-up" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className="text-xs">{item.icon}</span>
                <span className="text-xs font-medium" style={{ color: "hsl(215 16% 58%)" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </main>

        {/* Pro section */}
        <div className="pb-6 flex flex-col gap-3">
          <div
            className="rounded-2xl px-5 py-6 flex flex-col gap-5"
            style={{
              background: "linear-gradient(135deg, hsl(220 8% 15%) 0%, hsl(220 8% 13%) 100%)",
              border: "1px solid hsla(262,83%,75%,0.35)",
              boxShadow: "0 0 24px hsla(262,83%,75%,0.12), inset 0 1px 0 hsla(262,83%,75%,0.08)",
            }}
          >
            {/* Badge + headline */}
            <div className="flex flex-col gap-2">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full self-start"
                style={{
                  background: "hsl(262 83% 75%)",
                  color: "hsl(220 8% 6%)",
                  animation: "probadgepulse 2.5s ease-in-out 3",
                }}
              >PRO</span>
              <h2 className="text-lg font-extrabold leading-snug" style={{ color: "hsl(210 20% 95%)" }}>
                Stop checking the same file twice.
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(215 16% 68%)" }}>
                Pro gives you a persistent workspace — check multiple files at once, save results to named collections, and share any check with a permanent link. Everything synced across your devices.
              </p>
            </div>

            {/* Features */}
            <div className="flex flex-col gap-3">
              {[
                {
                  icon: "📂",
                  label: "Multi-file mode",
                  desc: "Check up to 5 files in one session. Per-file results, summary bar, no copy-pasting between tabs.",
                },
                {
                  icon: "📁",
                  label: "Saved collections",
                  desc: "Save any check to a named collection. Synced across devices via your account — nothing lost when you close the tab.",
                },
                {
                  icon: "🔗",
                  label: "Shareable links",
                  desc: "Generate a permanent URL for any result. Send it to a teammate or bookmark it for later.",
                },
                {
                  icon: "🕓",
                  label: "Full check history",
                  desc: "Free users get 5 saved checks. Pro keeps up to 100 — so your last session is always one tap away.",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <span className="text-xs font-semibold" style={{ color: "hsl(210 20% 88%)" }}>{item.label}</span>
                    <span className="text-xs" style={{ color: "hsl(215 16% 62%)" }}> — {item.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing proof */}
            <div
              className="rounded-xl px-4 py-3 flex flex-col gap-1"
              style={{ background: "hsla(262,83%,75%,0.07)", border: "1px solid hsla(262,83%,75%,0.15)" }}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold" style={{ color: "hsl(262 83% 75%)" }}>£35 / year</span>
                <span className="text-xs" style={{ color: "hsl(215 16% 58%)" }}>less than 68p a week</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold" style={{ color: "hsl(210 20% 75%)" }}>£4 / month</span>
                <span className="text-xs" style={{ color: "hsl(215 16% 58%)" }}>cancel any time</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleCheckout("annual")}
                className="w-full rounded-xl py-3 text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
                style={{
                  background: "hsl(262 83% 75%)",
                  color: "hsl(220 8% 6%)",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 0 16px hsla(262,83%,75%,0.3)",
                }}
              >
                Get Pro — £35/year <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "hsl(220 8% 20%)", background: "hsla(45,90%,50%,0.2)", padding: "2px 6px", borderRadius: "4px", marginLeft: "4px" }}>SAVE £13</span>
              </button>
              <button
                type="button"
                onClick={() => handleCheckout("monthly")}
                className="w-full rounded-xl py-3 text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
                style={{
                  background: "hsl(220 8% 15%)",
                  color: "hsl(262 83% 75%)",
                  border: "1px solid hsla(262,83%,75%,0.35)",
                  cursor: "pointer",
                }}
              >
                Get Pro — £4/month
              </button>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="pb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
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
                  style={{ color: "hsl(215 16% 68%)" }}
                >
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      {/* Footer */}
        <Footer />

      </div>
    </div>
  );
}