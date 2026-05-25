import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import NavMenu from "@/components/NavMenu";
import Logo from "@/components/Logo";

export default function About() {
  const [, navigate] = useLocation();

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ background: "hsl(222 16% 10%)" }}
    >
      <Helmet>
        <title>What is a Syntax Error? How PasteCheck Finds & Explains Code Errors</title>
        <meta name="description" content="Learn what syntax errors are in JavaScript, Python, HTML and CSS — and how PasteCheck finds them instantly in your browser. No sign-up, no installs, works on mobile." />
        <meta property="og:title" content="What is a Syntax Error? How PasteCheck Finds & Explains Code Errors" />
        <meta property="og:description" content="Learn what syntax errors are in JavaScript, Python, HTML and CSS — and how PasteCheck finds them instantly in your browser. No sign-up, no installs, works on mobile." />
        <meta property="og:image" content="/opengraph.jpg" />
      </Helmet>
      <div className="mx-auto w-full max-w-2xl px-5 flex flex-col flex-1">
        <NavMenu />

        {/* Nav */}
        <div className="pt-8 flex items-center justify-between">
          <Logo size="sm" onClick={() => navigate("/")} />
          <button
            type="button"
            onClick={() => navigate("/check")}
            className="rounded-xl px-4 py-2 text-sm font-bold"
            style={{ background: "hsl(210 80% 60%)", color: "hsl(222 16% 6%)", border: "none", cursor: "pointer" }}
          >
            Check My Code
          </button>
        </div>

        {/* Main Content */}
        <div className="py-14 flex flex-col gap-10">

          <div>
            <h1
              className="text-3xl font-extrabold leading-tight tracking-tight mb-4"
              style={{ color: "hsl(210 20% 95%)" }}
            >
              What Is a Syntax Error — and How Do You Fix One?
            </h1>
            <p className="text-base leading-relaxed" style={{ color: "hsl(215 14% 58%)" }}>
              A syntax error means your code has broken the rules of the language — a missing bracket, a wrong indent, an unclosed tag. The interpreter can't read it, so nothing runs. PasteCheck is a free browser-based tool that finds syntax errors in JavaScript, TypeScript, Python, HTML and CSS instantly — and explains each one in plain English so you know exactly what to fix and why.
            </p>
          </div>

          <div>
            <h2
              className="text-xl font-bold mb-3"
              style={{ color: "hsl(210 20% 92%)" }}
            >
              Why PasteCheck exists
            </h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: "hsl(215 14% 58%)" }}>
              I built PasteCheck entirely on an Android phone. No laptop, no desktop — just a mobile browser, a GitHub repo, and a lot of frustration at tools that assumed I was sitting at a desk.
            </p>
            <p className="text-base leading-relaxed mb-4" style={{ color: "hsl(215 14% 58%)" }}>
              Every time I pasted broken code into an AI assistant to check it, I got something back that was subtly different — reformatted, partially rewritten, or quietly broken in a new way. I didn't want my code changed. I wanted to know what was wrong with it and why, so I could fix it myself and actually understand what I'd done.
            </p>
            <p className="text-base leading-relaxed mb-4" style={{ color: "hsl(215 14% 58%)" }}>
              PasteCheck runs dedicated language parsers directly on your code — nothing is sent to an AI, nothing is rewritten. You get precise error locations, plain-English explanations, and a nudge toward understanding the mistake rather than just patching it.
            </p>
            <p className="text-base leading-relaxed" style={{ color: "hsl(215 14% 58%)" }}>
              It doesn't auto-fix. That's deliberate. The goal is to help you understand what broke and why — so you learn when you make the mistake, not when it reaches production.
            </p>
          </div>

          <div>
            <h2
              className="text-xl font-bold mb-3"
              style={{ color: "hsl(210 20% 92%)" }}
            >
              What PasteCheck Checks
            </h2>
            <div className="flex flex-col gap-3">
              {[
                { lang: "JavaScript", detail: "Syntax errors, undeclared variables, unsafe patterns like eval and with, and code quality warnings including var usage and loose equality checks." },
                { lang: "TypeScript", detail: "Full TypeScript syntax support including type annotations, interfaces, generics, and TS-specific constructs — detected and linted separately from JavaScript." },
                { lang: "Python", detail: "Syntax errors including missing colons, unclosed brackets, and malformed function definitions. Detected using a dedicated Python parser." },
                { lang: "HTML", detail: "Unclosed tags, mismatched nesting, duplicate IDs, deprecated elements, void element misuse, missing accessibility labels, and embedded JavaScript and CSS errors." },
                { lang: "CSS", detail: "Unknown and misspelled properties with 'did you mean' suggestions, !important overuse warnings, and unresolved TODO/FIXME comments. Works on standalone CSS and embedded style blocks." },
              ].map((item) => (
                <div
                  key={item.lang}
                  className="rounded-2xl px-5 py-4"
                  style={{ background: "hsl(222 16% 14%)", border: "1px solid hsl(220 13% 21%)" }}
                >
                  <p className="text-sm font-semibold mb-1" style={{ color: "hsl(210 80% 65%)" }}>{item.lang}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "hsl(215 14% 52%)" }}>{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2
              className="text-xl font-bold mb-3"
              style={{ color: "hsl(210 20% 92%)" }}
            >
              How It Works
            </h2>
            <div className="flex flex-col gap-3">
              {[
                { step: "1", title: "Paste your code", detail: "Copy any JavaScript, TypeScript, Python, HTML, or CSS snippet and paste it into the text area." },
                { step: "2", title: "Hit Check Code", detail: "PasteCheck automatically detects the language and runs the appropriate parser instantly." },
                { step: "3", title: "See every error highlighted", detail: "Errors glow red, warnings glow yellow. Tap any highlighted line for a plain-English explanation of what broke and why — not just where." },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-4 rounded-2xl px-5 py-4"
                  style={{ background: "hsl(222 16% 14%)", border: "1px solid hsl(220 13% 21%)" }}
                >
                  <span
                    className="shrink-0 inline-flex items-center justify-center rounded-xl w-8 h-8 text-sm font-bold"
                    style={{ background: "hsl(210 80% 60%)", color: "hsl(222 16% 6%)" }}
                  >
                    {item.step}
                  </span>
                  <div>
                    <p className="text-sm font-semibold mb-0.5" style={{ color: "hsl(210 20% 90%)" }}>{item.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "hsl(215 14% 52%)" }}>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2
              className="text-xl font-bold mb-3"
              style={{ color: "hsl(210 20% 92%)" }}
            >
              Frequently Asked Questions
            </h2>
            <div className="flex flex-col gap-3">
              {[
                { q: "Is PasteCheck free?", a: "The core tool is completely free — no sign-up, no installs, no limits on checks. A Pro tier is available at £4/month which unlocks multi-file mode, shareable check links, and saved collections across devices." },
                { q: "Does it work on mobile?", a: "Yes. PasteCheck is built mobile-first and works on any Android or iOS browser." },
                { q: "Is my code stored or sent anywhere?", a: "No. All checking happens locally in your browser. Your code never leaves your device." },
                { q: "Which languages are supported?", a: "JavaScript, TypeScript, Python, HTML, and CSS — including embedded scripts and style blocks inside HTML." },
                { q: "How is this different from pasting into ChatGPT or Claude?", a: "AI assistants are inconsistent — they sometimes miss errors, reformat your code, or introduce new bugs. PasteCheck uses dedicated language parsers that give precise, reliable results every time." },
                { q: "Does it just find errors or does it explain them?", a: "Both. Every flagged line includes a plain-English description of what's wrong and why — not just a line number. The goal is to help you understand the mistake, not just locate it." },
              ].map((item) => (
                <div
                  key={item.q}
                  className="rounded-2xl px-5 py-4"
                  style={{ background: "hsl(222 16% 14%)", border: "1px solid hsl(220 13% 21%)" }}
                >
                  <p className="text-sm font-semibold mb-1" style={{ color: "hsl(210 20% 90%)" }}>{item.q}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "hsl(215 14% 52%)" }}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: "hsl(210 20% 92%)" }}>
              PasteCheck Pro
            </h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: "hsl(215 14% 58%)" }}>
              The free tier gives you instant single-file checking with no account needed. Pro unlocks the full suite for developers who check code regularly across multiple files and projects.
            </p>
            <div className="flex flex-col gap-3 mb-4">
              {[
                { icon: "📂", title: "Multi-file mode", detail: "Paste up to 5 named files and check them all at once. Results shown per-file with individual error and warning counts." },
                { icon: "🔗", title: "Shareable check links", detail: "Generate a permanent URL for any result. Share it with a teammate, a tutor, or a Stack Overflow thread. Recipients see the full result read-only." },
                { icon: "📁", title: "Saved collections", detail: "Save any check to a named collection — 'Project Alpha', 'cs50 homework', anything. Access your saved checks from any device." },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl px-5 py-4"
                  style={{ background: "hsl(222 16% 14%)", border: "1px solid hsl(210 80% 60% / 0.2)" }}
                >
                  <p className="text-sm font-semibold mb-1" style={{ color: "hsl(210 80% 65%)" }}>
                    {item.icon} {item.title}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "hsl(215 14% 52%)" }}>{item.detail}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-center mb-6" style={{ color: "hsl(215 14% 42%)" }}>
              £4/month · Cancel anytime · No price increases
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/check")}
            className="w-full rounded-2xl py-4 text-base font-bold tracking-wide transition-all duration-150 active:scale-[0.97]"
            style={{
              background: "hsl(210 80% 60%)",
              color: "hsl(222 16% 6%)",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 32px hsla(210,80%,60%,0.25)",
            }}
          >
            Check My Code — It's Free
          </button>

        </div>
      </div>
    </div>
  );
}