import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

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

export default async function handler(req: any, res: any) {
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
    const email = session.customer_email;

    if (!userId && !email) {
      return res.status(200).json({ received: true });
    }

    let updateError: any = null;

    if (userId) {
      const { error } = await supabase
        .from("users")
        .update({ is_pro: true })
        .eq("id", userId);
      updateError = error;
    } else if (email) {
      const { error } = await supabase
        .from("users")
        .update({ is_pro: true })
        .eq("email", email);
      updateError = error;
    }

    if (updateError) {
      return res.status(500).json({ error: "Failed to update user pro status" });
    }
  }

  // ── Subscription cancelled ─────────────────────────────────────────────────
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    // Look up Stripe customer to get email
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
      return res.status(500).json({ error: "Failed to revoke pro status on cancellation" });
    }
  }

  // ── Payment failed ─────────────────────────────────────────────────────────
  if (event.type === "invoice.payment_failed") {
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
      return res.status(500).json({ error: "Failed to revoke pro status on payment failure" });
    }
  }

  return res.status(200).json({ received: true });
}