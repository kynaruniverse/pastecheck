import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import NavMenu from "@/components/NavMenu";
import { supabase } from "@/lib/supabase";

function generateLicenceKey(): string {
  return "pc_" + Math.random().toString(36).slice(2, 11) + Math.random().toString(36).slice(2, 11);
}

export default function Success() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<"loading" | "done">("loading");

  useEffect(() => {
    async function activate() {
      try {
        const existing = localStorage.getItem("pastecheck_licence");
        if (!existing) {
          const key = generateLicenceKey();
          localStorage.setItem("pastecheck_licence", key);
        }
        localStorage.setItem("pastecheck_pro", "true");

        // Write is_pro to Supabase if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("users")
            .update({ is_pro: true })
            .eq("id", user.id);
        }
      } catch {}
      setStatus("done");
    }
    activate();
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4" style={{ background: "hsl(222 16% 10%)" }}>
      <NavMenu />
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
        {status === "loading" ? (
          <div className="text-sm" style={{ color: "hsl(215 14% 55%)" }}>Activating Pro...</div>
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
            <button
              onClick={() => navigate("/check")}
              className="w-full rounded-xl py-3.5 text-sm font-semibold"
              style={{ background: "hsl(210 80% 60%)", color: "hsl(222 16% 6%)", border: "none", cursor: "pointer" }}
            >
              Start Checking
            </button>
          </>
        )}
      </div>
    </div>
  );
}