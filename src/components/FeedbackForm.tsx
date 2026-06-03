import { useState } from "react";

type Accuracy = "yes" | "no" | null;
type Status = "idle" | "submitting" | "success" | "error";

const FORM_ID = import.meta.env.VITE_FORMSPREE_ID as string | undefined;

export default function FeedbackForm() {
  const [open, setOpen] = useState(false);
  const [accuracy, setAccuracy] = useState<Accuracy>(null);
  const [suggestions, setSuggestions] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit() {
    if (!FORM_ID) return;
    if (!accuracy && !suggestions.trim()) return;
    setStatus("submitting");
    try {
      const res = await fetch(`https://formspree.io/f/${FORM_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          accurate: accuracy ?? "not answered",
          suggestions: suggestions.trim() || "(none)",
        }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  function handleReset() {
    setOpen(false);
    setAccuracy(null);
    setSuggestions("");
    setStatus("idle");
  }

  if (!FORM_ID) {
    return null;
  }

  return (
    <div className="w-full">
      {!open ? (
        <div className="flex justify-center pt-1 pb-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full rounded-xl py-3 text-sm font-medium transition-all duration-150 active:scale-[0.98]"
            style={{
              background: "hsl(220 8% 15%)",
              color: "hsl(210 20% 72%)",
              border: "1px solid hsl(220 13% 26%)",
              cursor: "pointer",
            }}
          >
            💬 Was this helpful? Leave feedback
          </button>
        </div>
      ) : (
        <div
          className="rounded-2xl px-5 py-5 mb-4"
          style={{
            background: "hsl(222 16% 13%)",
            border: "1px solid hsl(220 13% 21%)",
          }}
        >
          {status === "success" ? (
            <div className="flex flex-col items-center gap-2 py-3 text-center">
              <span className="text-xl">✓</span>
              <p className="text-sm font-medium" style={{ color: "hsl(210 20% 88%)" }}>
                Thanks for your feedback!
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-1 text-xs"
                style={{ color: "hsl(215 14% 45%)", background: "none", border: "none", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(215 14% 45%)" }}>
                  Quick feedback
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "hsl(215 14% 40%)", fontSize: "16px", lineHeight: 1, padding: "2px 4px" }}
                >
                  ×
                </button>
              </div>

              {/* Q1 */}
              <div className="mb-4">
                <p className="text-sm mb-2.5" style={{ color: "hsl(210 20% 82%)" }}>
                  Did PasteCheck find your errors correctly?
                </p>
                <div className="flex gap-2">
                  {(["yes", "no"] as const).map((val) => (
                    <button
                      key={val}
                      type="button"
                    onClick={() => setAccuracy(val)}
                    className="flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-100 active:scale-[0.97]"
                      style={{
                        background:
                          accuracy === val
                            ? val === "yes"
                              ? "rgba(34,197,94,0.18)"
                              : "rgba(239,68,68,0.16)"
                            : "hsl(220 13% 19%)",
                        color:
                          accuracy === val
                            ? val === "yes"
                              ? "rgb(134,239,172)"
                              : "rgb(252,165,165)"
                            : "hsl(215 14% 55%)",
                        border:
                          accuracy === val
                            ? val === "yes"
                              ? "1px solid rgba(34,197,94,0.3)"
                              : "1px solid rgba(239,68,68,0.28)"
                            : "1px solid hsl(220 13% 24%)",
                        cursor: "pointer",
                      }}
                    >
                      {val === "yes" ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q2 */}
              <div className="mb-4">
                <p className="text-sm mb-2" style={{ color: "hsl(210 20% 82%)" }}>
                  Any suggestions or issues?
                </p>
                <textarea
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  placeholder="Optional — tell us anything..."
                  rows={3}
                  spellCheck={false}
                  className="w-full resize-none rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{
                    background: "hsl(220 8% 9%)",
                    color: "hsl(210 20% 85%)",
                    border: "1px solid hsl(220 13% 24%)",
                    fontFamily: "var(--app-font-sans)",
                    caretColor: "hsl(262 83% 75%)",
                    lineHeight: "1.55",
                  }}
                />
              </div>

              {status === "error" && (
                <p className="text-xs mb-3" style={{ color: "rgb(252,165,165)" }}>
                  Something went wrong — please try again.
                </p>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={status === "submitting"}
                className="w-full rounded-xl py-3 text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
                style={{
                  background: status === "submitting" ? "hsl(220 13% 22%)" : "hsl(262 83% 75%)",
                  color: status === "submitting" ? "hsl(215 14% 45%)" : "hsl(220 8% 6%)",
                  border: "none",
                  cursor: status === "submitting" ? "not-allowed" : "pointer",
                }}
              >
                {status === "submitting" ? "Submitting…" : "Submit"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
