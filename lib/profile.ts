"use client";
import { supabase } from "./supabaseClient";

const PLAN_LIMITS: Record<string, { page_limit: number; project_limit: number }> = {
  basic: { page_limit: 100, project_limit: 3 },
  pro: { page_limit: 250, project_limit: 10 }
};

export async function ensureProfile(sessionUser: any) {
  if (!sessionUser?.id) return;

  // Check if profile exists
  const { data: existing, error: selErr } = await supabase
    .from("profiles")
    .select("id, plan, page_limit, pages_used, project_limit")
    .eq("id", sessionUser.id)
    .maybeSingle();

  // If exists, ensure plan limits match current pricing
  if (existing && !selErr) {
    const planKey = String(existing.plan || "basic").toLowerCase();
    const limits = PLAN_LIMITS[planKey];
    if (limits) {
      const patch: Record<string, any> = {};
      if (Number(existing.page_limit) !== limits.page_limit) patch.page_limit = limits.page_limit;
      if (existing.project_limit === null || existing.project_limit === undefined) {
        patch.project_limit = limits.project_limit;
      }
      if (Object.keys(patch).length > 0) {
        const { data: updated, error: updErr } = await supabase
          .from("profiles")
          .update(patch)
          .eq("id", sessionUser.id)
          .select()
          .single();
        if (!updErr && updated) return updated;
      }
    }
    return existing;
  }

  // Create default profile
  const payload = {
    id: sessionUser.id,
    email: sessionUser.email,
    plan: "basic",
    page_limit: PLAN_LIMITS.basic.page_limit,
    pages_used: 0,
    project_limit: PLAN_LIMITS.basic.project_limit,
  };

  const { data: created, error: insErr } = await supabase
    .from("profiles")
    .insert(payload)
    .select()
    .single();

  if (insErr) throw insErr;
  return created;
}
