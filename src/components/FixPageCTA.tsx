import { Link, useLocation } from "wouter";

interface FixPageCTAProps {
  primaryCopy: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export default function FixPageCTA({ primaryCopy, secondaryLabel, secondaryHref }: FixPageCTAProps) {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col items-start gap-3 my-8">
      <button
        type="button"
        onClick={() => navigate("/check")}
        className="px-6 py-3 rounded-lg font-semibold text-white"
        style={{ backgroundColor: "#a78bfa" }}
      >
        {primaryCopy}
      </button>
      {secondaryLabel && secondaryHref && (
        <Link
          href={secondaryHref}
          className="text-sm underline underline-offset-4"
          style={{ color: "#a78bfa" }}
        >
          {secondaryLabel}
        </Link>
      )}
    </div>
  );
}