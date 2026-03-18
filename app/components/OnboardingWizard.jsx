"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function OnboardingWizard({ session, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 state
  const [businessType, setBusinessType] = useState("");
  const [locations, setLocations]       = useState("");
  const [keywords, setKeywords]         = useState("");

  // Step 2 state
  const [templates, setTemplates]               = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Step 3 state
  const [tone, setTone]     = useState("Professional");
  const [length, setLength] = useState("Medium");

  // Step 4 state
  const [isGenerating, setIsGenerating]           = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentlyGenerating, setCurrentlyGenerating] = useState("");
  const [generatedPages, setGeneratedPages]       = useState([]);
  const [generationError, setGenerationError]     = useState("");
  const [currentProject, setCurrentProject]       = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setTemplates([]);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const calculatePageCount = () => {
    if (!locations || !keywords) return 0;
    const locationCount = locations.split(",").filter((l) => l.trim()).length;
    const keywordCount  = keywords.split(",").filter((k) => k.trim()).length;
    return locationCount * keywordCount;
  };

  const totalPages = calculatePageCount();

  const handleStep1Continue = () => {
    if (businessType.trim() && locations.trim() && keywords.trim()) setCurrentStep(2);
  };

  const handleStep2Continue = () => {
    if (selectedTemplate) setCurrentStep(3);
  };

  const handleStep3Continue = () => {
    setCurrentStep(4);
  };

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationError("");
    setGeneratedPages([]);

    try {
      const locationArray = locations.split(",").map((l) => l.trim()).filter(Boolean);
      const keywordArray  = keywords.split(",").map((k) => k.trim()).filter(Boolean);

      const allCombinations = [];
      locationArray.forEach((location) => {
        keywordArray.forEach((keyword) => {
          allCombinations.push({
            Keyword:  `${keyword} in ${location}`,
            Location: location,
            Service:  businessType,
          });
        });
      });

      setGenerationProgress(10);

      console.log('Creating project with data:', {
        user_id: session.user.id,
        name: `${businessType} Pages`,
        row_count: allCombinations.length
      });

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          user_id:   session.user.id,
          name:      `${businessType} Pages`,
          status:    "Draft",
          data: {
            headers: ["Keyword", "Location", "Service"],
            rows:    allCombinations,
          },
          row_count: allCombinations.length,
        })
        .select()
        .single();

      console.log('Project creation result:', { project, projectError });

      if (projectError) {
        console.error('Project creation error:', projectError);
        console.error('Error details:', JSON.stringify(projectError, null, 2));
        throw new Error(`Failed to create project: ${projectError.message}`);
      }

      if (!project) {
        throw new Error('Project was not created - no data returned');
      }

      console.log('Project created successfully:', project.id);

      setCurrentProject(project);
      setGenerationProgress(20);

      const pages = [];

      for (let i = 0; i < allCombinations.length; i++) {
        const combo = allCombinations[i];
        setCurrentlyGenerating(combo.Keyword);

        try {
          console.log(`Generating page ${i + 1}/${allCombinations.length}:`, combo.Keyword);
          const response = await fetch("/api/generate-page", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId:   project.id,
              keyword:     combo.Keyword,
              location:    combo.Location,
              service:     combo.Service,
              template_html: selectedTemplate?.structure || '',
            }),
          });

          // Update progress immediately after API responds
          setGenerationProgress(20 + Math.round(((i + 1) / allCombinations.length) * 80));

          const result = await response.json();
          console.log(`Page ${i + 1} response:`, { ok: response.ok, status: response.status, hasHtml: !!result.html, error: result.error });

          if (!response.ok) throw new Error(result.error || "Failed to generate page");

          // Save page to Supabase
          console.log(`Preparing to save page ${i + 1} to database...`);
          console.log('HTML length:', result.html?.length);
          console.log('Keyword:', combo.Keyword, 'Location:', combo.Location);

          const { data: savedPage, error: pageError } = await supabase
            .from('pages')
            .insert({
              project_id:   project.id,
              user_id:      session.user.id,
              keyword:      combo.Keyword,
              location:     combo.Location,
              html_content: result.html,
              status:       'completed',
            })
            .select()
            .single();

          console.log('Supabase insert result:', { savedPage, pageError });

          if (pageError) {
            console.error('Failed to save page to database:', pageError);
            console.error('Full error:', JSON.stringify(pageError, null, 2));
            // Don't throw — still count as generated even if DB save fails
          } else {
            console.log(`Page ${i + 1} saved to DB with ID:`, savedPage?.id);
          }

          // Always push result (has slug, title, content) — savedPage only has DB fields
          pages.push({ ...result, db_id: savedPage?.id });
          setGeneratedPages([...pages]);
        } catch (err) {
          console.error(`Failed to generate page ${i + 1}:`, err.message);
          setGenerationProgress(20 + Math.round(((i + 1) / allCombinations.length) * 80));
        }
      }

      setGenerationProgress(100);
      setIsGenerating(false);

      localStorage.setItem('hasCompletedOnboarding', 'true');
      setTimeout(() => {
        onComplete?.({
          project,
          pages,
          totalPages: allCombinations.length,
        });
      }, 500);
    } catch (err) {
      console.error('Generation error:', err);
      console.error('Full error object:', JSON.stringify(err, null, 2));
      setGenerationError(err.message || 'Something went wrong');
      setIsGenerating(false);
    }
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

          {/* Progress indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Step {currentStep} of 4
              </div>
              <button
                onClick={() => {
                  localStorage.setItem('hasSeenOnboarding', 'true');
                  onComplete?.(null);
                }}
                disabled={isGenerating}
                className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Skip to dashboard →
              </button>
            </div>
            <div className="h-1.5 bg-slate-200 dark:bg-[#27272a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5b4cdb] transition-all duration-500"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* ── Step 1: Business Info ── */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-display text-6xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">
                  Let's create your<br />first project
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400">
                  Tell us about your business and we'll generate SEO pages for you
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    What kind of business do you run?
                  </label>
                  <input
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="e.g., plumbing company, law firm, restaurant"
                    autoFocus
                    className="w-full px-6 py-5 text-lg bg-white dark:bg-[#18181b] border-2 border-slate-200 dark:border-[#27272a] rounded-2xl focus:outline-none focus:border-[#5b4cdb] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    Where do you operate?
                  </label>
                  <input
                    type="text"
                    value={locations}
                    onChange={(e) => setLocations(e.target.value)}
                    placeholder="e.g., Houston, Dallas, Austin"
                    className="w-full px-6 py-5 text-lg bg-white dark:bg-[#18181b] border-2 border-slate-200 dark:border-[#27272a] rounded-2xl focus:outline-none focus:border-[#5b4cdb] transition-colors"
                  />
                  <p className="text-sm text-slate-400 mt-2">Separate multiple cities with commas</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    What services do you offer?
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g., emergency plumbing, drain cleaning, water heater repair"
                    className="w-full px-6 py-5 text-lg bg-white dark:bg-[#18181b] border-2 border-slate-200 dark:border-[#27272a] rounded-2xl focus:outline-none focus:border-[#5b4cdb] transition-colors"
                  />
                  <p className="text-sm text-slate-400 mt-2">These will be your main keywords for SEO</p>
                </div>

                {totalPages > 0 && (
                  <div className="p-6 bg-[#f2f1fe] dark:bg-[#5b4cdb]/10 border-2 border-[#5b4cdb]/30 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#5b4cdb] uppercase tracking-wider mb-1">Pages We'll Create</div>
                      <div className="text-4xl font-black text-[#5b4cdb]">{totalPages}</div>
                      <div className="text-sm text-[#5b4cdb]/70 mt-1">
                        {locations.split(",").filter((l) => l.trim()).length} locations ×{" "}
                        {keywords.split(",").filter((k) => k.trim()).length} services
                      </div>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-[#5b4cdb] flex items-center justify-center flex-shrink-0">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleStep1Continue}
                  disabled={!businessType.trim() || !locations.trim() || !keywords.trim()}
                  className="px-8 py-4 bg-[#5b4cdb] text-white text-lg font-bold rounded-xl hover:bg-[#4a3dc4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Continue to Templates →
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
                  Choose a design for your {totalPages} pages
                </p>
              </div>

              {/* Create New Template */}
              <button
                onClick={() => window.open('/?tab=templates&action=create', '_blank')}
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
                  {templates.slice(0, 6).map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`group cursor-pointer rounded-2xl border-2 overflow-hidden transition-all hover:scale-[1.02] ${
                        selectedTemplate?.id === template.id
                          ? "border-[#5b4cdb] shadow-lg shadow-[#5b4cdb]/20"
                          : "border-slate-200 dark:border-[#27272a] hover:border-slate-300 dark:hover:border-[#3f3f46]"
                      }`}
                    >
                      <div className="h-48 bg-[#f2f1fe] dark:bg-[#5b4cdb]/10 p-6">
                        <div className="space-y-2 opacity-40">
                          <div className="h-4 bg-slate-400 dark:bg-slate-600 rounded w-2/3" />
                          <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-full" />
                          <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-4/5" />
                          <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-3/5" />
                        </div>
                      </div>
                      <div className="p-4 bg-white dark:bg-[#18181b]">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-0.5">{template.name}</h3>
                        <p className="text-sm text-slate-400">{template.category || "Template"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoadingTemplates && templates.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500 mb-4">No templates found</p>
                  <button
                    onClick={fetchTemplates}
                    className="px-6 py-3 bg-slate-100 dark:bg-[#27272a] text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-[#3f3f46] transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 text-slate-500 dark:text-slate-400 font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-[#27272a] transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleStep2Continue}
                  disabled={!selectedTemplate}
                  className="px-8 py-4 bg-[#5b4cdb] text-white text-lg font-bold rounded-xl hover:bg-[#4a3dc4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Continue to Settings →
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
                  How should your pages sound?
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
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Content Length</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: "Short",  desc: "~100 words" },
                      { name: "Medium", desc: "~200 words" },
                      { name: "Long",   desc: "~400 words" },
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
                        <div className={`font-bold mb-1 ${length === l.name ? "text-[#5b4cdb]" : "text-slate-900 dark:text-white"}`}>
                          {l.name}
                        </div>
                        <div className="text-sm text-slate-400">{l.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 text-slate-500 dark:text-slate-400 font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-[#27272a] transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleStep3Continue}
                  className="px-8 py-4 bg-[#5b4cdb] text-white text-lg font-bold rounded-xl hover:bg-[#4a3dc4] transition-colors"
                >
                  Continue to Preview →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Generate ── */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-fade-in">
              {!isGenerating && (
                <>
                  <div>
                    <BackButton to={3} />
                    <h1 className="font-display text-6xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">
                      Ready to generate
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400">
                      We'll create {totalPages} pages for you
                    </p>
                  </div>

                  <div className="p-8 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-2xl space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Business</div>
                        <div className="text-lg font-semibold text-slate-900 dark:text-white">{businessType}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Template</div>
                        <div className="text-lg font-semibold text-slate-900 dark:text-white">{selectedTemplate?.name}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Tone</div>
                        <div className="text-lg font-semibold text-slate-900 dark:text-white">{tone}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Length</div>
                        <div className="text-lg font-semibold text-slate-900 dark:text-white">
                          {length} (~{length === "Short" ? "100" : length === "Medium" ? "200" : "400"} words)
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-[#27272a]">
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pages</div>
                      <div className="text-3xl font-black text-[#5b4cdb]">{totalPages}</div>
                    </div>
                  </div>

                  {generationError && (
                    <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl">
                      <div className="text-sm font-bold text-red-700 dark:text-red-300 mb-2">Error</div>
                      <div className="text-sm text-red-600 dark:text-red-400">{generationError}</div>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <button
                      onClick={handleStartGeneration}
                      className="px-12 py-5 bg-gradient-to-r from-[#5b4cdb] to-[#4a3dc4] text-white text-xl font-black rounded-2xl hover:shadow-2xl hover:shadow-[#5b4cdb]/30 hover:scale-105 transition-all"
                    >
                      {generationError ? 'Retry Generation →' : `Generate All ${totalPages} Pages →`}
                    </button>
                  </div>
                </>
              )}

              {/* Generation in progress */}
              {isGenerating && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h1 className="font-display text-6xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                      Generating...
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400">
                      Creating {totalPages} unique pages
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Progress</span>
                      <span className="text-sm font-mono text-slate-600 dark:text-slate-400">{generationProgress}%</span>
                    </div>
                    <div className="h-4 bg-slate-200 dark:bg-[#27272a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#5b4cdb] to-[#4a3dc4] transition-all duration-500"
                        style={{ width: `${generationProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{generatedPages.length} / {totalPages} pages</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        ⏱️ ~{Math.max(1, Math.ceil((totalPages - generatedPages.length) * 0.3))} min remaining
                      </span>
                    </div>
                  </div>

                  {currentlyGenerating && (
                    <div className="p-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
                      <div className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-2">Currently Creating</div>
                      <div className="text-lg font-semibold text-blue-900 dark:text-blue-200">{currentlyGenerating}</div>
                    </div>
                  )}

                  <div className="p-6 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-2xl">
                    <div className="text-sm text-purple-700 dark:text-purple-300">
                      💡 Each page is optimized for Google with unique content, meta tags, and schema markup
                    </div>
                  </div>

                  {generationError && (
                    <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl">
                      <div className="text-sm font-bold text-red-700 dark:text-red-300 mb-2">Error</div>
                      <div className="text-sm text-red-600 dark:text-red-400">{generationError}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
