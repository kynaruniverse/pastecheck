import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        window.location.href = "/collections";
      } else if (event === "USER_UPDATED" && session) {
        // Email confirmed — send to login to sign in properly
        window.location.href = "/login";
      } else {
        // Fallback — wait a moment then check
        setTimeout(() => {
          supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
              window.location.href = "/collections";
            } else {
              window.location.href = "/login";
            }
          });
        }, 2000);
      }
    });
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "hsl(222 16% 10%)" }}>
      <p className="text-sm" style={{ color: "hsl(215 14% 55%)" }}>Signing you in...</p>
    </div>
  );
}