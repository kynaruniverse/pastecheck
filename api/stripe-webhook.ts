import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).json({ error: "Missing signature or webhook secret" });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      return res.status(200).json({ received: true });
    }

    const userId = session.client_reference_id;

    if (!userId) {
      console.error("[stripe-webhook] Missing client_reference_id on completed session.");
      return res.status(400).json({ error: "Missing client reference linking parameter." });
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ 
        is_pro: true,
        stripe_customer_id: session.customer as string 
      })
      .eq("id", userId);

    if (updateError) {
      console.error("[stripe-webhook] Failed to update is_pro on checkout.session.completed:", updateError);
      return res.status(500).json({ error: "Failed to update user pro status" });
    }
  }

  // ── Subscription cancelled ─────────────────────────────────────────────────
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    if (!customerId) {
      return res.status(200).json({ received: true });
    }

    // Resolve user deterministic identifier mapping directly via explicit customer ID column mapping
    const { error } = await supabase
      .from("users")
      .update({ is_pro: false })
      .eq("stripe_customer_id", customerId);

    if (error) {
      console.error("[stripe-webhook] Failed to revoke is_pro on customer.subscription.deleted:", error);
      return res.status(500).json({ error: "Failed to revoke pro status on cancellation" });
    }
  }


  // ── Payment failed ─────────────────────────────────────────────────────────
  // NOTE: invoice.payment_failed fires on every retry attempt.
  // Only revoke on subscription deletion (customer.subscription.deleted), not here.
  // To safely revoke on persistent failure, handle `customer.subscription.updated`
  // where status becomes "past_due" or "unpaid" after all retries exhausted.
  if (false && event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;

    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      return res.status(200).json({ received: true });
    }

    const email = (customer as Stripe.Customer).email;
    if (!email) {
      return res.status(200).json({ received: true });
    }

    const { error } = await supabase
      .from("users")
      .update({ is_pro: false })
      .eq("email", email);

    if (error) {
      console.error("[stripe-webhook] Failed to revoke is_pro on invoice.payment_failed:", error);
      return res.status(500).json({ error: "Failed to revoke pro status on payment failure" });
    }
  }

  return res.status(200).json({ received: true });
}