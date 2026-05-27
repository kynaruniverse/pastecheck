import { Helmet } from "react-helmet-async";
import NavMenu from "@/components/NavMenu";

export default function Terms() {
  return (
    <div className="min-h-screen w-full" style={{ background: "hsl(220 8% 9%)" }}>
      <Helmet>
        <title>Terms of Service — PasteCheck</title>
        <meta name="description" content="Terms of service for PasteCheck." />
      </Helmet>
      <div className="mx-auto w-full max-w-2xl px-5 pb-16">
        <NavMenu />
        <div className="flex flex-col gap-6 pt-8">
          <div>
            <h1 className="text-2xl font-extrabold mb-1" style={{ color: "hsl(210 20% 95%)" }}>Terms of Service</h1>
            <p className="text-xs" style={{ color: "hsl(215 14% 40%)" }}>Last updated: May 2026</p>
          </div>

          {[
            {
              title: "Acceptance",
              body: "By using PasteCheck you agree to these terms. If you do not agree, do not use the service.",
            },
            {
              title: "What PasteCheck is",
              body: "PasteCheck is a browser-based code linting tool. It highlights syntax errors and warnings in JavaScript, TypeScript, Python, HTML, and CSS. It is provided as a development aid only. It does not guarantee that linted code is correct, complete, or production-ready.",
            },
            {
              title: "Free and Pro tiers",
              body: "The free tier is available without an account. The Pro tier requires an account and a paid subscription processed via Stripe. Pro subscriptions are billed monthly (£4/month) or annually (£35/year). You may cancel at any time — cancellation takes effect at the end of the current billing period. No refunds are issued for partial periods.",
            },
            {
              title: "Acceptable use",
              body: "You may not use PasteCheck to process code containing unlawful content, to attempt to reverse-engineer or circumvent the service, or to abuse the API or shared infrastructure. We reserve the right to suspend accounts that violate these terms.",
            },
            {
              title: "Shared content",
              body: "When you use the Share feature, your code and lint results are stored and accessible via a public URL. Do not share code containing passwords, API keys, personal data, or any information you do not intend to make publicly accessible.",
            },
            {
              title: "Disclaimer",
              body: "PasteCheck is provided 'as is' without warranty of any kind. We do not guarantee uptime, accuracy of linting results, or fitness for any particular purpose. Use at your own risk.",
            },
            {
              title: "Limitation of liability",
              body: "To the fullest extent permitted by law, PasteCheck and its operators shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.",
            },
            {
              title: "Governing law",
              body: "These terms are governed by the laws of England and Wales.",
            },
            {
              title: "Contact",
              body: "Questions about these terms? Email hello@pastecheck.co.uk.",
            },
          ].map((section) => (
            <div key={section.title} className="flex flex-col gap-2">
              <h2 className="text-sm font-bold" style={{ color: "hsl(210 20% 88%)" }}>{section.title}</h2>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(215 14% 55%)" }}>{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}