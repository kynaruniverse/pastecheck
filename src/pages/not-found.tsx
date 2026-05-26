import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "hsl(220 8% 9%)" }}>
      <div className="text-center px-6">
        <p className="text-6xl font-bold text-[#ef4444] mb-4">404</p>
        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-slate-400 mb-8">This page doesn't exist or has been moved.</p>
        <button
          type="button"
          onClick={() => navigate("/check")}
          className="px-6 py-3 font-medium rounded-lg transition-colors"
          style={{ background: "hsl(262 83% 75%)", color: "hsl(220 8% 6%)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(262 83% 65%)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(262 83% 75%)")}
        >
          Go to PasteCheck
        </button>
      </div>
    </div>
  );
}