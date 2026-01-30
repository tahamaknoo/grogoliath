"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Eye, Info, LayoutTemplate, Plus, Sparkles, Trash2, User, Edit3 } from "lucide-react";
import PRESET_TEMPLATES from "../../constants/presetTemplates";
import { supabase } from "../../../lib/supabaseClient";
import Badge from "../ui/Badge";
import Card from "../ui/Card";

const TemplatesView = ({ user, onNewTemplate, onPreview, onEditTemplate, onUseTemplate, refreshKey }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copyId, setCopyId] = useState(null);
  const [libraryFilter, setLibraryFilter] = useState("all");
  const [cloningId, setCloningId] = useState(null);

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

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Templates</h1>
          <p className="text-slate-500 mt-1">Design your page layouts.</p>
        </div>
        <button
          onClick={onNewTemplate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2 shadow-lg hover:bg-indigo-700 transition-all"
        >
          <Plus size={18} /> Create Template
        </button>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800 flex gap-3 items-center text-sm text-indigo-800 dark:text-indigo-300">
        <Info size={18} />
        <p>
          Build layouts using the drag-and-drop builder. Use <strong>{`{{Variable}}`}</strong> syntax to inject data from your CSV columns.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <User size={18} className="text-indigo-500" /> My Templates
        </h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            <p className="text-slate-500 mb-4">You haven't created any templates yet.</p>
            <button onClick={onNewTemplate} className="text-indigo-600 font-bold hover:underline">
              Create your first one
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={onNewTemplate}
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all group h-64"
            >
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                <Plus size={24} className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
              </div>
              <p className="font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">New Template</p>
            </button>

            {templates.map((t) => (
              <Card key={t.id} className="flex flex-col h-64 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group relative overflow-hidden">
                <div className="h-2 bg-indigo-500 w-full"></div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <LayoutTemplate size={20} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTemplate(t.id);
                      }}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{t.name}</h3>
                  <p className="text-sm text-slate-500">{t.structure?.length || 0} Blocks</p>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                  <button
                    onClick={() => onPreview(t, "preview_user")}
                    className="flex-1 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={14} /> Preview
                  </button>
                  <button
                    onClick={() => onUseTemplate?.(t)}
                    className="flex-1 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 rounded hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles size={14} /> Use
                  </button>
                  <button
                    onClick={() => onEditTemplate?.(t)}
                    className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleUse(t)}
                    className={`flex-1 py-2 text-xs font-bold rounded transition-all ${
                      copyId === t.id ? "bg-emerald-600 text-white hover:bg-emerald-700" : "text-slate-600 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {copyId === t.id ? "Copied!" : "Copy"}
                  </button>
                </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700"></div>

      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <BookOpen size={18} className="text-emerald-500" /> Template Library
        </h2>
        <p className="text-slate-500 text-sm mb-6">Start with a proven structure. Clone these to your library to customize.</p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setLibraryFilter("all")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
              libraryFilter === "all"
                ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                : "bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setLibraryFilter("premium")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
              libraryFilter === "premium"
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
            }`}
          >
            Premium
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRESET_TEMPLATES.filter((t) => (libraryFilter === "premium" ? t.category === "Premium" : true)).map((t) => (
            <Card key={t.id} className="flex flex-col h-64 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors group relative overflow-hidden">
              <div className="h-2 bg-emerald-500 w-full"></div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <LayoutTemplate size={20} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>

                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{t.name}</h3>
                <p className="text-sm text-slate-500">
                  {t.category} • {t.structure.length} Blocks
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                  <button
                    onClick={() => onPreview(t, "preview_preset")}
                    className="w-full py-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 rounded hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={14} /> Preview
                  </button>
                  <button
                    onClick={() => handleImportPreset(t)}
                    disabled={cloningId === t.id}
                    className="w-full py-2 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Plus size={14} /> {cloningId === t.id ? "Importing..." : "Import"}
                  </button>
                  <button
                    onClick={() => onUseTemplate?.(t)}
                    className="w-full py-2 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 rounded hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles size={14} /> Use
                  </button>
                </div>
              </div>
              <div className="absolute top-3 right-3">
                <Badge type="success">Preset</Badge>
                {t.category === "Premium" && <span className="ml-2"><Badge type="premium">Premium</Badge></span>}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplatesView;

