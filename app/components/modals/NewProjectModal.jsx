"use client";

import React, { useEffect, useState } from "react";
import { Edit3, Loader2, X } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

const NewProjectModal = ({ isOpen, onClose, onUploadSuccess, onCreateProject, onOpenTemplateBuilder, initialData, initialTemplateId }) => {
  const [uploading, setUploading] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [progressMinimized, setProgressMinimized] = useState(false);
  const [userTemplates, setUserTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [step, setStep] = useState(0);
  const [blockSettings, setBlockSettings] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [desiredPageCount, setDesiredPageCount] = useState(10);
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState("");
  const [brandName, setBrandName] = useState("");
  const [service, setService] = useState("");
  const [product, setProduct] = useState("");
  const [valueProp, setValueProp] = useState("");
  const [services, setServices] = useState("");
  const [pricingRange, setPricingRange] = useState("");
  const [cta, setCta] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Professional");
  const [pageGoal, setPageGoal] = useState("Leads");
  const [language, setLanguage] = useState("English");
  const [internalLinks, setInternalLinks] = useState("");
  const [additionalAiContext, setAdditionalAiContext] = useState("");
  const [keywordsList, setKeywordsList] = useState("");
  const [editingPreviewBlock, setEditingPreviewBlock] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const fetchTemplates = async () => {
        const {
          data: { user }
        } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from("templates").select("*").order("created_at", { ascending: false });
          if (data) setUserTemplates(data);
        }
      };
      fetchTemplates();

      if (initialData) {
        const details = initialData.data?.details || {};
        setProjectName(initialData.name || "");
        setBusinessDescription(details.BusinessDescription || "");
        setDesiredPageCount(Number(details.DesiredPageCount) || (Array.isArray(initialData.data?.rows) ? initialData.data.rows.length : 10));
        setIndustry(details.Industry || "");
        setCity(details.City || "");
        setPrimaryKeyword(details.PrimaryKeyword || "");
        setSecondaryKeywords(details.SecondaryKeywords || "");
        setBrandName(details.Brand || "");
        setService(details.Service || "");
        setProduct(details.Product || "");
        setValueProp(details.ValueProp || "");
        setServices(details.Services || "");
        setPricingRange(details.Pricing || "");
        setCta(details.CTA || "");
        setAudience(details.Audience || "");
        setTone(details.Tone || "Professional");
        setPageGoal(details.PageGoal || "Leads");
        setLanguage(details.Language || "English");
        setInternalLinks(details.InternalLinks || "");
        setAdditionalAiContext(details.AdditionalAiContext || "");
        const existingRows = Array.isArray(initialData.data?.rows) ? initialData.data.rows : [];
        const existingKeywords = existingRows.map((r) => r.Keyword).filter(Boolean);
        setKeywordsList(existingKeywords.join("\n"));
        setSelectedTemplateId(details.TemplateId || initialTemplateId || "");
        setBlockSettings(details.BlockSettings || []);
        setStep(1);
      } else {
        setProjectName("");
        setBusinessDescription("");
        setDesiredPageCount(10);
        setIndustry("");
        setCity("");
        setPrimaryKeyword("");
        setSecondaryKeywords("");
        setBrandName("");
        setService("");
        setProduct("");
        setValueProp("");
        setServices("");
        setPricingRange("");
        setCta("");
        setAudience("");
        setTone("Professional");
        setPageGoal("Leads");
        setLanguage("English");
        setInternalLinks("");
        setAdditionalAiContext("");
        setKeywordsList("");
        setSelectedTemplateId(initialTemplateId || "");
        setBlockSettings([]);
        setStep(0);
      }
    }
  }, [isOpen, initialData, initialTemplateId]);

  const getSuggestedWords = (type) => {
    const suggestions = {
      hero: 120,
      header: 20,
      text: 180,
      pain_point: 120,
      solution: 140,
      usp: 120,
      pricing: 80,
      cta: 40,
      faq_auto: 120,
      stats: 60,
      comparison: 90,
      pros_cons: 90,
      social_proof: 80,
      process: 110,
      case_study: 220,
      columns_2: 140,
      grid_2x2: 120
    };
    return suggestions[type] || 120;
  };

  const getDefaultBlockSetting = (b) => {
    const aiTypes = new Set([
      "text",
      "hero",
      "pain_point",
      "solution",
      "usp",
      "pricing",
      "cta",
      "faq_auto",
      "stats",
      "comparison",
      "pros_cons",
      "social_proof",
      "process",
      "case_study",
      "columns_2",
      "grid_2x2",
      "header"
    ]);
    const manualTypes = new Set(["schema_service", "schema_blog", "image", "contact_form", "trust_badges"]);
    return {
      id: b.id,
      type: b.type,
      label: b.type.replace("_", " "),
      mode: manualTypes.has(b.type) ? "manual" : aiTypes.has(b.type) ? "ai" : "manual",
      words: getSuggestedWords(b.type),
      notes: ""
    };
  };

  const getTemplateById = (id) => {
    if (!id) return null;
    return userTemplates.find((t) => t.id.toString() === id.toString()) || null;
  };

  const updateBlockSettingById = (id, patch) => {
    setBlockSettings((prev) => {
      const exists = prev.some((b) => b.id === id);
      if (!exists) return prev;
      return prev.map((b) => (b.id === id ? { ...b, ...patch } : b));
    });
  };

  useEffect(() => {
    if (!selectedTemplateId) return;
    const template = getTemplateById(selectedTemplateId);
    if (!template) return;
    const settings = template.structure.map((b) => getDefaultBlockSetting(b));
    setBlockSettings(settings);
  }, [selectedTemplateId]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setUploading(true);
    setProgressMinimized(false);
    setProgressMessage("Validating your project...");

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) throw new Error("You must be logged in to create a project.");

      const templateId = selectedTemplateId || initialTemplateId || "";
      const details = {
        BusinessDescription: businessDescription,
        DesiredPageCount: Number(desiredPageCount) || 0,
        Industry: industry,
        City: city,
        PrimaryKeyword: primaryKeyword,
        SecondaryKeywords: secondaryKeywords,
        Brand: brandName,
        Service: service,
        Product: product,
        ValueProp: valueProp,
        Services: services,
        Pricing: pricingRange,
        CTA: cta,
        Audience: audience,
        Tone: tone,
        PageGoal: pageGoal,
        Language: language,
        InternalLinks: internalLinks,
        AdditionalAiContext: additionalAiContext,
        TemplateId: templateId,
        BlockSettings: blockSettings
      };

      const rawKeywords = keywordsList
        .split(/\n|,/)
        .map((k) => k.trim())
        .filter(Boolean);
      const requestedCount = Math.max(1, Number(desiredPageCount) || rawKeywords.length || 1);
      const finalKeywords = rawKeywords.slice(0, requestedCount);

      if (!projectName.trim()) throw new Error("Please enter a project name.");
      if (!templateId) throw new Error("Please select a template first.");
      if (finalKeywords.length === 0) throw new Error("Please add at least one keyword (plan or list).");

      setProgressMessage("Building your pages list...");

      const rows = finalKeywords.map((k) => ({
        Keyword: k,
        ...details
      }));
      const headers = Object.keys(rows[0] || {});
      const payload = { rows, headers, details };

      setProgressMessage(initialData ? "Updating your project..." : "Creating your project...");

      if (initialData) {
        const { error } = await supabase
          .from("projects")
          .update({ name: projectName, row_count: rows.length, data: payload })
          .eq("id", initialData.id);
        if (error) throw new Error(error.message || "Failed to update project.");
        onUploadSuccess();
        onClose();
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .insert({ user_id: user.id, name: projectName, row_count: rows.length, status: "Draft", data: payload })
        .select("*")
        .single();
      if (error) throw new Error(error.message || "Failed to create project.");
      onUploadSuccess();
      if (data) onCreateProject?.(data, templateId);
      onClose();
    } catch (err) {
      alert(err?.message || "Something went wrong creating the project.");
    } finally {
      setUploading(false);
      setProgressMessage("");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl border dark:border-slate-700 overflow-hidden relative">
        {uploading && !progressMinimized && (
          <div className="absolute inset-0 z-20 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">Creating Project</div>
                <button
                  type="button"
                  onClick={() => setProgressMinimized(true)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Minimize
                </button>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div className="h-full w-2/3 bg-[#2B5E44] animate-pulse"></div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{progressMessage || "Working..."}</p>
              <p className="text-xs text-slate-400 mt-2">You can keep working while we finish this.</p>
            </div>
          </div>
        )}
        {uploading && progressMinimized && (
          <button
            type="button"
            onClick={() => setProgressMinimized(false)}
            className="fixed bottom-4 right-4 z-30 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg hover:bg-slate-800"
          >
            Project creation running... tap to view
          </button>
        )}
        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-bold dark:text-white">{initialData ? "Edit Project" : "New Project"}</h3>
          <button onClick={onClose}>
            <X className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {(() => {
            const plannedKeywords = keywordsList
              .split(/\n|,/)
              .map((k) => k.trim())
              .filter(Boolean);
            const pageCount = Math.min(
              plannedKeywords.length,
              Math.max(1, Number(desiredPageCount) || plannedKeywords.length || 1)
            );
            const stepLabels = ["Template", "Business", "Content", "Review"];
            const canContinue =
              step === 0
                ? !!selectedTemplateId
                : step === 1
                ? projectName.trim() && brandName.trim() && service.trim() && city.trim() && pageGoal.trim() && Number(desiredPageCount) > 0
                : step === 2
                ? plannedKeywords.length > 0
                : true;

            return (
              <>
                <div className="space-y-3">
                  <div className="h-2 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2B5E44] via-[#37795a] to-[#4d8f70] transition-all duration-500"
                      style={{ width: `${((step + 1) / stepLabels.length) * 100}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[11px] font-bold uppercase text-slate-400">
                    {stepLabels.map((label, i) => (
                      <div key={label} className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] transition-all duration-300 ${
                            step >= i
                              ? "bg-[#2B5E44] text-white shadow-lg shadow-[#2B5E44]/30"
                              : "bg-slate-100 text-slate-400 dark:bg-slate-700"
                          }`}
                        >
                          {i + 1}
                        </div>
                        <span className={step >= i ? "text-slate-700 dark:text-slate-200" : ""}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {step === 0 && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500">
                      Choose one of your imported templates to define your page structure.
                    </p>
                    {userTemplates.length === 0 ? (
                      <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-lg p-4 text-sm space-y-3">
                        <p className="font-semibold">No imported templates found.</p>
                        <p>Create a template first, then come back to start your project.</p>
                        <button
                          type="button"
                          onClick={() => onOpenTemplateBuilder?.()}
                          className="px-4 py-2 text-xs font-bold rounded-lg bg-[#2B5E44] text-white hover:bg-[#244f3a]"
                        >
                          Create New Template
                        </button>
                      </div>
                    ) : (
                      <>
                        {!selectedTemplateId && (
                          <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-lg p-3 text-sm">
                            Pick a template to continue.
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Imported Templates</label>
                          <select
                            value={selectedTemplateId}
                            onChange={(e) => setSelectedTemplateId(e.target.value)}
                            className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                          >
                            <option value="">-- Select an imported template --</option>
                            {userTemplates.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <p className="text-xs text-slate-500">
                              Need a new layout? Create one and come right back.
                            </p>
                            <button
                              type="button"
                              onClick={() => onOpenTemplateBuilder?.()}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#2B5E44]/20 text-[#2B5E44] bg-[#2B5E44]/10 hover:bg-[#2B5E44]/15"
                            >
                              + New Template
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <p className="text-sm text-slate-500">
                      Add only the essential business details so we can set up your project correctly.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Project name</label>
                        <input
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          placeholder="Austin Plumbing Local SEO"
                          className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Brand name</label>
                        <input
                          value={brandName}
                          onChange={(e) => setBrandName(e.target.value)}
                          placeholder="Your brand"
                          className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Primary service</label>
                        <input
                          value={service}
                          onChange={(e) => setService(e.target.value)}
                          placeholder="Emergency plumbing"
                          className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Target city / location</label>
                        <input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Austin, TX"
                          className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Primary goal</label>
                        <select
                          value={pageGoal}
                          onChange={(e) => setPageGoal(e.target.value)}
                          className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                          {["Leads", "Sales", "Awareness", "Bookings", "Authority"].map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">How many pages?</label>
                        <input
                          type="number"
                          min={1}
                          value={desiredPageCount}
                          onChange={(e) => setDesiredPageCount(e.target.value)}
                          placeholder="10"
                          className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Business summary (optional)</label>
                      <textarea
                        value={businessDescription}
                        onChange={(e) => setBusinessDescription(e.target.value)}
                        placeholder="What you do, who you serve, and what makes you different."
                        className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white min-h-[90px]"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <p className="text-sm text-slate-500">
                      This step shapes your content quality. Fill what you know now; you can still refine section-by-section in the preview step.
                    </p>
                    <p className="text-xs text-slate-500">
                      AI vs manual writing is configured in the next step when you review the page preview.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900/40">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">1) SEO Context</p>
                        <p className="text-xs text-slate-500 mt-1">Keywords + location scope guide on-page relevance.</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900/40">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">2) Messaging</p>
                        <p className="text-xs text-slate-500 mt-1">Value prop, audience, tone, and CTA shape conversion quality.</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900/40">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">3) Scale Inputs</p>
                        <p className="text-xs text-slate-500 mt-1">Keywords/locations list controls how many final pages are generated.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Primary keyword</label>
                        <input
                          value={primaryKeyword}
                          onChange={(e) => setPrimaryKeyword(e.target.value)}
                          placeholder="plumber in austin"
                          className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Secondary keywords</label>
                        <input
                          value={secondaryKeywords}
                          onChange={(e) => setSecondaryKeywords(e.target.value)}
                          placeholder="emergency plumber austin, water heater repair"
                          className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Value proposition</label>
                      <textarea
                        value={valueProp}
                        onChange={(e) => setValueProp(e.target.value)}
                        placeholder="Why should people choose your brand?"
                        className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Audience</label>
                        <input
                          value={audience}
                          onChange={(e) => setAudience(e.target.value)}
                          placeholder="Homeowners in Austin"
                          className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Primary CTA</label>
                        <input
                          value={cta}
                          onChange={(e) => setCta(e.target.value)}
                          placeholder="Book a same-day call"
                          className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Core services / offers</label>
                        <input
                          value={services}
                          onChange={(e) => setServices(e.target.value)}
                          placeholder="Emergency repair, drain cleaning, leak detection"
                          className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Pricing range (optional)</label>
                        <input
                          value={pricingRange}
                          onChange={(e) => setPricingRange(e.target.value)}
                          placeholder="$99-$499"
                          className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tone</label>
                        <select
                          value={tone}
                          onChange={(e) => setTone(e.target.value)}
                          className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                          {["Professional", "Friendly", "Luxury", "Minimal", "Bold"].map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Language</label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                          {["English", "Spanish", "French", "German", "Portuguese", "Italian", "Dutch"].map((l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Internal links (optional)</label>
                        <input
                          value={internalLinks}
                          onChange={(e) => setInternalLinks(e.target.value)}
                          placeholder="/services, /about, /contact"
                          className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Keywords / locations for bulk generation</label>
                      <textarea
                        value={keywordsList}
                        onChange={(e) => setKeywordsList(e.target.value)}
                        placeholder="One keyword/location per line or comma-separated"
                        className="w-full min-h-[120px] p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                      <div className="flex flex-wrap gap-3 items-center mt-1">
                        <button
                          type="button"
                          onClick={() =>
                            setKeywordsList(
                              [
                                "plumber in Austin",
                                "emergency plumber Austin",
                                "water heater repair Austin",
                                "drain cleaning Austin",
                                "toilet repair Austin",
                                "leak detection Austin",
                                "pipe replacement Austin",
                                "bathroom plumbing Austin",
                                "kitchen plumbing Austin",
                                "24/7 plumber Austin"
                              ].join("\n")
                            )
                          }
                          className="text-xs font-bold text-[#2B5E44] hover:underline"
                        >
                          Fill sample keywords
                        </button>
                        <span className="text-xs text-slate-500">Planned pages: {pageCount}</span>
                      </div>
                      {plannedKeywords.length === 0 && (
                        <p className="text-xs text-amber-600">Add at least one keyword/location to continue.</p>
                      )}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500">
                      Review everything before creating the project. This preview shows the final page structure your first draft will use.
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Review</h4>
                      <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                        <div>Template: {getTemplateById(selectedTemplateId)?.name || "Not selected"}</div>
                        <div>Project: {projectName || "Untitled project"}</div>
                        <div>Goal: {pageGoal}</div>
                        <div>Location: {city || "Not set"}</div>
                        <div>Desired pages: {Math.max(1, Number(desiredPageCount) || 1)}</div>
                        <div>Planned pages: {pageCount}</div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">Live Landing Page Preview</h5>
                        <span className="text-xs text-slate-500">
                          {(getTemplateById(selectedTemplateId)?.structure || []).length} sections
                        </span>
                      </div>
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white">
                        <div className="h-9 px-4 flex items-center gap-2 bg-slate-100 border-b border-slate-200">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-300"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-300"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300"></span>
                          <span className="text-[11px] text-slate-500 ml-2">Preview - {brandName || "Your Brand"} service page</span>
                        </div>
                        <div className="p-5 bg-gradient-to-b from-[#f4faf6] via-white to-[#f8fcf9]">
                          <div className="rounded-2xl p-6 bg-[#2B5E44] text-white shadow-lg">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Preview Hero</p>
                            <h6 className="mt-2 text-2xl font-bold leading-tight">{service || "Your Service"} in {city || "Your City"}</h6>
                            <p className="mt-2 text-sm text-white/85">
                              {valueProp || "A modern, high-converting landing page preview with SEO-ready structure."}
                            </p>
                            <div className="mt-4 flex gap-2">
                              <span className="px-3 py-1.5 rounded-full text-xs bg-white/15">Goal: {pageGoal}</span>
                              <span className="px-3 py-1.5 rounded-full text-xs bg-white/15">{tone}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                            {(getTemplateById(selectedTemplateId)?.structure || []).map((block, idx) => {
                              const cfg = blockSettings.find((b) => b.id === block.id) || getDefaultBlockSetting(block);
                              return (
                                <div
                                  key={block.id}
                                  className="group rounded-xl border border-slate-200 bg-white/95 p-3 animate-in fade-in duration-300 shadow-sm"
                                  style={{ animationDelay: `${idx * 35}ms` }}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Section {idx + 1} - {block.type.replaceAll("_", " ")}
                                      </div>
                                      <div className="text-xs mt-1 text-slate-600">
                                        {cfg.mode === "ai" ? `AI - ~${cfg.words} words` : "Manual section"}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setEditingPreviewBlock({ id: block.id, type: block.type })}
                                      className="p-1.5 rounded-md text-slate-500 hover:text-[#2B5E44] hover:bg-[#2B5E44]/10"
                                      title="Edit section settings"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                  </div>
                                  <p className="text-xs mt-2 text-slate-500 line-clamp-2">{block.content}</p>
                                  {cfg.notes && <p className="text-[11px] mt-2 text-[#2B5E44]">Note: {cfg.notes}</p>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    {editingPreviewBlock && (
                      <div className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5">
                          {(() => {
                            const block = (getTemplateById(selectedTemplateId)?.structure || []).find((b) => b.id === editingPreviewBlock.id);
                            if (!block) return null;
                            const cfg = blockSettings.find((b) => b.id === block.id) || getDefaultBlockSetting(block);
                            return (
                              <>
                                <h6 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">
                                  Edit {block.type.replaceAll("_", " ")}
                                </h6>
                                <div className="space-y-3">
                                  <select
                                    value={cfg.mode}
                                    onChange={(e) => updateBlockSettingById(block.id, { mode: e.target.value })}
                                    className="w-full p-2.5 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                  >
                                    <option value="ai">AI writes this section</option>
                                    <option value="manual">I will write this section</option>
                                  </select>
                                  {cfg.mode === "ai" && (
                                    <input
                                      type="number"
                                      min={50}
                                      max={800}
                                      value={cfg.words}
                                      onChange={(e) => updateBlockSettingById(block.id, { words: Number(e.target.value) })}
                                      className="w-full p-2.5 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                      placeholder="Word count"
                                    />
                                  )}
                                  <textarea
                                    value={cfg.notes || ""}
                                    onChange={(e) => updateBlockSettingById(block.id, { notes: e.target.value })}
                                    className="w-full min-h-[90px] p-2.5 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    placeholder="Optional note for AI (add/remove points, constraints, style)"
                                  />
                                </div>
                                <div className="mt-4 flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingPreviewBlock(null)}
                                    className="px-3 py-2 text-sm text-slate-600"
                                  >
                                    Close
                                  </button>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-slate-500">
                      You can fine-tune any section with the pencil icon, then create the project and review the first AI draft before full generation.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="px-4 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    disabled={step === 0}
                  >
                    Back
                  </button>
                  <div className="text-xs text-slate-400">You can go back and edit anytime.</div>
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.min(3, s + 1))}
                    className="px-5 py-2.5 text-sm font-bold rounded-lg text-white bg-gradient-to-r from-[#2B5E44] to-[#37795a] hover:from-[#234d37] hover:to-[#2f684f] shadow-lg shadow-[#2B5E44]/25 disabled:opacity-60"
                    disabled={!canContinue || step === 3}
                    title={!canContinue ? "Complete required fields to continue" : ""}
                  >
                    Next
                  </button>
                </div>
              </>
            );
          })()}
        </div>
        <div className="p-6 border-t dark:border-slate-700 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-slate-500">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={uploading || step !== 3}
            className="px-4 py-2 bg-[#2B5E44] text-white rounded hover:bg-[#234d37] font-medium disabled:opacity-60"
            title={step !== 3 ? "Finish the steps to create the project" : ""}
          >
            {uploading ? <Loader2 className="animate-spin" /> : initialData ? "Save Changes" : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewProjectModal;
// --- 7. View Data Modal (With Inspector & Export) ---
