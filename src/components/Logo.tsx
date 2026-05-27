interface LogoProps {
  size?: "sm" | "lg";
  onClick?: () => void;
}

export default function Logo({ size = "sm", onClick }: LogoProps) {
  const isLg = size === "lg";
  return (
    <div
      className={`flex ${isLg ? "flex-col items-center gap-2" : "items-center gap-2"}`}
      style={{ cursor: onClick ? "pointer" : undefined }}
      onClick={onClick}
    >
      <span
        className={`inline-flex items-center justify-center font-bold shrink-0 ${
          isLg
            ? "rounded-xl w-12 h-12 text-lg"
            : "rounded-lg w-8 h-8 text-sm"
        }`}
        style={{ background: "hsl(262 83% 75%)", color: "hsl(220 8% 6%)" }}
      >
        {"</>"}
      </span>
      <span
        className={`font-bold tracking-tight ${isLg ? "text-base" : "text-base"}`}
        style={{ color: "hsl(210 20% 92%)" }}
      >
        PasteCheck
      </span>
    </div>
  );
}