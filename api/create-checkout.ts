import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const checkoutAttempts = new Map<string, { count: number; resetAt: number }>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limit — 5 checkout attempts per IP per hour (in-memory, resets on cold start)
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const entry = checkoutAttempts.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= 5) {
      return res.status(429).json({ error: "Too many requests — try again later" });
    }
    entry.count++;
  } else {
    checkoutAttempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
  }

  try {
    // Resolve user from auth header if present
    let clientReferenceId: string | undefined;
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) clientReferenceId = user.id;
    }

    const { plan } = req.body || {};
    const priceId = plan === "annual"
      ? process.env.STRIPE_ANNUAL_PRICE_ID as string
      : process.env.STRIPE_PRICE_ID as string;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      ...(clientReferenceId ? { client_reference_id: clientReferenceId } : {}),
      success_url: "https://www.pastecheck.co.uk/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://www.pastecheck.co.uk/check",
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}