"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";
import STARTER_TEMPLATES from "../data/starterTemplates";

export default function OnboardingWizard({ session, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const TOTAL_STEPS = 4;

  // Step 1
  const [businessType, setBusinessType]               = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [keyword, setKeyword]                         = useState("");
  const [location, setLocation]                       = useState("");

  // Step 2
  const [templates, setTemplates]               = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Step 3
  const [tone, setTone]     = useState("Professional");
  const [length, setLength] = useState("Medium");

  // Step 4 — preview generation
  const [isGenerating, setIsGenerating]     = useState(false);
  const [previewHtml, setPreviewHtml]       = useState("");
  const [generationError, setGenerationError] = useState("");
  const [createdProject, setCreatedProject] = useState(null);
  const [generatedPage, setGeneratedPage]   = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [refineInstruction, setRefineInstruction] = useState("");
  const [isRefining, setIsRefining]         = useState(false);
  const [refineError, setRefineError]       = useState("");

  const generationStarted = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => { fetchTemplates(); }, []);

  useEffect(() => {
    if (currentStep === 4 && !generationStarted.current) {
      generationStarted.current = true;
      handleGeneratePreview();
    }
  }, [currentStep]);

  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    const timeout = setTimeout(() => {
      setTemplates(STARTER_TEMPLATES);
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
      setTemplates([...userTemplates, ...STARTER_TEMPLATES]);
    } catch (err) {
      clearTimeout(timeout);
      setTemplates(STARTER_TEMPLATES);
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

  const saveProjectInBackground = async (html) => {
    try {
      let project = createdProject;
      if (!project) {
        const { data, error } = await supabase.from("projects").insert({
          user_id: session.user.id,
          name: `${businessType} Pages`,
          status: "Draft",
          data: {
            headers: ["Keyword", "Location", "Service"],
            rows: [{ Keyword: keyword, Location: location, Service: businessType }],
            settings: { tone, length, templateId: selectedTemplate?.id },
          },
          row_count: 1,
        }).select().single();
        if (error || !data) return;
        project = data;
        setCreatedProject(data);
      } else {
        // Remove old page on regenerate
        await supabase.from("pages").delete().eq("project_id", project.id).then(() => {}).catch(() => {});
      }
      await supabase.from("pages").insert({
        project_id:   project.id,
        user_id:      session.user.id,
        keyword:      `${keyword} in ${location}`,
        location,
        html_content: html,
        status:       "completed",
      }).then(() => {}).catch(() => {});
    } catch {
      // Background save failed silently — user still has their preview
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

      let response;
      try {
        response = await fetch("/api/generate-page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            keyword,
            location,
            service:             businessType,
            businessDescription: businessDescription.trim(),
            tone,
            length,
            template_html:       selectedTemplate?.structure || "",
          }),
        });
      } catch (fetchErr) {
        if (fetchErr.name === "AbortError") throw new Error("Generation timed out — please try again.");
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
        response = await fetch("/api/refine-page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ current_html: previewHtml, instruction: refineInstruction }),
        });
      } catch (err) {
        if (err.name === "AbortError") throw new Error("Refinement timed out — try again.");
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

  const handleOpenProject = () => {
    localStorage.setItem("hasCompletedOnboarding", "true");
    onComplete?.({ project: createdProject, pages: generatedPage ? [generatedPage] : [] });
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
    <div className="fixed inset-0 bg-white dark:bg-[#0f0f10] z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-5xl w-full">

          {/* Progress bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Step {Math.min(currentStep, TOTAL_STEPS)} of {TOTAL_STEPS}
              </div>
              <button
                onClick={() => { localStorage.setItem("hasSeenOnboarding", "true"); onComplete?.(null); }}
                disabled={isGenerating}
                className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Skip to dashboard →
              </button>
            </div>
            <div className="h-1.5 bg-slate-200 dark:bg-[#27272a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5b4cdb] transition-all duration-500"
                style={{ width: `${(Math.min(currentStep, TOTAL_STEPS) / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>

          {/* ── Step 1: Business Info ── */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-display text-6xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">
                  Let's build your<br />first page
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400">
                  Tell us about your business and we'll generate a preview page — then you can scale from there.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    Business name or type
                  </label>
                  <input
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="e.g., Acme Plumbing, My Law Firm, Green Landscaping Co."
                    autoFocus
                    className="w-full px-6 py-5 text-lg bg-white dark:bg-[#18181b] border-2 border-slate-200 dark:border-[#27272a] rounded-2xl focus:outline-none focus:border-[#5b4cdb] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    Describe what you do <span className="text-slate-400 normal-case font-normal">(optional but recommended)</span>
                  </label>
                  <textarea
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    placeholder="e.g., We're a family-run plumbing company specialising in emergency repairs, drain unblocking, and boiler servicing. Known for fast response times and upfront pricing."
                    rows={3}
                    className="w-full px-6 py-4 text-base bg-white dark:bg-[#18181b] border-2 border-slate-200 dark:border-[#27272a] rounded-2xl focus:outline-none focus:border-[#5b4cdb] transition-colors resize-none"
                  />
                  <p className="text-sm text-slate-400 mt-2">The more detail you give, the more accurate your pages will be.</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Primary keyword / service
                    </label>
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="e.g., emergency plumber"
                      className="w-full px-6 py-5 text-lg bg-white dark:bg-[#18181b] border-2 border-slate-200 dark:border-[#27272a] rounded-2xl focus:outline-none focus:border-[#5b4cdb] transition-colors"
                    />
                    <p className="text-sm text-slate-400 mt-2">Be specific — you'll add more keywords in your project.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Primary location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Chicago"
                      className="w-full px-6 py-5 text-lg bg-white dark:bg-[#18181b] border-2 border-slate-200 dark:border-[#27272a] rounded-2xl focus:outline-none focus:border-[#5b4cdb] transition-colors"
                    />
                    <p className="text-sm text-slate-400 mt-2">You'll add more locations in your project too.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!businessType.trim() || !keyword.trim() || !location.trim()}
                  className="px-8 py-4 bg-[#5b4cdb] text-white text-lg font-bold rounded-xl hover:bg-[#4a3dc4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Pick a template →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Template Selection ── */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <BackButton to={1} />
                <h1 className="font-display text-6xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">
                  Pick your template
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400">
                  Choose a design for your preview page
                </p>
              </div>

              <button
                onClick={() => window.open("/?tab=templates&action=create", "_blank")}
                className="w-full p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-2xl hover:border-[#5b4cdb] dark:hover:border-[#5b4cdb] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform">+</div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">Create New Template</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Build a custom template with our visual builder</div>
                  </div>
                </div>
              </button>

              {isLoadingTemplates && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-[#5b4cdb] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-500">Loading templates…</p>
                </div>
              )}

              {!isLoadingTemplates && templates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.slice(0, 9).map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`group cursor-pointer rounded-2xl border-2 overflow-hidden transition-all hover:scale-[1.02] ${
                        selectedTemplate?.id === template.id
                          ? "border-[#5b4cdb] shadow-lg shadow-[#5b4cdb]/20"
                          : "border-slate-200 dark:border-[#27272a] hover:border-slate-300 dark:hover:border-[#3f3f46]"
                      }`}
                    >
                      <div className="h-48 overflow-hidden bg-white">
                        {template.structure ? (
                          <iframe
                            srcDoc={template.structure
                              .replace(/\{\{KEYWORD\}\}/g, keyword || "Plumber Chicago")
                              .replace(/\{\{LOCATION\}\}/g, location || "Chicago")
                              .replace(/\{\{SERVICE\}\}/g, businessType || "Plumbing")
                              .replace(/\{\{[A-Z0-9_]+\}\}/g, "Sample content")}
                            className="w-full h-full pointer-events-none"
                            title={template.name}
                            style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%", height: "200%" }}
                          />
                        ) : (
                          <div className="w-full h-full bg-[#f2f1fe] dark:bg-[#5b4cdb]/10" />
                        )}
                      </div>
                      <div className="p-4 bg-white dark:bg-[#18181b]">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-bold text-slate-900 dark:text-white">{template.name}</h3>
                          {template._isStarter && (
                            <span className="text-xs font-semibold px-1.5 py-0.5 bg-slate-100 dark:bg-[#27272a] text-slate-400 rounded-full">Starter</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">{template.category || "Template"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between">
                <button onClick={() => setCurrentStep(1)} className="px-6 py-3 text-slate-500 dark:text-slate-400 font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-[#27272a] transition-colors">
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!selectedTemplate}
                  className="px-8 py-4 bg-[#5b4cdb] text-white text-lg font-bold rounded-xl hover:bg-[#4a3dc4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Content settings →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Content Settings ── */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <BackButton to={2} />
                <h1 className="font-display text-6xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">
                  Content settings
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400">
                  How should your page sound?
                </p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Tone</label>
                  <div className="grid grid-cols-3 gap-4">
                    {["Professional", "Friendly", "Casual"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={`p-6 rounded-2xl border-2 font-semibold transition-all hover:scale-[1.02] ${
                          tone === t
                            ? "border-[#5b4cdb] bg-[#f2f1fe] dark:bg-[#5b4cdb]/10 text-[#5b4cdb]"
                            : "border-slate-200 dark:border-[#27272a] text-slate-700 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                    Content Length <span className="normal-case font-normal text-slate-400">— controls how much copy Claude writes per section</span>
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
                            ? "border-[#5b4cdb] bg-[#f2f1fe] dark:bg-[#5b4cdb]/10"
                            : "border-slate-200 dark:border-[#27272a] hover:border-slate-300"
                        }`}
                      >
                        <div className={`font-bold mb-1 ${length === l.name ? "text-[#5b4cdb]" : "text-slate-900 dark:text-white"}`}>{l.name}</div>
                        <div className="text-sm text-slate-400">{l.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setCurrentStep(2)} className="px-6 py-3 text-slate-500 dark:text-slate-400 font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-[#27272a] transition-colors">
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-8 py-4 bg-[#5b4cdb] text-white text-lg font-bold rounded-xl hover:bg-[#4a3dc4] transition-colors"
                >
                  Generate preview →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Generate & Preview ── */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-fade-in">
              {isGenerating ? (
                <div className="text-center space-y-6 py-12">
                  <div className="w-16 h-16 border-4 border-[#5b4cdb] border-t-transparent rounded-full animate-spin mx-auto" />
                  <div>
                    <h1 className="font-display text-5xl font-black text-slate-900 dark:text-white mb-3">
                      Building your preview…
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400">
                      GroGoliath is writing copy for <strong className="text-slate-700 dark:text-slate-300">{keyword} in {location}</strong>
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-2xl font-mono font-bold text-[#5b4cdb]">
                      {String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:{String(elapsedSeconds % 60).padStart(2, '0')}
                    </div>
                    <p className="text-sm text-slate-400">
                      {elapsedSeconds < 15 ? 'Setting up your project…' :
                       elapsedSeconds < 40 ? 'Writing headlines, descriptions, and copy…' :
                       elapsedSeconds < 70 ? 'Polishing the content — almost there…' :
                       'Taking a bit longer than usual, still working…'}
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
                    className="px-8 py-4 bg-[#5b4cdb] text-white font-bold rounded-xl hover:bg-[#4a3dc4] transition-colors"
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
                      <p className="text-base text-slate-500 dark:text-slate-400">
                        {keyword} in {location}
                      </p>
                    </div>
                    <button
                      onClick={handleOpenProject}
                      className="px-6 py-3 bg-[#5b4cdb] text-white font-bold rounded-xl hover:bg-[#4a3dc4] transition-colors shrink-0"
                    >
                      Open Project →
                    </button>
                  </div>

                  {/* Instruction bar */}
                  <style>{`
                    @keyframes gradientBorder {
                      0% { background-position: 0% 50%; }
                      50% { background-position: 100% 50%; }
                      100% { background-position: 0% 50%; }
                    }
                    @keyframes dot1 { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-5px);opacity:1} }
                    @keyframes dot2 { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-5px);opacity:1} }
                    @keyframes dot3 { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-5px);opacity:1} }
                    .refine-dot-1 { animation: dot1 1.2s ease-in-out infinite; }
                    .refine-dot-2 { animation: dot2 1.2s ease-in-out infinite 0.15s; }
                    .refine-dot-3 { animation: dot3 1.2s ease-in-out infinite 0.3s; }
                    .refine-border {
                      background: linear-gradient(white, white) padding-box,
                        linear-gradient(270deg, #5b4cdb, #818cf8, #c084fc, #4a3dc4) border-box;
                      background-size: 300% 300%;
                      animation: gradientBorder 4s ease infinite;
                      border: 2px solid transparent;
                    }
                    .dark .refine-border {
                      background: linear-gradient(#18181b, #18181b) padding-box,
                        linear-gradient(270deg, #5b4cdb, #818cf8, #c084fc, #4a3dc4) border-box;
                      background-size: 300% 300%;
                      animation: gradientBorder 4s ease infinite;
                    }
                  `}</style>
                  <div className="refine-border rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Animated sparkle dots */}
                      <div className="flex items-end gap-[3px] h-4">
                        <span className="refine-dot-1 w-1.5 h-1.5 rounded-full bg-[#5b4cdb] inline-block" />
                        <span className="refine-dot-2 w-1.5 h-1.5 rounded-full bg-[#818cf8] inline-block" />
                        <span className="refine-dot-3 w-1.5 h-1.5 rounded-full bg-[#c084fc] inline-block" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Refine this page</span>
                      <span className="text-xs text-slate-400">Only what you describe changes — everything else stays</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={refineInstruction}
                        onChange={(e) => { setRefineInstruction(e.target.value); setRefineError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && !isRefining && handleRefine()}
                        placeholder='e.g. "Add a pros and cons section below the hero", "Shorten the headline to 6 words", "Change CTA to Book a Free Call"'
                        disabled={isRefining}
                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-[#0f0f10] border border-slate-200 dark:border-[#27272a] rounded-xl text-sm focus:outline-none focus:border-[#5b4cdb] focus:bg-white dark:focus:bg-[#0f0f10] disabled:opacity-50 transition-colors placeholder:text-slate-400"
                      />
                      <button
                        onClick={handleRefine}
                        disabled={!refineInstruction.trim() || isRefining}
                        className="px-5 py-3 bg-[#5b4cdb] text-white text-sm font-bold rounded-xl hover:bg-[#4a3dc4] disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#5b4cdb]/30 shrink-0"
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

                  {/* iframe */}
                  <div className="rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-[#27272a] shadow-2xl" style={{ height: "68vh" }}>
                    {isRefining ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-[#0f0f10]">
                        <div className="w-10 h-10 border-4 border-[#5b4cdb] border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Applying your changes…</p>
                      </div>
                    ) : (
                      <iframe srcDoc={previewHtml} className="w-full h-full border-none" title="Page preview" />
                    )}
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        const blob = new Blob([previewHtml], { type: "text/html" });
                        const url = URL.createObjectURL(blob);
                        window.open(url, "_blank");
                        setTimeout(() => URL.revokeObjectURL(url), 10000);
                      }}
                      className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline transition-colors"
                    >
                      Open in new tab
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
