"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

// Handles quoted CSV values with commas inside them
function parseCSVLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  values.push(current.trim());
  return values;
}

export default function SimpleNewProject({ isOpen, onClose, session, onSuccess }) {
  const [step, setStep]           = useState(1);
  const [projectName, setProjectName] = useState("");
  const [csvFile, setCsvFile]     = useState(null);
  const [csvData, setCsvData]     = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError]         = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setProjectName("");
    setCsvFile(null);
    setCsvData(null);
    setError("");
    onClose();
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        if (lines.length < 2) { setError("CSV must have a header row and at least one data row."); return; }

        const headers = parseCSVLine(lines[0]).filter(Boolean);
        if (headers.length === 0) { setError("Could not read CSV headers."); return; }

        const rows = lines.slice(1)
          .map((line) => {
            const vals = parseCSVLine(line);
            const row = {};
            headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
            return row;
          })
          .filter((r) => headers.some((h) => String(r[h] || "").trim()));

        setCsvData({ headers, rows });
        setCsvFile(file);
      } catch (err) {
        setError("Failed to parse CSV: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const createProject = async () => {
    if (!projectName.trim() || !csvData) return;
    setIsCreating(true);
    setError("");

    try {
      const { data, error: dbError } = await supabase
        .from("projects")
        .insert({
          user_id:   session.user.id,
          name:      projectName.trim(),
          status:    "Draft",
          data:      { headers: csvData.headers, rows: csvData.rows },
          row_count: csvData.rows.length,
        })
        .select()
        .single();

      if (dbError) throw dbError;
      onSuccess?.(data);
      handleClose();
    } catch (err) {
      console.error("Project creation error:", err);
      setError(err.message || "Failed to create project.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg dark:text-white">New Project</h2>
            <p className="text-sm text-slate-500">Step {step} of 2</p>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* Steps */}
        <div className="px-8 py-8">

          {/* ── Step 1: Name ── */}
          {step === 1 && (
            <div>
              <label className="block text-sm font-bold dark:text-white mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && projectName.trim() && setStep(2)}
                placeholder="e.g., Austin Plumbing Pages"
                autoFocus
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2B5E44]/30 mb-6"
              />
              <button
                onClick={() => setStep(2)}
                disabled={!projectName.trim()}
                className="w-full px-6 py-3 bg-[#2B5E44] text-white rounded-xl font-bold text-sm hover:bg-[#234d37] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── Step 2: CSV Upload ── */}
          {step === 2 && (
            <div>
              <h3 className="font-bold dark:text-white mb-1">Upload your keyword CSV</h3>
              <p className="text-sm text-slate-500 mb-5">
                First row = headers. Each row becomes one page.
              </p>

              <label
                htmlFor="csv-upload"
                className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-colors mb-4 ${
                  csvFile
                    ? "border-[#2B5E44] bg-[#2B5E44]/5"
                    : "border-slate-200 dark:border-slate-600 hover:border-[#2B5E44]/40 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                }`}
              >
                <Upload size={24} className={csvFile ? "text-[#2B5E44]" : "text-slate-400"} />
                <span className="mt-2 text-sm font-semibold dark:text-white">
                  {csvFile ? csvFile.name : "Click to upload CSV"}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  {csvData ? `${csvData.rows.length} rows · ${csvData.headers.length} columns` : ".csv files only"}
                </span>
                <input id="csv-upload" type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
              </label>

              {csvData && (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 mb-4 text-xs">
                  <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">Columns detected:</p>
                  <p className="text-slate-500 font-mono">{csvData.headers.join(", ")}</p>
                </div>
              )}

              {error && (
                <p className="text-red-500 text-xs mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Back
                </button>
                <button
                  onClick={createProject}
                  disabled={!csvData || isCreating}
                  className="flex-1 px-6 py-2.5 bg-[#2B5E44] text-white rounded-xl font-bold text-sm hover:bg-[#234d37] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Creating…" : `Create Project (${csvData?.rows.length ?? 0} pages)`}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
