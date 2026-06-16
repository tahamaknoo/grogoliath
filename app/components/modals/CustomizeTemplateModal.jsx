"use client";

import { useEffect, useRef, useState } from "react";
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "../../../lib/supabaseClient";
import { apiFetch } from "../../../lib/apiFetch";
import { previewHtml as renderPreviewHtml } from "../../../lib/templatePreview";

/**
 * Lets the user duplicate a template into their library and edit the copy.
 * The original is never touched — this always inserts a new row in the
 * templates table owned by the current user.
 */
export default function CustomizeTemplateModal({
  isOpen,
  source,           // { id, name, category, structure } — the template to copy from
  session,
  onClose,
  onCreated,        // (newTemplate) => void  — called after successful save
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Custom");
  const [html, setHtml] = useState("");
  const [view, setView] = useState("preview"); // 'preview' | 'code'
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const codeRef = useRef(null);

  // AI refine state
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState("");
  const [history, setHistory] = useState([]); // snapshots for Undo
  const aiAbortRef = useRef(null);

  // Seed state whenever a new source template is passed in.
  useEffect(() => {
    if (!isOpen || !source) return;
    setName(`${source.name || "Untitled"} (copy)`);
    setCategory(source.category || "Custom");
    setHtml(source.structure || "");
    setView("preview");
    setError("");
    setAiInstruction("");
    setAiError("");
    setHistory([]);
  }, [isOpen, source]);

  // AI-driven HTML refine — reuses the existing /api/refine-page endpoint.
  const handleAiRefine = async () => {
    const instruction = aiInstruction.trim();
    if (!instruction || !html.trim() || aiBusy) return;
    setAiBusy(true);
    setAiError("");

    const controller = new AbortController();
    aiAbortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
      const res = await apiFetch("/api/refine-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ current_html: html, instruction }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || `Refine failed (${res.status})`);
      if (!result.html) throw new Error("AI returned an empty response.");

      // Push current HTML to history so the user can Undo.
      setHistory((h) => [...h, html].slice(-10));
      setHtml(result.html);
      setAiInstruction("");
    } catch (err) {
      if (err.name === "AbortError") {
        setAiError("That took too long. Try a shorter instruction.");
      } else {
        setAiError(err?.message || "Something went wrong.");
      }
    } finally {
      clearTimeout(timeoutId);
      aiAbortRef.current = null;
      setAiBusy(false);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    setHtml(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
  };

  // Esc to close.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !source) return null;

  const handleSave = async () => {
    setError("");
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Give your template a name.");
      return;
    }
    if (!session?.user?.id) {
      setError("You need to be signed in to save a template.");
      return;
    }

    setSaving(true);
    const token = session?.access_token;
    const payload = {
      user_id: session.user.id,
      name: cleanName,
      category: category.trim() || "Custom",
      structure: html,
    };

    try {
      // Direct REST insert — supabase-js has stalled here in the past.
      const res = await Promise.race([
        fetch(`${SUPABASE_URL}/rest/v1/templates`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(payload),
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Save timed out after 15s.")), 15000)
        ),
      ]);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text ? `${res.status}: ${text}` : `Save failed (${res.status}).`);
      }
      const rows = await res.json().catch(() => []);
      const created = Array.isArray(rows) ? rows[0] : rows;
      onCreated?.({ ...created, _isUserTemplate: true });
      onClose?.();
    } catch (e) {
      console.error("[customize] save failed:", e);
      setError(e?.message || "Couldn't save the template.");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 animate-fade-in"
      onClick={() => !saving && onClose?.()}
    >
      <div
        className="bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.5)] w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#f0f0f0] dark:border-[#2a2a2a] flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#075056] dark:text-[#5eead4] mb-1">
              Customize template
            </div>
            <h3 className="text-xl font-black text-[#262626] dark:text-white tracking-tight">
              Copy &amp; edit · {source.name}
            </h3>
            <p className="text-sm text-[#666666] dark:text-[#aaaaaa] mt-1">
              The original stays put. This makes a new template owned by you.
            </p>
          </div>

          {/* View toggle */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[#f5f5f5] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333]">
            <button
              onClick={() => setView("preview")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === "preview"
                  ? "bg-white dark:bg-[#333333] text-[#262626] dark:text-white shadow-sm"
                  : "text-[#777777] dark:text-[#aaaaaa] hover:text-[#262626] dark:hover:text-white"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setView("code")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === "code"
                  ? "bg-white dark:bg-[#333333] text-[#262626] dark:text-white shadow-sm"
                  : "text-[#777777] dark:text-[#aaaaaa] hover:text-[#262626] dark:hover:text-white"
              }`}
            >
              HTML
            </button>
          </div>

          <button
            onClick={() => !saving && onClose?.()}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#777777] dark:text-[#aaaaaa] hover:text-[#262626] dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#262626] transition-all shrink-0"
            title="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Name + category row */}
        <div className="px-6 py-4 border-b border-[#f0f0f0] dark:border-[#2a2a2a] grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-3 bg-[#fafafa] dark:bg-[#161616]">
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#666666] dark:text-[#aaaaaa] mb-1.5">
              Template name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Plumbing landing page"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#333333] rounded-xl text-sm text-[#262626] dark:text-white focus:outline-none focus:border-[#075056] dark:focus:border-[#5eead4] focus:ring-4 focus:ring-[#075056]/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#666666] dark:text-[#aaaaaa] mb-1.5">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Custom"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#333333] rounded-xl text-sm text-[#262626] dark:text-white focus:outline-none focus:border-[#075056] dark:focus:border-[#5eead4] focus:ring-4 focus:ring-[#075056]/10 transition-all"
            />
          </div>
        </div>

        {/* AI prompt bar — describe a change in plain English, AI rewrites the HTML */}
        <div className="px-6 py-3.5 border-b border-[#f0f0f0] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-[#075056]/8 to-[#5eead4]/8 dark:from-[#075056]/15 dark:to-[#5eead4]/15 border border-[#075056]/15 dark:border-[#5eead4]/15">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#075056] dark:text-[#5eead4]">
                <path d="M12 2v2M5 5l1.5 1.5M2 12h2M5 19l1.5-1.5M12 22v-2M19 19l-1.5-1.5M22 12h-2M19 5l-1.5 1.5"/>
                <circle cx="12" cy="12" r="5"/>
              </svg>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#075056] dark:text-[#5eead4] whitespace-nowrap">Ask AI</span>
            </div>
            <input
              type="text"
              value={aiInstruction}
              onChange={(e) => { setAiInstruction(e.target.value); setAiError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter" && !aiBusy) handleAiRefine(); }}
              placeholder={'e.g. "Change all buttons to dark green", "Add a pricing section", "Make the hero headline shorter"'}
              disabled={aiBusy}
              className="flex-1 px-4 py-2.5 bg-[#fafafa] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-xl text-sm text-[#262626] dark:text-white placeholder:text-[#aaaaaa] dark:placeholder:text-[#666666] focus:outline-none focus:border-[#075056] dark:focus:border-[#5eead4] focus:bg-white dark:focus:bg-[#1c1c1c] focus:ring-4 focus:ring-[#075056]/10 disabled:opacity-50 transition-all"
            />
            {history.length > 0 && !aiBusy && (
              <button
                onClick={handleUndo}
                title={`Undo last AI change (${history.length} available)`}
                className="px-3 py-2.5 text-sm font-semibold text-[#777777] dark:text-[#aaaaaa] hover:text-[#262626] dark:hover:text-white border border-[#e5e5e5] dark:border-[#333333] rounded-xl hover:bg-[#fafafa] dark:hover:bg-[#262626] transition-all"
              >
                Undo
              </button>
            )}
            <button
              onClick={handleAiRefine}
              disabled={aiBusy || !aiInstruction.trim()}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#075056] text-white text-sm font-bold rounded-xl hover:bg-[#064548] hover:shadow-lg hover:shadow-[#075056]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
            >
              {aiBusy ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Applying…
                </>
              ) : (
                <>
                  Apply
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </div>
          {aiError && (
            <div className="mt-2 text-xs text-red-500 dark:text-red-400 font-medium">{aiError}</div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 bg-[#f5f5f5] dark:bg-[#0a0a0a] overflow-hidden relative">
          {view === "preview" ? (
            <div className="w-full h-full p-4">
              <div className="w-full h-full rounded-xl overflow-hidden border border-[#e5e5e5] dark:border-[#333333] bg-white">
                <iframe
                  title="Customized preview"
                  srcDoc={renderPreviewHtml(html, { hideScroll: false })}
                  sandbox="allow-scripts"
                  className="w-full h-full border-0 block"
                />
              </div>
            </div>
          ) : (
            <textarea
              ref={codeRef}
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              spellCheck="false"
              className="w-full h-full p-6 font-mono text-[13px] leading-relaxed bg-white dark:bg-[#0f0f0f] text-[#262626] dark:text-[#d4d4d4] outline-none resize-none"
              placeholder="<!DOCTYPE html>…"
            />
          )}

          {/* Mobile view toggle (since header toggle is hidden on small screens) */}
          <div className="md:hidden absolute top-3 right-3 flex items-center gap-1 p-1 rounded-xl bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur border border-[#e5e5e5] dark:border-[#333333]">
            <button
              onClick={() => setView("preview")}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${view === "preview" ? "bg-[#075056] text-white" : "text-[#777777]"}`}
            >
              Preview
            </button>
            <button
              onClick={() => setView("code")}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${view === "code" ? "bg-[#075056] text-white" : "text-[#777777]"}`}
            >
              HTML
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#f0f0f0] dark:border-[#2a2a2a] flex items-center justify-between gap-3 flex-wrap bg-white dark:bg-[#1a1a1a]">
          <div className="text-xs text-[#888888] dark:text-[#888888]">
            {error ? (
              <span className="text-red-500 dark:text-red-400 font-semibold">{error}</span>
            ) : (
              <>
                Tip: switch to <span className="font-semibold text-[#555555] dark:text-[#cccccc]">HTML</span> to edit the markup directly.
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => !saving && onClose?.()}
              disabled={saving}
              className="px-4 py-2.5 text-[#777777] dark:text-[#aaaaaa] hover:text-[#262626] dark:hover:text-white text-sm font-semibold rounded-xl hover:bg-[#f5f5f5] dark:hover:bg-[#262626] disabled:opacity-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim() || !html.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#075056] text-white text-sm font-bold rounded-xl hover:bg-[#064548] hover:shadow-lg hover:shadow-[#075056]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? "Saving…" : "Save as new template"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
