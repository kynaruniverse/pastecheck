import { useState, useEffect } from "react";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";

export default function NavMenu() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    localStorage.removeItem("pastecheck_pro");
    localStorage.removeItem("pastecheck_licence");
    window.location.href = "/";
  }

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Check My Code", href: "/check" },
    { label: "About", href: "/about" },
  ];

  return (
    <>
      {/* ── Sticky top bar ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "48px",
          zIndex: 100,
          background: "hsl(222 16% 8%)",
          borderBottom: "1px solid hsl(220 13% 18%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        {/* Logo */}
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <Logo size="sm" />
        </a>

        {/* Nav links — hidden on small screens */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          className="hidden-mobile"
        >
          {navItems.map((item) => {
            const active = location === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  textDecoration: "none",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: active ? "hsl(210 80% 65%)" : "hsl(215 14% 55%)",
                  background: active ? "hsl(210 80% 60% / 0.1)" : "transparent",
                  transition: "color 0.1s, background 0.1s",
                  borderBottom: active ? "1px solid hsl(210 80% 60% / 0.4)" : "1px solid transparent",
                }}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right side — burger */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
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
      </div>

      {/* ── Spacer to push page content below fixed bar ── */}
      <div style={{ height: "48px" }} />

      {/* ── Backdrop ── */}
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

      {/* ── Drawer ── */}
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
          <Logo size="sm" />
          <button
            type="button"
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
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          {[...navItems, ...(isLoggedIn ? [{ label: "Collections", href: "/collections" }] : [])].map((item) => (
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
                  color: location === item.href ? "hsl(210 80% 65%)" : "hsl(210 20% 78%)",
                  background: location === item.href ? "hsl(210 80% 60% / 0.08)" : "transparent",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(220 13% 18%)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = location === item.href ? "hsl(210 80% 60% / 0.08)" : "transparent")}
              >
                {item.label}
              </div>
            </a>
          ))}
        </nav>

        {/* Auth action */}
        <div style={{ borderTop: "1px solid hsl(220 13% 20%)", paddingTop: "16px", marginTop: "8px" }}>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 500,
                color: "hsl(0 70% 65%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.1s",
                WebkitTapHighlightColor: "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(220 13% 18%)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              Sign out
            </button>
          ) : (
            <a href="/login" style={{ textDecoration: "none" }}>
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "hsl(210 80% 65%)",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(220 13% 18%)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Sign in
              </div>
            </a>
          )}
        </div>
      </div>
    </>
  );
}