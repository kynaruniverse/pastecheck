import { randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

function generateShareId(): string {
  return randomBytes(10).toString("hex");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "POST") {
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

    // Persistent Distributed Rate Limit for Shares via Supabase Tracker Table
    const hourWindow = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    try {
      await supabase.from("rate_limits").delete().lt("created_at", hourWindow);
      const { count, error: countErr } = await supabase
        .from("rate_limits")
        .select("*", { count: "exact", head: true })
        .eq("identifier", `share_${user.id}`);

      if (countErr) throw countErr;

      if (count && count >= 20) {
        return res.status(429).json({ error: "Rate limit exceeded — try again later" });
      }

      await supabase.from("rate_limits").insert({ identifier: `share_${user.id}` });
    } catch (limErr) {
      console.error("[EXC_SHARE_LIMIT_ERR]", limErr);
      return res.status(500).json({ error: "Internal compliance check failure." });
    }

    const payloadSize = JSON.stringify(req.body).length;
    if (payloadSize > 100_000) {
      return res.status(413).json({ error: "Payload too large" });
    }

    const { code, language, lines } = req.body;
    if (!code || !language || !lines) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const id = generateShareId();

    try {
      const { error } = await supabase
        .from("shared_checks")
        .insert({ id, code, language, lines });

      if (error) throw error;
      return res.status(200).json({ id });
    } catch (err: any) {
      console.error("[EXC_SHARE_INSERT_ERR]", err);
      return res.status(500).json({ error: "Failed to persist shared execution checkpoint safely." });
    }
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