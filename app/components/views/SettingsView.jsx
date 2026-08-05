"use client";

import React, { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "../../../lib/supabaseClient";
import MarbleAvatar from "../MarbleAvatar";
import { useConfirm } from "../ConfirmDialog";
import { PLANS, STANDARD_PLAN_IDS, TOPUP_PACK, planHighlights, annualMonthlyEquivalent, isAdmin } from "../../../lib/plans";
import { apiFetch } from "../../../lib/apiFetch";

const SettingsView = ({ email, onLogout, profile, session, onProfileUpdate }) => {
  const confirm = useConfirm();

  // Settings sub-navigation + Plans-tab toggles. The active sub-tab is mirrored
  // in the URL (?tab=settings&section=...) so a refresh keeps you in place and
  // upgrade prompts can deep-link to Plans.
  const SECTIONS = ["profile", "plans", "billing", "account"];
  const readSection = () => {
    if (typeof window === "undefined") return "profile";
    const s = new URLSearchParams(window.location.search).get("section");
    return SECTIONS.includes(s) ? s : "profile";
  };
  const [tab, setTabState] = useState(readSection);
  const [billingPeriod, setBillingPeriod] = useState("monthly"); // monthly | annual
  const [showAgency, setShowAgency] = useState(false);
  const [planNotice, setPlanNotice] = useState(null);

  // Switch sub-tab AND reflect it in the URL (so refresh stays put).
  const setTab = (id) => {
    setTabState(id);
    if (typeof window !== "undefined") {
      window.history.replaceState({ tab: "settings" }, "", `?tab=settings&section=${id}`);
    }
  };

  // Re-sync the sub-tab when the URL changes (deep-links, back/forward).
  useEffect(() => {
    const sync = () => setTabState(readSection());
    window.addEventListener("gg-navigate", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("gg-navigate", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  // Admin profiles bypass the credit / plan model entirely (full access).
  const admin = isAdmin(profile);

  // Current plan from the profile (defaults to free). Credit usage if present.
  const currentPlanId = (profile?.plan && PLANS[String(profile.plan).toLowerCase()])
    ? String(profile.plan).toLowerCase()
    : "free";
  const currentPlan = PLANS[currentPlanId];
  // Credit balance from the new credit model. `remaining` is what's spendable
  // (monthly allotment minus used, plus carry-over top-ups).
  const monthlyTotal = Number(profile?.monthly_credits ?? currentPlan.credits ?? 0);
  const monthlyUsed = Number(profile?.monthly_credits_used ?? 0);
  const topupCredits = Number(profile?.topup_credits ?? 0);
  const creditsRemaining = Math.max(0, monthlyTotal - monthlyUsed) + topupCredits;
  const creditsTotal = monthlyTotal + topupCredits;
  const creditsUsed = Math.max(0, creditsTotal - creditsRemaining);
  const usedPct = creditsTotal > 0 ? Math.min(100, Math.round((creditsUsed / creditsTotal) * 100)) : 0;

  // Billing — `billingBusy` holds the id of the currently-loading action so
  // we can show a spinner on JUST that button (not all of them). Possible
  // values: null (idle), 'starter' | 'growth' | 'agency' (plan checkout),
  // 'topup' (one-time pack), 'portal' (manage billing redirect). The button
  // disabled-state covers ALL when any one is busy so the user can't fire two
  // billing redirects concurrently.
  const [billingBusy, setBillingBusy] = useState(null);
  const [billingInterval, setBillingInterval] = useState('monthly'); // 'monthly' | 'annual' toggle

  // When the user clicks "Upgrade now" we redirect to Lemon Squeezy via
  // window.location.href. If they hit the browser Back button on the LS page,
  // most browsers restore this page from their Back-Forward Cache (BFCache)
  // *without* re-running React — so `billingBusy` is still set to the plan id
  // and the button shows "Opening checkout…" forever. The `pageshow` event
  // fires with `persisted=true` specifically in the BFCache-restore case, so
  // we clear stale loading state then. Also handles refresh + visibility
  // returns as a safety net.
  useEffect(() => {
    const onShow = (e) => {
      if (e.persisted) setBillingBusy(null);
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);
  const handleChoosePlan = async (planId) => {
    if (planId === 'free' || !PLANS[planId]?.paid) return;
    if (billingBusy) return; // already loading something
    setPlanNotice(null);
    setBillingBusy(planId);
    try {
      const res = await apiFetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, interval: billingInterval }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || `Checkout failed (${res.status})`);
      }
      // location.href triggers immediately; we don't reset busy on success
      // because the page is about to unload anyway. Spinner stays visible
      // until the new page replaces the current one.
      window.location.href = data.url;
    } catch (e) {
      setPlanNotice(e?.message || 'Could not start checkout. Please try again.');
      setBillingBusy(null);
    }
  };
  const handleBuyTopup = async () => {
    if (billingBusy) return;
    setPlanNotice(null);
    setBillingBusy('topup');
    try {
      const res = await apiFetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'topup' }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || `Top-up checkout failed (${res.status})`);
      }
      window.location.href = data.url;
    } catch (e) {
      setPlanNotice(e?.message || 'Could not start top-up checkout.');
      setBillingBusy(null);
    }
  };
  const handleManageBilling = async () => {
    if (billingBusy) return;
    setPlanNotice(null);
    setBillingBusy('portal');
    try {
      const res = await apiFetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || `Could not open billing portal (${res.status})`);
      }
      window.location.href = data.url;
    } catch (e) {
      setPlanNotice(e?.message || 'Could not open the billing portal.');
      setBillingBusy(null);
    }
  };

  // Profile state
  const user = session?.user;
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarOp, setAvatarOp] = useState('idle'); // 'idle' | 'uploading' | 'removing'
  const [profileMsg, setProfileMsg] = useState(null); // { type: 'success'|'error', text }
  const avatarInputRef = useRef(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  // supabase.auth.updateUser fires onAuthStateChange before the promise resolves,
  // which can cause the promise to hang. Race it against a timeout.
  const authUpdate = (metadata) =>
    Promise.race([
      supabase.auth.updateUser({ data: metadata }).then(({ error }) => {
        if (error) throw error;
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
    ]);

  const initials = (displayName || email || "?")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  // supabase-js's storage.upload and auth.updateUser both stall silently on
  // this app, so we hit Storage and Auth REST endpoints directly with a hard
  // timeout. Fetch can't hang the way the wrapped clients can.
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setProfileMsg({ type: "error", text: "Image must be under 2 MB." });
      return;
    }
    if (!user?.id) {
      setProfileMsg({ type: "error", text: "Not logged in." });
      return;
    }

    const token = session?.access_token;
    if (!token) {
      setProfileMsg({ type: "error", text: "Session expired. Please refresh." });
      return;
    }

    setSavingProfile(true);
    setAvatarOp('uploading');
    setProfileMsg(null);

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${user.id}.${ext}`;
    let publicUrl = null;

    // ── Step 1: upload binary to Supabase Storage via REST ──
    try {
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/avatars/${encodeURIComponent(path)}`;
      const res = await Promise.race([
        fetch(uploadUrl, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token}`,
            'Content-Type': file.type || 'image/jpeg',
            'x-upsert': 'true',
          },
          body: file,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Upload timed out after 20s.')), 20000)),
      ]);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Upload failed (${res.status}): ${text || res.statusText}`);
      }
      publicUrl = `${SUPABASE_URL}/storage/v1/object/public/avatars/${encodeURIComponent(path)}?t=${Date.now()}`;
      setAvatarUrl(publicUrl);
    } catch (err) {
      console.error('[settings] avatar upload failed:', err);
      setProfileMsg({ type: 'error', text: err?.message || 'Upload failed.' });
      setSavingProfile(false);
      setAvatarOp('idle');
      return;
    }

    // ── Step 2: save the URL to auth.user_metadata via REST ──
    try {
      const res = await Promise.race([
        fetch(`${SUPABASE_URL}/auth/v1/user`, {
          method: 'PUT',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: { avatar_url: publicUrl } }),
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Metadata save timed out.')), 15000)),
      ]);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.warn('Metadata update non-OK:', res.status, text);
      }
    } catch (err) {
      console.warn('[settings] avatar metadata save warning:', err?.message || err);
      // Not fatal — the file is uploaded and shows locally. The DB will catch up.
    } finally {
      onProfileUpdate?.({ avatar_url: publicUrl });
      setProfileMsg({ type: 'success', text: 'Profile picture updated.' });
      setSavingProfile(false);
      setAvatarOp('idle');
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.id) return;
    const ok = await confirm({
      title: 'Remove profile photo?',
      message: 'Your photo will be deleted from our servers. You can upload a new one any time.',
      confirmLabel: 'Remove photo',
      variant: 'danger',
    });
    if (!ok) return;

    const token = session?.access_token;
    if (!token) {
      setProfileMsg({ type: 'error', text: 'Session expired. Please refresh.' });
      return;
    }

    setSavingProfile(true);
    setAvatarOp('removing');
    setProfileMsg(null);

    // Clear UI immediately — feels instant.
    setAvatarUrl('');

    // Best-effort delete of all stored files for this user (any extension).
    try {
      const exts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
      await Promise.race([
        fetch(`${SUPABASE_URL}/storage/v1/object/avatars`, {
          method: 'DELETE',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prefixes: exts.map(e => `${user.id}.${e}`) }),
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Delete timed out.')), 15000)),
      ]);
    } catch (e) {
      console.warn('[settings] avatar file delete (ignored):', e?.message || e);
    }

    // Clear the URL from auth metadata.
    try {
      await Promise.race([
        fetch(`${SUPABASE_URL}/auth/v1/user`, {
          method: 'PUT',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: { avatar_url: null } }),
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Metadata clear timed out.')), 15000)),
      ]);
    } catch (e) {
      console.warn('[settings] avatar metadata clear (ignored):', e?.message || e);
    } finally {
      onProfileUpdate?.({ avatar_url: null });
      setProfileMsg({ type: 'success', text: 'Profile photo removed.' });
      setSavingProfile(false);
      setAvatarOp('idle');
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) {
      setProfileMsg({ type: "error", text: "Not logged in." });
      return;
    }
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await authUpdate({ full_name: displayName.trim() });
    } catch {
      // Supabase auth.updateUser often times out on the response even when the
      // update succeeds — ignore the timeout and treat as success.
    } finally {
      onProfileUpdate?.({ full_name: displayName.trim() });
      setProfileMsg({ type: "success", text: "Profile saved." });
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMsg(null);
    if (!newPassword || newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    setSavingPassword(true);
    try {
      await Promise.race([
        supabase.auth.updateUser({ password: newPassword }).then(({ error }) => { if (error) throw error; }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
      ]);
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      setPasswordMsg({ type: "success", text: "Password updated successfully." });
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.message === 'timeout' ? 'Request timed out. Try again.' : (err.message || "Failed to update password.") });
    } finally {
      setSavingPassword(false);
    }
  };

  const renderPlanCard = (plan) => {
    const isCurrent = plan.id === currentPlanId;
    const price = plan.paid ? (billingPeriod === 'annual' ? annualMonthlyEquivalent(plan) : plan.monthly) : 0;
    const highlights = planHighlights(plan.id);
    const badge = plan.id === 'growth' ? 'Most popular' : plan.id === 'agency' ? 'Best for teams' : null;
    return (
      <div
        key={plan.id}
        className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
          isCurrent
            ? 'border-[#075056] dark:border-[#5eead4] ring-1 ring-[#075056]/30 bg-white dark:bg-[#262626]'
            : 'border-slate-200 dark:border-[#333333] bg-white dark:bg-[#262626]'
        }`}
      >
        {/* Name + badge */}
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{plan.name}</h3>
          {badge && (
            <span className="px-2 py-0.5 bg-slate-900 dark:bg-white text-white dark:text-[#0a0a0a] text-[9px] font-bold uppercase tracking-wider rounded">{badge}</span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-[#888888] mb-5">{plan.tagline}</p>

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black text-slate-900 dark:text-white">${price.toLocaleString()}</span>
          <span className="text-sm text-slate-400 dark:text-[#888888]">{plan.paid ? '/ month' : 'forever'}</span>
        </div>
        <p className="text-xs text-slate-400 dark:text-[#888888] mt-1 mb-5 min-h-[1rem]">
          {plan.paid && billingPeriod === 'annual' ? `$${plan.annual.toLocaleString()} billed yearly` : plan.paid ? 'billed monthly' : 'no card required'}
        </p>

        {/* CTA — directly under the price, like the reference.
            Busy state: when this plan's checkout is loading, swap the label
            for a spinner + "Opening checkout…" so the user sees something
            happen the moment they click (the LS API roundtrip itself takes
            1-3s; the spinner covers that latency). All plan buttons are
            disabled while any one is loading to prevent double-clicks
            firing two redirects. */}
        {(() => {
          const thisLoading = billingBusy === plan.id;
          const anyLoading = !!billingBusy;
          return (
            <button
              onClick={() => handleChoosePlan(plan.id)}
              disabled={isCurrent || !plan.paid || anyLoading}
              className={`w-full px-4 py-2.5 text-sm font-bold rounded-lg transition-colors mb-6 inline-flex items-center justify-center gap-2 ${
                isCurrent
                  ? 'border border-slate-200 dark:border-[#3a3a3a] text-slate-500 dark:text-[#888888] cursor-default'
                  : !plan.paid
                    ? 'border border-slate-200 dark:border-[#3a3a3a] text-slate-400 dark:text-[#777777] cursor-default'
                    : anyLoading && !thisLoading
                      ? 'bg-[#075056]/40 text-white/80 cursor-not-allowed'
                      : 'bg-[#075056] text-white hover:bg-[#064548]'
              }`}
            >
              {thisLoading && (
                <span
                  className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"
                  aria-hidden
                />
              )}
              {isCurrent
                ? 'Your current plan'
                : !plan.paid
                  ? 'Free forever'
                  : thisLoading
                    ? 'Taking you to checkout…'
                    : 'Upgrade now'}
            </button>
          );
        })()}

        {/* Feature highlights */}
        <ul className="space-y-3">
          {highlights.map((label, i) => {
            const isHeader = label.startsWith('Everything in');
            return (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-[#075056] dark:bg-[#5eead4] flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white dark:text-[#0a0a0a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <span className={isHeader ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-[#bbbbbb]'}>{label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto pt-8 animate-in pb-16">
      <div className="mb-8">
        <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Settings</h1>
        <p className="text-xl text-slate-500 dark:text-[#fbfbfb]">Manage your account and preferences.</p>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-[#333333] mb-8">
        {[['profile', 'Profile'], ['plans', 'Plans'], ['billing', 'Billing'], ['account', 'Account']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => { setTab(id); setPlanNotice(null); }}
            className={`relative px-4 py-3 text-sm font-bold transition-colors ${
              tab === id ? 'text-[#075056] dark:text-[#5eead4]' : 'text-slate-500 dark:text-[#888888] hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            {label}
            {tab === id && <span className="absolute -bottom-px left-2 right-2 h-0.5 bg-[#075056] dark:bg-[#5eead4] rounded-full" />}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {tab === 'profile' && (
      <>
      {/* Profile card */}
      <div className="bg-white dark:bg-[#262626] border border-slate-200 dark:border-[#333333] rounded-3xl p-8 mb-4">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Profile</h3>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 dark:border-[#333333]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full overflow-hidden select-none">
                <MarbleAvatar seed={user?.id || email || displayName} size={80} className="w-full h-full block" />
              </div>
            )}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={savingProfile}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#075056] hover:bg-[#064548] text-white rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-50"
              title="Change photo"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{displayName || "No name set"}</p>
            <p className="text-sm text-slate-500 dark:text-[#fbfbfb]">{email}</p>
            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={savingProfile}
                className="text-xs text-[#14b8a6] hover:underline disabled:opacity-50"
              >
                {avatarOp === 'uploading'
                  ? "Uploading…"
                  : avatarOp === 'removing'
                    ? "Removing…"
                    : (avatarUrl ? "Change photo" : "Upload photo")}
              </button>
              {avatarUrl && avatarOp !== 'removing' && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={savingProfile}
                  className="text-xs text-red-500 hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Name field */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-widest mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-[#333333] border border-slate-200 dark:border-[#3a3a3a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#075056] transition-colors"
          />
        </div>

        {/* Email — read-only */}
        <div className="mb-8">
          <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-widest mb-2">
            Email
          </label>
          <div className="w-full px-4 py-3 bg-slate-100 dark:bg-[#333333]/50 border border-slate-200 dark:border-[#3a3a3a] rounded-xl text-slate-500 dark:text-[#fbfbfb] text-sm select-all">
            {email}
          </div>
          <p className="text-xs text-slate-400 mt-1.5 dark:text-[#fbfbfb]">Email cannot be changed here. Contact support if needed.</p>
        </div>

        {profileMsg && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
            profileMsg.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
              : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
          }`}>
            {profileMsg.text}
          </div>
        )}

        <button
          onClick={handleSaveProfile}
          disabled={savingProfile}
          className="px-6 py-3 bg-[#075056] text-white font-semibold rounded-xl hover:bg-[#064548] disabled:opacity-50 transition-colors"
        >
          {savingProfile ? "Saving…" : "Save Profile"}
        </button>
      </div>

      {/* Password card */}
      <div className="bg-white dark:bg-[#262626] border border-slate-200 dark:border-[#333333] rounded-3xl p-8 mb-4">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Change Password</h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-widest mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-[#333333] border border-slate-200 dark:border-[#3a3a3a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#075056] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-widest mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-[#333333] border border-slate-200 dark:border-[#3a3a3a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#075056] transition-colors"
            />
          </div>
        </div>

        {passwordMsg && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
            passwordMsg.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
              : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
          }`}>
            {passwordMsg.text}
          </div>
        )}

        <button
          onClick={handleChangePassword}
          disabled={savingPassword || !newPassword || !confirmPassword}
          className="px-6 py-3 bg-[#075056] text-white font-semibold rounded-xl hover:bg-[#064548] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {savingPassword ? "Updating…" : "Update Password"}
        </button>
      </div>
      </>
      )}

      {/* ── PLANS TAB ── */}
      {tab === 'plans' && (
        <div className="space-y-5">
          {/* Header: title + toggles */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-[#888888]">Choose your plan</p>
            <div className="flex items-center gap-2">
              <div className="inline-flex p-1 bg-slate-100 dark:bg-[#1f1f1f] rounded-lg border border-slate-200 dark:border-[#2a2a2a]">
                <button onClick={() => setShowAgency(false)} className={`px-3.5 py-1.5 text-sm font-semibold rounded-md transition-all ${!showAgency ? 'bg-white dark:bg-[#2a2a2a] text-[#075056] dark:text-[#5eead4] shadow-sm' : 'text-slate-500 dark:text-[#888888]'}`}>Individual</button>
                <button onClick={() => setShowAgency(true)} className={`px-3.5 py-1.5 text-sm font-semibold rounded-md transition-all ${showAgency ? 'bg-white dark:bg-[#2a2a2a] text-[#075056] dark:text-[#5eead4] shadow-sm' : 'text-slate-500 dark:text-[#888888]'}`}>Agency</button>
              </div>
              <div className="inline-flex p-1 bg-slate-100 dark:bg-[#1f1f1f] rounded-lg border border-slate-200 dark:border-[#2a2a2a]">
                <button onClick={() => setBillingPeriod('monthly')} className={`px-3.5 py-1.5 text-sm font-semibold rounded-md transition-all ${billingPeriod === 'monthly' ? 'bg-white dark:bg-[#2a2a2a] text-[#075056] dark:text-[#5eead4] shadow-sm' : 'text-slate-500 dark:text-[#888888]'}`}>Monthly</button>
                <button onClick={() => setBillingPeriod('annual')} className={`px-3.5 py-1.5 text-sm font-semibold rounded-md transition-all flex items-center gap-1.5 ${billingPeriod === 'annual' ? 'bg-white dark:bg-[#2a2a2a] text-[#075056] dark:text-[#5eead4] shadow-sm' : 'text-slate-500 dark:text-[#888888]'}`}>Annually <span className="px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold">2 MO FREE</span></button>
              </div>
            </div>
          </div>

          {/* Promo banner — only when on monthly */}
          {billingPeriod === 'monthly' && (
            <div className="flex items-center justify-between gap-4 flex-wrap rounded-2xl border border-[#075056]/20 dark:border-[#5eead4]/20 bg-[#075056]/[0.04] dark:bg-[#075056]/10 px-5 py-4">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Get 2 months free
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-[#075056] text-white text-[10px] font-bold align-middle">SAVE ~17%</span>
                </span>
                <p className="text-xs text-slate-500 dark:text-[#aaaaaa] mt-0.5">Switch any paid plan to annual billing and pay for 10 months instead of 12.</p>
              </div>
              <button onClick={() => setBillingPeriod('annual')} className="shrink-0 px-4 py-2 text-sm font-bold text-[#075056] dark:text-[#5eead4] bg-white dark:bg-[#1f1f1f] border border-[#075056]/30 dark:border-[#5eead4]/30 rounded-lg hover:bg-[#075056]/5 dark:hover:bg-[#075056]/20 transition-colors">
                Switch to annually
              </button>
            </div>
          )}

          {planNotice && (
            <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/15 text-amber-700 dark:text-amber-300 text-sm font-medium border border-amber-200 dark:border-amber-800/40">
              {planNotice}
            </div>
          )}

          {/* Cards */}
          {!showAgency ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {STANDARD_PLAN_IDS.map(id => renderPlanCard(PLANS[id]))}
            </div>
          ) : (
            <div className="max-w-sm">{renderPlanCard(PLANS.agency)}</div>
          )}

          {/* ADD-ONS */}
          <div className="pt-2">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-[#888888] mb-3">Add-ons</p>
            <div className="bg-white dark:bg-[#262626] border border-slate-200 dark:border-[#333333] rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#075056]/10 dark:bg-[#075056]/25 flex items-center justify-center shrink-0 text-[#075056] dark:text-[#5eead4]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6M9 15h6"/></svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{TOPUP_PACK.credits}-page top-up pack</h4>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold uppercase">Carries over</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#aaaaaa] mt-0.5">Extra credits on top of your monthly quota. Never expire.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-lg font-black text-slate-900 dark:text-white">${TOPUP_PACK.price}</div>
                  <div className="text-[11px] text-slate-400 dark:text-[#888888]">one-time</div>
                </div>
                <button
                  onClick={handleBuyTopup}
                  disabled={currentPlanId === 'free' || !!billingBusy}
                  title={currentPlanId === 'free' ? 'Available on paid plans' : undefined}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-[#075056] text-white hover:bg-[#064548] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {billingBusy === 'topup' && (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden />
                  )}
                  {billingBusy === 'topup' ? 'Taking you to checkout…' : 'Add to plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BILLING TAB ── */}
      {tab === 'billing' && (
        <div className="space-y-4">
          {/* Subscription summary */}
          <div className="bg-white dark:bg-[#262626] border border-slate-200 dark:border-[#333333] rounded-3xl p-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs font-bold text-[#075056] dark:text-[#5eead4] uppercase tracking-widest mb-1">Subscription</div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {currentPlan.name}{currentPlan.paid ? ` · $${currentPlan.monthly}/mo` : ''}
              </h3>
              <p className="text-sm text-slate-500 dark:text-[#aaaaaa] mt-0.5">{currentPlan.paid ? 'Active' : 'No active subscription'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleManageBilling}
                disabled={!!billingBusy}
                className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-white border border-slate-200 dark:border-[#3a3a3a] rounded-xl hover:border-[#075056] dark:hover:border-[#5eead4] transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {billingBusy === 'portal' ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-slate-400/40 border-t-slate-700 dark:border-t-white rounded-full animate-spin" aria-hidden />
                    Taking you to billing…
                  </>
                ) : (
                  <>
                    Manage billing
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  </>
                )}
              </button>
              <button onClick={() => { setTab('plans'); setPlanNotice(null); }} className="px-4 py-2.5 text-sm font-bold bg-[#075056] text-white rounded-xl hover:bg-[#064548] transition-colors">Choose a plan</button>
            </div>
          </div>

          {/* Credit usage — replaced with an Admin card for admin profiles */}
          {admin ? (
            <div className="bg-white dark:bg-[#262626] border border-[#075056]/30 dark:border-[#5eead4]/30 rounded-3xl p-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#075056]/10 dark:bg-[#5eead4]/10">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#075056] dark:text-[#5eead4]"><path d="m12 2 3 7 7 .5-5.5 4.5L18 22l-6-4-6 4 1.5-8L2 9.5 9 9z"/></svg>
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Admin access</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#075056] text-white">Unlimited</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-[#aaaaaa] mt-0.5">
                    All features unlocked. No credit metering, no plan limits.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#262626] border border-slate-200 dark:border-[#333333] rounded-3xl p-6">
              <div className="flex items-end justify-between mb-3 flex-wrap gap-2">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Page credits</h4>
                <span className="text-sm text-slate-500 dark:text-[#aaaaaa]">
                  {creditsUsed.toLocaleString()} of {creditsTotal.toLocaleString()} used{currentPlan.creditsReset ? ' this period' : ''}
                </span>
              </div>
              <div className="h-2.5 bg-slate-100 dark:bg-[#333333] rounded-full overflow-hidden">
                <div className="h-full bg-[#075056] dark:bg-[#5eead4] rounded-full transition-all duration-700" style={{ width: `${usedPct}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#888888] mt-2">
                <span>{creditsUsed.toLocaleString()} used</span>
                <span>{creditsRemaining.toLocaleString()} remaining</span>
              </div>
            </div>
          )}

          {planNotice && (
            <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/15 text-amber-700 dark:text-amber-300 text-sm font-medium border border-amber-200 dark:border-amber-800/40">
              {planNotice}
            </div>
          )}

          {/* Payment method */}
          <div className="bg-white dark:bg-[#262626] border border-slate-200 dark:border-[#333333] rounded-3xl p-6">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Payment method</h4>
            <p className="text-sm text-slate-500 dark:text-[#aaaaaa] mt-0.5">How you pay for GroGoliath. Cards are processed securely by our payment provider.</p>
            <div className="mt-4 flex items-center justify-between p-4 rounded-2xl border border-dashed border-slate-200 dark:border-[#3a3a3a]">
              <span className="text-sm text-slate-500 dark:text-[#888888]">No payment method on file</span>
              <button
                onClick={currentPlan.paid ? handleManageBilling : () => setTab('plans')}
                disabled={billingBusy}
                className="text-sm font-bold text-[#075056] dark:text-[#5eead4] hover:underline inline-flex items-center gap-1 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/></svg>
                {currentPlan.paid ? 'Manage billing' : 'Add payment method'}
              </button>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white dark:bg-[#262626] border border-slate-200 dark:border-[#333333] rounded-3xl p-6">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Latest transactions</h4>
            <div className="border border-slate-200 dark:border-[#333333] rounded-2xl overflow-hidden">
              <div className="grid grid-cols-4 gap-2 px-5 py-3 bg-slate-50 dark:bg-[#1f1f1f] text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#888888]">
                <span>Invoice</span><span>Date</span><span>Amount</span><span>Status</span>
              </div>
              <div className="px-5 py-10 text-center text-sm text-slate-400 dark:text-[#888888]">No transactions yet</div>
            </div>
          </div>
        </div>
      )}

      {/* ── ACCOUNT TAB ── */}
      {tab === 'account' && (
        <div className="bg-white dark:bg-[#262626] border border-slate-200 dark:border-[#333333] rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Account</h3>
          <p className="text-sm text-slate-500 dark:text-[#aaaaaa] mb-6">Sign out of GroGoliath on this device.</p>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 text-red-500 font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-sm"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
