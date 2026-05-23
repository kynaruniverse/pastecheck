import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.location.href = "/collections";
      } else {
        window.location.href = "/login";
      }
    });
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "hsl(222 16% 10%)" }}>
      <p className="text-sm" style={{ color: "hsl(215 14% 55%)" }}>Signing you in...</p>
    </div>
  );
}