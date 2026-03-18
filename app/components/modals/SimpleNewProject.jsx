"use client";

import { useState, useEffect } from "react";
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

// Count non-empty comma-separated values
function countItems(str) {
  return str.split(",").filter((s) => s.trim()).length;
}

const TIPS = [
  "💡 You can minimize this window and continue working",
  "⚡ Each page gets unique, SEO-optimized content automatically",
  "🎯 You can edit any keyword in the preview table",
  "🚀 Larger projects take a bit longer — patience pays off!",
  "✨ All pages are mobile-responsive by default",
  "📊 Your pages will be ready for download after generation",
];

export default function SimpleNewProject({ isOpen, onClose, session, onSuccess }) {
  const [step, setStep]               = useState(1);
  const [projectName, setProjectName] = useState("");
  const [csvFile, setCsvFile]         = useState(null);
  const [csvData, setCsvData]         = useState(null);
  const [isCreating, setIsCreating]   = useState(false);
  const [creationProgress, setCreationProgress] = useState(0);
  const [currentTip, setCurrentTip]   = useState(0);
  const [error, setError]             = useState("");
  const [dataMethod, setDataMethod]   = useState("csv");
  const [aiFields, setAiFields]       = useState({ business: "", locations: "", keywords: "" });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Rotate tips while creating
  useEffect(() => {
    if (!isCreating) return;
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isCreating]);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setProjectName("");
    setCsvFile(null);
    setCsvData(null);
    setError("");
    setCreationProgress(0);
    setCurrentTip(0);
    setDataMethod("csv");
    setAiFields({ business: "", locations: "", keywords: "" });
    onClose();
  };

  // Derived: estimated page count from AI fields
  const estimatedCount =
    countItems(aiFields.locations) * countItems(aiFields.keywords);

  const generateAIData = async () => {
    if (!aiFields.business.trim()) { setError("Please enter a business type."); return; }
    setIsGeneratingAI(true);
    setError("");
    setCsvData(null);

    const prompt = `You are a keyword combination generator for SEO pages.

Generate ALL possible combinations of locations and keywords.

Business Type: ${aiFields.business}
Target Locations: ${aiFields.locations}
Keywords/Services: ${aiFields.keywords}

INSTRUCTIONS:
1. Split locations by comma: ${aiFields.locations}
2. Split keywords by comma: ${aiFields.keywords}
3. Create ONE page for EACH combination (location × keyword)
4. Generate natural keyword phrases that include the location

EXAMPLE:
If locations = "Houston, Dallas" and keywords = "chat lines, phone dating"
Then generate 4 pages:
- "chat lines in Houston" + Houston + chat lines
- "chat lines in Dallas" + Dallas + chat lines
- "phone dating in Houston" + Houston + phone dating
- "phone dating in Dallas" + Dallas + phone dating

Return ONLY valid JSON in this EXACT format:
{
  "headers": ["Keyword", "Location", "Service"],
  "rows": [
    {"Keyword": "natural keyword phrase with location", "Location": "city name", "Service": "${aiFields.business}"},
    ...one row for each combination
  ]
}

Generate ALL combinations now. Return ONLY the JSON, no other text.`;

    try {
      const res = await fetch("/api/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || "API error");

      const content = typeof data?.content === "string" ? data.content : "";
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        const s = content.indexOf("{"); const e = content.lastIndexOf("}");
        if (s === -1 || e <= s) throw new Error("Could not parse AI response as JSON");
        parsed = JSON.parse(content.slice(s, e + 1));
      }

      if (!Array.isArray(parsed?.headers) || !Array.isArray(parsed?.rows)) {
        throw new Error("AI returned unexpected data format");
      }

      setCsvData({ headers: parsed.headers, rows: parsed.rows });
    } catch (err) {
      setError("AI generation failed: " + err.message);
    } finally {
      setIsGeneratingAI(false);
    }
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
    setCreationProgress(0);
    setError("");

    try {
      setCreationProgress(10);
      await new Promise((r) => setTimeout(r, 100));

      setCreationProgress(20);
      const payload = {
        user_id:   session.user.id,
        name:      projectName.trim(),
        status:    "Draft",
        data:      { headers: csvData.headers, rows: csvData.rows },
        row_count: csvData.rows.length,
      };

      setCreationProgress(30);
      console.log("[DEBUG] Payload prepared:", {
        ...payload,
        data: { ...payload.data, rows: `[${payload.data.rows.length} rows]` },
      });

      setCreationProgress(40);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error("[DEBUG] 15s timeout reached — aborting");
        controller.abort();
      }, 15000);

      setCreationProgress(50);
      console.log("[DEBUG] Starting Supabase insert...");

      const { data, error: dbError } = await supabase
        .from("projects")
        .insert(payload)
        .select()
        .single()
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);
      setCreationProgress(70);
      console.log("[DEBUG] Insert returned:", { data: data?.id, error: dbError });

      if (dbError) {
        console.error("[DEBUG] DB error:", dbError);
        let msg = `Database error: ${dbError.message}`;
        if (dbError.code === "42501") msg = "❌ Permission denied. Your account may not have access to create projects.";
        else if (dbError.code === "23505") msg = "⚠️ A project with this name already exists.";
        else if (dbError.message?.includes("RLS")) msg = "🔒 Database security policy blocked this action. Contact support.";
        throw new Error(msg);
      }

      if (!data) throw new Error("No data returned — possible RLS policy blocking insert");

      setCreationProgress(90);
      console.log("[DEBUG] Success:", { id: data.id, name: data.name, row_count: data.row_count });

      setCreationProgress(100);
      await new Promise((r) => setTimeout(r, 400));

      onSuccess?.(data);
      handleClose();
    } catch (err) {
      console.error("[DEBUG] Creation failed:", err.message);

      let msg = err.message || "Unknown error occurred";
      if (err.name === "AbortError" || msg.includes("timed out") || msg.includes("timeout")) {
        msg = "⏱️ Request timed out after 15 seconds. Please check your connection and try again.";
      }

      setError(msg);
    } finally {
      setIsCreating(false);
      setCreationProgress(0);
    }
  };

  const inputClass = "w-full text-2xl font-semibold text-slate-900 dark:text-white bg-transparent border-b-2 border-slate-200 dark:border-[#27272a] focus:border-[#5b4cdb] outline-none pb-3 placeholder-slate-300 dark:placeholder-slate-600 transition-colors";
  const fieldClass = "w-full text-base text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-[#27272a] focus:border-[#5b4cdb] outline-none pb-3 placeholder-slate-400 dark:placeholder-slate-600 transition-colors";

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-[#0f0f10] overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-8">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        <X size={24} />
      </button>

      <div className="max-w-2xl w-full">
        {/* Step progress bar */}
        <div className="flex gap-2 mb-16">
          <div className="h-1 flex-1 bg-[#5b4cdb] rounded-full" />
          <div className={`h-1 flex-1 rounded-full transition-colors ${step === 2 ? "bg-[#5b4cdb]" : "bg-slate-200 dark:bg-[#27272a]"}`} />
        </div>

        {/* ── Step 1: Name ── */}
        {step === 1 && (
          <div className="animate-in">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest">
              Step 1 → Project Details
            </p>
            <h2 className="font-display text-6xl font-black text-slate-900 dark:text-white mb-10 leading-tight tracking-tight">
              What's your<br />project name?
            </h2>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && projectName.trim() && setStep(2)}
              placeholder="e.g., Austin Plumbing Pages"
              autoFocus
              className={`${inputClass} mb-14`}
            />
            <div className="flex items-center justify-between">
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium text-sm transition-colors">
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!projectName.trim()}
                className="px-8 py-4 bg-[#5b4cdb] text-white text-base font-semibold rounded-xl hover:bg-[#4a3dc4] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Data ── */}
        {step === 2 && (
          <div className="animate-in">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest">
              Step 2 → Add Data
            </p>
            <h2 className="font-display text-5xl font-black text-slate-900 dark:text-white mb-10 leading-tight tracking-tight">
              How will you<br />add your keywords?
            </h2>

            {/* Method picker */}
            <div className="grid grid-cols-2 gap-3 mb-10">
              {[
                { id: "csv",    label: "Upload CSV",       sub: "Import from a file" },
                { id: "ai",     label: "Generate with AI", sub: "AI creates keywords" },
                { id: "sheets", label: "Google Sheets",    sub: "Coming soon" },
                { id: "manual", label: "Manual Entry",     sub: "Coming soon" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setDataMethod(m.id); setCsvData(null); setCsvFile(null); setError(""); }}
                  disabled={m.id === "sheets" || m.id === "manual"}
                  className={`p-5 border-2 rounded-2xl text-left transition-all disabled:opacity-35 disabled:cursor-not-allowed ${
                    dataMethod === m.id
                      ? "border-[#5b4cdb] bg-[#f2f1fe] dark:bg-[#5b4cdb]/10"
                      : "border-slate-200 dark:border-[#27272a] hover:border-slate-300 dark:hover:border-[#3f3f46]"
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">{m.label}</div>
                  <div className="text-xs text-slate-400">{m.sub}</div>
                </button>
              ))}
            </div>

            {/* CSV panel */}
            {dataMethod === "csv" && (
              <div className="mb-10">
                <label
                  htmlFor="csv-upload"
                  className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
                    csvFile
                      ? "border-[#5b4cdb] bg-[#f2f1fe] dark:bg-[#5b4cdb]/10"
                      : "border-slate-200 dark:border-[#27272a] hover:border-slate-300 dark:hover:border-[#3f3f46] hover:bg-slate-50 dark:hover:bg-[#18181b]"
                  }`}
                >
                  <Upload size={20} className={csvFile ? "text-[#5b4cdb]" : "text-slate-400"} />
                  <span className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {csvFile ? csvFile.name : "Click to upload CSV"}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    {csvData ? `${csvData.rows.length} rows · ${csvData.headers.length} columns` : ".csv files only"}
                  </span>
                  <input id="csv-upload" type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
                </label>
              </div>
            )}

            {/* AI panel */}
            {dataMethod === "ai" && (
              <div className="space-y-8 mb-10">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Business type</label>
                  <input
                    type="text"
                    value={aiFields.business}
                    onChange={(e) => setAiFields((f) => ({ ...f, business: e.target.value }))}
                    placeholder="e.g., Plumbing services"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Target locations</label>
                  <input
                    type="text"
                    value={aiFields.locations}
                    onChange={(e) => setAiFields((f) => ({ ...f, locations: e.target.value }))}
                    placeholder="e.g., Austin, Dallas, Houston"
                    className={fieldClass}
                  />
                  <p className="text-xs text-slate-400 mt-2">Separate multiple cities with commas</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Services / Keywords</label>
                  <input
                    type="text"
                    value={aiFields.keywords}
                    onChange={(e) => setAiFields((f) => ({ ...f, keywords: e.target.value }))}
                    placeholder="e.g., emergency repair, drain cleaning"
                    className={fieldClass}
                  />
                  <p className="text-xs text-slate-400 mt-2">Separate multiple services with commas</p>
                </div>

                {/* Auto-calculated page count */}
                {aiFields.locations && aiFields.keywords && estimatedCount > 0 && (
                  <div className="p-6 bg-[#f2f1fe] dark:bg-[#5b4cdb]/10 border border-[#5b4cdb]/30 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#5b4cdb] uppercase tracking-wider mb-1">
                        Pages to Generate
                      </div>
                      <div className="text-4xl font-black text-[#5b4cdb]">
                        {estimatedCount}
                      </div>
                      <div className="text-sm text-[#5b4cdb]/70 mt-1">
                        {countItems(aiFields.locations)} locations × {countItems(aiFields.keywords)} keywords
                      </div>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-[#5b4cdb] flex items-center justify-center flex-shrink-0">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                )}

                <button
                  onClick={generateAIData}
                  disabled={isGeneratingAI || !aiFields.business.trim() || !aiFields.locations.trim() || !aiFields.keywords.trim()}
                  className="px-6 py-3 bg-[#5b4cdb] text-white rounded-xl text-sm font-semibold hover:bg-[#4a3dc4] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {isGeneratingAI ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating…
                    </>
                  ) : "Generate Keyword Data"}
                </button>
              </div>
            )}

            {/* ── Keyword preview table (shared for both CSV and AI) ── */}
            {csvData && !isGeneratingAI && (
              <div className="mt-6 space-y-4 mb-10">
                {/* Success banner */}
                <div className="flex items-center gap-3 p-4 bg-[#f2f1fe] dark:bg-[#5b4cdb]/10 border border-[#5b4cdb]/30 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-[#5b4cdb] flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-[#5b4cdb] text-sm">
                      {csvData.rows.length} keyword combinations ready
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Review and edit below before creating your project
                    </div>
                  </div>
                </div>

                {/* Editable table */}
                <div className="border border-slate-200 dark:border-[#27272a] rounded-xl overflow-hidden">
                  <div className="bg-slate-50 dark:bg-[#18181b] px-4 py-3 border-b border-slate-200 dark:border-[#27272a] flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Preview Keywords</h4>
                    <button
                      onClick={() => {
                        const newRow = {};
                        csvData.headers.forEach((h) => { newRow[h] = ""; });
                        setCsvData({ ...csvData, rows: [...csvData.rows, newRow] });
                      }}
                      className="text-xs font-semibold text-[#5b4cdb] hover:text-[#4a3dc4] transition-colors"
                    >
                      + Add Row
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 dark:bg-[#18181b] sticky top-0">
                        <tr>
                          <th className="px-3 py-2.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-8">#</th>
                          {csvData.headers.map((h) => (
                            <th key={h} className="px-3 py-2.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                          ))}
                          <th className="px-3 py-2.5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Del</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-[#27272a]">
                        {csvData.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#18181b] transition-colors">
                            <td className="px-3 py-2 text-xs text-slate-400">{idx + 1}</td>
                            {csvData.headers.map((h) => (
                              <td key={h} className="px-3 py-2">
                                <input
                                  type="text"
                                  value={row[h] || ""}
                                  onChange={(e) => {
                                    const newRows = csvData.rows.map((r, i) =>
                                      i === idx ? { ...r, [h]: e.target.value } : r
                                    );
                                    setCsvData({ ...csvData, rows: newRows });
                                  }}
                                  className="w-full text-xs bg-transparent outline-none focus:ring-1 focus:ring-[#5b4cdb]/30 rounded px-1 py-0.5 text-slate-900 dark:text-white placeholder-slate-300"
                                  placeholder={h}
                                />
                              </td>
                            ))}
                            <td className="px-3 py-2 text-right">
                              <button
                                onClick={() => setCsvData({ ...csvData, rows: csvData.rows.filter((_, i) => i !== idx) })}
                                className="text-xs text-red-400 hover:text-red-600 transition-colors font-medium"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  Total: <span className="font-bold text-slate-700 dark:text-slate-300">{csvData.rows.length}</span> pages will be created
                </p>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm mb-8 font-medium">{error}</p>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium text-sm transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={createProject}
                disabled={!csvData || isCreating}
                className="relative overflow-hidden px-8 py-4 bg-[#5b4cdb] text-white text-base font-semibold rounded-xl hover:bg-[#4a3dc4] transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-w-[240px] text-center"
              >
                {isCreating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating… {creationProgress}%
                  </span>
                ) : csvData ? (
                  `Create Project (${csvData.rows.length} pages) →`
                ) : dataMethod === "ai" && estimatedCount > 0 ? (
                  `Ready (${estimatedCount} pages estimated)`
                ) : (
                  "Create Project"
                )}
                {isCreating && (
                  <span
                    className="absolute bottom-0 left-0 h-1 bg-white/40 transition-all duration-300"
                    style={{ width: `${creationProgress}%` }}
                  />
                )}
              </button>
            </div>

            {/* Progress details panel */}
            {isCreating && (
              <div className="mt-6 p-6 bg-slate-50 dark:bg-[#18181b] rounded-2xl border border-slate-200 dark:border-[#27272a] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Creating your project…</span>
                  <span className="text-sm font-mono text-slate-500">{creationProgress}%</span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-slate-200 dark:bg-[#27272a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5b4cdb] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${creationProgress}%` }}
                  />
                </div>

                {/* Time estimate */}
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {creationProgress < 100
                    ? `About ${Math.max(1, Math.ceil((100 - creationProgress) / 10))} seconds remaining`
                    : "Almost done!"}
                </div>

                {/* Rotating tip */}
                <div className="p-3 bg-[#f2f1fe] dark:bg-[#5b4cdb]/10 border border-[#5b4cdb]/20 rounded-xl">
                  <p className="text-xs text-[#5b4cdb]">{TIPS[currentTip]}</p>
                </div>

                {/* Minimize / Cancel */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#27272a] rounded-lg transition-colors"
                  >
                    Minimize
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to cancel project creation?")) {
                        setIsCreating(false);
                        setCreationProgress(0);
                      }
                    }}
                    className="px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
