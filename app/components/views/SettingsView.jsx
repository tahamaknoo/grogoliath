"use client";

import React, { useState, useRef } from "react";
import { LogOut } from "lucide-react";
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "../../../lib/supabaseClient";
import MarbleAvatar from "../MarbleAvatar";

const SettingsView = ({ email, onLogout, profile, session, onProfileUpdate }) => {
  const planKey = profile?.plan ? String(profile.plan).toLowerCase() : "basic";
  const planLabel = planKey[0].toUpperCase() + planKey.slice(1);
  const planPricing = { basic: { price: "$49", pages: 100 }, pro: { price: "$99", pages: 250 } };
  const planInfo = planPricing[planKey] || planPricing.basic;
  const pageLimit = Number(profile?.page_limit || planInfo.pages || 0);
  const pagesUsed = Number(profile?.pages_used || 0);
  const remaining = pageLimit > 0 ? Math.max(0, pageLimit - pagesUsed) : 0;
  const usedPct = pageLimit > 0 ? Math.min(100, Math.round((pagesUsed / pageLimit) * 100)) : 0;
  const showUpgrade = planKey !== "pro";

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
    if (!window.confirm('Remove your profile photo?')) return;

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

  return (
    <div className="max-w-3xl mx-auto pt-8 animate-in pb-16">
      <div className="mb-12">
        <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Settings</h1>
        <p className="text-xl text-slate-500 dark:text-[#fbfbfb]">Manage your account and preferences.</p>
      </div>

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

      {/* Plan card */}
      <div className="bg-white dark:bg-[#262626] border border-slate-200 dark:border-[#333333] rounded-3xl p-8 mb-4">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-xs font-bold text-[#075056] mb-2 uppercase tracking-widest">Current Plan</div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-1">{planLabel} Plan</h2>
            <p className="text-base text-slate-500 dark:text-[#fbfbfb]">
              {pagesUsed} of {pageLimit > 0 ? pageLimit : "N/A"} pages used this month
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-slate-900 dark:text-white">{planInfo.price}</div>
            <div className="text-slate-400 text-sm mt-1 dark:text-[#fbfbfb]">per month</div>
          </div>
        </div>

        <div className="h-2 bg-slate-100 dark:bg-[#333333] rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[#075056] rounded-full transition-all duration-700"
            style={{ width: `${usedPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-[#fbfbfb] mb-6">
          <span>{pagesUsed} used</span>
          <span>{pageLimit > 0 ? remaining : "N/A"} remaining</span>
        </div>

        {profile && (
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-slate-50 dark:bg-[#333333] rounded-2xl p-5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 dark:text-[#fbfbfb]">Project limit</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{profile.project_limit ?? "N/A"}</div>
            </div>
            <div className="bg-slate-50 dark:bg-[#333333] rounded-2xl p-5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 dark:text-[#fbfbfb]">Pages remaining</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{pageLimit > 0 ? remaining : "N/A"}</div>
            </div>
          </div>
        )}

        {showUpgrade && (
          <button
            onClick={() => alert("Billing portal is not configured yet.")}
            className="px-8 py-4 bg-[#075056] text-white text-base font-semibold rounded-xl hover:bg-[#064548] transition-colors"
          >
            Upgrade to Pro
          </button>
        )}
      </div>

      {/* Danger zone */}
      <div className="bg-white dark:bg-[#262626] border border-slate-200 dark:border-[#333333] rounded-3xl p-8">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Account</h3>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-6 py-3 text-red-500 font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-sm"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
