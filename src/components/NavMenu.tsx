import { useState } from "react";

export default function NavMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Burger button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          top: "16px",
          right: "16px",
          zIndex: 100,
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: "hsl(222 16% 16%)",
          border: "1px solid hsl(220 13% 24%)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span style={{ display: "block", width: "16px", height: "1.5px", background: "hsl(210 20% 72%)", borderRadius: "2px" }} />
        <span style={{ display: "block", width: "16px", height: "1.5px", background: "hsl(210 20% 72%)", borderRadius: "2px" }} />
        <span style={{ display: "block", width: "16px", height: "1.5px", background: "hsl(210 20% 72%)", borderRadius: "2px" }} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 101,
            background: "rgba(0,0,0,0.5)",
          }}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "240px",
          zIndex: 102,
          background: "hsl(222 16% 13%)",
          borderLeft: "1px solid hsl(220 13% 22%)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
          padding: "24px 20px",
        }}
      >
        {/* Drawer header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                width: "28px",
                height: "28px",
                fontSize: "12px",
                fontWeight: 700,
                background: "hsl(210 80% 60%)",
                color: "hsl(222 16% 6%)",
              }}
            >P</span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "hsl(210 20% 92%)" }}>PasteCheck</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "hsl(215 14% 50%)",
              fontSize: "18px",
              lineHeight: 1,
              WebkitTapHighlightColor: "transparent",
            }}
          >✕</button>
        </div>

        {/* Nav links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {[
            { label: "Home", href: "/" },
            { label: "Check My Code", href: "/check" },
            { label: "Collections", href: "/collections" },
            { label: "About", href: "/about" },
            { label: "Account", href: "/login" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "hsl(210 20% 78%)",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(220 13% 18%)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {item.label}
              </div>
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}