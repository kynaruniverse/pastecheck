import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end();

  const { session_id, user_id } = req.body;
  if (!session_id || !user_id) return res.status(400).json({ verified: false });

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(200).json({ verified: false });
    }

    return res.status(200).json({ verified: true });
  } catch {
    return res.status(200).json({ verified: false });
  }
}