"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Eye, Info, LayoutTemplate, Plus, Sparkles, Trash2, User, Edit3, Search } from "lucide-react";
import PRESET_TEMPLATES from "../../constants/presetTemplates";
import { supabase } from "../../../lib/supabaseClient";
import Badge from "../ui/Badge";
import Card from "../ui/Card";

const TemplatesView = ({ user, onNewTemplate, onPreview, onEditTemplate, onUseTemplate, refreshKey }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copyId, setCopyId] = useState(null);
  const [cloningId, setCloningId] = useState(null);
  const [usingId, setUsingId] = useState(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("templates")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setTemplates(data);
      setLoading(false);
    };
    fetchTemplates();
  }, [refreshKey, user?.id]);

  const deleteTemplate = async (id) => {
    if (confirm("Delete template?")) {
      const { error } = await supabase.from("templates").delete().eq("id", id);
      if (error) {
        alert("Error deleting template: " + error.message);
        return;
      }
      setTemplates(templates.filter((t) => t.id !== id));
    }
  };

  const handleUse = (template) => {
    const html = template.structure.map((b) => `<!-- ${b.type} -->\n<div class="block-${b.type}">${b.content}</div>`).join("\n\n");
    navigator.clipboard.writeText(html);
    setCopyId(template.id);
    setTimeout(() => setCopyId(null), 2000);
  };

  const handleImportPreset = async (preset) => {
    if (!user?.id) return;
    setCloningId(preset.id);
    const payload = {
      user_id: user.id,
      name: `${preset.name} (Copy)`,
      category: preset.category || "General",
      structure: preset.structure || []
    };
    const { data, error } = await supabase
      .from("templates")
      .insert(payload)
      .select("*")
      .single();
    setCloningId(null);
    if (error) {
      alert(error.message);
      return;
    }
    setTemplates((prev) => [data, ...prev]);
    onEditTemplate?.(data);
  };

  const handleUsePreset = async (preset) => {
    if (!user?.id) return;
    setUsingId(preset.id);
    const payload = {
      user_id: user.id,
      name: `${preset.name} (Copy)`,
      category: preset.category || "General",
      structure: preset.structure || []
    };
    const { data, error } = await supabase
      .from("templates")
      .insert(payload)
      .select("*")
      .single();
    setUsingId(null);
    if (error) {
      alert(error.message);
      return;
    }
    setTemplates((prev) => [data, ...prev]);
    onUseTemplate?.(data);
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filteredTemplates = templates.filter((t) =>
    String(t.name || "").toLowerCase().includes(normalizedQuery)
  );
  const categories = ["All", ...new Set(PRESET_TEMPLATES.map((t) => t.category))];
  const filteredPresets = PRESET_TEMPLATES.filter((t) => {
    const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;
    const matchesQuery = String(t.name || "").toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

  const formatBlock = (type) => String(type || "").replaceAll("_", " ");

  const getBlockTone = (type) => {
    switch (type) {
      case "hero":
        return "bg-slate-900/80";
      case "pricing":
        return "bg-emerald-400/80";
      case "cta":
        return "bg-[#2B5E44]/80";
      case "comparison":
        return "bg-indigo-500/70";
      case "stats":
        return "bg-amber-400/80";
      case "faq_auto":
        return "bg-teal-400/80";
      default:
        return "bg-slate-300/80";
    }
  };

  const getToneFromCategory = (category) => {
    const key = String(category || "").toLowerCase();
    if (key === "premium") return "premium";
    if (key === "saas") return "blue";
    if (key === "services") return "sage";
    if (key === "e-commerce") return "sunset";
    if (key === "hospitality") return "warm";
    if (key === "nonprofit") return "rose";
    if (key === "content") return "slate";
    if (key === "healthcare") return "sage";
    if (key === "real estate") return "slate";
    if (key === "legal") return "premium";
    if (key === "home services") return "warm";
    if (key === "fitness") return "sunset";
    if (key === "automotive") return "blue";
    if (key === "education") return "blue";
    if (key === "finance") return "premium";
    return "emerald";
  };

  const TemplateThumb = ({ structure = [], tone = "emerald" }) => {
    const blocks = Array.isArray(structure) ? structure.slice(0, 6) : [];
    const gradientClass = {
      emerald: "from-emerald-50 via-white to-teal-50 dark:from-emerald-900/20 dark:via-slate-900 dark:to-teal-900/20",
      premium: "from-amber-50 via-white to-rose-50 dark:from-amber-900/20 dark:via-slate-900 dark:to-rose-900/20",
      blue: "from-sky-50 via-white to-indigo-50 dark:from-sky-900/20 dark:via-slate-900 dark:to-indigo-900/20",
      sage: "from-[#f0f7f2] via-white to-[#eaf5ef] dark:from-slate-900 dark:via-slate-900 dark:to-slate-950",
      sunset: "from-rose-50 via-white to-amber-50 dark:from-rose-900/20 dark:via-slate-900 dark:to-amber-900/20",
      warm: "from-orange-50 via-white to-amber-50 dark:from-orange-900/20 dark:via-slate-900 dark:to-amber-900/20",
      rose: "from-rose-50 via-white to-pink-50 dark:from-rose-900/20 dark:via-slate-900 dark:to-pink-900/20",
      slate: "from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950"
    }[tone] || "from-emerald-50 via-white to-teal-50 dark:from-emerald-900/20 dark:via-slate-900 dark:to-teal-900/20";

    return (
      <div className={`relative h-32 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br ${gradientClass} overflow-hidden transition-transform duration-300 group-hover:-translate-y-0.5`}>
        <div className="absolute -right-6 -top-6 w-16 h-16 rounded-full bg-white/50 dark:bg-white/10"></div>
        <div className="absolute -left-6 -bottom-6 w-20 h-20 rounded-full bg-white/40 dark:bg-white/5"></div>
        <div className="relative z-10 h-full p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-300/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300/80"></span>
          </div>
          <div className="h-2.5 w-2/3 rounded-full bg-slate-200/80 dark:bg-slate-700"></div>
          <div className="flex-1 flex flex-col justify-center gap-2">
            {blocks.length === 0 ? (
              <div className="h-16 rounded-lg bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700"></div>
            ) : (
              blocks.map((b, idx) => (
                <div
                  key={`${b.type}-${idx}`}
                  className={`h-2 rounded-full ${getBlockTone(b.type)}`}
                  style={{ width: `${70 - idx * 6}%` }}
                ></div>
              ))
            )}
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Preview</div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="rounded-[28px] border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white via-[#f4faf7] to-[#edf6f0] dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
          <div className="max-w-xl">
            <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-3">Template Studio</div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Build templates that feel premium.</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-3">
              Design high-converting layouts, then scale them across thousands of programmatic SEO pages.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={onNewTemplate}
                className="bg-[#2B5E44] text-white px-4 py-2.5 rounded-lg font-bold flex gap-2 shadow-lg hover:bg-[#234d37] transition-all"
              >
                <Plus size={18} /> Create Template
              </button>
              <a
                href="#template-library"
                className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-white/70 dark:border-slate-700 dark:text-slate-200"
              >
                Browse Library
              </a>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 w-full lg:w-[380px]">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Info size={14} /> Variables
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Use <strong>{`{{Variable}}`}</strong> to inject your dataset fields.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Sparkles size={14} /> AI Ready
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Each block can be AI-written or manually controlled in the preview.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                <LayoutTemplate size={14} /> Structured
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Templates stay consistent across every page you generate.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                <BookOpen size={14} /> Library
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Import a premium preset and customize it to your brand.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="relative w-full lg:flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates, categories, or use cases"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full border ${
                categoryFilter === cat
                  ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                  : "bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User size={18} className="text-[#2B5E44]" /> My Templates
          </h2>
          <button
            onClick={onNewTemplate}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#2B5E44]/20 text-[#2B5E44] bg-[#2B5E44]/10 hover:bg-[#2B5E44]/15"
          >
            + New
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading templates...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center bg-white/70 dark:bg-slate-900/40">
            <p className="text-slate-500 mb-4">No templates yet. Build your first layout in minutes.</p>
            <button onClick={onNewTemplate} className="text-[#2B5E44] font-bold hover:underline">
              Create your first template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTemplates.map((t) => (
              <Card
                key={t.id}
                className="group relative overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-[#2B5E44]/40 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-1.5 bg-gradient-to-r from-[#2B5E44] to-[#4d8f70]" />
                <div className="p-5 flex flex-col h-full gap-4">
                  <button
                    type="button"
                    onClick={() => onPreview(t, "preview_user")}
                    className="text-left"
                    aria-label={`Preview template ${t.name}`}
                  >
                    <TemplateThumb structure={t.structure} tone={getToneFromCategory(t.category)} />
                  </button>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-[#2B5E44]/10 dark:bg-[#2B5E44]/20">
                        <LayoutTemplate size={18} className="text-[#2B5E44]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{t.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{t.structure?.length || 0} sections</span>
                          <Badge type="neutral">{t.category || "Custom"}</Badge>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTemplate(t.id);
                      }}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(t.structure || []).slice(0, 4).map((b, idx) => (
                      <span
                        key={`${t.id}-${idx}`}
                        className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {formatBlock(b.type)}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-2 space-y-2">
                    <button
                      onClick={() => onUseTemplate?.(t)}
                      className="w-full py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#2B5E44] to-[#4d8f70] rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
                    >
                      <Sparkles size={14} /> Use in Project
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onPreview(t, "preview_user")}
                        className="py-2 text-xs font-bold text-[#2B5E44] bg-[#2B5E44]/10 rounded-lg hover:bg-[#2B5E44]/15 flex items-center justify-center gap-2"
                      >
                        <Eye size={14} /> Preview
                      </button>
                      <button
                        onClick={() => onEditTemplate?.(t)}
                        className="py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                    </div>
                    <button
                      onClick={() => handleUse(t)}
                      className={`w-full py-2 text-xs font-bold rounded-lg transition-all ${
                        copyId === t.id
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "text-slate-600 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      {copyId === t.id ? "Copied!" : "Copy HTML"}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700"></div>

      <div id="template-library" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen size={18} className="text-emerald-500" /> Template Library
            </h2>
            <p className="text-slate-500 text-sm">
              Import a premium layout, customize it, and launch a project instantly.
            </p>
          </div>
          <div className="text-xs text-slate-400">Use = import + open project wizard</div>
        </div>

        {filteredPresets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-slate-500">
            No templates match your search or filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPresets.map((t) => (
              <Card key={t.id} className="group relative overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
                <div className="p-5 flex flex-col h-full gap-4">
                  <button
                    type="button"
                    onClick={() => onPreview(t, "preview_preset")}
                    className="text-left"
                    aria-label={`Preview preset ${t.name}`}
                  >
                    <TemplateThumb structure={t.structure} tone={getToneFromCategory(t.category)} />
                  </button>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                        <LayoutTemplate size={18} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{t.name}</h3>
                        <p className="text-xs text-slate-500">{t.category} - {t.structure.length} sections</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge type="success">Preset</Badge>
                      {t.category === "Premium" && <Badge type="premium">Premium</Badge>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(t.structure || []).slice(0, 4).map((b, idx) => (
                      <span
                        key={`${t.id}-${idx}`}
                        className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                      >
                        {formatBlock(b.type)}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-2 space-y-2">
                    <button
                      onClick={() => handleUsePreset(t)}
                      disabled={usingId === t.id}
                      className="w-full py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 rounded-lg hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <Sparkles size={14} /> {usingId === t.id ? "Using..." : "Use in Project"}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onPreview(t, "preview_preset")}
                        className="py-2 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg hover:bg-emerald-100 flex items-center justify-center gap-2"
                      >
                        <Eye size={14} /> Preview
                      </button>
                      <button
                        onClick={() => handleImportPreset(t)}
                        disabled={cloningId === t.id}
                        className="py-2 text-xs font-bold text-[#2B5E44] bg-[#2B5E44]/10 rounded-lg hover:bg-[#2B5E44]/15 flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        <Plus size={14} /> {cloningId === t.id ? "Importing..." : "Import"}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesView;


