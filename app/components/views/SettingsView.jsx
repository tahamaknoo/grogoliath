"use client";

import React from "react";
import { Info, LogOut } from "lucide-react";
import Card from "../ui/Card";

const SettingsView = ({ email, onLogout }) => (
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

// --- 9. Datasets Tab ---
