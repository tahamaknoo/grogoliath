"use client";

import React, { useEffect, useState } from "react";
import { Edit3, Loader2, X } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import LivePreview from "../builder/LivePreview";

const NewProjectModal = ({ isOpen, onClose, onUploadSuccess, onCreateProject, onOpenTemplateBuilder, initialData, initialTemplateId, profile }) => {
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
  const [heroTitle, setHeroTitle] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [editingPreviewBlock, setEditingPreviewBlock] = useState(null);
  const [aiPreviewBlocks, setAiPreviewBlocks] = useState([]);
  const [aiPreviewLoading, setAiPreviewLoading] = useState(false);
  const [aiPreviewError, setAiPreviewError] = useState("");
  const [previewAutoRun, setPreviewAutoRun] = useState(false);
  const [rewriteLoadingId, setRewriteLoadingId] = useState(null);
  const remainingPages =
    profile && typeof profile.page_limit !== "undefined"
      ? Math.max(0, Number(profile.page_limit || 0) - Number(profile.pages_used || 0))
      : null;
  const stepLabels = ["Template", "Business", "AI Inputs", "Preview", "Data"];
  const lastStep = stepLabels.length - 1;
  const plannedKeywords = keywordsList
    .split(/\n|,/)
    .map((k) => k.trim())
    .filter(Boolean);
  const desiredPages = Math.max(1, Number(desiredPageCount) || plannedKeywords.length || 1);
  const overPlanLimit = remainingPages !== null && desiredPages > remainingPages;
  const cappedDesired = remainingPages !== null ? Math.min(desiredPages, remainingPages) : desiredPages;
  const pageCount = plannedKeywords.length > 0 ? Math.min(plannedKeywords.length, cappedDesired) : 0;
  const aiInputsChecklist = [
    brandName,
    service,
    city,
    primaryKeyword,
    valueProp,
    audience,
    cta,
    services,
    pricingRange,
    tone,
    pageGoal,
    language,
    internalLinks,
    additionalAiContext
  ];
  const aiInputsFilled = aiInputsChecklist.filter((item) => String(item || "").trim().length > 0).length;
  const aiInputsTotal = aiInputsChecklist.length;
  const aiInputsPercent = Math.round((aiInputsFilled / aiInputsTotal) * 100);
  const aiInputsStatus =
    aiInputsPercent >= 80 ? "Excellent" : aiInputsPercent >= 55 ? "Good" : aiInputsPercent >= 30 ? "Fair" : "Barebones";
  const canSubmit =
    step === lastStep &&
    !!getTemplateById(selectedTemplateId) &&
    projectName.trim() &&
    brandName.trim() &&
    service.trim() &&
    city.trim() &&
    pageGoal.trim() &&
    plannedKeywords.length > 0 &&
    Number(desiredPageCount) > 0 &&
    !overPlanLimit &&
    (remainingPages === null || remainingPages > 0);

  useEffect(() => {
    if (!heroTitle && (service || city)) {
      setHeroTitle(`${service || "Service"}${city ? ` in ${city}` : ""}`.trim());
    }
  }, [service, city, heroTitle]);

  useEffect(() => {
    if (!metaTitle && (brandName || service || city)) {
      const base = `${service || "Service"}${city ? ` in ${city}` : ""}`.trim();
      const brand = brandName ? ` | ${brandName}` : "";
      setMetaTitle(`${base}${brand}`.trim());
    }
  }, [brandName, service, city, metaTitle]);

  useEffect(() => {
    if (!metaDescription && (valueProp || service || city)) {
      const core = valueProp || `${service || "Local services"}${city ? ` in ${city}` : ""}.`;
      setMetaDescription(`${core} Get fast response times, transparent pricing, and trusted experts.`.trim());
    }
  }, [valueProp, service, city, metaDescription]);

  useEffect(() => {
    if (isOpen) {
      setAiPreviewBlocks([]);
      setAiPreviewError("");
      setPreviewAutoRun(false);
      const fetchTemplates = async () => {
        const {
          data: { user }
        } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("templates")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
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
        setHeroTitle(details.HeroTitle || "");
        setMetaTitle(details.MetaTitle || "");
        setMetaDescription(details.MetaDescription || "");
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
        setHeroTitle("");
        setMetaTitle("");
        setMetaDescription("");
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

  function getTemplateById(id) {
    if (!id) return null;
    return userTemplates.find((t) => t.id.toString() === id.toString()) || null;
  }

  const updateBlockSettingById = (id, patch) => {
    setBlockSettings((prev) => {
      const exists = prev.some((b) => b.id === id);
      if (!exists) return prev;
      return prev.map((b) => (b.id === id ? { ...b, ...patch } : b));
    });
  };

  const buildPreviewPrompt = (template, settings) => {
    const context = [
      `Brand: ${brandName || "N/A"}`,
      `Service: ${service || "N/A"}`,
      `City/Location: ${city || "N/A"}`,
      `Primary keyword: ${primaryKeyword || service || "N/A"}`,
      `Secondary keywords: ${secondaryKeywords || "N/A"}`,
      `Business summary: ${businessDescription || "N/A"}`,
      `Audience: ${audience || "N/A"}`,
      `Value proposition: ${valueProp || "N/A"}`,
      `CTA: ${cta || "N/A"}`,
      `Core services: ${services || "N/A"}`,
      `Pricing range: ${pricingRange || "N/A"}`,
      `Goal: ${pageGoal || "N/A"}`,
      `Tone: ${tone || "N/A"}`,
      `Language: ${language || "N/A"}`,
      `Internal links: ${internalLinks || "N/A"}`,
      `Confirmed hero title: ${heroTitle || "AI choose"}`,
      `Confirmed meta title: ${metaTitle || "AI choose"}`,
      `Confirmed meta description: ${metaDescription || "AI choose"}`,
      `Additional notes: ${additionalAiContext || "N/A"}`
    ].join("\n");

    const blockLines = template.structure
      .map((b, idx) => {
        const s = settings.find((x) => String(x.id) === String(b.id)) || getDefaultBlockSetting(b);
        const note = String(s.notes || "").trim();
        if (s.mode === "manual") {
          return `${idx + 1}. [${b.type}] Manual. Use this placeholder verbatim: ${b.content}${
            note ? ` Editor note: ${note}` : ""
          }`;
        }
        return `${idx + 1}. [${b.type}] ${b.content} Target length: ~${s.words} words.${
          note ? ` Editor note: ${note}` : ""
        }`;
      })
      .join("\n");

    return `
You are generating first-draft content blocks for a programmatic SEO service page.

CONTEXT:
${context}

STRUCTURE (keep order):
${blockLines}

Use confirmed hero/meta values verbatim where relevant. If they are "AI choose", generate strong options.

Return ONLY a JSON array in the exact same order as the structure.
Each item must be: {"id": number, "type": string, "content": string}
Do not include markdown fences or extra text.
`.trim();
  };

  const buildSingleBlockPrompt = (block, settings, currentContent) => {
    const context = [
      `Brand: ${brandName || "N/A"}`,
      `Service: ${service || "N/A"}`,
      `City/Location: ${city || "N/A"}`,
      `Primary keyword: ${primaryKeyword || service || "N/A"}`,
      `Secondary keywords: ${secondaryKeywords || "N/A"}`,
      `Business summary: ${businessDescription || "N/A"}`,
      `Audience: ${audience || "N/A"}`,
      `Value proposition: ${valueProp || "N/A"}`,
      `CTA: ${cta || "N/A"}`,
      `Core services: ${services || "N/A"}`,
      `Pricing range: ${pricingRange || "N/A"}`,
      `Goal: ${pageGoal || "N/A"}`,
      `Tone: ${tone || "N/A"}`,
      `Language: ${language || "N/A"}`,
      `Internal links: ${internalLinks || "N/A"}`,
      `Confirmed hero title: ${heroTitle || "AI choose"}`,
      `Confirmed meta title: ${metaTitle || "AI choose"}`,
      `Confirmed meta description: ${metaDescription || "AI choose"}`,
      `Additional notes: ${additionalAiContext || "N/A"}`
    ].join("\n");

    const s = settings.find((x) => String(x.id) === String(block.id)) || getDefaultBlockSetting(block);
    const note = String(s.notes || "").trim();

    return `
You are rewriting a single section of a programmatic SEO service page.

CONTEXT:
${context}

SECTION:
Type: ${block.type}
Target length: ~${s.words} words
Editor note: ${note || "None"}

CURRENT DRAFT:
${currentContent || block.content || "N/A"}

Rules:
- Keep this a ${block.type} section.
- Use confirmed hero/meta values verbatim when relevant.
- Improve clarity, conversion, and SEO without keyword stuffing.
- Return ONLY the rewritten section text (no JSON, no markdown).
`.trim();
  };

  const extractJsonArray = (raw) => {
    const cleaned = String(raw || "").replace(/```json|```/g, "").trim();
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallthrough
    }
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start !== -1 && end > start) {
      const sliced = cleaned.slice(start, end + 1);
      const parsed = JSON.parse(sliced);
      if (Array.isArray(parsed)) return parsed;
    }
    throw new Error("AI preview returned invalid JSON.");
  };

  const handleGeneratePreview = async () => {
    const template = getTemplateById(selectedTemplateId);
    if (!template) {
      setAiPreviewError("Select a template to generate a preview.");
      return;
    }

    setPreviewAutoRun(true);
    setAiPreviewLoading(true);
    setAiPreviewError("");

    try {
      const settings =
        blockSettings.length > 0 ? blockSettings : template.structure.map((b) => getDefaultBlockSetting(b));
      const prompt = buildPreviewPrompt(template, settings);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      if (!response.ok || data?.error) throw new Error(data?.error || "Preview generation failed.");

      const items = extractJsonArray(data?.content || "");
      const normalized = template.structure.map((b, idx) => {
        const candidate = items[idx] || {};
        return {
          ...b,
          content: String(candidate.content || b.content || "")
        };
      });

      setAiPreviewBlocks(normalized);
    } catch (err) {
      setAiPreviewError(err?.message || "Preview generation failed.");
    } finally {
      setAiPreviewLoading(false);
    }
  };

  const handleRewriteBlock = async (blockId) => {
    if (aiPreviewBlocks.length === 0) {
      setAiPreviewError("Generate a full AI preview before rewriting a single section.");
      return;
    }

    const template = getTemplateById(selectedTemplateId);
    if (!template) {
      setAiPreviewError("Select a template to rewrite a section.");
      return;
    }

    const block = template.structure.find((b) => String(b.id) === String(blockId));
    if (!block) return;

    const cfg = blockSettings.find((b) => String(b.id) === String(blockId)) || getDefaultBlockSetting(block);
    if (cfg.mode !== "ai") {
      setAiPreviewError("This section is set to manual. Switch to AI to rewrite.");
      return;
    }

    const currentContent = aiPreviewBlocks.find((b) => String(b.id) === String(blockId))?.content || block.content || "";

    setRewriteLoadingId(blockId);
    setAiPreviewError("");

    try {
      const prompt = buildSingleBlockPrompt(block, blockSettings, currentContent);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      if (!response.ok || data?.error) throw new Error(data?.error || "Section rewrite failed.");
      const nextContent = String(data?.content || "").replace(/```/g, "").trim();
      if (!nextContent) throw new Error("Section rewrite returned empty content.");

      setAiPreviewBlocks((prev) =>
        prev.map((item) => (String(item.id) === String(blockId) ? { ...item, content: nextContent } : item))
      );
    } catch (err) {
      setAiPreviewError(err?.message || "Section rewrite failed.");
    } finally {
      setRewriteLoadingId(null);
    }
  };

  useEffect(() => {
    if (!selectedTemplateId) return;
    const template = getTemplateById(selectedTemplateId);
    if (!template) return;
    const settings = template.structure.map((b) => getDefaultBlockSetting(b));
    setBlockSettings(settings);
  }, [selectedTemplateId]);

  useEffect(() => {
    if (!isOpen) return;
    setAiPreviewBlocks([]);
    setAiPreviewError("");
    setPreviewAutoRun(false);
  }, [selectedTemplateId]);

  useEffect(() => {
    if (!selectedTemplateId) return;
    if (getTemplateById(selectedTemplateId)) return;
    setSelectedTemplateId("");
    setBlockSettings([]);
    setAiPreviewBlocks([]);
    setPreviewAutoRun(false);
  }, [userTemplates]);

  useEffect(() => {
    if (!isOpen || step !== 3 || previewAutoRun || aiPreviewLoading) return;
    if (!getTemplateById(selectedTemplateId)) return;
    setPreviewAutoRun(true);
    handleGeneratePreview();
  }, [isOpen, step, previewAutoRun, aiPreviewLoading, selectedTemplateId]);

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

      const templateId = selectedTemplateId || "";
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
        HeroTitle: heroTitle,
        MetaTitle: metaTitle,
        MetaDescription: metaDescription,
        TemplateId: templateId,
        BlockSettings: blockSettings
      };

      const rawKeywords = keywordsList
        .split(/\n|,/)
        .map((k) => k.trim())
        .filter(Boolean);
      const requestedCount = Math.max(1, Number(desiredPageCount) || rawKeywords.length || 1);
      const allowedCount = remainingPages !== null ? Math.min(requestedCount, remainingPages) : requestedCount;
      const finalKeywords = rawKeywords.slice(0, allowedCount);

      if (!projectName.trim()) throw new Error("Please enter a project name.");
      if (!templateId) throw new Error("Please select a template first.");
      if (!getTemplateById(templateId)) throw new Error("Please select a template from your library.");
      if (remainingPages !== null && remainingPages <= 0) {
        throw new Error("You have no pages remaining on your current plan. Upgrade to generate more pages.");
      }
      if (remainingPages !== null && requestedCount > remainingPages) {
        throw new Error(`You can only create ${remainingPages} pages on your current plan. Reduce the count or upgrade.`);
      }
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
            const canContinue =
              step === 0
                ? !!getTemplateById(selectedTemplateId)
                : step === 1
                ? projectName.trim() && brandName.trim() && service.trim() && city.trim() && pageGoal.trim()
                : step === 2
                ? true
                : step === 3
                ? true
                : step === 4
                ? plannedKeywords.length > 0 && Number(desiredPageCount) > 0 && !overPlanLimit && (remainingPages === null || remainingPages > 0)
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
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-500">
                          Choose a template you have imported to define the page structure.
                        </p>
                        {!getTemplateById(selectedTemplateId) && (
                          <div className="mt-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg p-3 text-sm">
                            Pick a template to continue.
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenTemplateBuilder?.()}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#2B5E44]/20 text-[#2B5E44] bg-[#2B5E44]/10 hover:bg-[#2B5E44]/15"
                      >
                        + New Template
                      </button>
                    </div>

                    {userTemplates.length === 0 ? (
                      <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-lg p-4 text-sm space-y-3">
                        <p className="font-semibold">No imported templates found.</p>
                        <p>Create or import a template first, then come back to start your project.</p>
                        <button
                          type="button"
                          onClick={() => onOpenTemplateBuilder?.()}
                          className="px-4 py-2 text-xs font-bold rounded-lg bg-[#2B5E44] text-white hover:bg-[#244f3a]"
                        >
                          Create New Template
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userTemplates.map((t) => {
                          const isSelected = String(selectedTemplateId) === String(t.id);
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setSelectedTemplateId(String(t.id))}
                              className={`text-left p-4 rounded-2xl border transition-all ${
                                isSelected
                                  ? "border-[#2B5E44] bg-[#2B5E44]/10 shadow-lg"
                                  : "border-slate-200 hover:border-[#2B5E44]/40 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                              }`}
                            >
                              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">My Template</div>
                              <div className="text-base font-bold text-slate-900 dark:text-slate-100">{t.name}</div>
                              <div className="text-xs text-slate-500 mt-1">{(t.structure || []).length} sections</div>
                              <div className="mt-4 flex items-center justify-between">
                                <span className="text-xs text-slate-400">Click to select</span>
                                <span
                                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                                    isSelected
                                      ? "bg-[#2B5E44] text-white"
                                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                  }`}
                                >
                                  {isSelected ? "Selected" : "Select"}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
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
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#2B5E44]/10 via-[#5aa681]/20 to-transparent animate-pulse"></div>
                      <div className="relative z-10 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">AI Input Studio</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              Give the AI a strong brief once — it powers every section and every page.
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500">
                              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping"></span>
                            </span>
                            Signal: {aiInputsStatus}
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#2B5E44] via-[#3d7a5b] to-[#5aa681] transition-all duration-500"
                            style={{ width: `${aiInputsPercent}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Completion: {aiInputsPercent}% · More context = stronger first drafts.
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {["Be specific", "Use local intent", "Keep it punchy"].map((tip) => (
                            <span
                              key={tip}
                              className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {tip}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Primary keyword</label>
                        <p className="text-[11px] text-slate-500">
                          Use the exact phrase you want the page to rank for. This anchors the hero and meta.
                        </p>
                        <input
                          value={primaryKeyword}
                          onChange={(e) => setPrimaryKeyword(e.target.value)}
                          placeholder="plumber in austin"
                          className="w-full p-3 border rounded transition focus:ring-2 focus:ring-[#2B5E44]/25 focus:border-[#2B5E44] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Secondary keywords</label>
                        <p className="text-[11px] text-slate-500">
                          Optional variations or related services. Separate with commas.
                        </p>
                        <input
                          value={secondaryKeywords}
                          onChange={(e) => setSecondaryKeywords(e.target.value)}
                          placeholder="emergency plumber austin, water heater repair"
                          className="w-full p-3 border rounded transition focus:ring-2 focus:ring-[#2B5E44]/25 focus:border-[#2B5E44] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Value proposition</label>
                        <p className="text-[11px] text-slate-500">
                          One sentence on why you win. Think speed, trust, price, or results.
                        </p>
                        <textarea
                          value={valueProp}
                          onChange={(e) => setValueProp(e.target.value)}
                          placeholder="Same-day repairs, transparent pricing, and 1,200+ 5-star reviews."
                          className="w-full p-3 border rounded transition focus:ring-2 focus:ring-[#2B5E44]/25 focus:border-[#2B5E44] dark:bg-slate-700 dark:border-slate-600 dark:text-white min-h-[90px]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Audience</label>
                        <p className="text-[11px] text-slate-500">Who are we persuading? Be specific.</p>
                        <input
                          value={audience}
                          onChange={(e) => setAudience(e.target.value)}
                          placeholder="Homeowners and property managers in Austin"
                          className="w-full p-3 border rounded transition focus:ring-2 focus:ring-[#2B5E44]/25 focus:border-[#2B5E44] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Primary CTA</label>
                        <p className="text-[11px] text-slate-500">What action should they take right away?</p>
                        <input
                          value={cta}
                          onChange={(e) => setCta(e.target.value)}
                          placeholder="Book a same-day call"
                          className="w-full p-3 border rounded transition focus:ring-2 focus:ring-[#2B5E44]/25 focus:border-[#2B5E44] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Core services / offers</label>
                        <p className="text-[11px] text-slate-500">Comma-separated. These become feature bullets and section headers.</p>
                        <input
                          value={services}
                          onChange={(e) => setServices(e.target.value)}
                          placeholder="Emergency repair, drain cleaning, leak detection"
                          className="w-full p-3 border rounded transition focus:ring-2 focus:ring-[#2B5E44]/25 focus:border-[#2B5E44] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Pricing range (optional)</label>
                        <p className="text-[11px] text-slate-500">If you have a range, it boosts trust.</p>
                        <input
                          value={pricingRange}
                          onChange={(e) => setPricingRange(e.target.value)}
                          placeholder="$99-$499"
                          className="w-full p-3 border rounded transition focus:ring-2 focus:ring-[#2B5E44]/25 focus:border-[#2B5E44] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tone</label>
                        <p className="text-[11px] text-slate-500">Choose the voice that matches your brand.</p>
                        <select
                          value={tone}
                          onChange={(e) => setTone(e.target.value)}
                          className="w-full p-3 border rounded transition focus:ring-2 focus:ring-[#2B5E44]/25 focus:border-[#2B5E44] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
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
                        <p className="text-[11px] text-slate-500">We’ll draft content in this language.</p>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full p-3 border rounded transition focus:ring-2 focus:ring-[#2B5E44]/25 focus:border-[#2B5E44] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
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
                        <p className="text-[11px] text-slate-500">Add URLs you want referenced, separated by commas.</p>
                        <input
                          value={internalLinks}
                          onChange={(e) => setInternalLinks(e.target.value)}
                          placeholder="/services, /about, /contact"
                          className="w-full p-3 border rounded transition focus:ring-2 focus:ring-[#2B5E44]/25 focus:border-[#2B5E44] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          Extra AI instructions (optional)
                        </label>
                        <p className="text-[11px] text-slate-500">
                          Give the AI guardrails: what to highlight, avoid, or emphasize.
                        </p>
                        <textarea
                          value={additionalAiContext}
                          onChange={(e) => setAdditionalAiContext(e.target.value)}
                          placeholder="Mention certifications/licensing, include warranties, avoid competitor mentions."
                          className="w-full min-h-[120px] p-3 border rounded transition focus:ring-2 focus:ring-[#2B5E44]/25 focus:border-[#2B5E44] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Mention certifications/licensing and years in business.",
                            "Prioritize fast response time and 24/7 availability.",
                            "Keep paragraphs short; use bullets where possible.",
                            "Avoid competitor names and negative comparisons.",
                            "Focus on trust, warranties, and guarantees."
                          ].map((hint) => (
                            <button
                              key={hint}
                              type="button"
                              onClick={() =>
                                setAdditionalAiContext((prev) => (prev ? `${prev}\n${hint}` : hint))
                              }
                              className="px-2.5 py-1 text-[11px] font-semibold rounded-full border border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                              + {hint}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500">
                          AI writes all sections by default. You can still rewrite any specific section in the preview.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500">
                      Finalize the page structure before you add keywords and launch generation. This preview shows the layout your first draft will use.
                    </p>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Confirm key SEO fields</h4>
                        <p className="text-xs text-slate-500">
                          We lock these into the AI draft. Leave blank to let the AI choose.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Hero title</label>
                          <input
                            value={heroTitle}
                            onChange={(e) => setHeroTitle(e.target.value)}
                            placeholder={`${service || "Your Service"} in ${city || "Your City"}`}
                            className="w-full p-3 border rounded transition focus:ring-2 focus:ring-[#2B5E44]/25 focus:border-[#2B5E44] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Meta title</label>
                          <input
                            value={metaTitle}
                            onChange={(e) => setMetaTitle(e.target.value)}
                            placeholder={`${service || "Service"} in ${city || "City"} | ${brandName || "Your Brand"}`}
                            className="w-full p-3 border rounded transition focus:ring-2 focus:ring-[#2B5E44]/25 focus:border-[#2B5E44] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Meta description</label>
                          <textarea
                            value={metaDescription}
                            onChange={(e) => setMetaDescription(e.target.value)}
                            placeholder="Short summary used for search snippets and previews."
                            className="w-full min-h-[90px] p-3 border rounded transition focus:ring-2 focus:ring-[#2B5E44]/25 focus:border-[#2B5E44] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Review</h4>
                      <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                        <div>Template: {getTemplateById(selectedTemplateId)?.name || "Not selected"}</div>
                        <div>Project: {projectName || "Untitled project"}</div>
                        <div>Goal: {pageGoal}</div>
                        <div>Location: {city || "Not set"}</div>
                        <div>Desired pages: {Math.max(1, Number(desiredPageCount) || 1)}</div>
                        <div>Planned pages: {pageCount > 0 ? pageCount : "Set in the next step"}</div>
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
                            <h6 className="mt-2 text-2xl font-bold leading-tight">
                              {heroTitle || `${service || "Your Service"} in ${city || "Your City"}`}
                            </h6>
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
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">AI First Draft Preview</h5>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                              Based on current inputs
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            A lightweight AI draft using your inputs and template structure. Regenerate after edits.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleGeneratePreview}
                          disabled={aiPreviewLoading || !getTemplateById(selectedTemplateId)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#2B5E44] text-white hover:bg-[#234d37] disabled:opacity-60"
                        >
                          {aiPreviewLoading
                            ? "Generating..."
                            : aiPreviewBlocks.length > 0
                            ? "Regenerate"
                            : "Generate Preview"}
                        </button>
                      </div>
                      {aiPreviewError && (
                        <div className="mb-2 text-xs text-amber-600">{aiPreviewError}</div>
                      )}
                      <div className="mt-3 max-h-[520px] overflow-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
                        {aiPreviewLoading ? (
                          <div className="text-sm text-slate-500">Generating preview...</div>
                        ) : (
                          <LivePreview blocks={aiPreviewBlocks} mode="page" />
                        )}
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
                                <div className="mt-4 flex items-center justify-between gap-3">
                                  <div className="text-[11px] text-slate-500">
                                    {aiPreviewBlocks.length === 0
                                      ? "Generate the full preview to rewrite a single section."
                                      : cfg.mode === "ai"
                                      ? "Rewrite just this section with AI."
                                      : "Switch to AI mode to rewrite this section."}
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleRewriteBlock(block.id)}
                                      disabled={
                                        aiPreviewBlocks.length === 0 ||
                                        cfg.mode !== "ai" ||
                                        rewriteLoadingId === block.id ||
                                        aiPreviewLoading
                                      }
                                      className="px-3 py-2 text-sm font-semibold rounded-lg bg-[#2B5E44] text-white hover:bg-[#234d37] disabled:opacity-60"
                                    >
                                      {rewriteLoadingId === block.id ? "Rewriting..." : "Rewrite Section"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingPreviewBlock(null)}
                                      className="px-3 py-2 text-sm text-slate-600"
                                    >
                                      Close
                                    </button>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-slate-500">
                      AI drafts everything by default. Use the pencil icon to refine or rewrite a single section before you generate pages.
                    </p>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <p className="text-sm text-slate-500">
                      Add the keywords or locations you want to generate pages for, then choose how many pages to create.
                    </p>

                    {remainingPages !== null && (
                      <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase font-bold text-slate-400">Plan Credits</p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                              {remainingPages} pages remaining this month
                            </p>
                          </div>
                          <span className="text-[11px] text-slate-500">Credits reset monthly</span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">How many pages?</label>
                        <input
                          type="number"
                          min={1}
                          max={remainingPages !== null ? Math.max(1, remainingPages) : undefined}
                          value={desiredPageCount}
                          onChange={(e) => setDesiredPageCount(e.target.value)}
                          placeholder="10"
                          disabled={remainingPages !== null && remainingPages <= 0}
                          className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white disabled:opacity-60"
                        />
                        {remainingPages !== null && remainingPages <= 0 && (
                          <p className="text-xs text-amber-600">You have no pages remaining on your current plan.</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Planned output</label>
                        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-sm text-slate-600 dark:text-slate-300">
                          <div>Keywords/locations: {plannedKeywords.length}</div>
                          <div>Planned pages: {pageCount}</div>
                        </div>
                        {remainingPages !== null && Number(desiredPageCount) > remainingPages && (
                          <p className="text-xs text-red-600">
                            Your plan allows {remainingPages} pages this month. Reduce the count or upgrade.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Keywords / locations for bulk generation
                      </label>
                      <textarea
                        value={keywordsList}
                        onChange={(e) => setKeywordsList(e.target.value)}
                        placeholder="One keyword/location per line or comma-separated"
                        className="w-full min-h-[140px] p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
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

                <div className="pt-4 space-y-2">
                  <div className="relative overflow-hidden rounded-full border border-slate-200 dark:border-slate-700">
                    <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800"></div>
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#2B5E44] via-[#37795a] to-[#4d8f70] transition-all duration-500"
                      style={{ width: `${((step + 1) / stepLabels.length) * 100}%` }}
                    />
                    <div className="relative z-10 flex items-center justify-between gap-3 px-3 py-2">
                      <button
                        type="button"
                        onClick={() => setStep((s) => Math.max(0, s - 1))}
                        className="px-4 py-2 text-sm font-semibold rounded-full border border-white/30 text-white bg-white/10 hover:bg-white/20 disabled:opacity-50"
                        disabled={step === 0}
                      >
                        Back
                      </button>
                      <div className="text-xs font-semibold text-white/90">
                        Step {step + 1} of {stepLabels.length}
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep((s) => Math.min(lastStep, s + 1))}
                        className="px-5 py-2 text-sm font-bold rounded-full text-[#2B5E44] bg-white hover:bg-white/90 shadow-lg disabled:opacity-60"
                        disabled={!canContinue || step === lastStep}
                        title={!canContinue ? "Complete required fields to continue" : ""}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 text-center">You can go back and edit anytime.</div>
                </div>
              </>
            );
          })()}
        </div>
        <div className="p-6 border-t dark:border-slate-700 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400">
            Create Project saves your draft, builds the page list, and opens the generator for the first AI draft.
          </p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-slate-500">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={uploading || !canSubmit}
              className="px-4 py-2 bg-[#2B5E44] text-white rounded hover:bg-[#234d37] font-medium disabled:opacity-60"
              title={!canSubmit ? "Finish the steps to create the project" : ""}
            >
              {uploading ? <Loader2 className="animate-spin" /> : initialData ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProjectModal;
// --- 7. View Data Modal (With Inspector & Export) ---
