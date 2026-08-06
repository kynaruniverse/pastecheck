interface FooterProps {
  showHomeLink?: boolean;
}

export default function Footer({ showHomeLink = false }: FooterProps) {
  return (
    <div
      className="py-8 flex flex-col items-center gap-3"
      style={{ borderTop: "1px solid hsl(220 13% 16%)" }}
    >
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <a href="/privacy" className="text-xs py-2 px-1" style={{ color: "hsl(215 16% 60%)", textDecoration: "none" }}>Privacy Policy</a>
        <span style={{ color: "hsl(215 16% 38%)", fontSize: "10px" }}>·</span>
        <a href="/terms" className="text-xs py-2 px-1" style={{ color: "hsl(215 16% 60%)", textDecoration: "none" }}>Terms of Service</a>
        <span style={{ color: "hsl(215 16% 38%)", fontSize: "10px" }}>·</span>
        <a href="/about" className="text-xs py-2 px-1" style={{ color: "hsl(215 16% 60%)", textDecoration: "none" }}>About</a>
        {showHomeLink && (
          <>
            <span style={{ color: "hsl(215 16% 38%)", fontSize: "10px" }}>·</span>
            <a href="/" className="text-xs py-2 px-1" style={{ color: "hsl(215 16% 60%)", textDecoration: "none" }}>Home</a>
          </>
        )}
      </div>
      <p className="text-xs" style={{ color: "hsl(215 16% 42%)" }}>© {new Date().getFullYear()} PasteCheck</p>
    </div>
  );
}
