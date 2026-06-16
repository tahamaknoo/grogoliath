"use client";
import { supabase } from "./supabaseClient";

export async function ensureProfile(sessionUser: any) {
  if (!sessionUser?.id) return null;

  // Pull every column so this works regardless of which optional fields exist.
  const { data: existing, error: selErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", sessionUser.id)
    .maybeSingle();

  if (selErr) {
    console.warn("ensureProfile select failed:", selErr.message);
    return null;
  }

  // Existing row is the source of truth — plan/credits are managed server-side
  // (Stripe webhook + spend_credits RPC), so never patch them from the client.
  if (existing) return existing;

  // No row yet — create a Free-tier profile with the one-time 5 credits.
  // Once the signup trigger is in place server-side this branch won't run
  // (the row will already exist), so it's a safe fallback.
  const payload = {
    id: sessionUser.id,
    email: sessionUser.email,
    plan: "free",
    monthly_credits: 5,        // Free's 5 one-time credits live in the monthly bucket
    monthly_credits_used: 0,   // (Free's plan never resets, so they don't refill)
    topup_credits: 0,
    credits_initialized: true,
  };

  const { data: created, error: insErr } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id", ignoreDuplicates: false })
    .select()
    .single();

  if (insErr) {
    console.warn("ensureProfile upsert failed:", insErr.message);
    const { data: fallback } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", sessionUser.id)
      .maybeSingle();
    return fallback ?? null;
  }
  return created;
}
