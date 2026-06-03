import { useState } from "react";
import { Helmet } from "react-helmet-async";
import NavMenu from "@/components/NavMenu";
import { supabase } from "@/lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setStatus("loading");
    setError(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    if (err) {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4" style={{ background: "hsl(220 8% 9%)" }}>
      <Helmet>
        <title>Reset Password — PasteCheck</title>
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="https://www.pastecheck.co.uk/forgot-password" />
      </Helmet>
      <NavMenu />
      <div className="w-full max-w-sm flex flex-col gap-5">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-1" style={{ color: "hsl(210 20% 92%)" }}>Reset your password</h1>
          <p className="text-sm" style={{ color: "hsl(215 14% 52%)" }}>
            Enter your email and we'll send a reset link.
          </p>
        </div>

        {status === "sent" ? (
          <div
            className="rounded-xl px-4 py-4 text-sm text-center"
            style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.25)", color: "rgb(134,239,172)" }}
          >
            Check your inbox — a reset link is on its way.
          </div>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                background: "hsl(220 8% 13%)",
                border: `1px solid ${error ? "rgba(220,38,38,0.6)" : "hsl(220 13% 24%)"}`,
                color: "hsl(210 20% 88%)",
                caretColor: "hsl(262 83% 75%)",
              }}
            />
            {error && (
              <p className="text-xs -mt-2" style={{ color: "rgb(248,113,113)" }}>{error}</p>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={status === "loading"}
              className="w-full rounded-xl py-3 text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
              style={{
                background: status === "loading" ? "hsl(220 13% 22%)" : "hsl(262 83% 75%)",
                color: status === "loading" ? "hsl(215 14% 45%)" : "hsl(220 8% 6%)",
                border: "none",
                cursor: status === "loading" ? "not-allowed" : "pointer",
              }}
            >
              {status === "loading" ? "Sending..." : "Send reset link"}
            </button>
          </>
        )}

        <p className="text-xs text-center" style={{ color: "hsl(215 14% 40%)" }}>
          <a href="/login" style={{ color: "hsl(262 83% 75%)", textDecoration: "none" }}>Back to sign in</a>
        </p>
      </div>
    </div>
  );
}