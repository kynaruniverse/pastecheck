import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash");
      const type = params.get("type");

      if (tokenHash && type) {
        // Email confirmation link clicked
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "email",
        });

        if (error) {
          window.location.href = "/login";
        } else {
          // Confirmed — send to login with success banner
          window.location.href = "/login?confirmed=1";
        }
      } else {
        // Normal sign in callback
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          window.location.href = "/check";
        } else {
          window.location.href = "/login";
        }
      }
    }

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "hsl(220 8% 9%)" }}>
      <p className="text-sm" style={{ color: "hsl(215 14% 55%)" }}>Signing you in...</p>
    </div>
  );
}