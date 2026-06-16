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
import { supabase, SUPABASE_URL } from './supabaseClient';

// Supabase stores its session in localStorage under sb-<projectref>-auth-token.
// Reading it directly is instant and avoids supabase.auth.getSession() stalls.
function getTokenFromLocalStorage() {
  if (typeof window === 'undefined') return null;
  try {
    // Project ref is the subdomain of the Supabase URL.
    const match = SUPABASE_URL?.match(/https?:\/\/([^.]+)\./);
    const ref = match?.[1];
    if (!ref) return null;
    const raw = window.localStorage.getItem(`sb-${ref}-auth-token`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.access_token || parsed?.currentSession?.access_token || null;
  } catch {
    return null;
  }
}

// Try supabase.auth.getSession() with a tight timeout; fall back to localStorage
// so a slow Supabase client can't trap the user in a 401 loop.
async function getToken() {
  try {
    const { data } = await Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('session-timeout')), 1500)),
    ]);
    const token = data?.session?.access_token;
    if (token) return token;
  } catch {
    // Fall through.
  }
  return getTokenFromLocalStorage();
}

// Force a Supabase session refresh and return the new access token.
// Used to recover from 401s caused by expired tokens.
async function refreshAndGetToken() {
  try {
    const { data, error } = await Promise.race([
      supabase.auth.refreshSession(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('refresh-timeout')), 5000)),
    ]);
    if (error) return null;
    return data?.session?.access_token || null;
  } catch {
    return null;
  }
}

// Fetch a Supabase REST endpoint (e.g. /rest/v1/projects) with auth handled
// automatically. Mirrors apiFetch's refresh-on-401 logic: if the call comes
// back 401, we force a session refresh and retry once. A second 401 means the
// refresh token itself is gone, so sign the user out cleanly rather than
// trapping them in a stale-token loop.
//
// Pass path as either a full URL or a relative path starting with `/`.
export async function supabaseFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${SUPABASE_URL}${path}`;
  const token = await getToken();

  const buildHeaders = (t) => {
    const h = new Headers(options.headers || {});
    if (!h.has('apikey')) h.set('apikey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
    if (t) h.set('Authorization', `Bearer ${t}`);
    return h;
  };

  let res = await fetch(url, { ...options, headers: buildHeaders(token) });

  if (res.status === 401) {
    const fresh = await refreshAndGetToken();
    if (fresh) {
      res = await fetch(url, { ...options, headers: buildHeaders(fresh) });
    }
    if (res.status === 401) {
      try { await supabase.auth.signOut(); } catch {}
    }
  }

  return res;
}

export async function apiFetch(url, options = {}) {
  const token = await getToken();

  const headers = new Headers(options.headers || {});
  const userSetAuth = headers.has('Authorization');
  if (token && !userSetAuth) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res = await fetch(url, { ...options, headers });

  // 401? Token might be expired. Try once with a freshly refreshed token.
  if (res.status === 401 && !userSetAuth) {
    const fresh = await refreshAndGetToken();
    if (fresh) {
      const retryHeaders = new Headers(options.headers || {});
      retryHeaders.set('Authorization', `Bearer ${fresh}`);
      res = await fetch(url, { ...options, headers: retryHeaders });
    }

    // If even the retry comes back 401, the refresh token itself is gone
    // (expired or revoked). Sign the user out so the onAuthStateChange
    // listener bounces them back to the login screen, instead of leaving
    // them stuck in a "Try again" loop where every retry returns 401.
    // The wizard draft lives in localStorage so they can resume after
    // signing back in.
    if (res.status === 401) {
      try { await supabase.auth.signOut(); } catch {}
    }
  }

  return res;
}
