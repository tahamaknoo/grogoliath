import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhookSignature, planFromVariantId } from '../../../../lib/lemonsqueezy';
import { PLANS } from '../../../../lib/plans';

// Lemon Squeezy webhook receiver.
//
// This endpoint MUST NOT use the requireUser auth guard — LS isn't sending a
// Supabase JWT; it's sending an HMAC-signed payload. We verify the X-Signature
// header against LEMONSQUEEZY_WEBHOOK_SECRET before trusting anything inside.
//
// Events handled:
//   - subscription_created       → user just subscribed: set plan + reset credits
//   - subscription_updated       → plan change OR renewal: re-derive plan/credits
//   - subscription_cancelled     → user clicked cancel; keep plan until period end
//   - subscription_expired       → cancellation took effect: drop to Free
//   - subscription_resumed       → user re-activated: restore plan
//   - order_created (one-time)   → $39 top-up purchase: add 100 to topup_credits
//
// Subscription orders ALSO fire order_created, but with a non-null subscription
// relationship. We ignore those here (the subscription_* events drive the
// profile update for subscriptions).
//
// Server-side updates use the service-role key to bypass RLS. The webhook is
// authenticated by signature, not by user JWT, so RLS would block any direct
// profile updates with the anon key.

// Disable Next.js body parsing — we need the RAW body for signature verification.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Webhook: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
};

// Extract the Supabase user id from a webhook event's `meta.custom_data`.
// We stamped this into the checkout when the user started the flow.
function extractUserId(meta) {
  const v = meta?.custom_data?.user_id;
  return v ? String(v) : null;
}

// Map a plan id → its monthly credit allotment (the value we reset to at
// subscription start / renewal). Reads from lib/plans.js so we have one source.
function creditsForPlan(planId) {
  return PLANS[planId]?.credits || 0;
}

export async function POST(request) {
  let rawBody;
  try {
    rawBody = await request.text(); // read raw text so signature matches exactly
  } catch (e) {
    return NextResponse.json({ error: 'Could not read body' }, { status: 400 });
  }

  const signature = request.headers.get('x-signature') || '';
  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn('[ls-webhook] signature mismatch — rejecting');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventName = payload?.meta?.event_name;
  const userId = extractUserId(payload?.meta);
  const data = payload?.data;
  console.log(`[ls-webhook] event=${eventName} user=${userId || '?'}`);

  // No user_id means the checkout wasn't initiated through our flow.
  // Acknowledge so LS doesn't retry indefinitely; just don't do anything.
  if (!userId) {
    return NextResponse.json({ ok: true, skipped: 'no user_id' });
  }

  try {
    const sb = supabaseAdmin();

    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_resumed': {
        const attrs = data?.attributes || {};
        const variantId = attrs.variant_id ? String(attrs.variant_id) : null;
        const subscriptionId = data?.id ? String(data.id) : null;
        const customerId = attrs.customer_id ? String(attrs.customer_id) : null;
        const planInfo = variantId ? planFromVariantId(variantId) : null;
        if (!planInfo) {
          console.warn(`[ls-webhook] unknown variant_id=${variantId} for ${eventName}`);
          return NextResponse.json({ ok: true, warning: 'unknown variant' });
        }
        const status = attrs.status; // 'active' | 'on_trial' | 'past_due' | 'cancelled' | 'expired' | 'unpaid' | 'paused'
        const activeStatuses = new Set(['active', 'on_trial']);
        const targetPlan = activeStatuses.has(status) ? planInfo.plan : 'free';
        const monthlyCredits = creditsForPlan(targetPlan);

        const update = {
          plan: targetPlan,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
        };
        // Refill credits when:
        //   - subscription_created (new sub)
        //   - subscription_updated where renewed_at moved (a renewal)
        //   - subscription_resumed (user re-activated)
        // For mid-cycle plan changes we still refill — LS prorates the price
        // but the user's expectation is "I'm on the new plan now".
        if (activeStatuses.has(status)) {
          update.monthly_credits = monthlyCredits;
          update.monthly_credits_used = 0;
        }
        const { error } = await sb.from('profiles').update(update).eq('id', userId);
        if (error) throw error;
        break;
      }

      case 'subscription_cancelled': {
        // User has scheduled cancel-at-period-end. Keep their plan/credits
        // active until subscription_expired fires at the period boundary.
        // Nothing to update on profiles right now; LS will fire `_expired` later.
        break;
      }

      case 'subscription_expired': {
        // Cancellation took effect. Downgrade to Free, keep any topup_credits.
        // We deliberately do NOT zero topup_credits — those were one-time
        // purchases and the user paid for them.
        const { error } = await sb
          .from('profiles')
          .update({
            plan: 'free',
            monthly_credits: 0,
            monthly_credits_used: 0,
            stripe_subscription_id: null,
            // Keep stripe_customer_id so future re-subs reuse the LS customer.
          })
          .eq('id', userId);
        if (error) throw error;
        break;
      }

      case 'order_created': {
        // One-time order. Distinguish: if this order corresponds to a
        // subscription, the relationships.subscription will be non-null —
        // subscription_created handles that case, so skip.
        const subRel = data?.relationships?.subscription?.data;
        if (subRel) {
          // Subscription order — subscription_* events drive the profile update.
          break;
        }
        // True one-time purchase. We only sell the $39 top-up here.
        const variantId = data?.attributes?.first_order_item?.variant_id
                       || data?.attributes?.first_subscription_item?.variant_id
                       || null;
        const isTopup = variantId
          && String(variantId) === String(process.env.LEMONSQUEEZY_VARIANT_TOPUP_100 || '');
        if (!isTopup) {
          console.warn(`[ls-webhook] order_created with unknown variant=${variantId}`);
          break;
        }
        // Add 100 credits to topup_credits. We read-modify-write via RPC would
        // be ideal but a single UPDATE with arithmetic is fine here (LS sends
        // each order_created exactly once after payment confirmation).
        const { data: row, error: selErr } = await sb
          .from('profiles')
          .select('topup_credits')
          .eq('id', userId)
          .single();
        if (selErr) throw selErr;
        const next = (Number(row?.topup_credits) || 0) + 100;
        const { error: updErr } = await sb
          .from('profiles')
          .update({ topup_credits: next })
          .eq('id', userId);
        if (updErr) throw updErr;
        break;
      }

      default:
        // LS sends events we don't care about (subscription_payment_*, etc).
        // Acknowledge so they don't retry; no work needed.
        console.log(`[ls-webhook] ignoring event=${eventName}`);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[ls-webhook] handler error:', e?.message);
    // Returning 500 makes LS retry — sometimes that's right (transient DB
    // failure) and sometimes it isn't (bad data we'll never handle). For
    // now, 500 + log; we can refine to 200+log if we see retry storms.
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }
}
