"use client";

import React from "react";
import { Info, LogOut } from "lucide-react";
import Card from "../ui/Card";

const SettingsView = ({ email, onLogout, profile }) => {
  const planKey = profile?.plan ? String(profile.plan).toLowerCase() : "basic";
  const planLabel = planKey ? planKey[0].toUpperCase() + planKey.slice(1) : "Basic";
  const planPricing = {
    basic: { price: "$49", pages: 100 },
    pro: { price: "$99", pages: 250 }
  };
  const planInfo = planPricing[planKey] || planPricing.basic;
  const pageLimit = Number(profile?.page_limit || planInfo.pages || 0);
  const pagesUsed = Number(profile?.pages_used || 0);
  const remaining = pageLimit > 0 ? Math.max(0, pageLimit - pagesUsed) : 0;
  const usedPct = pageLimit > 0 ? Math.min(100, Math.round((pagesUsed / pageLimit) * 100)) : 0;
  const handleBillingAction = () => alert("Billing portal is not configured yet.");
  const showUpgrade = planKey !== "pro";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Settings</h1>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg mb-6 flex gap-3 items-start">
        <Info className="text-blue-600 mt-0.5" size={18} />
        <div>
          <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm">Account & API</h4>
          <p className="text-xs text-blue-600 dark:text-blue-400">Manage your profile settings and API keys here.</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-bold dark:text-white">Billing</h3>
            <p className="text-xs text-slate-500 mt-1">Credits reset monthly based on your plan.</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#2B5E44]/10 text-[#2B5E44]">
            {planLabel} Plan
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
            {planInfo.price}/month
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
            {planInfo.pages} pages/month
          </span>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Pages used</span>
            <span>
              {pagesUsed} / {pageLimit > 0 ? pageLimit : "N/A"}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2B5E44] to-[#4d8f70]"
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Remaining this month: {pageLimit > 0 ? remaining : "N/A"}
          </div>
          {showUpgrade && (
            <div className="mt-2 text-xs text-slate-500">
              Upgrade to Pro for {planPricing.pro.pages} pages/month.
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {showUpgrade && (
            <button
              type="button"
              onClick={handleBillingAction}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-[#2B5E44] text-white hover:bg-[#234d37]"
            >
              Upgrade to Pro
            </button>
          )}
          <button
            type="button"
            onClick={handleBillingAction}
            className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Manage billing
          </button>
        </div>
        {profile && (
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-3">
              <p className="font-semibold text-slate-700 dark:text-slate-200">Project limit</p>
              <p>{profile.project_limit ?? "N/A"}</p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-3">
              <p className="font-semibold text-slate-700 dark:text-slate-200">Pages remaining</p>
              <p>{pageLimit > 0 ? remaining : "N/A"}</p>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="font-bold dark:text-white mb-4">Account</h3>
        <p className="mb-4 text-slate-600 dark:text-slate-300">{email}</p>
        <button
          onClick={onLogout}
          className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 font-medium transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </Card>
    </div>
  );
};

export default SettingsView;

const HelpView = () => (
  <div className="max-w-4xl mx-auto space-y-8">
    <div>
      <h1 className="text-2xl font-bold dark:text-white">Help and Getting Started</h1>
      <p className="text-slate-500 mt-1">Simple instructions for each area of the dashboard.</p>
    </div>

    <Card className="p-6 space-y-3">
      <h3 className="font-bold dark:text-white">Quick Start</h3>
      <ol className="list-decimal pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
        <li>Go to Datasets and upload a CSV file.</li>
        <li>Create a new Project from a CSV or Dataset.</li>
        <li>Open the project and click Generate to create pages.</li>
        <li>Review results in View Data and export CSV when ready.</li>
      </ol>
    </Card>

    <Card className="p-6 space-y-2">
      <h3 className="font-bold dark:text-white">Dashboard</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300">Overview of total projects and keywords. Use New Project to start a new campaign.</p>
    </Card>

    <Card className="p-6 space-y-2">
      <h3 className="font-bold dark:text-white">Projects</h3>
      <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
        <li>Search and filter by status (Draft or Completed).</li>
        <li>Generate runs the AI workflow for a project.</li>
        <li>Edit lets you rename or change platform.</li>
        <li>View opens the data table for editing and inspection.</li>
        <li>Download exports your project data to CSV.</li>
      </ul>
    </Card>

    <Card className="p-6 space-y-2">
      <h3 className="font-bold dark:text-white">Generate (AI)</h3>
      <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
        <li>Choose a template or write a prompt.</li>
        <li>Pick the target column for output.</li>
        <li>Watch the progress log and stop anytime.</li>
      </ul>
    </Card>

    <Card className="p-6 space-y-2">
      <h3 className="font-bold dark:text-white">View Data</h3>
      <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
        <li>Edit cells directly in the table.</li>
        <li>Add rows or new columns as needed.</li>
        <li>Use Inspect for HTML cells to preview or edit safely.</li>
        <li>Export to CSV after review.</li>
      </ul>
    </Card>

    <Card className="p-6 space-y-2">
      <h3 className="font-bold dark:text-white">Datasets</h3>
      <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
        <li>Upload CSV files once and reuse them in projects.</li>
        <li>Delete datasets you no longer need.</li>
      </ul>
    </Card>

    <Card className="p-6 space-y-2">
      <h3 className="font-bold dark:text-white">Templates</h3>
      <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
        <li>Create your own template using the builder.</li>
        <li>Use preset templates as a starting point.</li>
        <li>Preview templates before using them in generation.</li>
      </ul>
    </Card>

    <Card className="p-6 space-y-2">
      <h3 className="font-bold dark:text-white">Template Builder</h3>
      <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
        <li>Add blocks like Hero, Text, Pricing, or FAQ.</li>
        <li>Use Columns or 2x2 Grid for responsive layouts.</li>
        <li>Click the help icon on a block to learn what it does.</li>
      </ul>
    </Card>

    <Card className="p-6 space-y-2">
      <h3 className="font-bold dark:text-white">Settings</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300">View your account email and sign out.</p>
    </Card>
  </div>
);
