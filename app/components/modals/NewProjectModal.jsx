"use client";

import React, { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import PRESET_TEMPLATES from "../../constants/presetTemplates";
import { supabase } from "../../../lib/supabaseClient";

const NewProjectModal = ({ isOpen, onClose, onUploadSuccess, onCreateProject, initialData, initialTemplateId }) => {
  const [uploading, setUploading] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [progressMinimized, setProgressMinimized] = useState(false);
  const [userTemplates, setUserTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [step, setStep] = useState(0);
  const [pagePlanMode, setPagePlanMode] = useState("plan");
  const [pagePlanRows, setPagePlanRows] = useState([
    { service: "", count: 10, modifiers: "", pattern: "{{Service}} in {{City}} {{Modifier}}" }
  ]);
  const [blockSettings, setBlockSettings] = useState([]);
  const [projectName, setProjectName] = useState("");
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
  const [keywordsList, setKeywordsList] = useState("");

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
        const existingRows = Array.isArray(initialData.data?.rows) ? initialData.data.rows : [];
        const existingKeywords = existingRows.map((r) => r.Keyword).filter(Boolean);
        setKeywordsList(existingKeywords.join("\n"));
        setSelectedTemplateId(details.TemplateId || initialTemplateId || "");
        setPagePlanMode("advanced");
        setBlockSettings(details.BlockSettings || []);
        setStep(1);
      } else {
        setProjectName("");
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
        setKeywordsList("");
        setSelectedTemplateId(initialTemplateId || "");
        setPagePlanMode("plan");
        setPagePlanRows([{ service: "", count: 10, modifiers: "", pattern: "{{Service}} in {{City}} {{Modifier}}" }]);
        setBlockSettings([]);
        setStep(initialTemplateId ? 1 : 0);
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
      words: getSuggestedWords(b.type)
    };
  };

  const getTemplateById = (id) => {
    if (!id) return null;
    return [...PRESET_TEMPLATES, ...userTemplates].find((t) => t.id.toString() === id.toString()) || null;
  };

  useEffect(() => {
    if (!selectedTemplateId) return;
    const template = getTemplateById(selectedTemplateId);
    if (!template) return;
    const settings = template.structure.map((b) => getDefaultBlockSetting(b));
    setBlockSettings(settings);
  }, [selectedTemplateId]);

  if (!isOpen) return null;

  const buildKeywordsFromPlan = () => {
    const results = [];
    pagePlanRows.forEach((row) => {
      const count = Number(row.count) || 0;
      const mods = String(row.modifiers || "")
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);
      for (let i = 0; i < count; i++) {
        const mod = mods.length > 0 ? mods[i % mods.length] : "";
        let keyword = String(row.pattern || "{{Service}} in {{City}}")
          .replace(/{{Service}}/g, row.service || "")
          .replace(/{{City}}/g, city || "")
          .replace(/{{Modifier}}/g, mod)
          .replace(/{{Index}}/g, String(i + 1));
        keyword = keyword.replace(/\s+/g, " ").trim();
        if (keyword) results.push(keyword);
      }
    });
    return results;
  };

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
        TemplateId: templateId,
        BlockSettings: blockSettings
      };

      const rawKeywords =
        pagePlanMode === "plan"
          ? buildKeywordsFromPlan()
          : keywordsList
              .split(/\n|,/)
              .map((k) => k.trim())
              .filter(Boolean);

      if (!projectName.trim()) throw new Error("Please enter a project name.");
      if (!templateId) throw new Error("Please select a template first.");
      if (rawKeywords.length === 0) throw new Error("Please add at least one keyword (plan or list).");

      setProgressMessage("Building your pages list...");

      const rows = rawKeywords.map((k) => ({
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
                <div className="h-full w-2/3 bg-indigo-600 animate-pulse"></div>
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
            const plannedKeywords =
              pagePlanMode === "plan"
                ? buildKeywordsFromPlan()
                : keywordsList
                    .split(/\n|,/)
                    .map((k) => k.trim())
                    .filter(Boolean);
            const pageCount = plannedKeywords.length;
            const stepLabels = ["Template", "Data", "Content", "Review"];
            const canContinue =
              step === 0
                ? !!selectedTemplateId
                : step === 1
                ? projectName.trim() && pageCount > 0 && city.trim()
                : true;

            return (
              <>
                <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400">
                  {stepLabels.map((label, i) => (
                    <div key={label} className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                          step >= i
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-400 dark:bg-slate-700"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span className={step >= i ? "text-slate-700 dark:text-slate-200" : ""}>{label}</span>
                    </div>
                  ))}
                </div>

                {step === 0 && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500">
                      Choose a template to define your page structure. You can edit the content later.
                    </p>
                    {!selectedTemplateId && (
                      <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-lg p-3 text-sm">
                        Tip: Create or import a template first, then come back to create a project.
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Template</label>
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      >
                        <option value="">-- Select a template --</option>
                        <optgroup label="Presets">
                          {PRESET_TEMPLATES.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="My Templates">
                          {userTemplates.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      <p className="text-xs text-slate-500 mt-2">
                        Pick a template first. You can customize content per section later.
                      </p>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <p className="text-sm text-slate-500">
                      Add basic project info, then plan how many pages you want to generate.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Project Name"
                        className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      >
                        <option value="">Select Industry</option>
                        {["SaaS", "Local Services", "E-commerce", "Healthcare", "Legal", "Real Estate", "Hospitality", "Education", "Nonprofit", "Finance", "Other"].map((i) => (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        ))}
                      </select>
                      <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Target City / Location"
                        className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                      <input
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="Brand Name"
                        className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                      <input
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        placeholder="Primary Service"
                        className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                      <input
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        placeholder="Primary Product (optional)"
                        className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Page Plan</label>
                      <div className="flex gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setPagePlanMode("plan")}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                            pagePlanMode === "plan"
                              ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                              : "bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          }`}
                        >
                          Simple Plan
                        </button>
                        <button
                          type="button"
                          onClick={() => setPagePlanMode("advanced")}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                            pagePlanMode === "advanced"
                              ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                              : "bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          }`}
                        >
                          Advanced (paste keywords)
                        </button>
                      </div>

                      {pagePlanMode === "plan" ? (
                        <div className="space-y-3">
                          {pagePlanRows.map((row, idx) => (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2">
                              <input
                                value={row.service}
                                onChange={(e) => {
                                  const next = [...pagePlanRows];
                                  next[idx] = { ...next[idx], service: e.target.value };
                                  setPagePlanRows(next);
                                }}
                                placeholder="Service"
                                className="md:col-span-3 w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                              />
                              <input
                                value={row.count}
                                onChange={(e) => {
                                  const next = [...pagePlanRows];
                                  next[idx] = { ...next[idx], count: e.target.value };
                                  setPagePlanRows(next);
                                }}
                                placeholder="Count"
                                className="md:col-span-2 w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                              />
                              <input
                                value={row.modifiers}
                                onChange={(e) => {
                                  const next = [...pagePlanRows];
                                  next[idx] = { ...next[idx], modifiers: e.target.value };
                                  setPagePlanRows(next);
                                }}
                                placeholder="Modifiers (comma list)"
                                className="md:col-span-3 w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                              />
                              <input
                                value={row.pattern}
                                onChange={(e) => {
                                  const next = [...pagePlanRows];
                                  next[idx] = { ...next[idx], pattern: e.target.value };
                                  setPagePlanRows(next);
                                }}
                                placeholder="{{Service}} in {{City}} {{Modifier}}"
                                className="md:col-span-4 w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                              />
                            </div>
                          ))}
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() =>
                                setPagePlanRows((prev) => [
                                  ...prev,
                                  { service: "", count: 10, modifiers: "", pattern: "{{Service}} in {{City}} {{Modifier}}" }
                                ])
                              }
                              className="text-xs font-bold text-indigo-600 hover:underline"
                            >
                              + Add service group
                            </button>
                            <span className="text-xs text-slate-500">Planned pages: {pageCount}</span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {"Use {{Service}}, {{City}}, {{Modifier}}, {{Index}} in the pattern."}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <textarea
                            value={keywordsList}
                            onChange={(e) => setKeywordsList(e.target.value)}
                            placeholder="Keywords list (one per line or comma-separated)"
                            className="w-full min-h-[120px] p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                          />
                          <div className="flex flex-wrap gap-3 items-center mt-3">
                            <p className="text-xs text-slate-500">Example: "plumber in Austin"</p>
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
                              className="text-xs font-bold text-indigo-600 hover:underline"
                            >
                              Use sample keywords
                            </button>
                            <span className="text-xs text-slate-500">Page count: {pageCount}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <p className="text-sm text-slate-500">
                      Decide which sections AI should write and set word counts. You can write the rest manually.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        value={primaryKeyword}
                        onChange={(e) => setPrimaryKeyword(e.target.value)}
                        placeholder="Primary Keyword (optional)"
                        className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                      <input
                        value={secondaryKeywords}
                        onChange={(e) => setSecondaryKeywords(e.target.value)}
                        placeholder="Secondary Keywords (comma-separated)"
                        className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                    </div>

                    <textarea
                      value={valueProp}
                      onChange={(e) => setValueProp(e.target.value)}
                      placeholder="One-line Value Proposition"
                      className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                    <p className="text-xs text-slate-500">
                      {"Example: \"We help {{Audience}} achieve {{Outcome}} without {{Pain}}.\""}
                    </p>
                    <textarea
                      value={services}
                      onChange={(e) => setServices(e.target.value)}
                      placeholder="Core Services / Products (comma-separated)"
                      className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                    <p className="text-xs text-slate-500">Example: SEO audits, landing pages, AI content.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        value={pricingRange}
                        onChange={(e) => setPricingRange(e.target.value)}
                        placeholder="Pricing Range (optional)"
                        className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                      <input
                        value={cta}
                        onChange={(e) => setCta(e.target.value)}
                        placeholder="Main CTA (e.g., Book a Call)"
                        className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                      <input
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        placeholder="Target Audience"
                        className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                      <input
                        value={internalLinks}
                        onChange={(e) => setInternalLinks(e.target.value)}
                        placeholder="Internal Link Targets (optional)"
                        className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <select
                        value={pageGoal}
                        onChange={(e) => setPageGoal(e.target.value)}
                        className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      >
                        {["Leads", "Sales", "Awareness"].map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
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

                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">AI Content Settings</label>
                      <div className="space-y-2">
                        {blockSettings.map((b, idx) => (
                          <div key={b.id || idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                            <div className="md:col-span-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                              {b.label}
                              <div className="text-[11px] text-slate-400">Suggested: {getSuggestedWords(b.type)} words</div>
                            </div>
                            <select
                              value={b.mode}
                              onChange={(e) => {
                                const next = [...blockSettings];
                                next[idx] = { ...next[idx], mode: e.target.value };
                                setBlockSettings(next);
                              }}
                              className="md:col-span-4 w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            >
                              <option value="ai">AI writes this section</option>
                              <option value="manual">I will write it</option>
                            </select>
                            <input
                              type="number"
                              min={50}
                              max={800}
                              value={b.words || getSuggestedWords(b.type)}
                              onChange={(e) => {
                                const next = [...blockSettings];
                                next[idx] = { ...next[idx], words: Number(e.target.value) };
                                setBlockSettings(next);
                              }}
                              placeholder="Words"
                              className="md:col-span-4 w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                          </div>
                        ))}
                      </div>
                      {blockSettings.length === 0 && (
                        <p className="text-xs text-slate-500">Select a template to configure AI content per section.</p>
                      )}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500">
                      Review everything before creating the project. You can go back and adjust any step.
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Review</h4>
                      <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                        <div>Template: {getTemplateById(selectedTemplateId)?.name || "Not selected"}</div>
                        <div>Project: {projectName || "Untitled project"}</div>
                        <div>Location: {city || "Not set"}</div>
                        <div>Planned pages: {pageCount}</div>
                        <div>Mode: {pagePlanMode === "plan" ? "Simple Plan" : "Advanced keywords list"}</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      You can edit any step before creating the project. After creation, use Generate to create pages.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700"
                    disabled={step === 0}
                  >
                    Back
                  </button>
                  <div className="text-xs text-slate-400">You can go back and edit anytime.</div>
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.min(3, s + 1))}
                    className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 text-sm font-medium disabled:opacity-60"
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
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium disabled:opacity-60"
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
