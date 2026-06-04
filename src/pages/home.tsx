import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { toast, Toaster } from "sonner";
import NavMenu from "@/components/NavMenu";
import Logo from "@/components/Logo";
import { lint, detectLanguage, type LintResult, type Language } from "@/lib/linter";
import { supabase } from "@/lib/supabase";
import FeedbackForm from "@/components/FeedbackForm";
import type { CodeLine } from "@/lib/linter";
function logFeedbackFormMissing() {
  if (!import.meta.env.VITE_FORMSPREE_ID) {
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "feedback_form_missing", {
        event_category: "Error",
        event_label: "VITE_FORMSPREE_ID not set",
      });
    }
    console.warn("[PasteCheck] FeedbackForm: VITE_FORMSPREE_ID is not set. Feedback will be silently lost.");
  }
}
logFeedbackFormMissing();

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
            type="button"
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
        type="button"
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
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ background: "none", border: "none", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
      >
        <span className="text-xs font-medium" style={{ color: "hsl(210 20% 72%)" }}>🛠 What to do next</span>
        <span
          className="text-xs will-change-transform"
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
              <span style={{ color: "hsl(262 83% 75%)", fontSize: "10px", marginTop: "2px" }}>●</span>
              <span className="text-xs" style={{ color: "hsl(210 20% 65%)", lineHeight: "1.6" }}>{b}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SaveToCollectionButton({ code, language, lines }: { code: string; language: string; lines: CodeLine[] }) {
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [loadingCols, setLoadingCols] = useState(false);

  async function handleOpen() {
    if (open) { setOpen(false); return; }
    setOpen(true);
    setLoadingCols(true);
    const { data } = await supabase
      .from("collections")
      .select("id, name")
      .order("created_at", { ascending: false });
    setCollections(data ?? []);
    setLoadingCols(false);
  }

  async function handleSave(collectionId: string) {
    setSaving(collectionId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }
    const { error: saveError } = await supabase.from("saved_checks").insert({
      user_id: user.id,
      collection_id: collectionId,
      code,
      language,
      lines,
    });
    setSaving(null);
    if (saveError) {
      toast.error("Failed to save — please try again.");
      return;
    }
    setSaved(collectionId);
    setOpen(false);
    setTimeout(() => setSaved(null), 2500);
    toast.success("Saved to collection");
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleOpen}
        className="w-full rounded-xl py-3 text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
        style={{
          background: "hsl(222 16% 16%)",
          color: "hsl(210 20% 75%)",
          border: "1px solid hsl(220 13% 26%)",
          cursor: "pointer",
        }}
      >
        {saved ? "✓ Saved" : "📁 Save to collection"}
      </button>

      {open && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "hsl(222 16% 13%)", border: "1px solid hsl(220 13% 22%)" }}
        >
          {loadingCols ? (
            <p className="text-xs px-4 py-3" style={{ color: "hsl(215 14% 45%)" }}>Loading collections...</p>
          ) : collections.length === 0 ? (
            <div className="px-4 py-3 flex flex-col gap-2">
              <p className="text-xs" style={{ color: "hsl(215 14% 45%)" }}>No collections yet.</p>
              <a
                href="/collections"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg inline-block"
                style={{ background: "hsl(262 83% 75%)", color: "hsl(220 8% 6%)", textDecoration: "none", borderRadius: "8px" }}
              >
                Create one
              </a>
            </div>
          ) : (
            collections.map((col) => (
              <button
                type="button"
                key={col.id}
                onClick={() => handleSave(col.id)}
                disabled={saving === col.id}
                className="w-full text-left px-4 py-2.5 text-xs transition-all"
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid hsl(220 13% 18%)",
                  color: saving === col.id ? "hsl(215 14% 40%)" : "hsl(210 20% 78%)",
                  cursor: saving === col.id ? "not-allowed" : "pointer",
                }}
              >
                {saving === col.id ? "Saving..." : `📁 ${col.name}`}
              </button>
            ))
          )}
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
      <button type="button" onClick={() => handleRate("up")} className="text-lg transition-opacity hover:opacity-70 active:scale-90" style={{ background: "none", border: "none", cursor: "pointer" }} aria-label="Helpful">👍</button>
      <button type="button" onClick={() => handleRate("down")} className="text-lg transition-opacity hover:opacity-70 active:scale-90" style={{ background: "none", border: "none", cursor: "pointer" }} aria-label="Not helpful">👎</button>
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
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{
          background: "hsl(220 8% 12%)",
          border: "none",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-xs will-change-transform"
            style={{
              color: "hsl(215 14% 45%)",
              display: "inline-block",
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.15s",
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
                style={{ background: "hsl(220 8% 11%)", fontFamily: "var(--app-font-mono)", fontSize: "12.5px", lineHeight: "1.7" }}
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

// ─── Symbol bar ───────────────────────────────────────────────────────────────

const SYMBOLS = ["{", "}", "[", "]", "(", ")", ":", ";", "=>", '"', "'", "=", ".", ",", "!"];

function SymbolBar({ onInsert }: { onInsert: (sym: string) => void }) {
  return (
    <div
      className="md:hidden flex items-center gap-1 overflow-x-auto px-2 py-1.5"
      style={{
        background: "hsl(220 8% 12%)",
        borderTop: "1px solid hsl(220 13% 22%)",
        borderBottom: "1px solid hsl(220 13% 22%)",
        WebkitOverflowScrolling: "touch" as any,
        scrollbarWidth: "none" as any,
      }}
    >
      {SYMBOLS.map((sym) => (
        <button
          key={sym}
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onInsert(sym);
          }}
          className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-mono font-semibold transition-all active:scale-90"
          style={{
            background: "hsl(220 13% 20%)",
            color: "hsl(210 20% 82%)",
            border: "1px solid hsl(220 13% 28%)",
            cursor: "pointer",
            minWidth: "36px",
            textAlign: "center",
          }}
        >
          {sym}
        </button>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Home() {
  // Pro state
  const [isPro, setIsPro] = useState<boolean>(false);
  const [groupBySeverity, setGroupBySeverity] = useState(false);
  const touchStart = useRef(0);
  const [proMode, setProMode] = useState<"single" | "multi">("single");
  const [tapCount, setTapCount] = useState(0);
  const [proToast, setProToast] = useState<string | null>(null);
  
  // Single-file mode (free)
  const [code, setCode] = useState(() => {
    try {
      const seen = localStorage.getItem("pastecheck_seen");
      if (!seen) {
        localStorage.setItem("pastecheck_seen", "true");
        return `function calculateTotal(items) {\n  var total = 0\n  for (let i = 0; i <= items.length; i++) {\n    total = total + items[i].price\n  }\n  console.log(total)\n}`;
      }
    } catch {}
    return "";
  });

  const [result, setResult] = useState<LintResult | null>(null);
  const [checked, setChecked] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [inputError, setInputError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevErrorCount = useRef<number>(0);
  const [symbolBarVisible, setSymbolBarVisible] = useState(false);
  const [textareaRows, setTextareaRows] = useState(16);



  // Multi-file mode (pro)
  const [files, setFiles] = useState<FileEntry[]>([makeFile("File 1")]);
  const [fileResults, setFileResults] = useState<FileResult[]>([]);
  const [multiChecked, setMultiChecked] = useState(false);
  const [multiInputError, setMultiInputError] = useState<string | null>(null);

  // Upsell triggers
  const [shareAttempted, setShareAttempted] = useState(false);
  const [multiAttempted, setMultiAttempted] = useState(false);
  const upgradeRef = useRef<HTMLDivElement>(null);

  // Shared
  const [history, setHistory] = useState<Array<{ code: string; result: LintResult; timestamp: number }>>(() => {
    try {
      const stored = localStorage.getItem("pastecheck_history");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyDismissed, setSurveyDismissed] = useState(false);

  // Sync Pro status from Supabase on mount
  useEffect(() => {
    async function syncPro() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("is_pro")
          .eq("id", user.id)
          .single();
        const proValue = data?.is_pro === true;
        localStorage.setItem("pastecheck_pro", String(proValue));
        setIsPro(proValue);
      }
    }
    syncPro();
  }, []);

  const errorCount = useMemo(() => result?.lines.filter((l) => l.type === "error").length ?? 0, [result]);
  const warningCount = useMemo(() => result?.lines.filter((l) => l.type === "warning").length ?? 0, [result]);
  const isLowConfidence = code.trim().split("\n").filter((l) => l.trim().length > 0).length < 5;
  const totalChecks = history.length;
  const showRateSignal = !isPro && totalChecks >= 5;

  function handleTouchStart(e: React.TouchEvent) { touchStart.current = e.touches[0].clientX; }
  function handleTouchEnd(e: React.TouchEvent) {
    const touchEnd = e.changedTouches[0].clientX;
    if (touchStart.current - touchEnd > 100) { /* Swipe left logic */ }
    if (touchEnd - touchStart.current > 100) { /* Swipe right logic */ }
  }

  // ── Dev toggle (tap version 5 times) ──────────────────────────────────────
  function handleVersionTap() {
    if (!import.meta.env.DEV) return;
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 5) {
      const newValue = !isPro;
      setIsPro(newValue);
      setProMode("single");
      localStorage.setItem("pastecheck_pro", String(newValue));
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

  function handleSymbolInsert(sym: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const newCode = code.slice(0, start) + sym + code.slice(end);
    setCode(newCode);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + sym.length, start + sym.length);
    });
  }

  const handleCheck = useCallback(() => {
    if (!code.trim()) { setInputError("Please paste some code first"); return; }
    if (code.length > 100000) { setInputError("That file is too large to check — please paste under 100KB of code."); return; }
    if (code.split("\n").length > 3000) { setInputError("Too many lines — please paste under 3,000 lines of code."); return; }
    const detectedLang = detectLanguage(code);
    if (detectedLang === "unknown") { setInputError("No code detected — please paste JavaScript, Python or HTML code."); return; }
    setChecking(true);
    setTimeout(() => {
    prevErrorCount.current = result?.lines.filter((l) => l.type === "error").length ?? 0;
    const r = lint(code);
    setResult(r);
    setChecked(true);
    setTextareaRows(6);
    const firstThree = new Set(
      r.lines
        .map((l, i) => ({ l, i }))
        .filter(({ l }) => l.type !== "normal" && l.messages.length > 0)
        .slice(0, 3)
        .map(({ i }) => i)
    );
    setExpanded(firstThree);
    setInputError(null);
    setChecking(false);
    setHistory((prev) => {
      const updated = [{ code, result: r, timestamp: Date.now() }, ...prev].slice(0, isPro ? 100 : 5);
      try { localStorage.setItem("pastecheck_history", JSON.stringify(updated)); } catch {}
      const checkNumber = updated.length;
      if ([3, 5, 10].includes(checkNumber)) {
        if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
          (window as any).gtag("event", "check_milestone", { event_category: "Engagement", event_label: `check_${checkNumber}` });
        }
      }
      if (checkNumber === 5 && !surveyDismissed) setShowSurvey(true);
      return updated;
    });
  }, 0);
  }, [code, result, isPro, surveyDismissed]);

  function handleReset() {
    setCode("");
    setResult(null);
    setChecked(false);
    setExpanded(new Set());
    setInputError(null);
    setShareUrl(null);
    setTextareaRows(16);
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

  // ── Share handler ──────────────────────────────────────────────────────────
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (!result) return;
    setSharing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          code,
          language: result.language,
          lines: result.lines,
        }),
      });
      const data = await res.json();
      if (data.id) {
        const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
        const url = `${appUrl}/s/${data.id}`;
        setShareUrl(url);
        try {
          await navigator.clipboard.writeText(url);
          toast.success("Link copied to clipboard");
        } catch {
          toast.success("Share link generated");
        }
      } else {
        toast.error(data.error ?? "Failed to generate share link — please try again.");
      }
    } catch (err) {
      toast.error("Something went wrong — please try again.");
      if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
        (window as any).gtag("event", "share_error", { event_category: "Error", event_label: String(err) });
      }
    }
    setSharing(false);
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
    <div className="min-h-screen w-full" style={{ background: "hsl(220 8% 9%)" }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <Toaster position="bottom-center" theme="dark" richColors />
      <div className={`mx-auto w-full px-4 pb-10 ${checked ? "max-w-5xl" : "max-w-2xl"}`}>
        <Helmet>
          <title>PasteCheck — Paste and Check Your Code</title>
          <meta name="description" content="Paste your JavaScript, TypeScript, Python, HTML or CSS code and instantly see syntax errors and warnings highlighted. Free, no login, works on mobile." />
          <meta property="og:title" content="PasteCheck — Paste and Check Your Code" />
          <meta property="og:description" content="Paste your JavaScript, TypeScript, Python, HTML or CSS code and instantly see syntax errors and warnings highlighted. Free, no login, works on mobile." />
          <meta property="og:image" content="https://www.pastecheck.co.uk/opengraph.jpg" />
          <link rel="canonical" href="https://www.pastecheck.co.uk/check" />
        </Helmet>

        {/* Nav */}
        <NavMenu />

        {/* Sticky reset button — mobile only, visible after check */}
        {checked && (
          <div
            className="md:hidden fixed top-0 left-0 right-0 z-40 px-4 py-2"
            style={{ background: "hsl(220 8% 9%)", borderBottom: "1px solid hsl(220 13% 16%)" }}
          >
            <button
              type="button"
              onClick={handleReset}
              className="w-full rounded-xl py-2.5 text-sm font-semibold tracking-wide transition-all duration-150 active:scale-[0.98]"
              style={{ background: "hsl(262 83% 75%)", color: "hsl(220 8% 6%)", border: "none", cursor: "pointer" }}
            >Check New Code</button>
          </div>
        )}

        <header className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Logo size="sm" />
            <h1 className="sr-only">PasteCheck</h1>
            <p className="text-xs font-medium mb-4" style={{ color: "hsl(215 14% 55%)" }}>
              You've run {totalChecks} {totalChecks === 1 ? "check" : "checks"} today.
            </p>

            {isPro && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "hsl(262 83% 75%)",
                  color: "hsl(220 8% 6%)",
                  animation: "probadgepulse 2.5s ease-in-out 3",
                }}
              >PRO</span>
            )}
          </div>
          <p className="text-sm" style={{ color: "hsl(215 14% 55%)" }}>
            Paste your code and check for errors and warnings instantly.
          </p>
          <p className="text-xs mt-1" style={{ color: "hsl(215 14% 38%)" }}>
            Free online checker for JavaScript, TypeScript, Python, HTML and CSS — no sign-up required.
          </p>
          {showRateSignal && (
            <div className="mt-3 rounded-lg px-3 py-2 flex items-center justify-between gap-3" style={{ background: "hsl(262 83% 75% / 0.07)", border: "1px solid hsl(262 83% 75% / 0.18)" }}>
              <span className="text-xs" style={{ color: "hsl(215 14% 52%)" }}>
                {totalChecks} checks today — Pro unlocks multi-file mode and saved history.
              </span>
              <a
                href="#"
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) { window.location.href = "/login"; return; }
                    const res = await fetch("/api/create-checkout", { 
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`
                      }
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } catch (err) {
                    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
                      (window as any).gtag("event", "checkout_error", { event_category: "Error", event_label: String(err) });
                    }
                  }
                }}
                className="text-xs font-semibold shrink-0"
                style={{ color: "hsl(262 83% 75%)", textDecoration: "none" }}
              >
                Upgrade →
              </a>
            </div>
          )}
        </header>

        {/* ── Mode tabs (always visible — Multi-File locked for free users) ── */}
        <div
          className="flex rounded-xl mb-5 p-1"
          style={{ background: "hsl(222 16% 13%)", border: "1px solid hsl(220 13% 22%)" }}
        >
          <button
            type="button"
            onClick={() => { if (isPro) { setProMode("single"); handleReset(); } else { handleReset(); } }}
            className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all"
            style={{
              background: isPro && proMode === "single" ? "hsl(262 83% 75%)" : !isPro ? "hsl(262 83% 75%)" : "transparent",
              color: isPro && proMode === "single" ? "hsl(220 8% 6%)" : !isPro ? "hsl(220 8% 6%)" : "hsl(215 14% 55%)",
              border: "none",
              cursor: "pointer",
            }}
          >
            Single File
          </button>
          <button
            type="button"
            onClick={() => {
              if (isPro) {
                setProMode("multi");
                handleMultiReset();
                setChecked(false);
                setResult(null);
                setCode("");
              } else {
                setMultiAttempted(true);
                setTimeout(() => upgradeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
              }
            }}
            className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            style={{
              background: isPro && proMode === "multi" ? "hsl(262 83% 75%)" : "transparent",
              color: isPro && proMode === "multi" ? "hsl(220 8% 6%)" : "hsl(215 14% 55%)",
              border: "none",
              cursor: isPro ? "pointer" : "pointer",
              opacity: isPro ? 1 : 0.6,
            }}
          >
            Multi-File
            {!isPro && <span className="text-xs" style={{ color: "hsl(262 83% 75%)", fontSize: "9px" }}>PRO</span>}
          </button>
        </div>

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
                    style={{ background: "hsl(220 8% 12%)", borderColor: "hsl(220 13% 22%)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "hsl(215 14% 45%)" }}>Code</span>
                      {(() => {
                        const detectedLang = detectLanguage(code);
                        if (code.trim().length > 0 && detectedLang !== "unknown") {
                          return (
                            <div className="flex items-center gap-1.5">
                              <span
                                style={{
                                  width: "7px",
                                  height: "7px",
                                  borderRadius: "50%",
                                  background: LANG_COLOR[detectedLang as Exclude<Language, "unknown">],
                                  display: "inline-block",
                                  flexShrink: 0,
                                }}
                              />
                              <span className="text-xs font-semibold" style={{ color: LANG_COLOR[detectedLang as Exclude<Language, "unknown">] }}>
                                {LANG_LABELS[detectedLang as Exclude<Language, "unknown">]}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    {code.length > 0 && (
                      <div role="status" aria-live="polite" className="text-xs" style={{ color: "hsl(215 14% 45%)" }}>
                        {code.split("\n").length} lines · {code.length.toLocaleString()} chars
                        </div>
                      )}

                  </div>
                  <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={handleCodeChange}
                    onFocus={() => setSymbolBarVisible(true)}
                    onBlur={() => setSymbolBarVisible(false)}
                    placeholder="// Paste your code here..."
                    rows={textareaRows}
                    autoFocus
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="none"
                    className="w-full resize-none outline-none text-sm leading-relaxed px-4 py-3"
                    style={{
                      background: "hsl(220 8% 11%)",
                      color: "hsl(210 20% 88%)",
                      fontFamily: "var(--app-font-mono)",
                      caretColor: "hsl(262 83% 75%)",
                      fontSize: "13px",
                      lineHeight: "1.7",
                    }}
                  />
                  {symbolBarVisible && <SymbolBar onInsert={handleSymbolInsert} />}
                </div>

                <p className="text-xs text-center" style={{ color: "hsl(215 14% 38%)" }}>
                  🔒 Your code never leaves your browser.
                </p>

                {inputError && (
                  <div role="alert" className="rounded-xl px-4 py-3 text-sm flex items-center gap-2" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)", color: "rgb(253,224,71)" }}>
                    <span className="shrink-0">⚠</span><span>{inputError}</span>
                  </div>
                )}

                {history.length > 0 && (
                  <button
                    type="button"
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
                      const lang = item.result.language;
                      const timestamp = item.timestamp ? new Date(item.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "";
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => { setCode(item.code); setResult(item.result); setChecked(true); setExpanded(new Set()); setShowHistory(false); }}
                          className="w-full rounded-xl px-4 py-3 text-left transition-all duration-150"
                          style={{ background: "hsl(222 16% 13%)", border: "1px solid hsl(220 13% 22%)", cursor: "pointer" }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            {lang !== "unknown" && (
                              <span className="text-xs font-semibold" style={{ color: LANG_COLOR[lang as Exclude<Language, "unknown">] }}>
                                {LANG_LABELS[lang as Exclude<Language, "unknown">]}
                              </span>
                            )}
                            <span className="text-xs ml-auto" style={{ color: "hsl(215 14% 38%)" }}>{timestamp}</span>
                          </div>
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
                  type="button"
                  onClick={handleCheck}
                  disabled={!code.trim()}
                  className="w-full rounded-xl py-3.5 text-sm font-semibold tracking-wide transition-all duration-150 active:scale-[0.98]"
                  style={{
                    background: code.trim() ? "hsl(262 83% 75%)" : "hsl(220 13% 20%)",
                    color: code.trim() ? "hsl(220 8% 6%)" : "hsl(215 14% 40%)",
                    cursor: code.trim() ? "pointer" : "not-allowed",
                    border: "none",
                  }}
                >{checking ? "Checking..." : "Check Code"}</button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                {/* ── Left pane: input (desktop only) ── */}
                <div className="hidden md:flex md:flex-col md:gap-4 md:w-[45%] md:sticky md:top-8">
                  <div className="rounded-xl overflow-hidden border" style={{ borderColor: "hsl(220 13% 22%)" }}>
                    <div
                      className="flex items-center justify-between px-4 py-2 border-b"
                      style={{ background: "hsl(220 8% 12%)", borderColor: "hsl(220 13% 22%)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "hsl(215 14% 45%)" }}>Code</span>
                        {(() => {
                          const detectedLang = detectLanguage(code);
                          if (code.trim().length > 0 && detectedLang !== "unknown") {
                            return (
                              <div className="flex items-center gap-1.5">
                                <span
                                  style={{
                                    width: "7px",
                                    height: "7px",
                                    borderRadius: "50%",
                                    background: LANG_COLOR[detectedLang as Exclude<Language, "unknown">],
                                    display: "inline-block",
                                    flexShrink: 0,
                                  }}
                                />
                                <span className="text-xs font-semibold" style={{ color: LANG_COLOR[detectedLang as Exclude<Language, "unknown">] }}>
                                  {LANG_LABELS[detectedLang as Exclude<Language, "unknown">]}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      {code.length > 0 && (
                        <div role="status" aria-live="polite" className="text-xs" style={{ color: "hsl(215 14% 45%)" }}>
                          {code.split("\n").length} lines · {code.length.toLocaleString()} chars
                        </div>
                      )}

                    </div>
                    <textarea
                      ref={textareaRef}
                      value={code}
                      onChange={handleCodeChange}
                      rows={24}
                      spellCheck={false}
                      autoCorrect="off"
                      autoCapitalize="none"
                      className="w-full resize-none outline-none text-sm leading-relaxed px-4 py-3"
                      style={{
                        background: "hsl(220 8% 11%)",
                        color: "hsl(210 20% 88%)",
                        fontFamily: "var(--app-font-mono)",
                        caretColor: "hsl(262 83% 75%)",
                        fontSize: "13px",
                        lineHeight: "1.7",
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full rounded-xl py-3.5 text-sm font-semibold tracking-wide transition-all duration-150 active:scale-[0.98]"
                    style={{ background: "hsl(262 83% 75%)", color: "hsl(220 8% 6%)", border: "none", cursor: "pointer" }}
                  >Check New Code</button>
                </div>

                {/* ── Right pane: results (desktop) / full width (mobile) ── */}
                <div className="flex flex-col gap-4 md:flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 flex-1">
                    <div role="status" aria-label={`${errorCount} ${errorCount === 1 ? "error" : "errors"}`} className="flex-1 rounded-xl px-4 py-3 flex flex-col items-center justify-center" style={{ background: "rgba(220, 38, 38, 0.12)", border: "1px solid rgba(220,38,38,0.25)" }}>
                      <span className="text-2xl font-bold" style={{ color: "rgb(248,113,113)" }}>{errorCount}</span>
                      <span className="text-xs mt-0.5" style={{ color: "rgb(248,113,113)", opacity: 0.85 }}>{errorCount === 1 ? "Error" : "Errors"}</span>
                    </div>

                    <div role="status" aria-label={`${warningCount} ${warningCount === 1 ? "warning" : "warnings"}`} className="flex-1 rounded-xl px-4 py-3 flex flex-col items-center justify-center" style={{ background: "rgba(234,179,8,0.10)", border: "1px solid rgba(234,179,8,0.22)" }}>

                      <span className="text-2xl font-bold" style={{ color: "rgb(253,224,71)" }}>{warningCount}</span>
                      <span className="text-xs mt-0.5" style={{ color: "rgb(253,224,71)", opacity: 0.85 }}>{warningCount === 1 ? "Warning" : "Warnings"}</span>
                    </div>
                  </div>
                  {result && result.language !== "unknown" && (
                    <div className="ml-3 rounded-xl px-3 py-2 flex flex-col items-center justify-center shrink-0" style={{ background: "hsl(220 13% 16%)", border: "1px solid hsl(220 13% 24%)" }}>
                      <span className="text-xs font-semibold flex items-center gap-1" style={{ color: LANG_COLOR[result.language] }}>
                        {LANG_LABELS[result.language]}
                        {isLowConfidence && (   <span      title="Short snippet — language detection may be approximate"      aria-label="Language detection may be approximate"     style={{ color: "hsl(215 14% 50%)", fontSize: "10px", fontWeight: "normal", cursor: "help" }}   >?</span> )}
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

                <div role="region" aria-label="Code check results" className="rounded-xl overflow-hidden border" style={{ borderColor: "hsl(220 13% 22%)" }}>
                  <div className="flex items-center justify-between px-4 py-2 border-b" style={{ background: "hsl(220 8% 12%)", borderColor: "hsl(220 13% 22%)" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "hsl(215 14% 45%)" }}>Results</span>
                      <button 
                        onClick={() => setGroupBySeverity(!groupBySeverity)}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: "hsl(220 13% 20%)", color: "hsl(210 20% 78%)" }}
                      >
                        {groupBySeverity ? "Grouped" : "Default"}
                      </button>
                    </div>
                    <span className="text-xs" style={{ color: "hsl(215 14% 45%)" }}>{result!.lines.length} lines</span>
                  </div>

                  <ul className="overflow-x-auto" role="list" style={{ background: "hsl(220 8% 11%)", fontFamily: "var(--app-font-mono)", fontSize: "12.5px", lineHeight: "1.7", listStyle: "none", margin: 0, padding: 0 }}>
                    {result!.lines
                      .map((line, i) => ({ line, i }))
                      .map(({ line, i }) => {
                      const isFlagged = line.type !== "normal" && line.messages.length > 0;
                      const isOpen = expanded.has(i);
                      return (
                        <li key={i}>
                          <div
                            onClick={isFlagged ? () => toggleExpanded(i, line.type) : undefined}
                            onKeyDown={isFlagged ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleExpanded(i, line.type); } } : undefined}
                            role={isFlagged ? "button" : undefined}
                            tabIndex={isFlagged ? 0 : undefined}
                            aria-expanded={isFlagged ? expanded.has(i) : undefined}
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
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {errorCount === 0 && warningCount === 0 && result !== null && prevErrorCount.current > 0 && (
                  <div className="rounded-xl px-4 py-5 flex flex-col items-center gap-2 text-center" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <span style={{ fontSize: "28px" }}>✓</span>
                    <p className="text-sm font-semibold" style={{ color: "rgb(134,239,172)" }}>All errors fixed!</p>
                    <p className="text-xs" style={{ color: "rgb(134,239,172)", opacity: 0.7 }}>Your code is clean — no issues found.</p>
                  </div>
                )}

                {showSurvey && <InAppSurvey onDismiss={() => { setShowSurvey(false); setSurveyDismissed(true); }} />}
                {(errorCount > 0 || warningCount > 0) && <DebugNudge errorCount={errorCount} warningCount={warningCount} />}

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full rounded-xl py-3.5 text-sm font-semibold tracking-wide transition-all duration-150 active:scale-[0.98]"
                  style={{ background: "hsl(262 83% 75%)", color: "hsl(220 8% 6%)", border: "none", cursor: "pointer" }}
                >Check New Code</button>

                {/* Save to collection — Pro only */}
                {isPro && (
                  <SaveToCollectionButton
                    code={code}
                    language={result?.language ?? "unknown"}
                    lines={result?.lines ?? []}
                  />
                )}

                {/* Share button — Pro only */}
                {isPro && (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleShare}
                      disabled={sharing}
                      className="w-full rounded-xl py-3 text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
                      style={{
                        background: sharing
                          ? "linear-gradient(90deg, hsl(220 13% 18%) 25%, hsl(220 13% 24%) 50%, hsl(220 13% 18%) 75%)"
                          : "hsl(222 16% 16%)",
                        backgroundSize: sharing ? "200% 100%" : "auto",
                        animation: sharing ? "shimmer 1.2s ease-in-out infinite" : "none",
                        color: sharing ? "hsl(215 14% 40%)" : "hsl(210 20% 75%)",
                        border: "1px solid hsl(220 13% 26%)",
                        cursor: sharing ? "not-allowed" : "pointer",
                      }}
                    >
                      {sharing ? "Generating link..." : "🔗 Share this check"}
                    </button>
                    {shareUrl && (
                      <div className="rounded-xl px-4 py-3 flex flex-col gap-2" style={{ background: "hsl(222 16% 13%)", border: "1px solid hsl(220 13% 22%)" }}>
                        <p className="text-xs" style={{ color: "hsl(215 14% 45%)" }}>Link copied to clipboard:</p>
                        <p className="text-xs font-mono break-all" style={{ color: "hsl(262 83% 75%)" }}>{shareUrl}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Share upsell — free users, shown after tapping the share nudge */}
                {!isPro && (
                  <div
                    className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                    style={{ background: "hsl(222 16% 13%)", border: "1px solid hsl(220 13% 22%)", cursor: "pointer" }}
                    onClick={() => setShareAttempted(true)}
                  >
                    <span className="text-xs" style={{ color: "hsl(215 14% 45%)" }}>🔗 Share this check — Pro feature</span>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        setShareAttempted(true);
                        try {
                          const { data: { session } } = await supabase.auth.getSession();
                          if (!session) { window.location.href = "/login"; return; }
                          const res = await fetch("/api/create-checkout", { 
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${session.access_token}`
                            }
                          });
                          const data = await res.json();
                          if (data.url) window.location.href = data.url;
                        } catch (err) {
                          if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
                            (window as any).gtag("event", "checkout_error", { event_category: "Error", event_label: String(err) });
                          }
                        }
                      }}
                      className="text-xs font-semibold shrink-0 px-3 py-1.5 rounded-lg"
                      style={{ background: "hsl(262 83% 75%)", color: "hsl(220 8% 6%)", border: "none", cursor: "pointer" }}
                    >Upgrade</button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!result) return;
                    const flagged = result.lines
                      .map((l, i) => ({ l, i }))
                      .filter(({ l }) => l.type !== "normal" && l.messages.length > 0);
                    const text = flagged.length === 0
                      ? "No issues found — looks clean!"
                      : flagged.map(({ l, i }) =>
                          `Line ${i + 1} [${l.type.toUpperCase()}]: ${l.messages.join(" | ")}`
                        ).join("\n");
                    navigator.clipboard.writeText(text).catch(() => {});
                  }}
                  className="w-full rounded-xl py-2.5 text-sm font-medium transition-all duration-150 active:scale-[0.98]"
                  style={{ background: "transparent", color: "hsl(215 14% 52%)", border: "1px solid hsl(220 13% 22%)", cursor: "pointer" }}
                >Copy result as text</button>
                <ResultRating language={result?.language ?? "unknown"} errorCount={errorCount} warningCount={warningCount} />
                <FeedbackForm />
                </div>{/* end right pane */}
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
                    <div className="flex items-center justify-between px-3 py-2 border-b" style={{ background: "hsl(220 8% 12%)", borderColor: "hsl(220 13% 22%)" }}>
                      <input
                        value={file.name}
                        onChange={(e) => handleFileNameChange(file.id, e.target.value)}
                        placeholder={`File ${idx + 1}`}
                        className="text-xs font-medium outline-none bg-transparent flex-1 min-w-0"
                        style={{ color: "hsl(210 20% 78%)", caretColor: "hsl(262 83% 75%)" }}
                        spellCheck={false}
                      />
                      {files.length > 1 && (
                        <button
                          type="button"
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
                        background: "hsl(220 8% 11%)",
                        color: "hsl(210 20% 88%)",
                        fontFamily: "var(--app-font-mono)",
                        caretColor: "hsl(262 83% 75%)",
                        fontSize: "13px",
                        lineHeight: "1.7",
                      }}
                    />
                  </div>
                ))}

                {files.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddFile}
                    className="w-full rounded-xl py-2.5 text-sm font-medium transition-all duration-150"
                    style={{ background: "hsl(220 13% 16%)", color: "hsl(215 14% 55%)", border: "1px solid hsl(220 13% 22%)", cursor: "pointer" }}
                  >+ Add File ({files.length}/5)</button>
                )}

                {multiInputError && (
                  <div role="alert" className="rounded-xl px-4 py-3 text-sm flex items-center gap-2" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)", color: "rgb(253,224,71)" }}>
                    <span className="shrink-0">⚠</span><span>{multiInputError}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCheckAll}
                  className="w-full rounded-xl py-3.5 text-sm font-semibold tracking-wide transition-all duration-150 active:scale-[0.98]"
                  style={{ background: "hsl(262 83% 75%)", color: "hsl(220 8% 6%)", border: "none", cursor: "pointer" }}
                >Check All Files</button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Summary bar */}
                <div className="flex gap-3">
                  <div role="status" aria-label={`${totalErrors} ${totalErrors === 1 ? "error" : "errors"}`} className="flex-1 rounded-xl px-4 py-3 flex flex-col items-center justify-center" style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.25)" }}>
                    <span className="text-2xl font-bold" style={{ color: "rgb(248,113,113)" }}>{totalErrors}</span>
                    <span className="text-xs mt-0.5" style={{ color: "rgb(248,113,113)", opacity: 0.85 }}>{totalErrors === 1 ? "Error" : "Errors"}</span>
                  </div>

                  <div aria-label={`${totalWarnings} ${totalWarnings === 1 ? "warning" : "warnings"}`} className="flex-1 rounded-xl px-4 py-3 flex flex-col items-center justify-center" style={{ background: "rgba(234,179,8,0.10)", border: "1px solid rgba(234,179,8,0.22)" }}>
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
                  type="button"
                  onClick={handleMultiReset}
                  className="w-full rounded-xl py-3.5 text-sm font-semibold tracking-wide transition-all duration-150 active:scale-[0.98]"
                  style={{ background: "hsl(262 83% 75%)", color: "hsl(220 8% 6%)", border: "none", cursor: "pointer" }}
                >Check New Files</button>
                <FeedbackForm />
              </div>
            )}
          </>
        )}

        {/* ── Upgrade to Pro button (free users only, shown after multi-file attempt) ── */}
        {!isPro && multiAttempted && (
          <div className="mt-8" ref={upgradeRef}>
            <button
              onClick={async () => {
                try {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) { window.location.href = "/login"; return; }
                  const res = await fetch("/api/create-checkout", { 
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${session.access_token}`
                    }
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                } catch {
                  toast.error("Something went wrong. Please try again.");
                }
              }}
              type="button"
              className="w-full rounded-xl py-3.5 text-sm font-semibold tracking-wide transition-all duration-150 active:scale-[0.97]"
              style={{
                background: "hsl(262 83% 75%)",
                color: "hsl(220 8% 6%)",
                border: "none",
                cursor: "pointer",
                animation: "upgradeGlow 2.5s ease-in-out 3",
              }}
            >
              Upgrade to Pro — £4/month
            </button>
            <p className="text-xs text-center mt-2" style={{ color: "hsl(215 14% 58%)" }}>
              Multi-file mode · Shareable links · Saved collections
            </p>
            <p className="text-xs text-center mt-1.5" style={{ color: "hsl(215 14% 38%)" }}>
              🔒 Your code never leaves your browser.
            </p>
          </div>
        )}

        {/* ── Footer with tap-5 dev toggle ── */}
        <div className="mt-10 pt-4" style={{ borderTop: "1px solid hsl(220 13% 16%)" }}>
          <button
            onClick={handleVersionTap}
            className="w-full text-center"
            style={{ background: "none", border: "none", cursor: "default", WebkitTapHighlightColor: "transparent" }}
          >
            <span className="text-xs" style={{ color: "hsl(215 14% 30%)" }}>
              PasteCheck v2.33
            </span>
            <span className="text-xs mt-1 block" style={{ color: "hsl(215 14% 26%)" }}>
              📱 Coded entirely on an Android phone.
            </span>
          </button>
        </div>

        {/* ── Pro mode toast ── */}
        {proToast && (
          <div
            className="fixed bottom-6 left-1/2 rounded-xl px-4 py-2 text-xs font-semibold"
            style={{
              transform: "translateX(-50%)",
              background: "hsl(262 83% 75%)",
              color: "hsl(220 8% 6%)",
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