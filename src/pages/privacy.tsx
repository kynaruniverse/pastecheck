import { Helmet } from "react-helmet-async";
import NavMenu from "@/components/NavMenu";

export default function Privacy() {
  return (
    <div className="min-h-screen w-full" style={{ background: "hsl(220 8% 9%)" }}>
      <Helmet>
        <title>Privacy Policy — PasteCheck</title>
        <meta name="description" content="Privacy policy for PasteCheck. How we handle your data." />
      </Helmet>
      <div className="mx-auto w-full max-w-2xl px-5 pb-16">
        <NavMenu />
        <div className="flex flex-col gap-6 pt-8">
          <div>
            <h1 className="text-2xl font-extrabold mb-1" style={{ color: "hsl(210 20% 95%)" }}>Privacy Policy</h1>
            <p className="text-xs" style={{ color: "hsl(215 14% 40%)" }}>Last updated: May 2026</p>
          </div>

          {[
            {
              title: "What we collect",
              body: "PasteCheck does not collect or store the code you paste. All linting runs entirely in your browser — your code never leaves your device. If you create a Pro account, we store your email address and account status in Supabase. If you use the Share feature, your code and lint results are stored in Supabase to generate a permanent link. Payment is handled by Stripe — we do not store card details.",
            },
            {
              title: "How we use your data",
              body: "Your email is used solely to manage your account and send transactional emails (signup confirmation, password reset). We use Google Analytics to collect anonymous usage data — pages visited, events triggered, general location. No personally identifiable information is included in analytics. We do not sell, share, or trade your data with third parties.",
            },
            {
              title: "Cookies and local storage",
              body: "PasteCheck uses localStorage in your browser to store your recent check history and Pro status locally. No tracking cookies are set. Google Analytics may set its own cookies for session tracking — these are anonymised.",
            },
            {
              title: "Payments",
              body: "Pro subscriptions are processed by Stripe. When you upgrade, you are redirected to a Stripe-hosted checkout page. PasteCheck does not handle or store any payment card information. Stripe's privacy policy applies to all payment processing.",
            },
            {
              title: "Data retention",
              body: "Shared check results are stored indefinitely to preserve permanent links. Account data is retained until you request deletion. To request deletion of your account and associated data, email us at hello@pastecheck.co.uk.",
            },
            {
              title: "Your rights",
              body: "If you are in the UK or EU, you have the right to access, correct, or delete personal data we hold about you. Contact us at hello@pastecheck.co.uk to exercise these rights.",
            },
            {
              title: "Contact",
              body: "Questions about this policy? Email hello@pastecheck.co.uk.",
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