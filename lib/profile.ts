"use client";
import { supabase } from "./supabaseClient";

export async function ensureProfile(sessionUser: any) {
  if (!sessionUser?.id) return;

  // Check if profile exists
  const { data: existing, error: selErr } = await supabase
    .from("profiles")
    .select("id, plan, page_limit, pages_used, project_limit")
    .eq("id", sessionUser.id)
    .maybeSingle();

  // If exists, we're good
  if (existing && !selErr) return existing;

  // Create default profile
  const payload = {
    id: sessionUser.id,
    email: sessionUser.email,
    plan: "basic",
    page_limit: 150,
    pages_used: 0,
    project_limit: 3,
  };

  const { data: created, error: insErr } = await supabase
    .from("profiles")
    .insert(payload)
    .select()
    .single();

  if (insErr) throw insErr;
  return created;
}
