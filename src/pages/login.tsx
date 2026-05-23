import { useState } from "react";
import { supabase } from "@/lib/supabase";
import NavMenu from "@/components/NavMenu";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      if (err.message.includes("Email not confirmed")) {
        setError("Please confirm your email first — check your inbox for the confirmation link.");
      } else if (err.message.includes("Invalid login credentials")) {
        setError("Incorrect email or password. Try again or sign up for a new account.");
      } else {
        setError(err.message);
      }
      return;
    }
    window.location.href = "/collections";
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4" style={{ background: "hsl(222 16% 10%)" }}>
      <NavMenu />
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-2">
          <span
            className="inline-flex items-center justify-center rounded-xl w-12 h-12 text-lg font-bold"
            style={{ background: "hsl(210 80% 60%)", color: "hsl(222 16% 6%)" }}
          >P</span>
          <span className="text-base font-bold tracking-tight" style={{ color: "hsl(210 20% 92%)" }}>PasteCheck</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl px-6 py-7 flex flex-col gap-5" style={{ background: "hsl(222 16% 14%)", border: "1px solid hsl(220 13% 22%)" }}>
          <div>
            <h1 className="text-xl font-bold mb-1" style={{ color: "hsl(210 20% 92%)" }}>Sign in</h1>
            <p className="text-sm" style={{ color: "hsl(215 14% 52%)" }}>Welcome back to PasteCheck.</p>
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "hsla(0,70%,50%,0.12)", border: "1px solid hsla(0,70%,50%,0.25)", color: "rgb(248,113,113)" }}>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "hsl(215 14% 58%)" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "hsl(222 16% 10%)", border: "1px solid hsl(220 13% 26%)", color: "hsl(210 20% 90%)" }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "hsl(215 14% 58%)" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "hsl(222 16% 10%)", border: "1px solid hsl(220 13% 26%)", color: "hsl(210 20% 90%)" }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-bold"
            style={{ background: loading ? "hsl(220 13% 22%)" : "hsl(210 80% 60%)", color: loading ? "hsl(215 14% 45%)" : "hsl(222 16% 6%)", border: "none", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-center text-xs" style={{ color: "hsl(215 14% 48%)" }}>
            Don't have an account?{" "}
            <a href="/signup" style={{ color: "hsl(210 80% 65%)", textDecoration: "none", fontWeight: 600 }}>Sign up</a>
          </p>
        </div>

      </div>
    </div>
  );
}