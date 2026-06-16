import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireUser, safeError } from '../../../../lib/apiAuth';
import { getCustomerPortalUrl } from '../../../../lib/lemonsqueezy';
import { bearerToken } from '../../../../lib/credits';

// POST /api/billing/portal
// Returns { url } — a signed, time-limited Lemon Squeezy customer portal URL
// the user can visit to update payment method, change plan, or cancel.
//
// Requires the user to have an active subscription (i.e. `stripe_subscription_id`
// is populated on their profile — yes, the column is named `stripe_*` for
// historical reasons; it holds the LS subscription id now).
export async function POST(request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;

  try {
    const token = bearerToken(request);
    if (!token) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { data, error } = await sb
      .from('profiles')
      .select('stripe_subscription_id')
      .eq('id', auth.user.id)
      .single();
    if (error || !data?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription — nothing to manage yet.' },
        { status: 400 }
      );
    }

    const url = await getCustomerPortalUrl(data.stripe_subscription_id);
    return NextResponse.json({ url });
  } catch (e) {
    return safeError('billing-portal', e);
  }
}
