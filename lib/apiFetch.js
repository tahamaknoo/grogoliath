// Client-side fetch wrapper that automatically attaches the user's Supabase JWT
// to every request. All /api/* endpoints now require authentication, so use this
// instead of raw fetch().
//
// Usage:
//   const res = await apiFetch('/api/generate-page', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({...}),
//   });
//
import { supabase } from './supabaseClient';

export async function apiFetch(url, options = {}) {
  let token = null;
  try {
    const { data } = await supabase.auth.getSession();
    token = data?.session?.access_token || null;
  } catch {
    // Fall through — request will go unauthenticated and the server will 401.
  }

  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, { ...options, headers });
}
