"use client";
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabaseClient";
import { brandKitLimit } from "./plans";

const sanitizeUrl = (raw) => {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;
  if (s.length > 2000) throw new Error('Logo URL is too long. Paste only the image URL — looks like extra text was pasted in.');
  if (!/^https?:\/\//i.test(s)) throw new Error('Logo URL must start with http:// or https://');
  return s;
};

/*
  ───────────────────────────────────────────────────────────────────────────
  Supabase setup — run this once in the SQL editor:

  create table public.brand_kits (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    primary_color text not null default '#075056',
    logo_url text,
    voice text,
    business_type text,
    business_description text,
    services text,
    usps text,
    target_customer text,
    phone text,
    years_in_business text,
    default_tone text,
    default_length text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );

  alter table public.brand_kits enable row level security;

  create policy "users read own kits" on public.brand_kits
    for select using (auth.uid() = user_id);
  create policy "users insert own kits" on public.brand_kits
    for insert with check (auth.uid() = user_id);
  create policy "users update own kits" on public.brand_kits
    for update using (auth.uid() = user_id);
  create policy "users delete own kits" on public.brand_kits
    for delete using (auth.uid() = user_id);

  ─── If your table already exists from the earlier setup, add the new columns: ───
  alter table public.brand_kits
    add column if not exists business_type text,
    add column if not exists business_description text,
    add column if not exists services text,
    add column if not exists usps text,
    add column if not exists target_customer text,
    add column if not exists phone text,
    add column if not exists years_in_business text,
    add column if not exists default_tone text,
    add column if not exists default_length text;
  ───────────────────────────────────────────────────────────────────────────
*/

// Brand-kit caps are driven by the single source of truth in lib/plans.js
// (Free 0, Starter 2, Growth 3, Agency 3).
export const limitForPlan = (plan) => brandKitLimit(String(plan || "free").toLowerCase());

const KIT_COLUMNS =
  "id, name, primary_color, logo_url, voice, business_type, business_description, services, usps, target_customer, phone, years_in_business, default_tone, default_length, created_at";

const buildKitWritePayload = (payload) => ({
  name: payload.name,
  primary_color: payload.primary_color || "#075056",
  logo_url: sanitizeUrl(payload.logo_url),
  voice: payload.voice || null,
  business_type: payload.business_type || null,
  business_description: payload.business_description || null,
  services: payload.services || null,
  usps: payload.usps || null,
  target_customer: payload.target_customer || null,
  phone: payload.phone || null,
  years_in_business: payload.years_in_business || null,
  default_tone: payload.default_tone || null,
  default_length: payload.default_length || null,
});

// All brand_kits operations bypass supabase-js and go through the PostgREST
// REST endpoint directly. supabase-js was getting stuck mid-flight on this table
// (PATCH/INSERT promises that never settled). fetch() is reliable.

const restHeaders = (accessToken) => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
});

const looksLikeMissingSchema = (status, body) => {
  if (status === 404 || status === 406) return true;
  if (status === 400 && /column|schema|relation/i.test(body || '')) return true;
  return false;
};

export async function fetchBrandKits(accessToken) {
  // No token = anon, RLS will return 0 rows (which is fine pre-login).
  const url = `${SUPABASE_URL}/rest/v1/brand_kits?select=${encodeURIComponent(KIT_COLUMNS)}&order=created_at.asc`;
  let res;
  try {
    res = await fetch(url, { method: 'GET', headers: restHeaders(accessToken) });
  } catch (e) {
    console.warn('fetchBrandKits network error:', e.message);
    return [];
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    if (!looksLikeMissingSchema(res.status, text)) {
      console.warn('fetchBrandKits failed:', res.status, text);
    }
    return [];
  }
  return await res.json();
}

export async function createBrandKit(userId, payload, accessToken) {
  console.log('[brandKits] createBrandKit start');
  if (!accessToken) throw new Error('Missing access token.');

  const url = `${SUPABASE_URL}/rest/v1/brand_kits`;
  const body = JSON.stringify({
    user_id: userId,
    ...buildKitWritePayload(payload),
  });

  console.log('[brandKits] POST', url, 'body bytes:', body.length);
  const start = performance.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...restHeaders(accessToken), Prefer: 'return=representation' },
    body,
  });
  console.log('[brandKits] POST done in', Math.round(performance.now() - start), 'ms — status', res.status);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Create failed (${res.status}): ${text || res.statusText}`);
  }
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : rows;
}

export async function updateBrandKit(id, payload, accessToken) {
  console.log('[brandKits] updateBrandKit start', { id });
  if (!accessToken) throw new Error('Missing access token.');

  const url = `${SUPABASE_URL}/rest/v1/brand_kits?id=eq.${encodeURIComponent(id)}`;
  const body = JSON.stringify({
    ...buildKitWritePayload(payload),
    updated_at: new Date().toISOString(),
  });

  console.log('[brandKits] PATCH', url, 'body bytes:', body.length);
  const start = performance.now();
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { ...restHeaders(accessToken), Prefer: 'return=representation' },
    body,
  });
  console.log('[brandKits] PATCH done in', Math.round(performance.now() - start), 'ms — status', res.status);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Update failed (${res.status}): ${text || res.statusText}`);
  }
  const rows = await res.json();
  const row = Array.isArray(rows) ? rows[0] : rows;
  if (!row) throw new Error('Update succeeded but server returned no row.');
  return row;
}

export async function deleteBrandKit(id, accessToken) {
  if (!accessToken) throw new Error('Missing access token.');
  const url = `${SUPABASE_URL}/rest/v1/brand_kits?id=eq.${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { ...restHeaders(accessToken), Prefer: 'return=representation' },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Delete failed (${res.status}): ${text || res.statusText}`);
  }
  const rows = await res.json().catch(() => []);
  return Array.isArray(rows) && rows.length > 0;
}

// Build a prompt fragment to inject into AI generation requests
export function brandKitToPromptFragment(kit) {
  if (!kit) return "";
  const lines = [];
  lines.push(`BRAND KIT (apply throughout the page):`);
  lines.push(`- Brand name: ${kit.name}`);
  if (kit.primary_color) lines.push(`- Primary color: ${kit.primary_color}`);
  if (kit.logo_url) lines.push(`- Logo URL: ${kit.logo_url}`);
  if (kit.voice) lines.push(`- Voice / tone: ${kit.voice}`);
  if (kit.business_type) lines.push(`- Business type: ${kit.business_type}`);
  if (kit.business_description) lines.push(`- About the business: ${kit.business_description}`);
  if (kit.services) lines.push(`- Services / offerings: ${kit.services}`);
  if (kit.usps) lines.push(`- Key differentiators (USPs): ${kit.usps}`);
  if (kit.target_customer) lines.push(`- Target customer: ${kit.target_customer}`);
  if (kit.phone) lines.push(`- Contact phone: ${kit.phone}`);
  if (kit.years_in_business) lines.push(`- Years in business: ${kit.years_in_business}`);
  return lines.join("\n");
}

// Map kit fields → wizard form fields so a single picker auto-fills the project intake
export function applyKitToProjectDraft(kit, draft = {}) {
  if (!kit) return draft;
  return {
    ...draft,
    businessType: draft.businessType || kit.business_type || "",
    businessDescription: draft.businessDescription || kit.business_description || "",
    services: draft.services || kit.services || "",
    usps: draft.usps || kit.usps || "",
    targetCustomer: draft.targetCustomer || kit.target_customer || "",
    phone: draft.phone || kit.phone || "",
    yearsInBusiness: draft.yearsInBusiness || kit.years_in_business || "",
    tone: draft.tone || kit.default_tone || draft.tone,
    length: draft.length || kit.default_length || draft.length,
  };
}
