// Server-side auth guard for API routes.
// Verifies the caller's Supabase JWT before any expensive AI/storage work runs.
//
// Usage in a route:
//   const auth = await requireUser(request);
//   if (auth.error) return auth.error;          // 401 NextResponse already built
//   const userId = auth.user.id;                // safe to use
//
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client = null;
function getServerClient() {
  if (!_client) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Supabase env vars not set on server.");
    }
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _client;
}

// Safe error response — never expose internal error messages in production.
// Logs the real error server-side and returns a generic message to the client.
export function safeError(label, err, status = 500) {
  // eslint-disable-next-line no-console
  console.error(`[api] ${label}:`, err);
  const isProd = process.env.NODE_ENV === "production";
  return NextResponse.json(
    {
      error: isProd ? "Something went wrong. Please try again." : String(err?.message || err),
    },
    { status }
  );
}

export async function requireUser(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return {
      error: NextResponse.json({ error: "Not signed in." }, { status: 401 }),
    };
  }
  try {
    const sb = getServerClient();
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data?.user) {
      return {
        error: NextResponse.json({ error: "Invalid session." }, { status: 401 }),
      };
    }
    return { user: data.user };
  } catch (e) {
    return {
      error: NextResponse.json({ error: "Auth check failed." }, { status: 500 }),
    };
  }
}
