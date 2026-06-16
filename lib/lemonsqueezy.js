// Lemon Squeezy API helpers — server-side only. Never import this from a
// client component; the API key authorizes destructive operations.
//
// Docs: https://docs.lemonsqueezy.com/api
// LS uses JSON:API formatted responses; we strip the wrapper here and return
// plain JS objects to the rest of the app.
import crypto from 'node:crypto';

const LS_BASE = 'https://api.lemonsqueezy.com/v1';

function apiKey() {
  const k = process.env.LEMONSQUEEZY_API_KEY;
  if (!k) throw new Error('LEMONSQUEEZY_API_KEY not set');
  return k;
}

function storeId() {
  const s = process.env.LEMONSQUEEZY_STORE_ID;
  if (!s) throw new Error('LEMONSQUEEZY_STORE_ID not set');
  return s;
}

// Maps an internal (plan, interval) tuple to the LS variant ID it represents.
// 'topup' is a one-time product, not a subscription — handled separately by
// the caller. Returns null when the env var isn't set (helps with friendly
// "not configured" errors before checkout is even attempted).
export function variantIdFor(plan, interval) {
  const env = process.env;
  if (plan === 'topup') return env.LEMONSQUEEZY_VARIANT_TOPUP_100 || null;
  const key = `LEMONSQUEEZY_VARIANT_${plan.toUpperCase()}_${interval.toUpperCase()}`;
  return env[key] || null;
}

// Reverse lookup: given a variant ID from a webhook, what plan does it map to?
// Used by the webhook handler to update `profiles.plan` based on which variant
// the subscription is currently on (handles upgrade/downgrade mid-cycle).
export function planFromVariantId(variantId) {
  const id = String(variantId);
  const map = [
    ['starter', 'monthly', process.env.LEMONSQUEEZY_VARIANT_STARTER_MONTHLY],
    ['starter', 'annual',  process.env.LEMONSQUEEZY_VARIANT_STARTER_ANNUAL],
    ['growth',  'monthly', process.env.LEMONSQUEEZY_VARIANT_GROWTH_MONTHLY],
    ['growth',  'annual',  process.env.LEMONSQUEEZY_VARIANT_GROWTH_ANNUAL],
    ['agency',  'monthly', process.env.LEMONSQUEEZY_VARIANT_AGENCY_MONTHLY],
    ['agency',  'annual',  process.env.LEMONSQUEEZY_VARIANT_AGENCY_ANNUAL],
  ];
  for (const [plan, interval, varId] of map) {
    if (varId && String(varId) === id) return { plan, interval };
  }
  return null;
}

// Create a checkout URL for a given plan/interval (subscriptions) or
// 'topup'/anything (one-time products). The user's Supabase id is stored
// in `custom_data` so we can look them up server-side in webhooks.
//
// Returns the hosted checkout URL the user should be redirected to.
export async function createCheckout({ variantId, userId, userEmail, redirectUrl }) {
  if (!variantId) throw new Error('Missing variantId');
  // Force test_mode on every checkout when LEMONSQUEEZY_TEST_MODE=true in env.
  // Lets us test with LS's test card (4242…) against products created in live
  // mode, without having to maintain a duplicate set of test-mode products.
  // CRITICAL: unset this env var before going to production, or all real
  // customer checkouts will be created as test charges that never settle.
  const testMode = process.env.LEMONSQUEEZY_TEST_MODE === 'true';
  const body = {
    data: {
      type: 'checkouts',
      attributes: {
        test_mode: testMode,
        // Pre-fill what we know to reduce friction on the LS page.
        checkout_data: {
          email: userEmail || undefined,
          custom: { user_id: String(userId) },
        },
        checkout_options: {
          embed: false,
          dark: false,
          logo: true,
        },
        product_options: {
          redirect_url: redirectUrl || undefined,
          // After success, briefly show the thank-you then bounce back.
          receipt_button_text: 'Back to GroGoliath',
          receipt_thank_you_note: 'Welcome! Your credits are ready.',
        },
      },
      relationships: {
        store: { data: { type: 'stores', id: storeId() } },
        variant: { data: { type: 'variants', id: String(variantId) } },
      },
    },
  };
  const res = await fetch(`${LS_BASE}/checkouts`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`LS checkout failed (${res.status}): ${text || res.statusText}`);
  }
  const json = await res.json();
  const url = json?.data?.attributes?.url;
  if (!url) throw new Error('LS returned no checkout URL');
  return url;
}

// Get the customer-portal URL for an active subscription. LS embeds a
// signed token in the URL, so it's safe to give directly to the user.
export async function getCustomerPortalUrl(subscriptionId) {
  if (!subscriptionId) throw new Error('Missing subscriptionId');
  const res = await fetch(`${LS_BASE}/subscriptions/${subscriptionId}`, {
    headers: {
      Accept: 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey()}`,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`LS subscription fetch failed (${res.status}): ${text || res.statusText}`);
  }
  const json = await res.json();
  // `customer_portal` is signed + time-limited per LS docs.
  const url = json?.data?.attributes?.urls?.customer_portal
           || json?.data?.attributes?.urls?.customer_portal_update_subscription;
  if (!url) throw new Error('No customer portal URL available for this subscription');
  return url;
}

// Verify a webhook payload against LS's X-Signature header (HMAC-SHA256
// using the per-webhook signing secret). Returns true on match.
// Uses timing-safe comparison so we don't leak signature info via response time.
export function verifyWebhookSignature(rawBody, signatureHeader) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return false; // Refuse to verify when no secret is set.
  if (!signatureHeader) return false;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}
