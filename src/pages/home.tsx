import { useState, useRef } from "react";
import { lint, detectLanguage, type LintResult, type Language } from "@/lib/linter";
import FeedbackForm from "@/components/FeedbackForm";

const LANG_LABELS: Record<Exclude<Language, "unknown">, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  html: "HTML",
};

const LANG_COLOR: Record<Exclude<Language, "unknown">, string> = {
  javascript: "rgb(250,204,21)",
  typescript: "rgb(49,168,172)",
  python: "rgb(96,165,250)",
  html: "rgb(251,146,60)",
};

export default function Home() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<LintResult | null>(null);
  const [checked, setChecked] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [inputError, setInputError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const errorCount = result?.lines.filter((l) => l.type === "error").length ?? 0;
  const warningCount = result?.lines.filter((l) => l.type === "warning").length ?? 0;

  function handleCodeChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setCode(e.target.value);
    if (inputError) setInputError(null);
  }

  function handleCheck() {
    if (!code.trim()) {
      setInputError("Please paste some code first");
      return;
    }
    if (detectLanguage(code) === "unknown") {
      setInputError("No code detected — please paste JavaScript, Python or HTML code.");
      return;
    }
    const r = lint(code);
    setResult(r);
    setChecked(true);
    setExpanded(new Set());
    setInputError(null);
  }

  function handleReset() {
    setCode("");
    setResult(null);
    setChecked(false);
    setExpanded(new Set());
    setInputError(null);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function toggleExpanded(idx: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  return (
    <div className="min-h-screen w-full" style={{ background: "hsl(222 16% 10%)" }}>
      <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-8">

        <header className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-flex items-center justify-center rounded-lg w-8 h-8 text-sm font-bold"
              style={{ background: "hsl(210 80% 60%)", color: "hsl(222 16% 6%)" }}
            >
              P
            </span>
            <h1
              className="text-xl font-bold tracking-tight"
              style={{ color: "hsl(210 20% 92%)", fontFamily: "var(--app-font-sans)" }}
            >
              PasteCheck
            </h1>
          </div>
          <p className="text-sm" style={{ color: "hsl(215 14% 55%)" }}>
            Paste your code and check for errors and warnings instantly.
          </p>
        </header>

        {!checked ? (
          <div className="flex flex-col gap-4">
            <div
              className="rounded-xl overflow-hidden border"
              style={{ borderColor: "hsl(220 13% 22%)" }}
            >
              <div
                className="flex items-center justify-between px-4 py-2 border-b"
                style={{
                  background: "hsl(222 16% 13%)",
                  borderColor: "hsl(220 13% 22%)",
                }}
              >
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "hsl(215 14% 45%)" }}>
                  Code
                </span>
                {code.length > 0 && (
                  <span className="text-xs" style={{ color: "hsl(215 14% 45%)" }}>
                    {code.split("\n").length} lines
                  </span>
                )}
              </div>
              <textarea
                ref={textareaRef}
                value={code}
                onChange={handleCodeChange}
                placeholder={"// Paste your code here...\nfunction example() {\n  var x = undefined\n  if (x == null) {\n    console.log('warning!')\n  }\n}"}
                rows={16}
                autoFocus
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
                className="w-full resize-none outline-none text-sm leading-relaxed px-4 py-3"
                style={{
                  background: "hsl(222 16% 12%)",
                  color: "hsl(210 20% 88%)",
                  fontFamily: "var(--app-font-mono)",
                  caretColor: "hsl(210 80% 60%)",
                  fontSize: "13px",
                  lineHeight: "1.7",
                }}
              />
            </div>

            {inputError && (
              <div
                className="rounded-xl px-4 py-3 text-sm flex items-center gap-2"
                style={{
                  background: "rgba(234,179,8,0.08)",
                  border: "1px solid rgba(234,179,8,0.25)",
                  color: "rgb(253,224,71)",
                }}
              >
                <span className="shrink-0">⚠</span>
                <span>{inputError}</span>
              </div>
            )}

            <button
              onClick={handleCheck}
              disabled={!code.trim()}
              className="w-full rounded-xl py-3.5 text-sm font-semibold tracking-wide transition-all duration-150 active:scale-[0.98]"
              style={{
                background: code.trim() ? "hsl(210 80% 60%)" : "hsl(220 13% 20%)",
                color: code.trim() ? "hsl(222 16% 6%)" : "hsl(215 14% 40%)",
                cursor: code.trim() ? "pointer" : "not-allowed",
                border: "none",
              }}
            >
              Check Code
            </button>
            <FeedbackForm />
          </div>
        ) : (
          <div className="flex flex-col gap-4">

            <div className="flex items-center justify-between">
              <div className="flex gap-3 flex-1">
                <div
                  className="flex-1 rounded-xl px-4 py-3 flex flex-col items-center justify-center"
                  style={{ background: "rgba(220, 38, 38, 0.12)", border: "1px solid rgba(220,38,38,0.25)" }}
                >
                  <span className="text-2xl font-bold" style={{ color: "rgb(248,113,113)" }}>
                    {errorCount}
                  </span>
                  <span className="text-xs mt-0.5" style={{ color: "rgb(248,113,113)", opacity: 0.85 }}>
                    {errorCount === 1 ? "Error" : "Errors"}
                  </span>
                </div>
                <div
                  className="flex-1 rounded-xl px-4 py-3 flex flex-col items-center justify-center"
                  style={{ background: "rgba(234,179,8,0.10)", border: "1px solid rgba(234,179,8,0.22)" }}
                >
                  <span className="text-2xl font-bold" style={{ color: "rgb(253,224,71)" }}>
                    {warningCount}
                  </span>
                  <span className="text-xs mt-0.5" style={{ color: "rgb(253,224,71)", opacity: 0.85 }}>
                    {warningCount === 1 ? "Warning" : "Warnings"}
                  </span>
                </div>
              </div>

              {result && result.language !== "unknown" && (
                <div
                  className="ml-3 rounded-xl px-3 py-2 flex flex-col items-center justify-center shrink-0"
                  style={{ background: "hsl(220 13% 16%)", border: "1px solid hsl(220 13% 24%)" }}
                >
                  <span
                    className="text-xs font-semibold"
                    style={{ color: LANG_COLOR[result.language] }}
                  >
                    {LANG_LABELS[result.language]}
                  </span>
                  <span className="text-xs mt-0.5" style={{ color: "hsl(215 14% 45%)" }}>
                    detected
                  </span>
                </div>
              )}
            </div>

            {errorCount === 0 && warningCount === 0 && (
              <div
                className="rounded-xl px-4 py-3 text-sm text-center"
                style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.2)", color: "rgb(134,239,172)" }}
              >
                No issues found — looks clean!
              </div>
            )}

            {(errorCount > 0 || warningCount > 0) && (
              <p className="text-xs text-center" style={{ color: "hsl(215 14% 42%)" }}>
                Tap a highlighted line to see details
              </p>
            )}

            <div
              className="rounded-xl overflow-hidden border"
              style={{ borderColor: "hsl(220 13% 22%)" }}
            >
              <div
                className="flex items-center justify-between px-4 py-2 border-b"
                style={{
                  background: "hsl(222 16% 13%)",
                  borderColor: "hsl(220 13% 22%)",
                }}
              >
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "hsl(215 14% 45%)" }}>
                  Results
                </span>
                <span className="text-xs" style={{ color: "hsl(215 14% 45%)" }}>
                  {result!.lines.length} lines
                </span>
              </div>

              <div
                className="overflow-x-auto overflow-y-auto"
                style={{
                  background: "hsl(222 16% 12%)",
                  maxHeight: "420px",
                  fontFamily: "var(--app-font-mono)",
                  fontSize: "12.5px",
                  lineHeight: "1.7",
                }}
              >
                {result!.lines.map((line, i) => {
                  const isFlagged = line.type !== "normal" && line.messages.length > 0;
                  const isOpen = expanded.has(i);

                  return (
                    <div key={i}>
                      <div
                        onClick={isFlagged ? () => toggleExpanded(i) : undefined}
                        className="flex gap-0 px-0"
                        style={{
                          background:
                            line.type === "error"
                              ? "rgba(220,38,38,0.14)"
                              : line.type === "warning"
                              ? "rgba(234,179,8,0.10)"
                              : "transparent",
                          borderLeft:
                            line.type === "error"
                              ? "3px solid rgb(220,38,38)"
                              : line.type === "warning"
                              ? "3px solid rgb(234,179,8)"
                              : "3px solid transparent",
                          cursor: isFlagged ? "pointer" : "default",
                          WebkitTapHighlightColor: "transparent",
                        }}
                      >
                        <span
                          className="select-none text-right shrink-0 px-3 py-0.5"
                          style={{
                            color: "hsl(215 14% 35%)",
                            minWidth: "42px",
                            userSelect: "none",
                          }}
                        >
                          {i + 1}
                        </span>
                        <span
                          className="whitespace-pre py-0.5 flex-1"
                          style={{
                            color:
                              line.type === "error"
                                ? "rgb(252,165,165)"
                                : line.type === "warning"
                                ? "rgb(253,224,71)"
                                : "hsl(210 20% 82%)",
                          }}
                        >
                          {line.text || " "}
                        </span>
                        {isFlagged && (
                          <span
                            className="shrink-0 px-2 py-0.5 self-center text-xs"
                            style={{
                              color:
                                line.type === "error"
                                  ? "rgba(252,165,165,0.6)"
                                  : "rgba(253,224,71,0.6)",
                              fontFamily: "var(--app-font-sans)",
                              transition: "transform 0.15s",
                              display: "inline-block",
                              transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                            }}
                          >
                            ›
                          </span>
                        )}
                      </div>

                      {isFlagged && isOpen && (
                        <div
                          style={{
                            background:
                              line.type === "error"
                                ? "rgba(220,38,38,0.07)"
                                : "rgba(234,179,8,0.06)",
                            borderLeft:
                              line.type === "error"
                                ? "3px solid rgba(220,38,38,0.45)"
                                : "3px solid rgba(234,179,8,0.45)",
                          }}
                        >
                          {line.messages.map((msg, mi) => (
                            <div
                              key={mi}
                              className="px-3 py-1 text-xs flex items-start gap-1.5"
                              style={{
                                fontFamily: "var(--app-font-sans)",
                                color:
                                  line.type === "error"
                                    ? "rgb(252,165,165)"
                                    : "rgb(253,224,71)",
                              }}
                            >
                              <span className="mt-px shrink-0">
                                {line.type === "error" ? "✕" : "⚠"}
                              </span>
                              <span style={{ opacity: 0.9 }}>{msg}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full rounded-xl py-3.5 text-sm font-semibold tracking-wide transition-all duration-150 active:scale-[0.98]"
              style={{
                background: "hsl(220 13% 20%)",
                color: "hsl(210 20% 75%)",
                border: "1px solid hsl(220 13% 26%)",
                cursor: "pointer",
              }}
            >
              Check New Code
            </button>
            <FeedbackForm />
          </div>
        )}
      </div>
    </div>
  );
}
