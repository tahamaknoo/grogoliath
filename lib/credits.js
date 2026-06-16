// Server-side credit helpers for API routes. Reads use the caller's JWT so RLS
// scopes them to the user's own row; spends go through the SECURITY DEFINER
// `spend_credits` RPC, which is tamper-proof (it only ever decrements and
// resolves the user from auth.uid()).
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function userClient(token) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function bearerToken(request) {
  const h = request.headers.get("authorization") || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}

// Credits the user can spend right now = remaining monthly allotment + carry-over top-ups.
// Admins (is_admin=true) get Infinity — they're never metered.
export async function getAvailableCredits(token, userId) {
  const sb = userClient(token);
  const { data, error } = await sb
    .from("profiles")
    .select("monthly_credits, monthly_credits_used, topup_credits, is_admin")
    .eq("id", userId)
    .single();
  if (error || !data) return { available: 0, error: error?.message };
  if (data.is_admin === true) return { available: Infinity, admin: true };
  const monthly = Math.max(0, (data.monthly_credits || 0) - (data.monthly_credits_used || 0));
  return { available: monthly + (data.topup_credits || 0) };
}

// The user's current plan id (defaults to 'free'). Admins are reported as
// 'agency' so feature gates (CMS, HTML export, custom templates) treat them
// as top-tier without any caller changes.
export async function getProfilePlan(token, userId) {
  const sb = userClient(token);
  const { data, error } = await sb.from("profiles").select("plan, is_admin").eq("id", userId).single();
  if (error || !data) return "free";
  if (data.is_admin === true) return "agency";
  return String(data.plan || "free").toLowerCase();
}

// Spend `amount` credits. Returns { ok: true } if deducted, { ok: false } if
// the user didn't have enough (or the RPC failed). Admins are short-circuited
// — we never call the RPC for them, so no decrement happens.
export async function spendCredits(token, amount) {
  const sb = userClient(token);
  // Quick admin check; if true, skip the spend RPC entirely (no decrement).
  // RLS scopes this to the caller's own row, so they can't lie about another
  // user's admin status.
  const { data: prof } = await sb.from("profiles").select("is_admin").maybeSingle();
  if (prof?.is_admin === true) return { ok: true, admin: true };
  const { data, error } = await sb.rpc("spend_credits", { p_amount: amount });
  if (error) return { ok: false, error: error.message };
  return { ok: data === true };
}
