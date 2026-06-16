// Single source of truth for GroGoliath pricing. Consumed by the Settings →
// Plans tab now, and (later) by the credit-metering, paywall, and Stripe
// checkout code. Keep prices/limits here so there's exactly one place to edit.
//
// Credit cost per generation: landing page = 1, blog post = 3.

export const CREDIT_COST = { landing: 1, blog: 3 };

// 100 extra page credits for $39, one-time. Top-up credits carry over and
// never expire (unlike monthly plan credits, which reset each period).
export const TOPUP_PACK = { credits: 100, price: 39 };

// `stripePriceId` left null until the Stripe products are created — the
// Upgrade buttons stay stubbed until then.
export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Try it before you pay',
    monthly: 0,
    annual: 0,
    credits: 5,
    creditsReset: false,        // one-time, never resets
    brandKits: 0,
    projects: 'Unlimited',
    customTemplates: false,
    htmlExport: false,
    cms: false,
    isAgency: false,
    paid: false,
    stripePriceMonthly: null,
    stripePriceAnnual: null,
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    tagline: 'For solo creators shipping their first pages',
    monthly: 99,
    annual: 990,
    credits: 100,
    creditsReset: true,
    brandKits: 2,
    projects: 'Unlimited',
    customTemplates: true,
    htmlExport: true,
    cms: true,
    isAgency: false,
    paid: true,
    stripePriceMonthly: null,
    stripePriceAnnual: null,
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    tagline: 'For growing sites that need volume',
    monthly: 149,
    annual: 1490,
    credits: 200,
    creditsReset: true,
    brandKits: 3,
    projects: 'Unlimited',
    customTemplates: true,
    htmlExport: true,
    cms: true,
    isAgency: false,
    paid: true,
    stripePriceMonthly: null,
    stripePriceAnnual: null,
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    tagline: 'For agencies & teams managing many clients',
    monthly: 249,
    annual: 2490,
    credits: 500,
    creditsReset: true,
    brandKits: 3,
    projects: 'Unlimited',
    customTemplates: true,
    htmlExport: true,
    cms: true,
    isAgency: true,
    paid: true,
    stripePriceMonthly: null,
    stripePriceAnnual: null,
  },
};

// The three self-serve tiers shown in the main pricing row. Agency is surfaced
// separately via its own toggle.
export const STANDARD_PLAN_IDS = ['free', 'starter', 'growth'];

export const PLAN_LIST = Object.values(PLANS);

// Incremental feature highlights per plan — each paid tier reads as
// "Everything in <previous>, plus" its additions. Returned as plain strings;
// the card renders each with a green check (positive-only, like the reference).
export function planHighlights(planId) {
  switch (planId) {
    case 'free':
      return ['5 page credits (one-time)', 'Unlimited projects', 'Starter templates', 'Preview every page'];
    case 'starter':
      return ['Everything in Free, plus:', '100 page credits / month', '2 brand kits', 'Custom template builder', 'HTML export', 'CMS integration'];
    case 'growth':
      return ['Everything in Starter, plus:', '200 page credits / month', '3 brand kits'];
    case 'agency':
      return ['Everything in Growth, plus:', '500 page credits / month', 'Priority support'];
    default:
      return [];
  }
}

export function annualMonthlyEquivalent(plan) {
  // Annual price expressed as a per-month figure (annual / 12).
  return plan.annual > 0 ? Math.round(plan.annual / 12) : 0;
}

// How many brand kits a plan allows (number; Infinity if a plan is ever set to 'Unlimited').
export function brandKitLimit(planId) {
  const p = PLANS[planId] || PLANS.free;
  return p.brandKits === 'Unlimited' ? Infinity : (Number(p.brandKits) || 0);
}

// Whether a plan allows a boolean feature: 'customTemplates' | 'htmlExport' | 'cms'.
export function planAllows(planId, feature) {
  const p = PLANS[planId] || PLANS.free;
  return !!p[feature];
}

// How many projects a plan allows (number; Infinity for unlimited).
export function projectLimit(planId) {
  const p = PLANS[planId] || PLANS.free;
  return p.projects === 'Unlimited' ? Infinity : (Number(p.projects) || 0);
}

// Whether the given profile has admin (full-access) status. Admins get
// every paid feature, unlimited brand kits, and infinite credits, regardless
// of the `plan` column. Toggle via `UPDATE profiles SET is_admin = true …`.
export function isAdmin(profile) {
  return profile?.is_admin === true;
}

// Convenience: normalize a profile's plan id (defaults to 'free').
// Admins are reported as 'agency' here so every consumer of planIdOf (brand
// kits, feature gates, plan-aware UI) treats them as a top-tier user without
// any caller having to special-case admin.
export function planIdOf(profile) {
  if (isAdmin(profile)) return 'agency';
  const id = String(profile?.plan || 'free').toLowerCase();
  return PLANS[id] ? id : 'free';
}

// Spendable credits for a profile = remaining monthly allotment + carry-over top-ups.
// Admins are not metered — Infinity short-circuits any "out of credits" UI.
export function creditsRemaining(profile) {
  if (isAdmin(profile)) return Infinity;
  if (!profile) return 0;
  const monthly = Math.max(0, (profile.monthly_credits || 0) - (profile.monthly_credits_used || 0));
  return monthly + (profile.topup_credits || 0);
}

// Optimistic local decrement mirroring the server's spend_credits (monthly first,
// then top-ups). Returns a new profile object — use after a successful spend RPC.
export function applySpend(profile, amount) {
  if (!profile || !amount) return profile;
  const fromMonthly = Math.min(Math.max(0, (profile.monthly_credits || 0) - (profile.monthly_credits_used || 0)), amount);
  return {
    ...profile,
    monthly_credits_used: (profile.monthly_credits_used || 0) + fromMonthly,
    topup_credits: (profile.topup_credits || 0) - (amount - fromMonthly),
  };
}
