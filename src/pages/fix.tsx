import { useParams } from "wouter";
import { Helmet } from "react-helmet-async";
import { fixPages } from "@/data/fixPages";
import FixPageCTA from "@/components/FixPageCTA";
import NotFound from "@/pages/not-found";
import NavMenu from "@/components/NavMenu";

export default function FixPage() {
  const { slug } = useParams<{ slug: string }>();
  const config = fixPages.find((p) => p.slug === slug);

  if (!config) return <NotFound />;

  return (
    <div
      className="min-h-screen px-4 py-12 max-w-2xl mx-auto"
      style={{ backgroundColor: "hsl(220 8% 9%)", color: "#e2e8f0" }}
    >
      <Helmet>
        <title>{config.title} | PasteCheck</title>
        <meta name="description" content={config.summary} />
        <link rel="canonical" href={`https://www.pastecheck.co.uk/fix/${config.slug}`} />
        <meta property="og:title" content={`${config.title} | PasteCheck`} />
        <meta property="og:description" content={config.summary} />
        <meta property="og:image" content="/opengraph.jpg" />
      </Helmet>

      <NavMenu />
      <p className="text-sm font-mono mb-3" style={{ color: "#a78bfa" }}>
        {config.language}
      </p>

      <h1 className="text-2xl font-bold mb-4 leading-tight">{config.title}</h1>

      <p className="text-base leading-relaxed mb-2" style={{ color: "#94a3b8" }}>
        {config.summary}
      </p>

      <FixPageCTA
        primaryCopy={config.primaryCtaCopy}
        secondaryLabel={config.secondaryCtaLabel}
        secondaryHref={config.secondaryCtaHref}
      />

      <h2 className="text-lg font-semibold mt-10 mb-3">Why this happens</h2>
      <p className="text-base leading-relaxed" style={{ color: "#94a3b8" }}>
        {config.whyItHappens}
      </p>

      <h2 className="text-lg font-semibold mt-10 mb-3">Broken example</h2>
      <pre
        className="rounded-lg p-4 text-sm overflow-x-auto"
        style={{ backgroundColor: "hsl(220 8% 13%)", color: "#ef4444" }}
      >
        <code>{config.brokenExample}</code>
      </pre>

      <h2 className="text-lg font-semibold mt-10 mb-3">Fixed example</h2>
      <pre
        className="rounded-lg p-4 text-sm overflow-x-auto"
        style={{ backgroundColor: "hsl(220 8% 13%)", color: "#4ade80" }}
      >
        <code>{config.fixedExample}</code>
      </pre>

      <h2 className="text-lg font-semibold mt-10 mb-3">Common causes</h2>
      <ul className="space-y-2">
        {config.commonCauses.map((cause, i) => (
          <li key={i} className="flex gap-2 text-base" style={{ color: "#94a3b8" }}>
            <span style={{ color: "#a78bfa" }}>→</span>
            {cause}
          </li>
        ))}
      </ul>

      <FixPageCTA
        primaryCopy={config.primaryCtaCopy}
        secondaryLabel={config.secondaryCtaLabel}
        secondaryHref={config.secondaryCtaHref}
      />
    </div>
  );
}