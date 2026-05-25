import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { supabase } from "@/lib/supabase";
import { type LintResult } from "@/lib/linter";
import NavMenu from "@/components/NavMenu";

interface SavedCheck {
  id: string;
  name: string | null;
  code: string;
  language: string;
  lines: LintResult["lines"];
  created_at: string;
}

interface Collection {
  id: string;
  name: string;
}

export default function CollectionDetail() {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [checks, setChecks] = useState<SavedCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }
  const { id: collectionId = "" } = useParams<{ id: string }>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = "/login";
      } else {
        fetchData();
      }
    });
  }, []);

  async function fetchData() {
    setLoading(true);
    const [colRes, checksRes] = await Promise.all([
      supabase.from("collections").select("id, name").eq("id", collectionId).single(),
      supabase
        .from("saved_checks")
        .select("id, name, code, language, lines, created_at")
        .eq("collection_id", collectionId)
        .order("created_at", { ascending: false }),
    ]);
    if (colRes.error || !colRes.data) {
      setError("Collection not found.");
    } else {
      setCollection(colRes.data);
      setChecks(checksRes.data ?? []);
    }
    setLoading(false);
  }

  async function handleDeleteCheck(id: string) {
    await supabase.from("saved_checks").delete().eq("id", id);
    setChecks((prev) => prev.filter((c) => c.id !== id));
  }

  const errorCount = (check: SavedCheck) =>
    check.lines.filter((l) => l.type === "error").length;
  const warningCount = (check: SavedCheck) =>
    check.lines.filter((l) => l.type === "warning").length;

  return (
    <div className="min-h-screen w-full" style={{ background: "hsl(222 16% 10%)" }}>
      <NavMenu />
      <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-8">

        <header className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <a href="/collections" style={{ textDecoration: "none" }}>
              <span className="text-sm" style={{ color: "hsl(210 80% 60%)" }}>← Collections</span>
            </a>
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "hsl(210 20% 92%)" }}>
            {collection?.name ?? "Loading..."}
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(215 14% 55%)" }}>
            Saved checks in this collection.
          </p>
        </header>

        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm flex items-center gap-2 mb-4"
            style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)", color: "rgb(253,224,71)" }}
          >
            <span>⚠</span><span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-sm text-center py-12" style={{ color: "hsl(215 14% 45%)" }}>Loading...</div>
        ) : checks.length === 0 ? (
          <div
            className="rounded-xl px-4 py-10 text-center flex flex-col items-center gap-2"
            style={{ background: "hsl(222 16% 13%)", border: "1px solid hsl(220 13% 22%)" }}
          >
            <span style={{ fontSize: "1.75rem" }}>📋</span>
            <p className="text-sm font-medium" style={{ color: "hsl(210 20% 72%)" }}>No saved checks yet</p>
            <p className="text-xs" style={{ color: "hsl(215 14% 45%)" }}>
              Run a check on the tool page, then save it to this collection.
            </p>
            <a href="/check">
              <button
                type="button"
                className="mt-2 px-4 py-2 rounded-lg text-xs font-semibold"
                style={{ background: "hsl(210 80% 60%)", color: "hsl(222 16% 6%)", border: "none", cursor: "pointer" }}
              >
                Go to tool
              </button>
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {checks.map((check) => {
              const errors = errorCount(check);
              const warnings = warningCount(check);
              return (
                <div
                  key={check.id}
                  className="rounded-xl px-4 py-3"
                  style={{ background: "hsl(222 16% 13%)", border: "1px solid hsl(220 13% 22%)" }}
                >
                  <div
                    className="flex items-start justify-between gap-2"
                    onClick={() => toggleExpanded(check.id)}
                    style={{ cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: "hsl(210 20% 82%)" }}>
                        {check.name || check.code.trim().split("\n")[0].slice(0, 48) || "Untitled check"}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs" style={{ color: "hsl(215 14% 45%)" }}>
                          {check.language}
                        </span>
                        {errors > 0 && (
                          <span className="text-xs" style={{ color: "rgb(248,113,113)" }}>
                            {errors} {errors === 1 ? "error" : "errors"}
                          </span>
                        )}
                        {warnings > 0 && (
                          <span className="text-xs" style={{ color: "rgb(253,224,71)" }}>
                            {warnings} {warnings === 1 ? "warning" : "warnings"}
                          </span>
                        )}
                        {errors === 0 && warnings === 0 && (
                          <span className="text-xs" style={{ color: "rgb(134,239,172)" }}>clean</span>
                        )}
                        <span className="text-xs" style={{ color: "hsl(215 14% 40%)" }}>
                          {new Date(check.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className="text-xs"
                        style={{
                          color: "hsl(215 14% 45%)",
                          display: "inline-block",
                          transform: expanded.has(check.id) ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.15s",
                        }}
                      >›</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteCheck(check.id); }}
                        className="text-xs px-2 py-1 rounded ml-1"
                        style={{ background: "none", border: "none", color: "hsl(215 14% 40%)", cursor: "pointer" }}
                      >✕</button>
                    </div>
                  </div>
                  {expanded.has(check.id) && (
                    <div
                      className="mt-2 rounded-lg px-3 py-2 overflow-x-auto"
                      style={{ background: "hsl(222 16% 10%)", fontFamily: "var(--app-font-mono)", fontSize: "11.5px", lineHeight: "1.6" }}
                    >
                      <pre style={{ color: "hsl(210 20% 72%)", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                        {check.code.trim()}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}