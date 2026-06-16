import { NextResponse } from 'next/server';
import { requireUser, safeError } from '../../../lib/apiAuth';

// Ping Unsplash's download_location URL when a user picks an image. This is
// required by Unsplash's API Guidelines — they use it to count "downloads"
// for the photographer and to gate our app's access tier. Failing to do this
// can get our API key revoked.
//
// POST /api/unsplash-track  { downloadLocation: "https://api.unsplash.com/..." }
export async function POST(request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    // Don't fail the user-facing pick if the key is missing — just no-op.
    return NextResponse.json({ ok: false, reason: 'no-key' });
  }

  try {
    const { downloadLocation } = await request.json();
    if (!downloadLocation || !String(downloadLocation).startsWith('https://api.unsplash.com/')) {
      return NextResponse.json({ error: 'Invalid downloadLocation.' }, { status: 400 });
    }
    // Fire-and-forget — we don't need the response body. Errors here don't
    // affect the user; we just log them.
    const res = await fetch(downloadLocation, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });
    return NextResponse.json({ ok: res.ok, status: res.status });
  } catch (e) {
    return safeError('unsplash-track', e);
  }
}
