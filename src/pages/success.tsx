import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import NavMenu from "@/components/NavMenu";
import { supabase } from "@/lib/supabase";

export default function Success() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<"loading" | "done" | "unverified">("loading");

  useEffect(() => {
    async function activate() {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");

        const { data: { user } } = await supabase.auth.getUser();

        if (!sessionId || !user) {
          setStatus("unverified");
          return;
        }

        // Server-side verification: confirm session belongs to this user
        const res = await fetch("/api/verify-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, user_id: user.id }),
        });
        const json = await res.json();
        if (!json.verified) {
          setStatus("unverified");
          return;
        }

        // Webhook handles is_pro write — success.tsx is read-only
        localStorage.setItem("pastecheck_pro", "true");
      } catch {}
      setStatus("done");
    }
    activate();
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4" style={{ background: "hsl(220 8% 9%)" }}>
      <NavMenu />
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
        {status === "loading" ? (
          <div className="text-sm" style={{ color: "hsl(215 14% 55%)" }}>Activating Pro...</div>
        ) : status === "unverified" ? (
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)" }}
            >✕</div>
            <div>
              <h1 className="text-xl font-bold mb-2" style={{ color: "hsl(210 20% 92%)" }}>Verification failed</h1>
              <p className="text-sm" style={{ color: "hsl(215 14% 55%)" }}>
                We couldn't verify your payment. If you were charged, please contact support.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}
            >✓</div>
            <div>
              <h1 className="text-xl font-bold mb-2" style={{ color: "hsl(210 20% 92%)" }}>
                You're Pro
              </h1>
              <p className="text-sm" style={{ color: "hsl(215 14% 55%)" }}>
                Multi-file mode, shareable links, and saved collections are now unlocked. Welcome to PasteCheck Pro.
              </p>
            </div>
            <div className="w-full flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(215 14% 45%)" }}>
                What to do first
              </p>
              {[
                { icon: "📂", label: "Try Multi-File Mode", desc: "Check up to 5 files at once", href: "/check" },
                { icon: "🔗", label: "Share a Check", desc: "Generate a permanent link to any result", href: "/check" },
                { icon: "📁", label: "Create a Collection", desc: "Save and organise your checks", href: "/collections" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => navigate(item.href)}
                  className="w-full rounded-xl px-4 py-3 flex items-center gap-3 text-left transition-all duration-150 active:scale-[0.98]"
                  style={{
                    background: "hsl(220 8% 15%)",
                    border: "1px solid hsl(220 13% 24%)",
                    cursor: "pointer",
                  }}
                >
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "hsl(210 20% 88%)" }}>{item.label}</p>
                    <p className="text-xs" style={{ color: "hsl(215 14% 48%)" }}>{item.desc}</p>
                  </div>
                  <span className="ml-auto text-sm shrink-0" style={{ color: "hsl(215 14% 40%)" }}>›</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}