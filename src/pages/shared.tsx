import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import type { LintResult, Language } from "@/lib/linter";
import NavMenu from "@/components/NavMenu";

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

export default function Shared() {
  const [location] = useLocation();
  const id = location.split("/").pop();
  const [data, setData] = useState<{ code: string; language: Language; lines: LintResult["lines"] } | null>(null);
  const [status, setStatus] = useState<"loading" | "found" | "notfound">("loading");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!id) { setStatus("notfound"); return; }
    fetch(`/api/share?id=${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setStatus("notfound"); return; }
        setData(d);
        setStatus("found");
      })
      .catch(() => setStatus("notfound"));
  }, [id]);

  function toggleExpanded(idx: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) { next.delete(idx); } else { next.add(idx); }
      return next;
    });
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(222 16% 10%)" }}>
        <span className="text-sm" style={{ color: "hsl(215 14% 55%)" }}>Loading check...</span>
      </div>
    );
  }

  if (status === "notfound") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "hsl(222 16% 10%)" }}>
        <div className="text-center flex flex-col gap-4">
          <p className="text-sm" style={{ color: "hsl(215 14% 55%)" }}>Check not found or expired.</p>
          <a href="/check" className="text-sm font-semibold" style={{ color: "hsl(210 80% 60%)" }}>Check your own code →</a>
        </div>
      </div>
    );
  }

  const errorCount = data!.lines.filter((l) => l.type === "error").length;
  const warningCount = data!.lines.filter((l) => l.type === "warning").length;
  const lang = data!.language;

  return (
    <div className="min-h-screen w-full" style={{ background: "hsl(222 16% 10%)" }}>
      <Helmet>
        <title>Shared Code Check — PasteCheck</title>
        <meta name="description" content="View a shared code check result from PasteCheck — instant syntax error and warning detection for JavaScript, TypeScript, Python, HTML and CSS." />
        <meta property="og:title" content="Shared Code Check — PasteCheck" />
        <meta property="og:description" content="View a shared code check result from PasteCheck — instant syntax error and warning detection for JavaScript, TypeScript, Python, HTML and CSS." />
        <meta property="og:image" content="/opengraph.jpg" />
        <meta name="robots" content="noindex" />
      </Helmet>
      <NavMenu />
      <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-8">
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center rounded-lg w-8 h-8 text-sm font-bold" style={{ background: "hsl(210 80% 60%)", color: "hsl(222 16% 6%)" }}>P</span>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: "hsl(210 20% 92%)" }}>PasteCheck</h1>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "hsl(220 13% 20%)", color: "hsl(215 14% 55%)" }}>Shared Result</span>
          </div>
          <p className="text-sm" style={{ color: "hsl(215 14% 55%)" }}>Someone shared this code check with you.</p>
        </header>

        {/* Summary */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 rounded-xl px-4 py-3 flex flex-col items-center" style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.25)" }}>
            <span className="text-2xl font-bold" style={{ color: "rgb(248,113,113)" }}>{errorCount}</span>
            <span className="text-xs mt-0.5" style={{ color: "rgb(248,113,113)", opacity: 0.85 }}>{errorCount === 1 ? "Error" : "Errors"}</span>
          </div>
          <div className="flex-1 rounded-xl px-4 py-3 flex flex-col items-center" style={{ background: "rgba(234,179,8,0.10)", border: "1px solid rgba(234,179,8,0.22)" }}>
            <span className="text-2xl font-bold" style={{ color: "rgb(253,224,71)" }}>{warningCount}</span>
            <span className="text-xs mt-0.5" style={{ color: "rgb(253,224,71)", opacity: 0.85 }}>{warningCount === 1 ? "Warning" : "Warnings"}</span>
          </div>
          {lang !== "unknown" && (
            <div className="rounded-xl px-3 py-2 flex flex-col items-center shrink-0" style={{ background: "hsl(220 13% 16%)", border: "1px solid hsl(220 13% 24%)" }}>
              <span className="text-xs font-semibold" style={{ color: LANG_COLOR[lang as Exclude<Language, "unknown">] }}>
                {LANG_LABELS[lang as Exclude<Language, "unknown">]}
              </span>
              <span className="text-xs mt-0.5" style={{ color: "hsl(215 14% 45%)" }}>detected</span>
            </div>
          )}
        </div>

        {/* Code results */}
        <div className="rounded-xl overflow-hidden border mb-4" style={{ borderColor: "hsl(220 13% 22%)" }}>
          <div className="flex items-center justify-between px-4 py-2 border-b" style={{ background: "hsl(222 16% 13%)", borderColor: "hsl(220 13% 22%)" }}>
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "hsl(215 14% 45%)" }}>Results</span>
            <span className="text-xs" style={{ color: "hsl(215 14% 45%)" }}>{data!.lines.length} lines</span>
          </div>
          <div className="overflow-x-auto" style={{ background: "hsl(222 16% 12%)", fontFamily: "var(--app-font-mono)", fontSize: "12.5px", lineHeight: "1.7" }}>
            {data!.lines.map((line, i) => {
              const isFlagged = line.type !== "normal" && line.messages.length > 0;
              const isOpen = expanded.has(i);
              return (
                <div key={i}>
                  <div
                    onClick={isFlagged ? () => toggleExpanded(i) : undefined}
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
                      <span className="shrink-0 px-2 py-0.5 self-center text-xs" style={{ color: line.type === "error" ? "rgba(252,165,165,0.6)" : "rgba(253,224,71,0.6)", fontFamily: "var(--app-font-sans)", display: "inline-block", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>›</span>
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

        <p className="text-xs text-center mb-3" style={{ color: "hsl(215 14% 38%)" }}>
          🔗 This link is permanent — it won't expire.
        </p>

        {/* CTA */}
        <div className="rounded-xl px-4 py-4 text-center flex flex-col gap-3" style={{ background: "hsl(222 16% 13%)", border: "1px solid hsl(220 13% 22%)" }}>
          <p className="text-sm font-medium" style={{ color: "hsl(210 20% 78%)" }}>Check your own code — free, no signup</p>
          <a
            href="/check"
            className="w-full rounded-xl py-3 text-sm font-semibold inline-block"
            style={{ background: "hsl(210 80% 60%)", color: "hsl(222 16% 6%)" }}
          >Try PasteCheck Free →</a>
        </div>
      </div>
    </div>
  );
}