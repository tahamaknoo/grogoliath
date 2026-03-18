"use client";

import React from "react";
import { LogOut } from "lucide-react";

const SettingsView = ({ email, onLogout, profile }) => {
  const planKey = profile?.plan ? String(profile.plan).toLowerCase() : "basic";
  const planLabel = planKey[0].toUpperCase() + planKey.slice(1);
  const planPricing = { basic: { price: "$49", pages: 100 }, pro: { price: "$99", pages: 250 } };
  const planInfo = planPricing[planKey] || planPricing.basic;
  const pageLimit = Number(profile?.page_limit || planInfo.pages || 0);
  const pagesUsed = Number(profile?.pages_used || 0);
  const remaining = pageLimit > 0 ? Math.max(0, pageLimit - pagesUsed) : 0;
  const usedPct = pageLimit > 0 ? Math.min(100, Math.round((pagesUsed / pageLimit) * 100)) : 0;
  const showUpgrade = planKey !== "pro";

  return (
    <div className="max-w-3xl mx-auto pt-8 animate-in">
      <div className="mb-12">
        <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Settings</h1>
        <p className="text-xl text-slate-500 dark:text-slate-400">Manage your account and preferences.</p>
      </div>

      {/* Plan card */}
      <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-3xl p-10 mb-4">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-xs font-bold text-[#5b4cdb] mb-2 uppercase tracking-widest">Current Plan</div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{planLabel} Plan</h2>
            <p className="text-base text-slate-500 dark:text-slate-400">
              {pagesUsed} of {pageLimit > 0 ? pageLimit : "N/A"} pages used this month
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-slate-900 dark:text-white">{planInfo.price}</div>
            <div className="text-slate-400 text-sm mt-1">per month</div>
          </div>
        </div>

        <div className="h-2 bg-slate-100 dark:bg-[#27272a] rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-[#5b4cdb] rounded-full transition-all duration-700"
            style={{ width: `${usedPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-8">
          <span>{pagesUsed} used</span>
          <span>{pageLimit > 0 ? remaining : "N/A"} remaining</span>
        </div>

        {showUpgrade && (
          <button
            onClick={() => alert("Billing portal is not configured yet.")}
            className="px-8 py-4 bg-[#5b4cdb] text-white text-base font-semibold rounded-xl hover:bg-[#4a3dc4] transition-colors"
          >
            Upgrade to Pro
          </button>
        )}
      </div>

      {/* Account card */}
      <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-3xl p-10">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Account</h3>
        <div className="mb-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</div>
          <div className="text-lg text-slate-900 dark:text-white">{email}</div>
        </div>
        {profile && (
          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div className="bg-slate-50 dark:bg-[#27272a] rounded-2xl p-5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Project limit</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{profile.project_limit ?? "N/A"}</div>
            </div>
            <div className="bg-slate-50 dark:bg-[#27272a] rounded-2xl p-5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pages remaining</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{pageLimit > 0 ? remaining : "N/A"}</div>
            </div>
          </div>
        )}
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
