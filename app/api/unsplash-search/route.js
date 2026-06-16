import { NextResponse } from 'next/server';
import { requireUser, safeError } from '../../../lib/apiAuth';

// Server-side proxy to Unsplash search. Keeps UNSPLASH_ACCESS_KEY off the
// browser. Returns a slimmed-down result set with only the fields the picker
// UI needs, plus the download_location URL we have to ping (per Unsplash TOS)
// when a user picks an image.
//
// GET /api/unsplash-search?q=<query>&page=<n>&per_page=<m>
export async function GET(request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json(
      { error: 'Unsplash is not configured. Add UNSPLASH_ACCESS_KEY to .env.local.' },
      { status: 503 }
    );
  }

  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') || '').trim();
    const page = Number(url.searchParams.get('page') || '1');
    const perPage = Math.min(30, Math.max(1, Number(url.searchParams.get('per_page') || '12')));
    if (!q) {
      return NextResponse.json({ error: 'Missing search query (?q=…).' }, { status: 400 });
    }

    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&page=${page}&per_page=${perPage}&orientation=landscape&content_filter=high`;
    const res = await fetch(unsplashUrl, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json(
        { error: `Unsplash returned ${res.status}: ${text || res.statusText}` },
        { status: 502 }
      );
    }
    const data = await res.json();
    // Slim down the response. Keep only what the UI + attribution renderer need.
    const results = (data.results || []).map((p) => ({
      id: p.id,
      url: p.urls?.regular,          // ~1080w — good hero size
      thumb: p.urls?.small,          // ~400w — for grid thumbs
      alt: p.alt_description || p.description || q,
      photographer: p.user?.name || 'Unknown',
      photographer_url: p.user?.links?.html || 'https://unsplash.com',
      download_location: p.links?.download_location, // ping this when user picks
    })).filter((p) => p.url);
    return NextResponse.json({
      total: data.total || 0,
      total_pages: data.total_pages || 0,
      page,
      per_page: perPage,
      results,
    });
  } catch (e) {
    return safeError('unsplash-search', e);
  }
}
