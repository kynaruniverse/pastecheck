import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";

export default function About() {
  const [, navigate] = useLocation();

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ background: "hsl(222 16% 10%)" }}
    >
      <Helmet>
        <title>About PasteCheck — How It Works & Supported Languages</title>
        <meta name="description" content="Learn how PasteCheck checks JavaScript, TypeScript, Python and HTML for errors instantly. Free online linter that works on mobile with no sign-up required." />
        <meta property="og:title" content="About PasteCheck — How It Works & Supported Languages" />
        <meta property="og:description" content="Learn how PasteCheck checks JavaScript, TypeScript, Python and HTML for errors instantly. Free online linter that works on mobile with no sign-up required." />
      </Helmet>
      <div className="mx-auto w-full max-w-2xl px-5 flex flex-col flex-1">

        {/* Nav */}
        <div className="pt-8 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
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
          <button
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
              Free Online Code Error Checker
            </h1>
            <p className="text-base leading-relaxed" style={{ color: "hsl(215 14% 58%)" }}>
              PasteCheck is a free online JavaScript linter, Python syntax checker, and HTML validator — all in one place. Paste your code and see every error and warning highlighted instantly, with no sign-up required and no installations needed. Works directly in your browser, including on mobile devices.
            </p>
          </div>

          <div>
            <h2
              className="text-xl font-bold mb-3"
              style={{ color: "hsl(210 20% 92%)" }}
            >
              Why PasteCheck?
            </h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: "hsl(215 14% 58%)" }}>
              Most developers have pasted broken code into an AI assistant hoping it will catch errors — only to get inconsistent results, reformatted code, or new bugs introduced. PasteCheck solves that by running dedicated language parsers directly on your code, giving you precise, reliable error locations every time.
            </p>
            <p className="text-base leading-relaxed" style={{ color: "hsl(215 14% 58%)" }}>
              Built specifically with mobile developers in mind, PasteCheck works seamlessly on Android and iOS — no desktop required.
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
                { step: "1", title: "Paste your code", detail: "Copy any JavaScript, TypeScript, Python, or HTML snippet and paste it into the text area." },
                { step: "2", title: "Hit Check Code", detail: "PasteCheck automatically detects the language and runs the appropriate parser instantly." },
                { step: "3", title: "See every error highlighted", detail: "Errors glow red, warnings glow yellow. Tap any highlighted line for a plain-English explanation." },
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
                { q: "Is PasteCheck free?", a: "Yes, completely free. No sign-up, no payment, no limits." },
                { q: "Does it work on mobile?", a: "Yes. PasteCheck is built mobile-first and works on any Android or iOS browser." },
                { q: "Is my code stored or sent anywhere?", a: "No. All checking happens locally in your browser. Your code never leaves your device." },
                { q: "Which languages are supported?", a: "JavaScript, TypeScript, Python, and HTML — including embedded scripts and styles inside HTML." },
                { q: "How is this different from pasting into ChatGPT or Claude?", a: "AI assistants are inconsistent — they sometimes miss errors, reformat your code, or introduce new bugs. PasteCheck uses dedicated language parsers that give precise, reliable results every time." },
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

          <button
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