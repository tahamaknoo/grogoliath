"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "../../lib/supabaseClient";
import STARTER_TEMPLATES from "../data/starterTemplates";
import Loader from "./Loader";
import { IDEAL_FOR, styleForTemplate } from "../../lib/templateMeta";
import { fetchBrandKits } from "../../lib/brandKits";
import { apiFetch } from "../../lib/apiFetch";

const WIZARD_DRAFT_KEY = 'gg-wizard-draft';

const KEYWORD_EXAMPLES = [
  'wedding photographer',
  'dental clinic',
  'yoga studio',
  'bookkeeping software',
  'auto repair shop',
  'law firm',
  'marketing agency',
  'vet clinic',
  'personal trainer',
  'tax accountant',
  'boutique hotel',
  'real estate agent',
  'lawn care company',
  'florist',
];

// Typewriter hook — types/deletes a word, then rotates to the next.
// Pauses entirely when `active` is false (e.g. user has typed something).
function useRotatingPlaceholder(words, { active = true, typeMs = 70, deleteMs = 35, holdMs = 1400 } = {}) {
  const [text, setText] = useState(words[0] || '');
  const [idx, setIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!active || words.length === 0) return;
    const word = words[idx];
    let t;
    if (!deleting) {
      if (text.length < word.length) {
        t = setTimeout(() => setText(word.slice(0, text.length + 1)), typeMs);
      } else {
        t = setTimeout(() => setDeleting(true), holdMs);
      }
    } else {
      if (text.length > 0) {
        t = setTimeout(() => setText(word.slice(0, text.length - 1)), deleteMs);
      } else {
        setIdx((idx + 1) % words.length);
        setDeleting(false);
      }
    }
    return () => clearTimeout(t);
  }, [text, deleting, idx, words, typeMs, deleteMs, holdMs, active]);

  return text;
}

export default function OnboardingWizard({ session, onComplete, onMinimize, initialTemplate = null }) {
  const [currentStep, setCurrentStep] = useState(1);
  const TOTAL_STEPS = 5;

  // Step 1 — content type + core info
  const [contentType, setContentType]                 = useState("page"); // 'page' | 'blog'
  const [businessType, setBusinessType]               = useState("");
  const [keyword, setKeyword]                         = useState("");
  const [location, setLocation]                       = useState("");

  // Rotating placeholder shows the variety of businesses GroGoliath can serve.
  // Pauses once the user types something so it doesn't distract.
  const keywordPlaceholder = useRotatingPlaceholder(KEYWORD_EXAMPLES, { active: !keyword });

  // Step 2 — business details
  const [businessDescription, setBusinessDescription] = useState("");
  const [services, setServices]                       = useState("");
  const [usps, setUsps]                               = useState("");
  const [targetCustomer, setTargetCustomer]           = useState("");
  const [phone, setPhone]                             = useState("");
  const [yearsInBusiness, setYearsInBusiness]         = useState("");

  // Step 3 — template
  const [templates, setTemplates]               = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Step 3 — brand kit (optional)
  const [brandKits, setBrandKits]               = useState([]);
  const [selectedKitId, setSelectedKitId]       = useState('');
  useEffect(() => { fetchBrandKits(session?.access_token).then(setBrandKits); }, [session?.access_token]);

  // Apply a kit's saved details to fill the wizard's intake fields.
  // Only fills empty inputs so we don't clobber what the user just typed.
  // Switching kits replaces values that came from the previous kit, but never
  // clobbers anything the user typed manually. A field is considered "from the
  // previous kit" if it matches that kit's value verbatim.
  const applyKitFields = (kitId) => {
    const prevKit = selectedKitId ? brandKits.find(k => k.id === selectedKitId) : null;
    setSelectedKitId(kitId);
    if (!kitId) return;
    const kit = brandKits.find(k => k.id === kitId);
    if (!kit) return;

    const eq = (a, b) => String(a || '').trim() === String(b || '').trim();
    const fill = (current, setter, prevKitVal, nextKitVal) => {
      if (!String(current || '').trim() || eq(current, prevKitVal)) {
        setter(nextKitVal || '');
      }
    };

    fill(businessType, setBusinessType, prevKit?.name, kit.name);
    fill(businessDescription, setBusinessDescription, prevKit?.business_description, kit.business_description);
    fill(services, setServices, prevKit?.services, kit.services);
    fill(usps, setUsps, prevKit?.usps, kit.usps);
    fill(targetCustomer, setTargetCustomer, prevKit?.target_customer, kit.target_customer);
    fill(phone, setPhone, prevKit?.phone, kit.phone);
    fill(yearsInBusiness, setYearsInBusiness, prevKit?.years_in_business, kit.years_in_business);

    // Tone/length: replace if the new kit specifies one or if user previously
    // inherited it from the prior kit.
    if (kit.default_tone || eq(tone, prevKit?.default_tone)) setTone(kit.default_tone || tone);
    if (kit.default_length || eq(length, prevKit?.default_length)) setLength(kit.default_length || length);
  };

  // Step 3 — preview-on-click
  const [previewingTemplate, setPreviewingTemplate] = useState(null);
  useEffect(() => {
    if (!previewingTemplate) return;
    const onKey = (e) => { if (e.key === 'Escape') setPreviewingTemplate(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previewingTemplate]);

  // Step 4 — content settings
  const [tone, setTone]     = useState("Professional");
  const [length, setLength] = useState("Medium");

  // Step 4 — preview generation
  const [isGenerating, setIsGenerating]     = useState(false);
  const [previewHtml, setPreviewHtml]       = useState("");
  const [generationError, setGenerationError] = useState("");
  const [createdProject, setCreatedProject] = useState(null);
  const [saveState, setSaveState] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'failed'
  const [saveError, setSaveError] = useState(null);
  const [closePromptOpen, setClosePromptOpen] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [generatedPage, setGeneratedPage]   = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [refineInstruction, setRefineInstruction] = useState("");
  const [isRefining, setIsRefining]         = useState(false);
  const [refineError, setRefineError]       = useState("");
  const [previewDevice, setPreviewDevice]   = useState("desktop");

  const generationStarted = useRef(false);
  const timerRef = useRef(null);

  // Restore wizard state from a saved minimize, if any
  useEffect(() => {
    try {
      const raw = localStorage.getItem(WIZARD_DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (typeof d.currentStep === 'number') setCurrentStep(d.currentStep);
        if (typeof d.contentType === 'string') setContentType(d.contentType);
        if (typeof d.businessType === 'string') setBusinessType(d.businessType);
        if (typeof d.keyword === 'string') setKeyword(d.keyword);
        if (typeof d.location === 'string') setLocation(d.location);
        if (typeof d.businessDescription === 'string') setBusinessDescription(d.businessDescription);
        if (typeof d.services === 'string') setServices(d.services);
        if (typeof d.usps === 'string') setUsps(d.usps);
        if (typeof d.targetCustomer === 'string') setTargetCustomer(d.targetCustomer);
        if (typeof d.phone === 'string') setPhone(d.phone);
        if (typeof d.yearsInBusiness === 'string') setYearsInBusiness(d.yearsInBusiness);
        if (typeof d.tone === 'string') setTone(d.tone);
        if (typeof d.length === 'string') setLength(d.length);
        if (typeof d.selectedKitId === 'string') setSelectedKitId(d.selectedKitId);
        if (d.selectedTemplate) setSelectedTemplate(d.selectedTemplate);
        if (typeof d.previewHtml === 'string') setPreviewHtml(d.previewHtml);
        if (d.generatedPage) setGeneratedPage(d.generatedPage);
        if (d.createdProject) setCreatedProject(d.createdProject);
      }
    } catch { /* ignore */ }
    setDraftRestored(true);
  }, []);

  // Persist wizard state on every meaningful change (after restore completes)
  useEffect(() => {
    if (!draftRestored) return;
    try {
      localStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify({
        currentStep, contentType,
        businessType, keyword, location,
        businessDescription, services, usps, targetCustomer, phone, yearsInBusiness,
        tone, length, selectedKitId,
        selectedTemplate, previewHtml, generatedPage, createdProject,
      }));
    } catch { /* storage full or blocked — silently skip */ }
  }, [
    draftRestored, currentStep, contentType,
    businessType, keyword, location,
    businessDescription, services, usps, targetCustomer, phone, yearsInBusiness,
    tone, length, selectedKitId,
    selectedTemplate, previewHtml, generatedPage, createdProject,
  ]);

  const clearWizardDraft = () => { try { localStorage.removeItem(WIZARD_DRAFT_KEY); } catch { /* ignore */ } };

  useEffect(() => { fetchTemplates(); }, []);

  useEffect(() => {
    if (currentStep === 5 && !generationStarted.current) {
      generationStarted.current = true;
      handleGeneratePreview();
    }
  }, [currentStep]);

  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    const timeout = setTimeout(() => {
      setTemplates(STARTER_TEMPLATES.map(t => ({ ...t, _isStarter: true })));
      setIsLoadingTemplates(false);
    }, 8000);
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });
      clearTimeout(timeout);
      if (error) throw error;
      const userTemplates = (data || []).map(t => ({ ...t, _isUserTemplate: true }));
      setTemplates([...userTemplates, ...STARTER_TEMPLATES.map(t => ({ ...t, _isStarter: true }))]);
    } catch (err) {
      clearTimeout(timeout);
      setTemplates(STARTER_TEMPLATES.map(t => ({ ...t, _isStarter: true })));
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const withTimeout = (promise, ms, label) =>
    Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
      ),
    ]);

  // Direct PostgREST writes with a hard timeout. supabase-js's .insert().select()
  // chain has been silently stalling on this app — fetch() can't do that.
  const restWrite = async ({ table, body, method = 'POST', query = '', returnRow = true }) => {
    const token = session?.access_token;
    if (!token) throw new Error('Not signed in.');
    const url = `${SUPABASE_URL}/rest/v1/${table}${query}`;
    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    if (returnRow) headers.Prefer = 'return=representation';

    const fetchPromise = fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${method} ${table} timed out after 20s.`)), 20000)
    );
    const res = await Promise.race([fetchPromise, timeout]);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`${method} ${table} failed (${res.status}): ${text || res.statusText}`);
    }
    if (!returnRow) return null;
    const rows = await res.json().catch(() => []);
    return Array.isArray(rows) ? rows[0] : rows;
  };

  const saveProjectInBackground = async (html) => {
    console.log('[wizard] saveProjectInBackground start');
    setSaveState('saving');
    setSaveError(null);
    try {
      let project = createdProject;
      if (!project) {
        project = await restWrite({
          table: 'projects',
          body: {
            user_id: session.user.id,
            name: `${businessType} Pages`,
            status: 'Draft',
            data: {
              headers: ['Keyword', 'Location', 'Service'],
              rows: [{ Keyword: keyword, Location: location, Service: businessType }],
              settings: { tone, length, templateId: selectedTemplate?.id, services, usps, targetCustomer, phone, yearsInBusiness },
            },
            row_count: 1,
          },
        });
        if (!project) throw new Error('No project returned by Supabase.');
        console.log('[wizard] project insert ok', project.id);
        setCreatedProject(project);
      } else {
        // Regenerating — drop the old page so we don't double-store HTML
        try {
          await restWrite({ table: 'pages', method: 'DELETE', query: `?project_id=eq.${encodeURIComponent(project.id)}`, returnRow: false });
        } catch (e) { console.warn('[wizard] page delete failed (ignored):', e.message); }
      }
      await restWrite({
        table: 'pages',
        body: {
          project_id: project.id,
          user_id: session.user.id,
          keyword: `${keyword} in ${location}`,
          location,
          html_content: html,
          status: 'completed',
        },
        returnRow: false,
      });
      console.log('[wizard] page insert ok');
      setSaveState('saved');
      return project;
    } catch (err) {
      console.error('[wizard] saveProjectInBackground failed:', err);
      setSaveError(err?.message || String(err));
      setSaveState('failed');
      return null;
    }
  };

  const handleGeneratePreview = async (existingProject = null) => {
    setIsGenerating(true);
    setGenerationError("");
    setPreviewHtml("");
    setGeneratedPage(null);
    setElapsedSeconds(0);
    if (existingProject === null && createdProject) {
      // Regenerating — keep reference but clear old pages
      setCreatedProject(prev => prev);
    }
    timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);

    try {
      // Generate first — never block on Supabase
      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => controller.abort(), 100000);

      const selectedKit = selectedKitId ? brandKits.find(k => k.id === selectedKitId) : null;
      let response;
      try {
        response = await apiFetch("/api/generate-page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            keyword,
            location,
            service:             businessType,
            businessDescription: businessDescription.trim(),
            services:            services.trim(),
            usps:                usps.trim(),
            targetCustomer:      targetCustomer.trim(),
            phone:               phone.trim(),
            yearsInBusiness:     yearsInBusiness.trim(),
            tone,
            length,
            contentType,
            template_html:       selectedTemplate?.structure || "",
            brandKit: selectedKit ? {
              name: selectedKit.name,
              primary_color: selectedKit.primary_color,
              logo_url: selectedKit.logo_url,
              voice: selectedKit.voice,
            } : null,
          }),
        });
      } catch (fetchErr) {
        if (fetchErr.name === "AbortError") throw new Error("Generation timed out. Please try again.");
        throw fetchErr;
      } finally {
        clearTimeout(fetchTimeout);
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to generate page");

      // Show preview immediately
      setPreviewHtml(result.html);
      setGeneratedPage(result);

      // Save to Supabase in background — never blocks the user
      saveProjectInBackground(result.html);

    } catch (err) {
      setGenerationError(err.message || "Something went wrong");
    } finally {
      clearInterval(timerRef.current);
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    handleGeneratePreview(createdProject);
  };

  const handleRefine = async () => {
    if (!refineInstruction.trim() || !previewHtml) return;
    setIsRefining(true);
    setRefineError("");
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 100000);
      let response;
      try {
        response = await apiFetch("/api/refine-page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ current_html: previewHtml, instruction: refineInstruction }),
        });
      } catch (err) {
        if (err.name === "AbortError") throw new Error("Refinement timed out. Try again.");
        throw err;
      } finally {
        clearTimeout(t);
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Refinement failed");
      setPreviewHtml(result.html);
      setRefineInstruction("");
      // Update saved page in Supabase non-fatally
      if (createdProject) {
        supabase.from("pages")
          .update({ html_content: result.html })
          .eq("project_id", createdProject.id)
          .then(() => {}).catch(() => {});
      }
    } catch (err) {
      setRefineError(err.message || "Something went wrong");
    } finally {
      setIsRefining(false);
    }
  };

  const handleOpenProject = async () => {
    // If the background save failed or hasn't finished, run/retry it now and wait for the result.
    let project = createdProject;
    if (!project && previewHtml) {
      project = await saveProjectInBackground(previewHtml);
    }
    if (!project) {
      window.alert(
        `Could not save your project: ${saveError || 'Unknown error'}\n\n` +
        `If this keeps happening, your Supabase 'projects' or 'pages' table may be missing INSERT policies.`
      );
      return;
    }
    localStorage.setItem("hasCompletedOnboarding", "true");
    clearWizardDraft();
    onComplete?.({ project, pages: generatedPage ? [generatedPage] : [] });
  };

  const BackButton = ({ to }) => (
    <button
      onClick={() => setCurrentStep(to)}
      className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 flex items-center gap-2 transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );

  return (
    <div className="fixed inset-0 bg-white dark:bg-[#111111] z-50 overflow-y-auto">
      {/* Close button */}
      <button
        onClick={() => setClosePromptOpen(true)}
        disabled={isGenerating}
        className="fixed top-5 right-5 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-[#262626] hover:bg-slate-200 dark:hover:bg-[#333333] text-slate-500 dark:text-[#fbfbfb] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title="Close"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Close-or-minimize prompt */}
      {closePromptOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-[120] flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setClosePromptOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#262626] rounded-2xl border border-[#e5e5e5] dark:border-[#404040] shadow-[0_20px_60px_rgba(0,0,0,0.5)] max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black text-[#262626] dark:text-white tracking-tight mb-1.5">Leave the project setup?</h3>
            <p className="text-sm text-slate-500 dark:text-[#fbfbfb] mb-5">Your progress isn&rsquo;t saved yet. Pick what you&rsquo;d like to do.</p>
            <div className="space-y-2.5 mb-4">
              <button
                onClick={() => {
                  setClosePromptOpen(false);
                  localStorage.setItem("hasSeenOnboarding", "true");
                  // Draft is already in localStorage from the persistence effect; just hide the wizard.
                  // The Resume pill in page.js picks it up and lets the user reopen.
                  if (onMinimize) onMinimize();
                  else window.history.back();
                }}
                className="w-full text-left flex items-start gap-3 p-3.5 bg-[#075056]/5 dark:bg-[#075056]/10 hover:bg-[#075056]/10 dark:hover:bg-[#075056]/20 border border-[#075056]/30 hover:border-[#075056] rounded-xl transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#075056] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#262626] dark:text-white">Minimize for later</div>
                  <div className="text-xs text-slate-500 dark:text-[#fbfbfb] mt-0.5">A pill appears in the bottom corner — click to resume anytime.</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setClosePromptOpen(false);
                  // Cancel & discard — clear the saved draft and close the wizard
                  clearWizardDraft();
                  onComplete?.(null);
                }}
                className="w-full text-left flex items-start gap-3 p-3.5 bg-red-50/50 dark:bg-red-500/5 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/30 hover:border-red-400 dark:hover:border-red-500/60 rounded-xl transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/></svg>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-red-600 dark:text-red-400">Cancel &amp; discard</div>
                  <div className="text-xs text-red-500/80 dark:text-red-400/80 mt-0.5">Throw away everything you&rsquo;ve entered so far.</div>
                </div>
              </button>
            </div>
            <button
              onClick={() => setClosePromptOpen(false)}
              className="w-full px-4 py-2.5 bg-transparent text-slate-500 dark:text-[#fbfbfb] hover:text-[#262626] dark:hover:text-white text-sm font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-[#333333] transition-all"
            >
              Keep building
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-5xl w-full">

          {/* Progress bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wide">
                {(() => {
                  const total = initialTemplate ? TOTAL_STEPS - 1 : TOTAL_STEPS;
                  // Map currentStep → display step when step 3 is hidden
                  const display = initialTemplate
                    ? (currentStep <= 2 ? currentStep : currentStep - 1)
                    : currentStep;
                  return `Step ${Math.min(display, total)} of ${total}`;
                })()}
              </div>
              {initialTemplate && (
                <div className="text-xs text-slate-500 dark:text-[#fbfbfb] flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#075056] dark:text-[#14b8a6] bg-[#075056]/10 dark:bg-[#075056]/20 border border-[#075056]/20 dark:border-[#075056]/40 rounded-full">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Template: {initialTemplate.name}
                  </span>
                </div>
              )}
            </div>
            <div className="h-1.5 bg-slate-200 dark:bg-[#303030] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#075056] transition-all duration-500"
                style={{
                  width: (() => {
                    const total = initialTemplate ? TOTAL_STEPS - 1 : TOTAL_STEPS;
                    const display = initialTemplate
                      ? (currentStep <= 2 ? currentStep : currentStep - 1)
                      : currentStep;
                    return `${(Math.min(display, total) / total) * 100}%`;
                  })(),
                }}
              />
            </div>
          </div>

          {/* ── Step 1: Core Info ── */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-display text-6xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">
                  Let&rsquo;s build your<br />{contentType === 'blog' ? 'first blog post' : 'first page'}
                </h1>
                <p className="text-xl text-slate-500 dark:text-[#fbfbfb]">
                  {contentType === 'blog'
                    ? 'Tell us about the topic and we’ll draft a long-form blog post for you.'
                    : 'Tell us about your business and we’ll generate a full landing page preview.'}
                </p>
              </div>

              {/* Content type picker */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider mb-3">
                  What are you building?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setContentType('page')}
                    className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all hover:-translate-y-0.5 ${
                      contentType === 'page'
                        ? 'border-[#075056] bg-[#075056]/5 dark:bg-[#075056]/10 shadow-[0_0_0_3px_rgba(7,80,86,0.15)]'
                        : 'border-slate-200 dark:border-[#333333] hover:border-slate-300 dark:hover:border-[#404040] bg-white dark:bg-[#1c1c1c]'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      contentType === 'page' ? 'bg-[#075056] text-white' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-base font-bold text-slate-900 dark:text-white mb-0.5">Landing page</div>
                      <div className="text-sm text-slate-500 dark:text-[#fbfbfb]">Hero, services, testimonials, CTA — for a business or service.</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentType('blog')}
                    className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all hover:-translate-y-0.5 ${
                      contentType === 'blog'
                        ? 'border-[#075056] bg-[#075056]/5 dark:bg-[#075056]/10 shadow-[0_0_0_3px_rgba(7,80,86,0.15)]'
                        : 'border-slate-200 dark:border-[#333333] hover:border-slate-300 dark:hover:border-[#404040] bg-white dark:bg-[#1c1c1c]'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      contentType === 'blog' ? 'bg-[#075056] text-white' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-base font-bold text-slate-900 dark:text-white mb-0.5">Blog post</div>
                      <div className="text-sm text-slate-500 dark:text-[#fbfbfb]">Long-form article — comparison, how-to, listicle, or guide.</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Brand kit auto-fill */}
              {brandKits.length > 0 && (
                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider">
                      Use a saved brand kit
                    </label>
                    {selectedKitId && (
                      <button
                        type="button"
                        onClick={() => setSelectedKitId('')}
                        className="text-[11px] font-semibold text-slate-500 dark:text-[#fbfbfb] hover:text-[#075056] dark:hover:text-[#5eead4] transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {brandKits.map(kit => {
                      const active = selectedKitId === kit.id;
                      return (
                        <button
                          key={kit.id}
                          type="button"
                          onClick={() => applyKitFields(kit.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all hover:-translate-y-0.5 ${
                            active
                              ? 'border-[#075056] bg-[#075056]/5 dark:bg-[#075056]/10 shadow-[0_0_0_3px_rgba(7,80,86,0.15)]'
                              : 'border-slate-200 dark:border-[#333333] hover:border-slate-300 dark:hover:border-[#404040] bg-white dark:bg-[#1c1c1c]'
                          }`}
                        >
                          <div
                            className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: kit.primary_color || '#075056', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                          >
                            {kit.logo_url ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={kit.logo_url} alt="" className="w-full h-full object-contain rounded-lg" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            ) : (
                              (kit.name || '?')[0].toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{kit.name}</div>
                            <div className="text-[11px] text-slate-500 dark:text-[#fbfbfb] truncate">
                              {kit.business_type || 'Brand kit'}
                            </div>
                          </div>
                          {active && (
                            <svg className="w-4 h-4 text-[#075056] dark:text-[#5eead4] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {selectedKitId && (
                    <p className="text-[11px] text-slate-500 dark:text-[#fbfbfb] mt-2">
                      Empty fields below will be filled from this kit. Edit anything you want before continuing.
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider mb-3">
                    Business name
                  </label>
                  <input
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="e.g., Acme Plumbing, Green Landscaping Co."
                    autoFocus
                    className="w-full px-6 py-5 text-lg bg-white dark:bg-[#262626] border-2 border-slate-200 dark:border-[#333333] rounded-2xl focus:outline-none focus:border-[#075056] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider mb-3">
                      Primary keyword / service
                    </label>
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder={keywordPlaceholder ? `e.g., ${keywordPlaceholder}` : 'e.g., wedding photographer'}
                      className="w-full px-6 py-5 text-lg bg-white dark:bg-[#262626] border-2 border-slate-200 dark:border-[#333333] rounded-2xl focus:outline-none focus:border-[#075056] transition-colors"
                    />
                    <p className="text-sm text-slate-400 mt-2 dark:text-[#fbfbfb]">You'll add more keywords in your project.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider mb-3">
                      Primary location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Chicago"
                      className="w-full px-6 py-5 text-lg bg-white dark:bg-[#262626] border-2 border-slate-200 dark:border-[#333333] rounded-2xl focus:outline-none focus:border-[#075056] transition-colors"
                    />
                    <p className="text-sm text-slate-400 mt-2 dark:text-[#fbfbfb]">You'll add more locations too.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!businessType.trim() || !keyword.trim() || !location.trim()}
                  className="px-8 py-4 bg-[#075056] text-white text-lg font-bold rounded-xl hover:bg-[#064548] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Business Details ── */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <BackButton to={1} />
                <h1 className="font-display text-6xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">
                  Tell us more
                </h1>
                <p className="text-xl text-slate-500 dark:text-[#fbfbfb]">
                  The more context you give, the more accurate and specific your pages will be.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider mb-3">
                    What do you do? <span className="normal-case font-normal text-slate-400 dark:text-[#fbfbfb]">(your elevator pitch)</span>
                  </label>
                  <textarea
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    placeholder="e.g., We're a family-run plumbing company specialising in emergency repairs, drain unblocking, and boiler servicing. Known for fast response times and upfront pricing."
                    rows={3}
                    className="w-full px-6 py-4 text-base bg-white dark:bg-[#262626] border-2 border-slate-200 dark:border-[#333333] rounded-2xl focus:outline-none focus:border-[#075056] transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider mb-3">
                    Services you offer <span className="normal-case font-normal text-slate-400 dark:text-[#fbfbfb]">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={services}
                    onChange={(e) => setServices(e.target.value)}
                    placeholder="e.g., Drain cleaning, Emergency repairs, Boiler installation, Leak detection"
                    className="w-full px-6 py-5 text-base bg-white dark:bg-[#262626] border-2 border-slate-200 dark:border-[#333333] rounded-2xl focus:outline-none focus:border-[#075056] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider mb-3">
                    What makes you different? <span className="normal-case font-normal text-slate-400 dark:text-[#fbfbfb]">(your USPs)</span>
                  </label>
                  <input
                    type="text"
                    value={usps}
                    onChange={(e) => setUsps(e.target.value)}
                    placeholder="e.g., 24/7 availability, no call-out fee, 10-year guarantee, family-run since 1998"
                    className="w-full px-6 py-5 text-base bg-white dark:bg-[#262626] border-2 border-slate-200 dark:border-[#333333] rounded-2xl focus:outline-none focus:border-[#075056] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider mb-3">
                      Who is your ideal customer?
                    </label>
                    <input
                      type="text"
                      value={targetCustomer}
                      onChange={(e) => setTargetCustomer(e.target.value)}
                      placeholder="e.g., homeowners, landlords, small businesses"
                      className="w-full px-6 py-4 text-base bg-white dark:bg-[#262626] border-2 border-slate-200 dark:border-[#333333] rounded-2xl focus:outline-none focus:border-[#075056] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider mb-3">
                      Years in business <span className="normal-case font-normal text-slate-400 dark:text-[#fbfbfb]">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={yearsInBusiness}
                      onChange={(e) => setYearsInBusiness(e.target.value)}
                      placeholder="e.g., 12"
                      className="w-full px-6 py-4 text-base bg-white dark:bg-[#262626] border-2 border-slate-200 dark:border-[#333333] rounded-2xl focus:outline-none focus:border-[#075056] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider mb-3">
                    Phone number <span className="normal-case font-normal text-slate-400 dark:text-[#fbfbfb]">(shown in CTA, optional)</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., (312) 555-0192"
                    className="w-full px-6 py-4 text-base bg-white dark:bg-[#262626] border-2 border-slate-200 dark:border-[#333333] rounded-2xl focus:outline-none focus:border-[#075056] transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setCurrentStep(1)} className="px-6 py-3 text-slate-500 dark:text-[#fbfbfb] font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-[#333333] transition-colors">
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep(initialTemplate ? 4 : 3)}
                  className="px-8 py-4 bg-[#075056] text-white text-lg font-bold rounded-xl hover:bg-[#064548] transition-colors"
                >
                  {initialTemplate ? 'Content settings →' : 'Pick a template →'}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Template Selection ── */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <BackButton to={2} />
                <h1 className="font-display text-6xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">
                  Pick your template
                </h1>
                <p className="text-xl text-slate-500 dark:text-[#fbfbfb]">
                  Choose a design for your preview page
                </p>
              </div>

              {/* Create your own banner */}
              <button
                onClick={() => window.open("/?tab=templates&action=create", "_blank")}
                className="group w-full text-left flex items-center gap-5 p-5 sm:p-6 bg-gradient-to-br from-white to-[#fafafa] dark:from-[#1a1a1a] dark:to-[#111111] border border-dashed border-[#b8b8b8] dark:border-[#525252] rounded-2xl hover:border-solid hover:border-[#075056] dark:hover:border-[#075056] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#075056]/10 dark:bg-[#075056]/20 flex items-center justify-center text-[#075056] dark:text-[#5eead4] group-hover:bg-[#075056] group-hover:text-white dark:group-hover:bg-[#075056] dark:group-hover:text-white group-hover:rotate-90 transition-all duration-500 shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-1">Create your own template</h3>
                  <p className="text-sm text-slate-500 dark:text-[#fbfbfb]">Open the visual builder in a new tab and design from scratch.</p>
                </div>
                <span className="hidden sm:flex items-center justify-center w-10 h-10 bg-[#075056] text-white rounded-xl shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </span>
              </button>

              {isLoadingTemplates && (
                <div className="flex justify-center py-12">
                  <Loader inline />
                </div>
              )}

              {!isLoadingTemplates && templates.length > 0 && (() => {
                // Group identically to TemplatesView: customs first, then by category in a fixed order
                const customs = templates.filter(t => t._isUserTemplate);
                const starters = templates.filter(t => !t._isUserTemplate);
                const ORDER = ['General', 'Local Business', 'Professional Services', 'Blog', 'Premium'];
                const groups = {};
                starters.forEach(t => {
                  const c = t.category || 'Other';
                  (groups[c] = groups[c] || []).push(t);
                });
                const groupedSections = ORDER.filter(c => groups[c]).map(c => ({ category: c, list: groups[c] }))
                  .concat(Object.keys(groups).filter(c => !ORDER.includes(c)).map(c => ({ category: c, list: groups[c] })));

                const renderCard = (template) => {
                  const style = styleForTemplate(template);
                  const idealFor = IDEAL_FOR[template.id];
                  const description = idealFor
                    ? `Ideal for ${idealFor}.`
                    : (template._isUserTemplate ? 'Your custom template.' : 'Click to select.');
                  const badge = template._isStarter ? 'Starter' : template._isUserTemplate ? 'Custom' : null;
                  const isSelected = selectedTemplate?.id === template.id;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setSelectedTemplate(template)}
                      className={`group relative text-left flex flex-col bg-white dark:bg-[#1c1c1c] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_28px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer min-h-[200px] border-2 ${
                        isSelected
                          ? 'border-[#075056] shadow-[0_0_0_3px_rgba(7,80,86,0.18)]'
                          : 'border-[#d4d4d4] dark:border-[#404040] hover:border-[#075056]/60'
                      }`}
                    >
                      <div className="flex items-start justify-between p-5 pb-0">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${style.bg} ${style.fg}`}>
                          {style.icon}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isSelected && (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#075056] text-white">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </span>
                          )}
                          {badge && (
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#777777] dark:text-[#888888] bg-[#f5f5f5] dark:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#333333] px-2 py-1 rounded-full">{badge}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col flex-1 p-5 pt-4">
                        <h3 className="text-[15px] font-bold text-[#262626] dark:text-white tracking-tight leading-tight mb-1.5">{template.name}</h3>
                        <p className="text-xs text-[#777777] dark:text-[#888888] leading-relaxed line-clamp-2 mb-4 flex-1">{description}</p>
                        <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-[#f0f0f0] dark:border-[#2c2c2c]">
                          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#aaaaaa] dark:text-[#666666] truncate">{template.category || 'Template'}</span>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => { e.stopPropagation(); setPreviewingTemplate(template); }}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); setPreviewingTemplate(template); } }}
                            title="Preview template"
                            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#075056] dark:text-[#5eead4] hover:underline shrink-0 cursor-pointer"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                            Preview
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                };

                return (
                  <div className="space-y-10">
                    {customs.length > 0 && (
                      <section>
                        <div className="flex items-baseline justify-between mb-4">
                          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Your Templates</h2>
                          <span className="text-xs text-slate-500 dark:text-[#fbfbfb]">{customs.length} {customs.length === 1 ? 'template' : 'templates'}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
                          {customs.map(renderCard)}
                        </div>
                      </section>
                    )}
                    {groupedSections.map(({ category, list }) => (
                      <section key={category}>
                        <div className="flex items-baseline justify-between mb-4">
                          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{category}</h2>
                          <span className="text-xs text-slate-500 dark:text-[#fbfbfb]">{list.length} {list.length === 1 ? 'template' : 'templates'}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
                          {list.map(renderCard)}
                        </div>
                      </section>
                    ))}
                  </div>
                );
              })()}

              <div className="flex justify-between">
                <button onClick={() => setCurrentStep(2)} className="px-6 py-3 text-slate-500 dark:text-[#fbfbfb] font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-[#333333] transition-colors">
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  disabled={!selectedTemplate}
                  className="px-8 py-4 bg-[#075056] text-white text-lg font-bold rounded-xl hover:bg-[#064548] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Content settings →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Content Settings ── */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <BackButton to={3} />
                <h1 className="font-display text-6xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">
                  Content settings
                </h1>
                <p className="text-xl text-slate-500 dark:text-[#fbfbfb]">
                  How should your page sound?
                </p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider mb-4">Tone</label>
                  <div className="grid grid-cols-3 gap-4">
                    {["Professional", "Friendly", "Casual"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={`p-6 rounded-2xl border-2 font-semibold transition-all hover:scale-[1.02] ${
                          tone === t
                            ? "border-[#075056] bg-[#e6f5f4] dark:bg-[#075056]/10 text-[#075056]"
                            : "border-slate-200 dark:border-[#333333] text-slate-700 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider mb-4">
                    Content Length <span className="normal-case font-normal text-slate-400 dark:text-[#fbfbfb]">(controls how much copy Claude writes per section)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: "Short",  desc: "~1–2 sentences per section" },
                      { name: "Medium", desc: "~2–3 sentences per section" },
                      { name: "Long",   desc: "~4–6 sentences per section" },
                    ].map((l) => (
                      <button
                        key={l.name}
                        onClick={() => setLength(l.name)}
                        className={`p-6 rounded-2xl border-2 transition-all hover:scale-[1.02] ${
                          length === l.name
                            ? "border-[#075056] bg-[#e6f5f4] dark:bg-[#075056]/10"
                            : "border-slate-200 dark:border-[#333333] hover:border-slate-300"
                        }`}
                      >
                        <div className={`font-bold mb-1 ${length === l.name ? "text-[#075056]" : "text-slate-900 dark:text-white"}`}>{l.name}</div>
                        <div className="text-sm text-slate-400 dark:text-[#fbfbfb]">{l.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand Kit picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider mb-4">
                    Brand Kit <span className="normal-case font-normal text-slate-400 dark:text-[#fbfbfb]">(optional &mdash; applies your colors, logo, and voice)</span>
                  </label>
                  {brandKits.length === 0 ? (
                    <div className="flex items-center justify-between gap-4 p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#525252] bg-slate-50/50 dark:bg-[#1a1a1a]">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-700 dark:text-white">No brand kits yet</p>
                        <p className="text-sm text-slate-500 dark:text-[#fbfbfb] mt-0.5">Create one to apply your brand color, logo, and voice automatically.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.open('/?tab=brandkit', '_blank')}
                        className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-[#075056] text-white text-sm font-bold rounded-xl hover:bg-[#064548] transition-colors"
                      >
                        Create kit
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedKitId('')}
                        className={`p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${
                          !selectedKitId
                            ? 'border-[#075056] bg-[#e6f5f4] dark:bg-[#075056]/10'
                            : 'border-slate-200 dark:border-[#333333] hover:border-slate-300'
                        }`}
                      >
                        <div className={`text-base font-bold mb-1 ${!selectedKitId ? 'text-[#075056]' : 'text-slate-900 dark:text-white'}`}>None</div>
                        <div className="text-sm text-slate-400 dark:text-[#fbfbfb]">Use the template defaults.</div>
                      </button>
                      {brandKits.map(k => {
                        const active = selectedKitId === k.id;
                        return (
                          <button
                            key={k.id}
                            type="button"
                            onClick={() => applyKitFields(k.id)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${
                              active
                                ? 'border-[#075056] bg-[#e6f5f4] dark:bg-[#075056]/10'
                                : 'border-slate-200 dark:border-[#333333] hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 mb-1.5">
                              <span className="w-7 h-7 rounded-lg border border-slate-300 dark:border-[#404040] shrink-0" style={{ background: k.primary_color }} />
                              <div className={`text-base font-bold truncate ${active ? 'text-[#075056]' : 'text-slate-900 dark:text-white'}`}>{k.name}</div>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-[#fbfbfb] line-clamp-2 italic">{k.voice || 'No voice set.'}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setCurrentStep(initialTemplate ? 2 : 3)} className="px-6 py-3 text-slate-500 dark:text-[#fbfbfb] font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-[#333333] transition-colors">
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-8 py-4 bg-[#075056] text-white text-lg font-bold rounded-xl hover:bg-[#064548] transition-colors"
                >
                  Generate preview →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 5: Generate & Preview ── */}
          {currentStep === 5 && (
            <div className="space-y-8 animate-fade-in">
              {isGenerating ? (
                <div className="text-center space-y-6 py-12">
                  <div className="flex justify-center mb-4">
                    <Loader inline />
                  </div>
                  <div>
                    <h1 className="font-display text-5xl font-black text-slate-900 dark:text-white mb-3">
                      Building your preview…
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-[#fbfbfb]">
                      GroGoliath is writing copy for <strong className="text-slate-700 dark:text-slate-300">{keyword} in {location}</strong>
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-baseline gap-3">
                      <div className="text-2xl font-mono font-bold text-[#075056]">
                        {String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:{String(elapsedSeconds % 60).padStart(2, '0')}
                      </div>
                      {(() => {
                        // Estimate based on observed average — page generation typically completes in ~45s
                        const ETA_TOTAL = 50;
                        const remaining = Math.max(0, ETA_TOTAL - elapsedSeconds);
                        if (remaining > 0) {
                          return (
                            <div className="text-sm font-mono text-slate-400 dark:text-[#fbfbfb]">
                              · ~{remaining}s remaining
                            </div>
                          );
                        }
                        return (
                          <div className="text-sm font-mono text-slate-400 dark:text-[#fbfbfb]">
                            · finishing up
                          </div>
                        );
                      })()}
                    </div>
                    <p className="text-sm text-slate-400 dark:text-[#fbfbfb]">
                      {elapsedSeconds < 15 ? 'Setting up your project…' :
                       elapsedSeconds < 40 ? 'Writing headlines, descriptions, and copy…' :
                       elapsedSeconds < 70 ? 'Polishing the content, almost there…' :
                       'Taking a bit longer than usual, still working…'}
                    </p>
                    <p className="text-xs text-slate-300 dark:text-[#888888]">
                      Usually takes 30–60 seconds
                    </p>
                  </div>
                </div>
              ) : generationError ? (
                <div className="text-center space-y-6 py-12">
                  <h1 className="font-display text-5xl font-black text-slate-900 dark:text-white">Something went wrong</h1>
                  <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl text-left max-w-xl mx-auto">
                    <div className="text-sm font-bold text-red-700 dark:text-red-300 mb-2">Error</div>
                    <div className="text-sm text-red-600 dark:text-red-400">{generationError}</div>
                  </div>
                  <button
                    onClick={handleRegenerate}
                    className="px-8 py-4 bg-[#075056] text-white font-bold rounded-xl hover:bg-[#064548] transition-colors"
                  >
                    Try again
                  </button>
                </div>
              ) : previewHtml ? (
                <div className="space-y-4">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="font-display text-4xl font-black text-slate-900 dark:text-white mb-1">
                        Your preview is ready
                      </h1>
                      <p className="text-base text-slate-500 dark:text-[#fbfbfb]">
                        {keyword} in {location}
                      </p>
                    </div>
                    <div />
                  </div>

                  {/* Instruction bar */}
                  <style>{`
                    @keyframes gradientBorder {
                      0% { background-position: 0% 50%; }
                      50% { background-position: 100% 50%; }
                      100% { background-position: 0% 50%; }
                    }
                    @keyframes shimmerText {
                      0% { background-position: 0% 50%; }
                      50% { background-position: 100% 50%; }
                      100% { background-position: 0% 50%; }
                    }
                    .refine-label {
                      background: linear-gradient(90deg, #075056, #14b8a6, #5eead4, #075056);
                      background-size: 200% auto;
                      -webkit-background-clip: text;
                      -webkit-text-fill-color: transparent;
                      background-clip: text;
                      animation: shimmerText 3s linear infinite;
                    }
                    .refine-border {
                      background: linear-gradient(white, white) padding-box,
                        linear-gradient(270deg, #075056, #14b8a6, #5eead4, #064548) border-box;
                      background-size: 300% 300%;
                      animation: gradientBorder 4s ease infinite;
                      border: 2px solid transparent;
                    }
                    .dark .refine-border {
                      background: linear-gradient(#1c1c1c, #1c1c1c) padding-box,
                        linear-gradient(270deg, #075056, #14b8a6, #5eead4, #064548) border-box;
                      background-size: 300% 300%;
                      animation: gradientBorder 4s ease infinite;
                    }
                  `}</style>
                  <div className="refine-border rounded-2xl p-4">
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="refine-label text-xs font-black uppercase tracking-wider">Refine this page</span>
                      <span className="text-xs text-slate-400 dark:text-[#fbfbfb]">only what you describe changes</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={refineInstruction}
                        onChange={(e) => { setRefineInstruction(e.target.value); setRefineError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && !isRefining && handleRefine()}
                        placeholder='e.g. "Add a pros and cons section below the hero", "Shorten the headline to 6 words", "Change CTA to Book a Free Call"'
                        disabled={isRefining}
                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-[#333333] rounded-xl text-sm focus:outline-none focus:border-[#075056] focus:bg-white dark:focus:bg-[#111111] disabled:opacity-50 transition-colors placeholder:text-slate-400 dark:text-[#fbfbfb]"
                      />
                      <button
                        onClick={handleRefine}
                        disabled={!refineInstruction.trim() || isRefining}
                        className="px-5 py-3 bg-[#075056] text-white text-sm font-bold rounded-xl hover:bg-[#064548] disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#075056]/30 shrink-0"
                      >
                        {isRefining ? (
                          <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                            Applying…
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            Apply
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </span>
                        )}
                      </button>
                    </div>
                    {refineError && <p className="text-xs text-red-500 mt-2.5 pl-1">{refineError}</p>}
                  </div>

                  {/* Device toggle + open in tab */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#303030] rounded-xl">
                      <button
                        onClick={() => setPreviewDevice("desktop")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          previewDevice === "desktop"
                            ? "bg-white dark:bg-[#262626] text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-500 dark:text-[#fbfbfb] hover:text-slate-700"
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Desktop
                      </button>
                      <button
                        onClick={() => setPreviewDevice("mobile")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          previewDevice === "mobile"
                            ? "bg-white dark:bg-[#262626] text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-500 dark:text-[#fbfbfb] hover:text-slate-700"
                        }`}
                      >
                        <svg className="w-3 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Mobile
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        const blob = new Blob([previewHtml], { type: "text/html" });
                        const url = URL.createObjectURL(blob);
                        window.open(url, "_blank");
                        setTimeout(() => URL.revokeObjectURL(url), 10000);
                      }}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline transition-colors dark:text-[#fbfbfb]"
                    >
                      Open in new tab
                    </button>
                  </div>

                  {/* iframe */}
                  <div
                    className="rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-[#333333] shadow-2xl flex items-start justify-center bg-slate-100 dark:bg-[#111111]"
                    style={{ height: "68vh" }}
                  >
                    {isRefining ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                        <Loader inline />
                        <p className="text-slate-500 dark:text-[#fbfbfb] text-sm font-medium">Applying your changes…</p>
                      </div>
                    ) : previewDevice === "mobile" ? (
                      <div className="h-full flex items-center justify-center py-4">
                        <div className="relative h-full" style={{ width: "390px" }}>
                          {/* Phone chrome */}
                          <div className="absolute inset-0 rounded-[2.5rem] border-[6px] border-slate-300 dark:border-slate-600 pointer-events-none z-10 shadow-2xl" />
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-300 dark:bg-slate-600 rounded-b-xl z-20" />
                          <iframe
                            srcDoc={previewHtml}
                            sandbox="allow-scripts"
                            className="w-full h-full border-none rounded-[2rem]"
                            title="Mobile preview"
                          />
                        </div>
                      </div>
                    ) : (
                      <iframe srcDoc={previewHtml} sandbox="allow-scripts" className="w-full h-full border-none" title="Desktop preview" />
                    )}
                  </div>

                  {/* Finalize button */}
                  <div className="flex flex-col items-center gap-2 pt-2">
                    <button
                      onClick={handleOpenProject}
                      disabled={saveState === 'saving'}
                      className="flex items-center gap-2 px-10 py-4 bg-[#075056] text-white text-lg font-bold rounded-2xl hover:bg-[#064548] hover:shadow-xl hover:shadow-[#075056]/30 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
                    >
                      {saveState === 'saving' ? (
                        <>
                          <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                          Saving...
                        </>
                      ) : saveState === 'failed' ? (
                        'Retry & finalize →'
                      ) : (
                        'Finalize Project →'
                      )}
                    </button>
                    {saveState === 'saved' && (
                      <p className="text-xs text-[#075056] dark:text-[#5eead4] flex items-center gap-1.5">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Project saved
                      </p>
                    )}
                    {saveState === 'failed' && saveError && (
                      <p className="text-xs text-red-500 dark:text-red-400 max-w-md text-center">
                        Save failed: {saveError}. Click Retry to try again.
                      </p>
                    )}
                    <p className="text-xs text-slate-400 dark:text-[#fbfbfb]">
                      You can add more pages & target more keywords inside the Projects window
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}

        </div>
      </div>

      {/* Template preview modal */}
      {previewingTemplate && (
        <div
          className="fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setPreviewingTemplate(null)}
        >
          <div
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl w-full max-w-6xl flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-[#e5e5e5] dark:border-[#333333]"
            style={{ height: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-7 py-5 border-b border-[#ebebeb] dark:border-[#2c2c2c] flex items-center justify-between gap-6">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#555555] dark:text-[#999999] bg-[#f5f5f5] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-full">
                    <span className={`w-1.5 h-1.5 rounded-full ${previewingTemplate._isStarter ? 'bg-[#5eead4]' : 'bg-[#075056]'}`} />
                    {previewingTemplate._isStarter ? 'Starter' : previewingTemplate._isUserTemplate ? 'Custom' : 'Template'}
                  </span>
                  {previewingTemplate.category && (
                    <span className="inline-flex items-center px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#555555] dark:text-[#999999] bg-[#f5f5f5] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-full">
                      {previewingTemplate.category}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-[#262626] dark:text-white tracking-tight truncate">{previewingTemplate.name}</h3>
                {IDEAL_FOR[previewingTemplate.id] && (
                  <p className="text-sm text-[#777777] dark:text-[#888888] mt-1 truncate">
                    <span className="text-[#555555] dark:text-[#aaaaaa] font-semibold">Ideal for</span> {IDEAL_FOR[previewingTemplate.id]}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => { setSelectedTemplate(previewingTemplate); setPreviewingTemplate(null); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#075056] text-white text-sm font-bold rounded-xl hover:bg-[#064548] hover:shadow-lg hover:shadow-[#075056]/30 transition-all"
                >
                  Use this template
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </button>
                <button
                  onClick={() => setPreviewingTemplate(null)}
                  className="w-10 h-10 rounded-xl hover:bg-[#f5f5f5] dark:hover:bg-[#303030] flex items-center justify-center transition-colors text-[#777777] dark:text-[#888888] hover:text-[#262626] dark:hover:text-white"
                  title="Close (Esc)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 bg-[#f5f5f5] dark:bg-[#0a0a0a] p-4 overflow-hidden" style={{ contain: 'layout paint' }}>
              <div className="w-full h-full rounded-xl overflow-hidden border border-[#e5e5e5] dark:border-[#333333] bg-white">
                {previewingTemplate.structure ? (
                  <iframe
                    srcDoc={`<script>(function(){var s=function(e){var t=e.target.closest&&e.target.closest('a,button,[role="button"],form,input,textarea,select');if(t){e.preventDefault();e.stopPropagation();}};document.addEventListener('click',s,true);document.addEventListener('submit',s,true);document.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.closest('a,button')){e.preventDefault();}},true);})();</script>` + previewingTemplate.structure
                      .replace(/\{\{KEYWORD\}\}/g, keyword || 'Your Business')
                      .replace(/\{\{LOCATION\}\}/g, location || 'Your City')
                      .replace(/\{\{SERVICE\}\}/g, businessType || 'Your Service')
                      .replace(/\{\{[A-Z0-9_]+\}\}/g, 'Sample content')}
                    sandbox="allow-scripts"
                    className="w-full h-full border-0 block"
                    title={`Preview: ${previewingTemplate.name}`}
                    style={{ transform: 'translateZ(0)', willChange: 'transform', contain: 'strict' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-[#aaaaaa]">No preview available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
