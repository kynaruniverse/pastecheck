import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a]">
      <div className="text-center px-6">
        <p className="text-6xl font-bold text-[#ef4444] mb-4">404</p>
        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-slate-400 mb-8">This page doesn't exist or has been moved.</p>
        <button
          type="button"
          onClick={() => navigate("/check")}
          className="px-6 py-3 bg-[#ef4444] hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
        >
          Go to PasteCheck
        </button>
      </div>
    </div>
  );
}