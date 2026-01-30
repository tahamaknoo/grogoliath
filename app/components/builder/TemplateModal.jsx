// --- 4. Template Builder Modal ---
"use client";
import LivePreview from "./LivePreview";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Search,
  ArrowUp, ArrowDown, Trash2, Type, FileCode, Award,
  Layers, AlignLeft, Image as ImageIcon, Code, AlertCircle,
  CheckCircle2, DollarSign, Megaphone, HelpCircle, TrendingUp,
  Scale, ThumbsUp, Users, Workflow, Briefcase, FormInput,
  ShieldCheck, Zap, X, LayoutTemplate
} from "lucide-react";

const TemplateModal = ({
  isOpen,
  onClose,
  onSaveSuccess,
  initialData,
  mode = "edit",
  profile
}) => {
  const isPro = profile?.plan === "pro";

  const [blocks, setBlocks] = useState([]);
  const [activeTab, setActiveTab] = useState("content");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);
  const [viewTab, setViewTab] = useState("edit");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [infoModal, setInfoModal] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentMode(mode);
      setViewTab(mode.startsWith("preview") ? "preview" : "edit");

      if (initialData) {
        const isPreset = initialData.id.toString().startsWith("preset");
        setName(initialData.name + (isPreset ? " (Clone)" : ""));
        setBlocks(initialData.structure || []);
      } else {
        setName("");
        setBlocks([]);
      }
    }
  }, [isOpen, initialData, mode]);

  if (!isOpen) return null;

  const isReadOnly = currentMode.startsWith("preview");

  // ✅ FIX: category is now passed in and stored correctly
  const addBlock = (type, category = "basic") => {
    if (isReadOnly) return;

    let content = "Content...";
    switch (type) {
      case "header": content = "H2: Guide to {{Keyword}}"; break;
      case "text": content = "Write 2 short paragraphs about {{Keyword}}. Keep it crisp and clear."; break;
      case "service_keyword": content = "{{Keyword}}"; break;
      case "image": content = "Image Description: {{Keyword}}"; break;
      case "html": content = '<div class="custom-block">...</div>'; break;
      case "columns_2": content = "Column 1 title: {{Keyword}} benefits || Column 2 title: Pricing & proof"; break;
      case "grid_2x2": content = "Row 1: Feature A || Feature B\nRow 2: Feature C || Feature D"; break;
      case "pain_point": content = "Identify 3 pain points for {{Keyword}}."; break;
      case "solution": content = "Explain how we solve {{Keyword}} issues."; break;
      case "usp": content = "List 5 USPs for {{Keyword}}."; break;
      case "pricing": content = "Create a 3-column HTML Pricing Table."; break;
      case "cta": content = "Sign up now for {{Keyword}} solutions."; break;
      case "schema_service": content = '{"@type": "Service", "name": "{{Keyword}}"}'; break;
      case "schema_blog": content = '{"@type": "BlogPosting", "headline": "Guide to {{Keyword}}"}'; break;
      case "faq_auto": content = "Generate 5 FAQs about {{Keyword}}."; break;
      case "stats": content = "Find 3 stats about {{Keyword}}."; break;
      case "hero": content = "Hero Title: Best {{Keyword}} Service"; break;
      case "comparison": content = "Compare Us vs Competitors for {{Keyword}}."; break;
      case "pros_cons": content = "List Pros and Cons for {{Keyword}}."; break;
      case "social_proof": content = "Generate a testimonial for {{Keyword}}."; break;
      case "process": content = "Create a 3-step process for {{Keyword}}."; break;
      case "case_study": content = "Write a mini case study for {{Keyword}}."; break;
      case "contact_form": content = "<!-- Contact Form Placeholder -->"; break;
      case "trust_badges": content = "[Trust Badges: Secure, Verified, Top Rated]"; break;
      default: break;
    }

    const newBlock = {
      id: Date.now() + Math.random(),
      type,
      category, // ✅ now correct
      content
    };

    setBlocks((prev) => [...prev, newBlock]);
  };

  const BLOCK_INFO = {
    header: "Creates a headline section. Good for titles like H2/H3 and section headers.",
    text: "Adds a paragraph-style content block. Best for explanations and body copy.",
    image: "Adds an image placeholder block. Use the content to describe the image.",
    html: "Lets you insert custom HTML for advanced layouts or embeds.",
    columns_2: "Creates a two-column layout. Use '||' to split content between columns.",
    grid_2x2: "Creates a 2x2 grid of items. Use new lines or '||' to separate items.",
    pain_point: "Highlights customer pain points. Great for problem-awareness sections.",
    solution: "Explains how you solve the pain points. Pairs well after Pain Point.",
    usp: "Unique selling points. Quick bullets or short statements.",
    pricing: "Pricing section scaffold. Use to outline tiers or ranges.",
    cta: "Call-to-action block with a strong prompt to take next step.",
    schema_service: "Hidden JSON-LD schema for Service pages (SEO).",
    schema_blog: "Hidden JSON-LD schema for Blog posts (SEO).",
    faq_auto: "FAQ section prompt. Useful for SEO and reducing questions.",
    stats: "Highlights measurable stats or proof points.",
    hero: "Top-of-page hero section with headline and CTAs.",
    comparison: "Comparison block vs alternatives or competitors.",
    pros_cons: "Lists pros and cons in two columns.",
    social_proof: "Testimonials or reviews section.",
    process: "Step-by-step process or timeline section.",
    case_study: "Mini case study or success story block.",
    contact_form: "Contact or booking form section placeholder.",
    trust_badges: "Trust/credibility badges row."
  };

  const updateBlock = (id, content) => {
    if (isReadOnly) return;
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  const removeBlock = (id) => {
    if (isReadOnly) return;
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBlock = (index, direction) => {
    if (isReadOnly) return;
    setBlocks((prev) => {
      const newBlocks = [...prev];
      if (direction === "up" && index > 0) {
        [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
      } else if (direction === "down" && index < newBlocks.length - 1) {
        [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      }
      return newBlocks;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("Please name your template.");
    if (blocks.length === 0) return alert("Please add at least one block.");

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    let error;
    if (
      initialData &&
      !initialData.id.toString().startsWith("preset") &&
      currentMode !== "create"
    ) {
      const { error: err } = await supabase
        .from("templates")
        .update({ name, structure: blocks })
        .eq("id", initialData.id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from("templates")
        .insert({ user_id: user.id, name, structure: blocks });
      error = err;
    }

    setSaving(false);
    if (error) alert(error.message);
    else {
      onSaveSuccess?.();
      onClose();
    }
  };

  const handleMagicBuild = async () => {
    if (!aiPrompt.trim()) return alert("Enter prompt");
    setAiLoading(true);
    try {
      const systemPrompt =
        `You are a JSON generator. Create a JSON structure for a website template based on this description: "${aiPrompt}". ` +
        `Return ONLY a JSON array of objects. Each object must have: "id" (number), "type" (string), "category" (string), and "content" (string). ` +
        `Allowed types: header, text, hero, pain_point, solution, usp, pricing, cta, schema_service, faq_auto, comparison, pros_cons, social_proof, process, case_study, contact_form, trust_badges, schema_blog, stats, html, image. ` +
        `Allowed categories: basic, marketing, seo, premium.`;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: systemPrompt })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const cleanJson = (data.content || "")
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const newBlocks = JSON.parse(cleanJson);

      const sanitizedBlocks = (Array.isArray(newBlocks) ? newBlocks : [])
        .filter((b) => b?.type)
        .map((b) => ({
          id: Date.now() + Math.random(),
          type: b.type,
          category: b.category || "basic",
          content: b.content || ""
        }));

      if (sanitizedBlocks.length > 0) setBlocks((prev) => [...prev, ...sanitizedBlocks]);
    } catch (e) {
      alert(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const renderBlockEditor = (block, index) => {
    if (!block || !block.type) return null;

    const isPremium = block.category === "premium";
    const locked = isPremium && !isPro;

    const needsTextArea = [
      "text", "pain_point", "solution", "usp", "pricing", "cta", "faq_auto",
      "stats", "hero", "comparison", "pros_cons", "social_proof", "process",
      "case_study", "schema_service", "schema_blog", "html", "image",
      "columns_2", "grid_2x2"
    ].includes(block.type);

    return (
      <div
        key={block.id}
        className={`group relative bg-white dark:bg-slate-800 p-4 rounded-xl border shadow-sm transition-all ${
          isPremium ? "border-amber-200 dark:border-amber-700/50" : "border-slate-200 dark:border-slate-700"
        }`}
      >
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-100">
          <div
            className={`text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
              isPremium ? "bg-amber-500" : "bg-indigo-600"
            }`}
          >
            {index + 1}
          </div>
        </div>

        {!isReadOnly && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <button
              onClick={() => moveBlock(index, "up")}
              disabled={index === 0}
              className="text-slate-300 hover:text-indigo-500 p-1 disabled:opacity-30"
            >
              <ArrowUp size={16} />
            </button>
            <button
              onClick={() => moveBlock(index, "down")}
              disabled={index === blocks.length - 1}
              className="text-slate-300 hover:text-indigo-500 p-1 disabled:opacity-30"
            >
              <ArrowDown size={16} />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1"></div>
            <button
              onClick={() => removeBlock(block.id)}
              className="text-slate-300 hover:text-red-500 p-1"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        <div
          className={`mb-2 text-xs font-bold uppercase flex items-center gap-2 ${
            isPremium ? "text-amber-600 dark:text-amber-400" : "text-indigo-500"
          }`}
        >
          {block.type === "header" && <Type size={12} />}
          {block.type.includes("schema") && <FileCode size={12} />}
          {block.category === "premium" && <Award size={12} />}
          {block.type.replace("_", " ")}
          {locked && (
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700">
              PRO
            </span>
          )}
        </div>

        {needsTextArea ? (
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, e.target.value)}
            disabled={isReadOnly}
            className={`w-full p-3 text-sm border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white resize-y ${
              isReadOnly ? "opacity-70 cursor-not-allowed" : ""
            } min-h-[80px]`}
          />
        ) : (
          <input
            type="text"
            value={block.content}
            onChange={(e) => updateBlock(block.id, e.target.value)}
            disabled={isReadOnly}
            className={`w-full p-2.5 text-sm border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white ${
              isReadOnly ? "opacity-70 cursor-not-allowed" : ""
            }`}
          />
        )}
      </div>
    );
  };

  const BlockButton = ({ label, icon: Icon, onClick, premium = false, info }) => {
    const locked = premium && !isPro;

    return (
      <button
        onClick={locked ? undefined : onClick}
        disabled={locked}
        className={`w-full flex items-center gap-3 p-2.5 border rounded-lg transition-all text-xs font-medium shadow-sm
          ${locked
            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
            : premium
              ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
              : "bg-white border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600"
          }`}
      >
        <Icon size={14} className={locked ? "opacity-40" : "opacity-70"} />
        {label}
        {info && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setInfoModal({ title: label, text: info });
            }}
            className="ml-auto text-slate-400 hover:text-slate-600"
            aria-label={`Info: ${label}`}
          >
            <HelpCircle size={14} />
          </button>
        )}
        {premium && (
          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700">
            PRO
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-6 border-b bg-white dark:bg-slate-800">
          <h3 className="text-lg font-bold dark:text-white">{isReadOnly ? "Preview" : "Builder"}</h3>

          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewTab("edit")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition
                ${viewTab === "edit"
                  ? "bg-white dark:bg-slate-800 shadow text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"}`}
            >
              Edit
            </button>

            <button
              onClick={() => setViewTab("preview")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition
                ${viewTab === "preview"
                  ? "bg-white dark:bg-slate-800 shadow text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"}`}
            >
              Preview
            </button>
          </div>

          <button onClick={onClose}><X /></button>
        </div>

        {infoModal && (
          <div className="absolute inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{infoModal.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{infoModal.text}</p>
                </div>
                <button
                  onClick={() => setInfoModal(null)}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Close info"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setInfoModal(null)}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}

        {viewTab === "preview" ? (
          <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900 p-4 md:p-6">
            <LivePreview blocks={blocks} mode="template" isPro={isPro} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r p-4 bg-slate-50 dark:bg-slate-900 overflow-y-auto h-full max-h-[40vh] md:max-h-none">
              <div className="mb-4">
                <input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Magic Build Prompt"
                  className="w-full p-2 border rounded mb-2 text-xs"
                />
                <button
                  onClick={handleMagicBuild}
                  className="w-full bg-indigo-600 text-white p-1 rounded text-xs"
                >
                  {aiLoading ? "..." : "Auto-Generate"}
                </button>
              </div>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Template Name"
                className="w-full p-2 border rounded mb-4 dark:bg-slate-800 dark:text-white"
              />

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-2 block flex items-center gap-1">
                    <Layers size={12} /> Core
                  </label>
                  <div className="space-y-2">
                    <BlockButton label="Heading" icon={Type} onClick={() => addBlock("header", "basic")} info={BLOCK_INFO.header} />
                    <BlockButton label="Text" icon={AlignLeft} onClick={() => addBlock("text", "basic")} info={BLOCK_INFO.text} />
                    <BlockButton label="Image" icon={ImageIcon} onClick={() => addBlock("image", "basic")} info={BLOCK_INFO.image} />
                    <BlockButton label="HTML" icon={Code} onClick={() => addBlock("html", "basic")} info={BLOCK_INFO.html} />
                    <BlockButton label="Columns (2)" icon={LayoutTemplate} onClick={() => addBlock("columns_2", "basic")} info={BLOCK_INFO.columns_2} />
                    <BlockButton label="Grid (2x2)" icon={LayoutTemplate} onClick={() => addBlock("grid_2x2", "basic")} info={BLOCK_INFO.grid_2x2} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-2 block flex items-center gap-1">
                    <Megaphone size={12} /> Marketing
                  </label>
                  <div className="space-y-2">
                    <BlockButton label="Pain Point" icon={AlertCircle} onClick={() => addBlock("pain_point", "marketing")} info={BLOCK_INFO.pain_point} />
                    <BlockButton label="Solution" icon={CheckCircle2} onClick={() => addBlock("solution", "marketing")} info={BLOCK_INFO.solution} />
                    <BlockButton label="USP" icon={Award} onClick={() => addBlock("usp", "marketing")} info={BLOCK_INFO.usp} />
                    <BlockButton label="Pricing" icon={DollarSign} onClick={() => addBlock("pricing", "marketing")} info={BLOCK_INFO.pricing} />
                    <BlockButton label="CTA" icon={Megaphone} onClick={() => addBlock("cta", "marketing")} info={BLOCK_INFO.cta} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-2 block flex items-center gap-1">
                    <Search size={12} /> SEO
                  </label>
                  <div className="space-y-2">
                    <BlockButton label="Schema (Service)" icon={FileCode} onClick={() => addBlock("schema_service", "seo")} info={BLOCK_INFO.schema_service} />
                    <BlockButton label="Schema (Blog)" icon={FileCode} onClick={() => addBlock("schema_blog", "seo")} info={BLOCK_INFO.schema_blog} />
                    <BlockButton label="FAQ" icon={HelpCircle} onClick={() => addBlock("faq_auto", "seo")} info={BLOCK_INFO.faq_auto} />
                    <BlockButton label="Stats" icon={TrendingUp} onClick={() => addBlock("stats", "seo")} info={BLOCK_INFO.stats} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-amber-500 mb-2 block flex items-center gap-1">
                    <Zap size={12} /> Premium
                  </label>
                  <div className="space-y-2">
                    <BlockButton label="Hero" icon={Type} onClick={() => addBlock("hero", "premium")} premium info={BLOCK_INFO.hero} />
                    <BlockButton label="Comparison" icon={Scale} onClick={() => addBlock("comparison", "premium")} premium info={BLOCK_INFO.comparison} />
                    <BlockButton label="Pros/Cons" icon={ThumbsUp} onClick={() => addBlock("pros_cons", "premium")} premium info={BLOCK_INFO.pros_cons} />
                    <BlockButton label="Social Proof" icon={Users} onClick={() => addBlock("social_proof", "premium")} premium info={BLOCK_INFO.social_proof} />
                    <BlockButton label="Process" icon={Workflow} onClick={() => addBlock("process", "premium")} premium info={BLOCK_INFO.process} />
                    <BlockButton label="Case Study" icon={Briefcase} onClick={() => addBlock("case_study", "premium")} premium info={BLOCK_INFO.case_study} />
                    <BlockButton label="Contact" icon={FormInput} onClick={() => addBlock("contact_form", "premium")} premium info={BLOCK_INFO.contact_form} />
                    <BlockButton label="Badges" icon={ShieldCheck} onClick={() => addBlock("trust_badges", "premium")} premium info={BLOCK_INFO.trust_badges} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 md:p-8 bg-slate-100 dark:bg-slate-950 overflow-y-auto">
              {blocks.map((b, i) => renderBlockEditor(b, i))}
            </div>
          </div>
        )}

        <div className="p-4 border-t bg-white dark:bg-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
