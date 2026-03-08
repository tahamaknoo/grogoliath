"use client";

import React, { useEffect, useRef, useState } from "react";
import { Edit3, Globe, LayoutTemplate, Loader2, Wand2, X } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import LivePreview from "../builder/LivePreview";

const NewProjectModal = ({ isOpen, onClose, onUploadSuccess, onCreateProject, onOpenTemplateBuilder, initialData, initialTemplateId, profile }) => {
  const [uploading, setUploading] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [progressMinimized, setProgressMinimized] = useState(false);
  const [userTemplates, setUserTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateSource, setTemplateSource] = useState("library");
  const [siteUrl, setSiteUrl] = useState("");
  const [siteAnalysisLoading, setSiteAnalysisLoading] = useState(false);
  const [siteAnalysisError, setSiteAnalysisError] = useState("");
  const [siteAnalysisSuccess, setSiteAnalysisSuccess] = useState("");
  const [formError, setFormError] = useState("");
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
  const [aiPreviewBlocks, setAiPreviewBlocks] = useState([]);
  const [aiPreviewLoading, setAiPreviewLoading] = useState(false);
  const [aiPreviewError, setAiPreviewError] = useState("");
  const [previewAutoRun, setPreviewAutoRun] = useState(false);
  const [rewriteLoadingId, setRewriteLoadingId] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const contentRef = useRef(null);
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
  const activeTemplate = getTemplateById(selectedTemplateId);
  const templateStructure = activeTemplate?.structure || [];
  const labelClass = "text-sm font-semibold text-slate-700 dark:text-slate-200";
  const helperClass = "text-xs text-slate-500 dark:text-slate-400";
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition dark:bg-slate-800 dark:border-slate-700 dark:text-white";
  const textareaClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition dark:bg-slate-800 dark:border-slate-700 dark:text-white";
  const selectClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition dark:bg-slate-800 dark:border-slate-700 dark:text-white";
  const progressSteps = [
    { label: "Validating inputs", at: 10 },
    { label: "Building page list", at: 40 },
    { label: "Saving project", at: 70 },
    { label: "Finalizing", at: 100 }
  ];
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
    if (!isOpen) return;
    if (!contentRef.current) return;
    setFormError("");
    requestAnimationFrame(() => {
      contentRef.current?.scrollTo({ top: 0, behavior: "auto" });
    });
  }, [step, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setProgressPercent(0);
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
        const savedUrl = details.SourceUrl || "";
        setTemplateSource(savedUrl ? "url" : details.TemplateSource || "library");
        setSiteUrl(savedUrl);
        setSiteAnalysisError("");
        setSiteAnalysisSuccess("");
        setFormError("");
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
        setTemplateSource("library");
        setSiteUrl("");
        setSiteAnalysisError("");
        setSiteAnalysisSuccess("");
        setFormError("");
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
      columns_n: 160,
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
      "columns_n",
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

  const normalizeSiteUrl = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return "";
    if (/^https-:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const buildFallbackStructure = () => [
    {
      id: Date.now() + Math.random(),
      type: "hero",
      category: "basic",
      content: "Hero for {{Service}} in {{City}} with a clear outcome and 2 CTAs."
    },
    {
      id: Date.now() + Math.random(),
      type: "header",
      category: "basic",
      content: "Why {{Service}} matters in {{City}}"
    },
    {
      id: Date.now() + Math.random(),
      type: "text",
      category: "basic",
      content: "Explain the core benefit and why people should care."
    },
    {
      id: Date.now() + Math.random(),
      type: "pain_point",
      category: "marketing",
      content: "List 3 pain points your audience faces."
    },
    {
      id: Date.now() + Math.random(),
      type: "solution",
      category: "marketing",
      content: "Describe how your service solves those pain points."
    },
    {
      id: Date.now() + Math.random(),
      type: "usp",
      category: "marketing",
      content: "List 3-5 unique selling points."
    },
    {
      id: Date.now() + Math.random(),
      type: "social_proof",
      category: "premium",
      content: "Add 2-3 short testimonials."
    },
    {
      id: Date.now() + Math.random(),
      type: "faq_auto",
      category: "seo",
      content: "Generate 5 FAQs about {{Service}} in {{City}}."
    },
    {
      id: Date.now() + Math.random(),
      type: "cta",
      category: "marketing",
      content: "CTA band with one clear action."
    }
  ];

  const handleAnalyzeSite = async () => {
    const normalizedUrl = normalizeSiteUrl(siteUrl);
    if (!normalizedUrl) {
      setSiteAnalysisError("Enter a valid website URL to analyze.");
      return;
    }

    setSiteAnalysisLoading(true);
    setSiteAnalysisError("");
    setSiteAnalysisSuccess("");
    setFormError("");

    try {
      const response = await fetch("/api/analyze-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl })
      });
      const data = await response.json();
      if (!response.ok || data?.error) throw new Error(data?.error || "Site analysis failed.");

      let parsedBlocks = [];
      try {
        parsedBlocks = extractJsonArray(data?.content || "");
      } catch {
        parsedBlocks = [];
      }

      const sanitized = (Array.isArray(parsedBlocks) ? parsedBlocks : [])
        .filter((b) => b?.type)
        .map((b) => ({
          id: Date.now() + Math.random(),
          type: b.type,
          category: b.category || "basic",
          content: b.content || "",
          ...(b.type === "columns_n" ? { columns: Math.min(6, Math.max(2, parseInt(b.columns || 3, 10))) } : {}),
          ...(b.type === "columns_2" ? { columns: 2 } : {}),
          ...(b.type === "image" ? { imageUrl: "", imageCaption: "" } : {})
        }));

      const finalStructure = sanitized.length > 0 ? sanitized : buildFallbackStructure();

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to analyze a site.");

      const hostname = (() => {
        try {
          return new URL(normalizedUrl).hostname.replace(/^www\./, "");
        } catch {
          return "website";
        }
      })();
      const templateName = `AI: ${hostname} landing template`;

      const { data: newTemplate, error } = await supabase
        .from("templates")
        .insert({ user_id: user.id, name: templateName, structure: finalStructure })
        .select("*")
        .single();

      if (error) throw new Error(error.message || "Failed to save the AI template.");

      setUserTemplates((prev) => [newTemplate, ...prev]);
      setSelectedTemplateId(String(newTemplate.id));
      setBlockSettings(finalStructure.map((b) => getDefaultBlockSetting(b)));
      setSiteAnalysisSuccess(`Template generated from ${hostname}. You can continue.`);
    } catch (err) {
      setSiteAnalysisError(err?.message || "Site analysis failed.");
    } finally {
      setSiteAnalysisLoading(false);
    }
  };

  const validateInputs = () => {
    if (!projectName.trim()) return "Add a project name to keep your pages organized.";
    if (!selectedTemplateId) return "Select a template (or analyze a website URL) first.";
    if (!getTemplateById(selectedTemplateId)) return "Select a template from your library.";
    if (!brandName.trim()) return "Add your brand name so we can personalize the copy.";
    if (!service.trim()) return "Add a primary service so the AI knows what to write.";
    if (!city.trim()) return "Add a target city/location for local intent.";
    if (!pageGoal.trim()) return "Choose a page goal so the CTA matches.";
    if (remainingPages !== null && remainingPages <= 0) {
      return "You have no pages remaining on your current plan.";
    }
    const rawKeywords = keywordsList
      .split(/\n|,/)
      .map((k) => k.trim())
      .filter(Boolean);
    if (step === lastStep && rawKeywords.length === 0) {
      return "Add at least one keyword/location to generate pages.";
    }
    return "";
  };

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
      `Additional notes: ${additionalAiContext || "N/A"}`
    ].join("\n");

    const blockLines = template.structure
      .map((b, idx) => {
        const s = settings.find((x) => String(x.id) === String(b.id)) || getDefaultBlockSetting(b);
        const note = String(s.notes || "").trim();
        const imageGuidance = b.type === "image"
          ? ` Image URL: ${b.imageUrl || "none"}. Caption: ${b.imageCaption || "none"}. If the URL contains a {{Variable}}, replace it from row data. If no URL is provided, use a visual placeholder.`
          : "";
        if (s.mode === "manual") {
          return `${idx + 1}. [${b.type}] Manual. Use this placeholder verbatim: ${b.content}${imageGuidance}${
            note ? ` Editor note: ${note}` : ""
          }`;
        }
        return `${idx + 1}. [${b.type}] ${b.content}${imageGuidance} Target length: ~${s.words} words.${
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
? Keep this a ${block.type} section.
? Improve clarity, conversion, and SEO without keyword stuffing.
? Return ONLY the rewritten section text (no JSON, no markdown).
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
      const fallback = template?.structure?.map((b) => ({
        ...b,
        content: String(b.content || "")
      }));
      if (fallback?.length) setAiPreviewBlocks(fallback);
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
  if (uploading && progressMinimized) {
    return (
      <button
        type="button"
        onClick={() => setProgressMinimized(false)}
        className="fixed bottom-4 right-4 z-[120] bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg hover:bg-slate-800"
      >
        Project creation running... {progressPercent}% - tap to view
      </button>
    );
  }

  const handleSave = async () => {
    setFormError("");
    const validationError = validateInputs();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setUploading(true);
    setProgressMinimized(false);
    setProgressMessage("Validating inputs...");
    setProgressPercent(10);

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
        TemplateId: templateId,
        BlockSettings: blockSettings,
        TemplateSource: templateSource,
        SourceUrl: templateSource === "url" ? normalizeSiteUrl(siteUrl) : ""
      };

      const rawKeywords = keywordsList
        .split(/\n|,/)
        .map((k) => k.trim())
        .filter(Boolean);
      const requestedCount = Math.max(1, Number(desiredPageCount) || rawKeywords.length || 1);
      const allowedCount = remainingPages !== null ? Math.min(requestedCount, remainingPages) : requestedCount;
      const finalKeywords = rawKeywords.slice(0, allowedCount);

      if (remainingPages !== null && requestedCount > remainingPages) {
        throw new Error(`You can only create ${remainingPages} pages on your current plan. Reduce the count or upgrade.`);
      }
      if (finalKeywords.length === 0) throw new Error("Please add at least one keyword (plan or list).");

      setProgressMessage("Building your pages list...");
      setProgressPercent(40);

      const rows = finalKeywords.map((k) => ({
        Keyword: k,
        ...details
      }));
      const headers = Object.keys(rows[0] || {});
      const payload = { rows, headers, details };

      setProgressMessage(initialData ? "Updating your project..." : "Creating your project...");
      setProgressPercent(70);

      if (initialData) {
        const { error } = await supabase
          .from("projects")
          .update({ name: projectName, row_count: rows.length, data: payload })
          .eq("id", initialData.id);
        if (error) throw new Error(error.message || "Failed to update project.");
        setProgressPercent(100);
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
      setProgressPercent(100);
      onUploadSuccess();
      if (data) onCreateProject?.(data, templateId);
      onClose();
    } catch (err) {
      setFormError(err?.message || "Something went wrong creating the project.");
    } finally {
      setUploading(false);
      setProgressMessage("");
      setProgressPercent(0);
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
                <div
                  className="h-full bg-[#2B5E44] transition-all duration-300"
                  style={{ width: `${Math.max(2, progressPercent)}%` }}
                />
              </div>
              <div className="text-xs text-slate-500 mb-2">{progressPercent}% complete</div>
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {progressSteps.map((stepItem) => (
                  <div key={stepItem.label} className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        progressPercent >= stepItem.at ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    />
                    <span className={progressPercent >= stepItem.at ? "font-semibold" : ""}>{stepItem.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="font-semibold text-slate-700 dark:text-slate-200">Status feed</div>
                <div className="mt-1">{progressMessage || "Working..."}</div>
                <div className="mt-1 text-[11px] text-slate-400">
                  Project: {projectName || "Untitled"} ? Planned pages: {Math.max(1, Number(desiredPageCount) || 1)}
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">You can keep working while we finish this.</p>
            </div>
          </div>
        )}
        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-bold dark:text-white">{initialData ? "Edit Project" : "New Project"}</h3>
          <button onClick={onClose}>
            <X className="text-slate-400" />
          </button>
        </div>

        <div ref={contentRef} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
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
                  <div className="grid grid-cols-5 gap-2 text-[11px] font-semibold text-slate-500">
                    {stepLabels.map((label, i) => (
                      <div key={label} className="flex items-center gap-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                            step >= i
                              ? "bg-[#2B5E44] text-white"
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
                {formError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {formError}
                  </div>
                )}

                {step === 0 && (
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-500">
                          Choose a template from your library or let AI derive one from your website.
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

                    <div className="grid gap-3 md:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setTemplateSource("library")}
                        className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                          templateSource === "library"
                            ? "border-emerald-400 bg-emerald-50"
                            : "border-slate-200 hover:border-emerald-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span
                          className={`mt-1 flex h-9 w-9 items-center justify-center rounded-xl ${
                            templateSource === "library" ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <LayoutTemplate size={18} />
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Use a template</div>
                          <div className={helperClass}>Pick from your saved templates.</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTemplateSource("url")}
                        className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                          templateSource === "url"
                            ? "border-emerald-400 bg-emerald-50"
                            : "border-slate-200 hover:border-emerald-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span
                          className={`mt-1 flex h-9 w-9 items-center justify-center rounded-xl ${
                            templateSource === "url" ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Globe size={18} />
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Analyze website URL</div>
                          <div className={helperClass}>AI builds a landing template from your site.</div>
                        </div>
                      </button>
                    </div>

                    {templateSource === "url" && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 dark:bg-slate-900 dark:border-slate-700">
                        <div className="space-y-1.5">
                          <label className={labelClass}>Website URL</label>
                          <p className={helperClass}>We scan the page to build the structure.</p>
                          <input
                            value={siteUrl}
                            onChange={(e) => setSiteUrl(e.target.value)}
                            placeholder="https://example.com"
                            className={inputClass}
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={handleAnalyzeSite}
                            disabled={siteAnalysisLoading}
                            className="px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 flex items-center gap-2"
                          >
                            {siteAnalysisLoading ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                            Analyze & create template
                          </button>
                          <span className="text-xs text-slate-500">Usually takes 10-20 seconds.</span>
                        </div>
                        {siteAnalysisError && (
                          <div className="text-xs text-rose-600">{siteAnalysisError}</div>
                        )}
                        {siteAnalysisSuccess && (
                          <div className="text-xs text-emerald-700">{siteAnalysisSuccess}</div>
                        )}
                      </div>
                    )}

                    {templateSource === "library" && (
                      <>
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
                                      ? "border-emerald-400 bg-emerald-50"
                                      : "border-slate-200 hover:border-emerald-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                                  }`}
                                >
                                  <div className="text-xs font-semibold text-slate-500 mb-2">Template</div>
                                  <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{t.name}</div>
                                  <div className="text-xs text-slate-500 mt-1">{(t.structure || []).length} sections</div>
                                  <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs text-slate-400">Click to select</span>
                                    <span
                                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                                        isSelected
                                          ? "bg-emerald-500 text-white"
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
                      </>
                    )}
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <p className="text-sm text-slate-500">
                      Add only the essentials. Each answer powers every page we generate.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className={labelClass}>Project name</label>
                        <p className={helperClass}>Internal label to organize this batch of pages.</p>
                        <input
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          placeholder="Austin Plumbing Local SEO"
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Brand name</label>
                        <p className={helperClass}>
                          Used in copy wherever {"{{Brand}}"} appears.
                        </p>
                        <input
                          value={brandName}
                          onChange={(e) => setBrandName(e.target.value)}
                          placeholder="Your brand"
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Primary service</label>
                        <p className={helperClass}>Defines the main offer for every page.</p>
                        <input
                          value={service}
                          onChange={(e) => setService(e.target.value)}
                          placeholder="Emergency plumbing"
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Target city / location</label>
                        <p className={helperClass}>Powers local intent and city placeholders.</p>
                        <input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Austin, TX"
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Primary goal</label>
                        <select
                          value={pageGoal}
                          onChange={(e) => setPageGoal(e.target.value)}
                          className={selectClass}
                        >
                          {["Leads", "Sales", "Awareness", "Bookings", "Authority"].map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                        <p className={helperClass}>Guides tone and CTA selection.</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Business summary (optional)</label>
                      <p className={helperClass}>One or two sentences to guide the AI.</p>
                      <textarea
                        value={businessDescription}
                        onChange={(e) => setBusinessDescription(e.target.value)}
                        placeholder="What you do, who you serve, and what makes you different."
                        className={`${textareaClass} min-h-[110px]`}
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
                              Give the AI a strong brief once - it powers every section and every page.
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
                        <div className={helperClass}>
                          Completion: {aiInputsPercent}% ? more context equals stronger first drafts.
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
                        <label className={labelClass}>Primary keyword</label>
                        <p className={helperClass}>
                          Use the exact phrase you want the page to rank for. This anchors the hero and meta.
                        </p>
                        <input
                          value={primaryKeyword}
                          onChange={(e) => setPrimaryKeyword(e.target.value)}
                          placeholder="plumber in austin"
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={labelClass}>Secondary keywords</label>
                        <p className={helperClass}>
                          Optional variations or related services. Separate with commas.
                        </p>
                        <input
                          value={secondaryKeywords}
                          onChange={(e) => setSecondaryKeywords(e.target.value)}
                          placeholder="emergency plumber austin, water heater repair"
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={labelClass}>Value proposition</label>
                        <p className={helperClass}>
                          One sentence on why you win. Think speed, trust, price, or results.
                        </p>
                        <textarea
                          value={valueProp}
                          onChange={(e) => setValueProp(e.target.value)}
                          placeholder="Same-day repairs, transparent pricing, and 1,200+ 5-star reviews."
                          className={`${textareaClass} min-h-[100px]`}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={labelClass}>Audience</label>
                        <p className={helperClass}>Who are we persuading- Be specific.</p>
                        <input
                          value={audience}
                          onChange={(e) => setAudience(e.target.value)}
                          placeholder="Homeowners and property managers in Austin"
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={labelClass}>Primary CTA</label>
                        <p className={helperClass}>What action should they take right away-</p>
                        <input
                          value={cta}
                          onChange={(e) => setCta(e.target.value)}
                          placeholder="Book a same-day call"
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={labelClass}>Core services / offers</label>
                        <p className={helperClass}>Comma-separated. These become feature bullets and section headers.</p>
                        <input
                          value={services}
                          onChange={(e) => setServices(e.target.value)}
                          placeholder="Emergency repair, drain cleaning, leak detection"
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={labelClass}>Pricing range (optional)</label>
                        <p className={helperClass}>If you have a range, it boosts trust.</p>
                        <input
                          value={pricingRange}
                          onChange={(e) => setPricingRange(e.target.value)}
                          placeholder="$99-$499"
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={labelClass}>Tone</label>
                        <p className={helperClass}>Choose the voice that matches your brand.</p>
                        <select
                          value={tone}
                          onChange={(e) => setTone(e.target.value)}
                          className={selectClass}
                        >
                          {["Professional", "Friendly", "Luxury", "Minimal", "Bold"].map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className={labelClass}>Language</label>
                        <p className={helperClass}>We'll draft content in this language.</p>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className={selectClass}
                        >
                          {["English", "Spanish", "French", "German", "Portuguese", "Italian", "Dutch"].map((l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className={labelClass}>Internal links (optional)</label>
                        <p className={helperClass}>Add URLs you want referenced, separated by commas.</p>
                        <input
                          value={internalLinks}
                          onChange={(e) => setInternalLinks(e.target.value)}
                          placeholder="/services, /about, /contact"
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className={labelClass}>
                          Extra AI instructions (optional)
                        </label>
                        <p className={helperClass}>
                          Give the AI guardrails: what to highlight, avoid, or emphasize.
                        </p>
                        <textarea
                          value={additionalAiContext}
                          onChange={(e) => setAdditionalAiContext(e.target.value)}
                          placeholder="Mention certifications/licensing, include warranties, avoid competitor mentions."
                          className={`${textareaClass} min-h-[120px]`}
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
                        <p className={helperClass}>
                          AI drafts every section by default. Switch any block to manual in Preview.
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
                    <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Review</h4>
                      <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                        <div>Template: {activeTemplate?.name || "Not selected"}</div>
                        <div>Project: {projectName || "Untitled project"}</div>
                        <div>Goal: {pageGoal}</div>
                        <div>Location: {city || "Not set"}</div>
                        <div>Desired pages: {Math.max(1, Number(desiredPageCount) || 1)}</div>
                        <div>Planned pages: {pageCount > 0 ? pageCount : "Set in the next step"}</div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">Structure Preview</h5>
                          <p className={helperClass}>This is the layout your pages will follow.</p>
                        </div>
                        <span className="text-xs text-slate-500">
                          {templateStructure.length} sections
                        </span>
                      </div>
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-950 p-3">
                        {templateStructure.length === 0 ? (
                          <div className="text-sm text-slate-500">Select a template to see the structure preview.</div>
                        ) : (
                          <LivePreview blocks={templateStructure} mode="template" />
                        )}
                      </div>
                    </div>
                    {templateStructure.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">Section Controls</h5>
                            <p className={helperClass}>Decide what AI writes vs what you will write.</p>
                          </div>
                          <span className="text-xs text-slate-500">{templateStructure.length} sections</span>
                        </div>
                        <div className="space-y-2">
                          {templateStructure.map((block, idx) => {
                            const cfg = blockSettings.find((b) => b.id === block.id) || getDefaultBlockSetting(block);
                            return (
                              <div
                                key={block.id}
                                className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
                              >
                                <div>
                                  <div className="font-semibold text-slate-700 dark:text-slate-200">
                                    {idx + 1}. {block.type.replaceAll("_", " ")}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {cfg.mode === "ai" ? `AI draft ~${cfg.words} words` : "Manual section"}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setEditingPreviewBlock({ id: block.id, type: block.type })}
                                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300"
                                >
                                  Edit
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
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
                        ) : aiPreviewBlocks.length === 0 ? (
                          <div className="text-sm text-slate-500">Generate the preview to see the AI draft.</div>
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
                                  <div className="grid grid-cols-2 gap-2">
                                    <button
                                      type="button"
                                      onClick={() => updateBlockSettingById(block.id, { mode: "ai" })}
                                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                                        cfg.mode === "ai"
                                          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                                      }`}
                                    >
                                      AI writes this
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateBlockSettingById(block.id, { mode: "manual" })}
                                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                                        cfg.mode === "manual"
                                          ? "border-slate-900 bg-slate-900 text-white"
                                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                                      }`}
                                    >
                                      I will write this
                                    </button>
                                  </div>
                                  <p className={helperClass}>
                                    AI drafts copy from your inputs. Manual keeps your wording.
                                  </p>
                                  {cfg.mode === "ai" && (
                                    <input
                                      type="number"
                                      min={50}
                                      max={800}
                                      value={cfg.words}
                                      onChange={(e) => updateBlockSettingById(block.id, { words: Number(e.target.value) })}
                                      className={inputClass}
                                      placeholder="Word count"
                                    />
                                  )}
                                  <textarea
                                    value={cfg.notes || ""}
                                    onChange={(e) => updateBlockSettingById(block.id, { notes: e.target.value })}
                                    className={`${textareaClass} min-h-[110px]`}
                                    placeholder="Optional note for AI (add/remove points, constraints, style)"
                                  />
                                </div>
                                <div className="mt-4 flex items-center justify-between gap-3">
                                  <div className={helperClass}>
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
                    <p className={helperClass}>
                      AI drafts everything by default. Use the pencil icon to refine or rewrite a single section.
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
                          <span className={helperClass}>Credits reset monthly</span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className={labelClass}>How many pages-</label>
                        <input
                          type="number"
                          min={1}
                          max={remainingPages !== null ? Math.max(1, remainingPages) : undefined}
                          value={desiredPageCount}
                          onChange={(e) => setDesiredPageCount(e.target.value)}
                          placeholder="10"
                          disabled={remainingPages !== null && remainingPages <= 0}
                          className={`${inputClass} disabled:opacity-60`}
                        />
                        {remainingPages !== null && remainingPages <= 0 && (
                          <p className="text-xs text-amber-600">You have no pages remaining on your current plan.</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Planned output</label>
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
                      <label className={labelClass}>
                        Keywords / locations for bulk generation
                      </label>
                      <textarea
                        value={keywordsList}
                        onChange={(e) => setKeywordsList(e.target.value)}
                        placeholder="One keyword/location per line or comma-separated"
                        className={`${textareaClass} min-h-[160px]`}
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
            Create Project saves your draft and prepares it for generation. Start generating anytime from Projects.
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
