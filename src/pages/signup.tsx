import { useState } from "react";
import { supabase } from "@/lib/supabase";
import NavMenu from "@/components/NavMenu";
import Logo from "@/components/Logo";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSignup() {
    if (!email || !password || !confirm) { setError("Please fill in all fields."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-4" style={{ background: "hsl(222 16% 10%)" }}>
        <NavMenu />
        <div className="w-full max-w-sm flex flex-col gap-6">
          <Logo size="lg" />
          <div className="rounded-2xl px-6 py-7 flex flex-col gap-4 text-center" style={{ background: "hsl(222 16% 14%)", border: "1px solid hsl(220 13% 22%)" }}>
            <div className="text-3xl">📬</div>
            <h1 className="text-xl font-bold" style={{ color: "hsl(210 20% 92%)" }}>Check your email</h1>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(215 14% 52%)" }}>
              We've sent a confirmation link to <span style={{ color: "hsl(210 20% 80%)", fontWeight: 600 }}>{email}</span>. Click it to activate your account, then come back to sign in.
            </p>
            <a href="/login" style={{ textDecoration: "none" }}>
              <div className="w-full rounded-xl py-3 text-sm font-bold mt-2" style={{ background: "hsl(210 80% 60%)", color: "hsl(222 16% 6%)", cursor: "pointer" }}>
                Go to sign in
              </div>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4" style={{ background: "hsl(222 16% 10%)" }}>
      <NavMenu />
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* Logo */}
        <Logo size="lg" />

        {/* Card */}
        <div className="rounded-2xl px-6 py-7 flex flex-col gap-5" style={{ background: "hsl(222 16% 14%)", border: "1px solid hsl(220 13% 22%)" }}>
          <div>
            <h1 className="text-xl font-bold mb-1" style={{ color: "hsl(210 20% 92%)" }}>Create account</h1>
            <p className="text-sm" style={{ color: "hsl(215 14% 52%)" }}>Free to join. Upgrade to Pro anytime.</p>
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
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "hsl(215 14% 58%)" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "hsl(222 16% 10%)", border: "1px solid hsl(220 13% 26%)", color: "hsl(210 20% 90%)" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "hsl(215 14% 58%)" }}>Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "hsl(222 16% 10%)", border: "1px solid hsl(220 13% 26%)", color: "hsl(210 20% 90%)" }}
                onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              />
            </div>
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-bold"
            style={{ background: loading ? "hsl(220 13% 22%)" : "hsl(210 80% 60%)", color: loading ? "hsl(215 14% 45%)" : "hsl(222 16% 6%)", border: "none", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>

          <p className="text-center text-xs" style={{ color: "hsl(215 14% 48%)" }}>
            Already have an account?{" "}
            <a href="/login" style={{ color: "hsl(210 80% 65%)", textDecoration: "none", fontWeight: 600 }}>Sign in</a>
          </p>
        </div>

      </div>
    </div>
  );
}