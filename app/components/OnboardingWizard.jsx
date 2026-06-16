"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Lottie from "lottie-react";
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "../../lib/supabaseClient";
import STARTER_TEMPLATES from "../data/starterTemplates";
import Loader from "./Loader";
import { IDEAL_FOR, styleForTemplate } from "../../lib/templateMeta";
import { fetchBrandKits } from "../../lib/brandKits";
import { brandKitLimit, planAllows, planIdOf } from "../../lib/plans";
import { MODIFIERS, phraseFor } from "../../lib/modifiers";
import { apiFetch } from "../../lib/apiFetch";
import { previewHtml as renderPreviewHtml, withPreviewSafety } from "../../lib/templatePreview";
import HelpIcon from "./HelpIcon";

const WIZARD_DRAFT_KEY = 'gg-wizard-draft';

const SEO_TIPS = [
  'Pages with the location in the H1 rank up to 2× higher for local searches.',
  'Each page should have a unique meta description — Google rewards uniqueness.',
  'Internal links between your generated pages help every page rank faster.',
  'Pages with an FAQ section appear in 35% more search-result features.',
  'Long-tail keywords convert 2.5× better than broad head terms.',
  'Schema markup helps Google understand and feature your content.',
  'Bounce rates double if your page takes more than 3 seconds to load.',
  'Adding reviews and ratings to a page lifts local rankings noticeably.',
  'Refreshing an old page can lift its rankings within days, not months.',
  'Mobile-first design isn\'t optional — Google indexes mobile versions first.',
  'Original copy beats spun rewrites every time. Quality is the multiplier.',
  'Specific landing pages outrank generic homepages for buyer-intent keywords.',
  'Headlines under 60 characters perform best in search snippets.',
  'A clear CTA above the fold improves conversion rates by ~30%.',
  'Photos of real locations or team members build trust and dwell time.',
];

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

export default function OnboardingWizard({ session, profile, onComplete, onMinimize, initialTemplate = null }) {
  const [currentStep, setCurrentStep] = useState(1);
  const TOTAL_STEPS = 5;
  // Free tier (brand-kit limit 0) can't create or use brand kits.
  // planIdOf() promotes admins to 'agency' so they bypass the gate.
  const _planId = planIdOf(profile);
  const brandKitsAllowed = brandKitLimit(_planId) > 0;
  const customTemplatesAllowed = planAllows(_planId, 'customTemplates');

  // Step 1 — content type + core info
  const [contentType, setContentType]                 = useState("page"); // 'page' | 'blog'
  const [businessType, setBusinessType]               = useState("");
  const [keyword, setKeyword]                         = useState("");
  const [location, setLocation]                       = useState("");                  // the modifier VALUE (kept as `location` for downstream compat)
  const [modifierType, setModifierType]               = useState("location");          // location | comparison | integration | audience | usecase | none

  // Rotating placeholder shows the variety of businesses GroGoliath can serve.
  // Pauses once the user types something so it doesn't distract.
  const keywordPlaceholder = useRotatingPlaceholder(KEYWORD_EXAMPLES, { active: !keyword });

  // Step 2 — landing-page brief
  const [businessDescription, setBusinessDescription] = useState("");
  const [services, setServices]                       = useState("");
  const [usps, setUsps]                               = useState("");
  const [targetCustomer, setTargetCustomer]           = useState("");
  const [phone, setPhone]                             = useState("");
  const [yearsInBusiness, setYearsInBusiness]         = useState("");

  // Step 2 — blog-post brief (rich version)
  const [blogTitle, setBlogTitle]               = useState("");   // optional verbatim title (locks AI's headline)
  const [blogAngle, setBlogAngle]               = useState("");   // what point the article is making
  const [blogType, setBlogType]                 = useState("");   // how-to | listicle | comparison | guide | opinion
  const [blogReader, setBlogReader]             = useState("");   // who the article is for
  const [blogKeyPoints, setBlogKeyPoints]       = useState("");   // optional outline / sub-topics
  const [blogGoal, setBlogGoal]                 = useState("");   // rank | leads | signups | authority
  const [blogReferences, setBlogReferences]     = useState("");   // optional citations / sources

  // Step 3 — template
  const [templates, setTemplates]               = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);
  // Per-category "show all" toggles for the step-3 template picker.
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // If the user flips between page/blog at Step 1, clear any incompatible
  // template selection so they don't carry a landing-page template into a
  // blog flow (or vice versa).
  useEffect(() => {
    if (!selectedTemplate) return;
    if (selectedTemplate._isUserTemplate) return; // user templates always allowed
    const isBlogTpl = selectedTemplate.category === 'Blog';
    const compatible = contentType === 'blog' ? isBlogTpl : !isBlogTpl;
    if (!compatible) setSelectedTemplate(null);
  }, [contentType, selectedTemplate]);

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
  const [templatePreviewDevice, setTemplatePreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'
  useEffect(() => {
    if (!previewingTemplate) {
      setTemplatePreviewDevice('desktop'); // reset for next open
      return;
    }
    const onKey = (e) => { if (e.key === 'Escape') setPreviewingTemplate(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previewingTemplate]);

  // Step 4 — content settings
  const [tone, setTone]     = useState("Professional");
  const [length, setLength] = useState("Medium");

  // Step 4 — preview generation
  const [isGenerating, setIsGenerating]     = useState(false);
  // Rotate SEO tips while a page is generating — pure delight + education.
  useEffect(() => {
    if (!isGenerating) return;
    const id = setInterval(() => {
      setTipIndex(i => (i + 1) % SEO_TIPS.length);
    }, 5500);
    return () => clearInterval(id);
  }, [isGenerating]);
  const [previewHtml, setPreviewHtml]       = useState("");
  const [generationError, setGenerationError] = useState("");
  // Persisted across minimize/resume so a generation that was kicked off but
  // interrupted (tab close, session expiry) is NOT silently restarted on
  // resume — we show a retry prompt instead of burning tokens again.
  const [genKickedOff, setGenKickedOff] = useState(false);
  const [createdProject, setCreatedProject] = useState(null);
  const [saveState, setSaveState] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'failed'
  const [saveError, setSaveError] = useState(null);
  const [closePromptOpen, setClosePromptOpen] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [generatedPage, setGeneratedPage]   = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * SEO_TIPS.length));
  const [refineInstruction, setRefineInstruction] = useState("");
  const [isRefining, setIsRefining]         = useState(false);
  const [refineError, setRefineError]       = useState("");
  const [previewDevice, setPreviewDevice]   = useState("desktop");

  const generationStarted = useRef(false);
  const timerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const rightPaneRef = useRef(null);

  // Wrap the generated HTML with a click-blocker script so link/form clicks
  // inside the preview iframe can't navigate away. `tel:` is allowed.
  const safePreviewHtml = useMemo(() => withPreviewSafety(previewHtml), [previewHtml]);

  // Scroll the right pane to the top whenever the user moves between steps,
  // so they don't land mid-page (especially common going 2 → 3 where step 2
  // is tall and step 3 starts shorter).
  useEffect(() => {
    if (rightPaneRef.current) {
      rightPaneRef.current.scrollTop = 0;
    }
  }, [currentStep]);

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
        if (typeof d.modifierType === 'string' && MODIFIERS[d.modifierType]) setModifierType(d.modifierType);
        if (typeof d.businessDescription === 'string') setBusinessDescription(d.businessDescription);
        if (typeof d.services === 'string') setServices(d.services);
        if (typeof d.usps === 'string') setUsps(d.usps);
        if (typeof d.targetCustomer === 'string') setTargetCustomer(d.targetCustomer);
        if (typeof d.phone === 'string') setPhone(d.phone);
        if (typeof d.yearsInBusiness === 'string') setYearsInBusiness(d.yearsInBusiness);
        if (typeof d.blogTitle === 'string') setBlogTitle(d.blogTitle);
        if (typeof d.blogAngle === 'string') setBlogAngle(d.blogAngle);
        if (typeof d.blogType === 'string') setBlogType(d.blogType);
        if (typeof d.blogReader === 'string') setBlogReader(d.blogReader);
        if (typeof d.blogKeyPoints === 'string') setBlogKeyPoints(d.blogKeyPoints);
        if (typeof d.blogGoal === 'string') setBlogGoal(d.blogGoal);
        if (typeof d.blogReferences === 'string') setBlogReferences(d.blogReferences);
        if (typeof d.tone === 'string') setTone(d.tone);
        if (typeof d.length === 'string') setLength(d.length);
        if (typeof d.selectedKitId === 'string') setSelectedKitId(d.selectedKitId);
        if (d.selectedTemplate) setSelectedTemplate(d.selectedTemplate);
        if (typeof d.previewHtml === 'string') setPreviewHtml(d.previewHtml);
        if (d.generatedPage) setGeneratedPage(d.generatedPage);
        if (d.createdProject) setCreatedProject(d.createdProject);
        if (typeof d.genKickedOff === 'boolean') setGenKickedOff(d.genKickedOff);

        // Interrupted mid-generation (minimized / tab closed / session expired
        // before the preview came back). Don't auto-restart — show a retry so
        // the user decides, rather than silently regenerating from scratch.
        if (d.genKickedOff && !d.previewHtml && d.currentStep === 5) {
          generationStarted.current = true; // block the auto-fire effect
          setGenerationError('Your preview didn’t finish generating last time. Tap "Try again" to rebuild it.');
        }
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
        businessType, keyword, location, modifierType,
        businessDescription, services, usps, targetCustomer, phone, yearsInBusiness,
        blogTitle, blogAngle, blogType, blogReader, blogKeyPoints, blogGoal, blogReferences,
        tone, length, selectedKitId,
        selectedTemplate, previewHtml, generatedPage, createdProject, genKickedOff,
      }));
    } catch { /* storage full or blocked — silently skip */ }
  }, [
    draftRestored, currentStep, contentType,
    businessType, keyword, location,
    businessDescription, services, usps, targetCustomer, phone, yearsInBusiness,
    blogTitle, blogAngle, blogType, blogReader, blogKeyPoints, blogGoal, blogReferences,
    tone, length, selectedKitId,
    selectedTemplate, previewHtml, generatedPage, createdProject, genKickedOff,
  ]);

  const clearWizardDraft = () => { try { localStorage.removeItem(WIZARD_DRAFT_KEY); } catch { /* ignore */ } };

  useEffect(() => { fetchTemplates(); }, []);

  useEffect(() => {
    if (currentStep !== 5) return;
    if (generationStarted.current) return;
    if (!draftRestored) return; // wait for the draft restore to settle first

    // If we've been restored onto step 5 but have no preview AND no required
    // inputs, the draft is stale or corrupted. Drop back to step 1 instead of
    // firing a generation with empty values.
    const hasInputs =
      businessType.trim().length > 0 &&
      keyword.trim().length > 0 &&
      (contentType === 'blog' || modifierType === 'none' || location.trim().length > 0);
    if (!previewHtml && !hasInputs) {
      generationStarted.current = false;
      setCurrentStep(1);
      return;
    }
    // If there's already a generated preview from a restore, don't regenerate.
    if (previewHtml) {
      generationStarted.current = true;
      return;
    }

    // A generation was already kicked off in a prior session but never produced
    // a preview (interrupted by minimize / tab close / session expiry). Don't
    // silently restart and burn tokens — the restore effect has surfaced a
    // retry prompt; just bail.
    if (genKickedOff) {
      generationStarted.current = true;
      return;
    }

    generationStarted.current = true;
    setGenKickedOff(true);
    handleGeneratePreview();
  }, [currentStep, draftRestored, previewHtml, genKickedOff, businessType, keyword, location, modifierType, contentType]);

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
              // modifier_type is locked at project creation — every page added
              // later inherits this angle (so the project stays SEO-coherent).
              settings: { tone, length, templateId: selectedTemplate?.id, services, usps, targetCustomer, phone, yearsInBusiness, modifier_type: modifierType },
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
          keyword: phraseFor(modifierType, keyword, location),
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
      // Generate first — never block on Supabase. Blogs need much more time
      // than landing pages (3-5× the content + bigger brief).
      console.log(`[gen] starting ${contentType} generation`);
      // Proactively refresh the JWT before kicking off a long Claude call.
      // CRITICAL: this must time out — `supabase.auth.refreshSession()` has been
      // observed to hang indefinitely on an idle tab, which would leave the
      // wizard stuck on "Building your preview" with no fetch ever fired.
      const refreshStart = Date.now();
      try {
        await Promise.race([
          supabase.auth.refreshSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('refresh-timeout-3s')), 3000)),
        ]);
        console.log(`[gen] proactive refresh ok in ${Date.now() - refreshStart}ms`);
      } catch (e) {
        console.warn(`[gen] proactive refresh failed in ${Date.now() - refreshStart}ms — ${e?.message}. Continuing; apiFetch will handle 401 retries.`);
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;
      // Generous timeouts: landing pages typically finish in 30-60s but can
      // take 90s on a slow day, and apiFetch may add up to ~6s for refresh +
      // retry. 180s gives comfortable headroom without making impatient users
      // wait forever for a hung backend.
      const timeoutMs = contentType === 'blog' ? 220000 : 180000;
      console.log(`[gen] calling /api/generate-page (timeout ${timeoutMs / 1000}s)…`);
      const apiFetchStart = Date.now();
      const fetchTimeout = setTimeout(() => {
        console.warn(`[gen] aborting after ${timeoutMs / 1000}s — Claude is taking too long`);
        controller.abort();
      }, timeoutMs);

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
            modifierType,
            service:             businessType,
            businessDescription: businessDescription.trim(),
            services:            services.trim(),
            usps:                usps.trim(),
            targetCustomer:      targetCustomer.trim(),
            phone:               phone.trim(),
            yearsInBusiness:     yearsInBusiness.trim(),
            // Blog-specific brief (sent when contentType === 'blog')
            blogBrief: contentType === 'blog' ? {
              title:      blogTitle.trim(),
              angle:      blogAngle.trim(),
              type:       blogType,
              reader:     blogReader.trim(),
              keyPoints:  blogKeyPoints.trim(),
              goal:       blogGoal,
              references: blogReferences.trim(),
            } : null,
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
        if (fetchErr.name === "AbortError") {
          const seconds = Math.floor(timeoutMs / 1000);
          throw new Error(
            contentType === 'blog'
              ? `The article is taking longer than ${seconds} seconds. Try again, or try a shorter length on the next attempt.`
              : `Generation timed out after ${seconds}s. Please try again.`
          );
        }
        throw fetchErr;
      } finally {
        clearTimeout(fetchTimeout);
      }

      console.log(`[gen] response received: status ${response.status} in ${Date.now() - apiFetchStart}ms`);
      const result = await response.json();
      if (!response.ok) {
        console.error('[gen] server returned error:', result);
        // Prefer the server's friendly `message` (e.g. out-of-credits) over the code.
        throw new Error(result.message || result.error || `Server returned ${response.status}`);
      }
      console.log(`[gen] success — ${result.html?.length || 0} chars of HTML`);

      // Show preview immediately
      setPreviewHtml(result.html);
      setGeneratedPage(result);

      // Save to Supabase in background — never blocks the user
      saveProjectInBackground(result.html);

    } catch (err) {
      setGenerationError(err.message || "Something went wrong");
    } finally {
      clearInterval(timerRef.current);
      abortControllerRef.current = null;
      setIsGenerating(false);
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      try { abortControllerRef.current.abort(); } catch {}
    }
    clearInterval(timerRef.current);
    setIsGenerating(false);
    setGenerationError('');
    // Reset so returning to step 5 fires a fresh generation rather than
    // showing the "didn't finish" retry prompt.
    generationStarted.current = false;
    setGenKickedOff(false);
    setCurrentStep(4);
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

  // BackButton — going backward signals an intent to edit. Clear any stale
  // preview + reset the generation flags so when the user returns to step 5
  // it fires a fresh generation with the new inputs. Without this, the
  // auto-fire effect short-circuits on `generationStarted.current === true`
  // (left over from the previous run) and the user sees stale output (or, if
  // an in-flight generation was aborted, a hung "Building your preview" UI).
  const BackButton = ({ to }) => (
    <button
      onClick={() => {
        setPreviewHtml('');
        setGeneratedPage(null);
        setGenerationError('');
        generationStarted.current = false;
        setGenKickedOff(false);
        // Also abort any in-flight generation so leaving step 5 doesn't keep
        // burning the timer in the background.
        if (abortControllerRef.current) {
          try { abortControllerRef.current.abort(); } catch {}
          abortControllerRef.current = null;
        }
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        setIsGenerating(false);
        setCurrentStep(to);
      }}
      className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 flex items-center gap-2 transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
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

      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className={`relative bg-white dark:bg-[#111111] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-[#e5e5e5] dark:border-[#262626] w-full ${currentStep === 5 ? 'max-w-6xl' : 'max-w-5xl'} overflow-hidden h-[88vh] max-h-[860px]`}>

          {/* Close button — anchored to the card, not the viewport. */}
          <button
            onClick={() => setClosePromptOpen(true)}
            disabled={isGenerating}
            className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/90 dark:bg-[#262626]/90 backdrop-blur hover:bg-slate-200 dark:hover:bg-[#333333] text-slate-500 dark:text-[#fbfbfb] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className={`h-full ${currentStep < 5 ? 'lg:grid lg:grid-cols-2' : ''}`}>

        {/* Left pane — hero animation. Stays a fixed size; only the right pane
            scrolls. Hidden on step 5 (focused preview/generation layout). */}
        {currentStep < 5 && (
          <aside className="hidden lg:flex items-center justify-center overflow-hidden h-full border-r border-[#e5e5e5] dark:border-[#262626] bg-gradient-to-br from-[#075056]/5 via-white to-[#5eead4]/5 dark:from-[#075056]/15 dark:via-[#111111] dark:to-[#5eead4]/10 p-6">
            <OnboardingLottie step={currentStep} />
          </aside>
        )}

        {/* Right pane — the wizard content. Scrolls independently of the left. */}
        <div ref={rightPaneRef} className="h-full overflow-y-auto overscroll-contain flex items-start justify-center p-8 lg:p-10">
        <div className={
          currentStep === 5 ? 'max-w-3xl w-full my-auto'
          : currentStep === 3 ? 'max-w-2xl w-full my-auto'
          : 'max-w-lg w-full my-auto'
        }>

          {/* Progress bar */}
          <div className="mb-10">
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
            <StepProgress
              percent={(() => {
                const total = initialTemplate ? TOTAL_STEPS - 1 : TOTAL_STEPS;
                const display = initialTemplate
                  ? (currentStep <= 2 ? currentStep : currentStep - 1)
                  : currentStep;
                return (Math.min(display, total) / total) * 100;
              })()}
            />
          </div>

          {/* Persistent notice across all steps — clarifies that the wizard
              builds ONE sample page; the bulk batch happens later from the
              project detail screen. Keeps the user from expecting hundreds of
              pages to materialize at the end of this flow. */}
          <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-200/70 dark:border-amber-500/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            <div className="flex-1">
              <p className="text-[13.5px] font-semibold text-amber-900 dark:text-amber-200">This wizard builds just your first page.</p>
              <p className="text-[12.5px] text-amber-800/80 dark:text-amber-200/70 mt-0.5 leading-relaxed">
                You&rsquo;ll review it, tweak settings, and pick a theme. The rest of your pages get generated in batch from the project screen — same theme, same settings, just different keywords/{contentType === 'blog' ? 'topics' : 'modifiers'}.
              </p>
            </div>
          </div>

          {/* ── Step 1: Core Info ── */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-fade-in">
              {/* Hero card — sets the stage, pops off the page background */}
              <div className="rounded-2xl border border-[#075056]/15 dark:border-[#5eead4]/15 bg-[#075056]/[0.04] dark:bg-[#075056]/10 px-5 py-4">
                <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-1 leading-tight tracking-tight">
                  Let&rsquo;s build your {contentType === 'blog' ? 'first blog post' : 'first page'}
                </h1>
                <p className="text-[13px] text-slate-600 dark:text-[#bbbbbb] leading-relaxed">
                  {contentType === 'blog'
                    ? 'Tell us about the topic and we’ll draft a long-form blog post for you.'
                    : 'Tell us about your business and we’ll generate a full landing page preview.'}
                </p>
              </div>

              {/* Content type picker — neobrutalist slider toggle, centered */}
              <div className="text-center">
                <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-[#888888] mb-3">
                  What are you building?
                </label>
                <style>{`
                  .gg-switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 20px;
                    flex-shrink: 0;
                  }
                  .gg-toggle { position: absolute; opacity: 0; width: 0; height: 0; }
                  .gg-slider {
                    box-sizing: border-box;
                    border-radius: 5px;
                    border: 2px solid #262626;
                    box-shadow: 4px 4px 0 #262626;
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-color: #fff;
                    transition: background-color 0.25s ease;
                  }
                  .dark .gg-slider {
                    border-color: #e5e5e5;
                    box-shadow: 4px 4px 0 #e5e5e5;
                    background-color: #1a1a1a;
                  }
                  .gg-slider::before {
                    box-sizing: border-box;
                    position: absolute;
                    content: "";
                    height: 20px;
                    width: 20px;
                    border: 2px solid #262626;
                    border-radius: 5px;
                    left: -2px;
                    bottom: 2px;
                    background-color: #fff;
                    box-shadow: 0 3px 0 #262626;
                    transition: transform 0.25s ease;
                  }
                  .dark .gg-slider::before {
                    border-color: #e5e5e5;
                    box-shadow: 0 3px 0 #e5e5e5;
                  }
                  .gg-toggle:checked + .gg-slider { background-color: #075056; }
                  .gg-toggle:checked + .gg-slider::before { transform: translateX(30px); }
                `}</style>
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setContentType('page')}
                    className={`text-sm font-semibold transition-colors ${
                      contentType === 'page' ? 'text-[#262626] dark:text-white' : 'text-slate-400 dark:text-[#666666] hover:text-slate-600 dark:hover:text-[#aaa]'
                    }`}
                  >
                    Landing
                  </button>
                  <label className="gg-switch" aria-label="Content type">
                    <input
                      className="gg-toggle"
                      type="checkbox"
                      checked={contentType === 'blog'}
                      onChange={() => setContentType(contentType === 'blog' ? 'page' : 'blog')}
                    />
                    <span className="gg-slider" />
                  </label>
                  <button
                    type="button"
                    onClick={() => setContentType('blog')}
                    className={`text-sm font-semibold transition-colors ${
                      contentType === 'blog' ? 'text-[#262626] dark:text-white' : 'text-slate-400 dark:text-[#666666] hover:text-slate-600 dark:hover:text-[#aaa]'
                    }`}
                  >
                    Blog
                  </button>
                </div>
                <p className="text-[12.5px] text-slate-500 dark:text-[#888888] mt-4">
                  {contentType === 'page' ? 'Landing page — for a business or service.' : 'Blog post — article, how-to, or guide.'}
                </p>
              </div>

              {/* Brand kit — informational nudge (no CTA; just tells you how) */}
              {brandKits.length === 0 && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-slate-300 dark:border-[#3a3a3a] bg-slate-50/50 dark:bg-[#1c1c1c]/50">
                  <div className="w-9 h-9 rounded-lg bg-[#075056]/10 dark:bg-[#075056]/20 text-[#075056] dark:text-[#5eead4] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.6 1.5-1.5 0-.4-.2-.8-.5-1.1-.3-.3-.5-.7-.5-1.1 0-.9.7-1.6 1.5-1.6h1.6c2.7 0 4.9-2.2 4.9-4.9C20.5 6 16.7 2 12 2z"/></svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">No brand kit yet</div>
                    <div className="text-[11.5px] text-slate-500 dark:text-[#aaaaaa] leading-snug mt-0.5">
                      Head to the{' '}<span className="font-semibold text-slate-700 dark:text-[#dddddd]">Brand Kit</span>{' '}tab in the sidebar to save your colors, logo, and voice once — they&rsquo;ll auto-fill here next time.
                    </div>
                  </div>
                </div>
              )}

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

              <div className="space-y-7">
                <FormField
                  label={contentType === 'blog' ? 'Publication or brand name' : 'Business name'}
                  hint={contentType === 'blog'
                    ? "What's the name of the site or brand this article is for? Used in bylines and the page title."
                    : "Used in headlines, the page title, and any CTAs."}
                >
                  <input
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder={contentType === 'blog' ? 'e.g., GroGoliath, Northwind Studios' : 'e.g., Acme Plumbing, Green Landscaping Co.'}
                    autoFocus
                    className={fieldInputCls}
                  />
                </FormField>

                {contentType === 'blog' ? (
                  <FormField
                    label="Article topic / target keyword"
                    hint="The phrase you want this article to rank for. Be specific — long-tail keywords convert better."
                  >
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="e.g., how to choose a bookkeeping software for small businesses"
                      className={fieldInputCls}
                    />
                  </FormField>
                ) : (
                  <>
                    <FormField
                      label="Primary keyword or service"
                      hint="The core thing this page is about. Don't include the modifier here — pick its angle below."
                    >
                      <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder={keywordPlaceholder ? `e.g., ${keywordPlaceholder}` : 'e.g., plumbing, chat line, Notion'}
                        className={fieldInputCls}
                      />
                    </FormField>

                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        label="Page angle"
                        hint="What kind of programmatic page is this? Pages are templated and bulk-generated by this axis."
                      >
                        <select
                          value={modifierType}
                          onChange={(e) => setModifierType(e.target.value)}
                          className={fieldInputCls}
                        >
                          {Object.entries(MODIFIERS).map(([key, m]) => (
                            <option key={key} value={key}>{m.dropdownLabel}</option>
                          ))}
                        </select>
                      </FormField>

                      {modifierType !== 'none' ? (
                        <FormField
                          label={MODIFIERS[modifierType].valueLabel}
                          hint={MODIFIERS[modifierType].hint}
                        >
                          <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder={MODIFIERS[modifierType].placeholder}
                            className={fieldInputCls}
                          />
                        </FormField>
                      ) : (
                        <div className="flex items-end">
                          <p className="text-[12px] text-slate-500 dark:text-[#888888] leading-relaxed pb-2">
                            We&rsquo;ll generate a single page focused only on your keyword — no extra axis.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={
                    !businessType.trim() ||
                    !keyword.trim() ||
                    (contentType === 'page' && modifierType !== 'none' && !location.trim())
                  }
                  className="px-8 py-4 bg-[#075056] text-white text-lg font-bold rounded-xl hover:bg-[#064548] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Brief (page or blog) ── */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <BackButton to={1} />
                <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-3 leading-tight tracking-tight">
                  {contentType === 'blog' ? 'Brief the article' : 'Tell us more'}
                </h1>
                <p className="text-sm text-slate-500 dark:text-[#fbfbfb]">
                  {contentType === 'blog'
                    ? 'The more specific your brief, the better the draft. Every field below shapes what gets written.'
                    : 'The more context you give, the more accurate and specific your pages will be.'}
                </p>
              </div>

              {/* PAGE-SPECIFIC FIELDS */}
              {contentType === 'page' && (
                <div className="space-y-6">
                  <FormField
                    label="What do you do?"
                    hint="The more detail you give, the more refined and specific your generated pages will be. A few well-chosen sentences here saves you a lot of editing later — describe what you sell, who it's for, and any context the AI couldn't guess from your keyword alone."
                  >
                    <textarea
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      placeholder="e.g., We're a family-run plumbing company specialising in emergency repairs, drain unblocking, and boiler servicing. Known for fast response times and upfront pricing."
                      rows={3}
                      className={`${fieldInputCls} resize-none`}
                    />
                  </FormField>

                  <FormField
                    label="Services you offer"
                    hint="Comma-separated list. These power the services section and internal CTAs."
                  >
                    <input
                      type="text"
                      value={services}
                      onChange={(e) => setServices(e.target.value)}
                      placeholder="e.g., Drain cleaning, Emergency repairs, Boiler installation, Leak detection"
                      className={fieldInputCls}
                    />
                  </FormField>

                  <FormField
                    label="What makes you different?"
                    hint="Your USPs — what would make a customer pick you over the next ten Google results."
                  >
                    <input
                      type="text"
                      value={usps}
                      onChange={(e) => setUsps(e.target.value)}
                      placeholder="e.g., 24/7 availability, no call-out fee, 10-year guarantee, family-run since 1998"
                      className={fieldInputCls}
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      label="Who is your ideal customer?"
                      hint="Used to tailor language, examples, and pain points."
                    >
                      <input
                        type="text"
                        value={targetCustomer}
                        onChange={(e) => setTargetCustomer(e.target.value)}
                        placeholder="e.g., homeowners, landlords, small businesses"
                        className={fieldInputCls}
                      />
                    </FormField>
                    <FormField
                      label="Years in business"
                      optional
                      hint="Adds a trust signal in headings and the footer."
                    >
                      <input
                        type="text"
                        value={yearsInBusiness}
                        onChange={(e) => setYearsInBusiness(e.target.value)}
                        placeholder="e.g., 12"
                        className={fieldInputCls}
                      />
                    </FormField>
                  </div>

                  <FormField
                    label="Where do you want people to go?"
                    optional
                    hint="Whatever you want CTAs and the footer to point at — a phone number, a download link, a booking page, an App Store URL, an email. Anything you'd put behind a 'Get in touch' button works."
                  >
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g., (312) 555-0192, https://apps.apple.com/…, hello@yourdomain.com"
                      className={fieldInputCls}
                    />
                  </FormField>
                </div>
              )}

              {/* BLOG-SPECIFIC FIELDS */}
              {contentType === 'blog' && (
                <div className="space-y-6">
                  <FormField
                    label="Title"
                    optional
                    hint="Leave blank to have AI suggest one. Fill it in and the AI will use your title VERBATIM, no edits."
                  >
                    <input
                      type="text"
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      placeholder='e.g., "5 Best Video Calling Apps for Remote Teams"'
                      className={fieldInputCls}
                    />
                  </FormField>

                  <FormField
                    label="What's the angle?"
                    hint="What's the one point this article is making? Specific angles outrank generic listicles."
                  >
                    <textarea
                      value={blogAngle}
                      onChange={(e) => setBlogAngle(e.target.value)}
                      placeholder="e.g., Why bookkeeping software built for freelancers beats general accounting tools."
                      rows={3}
                      className={`${fieldInputCls} resize-none`}
                    />
                  </FormField>

                  <FormField
                    label="Article type"
                    hint="Picks the structure. How-tos and listicles tend to rank fastest for informational queries."
                  >
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'how-to', label: 'How-to' },
                        { id: 'listicle', label: 'Listicle' },
                        { id: 'comparison', label: 'Comparison' },
                        { id: 'guide', label: 'Deep guide' },
                        { id: 'opinion', label: 'Opinion' },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setBlogType(opt.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors whitespace-nowrap ${
                            blogType === opt.id
                              ? 'border-[#075056] bg-[#075056]/[0.06] dark:bg-[#075056]/15 text-[#075056] dark:text-[#5eead4] ring-1 ring-[#075056]/30'
                              : 'border-slate-200 dark:border-[#2a2a2a] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-[#404040] hover:bg-slate-50/60 dark:hover:bg-[#1a1a1a]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  <FormField
                    label="Who is this article for?"
                    hint="The reader you're picturing. Used to set vocabulary, examples, and assumed knowledge."
                  >
                    <input
                      type="text"
                      value={blogReader}
                      onChange={(e) => setBlogReader(e.target.value)}
                      placeholder="e.g., First-time freelancers shopping for accounting software."
                      className={fieldInputCls}
                    />
                  </FormField>

                  <FormField
                    label="Key points to cover"
                    optional
                    hint="One per line. Acts as a soft outline — AI will weave these into the article."
                  >
                    <textarea
                      value={blogKeyPoints}
                      onChange={(e) => setBlogKeyPoints(e.target.value)}
                      placeholder={"e.g.\nWhy generic accounting tools fall short for freelancers\nFeatures that actually matter (invoicing, tax estimates)\nTop 3 picks compared on pricing and ease of use\nHow to migrate from spreadsheets"}
                      rows={5}
                      className={`${fieldInputCls} resize-none font-mono text-[13px] leading-relaxed`}
                    />
                  </FormField>

                  <FormField
                    label="What should this article accomplish?"
                    hint="The article's job. Shapes the CTA and the closing pitch."
                  >
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'rank', label: 'Rank for the keyword' },
                        { id: 'leads', label: 'Capture leads' },
                        { id: 'signups', label: 'Newsletter signups' },
                        { id: 'authority', label: 'Build authority' },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setBlogGoal(opt.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors whitespace-nowrap ${
                            blogGoal === opt.id
                              ? 'border-[#075056] bg-[#075056]/[0.06] dark:bg-[#075056]/15 text-[#075056] dark:text-[#5eead4] ring-1 ring-[#075056]/30'
                              : 'border-slate-200 dark:border-[#2a2a2a] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-[#404040] hover:bg-slate-50/60 dark:hover:bg-[#1a1a1a]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  <FormField
                    label="References, sources, or links to cite"
                    optional
                    hint="URLs or short notes — one per line. AI will weave citations into the article."
                  >
                    <textarea
                      value={blogReferences}
                      onChange={(e) => setBlogReferences(e.target.value)}
                      placeholder={"e.g.\nhttps://example.com/study-link\nInternal stat: 73% of freelancers don't use accounting software (our 2026 survey)"}
                      rows={3}
                      className={`${fieldInputCls} resize-none`}
                    />
                  </FormField>
                </div>
              )}

              <div className="flex justify-between">
                <button onClick={() => setCurrentStep(1)} className="px-6 py-3 text-slate-500 dark:text-[#fbfbfb] font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-[#333333] transition-colors">
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep(initialTemplate ? 4 : 3)}
                  disabled={
                    contentType === 'blog' && (!blogAngle.trim() || !blogType || !blogReader.trim() || !blogGoal)
                  }
                  className="px-8 py-4 bg-[#075056] text-white text-lg font-bold rounded-xl hover:bg-[#064548] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {initialTemplate ? 'Content settings' : 'Pick a template'}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Template Selection ── */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <BackButton to={2} />
                <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-3 leading-tight tracking-tight">
                  Pick your template
                </h1>
                <p className="text-sm text-slate-500 dark:text-[#fbfbfb]">
                  Choose a design for your preview page
                </p>
              </div>

              {/* Create your own banner */}
              <button
                onClick={() => window.open(customTemplatesAllowed ? "/?tab=templates&action=create" : "/?tab=settings&section=plans", "_blank")}
                className="group w-full text-left flex items-center gap-5 p-5 sm:p-6 bg-gradient-to-br from-white to-[#fafafa] dark:from-[#1a1a1a] dark:to-[#111111] border border-dashed border-[#b8b8b8] dark:border-[#525252] rounded-2xl hover:border-solid hover:border-[#075056] dark:hover:border-[#075056] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#075056]/10 dark:bg-[#075056]/20 flex items-center justify-center text-[#075056] dark:text-[#5eead4] group-hover:bg-[#075056] group-hover:text-white dark:group-hover:bg-[#075056] dark:group-hover:text-white group-hover:rotate-90 transition-all duration-500 shrink-0">
                  {customTemplatesAllowed ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-1">
                    {customTemplatesAllowed ? 'Create your own template' : 'Custom templates are a paid feature'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-[#fbfbfb]">
                    {customTemplatesAllowed
                      ? 'Open the visual builder in a new tab and design from scratch.'
                      : 'Upgrade to build your own. Free includes the starter templates above.'}
                  </p>
                </div>
              </button>

              {isLoadingTemplates && (
                <div className="flex justify-center py-12">
                  <Loader inline />
                </div>
              )}

              {!isLoadingTemplates && templates.length > 0 && (() => {
                // A template is "compatible" with the current content type. User
                // customs are always shown — they built them for their own use.
                const isCompatible = (t) => {
                  if (t._isUserTemplate) return true;
                  const isBlogTpl = t.category === 'Blog';
                  return contentType === 'blog' ? isBlogTpl : !isBlogTpl;
                };

                // Customs always shown. Starters are filtered to ONLY compatible ones.
                const customs = templates.filter(t => t._isUserTemplate);
                const starters = templates.filter(t => !t._isUserTemplate && isCompatible(t));

                // Blog flow → Blog group always first. Page flow → standard order.
                const ORDER = contentType === 'blog'
                  ? ['Blog']
                  : ['General', 'Local Business', 'Professional Services', 'Premium'];
                const groups = {};
                starters.forEach(t => {
                  const c = t.category || 'Other';
                  (groups[c] = groups[c] || []).push(t);
                });
                const groupedSections = ORDER.filter(c => groups[c]).map(c => ({ category: c, list: groups[c] }))
                  .concat(Object.keys(groups).filter(c => !ORDER.includes(c)).map(c => ({ category: c, list: groups[c] })));

                const hasSelection = !!selectedTemplate;

                // Compact chip: small icon + name + tiny meta. Keeps the grid
                // dense so a category fits in two short rows.
                const renderChip = (template) => {
                  const style = styleForTemplate(template);
                  const isSelected = selectedTemplate?.id === template.id;

                  let stateCls = 'border-[#e5e5e5] dark:border-[#333333] hover:border-[#075056]/60 dark:hover:border-[#5eead4]/60';
                  let dim = '';
                  if (isSelected) {
                    stateCls = 'border-[#075056] dark:border-[#5eead4] shadow-[0_0_0_3px_rgba(7,80,86,0.15)]';
                  } else if (hasSelection) {
                    dim = 'opacity-60 hover:opacity-100';
                  }

                  return (
                    <div
                      key={template.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedTemplate(template)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedTemplate(template); } }}
                      className={`group relative flex items-center gap-3 p-3 bg-white dark:bg-[#1c1c1c] rounded-xl border-2 transition-all cursor-pointer hover:-translate-y-0.5 ${stateCls} ${dim}`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${style.bg} ${style.fg}`}>
                        {style.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-bold text-[#262626] dark:text-white tracking-tight truncate">{template.name}</div>
                        <div className="text-[11px] text-[#888888] dark:text-[#777777] truncate">
                          {template._isUserTemplate ? 'Custom' : (template._isStarter ? 'Starter' : 'Template')}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPreviewingTemplate(template); }}
                        title="Preview template"
                        aria-label="Preview"
                        className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center text-[#075056] dark:text-[#5eead4] hover:bg-[#075056]/10 dark:hover:bg-[#5eead4]/10 shrink-0"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      {isSelected && (
                        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#075056] text-white shadow">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                      )}
                    </div>
                  );
                };

                // Per-category preview cap. Categories with more items get a
                // "Show all" toggle.
                const CHIP_LIMIT = 6;
                const renderSection = (key, title, list) => {
                  const expanded = !!expandedCategories[key];
                  const shown = expanded ? list : list.slice(0, CHIP_LIMIT);
                  const hiddenCount = list.length - shown.length;
                  return (
                    <section key={key}>
                      <div className="flex items-baseline justify-between mb-3">
                        <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
                        <span className="text-xs text-slate-500 dark:text-[#fbfbfb]">{list.length} {list.length === 1 ? 'template' : 'templates'}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {shown.map(renderChip)}
                      </div>
                      {list.length > CHIP_LIMIT && (
                        <button
                          type="button"
                          onClick={() => setExpandedCategories(s => ({ ...s, [key]: !s[key] }))}
                          className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#075056]/10 hover:bg-[#075056]/15 dark:bg-[#5eead4]/10 dark:hover:bg-[#5eead4]/15 text-[#075056] dark:text-[#5eead4] text-[13px] font-bold rounded-xl border border-[#075056]/20 dark:border-[#5eead4]/20 transition-colors"
                        >
                          {expanded ? 'Show fewer' : `Show all ${list.length} templates`}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </button>
                      )}
                    </section>
                  );
                };

                // Hint above the grid telling the user what they can pick.
                const filterHint = (
                  <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#075056]/8 dark:bg-[#5eead4]/8 border border-[#075056]/15 dark:border-[#5eead4]/15">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#075056] dark:text-[#5eead4]"><path d="M3 6h18M7 12h10M11 18h2"/></svg>
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#075056] dark:text-[#5eead4]">
                      Showing {contentType === 'blog' ? 'blog' : 'landing page'} templates
                    </span>
                  </div>
                );

                return (
                  <div className="space-y-8">
                    {filterHint}
                    {customs.length > 0 && renderSection('__customs', 'Your Templates', customs)}
                    {groupedSections.map(({ category, list }) => renderSection(category, category, list))}
                  </div>
                );
              })()}

              {/* Sticky bar — only navigation in step 3 (use the BackButton at
                  the top to retreat to step 2, or this bar to advance once a
                  template is picked). Earlier we had a duplicate Back +
                  Content-settings row below the grid; removed it — this bar
                  carries both Back and Continue when a template is selected. */}
              {selectedTemplate && (
                <div className="sticky bottom-4 z-20 animate-fade-in">
                  <div className="bg-[#075056] dark:bg-[#075056] border border-[#075056] rounded-2xl shadow-[0_20px_50px_rgba(7,80,86,0.45)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-3.5 sm:p-4 flex items-center justify-between gap-4 backdrop-blur-md">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/15 text-white shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                      <div className="min-w-0">
                        <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#5eead4]">Template selected</div>
                        <div className="text-sm sm:text-base font-bold text-white truncate">{selectedTemplate.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7"/></svg>
                        Back
                      </button>
                      <button
                        onClick={() => setSelectedTemplate(null)}
                        className="hidden sm:inline-flex items-center text-xs font-semibold text-white/70 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        Change
                      </button>
                      <button
                        onClick={() => setCurrentStep(4)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#075056] text-sm font-bold rounded-xl hover:bg-[#5eead4] hover:shadow-lg transition-all"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Content Settings ── */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <BackButton to={3} />
                <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-3 leading-tight tracking-tight">
                  Content settings
                </h1>
                <p className="text-sm text-slate-500 dark:text-[#fbfbfb]">
                  How should your page sound?
                </p>
              </div>

              <div className="space-y-7">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-[0.14em] mb-3">Tone</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: "Professional", desc: "Polished, authoritative", icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>) },
                      { name: "Friendly",     desc: "Warm, approachable",     icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>) },
                      { name: "Casual",       desc: "Relaxed, conversational", icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>) },
                    ].map((t) => {
                      const active = tone === t.name;
                      return (
                        <button
                          key={t.name}
                          onClick={() => setTone(t.name)}
                          className={`group relative flex flex-col items-start text-left p-4 rounded-xl border transition-all ${
                            active
                              ? "border-[#075056] bg-[#075056]/[0.04] dark:bg-[#075056]/15 ring-1 ring-[#075056]/30"
                              : "border-slate-200 dark:border-[#2a2a2a] hover:border-slate-300 dark:hover:border-[#404040] hover:bg-slate-50/60 dark:hover:bg-[#1a1a1a]"
                          }`}
                        >
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mb-2.5 transition-colors ${
                            active
                              ? "bg-[#075056] text-white"
                              : "bg-slate-100 dark:bg-[#1f1f1f] text-slate-500 dark:text-slate-400"
                          }`}>
                            {t.icon}
                          </span>
                          <span className={`text-sm font-bold mb-0.5 ${active ? "text-[#075056] dark:text-[#5eead4]" : "text-slate-900 dark:text-white"}`}>{t.name}</span>
                          <span className="text-[11.5px] leading-snug text-slate-500 dark:text-[#a8a8a8]">{t.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="flex items-baseline justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-[0.14em]">
                      {contentType === 'blog' ? 'Article length' : 'Content length'}
                    </span>
                    <span className="text-[11px] font-normal text-slate-400 dark:text-[#888888]">
                      {contentType === 'blog' ? 'total word count' : 'copy per section'}
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(contentType === 'blog' ? [
                      { name: "Short",  desc: "600–900 words",     bars: 1 },
                      { name: "Medium", desc: "1,200–1,800 words", bars: 2 },
                      { name: "Long",   desc: "2,000–3,000 words", bars: 3 },
                    ] : [
                      { name: "Short",  desc: "1–2 sentences",     bars: 1 },
                      { name: "Medium", desc: "2–3 sentences",     bars: 2 },
                      { name: "Long",   desc: "4–6 sentences",     bars: 3 },
                    ]).map((l) => {
                      const active = length === l.name;
                      return (
                        <button
                          key={l.name}
                          onClick={() => setLength(l.name)}
                          className={`group relative flex flex-col items-start text-left p-4 rounded-xl border transition-all ${
                            active
                              ? "border-[#075056] bg-[#075056]/[0.04] dark:bg-[#075056]/15 ring-1 ring-[#075056]/30"
                              : "border-slate-200 dark:border-[#2a2a2a] hover:border-slate-300 dark:hover:border-[#404040] hover:bg-slate-50/60 dark:hover:bg-[#1a1a1a]"
                          }`}
                        >
                          <span className="flex items-end gap-1 h-8 mb-2.5">
                            {[1, 2, 3].map(i => {
                              const filled = i <= l.bars;
                              const heights = ['h-3', 'h-5', 'h-7'];
                              return (
                                <span
                                  key={i}
                                  className={`w-1.5 rounded-sm transition-colors ${heights[i - 1]} ${
                                    filled
                                      ? (active ? 'bg-[#075056] dark:bg-[#5eead4]' : 'bg-slate-400 dark:bg-slate-500')
                                      : (active ? 'bg-[#075056]/20 dark:bg-[#5eead4]/20' : 'bg-slate-200 dark:bg-[#2a2a2a]')
                                  }`}
                                />
                              );
                            })}
                          </span>
                          <span className={`text-sm font-bold mb-0.5 ${active ? "text-[#075056] dark:text-[#5eead4]" : "text-slate-900 dark:text-white"}`}>{l.name}</span>
                          <span className="text-[11.5px] leading-snug text-slate-500 dark:text-[#a8a8a8]">{l.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Brand Kit picker */}
                <div>
                  <label className="flex items-baseline justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-[0.14em]">Brand Kit</span>
                    <span className="text-[11px] font-normal text-slate-400 dark:text-[#888888]">optional &mdash; colors, logo, voice</span>
                  </label>
                  {!brandKitsAllowed ? (
                    <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-dashed border-slate-300 dark:border-[#404040] bg-slate-50/50 dark:bg-[#161616]">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-700 dark:text-white">Brand kits are a paid feature</p>
                        <p className="text-[11.5px] text-slate-500 dark:text-[#a8a8a8] mt-0.5">Upgrade to apply your colors, logo, and voice automatically.</p>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-[#262626] text-slate-500 dark:text-[#888888] text-[11px] font-bold rounded-lg">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Paid plans
                      </span>
                    </div>
                  ) : brandKits.length === 0 ? (
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-dashed border-slate-300 dark:border-[#404040] bg-slate-50/50 dark:bg-[#161616]">
                      <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white dark:bg-[#262626] border border-slate-200 dark:border-[#333333] mt-0.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 dark:text-[#888888]"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-700 dark:text-white">No brand kits yet</p>
                        <p className="text-[11.5px] text-slate-500 dark:text-[#a8a8a8] mt-1 leading-relaxed">
                          You can add one anytime from the{' '}
                          <span className="font-semibold text-slate-700 dark:text-[#cccccc]">Brand Kit</span>
                          {' '}tab in the sidebar &mdash; colours, logo, and voice get applied automatically. Skip for now and keep the info you&rsquo;ve entered here.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedKitId('')}
                        className={`flex flex-col items-start text-left p-4 rounded-xl border transition-all ${
                          !selectedKitId
                            ? 'border-[#075056] bg-[#075056]/[0.04] dark:bg-[#075056]/15 ring-1 ring-[#075056]/30'
                            : 'border-slate-200 dark:border-[#2a2a2a] hover:border-slate-300 dark:hover:border-[#404040] hover:bg-slate-50/60 dark:hover:bg-[#1a1a1a]'
                        }`}
                      >
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg mb-2 ${
                          !selectedKitId
                            ? 'bg-[#075056] text-white'
                            : 'bg-slate-100 dark:bg-[#1f1f1f] text-slate-400 dark:text-slate-500'
                        }`}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                        </span>
                        <span className={`text-sm font-bold mb-0.5 ${!selectedKitId ? 'text-[#075056] dark:text-[#5eead4]' : 'text-slate-900 dark:text-white'}`}>None</span>
                        <span className="text-[11.5px] leading-snug text-slate-500 dark:text-[#a8a8a8]">Use the template defaults</span>
                      </button>
                      {brandKits.map(k => {
                        const active = selectedKitId === k.id;
                        return (
                          <button
                            key={k.id}
                            type="button"
                            onClick={() => applyKitFields(k.id)}
                            className={`flex flex-col items-start text-left p-4 rounded-xl border transition-all ${
                              active
                                ? 'border-[#075056] bg-[#075056]/[0.04] dark:bg-[#075056]/15 ring-1 ring-[#075056]/30'
                                : 'border-slate-200 dark:border-[#2a2a2a] hover:border-slate-300 dark:hover:border-[#404040] hover:bg-slate-50/60 dark:hover:bg-[#1a1a1a]'
                            }`}
                          >
                            <span className="w-7 h-7 rounded-lg border border-slate-200 dark:border-[#404040] shrink-0 mb-2 shadow-sm" style={{ background: k.primary_color }} />
                            <span className={`text-sm font-bold mb-0.5 truncate w-full ${active ? 'text-[#075056] dark:text-[#5eead4]' : 'text-slate-900 dark:text-white'}`}>{k.name}</span>
                            <span className="text-[11.5px] leading-snug text-slate-500 dark:text-[#a8a8a8] line-clamp-2">{k.voice || 'No voice set'}</span>
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
                  onClick={() => {
                    // Going forward from settings always means "(re)generate".
                    // Clear any existing preview and reset the kicked-off flag
                    // so step 5 fires a fresh generation with the new settings.
                    setPreviewHtml('');
                    setGeneratedPage(null);
                    setGenerationError('');
                    generationStarted.current = false;
                    setGenKickedOff(false);
                    setCurrentStep(5);
                  }}
                  className="px-8 py-4 bg-[#075056] text-white text-lg font-bold rounded-xl hover:bg-[#064548] transition-colors"
                >
                  {previewHtml ? 'Regenerate preview' : 'Generate preview'}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 5: Generate & Preview ── */}
          {currentStep === 5 && (
            <div className="space-y-8 animate-fade-in">
              {isGenerating ? (
                (() => {
                  const ETA_TOTAL = contentType === 'blog' ? 110 : 50;
                  const progressPercent = Math.min(95, (elapsedSeconds / ETA_TOTAL) * 100);
                  const remaining = Math.max(0, ETA_TOTAL - elapsedSeconds);
                  const etaText = remaining > 0
                    ? `~${remaining}s remaining`
                    : (elapsedSeconds < (contentType === 'blog' ? 150 : 90) ? 'finishing up' : 'taking longer than usual');
                  const showRetry = elapsedSeconds > (contentType === 'blog' ? 90 : 75);
                  return (
                    <div className="flex flex-col items-center text-center py-10 sm:py-12 px-6 max-w-xl mx-auto">
                      {/* Animation */}
                      <div className="w-40 h-40 sm:w-48 sm:h-48 mb-1 -mt-2">
                        <OnboardingLottie step={5} />
                      </div>

                      {/* Heading — uses the wizard's display font for polish */}
                      <h1 className="font-display text-[28px] sm:text-[34px] font-bold text-slate-900 dark:text-white tracking-[-0.025em] leading-[1.1] mb-3">
                        {contentType === 'blog' ? 'Writing your article' : 'Building your preview'}
                      </h1>
                      <p className="text-[15px] text-slate-600 dark:text-[#bbbbbb] mb-8 leading-relaxed">
                        {contentType === 'blog' ? 'Drafting' : 'Writing copy'} for{' '}
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {contentType === 'blog' ? keyword : phraseFor(modifierType, keyword, location)}
                        </span>
                      </p>

                      {/* Animated progress bar */}
                      <div className="w-full max-w-sm mb-3">
                        <BarbershopProgress percent={progressPercent} />
                      </div>

                      {/* Timer + status (compact, under bar). tabular-nums
                          keeps the digits from jittering as the seconds tick;
                          the rest stays in the wizard's body font so it
                          matches the surrounding typography. */}
                      <div className="flex items-baseline gap-2.5 mb-8 text-[13.5px]">
                        <span className="font-semibold text-[#075056] dark:text-[#5eead4] tabular-nums tracking-tight">
                          {String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:{String(elapsedSeconds % 60).padStart(2, '0')}
                        </span>
                        <span className="inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-[#555555] translate-y-[-2px]" />
                        <span className="text-slate-500 dark:text-[#999999]">{etaText}</span>
                      </div>

                      {/* Stop + (after timeout) Try again */}
                      <div className="flex items-center gap-2 mb-6">
                        <button
                          onClick={handleStopGeneration}
                          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 border border-red-500 hover:border-red-600 rounded-lg shadow-md shadow-red-500/30 hover:shadow-lg hover:shadow-red-500/40 transition-all"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>
                          Stop &amp; edit settings
                        </button>
                        {showRetry && (
                          <button
                            onClick={() => {
                              if (abortControllerRef.current) { try { abortControllerRef.current.abort(); } catch {} }
                              clearInterval(timerRef.current);
                              setIsGenerating(false);
                              setTimeout(() => handleGeneratePreview(createdProject), 200);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#075056] text-white rounded-lg hover:bg-[#064548] transition-colors animate-fade-in"
                          >
                            Try again
                          </button>
                        )}
                      </div>

                      {/* Rotating SEO tip — boxed, below the action buttons */}
                      <div className="max-w-sm w-full rounded-xl border border-[#075056]/20 dark:border-[#5eead4]/20 bg-[#075056]/[0.04] dark:bg-[#075056]/15 px-4 py-3.5">
                        <div className="flex items-center gap-1.5 justify-center mb-2">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#075056] dark:text-[#5eead4]"><path d="M12 2v2M5 5l1.5 1.5M2 12h2M5 19l1.5-1.5M12 22v-2M19 19l-1.5-1.5M22 12h-2M19 5l-1.5 1.5"/><circle cx="12" cy="12" r="5"/></svg>
                          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#075056] dark:text-[#5eead4]">SEO tip</span>
                        </div>
                        <p
                          key={tipIndex}
                          className="text-[13px] text-center text-[#555555] dark:text-[#cccccc] leading-relaxed animate-fade-in min-h-[2.5rem]"
                        >
                          {SEO_TIPS[tipIndex]}
                        </p>
                      </div>
                    </div>
                  );
                })()
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
                        {phraseFor(modifierType, keyword, location)}
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
                      box-shadow: 0 10px 32px -12px rgba(7, 80, 86, 0.28), 0 4px 14px -6px rgba(94, 234, 212, 0.18);
                    }
                    .dark .refine-border {
                      background: linear-gradient(#141414, #141414) padding-box,
                        linear-gradient(270deg, #075056, #14b8a6, #5eead4, #064548) border-box;
                      background-size: 300% 300%;
                      animation: gradientBorder 4s ease infinite;
                      box-shadow: 0 10px 36px -12px rgba(94, 234, 212, 0.22), 0 4px 14px -6px rgba(7, 80, 86, 0.4);
                    }
                    @keyframes wandPulse {
                      0%, 100% { transform: scale(1); }
                      50% { transform: scale(1.06); }
                    }
                    .refine-icon {
                      animation: wandPulse 2.4s ease-in-out infinite;
                    }
                  `}</style>
                  <div className="refine-border rounded-2xl p-5">
                    {/* Header: icon + label + helper */}
                    <div className="flex items-center gap-3 mb-3.5">
                      <span className="inline-flex items-center justify-center w-10 h-10 shrink-0">
                        <InlineLottie src="/refine-icon.json" style={{ width: 40, height: 40 }} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="refine-label text-[15px] sm:text-base font-bold tracking-tight leading-none">
                          {contentType === 'blog' ? 'Refine this article' : 'Refine this page'}
                        </div>
                        <p className="text-[11.5px] text-slate-500 dark:text-[#a8a8a8] mt-1">
                          Describe what to change — only that gets edited.
                        </p>
                      </div>
                    </div>

                    {/* Input + Apply */}
                    <div className="flex gap-2 items-stretch">
                      <input
                        type="text"
                        value={refineInstruction}
                        onChange={(e) => { setRefineInstruction(e.target.value); setRefineError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && !isRefining && handleRefine()}
                        placeholder={contentType === 'blog'
                          ? 'e.g. Add a TL;DR at the top'
                          : 'e.g. Add a pros and cons section below the hero'}
                        disabled={isRefining}
                        className="flex-1 px-4 py-3.5 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#2a2a2a] rounded-xl text-[14px] font-medium focus:outline-none focus:border-[#075056] focus:ring-2 focus:ring-[#075056]/15 disabled:opacity-50 transition-all placeholder:text-slate-400 dark:placeholder:text-[#666666] text-slate-900 dark:text-white"
                      />
                      <button
                        onClick={handleRefine}
                        disabled={!refineInstruction.trim() || isRefining}
                        className="px-5 bg-gradient-to-br from-[#075056] to-[#0a6b73] text-white text-sm font-bold rounded-xl hover:from-[#064548] hover:to-[#075056] disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#075056]/40 shrink-0"
                      >
                        {isRefining ? (
                          <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                            Applying…
                          </span>
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>

                    {/* Quick suggestion chips — discoverability + speed */}
                    {!isRefining && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-slate-400 dark:text-[#666666] mr-0.5">Try:</span>
                        {(contentType === 'blog'
                          ? ['Add a TL;DR at the top', 'Shorten the intro', 'Add a comparison table', 'Make the tone more casual']
                          : ['Add a testimonials section', 'Shorten the headline', 'Add an FAQ', 'Make the CTA more urgent']
                        ).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setRefineInstruction(s)}
                            className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-slate-100 dark:bg-[#1f1f1f] text-slate-600 dark:text-[#bbbbbb] hover:bg-[#075056]/8 dark:hover:bg-[#075056]/25 hover:text-[#075056] dark:hover:text-[#5eead4] border border-transparent hover:border-[#075056]/30 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}

                    {refineError && <p className="text-xs text-red-500 mt-2.5 pl-1">{refineError}</p>}
                  </div>

                  {/* Device toggle + open in tab */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#1f1f1f] rounded-xl border border-slate-200 dark:border-[#2a2a2a]">
                      <button
                        onClick={() => setPreviewDevice("desktop")}
                        className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                          previewDevice === "desktop"
                            ? "bg-white dark:bg-[#2a2a2a] text-[#075056] dark:text-[#5eead4] shadow-sm ring-1 ring-[#075056]/15"
                            : "text-slate-500 dark:text-[#a8a8a8] hover:text-slate-800 dark:hover:text-white"
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Desktop
                      </button>
                      <button
                        onClick={() => setPreviewDevice("mobile")}
                        className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                          previewDevice === "mobile"
                            ? "bg-white dark:bg-[#2a2a2a] text-[#075056] dark:text-[#5eead4] shadow-sm ring-1 ring-[#075056]/15"
                            : "text-slate-500 dark:text-[#a8a8a8] hover:text-slate-800 dark:hover:text-white"
                        }`}
                      >
                        <svg className="w-3.5 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Mobile
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        const blob = new Blob([safePreviewHtml], { type: "text/html" });
                        const url = URL.createObjectURL(blob);
                        window.open(url, "_blank");
                        setTimeout(() => URL.revokeObjectURL(url), 10000);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-white bg-white dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#2a2a2a] rounded-xl hover:border-[#075056] dark:hover:border-[#5eead4] hover:text-[#075056] dark:hover:text-[#5eead4] hover:shadow-sm transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
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
                            srcDoc={safePreviewHtml}
                            sandbox="allow-scripts"
                            className="w-full h-full border-none rounded-[2rem]"
                            title="Mobile preview"
                          />
                        </div>
                      </div>
                    ) : (
                      <iframe srcDoc={safePreviewHtml} sandbox="allow-scripts" className="w-full h-full border-none" title="Desktop preview" />
                    )}
                  </div>

                  {/* Edit settings + Finalize buttons */}
                  <div className="flex flex-col items-center gap-3 pt-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setCurrentStep(4)}
                        disabled={saveState === 'saving'}
                        className="flex items-center gap-2 px-6 py-3.5 text-base font-bold text-slate-700 dark:text-white bg-white dark:bg-[#1a1a1a] border border-slate-300 dark:border-[#404040] rounded-2xl hover:border-[#075056] dark:hover:border-[#5eead4] hover:text-[#075056] dark:hover:text-[#5eead4] hover:bg-slate-50/60 dark:hover:bg-[#1f1f1f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7"/></svg>
                        Edit settings
                      </button>
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
                          'Retry & finalize'
                        ) : (
                          'Finalize Project'
                        )}
                      </button>
                    </div>
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
          </div>
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
                {/* Desktop / Mobile toggle */}
                <div className="flex items-center bg-[#f5f5f5] dark:bg-[#1c1c1c] rounded-lg p-0.5 border border-[#e5e5e5] dark:border-[#333333] mr-1">
                  <button
                    onClick={() => setTemplatePreviewDevice('desktop')}
                    title="Desktop view"
                    className={`px-2.5 py-1.5 rounded-md transition-all ${templatePreviewDevice === 'desktop' ? 'bg-white dark:bg-[#333333] text-[#075056] dark:text-[#5eead4] shadow-sm' : 'text-[#999999] dark:text-[#777777] hover:text-[#262626] dark:hover:text-white'}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setTemplatePreviewDevice('mobile')}
                    title="Mobile view"
                    className={`px-2.5 py-1.5 rounded-md transition-all ${templatePreviewDevice === 'mobile' ? 'bg-white dark:bg-[#333333] text-[#075056] dark:text-[#5eead4] shadow-sm' : 'text-[#999999] dark:text-[#777777] hover:text-[#262626] dark:hover:text-white'}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                    </svg>
                  </button>
                </div>
                <button
                  onClick={() => { setSelectedTemplate(previewingTemplate); setPreviewingTemplate(null); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#075056] text-white text-sm font-bold rounded-xl hover:bg-[#064548] hover:shadow-lg hover:shadow-[#075056]/30 transition-all"
                >
                  Use this template
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
            <div className="flex-1 min-h-0 bg-[#f5f5f5] dark:bg-[#0a0a0a] p-4 overflow-hidden flex items-center justify-center" style={{ contain: 'layout paint' }}>
              {previewingTemplate.structure ? (
                templatePreviewDevice === 'mobile' ? (
                  // Phone frame: 380×720 with rounded bezel + camera notch
                  <div className="relative" style={{ width: 380, height: '90%', maxHeight: 760 }}>
                    <div className="absolute inset-0 rounded-[2.5rem] border-[10px] border-slate-800 dark:border-slate-700 bg-slate-800 dark:bg-slate-700 shadow-2xl overflow-hidden">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-800 dark:bg-slate-700 rounded-b-xl z-10" />
                      <iframe
                        srcDoc={renderPreviewHtml(previewingTemplate.structure
                          .replace(/\{\{KEYWORD\}\}/g, keyword || 'Your Business')
                          .replace(/\{\{LOCATION\}\}/g, location || 'Your City')
                          .replace(/\{\{SERVICE\}\}/g, businessType || 'Your Service'), { hideScroll: false })}
                        sandbox="allow-scripts"
                        className="w-full h-full border-0 block bg-white rounded-[1.75rem]"
                        title={`Preview: ${previewingTemplate.name}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full rounded-xl overflow-hidden border border-[#e5e5e5] dark:border-[#333333] bg-white">
                    <iframe
                      srcDoc={renderPreviewHtml(previewingTemplate.structure
                        .replace(/\{\{KEYWORD\}\}/g, keyword || 'Your Business')
                        .replace(/\{\{LOCATION\}\}/g, location || 'Your City')
                        .replace(/\{\{SERVICE\}\}/g, businessType || 'Your Service'), { hideScroll: false })}
                      sandbox="allow-scripts"
                      className="w-full h-full border-0 block"
                      title={`Preview: ${previewingTemplate.name}`}
                      style={{ transform: 'translateZ(0)', willChange: 'transform', contain: 'strict' }}
                    />
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-full text-[#aaaaaa]">No preview available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Lottie animation shown in the wizard's left pane. We fetch the JSON at
// runtime (it's ~300KB) so it doesn't bloat the wizard's JS chunk — it streams
// in alongside the first paint of the modal.
// Each wizard step gets its own Lottie. Fetched results are cached in the
// module-level `cache` map so revisiting a step is instant.
const LOTTIE_PER_STEP = {
  1: '/onboarding-hero.json',
  2: '/onboarding-hero-step2.json',
  3: '/onboarding-hero-step3.json',
  4: '/onboarding-hero-step4.json',
  5: '/onboarding-hero-step5.json',
};

function BarbershopProgress({ percent }) {
  const safe = Math.max(0, Math.min(100, percent));
  return (
    <>
      <style>{`
        @keyframes gg-barbershop {
          from { background-position: 0 0; }
          to   { background-position: 28px 0; }
        }
      `}</style>
      <div className="relative h-3 w-full bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${safe}%`,
            backgroundImage:
              'repeating-linear-gradient(-45deg, #075056 0, #075056 7px, #5eead4 7px, #5eead4 14px)',
            backgroundSize: '28px 28px',
            animation: 'gg-barbershop 1s linear infinite',
          }}
        />
      </div>
    </>
  );
}
const lottieCache = new Map();

function useLottieData(src) {
  const [data, setData] = useState(() => lottieCache.get(src) || null);
  useEffect(() => {
    if (!src) { setData(null); return; }
    if (lottieCache.has(src)) {
      setData(lottieCache.get(src));
      return;
    }
    let cancelled = false;
    setData(null);
    fetch(src)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        lottieCache.set(src, d);
        setData(d);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [src]);
  return data;
}

function InlineLottie({ src, className = '', style }) {
  const data = useLottieData(src);
  if (!data) return null;
  return <Lottie animationData={data} loop autoplay className={className} style={style} />;
}

function OnboardingLottie({ step = 1 }) {
  const src = LOTTIE_PER_STEP[step] || LOTTIE_PER_STEP[1];
  const data = useLottieData(src);
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ maxWidth: 520, maxHeight: 520 }}>
      {data && (
        <Lottie
          animationData={data}
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  );
}

// Segmented step progress: thin vertical bars that fill left-to-right with a
// yellow→lime→green gradient. Each bar's hue is interpolated by its position
// (so the colour shifts smoothly from 0% → 100%) and the fill staggers per-bar
// for a satisfying "energy meter" feel when the user moves between steps.
function StepProgress({ percent, total = 40 }) {
  const filledCount = Math.round((Math.max(0, Math.min(100, percent)) / 100) * total);
  return (
    <div className="flex items-stretch gap-[3px] h-3.5 w-full" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < filledCount;
        const hue = 45 + (97 * i) / Math.max(1, total - 1); // 45 (yellow) → 142 (green)
        return (
          <span
            key={i}
            className="flex-1 rounded-[1.5px] transition-[background-color] duration-500 ease-out"
            style={{
              backgroundColor: filled ? `hsl(${hue}, 78%, 50%)` : 'rgba(148,163,184,0.22)',
              transitionDelay: filled ? `${i * 14}ms` : '0ms',
            }}
          />
        );
      })}
    </div>
  );
}

// Standard form-field input: clean rounded bordered box with a slightly
// tinted background so the fields visually separate from the white wizard
// pane. On focus the bg becomes pure white + a teal ring, signalling activity.
const fieldInputCls = 'w-full px-3.5 py-2.5 text-[14px] bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333333] rounded-lg text-slate-900 dark:text-white placeholder:text-sm placeholder:text-slate-400 dark:placeholder:text-[#666666] focus:outline-none focus:bg-white dark:focus:bg-[#1f1f1f] focus:border-[#075056] dark:focus:border-[#5eead4] focus:ring-2 focus:ring-[#075056]/10 transition-colors';

// Field wrapper: plain label above, quieter hint, then the bordered input.
// Standard form layout — the "box" the user wanted is the input itself.
// Form field — label + an optional "?" popover that holds the verbose help
// text out of the way. The inline-hint paragraph that used to sit under the
// label was visually noisy; the icon-driven popover keeps the form scannable.
function FormField({ label, hint, optional, children }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </label>
        {optional && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-[#666666]">
            Optional
          </span>
        )}
        {hint && <HelpIcon align="left">{hint}</HelpIcon>}
      </div>
      {children}
    </div>
  );
}
