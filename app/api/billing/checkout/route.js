import { NextResponse } from 'next/server';
import { requireUser, safeError } from '../../../../lib/apiAuth';
import { createCheckout, variantIdFor } from '../../../../lib/lemonsqueezy';

// POST /api/billing/checkout
// Body: { plan: 'starter' | 'growth' | 'agency' | 'topup', interval?: 'monthly' | 'annual' }
//
// For subscriptions, `interval` is required. For 'topup', it's ignored.
// Returns { url } — the LS hosted checkout URL the client should redirect to.
//
// The user's Supabase id is stamped into the checkout's custom_data so the
// webhook handler can identify them on the way back. We never trust the
// redirect URL to confirm payment — only the webhook.
export async function POST(request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;

  try {
    const { plan, interval } = await request.json();
    const allowedPlans = new Set(['starter', 'growth', 'agency', 'topup']);
    if (!plan || !allowedPlans.has(plan)) {
      return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 });
    }
    if (plan !== 'topup') {
      if (!interval || !['monthly', 'annual'].includes(interval)) {
        return NextResponse.json({ error: 'Invalid interval. Use "monthly" or "annual".' }, { status: 400 });
      }
    }

    const variantId = variantIdFor(plan, interval);
    if (!variantId) {
      return NextResponse.json(
        { error: 'This plan is not configured yet — check that the LS variant ID env var is set.' },
        { status: 503 }
      );
    }

    // Bounce back to Settings → Plans after checkout. The query param lets the
    // UI show a friendly "subscription is being activated" notice (the actual
    // plan switch happens via webhook, not this redirect).
    const origin = request.headers.get('origin') || (process.env.NEXT_PUBLIC_APP_URL || '');
    const redirectUrl = origin ? `${origin}/?tab=settings&section=plans&checkout=success` : undefined;

    const url = await createCheckout({
      variantId,
      userId: auth.user.id,
      userEmail: auth.user.email,
      redirectUrl,
    });
    return NextResponse.json({ url });
  } catch (e) {
    return safeError('billing-checkout', e);
  }
}
