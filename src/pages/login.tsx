import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const { error: sbError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: "https://www.pastecheck.co.uk/auth/callback",
      },
    });
    setLoading(false);
    if (sbError) {
      setError("Something went wrong — please try again.");
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4" style={{ background: "hsl(222 16% 10%)" }}>
      <div className="w-full max-w-sm flex flex-col gap-4">

        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-flex items-center justify-center rounded-lg w-8 h-8 text-sm font-bold"
            style={{ background: "hsl(210 80% 60%)", color: "hsl(222 16% 6%)" }}
          >P</span>
          <span className="text-xl font-bold tracking-tight" style={{ color: "hsl(210 20% 92%)" }}>
            PasteCheck
          </span>
        </div>

        {!sent ? (
          <>
            <div>
              <h1 className="text-lg font-semibold mb-1" style={{ color: "hsl(210 20% 92%)" }}>
                Sign in to Pro
              </h1>
              <p className="text-sm" style={{ color: "hsl(215 14% 55%)" }}>
                Enter your email — we'll send a magic link. No password needed.
              </p>
            </div>

            <div
              className="rounded-xl overflow-hidden border"
              style={{ borderColor: "hsl(220 13% 22%)" }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="your@email.com"
                autoFocus
                className="w-full outline-none text-sm px-4 py-3"
                style={{
                  background: "hsl(222 16% 12%)",
                  color: "hsl(210 20% 88%)",
                  caretColor: "hsl(210 80% 60%)",
                }}
              />
            </div>

            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm flex items-center gap-2"
                style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)", color: "rgb(253,224,71)" }}
              >
                <span className="shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={loading || !email.trim()}
              className="w-full rounded-xl py-3.5 text-sm font-semibold tracking-wide transition-all duration-150 active:scale-[0.98]"
              style={{
                background: email.trim() && !loading ? "hsl(210 80% 60%)" : "hsl(220 13% 20%)",
                color: email.trim() && !loading ? "hsl(222 16% 6%)" : "hsl(215 14% 40%)",
                border: "none",
                cursor: email.trim() && !loading ? "pointer" : "not-allowed",
              }}
            >
              {loading ? "Sending..." : "Send magic link"}
            </button>
          </>
        ) : (
          <div
            className="rounded-xl px-4 py-6 flex flex-col items-center gap-3 text-center"
            style={{ background: "hsl(222 16% 13%)", border: "1px solid hsl(220 13% 22%)" }}
          >
            <span style={{ fontSize: "2rem" }}>✉️</span>
            <p className="text-sm font-medium" style={{ color: "hsl(210 20% 88%)" }}>
              Check your email
            </p>
            <p className="text-xs" style={{ color: "hsl(215 14% 55%)" }}>
              We sent a sign-in link to <span style={{ color: "hsl(210 80% 60%)" }}>{email}</span>. Click it to access your Pro account.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}