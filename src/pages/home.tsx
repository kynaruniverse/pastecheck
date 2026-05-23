import { useState, useRef } from "react";
import { lint, detectLanguage, type LintResult, type Language } from "@/lib/linter";
import FeedbackForm from "@/components/FeedbackForm";

const LANG_LABELS: Record<Exclude<Language, "unknown">, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  html: "HTML",
  css: "CSS",
};

const LANG_COLOR: Record<Exclude<Language, "unknown">, string> = {
  javascript: "rgb(250,204,21)",
  typescript: "rgb(49,168,172)",
  python: "rgb(96,165,250)",
  html: "rgb(251,146,60)",
  css: "rgb(139,92,246)",
};

const SURVEY_OPTIONS = [
  "Learning to code",
  "Debugging my own project",
  "Checking AI generated code",
  "Something else",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface FileEntry {
  id: string;
  name: string;
  code: string;
}

interface FileResult {
  id: string;
  name: string;
  code: string;
  result: LintResult;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

function makeFile(name = ""): FileEntry {
  return { id: makeId(), name, code: "" };
}

// ─── Pro gate ─────────────────────────────────────────────────────────────────

function getIsPro(): boolean {
  try {
    return localStorage.getItem("pastecheck_pro") === "true";
  } catch {
    return false;
  }
}

function setProMode(value: boolean) {
  try {
    localStorage.setItem("pastecheck_pro", String(value));
  } catch {}
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InAppSurvey({ onDismiss }: { onDismiss: () => void }) {
  function handleOption(option: string) {
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "survey_response", {
        event_category: "Survey",
        event_label: option,
      });
    }
    onDismiss();
  }

  return (
    <div
      className="rounded-xl px-4 py-4 flex flex-col gap-3"
      style={{ background: "hsl(222 16% 13%)", border: "1px solid hsl(220 13% 26%)" }}
    >
      <p className="text-xs font-medium text-center" style={{ color: "hsl(210 20% 72%)" }}>
        Quick question — what are you using PasteCheck for?
      </p>
      <div className="flex flex-col gap-2">
        {SURVEY_OPTIONS.map((option) => (
          <button
            key={option}
            onClick={() => handleOption(option)}
            className="w-full rounded-lg py-2 text-xs font-medium transition-all duration-150 active:scale-[0.98]"
            style={{
              background: "hsl(220 13% 18%)",
              color: "hsl(210 20% 72%)",
              border: "1px solid hsl(220 13% 26%)",
              cursor: "pointer",
            }}
          >
            {option}
          </button>
        ))}
      </div>
      <button
        onClick={onDismiss}
        className="text-xs text-center"
        style={{ background: "none", border: "none", color: "hsl(215 14% 40%)", cursor: "pointer" }}
      >
        Skip
      </button>
    </div>
  );
}

function DebugNudge({ errorCount, warningCount }: { errorCount: number; warningCount: number }) {
  const [open, setOpen] = useState(false);
  const bullets: string[] = [];

  if (errorCount > 0) {
    bullets.push("Fix the first error before worrying about the rest — errors cascade. One missing bracket can cause several false positives below it.");
    bullets.push("After each fix, run the check again. Don't try to fix everything at once.");
  }
  if (errorCount === 0 && warningCount > 0) {
    bullets.push("No errors — good. Warnings won't stop your code running but they signal habits that cause bugs later.");
    bullets.push("Work through warnings one at a time. Each one has a suggested fix in the description above.");
  }
  if (errorCount > 0 && warningCount > 0) {
    bullets.push("Ignore the warnings for now — fix the errors first. Warnings can wait until your code runs.");
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "hsl(222 16% 13%)", border: "1px solid hsl(220 13% 26%)" }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ background: "none", border: "none", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
      >
        <span className="text-xs font-medium" style={{ color: "hsl(210 20% 72%)" }}>🛠 What to do next</span>
        <span
          className="text-xs"
          style={{
            color: "hsl(215 14% 45%)",
            display: "inline-block",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        >›</span>
      </button>
      {open && (
        <div className="px-4 pb-4 flex flex-col gap-2" style={{ borderTop: "1px solid hsl(220 13% 20%)" }}>
          {bullets.map((b, i) => (
            <div key={i} className="flex items-start gap-2 pt-2">
              <span style={{ color: "hsl(210 80% 60%)", fontSize: "10px", marginTop: "2px" }}>●</span>
              <span className="text-xs" style={{ color: "hsl(210 20% 65%)", lineHeight: "1.6" }}>{b}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultRating({ language, errorCount, warningCount }: { language: string; errorCount: number; warningCount: number }) {
  const [rated, setRated] = useState<"up" | "down" | null>(null);

  function handleRate(value: "up" | "down") {
    if (rated) return;
    setRated(value);
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "result_rated", {
        event_category: "Feedback",
        event_label: value,
        event_value: value === "up" ? 1 : 0,
        language,
        error_count: errorCount,
        warning_count: warningCount,
      });
    }
  }

  if (rated) {
    return <div className="text-center text-xs py-2" style={{ color: "hsl(215 14% 45%)" }}>Thanks for the feedback</div>;
  }

  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <span className="text-xs" style={{ color: "hsl(215 14% 45%)" }}>Was this result helpful?</span>
      <button onClick={() => handleRate("up")} className="text-lg transition-opacity hover:opacity-70 active:scale-90" style={{ background: "none", border: "none", cursor: "pointer" }} aria-label="Helpful">👍</button>
      <button onClick={() => handleRate("down")} className="text-lg transition-opacity hover:opacity-70 active:scale-90" style={{ background: "none", border: "none", cursor: "pointer" }} aria-label="Not helpful">👎</button>
    </div>
  );
}

// ─── Single file result panel ─────────────────────────────────────────────────

function FileResultPanel({ fileResult, defaultOpen }: { fileResult: FileResult; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const errorCount = fileResult.result.lines.filter((l) => l.type === "error").length;
  const warningCount = fileResult.result.lines.filter((l) => l.type === "warning").length;
  const lang = fileResult.result.language;
  const isLowConfidence = fileResult.code.trim().split("\n").filter((l) => l.trim().length > 0).length < 5;

  function toggleLine(idx: number, lineType?: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
        if (typeof window !== "undefined" && typeof (window as any).gtag === "function" && lineType) {
          (window as any).gtag("event", "error_tapped", { event_category: "Engagement", event_label: lineType });
        }
      }
      return next;
    });
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid hsl(220 13% 22%)" }}
    >
      {/* File header — tap to collapse */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{
          background: "hsl(222 16% 13%)",
          border: "none",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-xs"
            style={{
              color: "hsl(215 14% 45%)",
              display: "inline-block",
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.15s",
              flexShrink: 0,
            }}
          >›</span>
          <span className="text-xs font-medium truncate" style={{ color: "hsl(210 20% 78%)" }}>
            {fileResult.name || "Untitled"}
          </span>
          {lang !== "unknown" && (
            <span
              className="text-xs font-semibold shrink-0 flex items-center gap-1"
              style={{ color: LANG_COLOR[lang as Exclude<Language, "unknown">] }}
            >
              {LANG_LABELS[lang as Exclude<Language, "unknown">]}
              {isLowConfidence && (
                <span title="Short snippet — language detection may be approximate" style={{ color: "hsl(215 14% 50%)", fontSize: "10px", fontWeight: "normal" }}>?</span>
              )}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {errorCount > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(220,38,38,0.18)", color: "rgb(248,113,113)" }}>
              {errorCount} {errorCount === 1 ? "error" : "errors"}
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(234,179,8,0.14)", color: "rgb(253,224,71)" }}>
              {warningCount} {warningCount === 1 ? "warning" : "warnings"}
            </span>
          )}
          {errorCount === 0 && warningCount === 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.12)", color: "rgb(134,239,172)" }}>
              clean
            </span>
          )}
        </div>
      </button>

      {open && (
        <div>
          {errorCount === 0 && warningCount === 0 ? (
            <div
              className="px-4 py-3 text-sm text-center"
              style={{ background: "rgba(34,197,94,0.07)", color: "rgb(134,239,172)", borderTop: "1px solid hsl(220 13% 20%)" }}
            >
              No issues found — looks clean!
            </div>
          ) : (
            <>
              <p className="text-xs text-center py-2" style={{ color: "hsl(215 14% 42%)", borderTop: "1px solid hsl(220 13% 20%)" }}>
                Tap a highlighted line to see details
              </p>
              <div
                className="overflow-x-auto"
                style={{ background: "hsl(222 16% 12%)", fontFamily: "var(--app-font-mono)", fontSize: "12.5px", lineHeight: "1.7" }}
              >
                {fileResult.result.lines.map((line, i) => {
                  const isFlagged = line.type !== "normal" && line.messages.length > 0;
                  const isOpen = expanded.has(i);
                  return (
                    <div key={i}>
                      <div
                        onClick={isFlagged ? () => toggleLine(i, line.type) : undefined}
                        className="flex gap-0 px-0"
                        style={{
                          background: line.type === "error" ? "rgba(220,38,38,0.14)" : line.type === "warning" ? "rgba(234,179,8,0.10)" : "transparent",
                          borderLeft: line.type === "error" ? "3px solid rgb(220,38,38)" : line.type === "warning" ? "3px solid rgb(234,179,8)" : "3px solid transparent",
                          cursor: isFlagged ? "pointer" : "default",
                          WebkitTapHighlightColor: "transparent",
                        }}
                      >
                        <span className="select-none text-right shrink-0 px-3 py-0.5" style={{ color: "hsl(215 14% 35%)", minWidth: "42px", userSelect: "none" }}>
                          {i + 1}
                        </span>
                        <span
                          className="whitespace-pre py-0.5 flex-1"
                          style={{ color: line.type === "error" ? "rgb(252,165,165)" : line.type === "warning" ? "rgb(253,224,71)" : "hsl(210 20% 82%)" }}
                        >
                          {line.text || " "}
                        </span>
                        {isFlagged && (
                          <span
                            className="shrink-0 px-2 py-0.5 self-center text-xs"
                            style={{
                              color: line.type === "error" ? "rgba(252,165,165,0.6)" : "rgba(253,224,71,0.6)",
                              fontFamily: "var(--app-font-sans)",
                              transition: "transform 0.15s",
                              display: "inline-block",
                              transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                            }}
                          >›</span>
                        )}
                      </div>
                      {isFlagged && isOpen && (
                        <div
                          style={{
                            background: line.type === "error" ? "rgba(220,38,38,0.07)" : "rgba(234,179,8,0.06)",
                            borderLeft: line.type === "error" ? "3px solid rgba(220,38,38,0.45)" : "3px solid rgba(234,179,8,0.45)",
                          }}
                        >
                          {line.messages.map((msg, mi) => (
                            <div
                              key={mi}
                              className="px-3 py-1 text-xs flex items-start gap-1.5"
                              style={{ fontFamily: "var(--app-font-sans)", color: line.type === "error" ? "rgb(252,165,165)" : "rgb(253,224,71)" }}
                            >
                              <span className="mt-px shrink-0">{line.type === "error" ? "✕" : "⚠"}</span>
                              <span style={{ opacity: 0.9 }}>{msg}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Home() {
  // Pro state
  const [isPro, setIsPro] = useState<boolean>(getIsPro);
  const [proMode, setProMode] = useState<"single" | "multi">("single");
  const [tapCount, setTapCount] = useState(0);
  const [proToast, setProToast] = useState<string | null>(null);
  
  // Single-file mode (free)
  const [code, setCode] = useState("");
  const [result, setResult] = useState<LintResult | null>(null);
  const [checked, setChecked] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [inputError, setInputError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Multi-file mode (pro)
  const [files, setFiles] = useState<FileEntry[]>([makeFile("File 1")]);
  const [fileResults, setFileResults] = useState<FileResult[]>([]);
  const [multiChecked, setMultiChecked] = useState(false);
  const [multiInputError, setMultiInputError] = useState<string | null>(null);

  // Shared
  const [history, setHistory] = useState<Array<{ code: string; result: LintResult }>>(() => {
    try {
      const stored = localStorage.getItem("pastecheck_history");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyDismissed, setSurveyDismissed] = useState(false);

  const errorCount = result?.lines.filter((l) => l.type === "error").length ?? 0;
  const warningCount = result?.lines.filter((l) => l.type === "warning").length ?? 0;
  const isLowConfidence = code.trim().split("\n").filter((l) => l.trim().length > 0).length < 5;

  // ── Dev toggle (tap version 5 times) ──────────────────────────────────────
  function handleVersionTap() {
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 5) {
      const newValue = !isPro;
      setProMode(newValue);
      setIsPro(newValue);
      setTapCount(0);
      const msg = newValue ? "Pro mode ON" : "Pro mode OFF";
      setProToast(msg);
      setTimeout(() => setProToast(null), 2500);
    }
  }

  // ── Single file handlers ───────────────────────────────────────────────────
  function handleCodeChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setCode(e.target.value);
    if (inputError) setInputError(null);
  }

  function handleCheck() {
    if (!code.trim()) { setInputError("Please paste some code first"); return; }
    if (detectLanguage(code) === "unknown") { setInputError("No code detected — please paste JavaScript, Python or HTML code."); return; }
    const r = lint(code);
    setResult(r);
    setChecked(true);
    setExpanded(new Set());
    setInputError(null);

    setHistory((prev) => {
      const updated = [{ code, result: r }, ...prev].slice(0, 10);
      try { localStorage.setItem("pastecheck_history", JSON.stringify(updated)); } catch {}
      const checkNumber = updated.length;
      if ([3, 5, 10].includes(checkNumber)) {
        if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
          (window as any).gtag("event", "check_milestone", { event_category: "Engagement", event_label: `check_${checkNumber}` });
        }
      }
      if (checkNumber === 3 && !surveyDismissed) setShowSurvey(true);
      return updated;
    });
  }

  function handleReset() {
    setCode("");
    setResult(null);
    setChecked(false);
    setExpanded(new Set());
    setInputError(null);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function toggleExpanded(idx: number, lineType?: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) { next.delete(idx); } else {
        next.add(idx);
        if (typeof window !== "undefined" && typeof (window as any).gtag === "function" && lineType) {
          (window as any).gtag("event", "error_tapped", { event_category: "Engagement", event_label: lineType });
        }
      }
      return next;
    });
  }

  // ── Multi-file handlers ────────────────────────────────────────────────────
  function handleAddFile() {
    if (files.length >= 5) return;
    setFiles((prev) => [...prev, makeFile(`File ${prev.length + 1}`)]);
  }

  function handleRemoveFile(id: string) {
    if (files.length <= 1) return;
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function handleFileNameChange(id: string, name: string) {
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, name } : f));
  }

  function handleFileCodeChange(id: string, code: string) {
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, code } : f));
    if (multiInputError) setMultiInputError(null);
  }

  function handleCheckAll() {
    const nonEmpty = files.filter((f) => f.code.trim());
    if (nonEmpty.length === 0) { setMultiInputError("Add some code to at least one file first"); return; }

    const unknownOnly = nonEmpty.every((f) => detectLanguage(f.code) === "unknown");
    if (unknownOnly) { setMultiInputError("No code detected — please paste JavaScript, TypeScript, Python, HTML or CSS."); return; }

    const results: FileResult[] = files.map((f) => ({
      id: f.id,
      name: f.name,
      code: f.code,
      result: f.code.trim() ? lint(f.code) : { language: "unknown" as Language, lines: [] },
    }));

    setFileResults(results);
    setMultiChecked(true);
    setMultiInputError(null);
  }

  function handleMultiReset() {
    setFiles([makeFile("File 1")]);
    setFileResults([]);
    setMultiChecked(false);
    setMultiInputError(null);
  }

  // Worst file for nudge panel (most errors, then most warnings)
  const worstFile = fileResults.length > 0
    ? [...fileResults].sort((a, b) => {
        const ae = a.result.lines.filter((l) => l.type === "error").length;
        const be = b.result.lines.filter((l) => l.type === "error").length;
        if (be !== ae) return be - ae;
        return b.result.lines.filter((l) => l.type === "warning").length - a.result.lines.filter((l) => l.type === "warning").length;
      })[0]
    : null;

  const totalErrors = fileResults.reduce((sum, fr) => sum + fr.result.lines.filter((l) => l.type === "error").length, 0);
  const totalWarnings = fileResults.reduce((sum, fr) => sum + fr.result.lines.filter((l) => l.type === "warning").length, 0);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full" style={{ background: "hsl(222 16% 10%)" }}>
      <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-8">

        <header className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-flex items-center justify-center rounded-lg w-8 h-8 text-sm font-bold"
              style={{ background: "hsl(210 80% 60%)", color: "hsl(222 16% 6%)" }}
            >P</span>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: "hsl(210 20% 92%)", fontFamily: "var(--app-font-sans)" }}>
              PasteCheck
            </h1>
            {isPro && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "hsl(210 80% 60%)", color: "hsl(222 16% 6%)" }}
              >PRO</span>
            )}
          </div>
          <p className="text-sm" style={{ color: "hsl(215 14% 55%)" }}>
            Paste your code and check for errors and warnings instantly.
          </p>
        </header>

        {/* ── Mode tabs (Pro only) ── */}
        {isPro && (
          <div
            className="flex rounded-xl mb-5 p-1"
            style={{ background: "hsl(222 16% 13%)", border: "1px solid hsl(220 13% 22%)" }}
          >
            <button
              onClick={() => { setProMode("single"); handleReset(); }}
              className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all"
              style={{
                background: proMode === "single" ? "hsl(210 80% 60%)" : "transparent",
                color: proMode === "single" ? "hsl(222 16% 6%)" : "hsl(215 14% 55%)",
                border: "none",
                cursor: "pointer",
              }}
            >
              Single File
            </button>
            <button
              onClick={() => { setProMode("multi"); handleMultiReset(); setChecked(false); setResult(null); setCode(""); }}
              className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all"
              style={{
                background: proMode === "multi" ? "hsl(210 80% 60%)" : "transparent",
                color: proMode === "multi" ? "hsl(222 16% 6%)" : "hsl(215 14% 55%)",
                border: "none",
                cursor: "pointer",
              }}
            >
              Multi-File
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            SINGLE FILE MODE
        ════════════════════════════════════════════════════════════════════ */}
        {(!isPro || proMode === "single") && (
          <>
            {!checked ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl overflow-hidden border" style={{ borderColor: "hsl(220 13% 22%)" }}>
                  <div
                    className="flex items-center justify-between px-4 py-2 border-b"
                    style={{ background: "hsl(222 16% 13%)", borderColor: "hsl(220 13% 22%)" }}
                  >
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "hsl(215 14% 45%)" }}>Code</span>
                    {code.length > 0 && (
                      <span className="text-xs" style={{ color: "hsl(215 14% 45%)" }}>{code.split("\n").length} lines</span>
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
                  <div className="rounded-xl px-4 py-3 text-sm flex items-center gap-2" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)", color: "rgb(253,224,71)" }}>
                    <span className="shrink-0">⚠</span><span>{inputError}</span>
                  </div>
                )}

                {history.length > 0 && (
                  <button
                    onClick={() => setShowHistory((v) => !v)}
                    className="w-full rounded-xl py-2.5 text-sm font-medium tracking-wide transition-all duration-150"
                    style={{ background: "hsl(220 13% 16%)", color: "hsl(215 14% 55%)", border: "1px solid hsl(220 13% 22%)", cursor: "pointer" }}
                  >
                    {showHistory ? "Hide History" : `Recent Checks (${history.length})`}
                  </button>
                )}

                {showHistory && history.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {history.map((item, idx) => {
                      const errors = item.result.lines.filter((l) => l.type === "error").length;
                      const warnings = item.result.lines.filter((l) => l.type === "warning").length;
                      const preview = item.code.trim().split("\n")[0].slice(0, 48);
                      return (
                        <button
                          key={idx}
                          onClick={() => { setCode(item.code); setResult(item.result); setChecked(true); setExpanded(new Set()); setShowHistory(false); }}
                          className="w-full rounded-xl px-4 py-3 text-left transition-all duration-150"
                          style={{ background: "hsl(222 16% 13%)", border: "1px solid hsl(220 13% 22%)", cursor: "pointer" }}
                        >
                          <div className="text-xs font-mono truncate" style={{ color: "hsl(210 20% 72%)" }}>{preview}</div>
                          <div className="flex gap-3 mt-1">
                            {errors > 0 && <span className="text-xs" style={{ color: "rgb(248,113,113)" }}>{errors} {errors === 1 ? "error" : "errors"}</span>}
                            {warnings > 0 && <span className="text-xs" style={{ color: "rgb(253,224,71)" }}>{warnings} {warnings === 1 ? "warning" : "warnings"}</span>}
                            {errors === 0 && warnings === 0 && <span className="text-xs" style={{ color: "rgb(134,239,172)" }}>clean</span>}
                          </div>
                        </button>
                      );
                    })}
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
                >Check Code</button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="flex-1 rounded-xl px-4 py-3 flex flex-col items-center justify-center" style={{ background: "rgba(220, 38, 38, 0.12)", border: "1px solid rgba(220,38,38,0.25)" }}>
                      <span className="text-2xl font-bold" style={{ color: "rgb(248,113,113)" }}>{errorCount}</span>
                      <span className="text-xs mt-0.5" style={{ color: "rgb(248,113,113)", opacity: 0.85 }}>{errorCount === 1 ? "Error" : "Errors"}</span>
                    </div>
                    <div className="flex-1 rounded-xl px-4 py-3 flex flex-col items-center justify-center" style={{ background: "rgba(234,179,8,0.10)", border: "1px solid rgba(234,179,8,0.22)" }}>
                      <span className="text-2xl font-bold" style={{ color: "rgb(253,224,71)" }}>{warningCount}</span>
                      <span className="text-xs mt-0.5" style={{ color: "rgb(253,224,71)", opacity: 0.85 }}>{warningCount === 1 ? "Warning" : "Warnings"}</span>
                    </div>
                  </div>
                  {result && result.language !== "unknown" && (
                    <div className="ml-3 rounded-xl px-3 py-2 flex flex-col items-center justify-center shrink-0" style={{ background: "hsl(220 13% 16%)", border: "1px solid hsl(220 13% 24%)" }}>
                      <span className="text-xs font-semibold flex items-center gap-1" style={{ color: LANG_COLOR[result.language] }}>
                        {LANG_LABELS[result.language]}
                        {isLowConfidence && <span title="Short snippet — language detection may be approximate" style={{ color: "hsl(215 14% 50%)", fontSize: "10px", fontWeight: "normal", cursor: "help" }}>?</span>}
                      </span>
                      <span className="text-xs mt-0.5" style={{ color: "hsl(215 14% 45%)" }}>detected</span>
                    </div>
                  )}
                </div>

                {errorCount === 0 && warningCount === 0 && (
                  <div className="rounded-xl px-4 py-3 text-sm text-center" style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.2)", color: "rgb(134,239,172)" }}>
                    No issues found — looks clean!
                  </div>
                )}

                {(errorCount > 0 || warningCount > 0) && (
                  <p className="text-xs text-center" style={{ color: "hsl(215 14% 42%)" }}>Tap a highlighted line to see details</p>
                )}

                <div className="rounded-xl overflow-hidden border" style={{ borderColor: "hsl(220 13% 22%)" }}>
                  <div className="flex items-center justify-between px-4 py-2 border-b" style={{ background: "hsl(222 16% 13%)", borderColor: "hsl(220 13% 22%)" }}>
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "hsl(215 14% 45%)" }}>Results</span>
                    <span className="text-xs" style={{ color: "hsl(215 14% 45%)" }}>{result!.lines.length} lines</span>
                  </div>
                  <div className="overflow-x-auto" style={{ background: "hsl(222 16% 12%)", fontFamily: "var(--app-font-mono)", fontSize: "12.5px", lineHeight: "1.7" }}>
                    {result!.lines.map((line, i) => {
                      const isFlagged = line.type !== "normal" && line.messages.length > 0;
                      const isOpen = expanded.has(i);
                      return (
                        <div key={i}>
                          <div
                            onClick={isFlagged ? () => toggleExpanded(i, line.type) : undefined}
                            className="flex gap-0 px-0"
                            style={{
                              background: line.type === "error" ? "rgba(220,38,38,0.14)" : line.type === "warning" ? "rgba(234,179,8,0.10)" : "transparent",
                              borderLeft: line.type === "error" ? "3px solid rgb(220,38,38)" : line.type === "warning" ? "3px solid rgb(234,179,8)" : "3px solid transparent",
                              cursor: isFlagged ? "pointer" : "default",
                              WebkitTapHighlightColor: "transparent",
                            }}
                          >
                            <span className="select-none text-right shrink-0 px-3 py-0.5" style={{ color: "hsl(215 14% 35%)", minWidth: "42px", userSelect: "none" }}>{i + 1}</span>
                            <span className="whitespace-pre py-0.5 flex-1" style={{ color: line.type === "error" ? "rgb(252,165,165)" : line.type === "warning" ? "rgb(253,224,71)" : "hsl(210 20% 82%)" }}>
                              {line.text || " "}
                            </span>
                            {isFlagged && (
                              <span className="shrink-0 px-2 py-0.5 self-center text-xs" style={{ color: line.type === "error" ? "rgba(252,165,165,0.6)" : "rgba(253,224,71,0.6)", fontFamily: "var(--app-font-sans)", transition: "transform 0.15s", display: "inline-block", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}>›</span>
                            )}
                          </div>
                          {isFlagged && isOpen && (
                            <div style={{ background: line.type === "error" ? "rgba(220,38,38,0.07)" : "rgba(234,179,8,0.06)", borderLeft: line.type === "error" ? "3px solid rgba(220,38,38,0.45)" : "3px solid rgba(234,179,8,0.45)" }}>
                              {line.messages.map((msg, mi) => (
                                <div key={mi} className="px-3 py-1 text-xs flex items-start gap-1.5" style={{ fontFamily: "var(--app-font-sans)", color: line.type === "error" ? "rgb(252,165,165)" : "rgb(253,224,71)" }}>
                                  <span className="mt-px shrink-0">{line.type === "error" ? "✕" : "⚠"}</span>
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

                {showSurvey && <InAppSurvey onDismiss={() => { setShowSurvey(false); setSurveyDismissed(true); }} />}
                {(errorCount > 0 || warningCount > 0) && <DebugNudge errorCount={errorCount} warningCount={warningCount} />}
                <ResultRating language={result?.language ?? "unknown"} errorCount={errorCount} warningCount={warningCount} />
                <button
                  onClick={handleReset}
                  className="w-full rounded-xl py-3.5 text-sm font-semibold tracking-wide transition-all duration-150 active:scale-[0.98]"
                  style={{ background: "hsl(220 13% 20%)", color: "hsl(210 20% 75%)", border: "1px solid hsl(220 13% 26%)", cursor: "pointer" }}
                >Check New Code</button>
                <FeedbackForm />
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            MULTI-FILE MODE (Pro only)
        ════════════════════════════════════════════════════════════════════ */}
        {isPro && proMode === "multi" && (
          <>
            {!multiChecked ? (
              <div className="flex flex-col gap-4">
                {files.map((file, idx) => (
                  <div key={file.id} className="rounded-xl overflow-hidden border" style={{ borderColor: "hsl(220 13% 22%)" }}>
                    <div className="flex items-center justify-between px-3 py-2 border-b" style={{ background: "hsl(222 16% 13%)", borderColor: "hsl(220 13% 22%)" }}>
                      <input
                        value={file.name}
                        onChange={(e) => handleFileNameChange(file.id, e.target.value)}
                        placeholder={`File ${idx + 1}`}
                        className="text-xs font-medium outline-none bg-transparent flex-1 min-w-0"
                        style={{ color: "hsl(210 20% 78%)", caretColor: "hsl(210 80% 60%)" }}
                        spellCheck={false}
                      />
                      {files.length > 1 && (
                        <button
                          onClick={() => handleRemoveFile(file.id)}
                          className="text-xs ml-2 shrink-0 px-2 py-0.5 rounded"
                          style={{ color: "hsl(215 14% 45%)", background: "none", border: "none", cursor: "pointer" }}
                        >✕ Remove</button>
                      )}
                    </div>
                    <textarea
                      value={file.code}
                      onChange={(e) => handleFileCodeChange(file.id, e.target.value)}
                      placeholder="// Paste your code here..."
                      rows={10}
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
                ))}

                {files.length < 5 && (
                  <button
                    onClick={handleAddFile}
                    className="w-full rounded-xl py-2.5 text-sm font-medium transition-all duration-150"
                    style={{ background: "hsl(220 13% 16%)", color: "hsl(215 14% 55%)", border: "1px solid hsl(220 13% 22%)", cursor: "pointer" }}
                  >+ Add File ({files.length}/5)</button>
                )}

                {multiInputError && (
                  <div className="rounded-xl px-4 py-3 text-sm flex items-center gap-2" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)", color: "rgb(253,224,71)" }}>
                    <span className="shrink-0">⚠</span><span>{multiInputError}</span>
                  </div>
                )}

                <button
                  onClick={handleCheckAll}
                  className="w-full rounded-xl py-3.5 text-sm font-semibold tracking-wide transition-all duration-150 active:scale-[0.98]"
                  style={{ background: "hsl(210 80% 60%)", color: "hsl(222 16% 6%)", border: "none", cursor: "pointer" }}
                >Check All Files</button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Summary bar */}
                <div className="flex gap-3">
                  <div className="flex-1 rounded-xl px-4 py-3 flex flex-col items-center justify-center" style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.25)" }}>
                    <span className="text-2xl font-bold" style={{ color: "rgb(248,113,113)" }}>{totalErrors}</span>
                    <span className="text-xs mt-0.5" style={{ color: "rgb(248,113,113)", opacity: 0.85 }}>{totalErrors === 1 ? "Error" : "Errors"}</span>
                  </div>
                  <div className="flex-1 rounded-xl px-4 py-3 flex flex-col items-center justify-center" style={{ background: "rgba(234,179,8,0.10)", border: "1px solid rgba(234,179,8,0.22)" }}>
                    <span className="text-2xl font-bold" style={{ color: "rgb(253,224,71)" }}>{totalWarnings}</span>
                    <span className="text-xs mt-0.5" style={{ color: "rgb(253,224,71)", opacity: 0.85 }}>{totalWarnings === 1 ? "Warning" : "Warnings"}</span>
                  </div>
                  <div className="rounded-xl px-3 py-2 flex flex-col items-center justify-center shrink-0" style={{ background: "hsl(220 13% 16%)", border: "1px solid hsl(220 13% 24%)" }}>
                    <span className="text-2xl font-bold" style={{ color: "hsl(210 20% 72%)" }}>{fileResults.filter(fr => fr.code.trim()).length}</span>
                    <span className="text-xs mt-0.5" style={{ color: "hsl(215 14% 45%)" }}>Files</span>
                  </div>
                </div>

                {/* Per-file results */}
                {fileResults.filter(fr => fr.code.trim()).map((fr, idx) => (
                  <FileResultPanel
                    key={fr.id}
                    fileResult={fr}
                    defaultOpen={idx === 0}
                  />
                ))}

                {/* Nudge panel references worst file */}
                {worstFile && (totalErrors > 0 || totalWarnings > 0) && (
                  <div>
                    {worstFile.name && (
                      <p className="text-xs mb-2" style={{ color: "hsl(215 14% 45%)" }}>
                        Most issues in: <span style={{ color: "hsl(210 20% 72%)" }}>{worstFile.name}</span>
                      </p>
                    )}
                    <DebugNudge
                      errorCount={worstFile.result.lines.filter(l => l.type === "error").length}
                      warningCount={worstFile.result.lines.filter(l => l.type === "warning").length}
                    />
                  </div>
                )}

                <button
                  onClick={handleMultiReset}
                  className="w-full rounded-xl py-3.5 text-sm font-semibold tracking-wide transition-all duration-150 active:scale-[0.98]"
                  style={{ background: "hsl(220 13% 20%)", color: "hsl(210 20% 75%)", border: "1px solid hsl(220 13% 26%)", cursor: "pointer" }}
                >Check New Files</button>
                <FeedbackForm />
              </div>
            )}
          </>
        )}

        {/* ── Footer with tap-5 dev toggle ── */}
        <div className="mt-10 pt-4" style={{ borderTop: "1px solid hsl(220 13% 16%)" }}>
          <button
            onClick={handleVersionTap}
            className="w-full text-center"
            style={{ background: "none", border: "none", cursor: "default", WebkitTapHighlightColor: "transparent" }}
          >
            <span className="text-xs" style={{ color: "hsl(215 14% 30%)" }}>
              PasteCheck v1.8
            </span>
          </button>
        </div>

        {/* ── Pro mode toast ── */}
        {proToast && (
          <div
            className="fixed bottom-6 left-1/2 rounded-xl px-4 py-2 text-xs font-semibold"
            style={{
              transform: "translateX(-50%)",
              background: "hsl(210 80% 60%)",
              color: "hsl(222 16% 6%)",
              zIndex: 50,
              pointerEvents: "none",
            }}
          >
            {proToast}
          </div>
        )}

      </div>
    </div>
  );
}