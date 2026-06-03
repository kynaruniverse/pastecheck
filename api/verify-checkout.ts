import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { session_id, user_id } = req.body;
  if (!session_id || !user_id) {
    return res.status(400).json({ verified: false, error: "Missing session_id or user_id" });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ verified: false, error: "Authentication required" });
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user || user.id !== user_id) {
    return res.status(401).json({ verified: false, error: "Unauthorized or user mismatch" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(200).json({ verified: false });
    }

    // Validate that this session belongs to the requesting user
    if (!session.client_reference_id || session.client_reference_id !== user.id) {
      return res.status(200).json({ verified: false });
    }


    return res.status(200).json({ verified: true });
  } catch {
    return res.status(200).json({ verified: false });
  }
}