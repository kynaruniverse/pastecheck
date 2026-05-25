import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

function generateShareId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // POST — save a check, return share ID
  if (req.method === "POST") {
    // Auth check — Pro users only
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: "Unauthorised" });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorised" });
    }
    const { data: userData } = await supabase
      .from("users")
      .select("is_pro")
      .eq("id", user.id)
      .single();
    if (!userData?.is_pro) {
      return res.status(403).json({ error: "Pro subscription required" });
    }

    // Payload size limit — 100KB
    const payloadSize = JSON.stringify(req.body).length;
    if (payloadSize > 100_000) {
      return res.status(413).json({ error: "Payload too large" });
    }

    const { code, language, lines } = req.body;

    if (!code || !language || !lines) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const id = generateShareId();

    const { error } = await supabase
      .from("shared_checks")
      .insert({ id, code, language, lines });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ id });
  }

  // GET — retrieve a check by ID
  if (req.method === "GET") {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Missing ID" });
    }

    const { data, error } = await supabase
      .from("shared_checks")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Check not found" });
    }

    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Method not allowed" });
}