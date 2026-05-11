// --- 4. Template Builder Modal ---
"use client";
import LivePreview from "./LivePreview";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiFetch } from "@/lib/apiFetch";
import {
  Search,
  ArrowUp, ArrowDown, Trash2, Type, FileCode, Award,
  Layers, AlignLeft, Image as ImageIcon, Code, AlertCircle,
  CheckCircle2, DollarSign, Megaphone, HelpCircle, TrendingUp,
  Scale, ThumbsUp, Users, Workflow, Briefcase, FormInput,
  ShieldCheck, Zap, X, LayoutTemplate, GripVertical
} from "lucide-react";

const TemplateModal = ({
  isOpen,
  onClose,
  onSaveSuccess,
  initialData,
  mode = "edit",
  profile
}) => {
  const [blocks, setBlocks] = useState([]);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);
  const [viewTab, setViewTab] = useState("edit");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [infoModal, setInfoModal] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const normalizeStructure = (structure) => {
    if (Array.isArray(structure)) return structure;
    if (typeof structure === "string") {
      try {
        const parsed = JSON.parse(structure);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentMode(mode);
      setViewTab(mode.startsWith("preview") ? "preview" : "edit");

      if (initialData) {
        const isPreset = initialData.id.toString().startsWith("preset");
        setName(initialData.name + (isPreset ? " (Clone)" : ""));
        setBlocks(normalizeStructure(initialData.structure));
      } else {
        setName("");
        setBlocks([]);
      }
    }
  }, [isOpen, initialData, mode]);

  if (!isOpen) return null;

  const isReadOnly = viewTab === "preview";

  // FIX: category is now passed in and stored correctly
  const addBlock = (type, category = "basic") => {
    if (isReadOnly) return;

    let content = "Content...";
    switch (type) {
      case "header": content = "H2: Guide to {{Keyword}} Style: editorial header with kicker label and accent rule."; break;
      case "text": content = "Write 2 short paragraphs about {{Keyword}}. Keep it crisp and clear. Style: tight paragraphs with callout bullets and subtle highlights."; break;
      case "service_keyword": content = "{{Keyword}}"; break;
      case "image":
        content = "Image for {{Service}} in {{City}}. Use {{ImageUrl}} to load a per-row image.";
        break;
      case "html": content = '<div class="custom-block">...</div>'; break;
      case "columns_2": content = "Column 1: {{Keyword}} benefits || Column 2: Pricing and proof. Style: split layout with icon chips and mini CTA buttons."; break;
      case "columns_n": content = "Column 1: {{Keyword}} benefits || Column 2: Proof || Column 3: CTA. Style: multi-column layout with icon chips."; break;
      case "grid_2x2": content = "Feature A || Feature B\nFeature C || Feature D Style: tile grid with icons and soft gradient borders."; break;
      case "pain_point": content = "Identify 3 pain points for {{Keyword}}. Style: card grid with icons and hover lift."; break;
      case "solution": content = "Explain how we solve {{Keyword}} issues. Style: outcome cards with mini checkmarks and proof lines."; break;
      case "usp": content = "List 4 USPs for {{Keyword}}. Style: icon chips with bold headings."; break;
      case "pricing": content = "3-tier pricing cards with a monthly/annual toggle and highlighted plan. Style: premium cards with feature list."; break;
      case "cta": content = "CTA band with 2 buttons and a short trust line. Style: bold gradient band with a secondary link."; break;
      case "schema_service": content = '{"@type": "Service", "name": "{{Keyword}}"}'; break;
      case "schema_blog": content = '{"@type": "BlogPosting", "headline": "Guide to {{Keyword}}"}'; break;
      case "faq_auto": content = "Generate 5 FAQs about {{Keyword}}. Style: accordion layout with icons and short answers."; break;
      case "stats": content = "3 stats about {{Keyword}}. Style: metric cards with labels and count-up effect."; break;
      case "hero": content = "Hero for {{Keyword}} with outcome-driven headline, proof line, and 2 CTAs. Style: cinematic split hero with gradient mesh and floating badges."; break;
      case "comparison": content = "Compare us vs alternatives for {{Keyword}}. Style: clean table with highlighted column and checkmarks."; break;
      case "pros_cons": content = "List pros and cons for {{Keyword}}. Style: two-column layout with green/red accents."; break;
      case "social_proof": content = "3 testimonial quotes with role and company. Style: slider-like testimonial cards."; break;
      case "process": content = "Create a 3-step process for {{Keyword}}. Style: timeline with numbered steps and connectors."; break;
      case "case_study": content = "Mini case study for {{Keyword}} with outcome metrics. Style: story card with metric strip."; break;
      case "contact_form":
        content = `<div class="gg-container">
  <div class="gg-grid gg-grid-2">
    <div class="gg-card gg-card-strong">
      <div class="gg-pill">Talk to us</div>
      <h3 class="gg-h2">Book a demo for {{Company}}</h3>
      <p class="gg-lead">Share your goals and we will respond within 24 hours.</p>
      <div class="gg-badges">
        <span class="gg-badge">Strategy call</span>
        <span class="gg-badge">SEO roadmap</span>
        <span class="gg-badge">Dedicated onboarding</span>
      </div>
    </div>
    <div class="gg-card gg-card-strong">
      <form class="gg-form">
        <input class="gg-input" placeholder="Full name" />
        <input class="gg-input" placeholder="Work email" />
        <input class="gg-input" placeholder="Company" />
        <textarea class="gg-input" rows="4" placeholder="What are you trying to build?"></textarea>
        <button class="gg-btn" type="button">Send request</button>
      </form>
    </div>
  </div>
</div>`;
        break;
      case "trust_badges":
        content = `<div class="gg-container">
  <div class="gg-row">
    <span class="gg-pill">Trusted by</span>
  </div>
  <div class="gg-badges" style="margin-top:12px">
    <span class="gg-badge">SOC 2</span>
    <span class="gg-badge">ISO 27001</span>
    <span class="gg-badge">99.9% uptime</span>
    <span class="gg-badge">24/7 support</span>
  </div>
</div>`;
        break;
      default: break;
    }

    const newBlock = {
      id: Date.now() + Math.random(),
      type,
      category, // now correct
      content,
      ...(type === "columns_n" ? { columns: 3 } : type === "columns_2" ? { columns: 2 } : {}),
      ...(type === "image" ? { imageUrl: "", imageCaption: "" } : {})
    };

    setBlocks((prev) => [...(Array.isArray(prev) ? prev : []), newBlock]);
  };

  const BLOCK_META = {
    header: {
      label: "Heading",
      description: "Section title with a short kicker.",
      usage: "Write a clear, outcome-driven section title. Keep it short and scannable.",
      example: "Why {{Service}} matters in {{City}}",
      aiRecommended: true
    },
    text: {
      label: "Text",
      description: "Paragraph-style explanation block.",
      usage: "Explain the value, context, or details. 2-4 short paragraphs works best.",
      example: "{{Company}} helps {{Audience}} by...",
      aiRecommended: true
    },
    image: {
      label: "Image",
      description: "Hero or feature image placeholder.",
      usage: "Add an image URL and optional caption, or describe the image you want AI to reflect.",
      example: "https://.../hero.jpg || Caption: “Teams scaling SEO”",
      aiRecommended: false
    },
    html: {
      label: "HTML",
      description: "Custom layout or embed snippet.",
      usage: "Insert custom markup for complex sections or embeds.",
      example: "<div class='custom-block'>...</div>",
      aiRecommended: false
    },
    columns_2: {
      label: "Columns (2)",
      description: "Two-column split section.",
      usage: "Use '||' to split left/right content.",
      example: "Benefits list || Pricing + proof",
      aiRecommended: true
    },
    columns_n: {
      label: "Columns (N)",
      description: "Multi-column section with adjustable count.",
      usage: "Set the number of columns, then split content with '||'.",
      example: "Benefits || Proof || CTA",
      aiRecommended: true
    },
    grid_2x2: {
      label: "Grid (2x2)",
      description: "Four quick feature tiles.",
      usage: "Use new lines or '||' to define each tile.",
      example: "Speed || Quality || Support || Results",
      aiRecommended: true
    },
    pain_point: {
      label: "Pain Point",
      description: "Problem statement cards.",
      usage: "List 2-4 problems your audience faces.",
      example: "Low conversions, unclear messaging, manual updates",
      aiRecommended: true
    },
    solution: {
      label: "Solution",
      description: "How you fix the problem.",
      usage: "Explain how your service solves the pain points.",
      example: "We build structured pages that...",
      aiRecommended: true
    },
    usp: {
      label: "USP",
      description: "Unique selling points list.",
      usage: "List 3-6 differentiators. Short, punchy.",
      example: "Custom templates, AI-assisted, fast launch",
      aiRecommended: true
    },
    pricing: {
      label: "Pricing",
      description: "Pricing tiers or ranges.",
      usage: "Outline tiers and who each is best for.",
      example: "Starter / Growth / Scale",
      aiRecommended: true
    },
    cta: {
      label: "CTA",
      description: "Primary call-to-action band.",
      usage: "Short prompt + one primary action.",
      example: "Start generating pages",
      aiRecommended: true
    },
    schema_service: {
      label: "Schema (Service)",
      description: "JSON-LD service schema.",
      usage: "Keep JSON valid. This is for SEO only.",
      example: "{\"@type\":\"Service\",\"name\":\"{{Service}}\"}",
      aiRecommended: false
    },
    schema_blog: {
      label: "Schema (Blog)",
      description: "JSON-LD blog schema.",
      usage: "Keep JSON valid. This is for SEO only.",
      example: "{\"@type\":\"BlogPosting\",\"headline\":\"{{Keyword}}\"}",
      aiRecommended: false
    },
    faq_auto: {
      label: "FAQ",
      description: "Question + answer accordion.",
      usage: "List common questions the AI should answer.",
      example: "How long does it take?",
      aiRecommended: true
    },
    stats: {
      label: "Stats",
      description: "Quick proof metrics.",
      usage: "Provide or describe 2-4 stats.",
      example: "+120% organic growth",
      aiRecommended: true
    },
    hero: {
      label: "Hero",
      description: "Top section with headline + CTAs.",
      usage: "Give the AI strong context; it will craft the headline + subhead.",
      example: "{{Service}} for {{City}} teams that want results",
      aiRecommended: true
    },
    comparison: {
      label: "Comparison",
      description: "Decision matrix vs alternatives.",
      usage: "List key comparison points.",
      example: "Speed, cost, quality, support",
      aiRecommended: true
    },
    pros_cons: {
      label: "Pros/Cons",
      description: "Pros and cons grid.",
      usage: "Use for transparency or education.",
      example: "Pros: Faster launch || Cons: Requires data setup",
      aiRecommended: true
    },
    social_proof: {
      label: "Social Proof",
      description: "Testimonials carousel.",
      usage: "Describe testimonials or reviewers.",
      example: "Marketing Lead, Growth Agency",
      aiRecommended: true
    },
    process: {
      label: "Process",
      description: "Step-by-step timeline.",
      usage: "Outline 3-5 steps.",
      example: "Collect data -> Generate -> Review",
      aiRecommended: true
    },
    case_study: {
      label: "Case Study",
      description: "Mini case study section.",
      usage: "Describe a real result or narrative.",
      example: "Client X increased leads by 2.3x",
      aiRecommended: true
    },
    contact_form: {
      label: "Contact",
      description: "Lead capture form block.",
      usage: "Describe form intent + CTA.",
      example: "Book a strategy call",
      aiRecommended: false
    },
    trust_badges: {
      label: "Badges",
      description: "Trust badges row.",
      usage: "List credibility badges or logos.",
      example: "SOC2, ISO, 24/7 Support",
      aiRecommended: false
    }
  };

  const BLOCK_INFO = Object.fromEntries(
    Object.entries(BLOCK_META).map(([key, value]) => [key, value.description])
  );

  const updateBlock = (id, content) => {
    if (isReadOnly) return;
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  const updateBlockMeta = (id, patch) => {
    if (isReadOnly) return;
    setBlocks((prev) =>
      (Array.isArray(prev) ? prev : []).map((b) => (b.id === id ? { ...b, ...patch } : b))
    );
  };

  const updateBlockColumns = (id, count) => {
    if (isReadOnly) return;
    setBlocks((prev) =>
      (Array.isArray(prev) ? prev : []).map((b) => {
        if (b.id !== id) return b;
        const nextCount = Math.min(6, Math.max(2, count));
        const cols = splitColumns(b.content, nextCount);
        return { ...b, columns: nextCount, content: cols.join(" || ") };
      })
    );
  };

  const reorderBlocks = (from, to) => {
    setBlocks((prev) => {
      const list = Array.isArray(prev) ? [...prev] : [];
      if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      return list;
    });
  };

  const splitColumns = (value, count) => {
    const items = String(value ?? "")
      .split("||")
      .map((s) => s.trim());
    while (items.length < count) items.push("");
    return items.slice(0, count);
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
        `Allowed types: header, text, hero, pain_point, solution, usp, pricing, cta, schema_service, faq_auto, comparison, pros_cons, social_proof, process, case_study, contact_form, trust_badges, schema_blog, stats, html, image, columns_n, columns_2, grid_2x2. ` +
        `Allowed categories: basic, marketing, seo, premium.`;

      const response = await apiFetch("/api/generate", {
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

    const meta = BLOCK_META[block.type] || {};
    const isPremium = block.category === "premium";
    const isColumnsBlock = block.type === "columns_n" || block.type === "columns_2";
    const columnCount = isColumnsBlock
      ? block.type === "columns_2"
        ? 2
        : Math.min(6, Math.max(2, parseInt(block.columns || 3, 10)))
      : null;
    const imageUrl = typeof block.imageUrl === "string" ? block.imageUrl : "";
    const imageCaption = typeof block.imageCaption === "string" ? block.imageCaption : "";

    const needsTextArea = [
      "text", "pain_point", "solution", "usp", "pricing", "cta", "faq_auto",
      "stats", "hero", "comparison", "pros_cons", "social_proof", "process",
      "case_study", "schema_service", "schema_blog", "html", "image",
      "grid_2x2"
    ].includes(block.type);

    return (
      <div
        key={block.id}
        className={`group relative bg-white dark:bg-slate-800 p-4 rounded-2xl border shadow-sm transition-all ${
          isPremium ? "border-amber-200/80 dark:border-amber-700/50" : "border-slate-200 dark:border-slate-700"
        } ${dragOverIndex === index ? "ring-2 ring-indigo-300/70" : ""}`}
        onDragOver={(e) => {
          if (isReadOnly) return;
          if (dragIndex === null) return;
          e.preventDefault();
          setDragOverIndex(index);
        }}
        onDragLeave={() => {
          if (dragOverIndex === index) setDragOverIndex(null);
        }}
        onDrop={(e) => {
          if (isReadOnly) return;
          e.preventDefault();
          const from = dragIndex;
          if (from === null || from === index) {
            setDragOverIndex(null);
            return;
          }
          reorderBlocks(from, index);
          setDragIndex(null);
          setDragOverIndex(null);
        }}
      >
        <div
          className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl ${
            isPremium
              ? "bg-gradient-to-r from-amber-400/70 via-orange-400/70 to-rose-400/70"
              : "bg-gradient-to-r from-indigo-400/60 via-emerald-400/60 to-teal-400/60"
          }`}
        ></div>
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
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <button
              onClick={() => moveBlock(index, "up")}
              disabled={index === 0}
              className="text-slate-400 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 disabled:opacity-30 transition-colors dark:text-[#fbfbfb]"
            >
              <ArrowUp size={18} />
            </button>
            <button
              onClick={() => moveBlock(index, "down")}
              disabled={index === blocks.length - 1}
              className="text-slate-400 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 disabled:opacity-30 transition-colors dark:text-[#fbfbfb]"
            >
              <ArrowDown size={18} />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1"></div>
            <button
              onClick={() => removeBlock(block.id)}
              className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors dark:text-[#fbfbfb]"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <div
            className={`text-xs font-bold uppercase flex items-center gap-2 ${
              isPremium ? "text-amber-600 dark:text-amber-400" : "text-indigo-500"
            }`}
          >
            {!isReadOnly && (
              <span
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", String(index));
                  setDragIndex(index);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setDragOverIndex(null);
                }}
                className="cursor-grab active:cursor-grabbing p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-[#fbfbfb]"
                title="Drag to reorder"
              >
                <GripVertical size={16} />
              </span>
            )}
            {block.type === "header" && <Type size={12} />}
            {block.type.includes("schema") && <FileCode size={12} />}
            {block.category === "premium" && <Award size={12} />}
            {meta.label || block.type.replace("_", " ")}
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              isPremium ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
            }`}
          >
            {block.category}
          </span>
        </div>

        <div className="mt-2 rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-[11px] text-slate-500 dark:bg-slate-900/40 dark:border-slate-700">
          <div className="font-semibold text-slate-700 dark:text-slate-200">
            What this block does
          </div>
          <div>{meta.description || "Describe what this section should communicate."}</div>
          {meta.usage && (
            <div className="mt-1">
              <span className="font-semibold text-slate-600 dark:text-slate-300">How to fill it: </span>
              {meta.usage}
            </div>
          )}
          {meta.example && (
            <div className="mt-1 text-slate-500">
              <span className="font-semibold">Example: </span>
              {meta.example}
            </div>
          )}
          {meta.aiRecommended && (
            <div className="mt-1 inline-flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle2 size={12} /> AI recommended
            </div>
          )}
        </div>

        {block.type === "image" && (
          <div className="mt-3 grid gap-2 text-xs">
            <label className="text-slate-500 font-semibold">Image URL</label>
            <input
              value={imageUrl}
              onChange={(e) => updateBlockMeta(block.id, { imageUrl: e.target.value })}
              disabled={isReadOnly}
              placeholder="https://example.com/hero.jpg"
              className={`w-full p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white ${
                isReadOnly ? "opacity-70 cursor-not-allowed" : ""
              }`}
            />
            <div className="text-[11px] text-slate-500">
              Tip: use a dataset variable like <span className="font-semibold">{`{{ImageUrl}}`}</span> to swap images per page.
            </div>
            <label className="text-slate-500 font-semibold">Caption (optional)</label>
            <input
              value={imageCaption}
              onChange={(e) => updateBlockMeta(block.id, { imageCaption: e.target.value })}
              disabled={isReadOnly}
              placeholder="Short caption or alt text"
              className={`w-full p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white ${
                isReadOnly ? "opacity-70 cursor-not-allowed" : ""
              }`}
            />
            <div className="text-[11px] text-slate-500">
              You can also use variables here (e.g. <span className="font-semibold">{`{{City}}`}</span>).
            </div>
          </div>
        )}

        {block.type === "columns_n" && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="text-slate-500">Columns</span>
            {isReadOnly ? (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                {columnCount}
              </span>
            ) : (
              <select
                value={columnCount}
                onChange={(e) =>
                  updateBlockColumns(block.id, Number(e.target.value))
                }
                className="p-1.5 border rounded-lg text-xs bg-white dark:bg-slate-900 dark:border-slate-700"
              >
                {[2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} columns
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {isColumnsBlock ? (
          <div className="mt-4 space-y-3">
            {splitColumns(block.content, columnCount || 2).map((col, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1 dark:text-[#fbfbfb]">
                  Column {idx + 1}
                </div>
                <textarea
                  value={col}
                  onChange={(e) => {
                    const cols = splitColumns(block.content, columnCount || 2);
                    cols[idx] = e.target.value;
                    updateBlock(block.id, cols.join(" || "));
                  }}
                  disabled={isReadOnly}
                  className={`w-full p-2.5 text-sm border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white resize-y ${
                    isReadOnly ? "opacity-70 cursor-not-allowed" : ""
                  } min-h-[70px]`}
                  placeholder={`Column ${idx + 1} content`}
                />
              </div>
            ))}
          </div>
        ) : needsTextArea ? (
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

  const BlockButton = ({ label, icon: Icon, onClick, premium = false, info, description, tone = "slate" }) => {
    const toneClass = {
      slate: "from-white via-slate-50 to-white",
      indigo: "from-white via-indigo-50/40 to-white",
      emerald: "from-white via-emerald-50/40 to-white",
      amber: "from-amber-50/80 via-white to-rose-50/60"
    }[tone] || "from-white via-slate-50 to-white";

    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-start gap-3 p-3 border rounded-xl transition-all text-xs font-medium shadow-sm bg-gradient-to-br ${toneClass}
          ${premium
            ? "border-amber-200 text-amber-700 hover:shadow-md"
            : "border-slate-200 text-slate-700 hover:border-indigo-400 hover:shadow-md"
          }`}
      >
        <Icon size={14} className="opacity-70" />
        <div className="text-left">
          <div className="text-xs font-semibold text-slate-800">{label}</div>
          {description && <div className="text-[11px] text-slate-500">{description}</div>}
        </div>
        {info && (
          <span
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setInfoModal({ title: label, text: info });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setInfoModal({ title: label, text: info });
              }
            }}
            role="button"
            tabIndex={0}
            className="ml-auto text-slate-400 hover:text-slate-600 dark:text-[#fbfbfb]"
            aria-label={`Info: ${label}`}
          >
            <HelpCircle size={14} />
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-6 border-b bg-white dark:bg-slate-800">
          <div>
            <h3 className="text-lg font-bold dark:text-white">{viewTab === "preview" ? "Preview" : "Builder"}</h3>
            <p className="text-xs text-slate-500">
              Add blocks to define structure, then let AI fill only the sections you choose.
            </p>
          </div>

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
                  className="text-slate-400 hover:text-slate-600 dark:text-[#fbfbfb]"
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
            <LivePreview blocks={blocks} mode="template" />
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <div className="relative z-10 w-full md:w-72 border-b md:border-b-0 md:border-r p-4 bg-slate-50 dark:bg-slate-900 overflow-y-auto h-full max-h-[40vh] md:max-h-none space-y-4 pointer-events-auto">
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 font-bold mb-2 dark:text-[#fbfbfb]">
                  AI Template Builder
                </div>
                <input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. SaaS landing page for {{Service}} in {{City}}"
                  className="w-full p-2.5 border rounded mb-2 text-xs dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
                <button
                  onClick={handleMagicBuild}
                  className="w-full bg-indigo-600 text-white p-2 rounded text-xs font-semibold"
                >
                  {aiLoading ? "Building..." : "Generate Blocks with AI"}
                </button>
                <p className="text-[11px] text-slate-500 mt-2">
                  AI suggests the structure only. You can edit any block after it is created.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 font-bold mb-2 dark:text-[#fbfbfb]">
                  Suggested structure
                </div>
                <div className="text-[11px] text-slate-500 space-y-1">
                  {[
                    "Hero",
                    "Pain Points",
                    "Solution",
                    "USP",
                    "Stats",
                    "Social Proof",
                    "FAQ",
                    "CTA"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Template Name"
                className="w-full p-2.5 border rounded dark:bg-slate-800 dark:text-white"
              />

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-2 block flex items-center gap-1 dark:text-[#fbfbfb]">
                    <Layers size={12} /> Core
                  </label>
                  <div className="space-y-2">
                    <BlockButton label="Heading" icon={Type} onClick={() => addBlock("header", "basic")} info={BLOCK_INFO.header} description="Section title with short kicker." tone="slate" />
                    <BlockButton label="Text" icon={AlignLeft} onClick={() => addBlock("text", "basic")} info={BLOCK_INFO.text} description="Paragraph-style explanation block." tone="slate" />
                    <BlockButton label="Image" icon={ImageIcon} onClick={() => addBlock("image", "basic")} info={BLOCK_INFO.image} description="Hero or feature image placeholder." tone="slate" />
                    <BlockButton label="HTML" icon={Code} onClick={() => addBlock("html", "basic")} info={BLOCK_INFO.html} description="Custom layout or embed snippet." tone="slate" />
                    <BlockButton label="Columns (N)" icon={LayoutTemplate} onClick={() => addBlock("columns_n", "basic")} info={BLOCK_INFO.columns_n} description="Adjustable multi-column section." tone="slate" />
                    <BlockButton label="Grid (2x2)" icon={LayoutTemplate} onClick={() => addBlock("grid_2x2", "basic")} info={BLOCK_INFO.grid_2x2} description="Four quick feature tiles." tone="slate" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-2 block flex items-center gap-1 dark:text-[#fbfbfb]">
                    <Megaphone size={12} /> Marketing
                  </label>
                  <div className="space-y-2">
                    <BlockButton label="Pain Point" icon={AlertCircle} onClick={() => addBlock("pain_point", "marketing")} info={BLOCK_INFO.pain_point} description="Problem statement cards." tone="indigo" />
                    <BlockButton label="Solution" icon={CheckCircle2} onClick={() => addBlock("solution", "marketing")} info={BLOCK_INFO.solution} description="How you fix the problem." tone="indigo" />
                    <BlockButton label="USP" icon={Award} onClick={() => addBlock("usp", "marketing")} info={BLOCK_INFO.usp} description="Unique selling points list." tone="indigo" />
                    <BlockButton label="Pricing" icon={DollarSign} onClick={() => addBlock("pricing", "marketing")} info={BLOCK_INFO.pricing} description="Pricing tiers or ranges." tone="indigo" />
                    <BlockButton label="CTA" icon={Megaphone} onClick={() => addBlock("cta", "marketing")} info={BLOCK_INFO.cta} description="Primary call-to-action band." tone="indigo" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-2 block flex items-center gap-1 dark:text-[#fbfbfb]">
                    <Search size={12} /> SEO
                  </label>
                  <div className="space-y-2">
                    <BlockButton label="Schema (Service)" icon={FileCode} onClick={() => addBlock("schema_service", "seo")} info={BLOCK_INFO.schema_service} description="JSON-LD service schema." tone="emerald" />
                    <BlockButton label="Schema (Blog)" icon={FileCode} onClick={() => addBlock("schema_blog", "seo")} info={BLOCK_INFO.schema_blog} description="JSON-LD blog schema." tone="emerald" />
                    <BlockButton label="FAQ" icon={HelpCircle} onClick={() => addBlock("faq_auto", "seo")} info={BLOCK_INFO.faq_auto} description="Question + answer accordion." tone="emerald" />
                    <BlockButton label="Stats" icon={TrendingUp} onClick={() => addBlock("stats", "seo")} info={BLOCK_INFO.stats} description="Quick proof metrics." tone="emerald" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-amber-500 mb-2 block flex items-center gap-1">
                    <Zap size={12} /> Premium
                  </label>
                  <div className="space-y-2">
                    <BlockButton label="Hero" icon={Type} onClick={() => addBlock("hero", "premium")} premium info={BLOCK_INFO.hero} description="Top section with headline + CTAs." tone="amber" />
                    <BlockButton label="Comparison" icon={Scale} onClick={() => addBlock("comparison", "premium")} premium info={BLOCK_INFO.comparison} description="Decision matrix vs alternatives." tone="amber" />
                    <BlockButton label="Pros/Cons" icon={ThumbsUp} onClick={() => addBlock("pros_cons", "premium")} premium info={BLOCK_INFO.pros_cons} description="Pros and cons grid." tone="amber" />
                    <BlockButton label="Social Proof" icon={Users} onClick={() => addBlock("social_proof", "premium")} premium info={BLOCK_INFO.social_proof} description="Testimonials carousel." tone="amber" />
                    <BlockButton label="Process" icon={Workflow} onClick={() => addBlock("process", "premium")} premium info={BLOCK_INFO.process} description="Step-by-step timeline." tone="amber" />
                    <BlockButton label="Case Study" icon={Briefcase} onClick={() => addBlock("case_study", "premium")} premium info={BLOCK_INFO.case_study} description="Mini case study section." tone="amber" />
                    <BlockButton label="Contact" icon={FormInput} onClick={() => addBlock("contact_form", "premium")} premium info={BLOCK_INFO.contact_form} description="Lead capture form block." tone="amber" />
                    <BlockButton label="Badges" icon={ShieldCheck} onClick={() => addBlock("trust_badges", "premium")} premium info={BLOCK_INFO.trust_badges} description="Trust badges row." tone="amber" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 md:p-8 bg-slate-100 dark:bg-slate-950 overflow-y-auto">
              {blocks.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-slate-500">
                  <div className="max-w-md">
                    <div className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-[#fbfbfb]">Get started</div>
                    <h4 className="text-xl font-bold text-slate-800 mt-2">Add your first block</h4>
                    <p className="text-sm mt-2">
                      Click a block on the left to build your structure, or use AI to generate a starter layout.
                    </p>
                  </div>
                </div>
              ) : (
                blocks.map((b, i) => renderBlockEditor(b, i))
              )}
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
