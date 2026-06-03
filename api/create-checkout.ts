import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Resolve user from auth header first to bind limit verification securely
  let clientReferenceId: string | undefined;
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Authentication required to upgrade to Pro." });
  }
  
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: "You must be signed in to upgrade to Pro." });
  }
  clientReferenceId = user.id;

  // Persistent Rate Limit using a dedicated tracking table in Supabase
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? "unknown";
  const nowWindow = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  try {
    // Prune stale records historical to current threshold
    await supabase.from("rate_limits").delete().lt("created_at", nowWindow);

    // Count operations executed inside the active window
    const { count, error: countErr } = await supabase
      .from("rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("identifier", clientReferenceId || ip);

    if (countErr) throw countErr;

    if (count && count >= 5) {
      return res.status(429).json({ error: "Too many requests — try again later" });
    }

    // Log the current operational access transaction securely
    await supabase.from("rate_limits").insert({ identifier: clientReferenceId || ip });

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
      client_reference_id: clientReferenceId,
      customer_email: user.email,
      success_url: "https://www.pastecheck.co.uk/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://www.pastecheck.co.uk/check",
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error("[EXC_CHECKOUT_ERR]", err);
    return res.status(500).json({ error: "An unexpected payment error occurred on the server. Please check your account state." });
  }
}
