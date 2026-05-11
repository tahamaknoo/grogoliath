"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { apiFetch } from "../../lib/apiFetch";
import PRESET_TEMPLATES from "../constants/presetTemplates";

const WORD_COUNTS = { short: 100, medium: 200, long: 400 };

// ── Style kit injected when model omits <style> ──────────────────────────────
const STYLE_KIT = `<style>
  :root{--text:#0f172a;--muted:#475569;--brand:#4f46e5;--brand2:#7c3aed;--border:rgba(15,23,42,.10);--radius:18px;--shadow:0 18px 50px rgba(2,6,23,.10);--max:1100px}
  *{box-sizing:border-box}
  body{margin:0;font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
  img{max-width:100%;height:auto;display:block}a{text-decoration:none}
  .gg-wrap{width:100%;background:linear-gradient(180deg,#fff 0%,#f8fafc 55%,#fff 100%);color:var(--text)}
  .gg-container{max-width:var(--max);margin:0 auto;padding:0 18px}
  .gg-section{padding:64px 0}
  .gg-h1{font-size:clamp(30px,4vw,48px);line-height:1.05;letter-spacing:-.02em;margin:14px 0;font-weight:900}
  .gg-h2{font-size:clamp(22px,2.8vw,32px);line-height:1.1;letter-spacing:-.02em;margin:0 0 14px;font-weight:900}
  .gg-lead{font-size:clamp(15px,1.6vw,18px);line-height:1.6;color:var(--muted);margin:0 0 18px}
  .gg-grid{display:grid;gap:16px}
  .gg-grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}
  .gg-grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}
  .gg-card{background:#fff;border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow);padding:18px}
  .gg-btn{display:inline-flex;gap:8px;align-items:center;padding:12px 20px;border-radius:14px;font-weight:900;background:linear-gradient(135deg,var(--brand),var(--brand2));color:#fff;border:none;cursor:pointer}
  .gg-btn-ghost{background:#fff;color:#1e293b;border:1px solid rgba(15,23,42,.12)}
  .gg-row{display:flex;gap:14px;flex-wrap:wrap;align-items:center}
  .gg-faq{display:grid;gap:10px}
  .gg-faq details{border:1px solid rgba(15,23,42,.12);background:#fff;border-radius:16px;padding:12px 14px}
  .gg-faq summary{cursor:pointer;font-weight:900}
  .gg-table{width:100%;border-collapse:separate;border-spacing:0;border-radius:18px;border:1px solid rgba(15,23,42,.12)}
  .gg-table th,.gg-table td{padding:12px;border-bottom:1px solid rgba(15,23,42,.08);text-align:left;font-size:14px}
  .gg-table th{background:#f8fafc;font-weight:900}
  @media(max-width:760px){.gg-grid-2,.gg-grid-3{grid-template-columns:1fr}.gg-section{padding:40px 0}}
</style>`;

// ── Pure helpers ─────────────────────────────────────────────────────────────
const slugify = (s) =>
  String(s || "").toLowerCase().trim()
    .replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-").replace(/^-|-$/g, "") || "page";

const stripMarkdownFences = (s) =>
  typeof s === "string"
    ? s.replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, "")).replace(/```/g, "")
    : "";

const countSections = (html) => (String(html || "").match(/<section\b/gi) || []).length;
const hasStyleTag  = (html) => /<style\b/i.test(String(html || ""));
const hasMain      = (html) => /<main\b/i.test(String(html || ""));
const hasMainWrap  = (html) =>
  /<main\b[^>]*class=["'][^"']*\bgg-wrap\b[^"']*["'][^>]*>/i.test(String(html || ""));
const isUrlSafeSlug = (s) =>
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(s || "").trim());

const normalizeMeta = (s) =>
  s == null ? "" : String(s).replace(/\s+/g, " ").trim().slice(0, 160);

const ensureSchemaString = (schema) => {
  if (schema == null) return "";
  const str = String(schema).trim();
  if (!str) return "";
  try { JSON.parse(str); return str; } catch { /* continue */ }
  try {
    const start = str.indexOf("{");
    const end   = str.lastIndexOf("}");
    if (start !== -1 && end > start) {
      const extracted = str.slice(start, end + 1);
      JSON.parse(extracted);
      return extracted;
    }
  } catch { /* fall through */ }
  return str;
};

const ensureStyleKit = (html) => {
  const h = String(html || "").trim();
  if (!h || hasStyleTag(h)) return h;
  if (hasMain(h)) return h.replace(/<main\b[^>]*>/i, (m) => `${m}\n${STYLE_KIT}\n`);
  return `${STYLE_KIT}\n${h}`;
};

const validateOutput = (parsed) => {
  const errors = [];
  const html = String(parsed?.html_body || "").trim();
  if (!html) errors.push("html_body empty");
  if (!hasMain(html)) errors.push("missing <main> wrapper");
  if (hasMain(html) && !hasMainWrap(html)) errors.push('main must have class="gg-wrap"');
  if (countSections(html) < 3) errors.push(`needs 3+ <section> blocks (found ${countSections(html)})`);
  const slug = String(parsed?.slug || "").trim();
  if (!slug) errors.push("missing slug");
  if (slug && !isUrlSafeSlug(slug)) errors.push("slug not URL-safe");
  const meta = String(parsed?.meta_description || "");
  if (meta.length > 160) errors.push("meta_description > 160 chars");
  const schema = String(parsed?.schema || "").trim();
  if (schema) { try { JSON.parse(schema); } catch { errors.push("schema invalid JSON"); } }
  return errors;
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function SimpleGenerate({ project, profile, session, setProfile, onUpdateSuccess, onClose }) {
  const [step, setStep]                   = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [userTemplates, setUserTemplates] = useState([]);
  const [aiSettings, setAiSettings]      = useState({ tone: "professional", length: "medium" });
  const [isGenerating, setIsGenerating]  = useState(false);
  const [progress, setProgress]          = useState({ current: 0, total: 0 });
  const [logs, setLogs]                  = useState([]);
  const [done, setDone]                  = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [previewPages, setPreviewPages]        = useState([]);
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);
  const abortRef  = useRef(null);
  const logsEnd   = useRef(null);

  // Derive row data from project
  const rows = Array.isArray(project?.data) ? project.data : project?.data?.rows || [];
  const headers =
    project?.data?.headers?.length > 0
      ? project.data.headers
      : rows.length > 0
      ? Object.keys(rows[0])
      : [];

  const needsGenRows = rows
    .map((r, idx) => ({ r, idx }))
    .filter(({ r }) => {
      const ai = r?.AI_Output;
      const hb = r?.html_body;
      return (!ai || String(ai).trim() === "") && (!hb || String(hb).trim() === "");
    });

  const progressPct = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("templates").select("*").order("created_at", { ascending: false });
      if (data) setUserTemplates(data);
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    logsEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (msg) => setLogs((prev) => [...prev, msg]);

  // Generate 3 sample previews so user can review quality before bulk run
  const generatePreviews = async () => {
    setIsGeneratingPreviews(true);
    setPreviewPages([]);
    const sampleRows = needsGenRows.slice(0, 3).map(({ r }) => r);
    const results = [];

    for (const row of sampleRows) {
      try {
        const prompt = buildRowPrompt(selectedTemplate, row);
        const res = await apiFetch("/api/generate", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ prompt }),
        });
        const data = await res.json();
        if (!res.ok || data?.error) throw new Error(data?.error || "API error");

        const content = typeof data?.content === "string" ? data.content : "";
        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch {
          const s = content.indexOf("{"); const e = content.lastIndexOf("}");
          if (s === -1 || e <= s) throw new Error("No JSON in response");
          parsed = JSON.parse(content.slice(s, e + 1));
        }

        const html = ensureStyleKit(stripMarkdownFences(parsed?.html_body));
        results.push({ title: parsed?.title || row?.Keyword || "Preview", slug: parsed?.slug || "preview", html });
      } catch (err) {
        console.error("[GG] Preview failed:", err);
        results.push({ title: "Preview failed", slug: "", html: `<p style="padding:2rem;color:red">Preview failed: ${err.message}</p>` });
      }
    }

    setPreviewPages(results);
    setIsGeneratingPreviews(false);
  };

  // Build the per-row prompt with tone + length settings applied
  const buildRowPrompt = (template, row) => {
    const wordCount = WORD_COUNTS[aiSettings.length] || 200;
    const toneNote  = `Write in a ${aiSettings.tone} tone.`;
    const manualTypes = new Set(["schema_service", "schema_blog", "image", "contact_form", "trust_badges"]);

    const structurePrompt = template.structure.map((b) => {
      if (manualTypes.has(b.type)) {
        return `[BLOCK: ${b.type}] Use this content verbatim:\n${b.content}`;
      }
      return `[BLOCK: ${b.type}] ${b.content} — Target: ~${wordCount} words. ${toneNote}`;
    }).join("\n\n");

    // Inject {{Variable}} placeholders from row data
    let filled = structurePrompt;
    headers.forEach((h) => {
      filled = filled.replace(new RegExp(`{{${h}}}`, "g"), row?.[h] ?? "");
    });

    return `You are an SEO page generator.

Return ONLY valid JSON — no markdown, no commentary, no code fences:
{
  "slug": "url-safe-slug",
  "title": "Page Title Here",
  "meta_description": "Under 160 characters",
  "schema": "{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"WebPage\\",\\"name\\":\\"...\\"}",
  "html_body": "<main class=\\"gg-wrap\\"><style>...</style><section class=\\"gg-section\\">...</section></main>"
}

html_body rules:
- Full HTML (NO markdown)
- Must open with: <main class="gg-wrap">
- Must close with: </main>
- Must include a <style> block with modern responsive CSS
- Must have AT LEAST 5 <section class="gg-section"> blocks
- Use CSS classes: gg-container, gg-section, gg-card, gg-btn, gg-grid, gg-h1, gg-h2, gg-lead, gg-row

Page content to generate:
${filled}`.trim();
  };

  // Core generation loop
  const generate = async () => {
    if (!selectedTemplate)         { alert("Please select a template first."); return; }
    if (!profile)                  { alert("Profile not loaded. Please wait."); return; }
    if (needsGenRows.length === 0) { alert("All rows already have content."); return; }

    const pagesRemaining = (profile.page_limit || 0) - (profile.pages_used || 0);
    if (needsGenRows.length > pagesRemaining) {
      alert(`Only ${pagesRemaining} pages remaining on your plan. Upgrade to generate more.`);
      return;
    }

    setIsGenerating(true);
    setDone(false);
    setLogs([]);
    setProgress({ current: 0, total: needsGenRows.length });
    abortRef.current = new AbortController();

    const newRows    = [...rows];
    const newHeaders = Array.from(new Set([...headers, "slug", "title", "meta_description", "schema", "html_body", "AI_Output"]));
    let successCount = 0;

    console.log(`[GG] ===== GENERATION START =====`);
    console.log(`[GG] Project id=${project.id} name="${project.name}"`);
    console.log(`[GG] Project data type:`, Array.isArray(project?.data) ? "array" : typeof project?.data);
    console.log(`[GG] Total rows in project:`, rows.length, `| Rows needing gen:`, needsGenRows.length);
    console.log(`[GG] Template:`, selectedTemplate?.name, `| Tone:`, aiSettings.tone, `| Length:`, aiSettings.length);
    console.log(`[GG] profile.page_limit=${profile?.page_limit} pages_used=${profile?.pages_used}`);

    try {
      for (let s = 0; s < needsGenRows.length; s++) {
        const { r: row, idx: rowIndex } = needsGenRows[s];
        if (abortRef.current?.signal?.aborted) break;

        console.log(`[GG] ----- Row ${s + 1}/${needsGenRows.length} (rowIndex=${rowIndex}) -----`);
        console.log(`[GG] Row data:`, row);

        const prompt  = buildRowPrompt(selectedTemplate, row);
        let attempt   = 0;
        let finalParsed = null;
        let finalErrors = [];

        while (attempt < 3 && !abortRef.current?.signal?.aborted) {
          attempt++;
          addLog(`Row ${s + 1}/${needsGenRows.length}: ${attempt === 1 ? "generating" : `retry ${attempt}/3`}...`);
          console.log(`[GG] Row ${s + 1} attempt ${attempt}: prompt length=${prompt.length}`);

          try {
            const callPrompt =
              attempt === 1
                ? prompt
                : `Your previous output failed QA.\n\nFailures:\n${finalErrors.map((e) => `- ${e}`).join("\n")}\n\nFix all issues and return valid JSON only.\n\nPrevious output:\n${JSON.stringify(finalParsed || {}, null, 2)}`;

            const res = await apiFetch("/api/generate", {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify({ prompt: callPrompt }),
              signal:  abortRef.current.signal,
            });

            const data = await res.json();
            if (!res.ok || data?.error) throw new Error(data?.error || "API error");

            const content = typeof data?.content === "string" ? data.content : "";
            console.log(`[GG] Row ${s + 1} attempt ${attempt}: response length=${content.length}`);

            let parsed;
            try {
              parsed = JSON.parse(content);
            } catch {
              const start = content.indexOf("{");
              const end   = content.lastIndexOf("}");
              if (start === -1 || end <= start) throw new Error("No JSON found in response");
              parsed = JSON.parse(content.slice(start, end + 1));
            }

            console.log(`[GG] Row ${s + 1}: parsed. slug="${parsed?.slug}" sections=${countSections(String(parsed?.html_body || ""))}`);

            const clean = {
              slug:             slugify(parsed?.slug),
              title:            String(parsed?.title || "").trim(),
              meta_description: normalizeMeta(parsed?.meta_description),
              schema:           ensureSchemaString(parsed?.schema),
              html_body:        stripMarkdownFences(parsed?.html_body),
            };

            // Auto-fix: generate fallback schema if missing
            if (!clean.schema) {
              clean.schema = JSON.stringify({
                "@context":  "https://schema.org",
                "@type":     "WebPage",
                "name":      clean.title || String(row?.Keyword || row?.keyword || row?.Service || "Page"),
                "description": clean.meta_description || "",
              });
              console.log(`[GG] Row ${s + 1}: auto-generated fallback schema`);
            }

            // Auto-fix: inject style kit if missing
            clean.html_body = ensureStyleKit(clean.html_body);

            // Auto-fix: add gg-wrap class to <main> if missing
            if (hasMain(clean.html_body) && !hasMainWrap(clean.html_body)) {
              clean.html_body = clean.html_body.replace(/<main\b([^>]*)>/i, (m, attrs) => {
                if (/class\s*=\s*["'][^"']*["']/.test(attrs)) {
                  return `<main${attrs.replace(/class\s*=\s*["']([^"']*)["']/, (mm, cls) => ` class="${cls} gg-wrap"`)}>`;
                }
                return `<main class="gg-wrap"${attrs}>`;
              });
            }

            finalErrors = validateOutput(clean);
            finalParsed = clean;
            console.log(`[GG] Row ${s + 1} QA: ${finalErrors.length === 0 ? "PASSED" : "FAILED: " + finalErrors.join(", ")}`);

            if (finalErrors.length === 0) {
              newRows[rowIndex] = {
                ...row,
                slug:             clean.slug,
                title:            clean.title,
                meta_description: clean.meta_description,
                schema:           clean.schema,
                html_body:        clean.html_body,
                AI_Output:        clean.html_body,
                blocks:           [],
              };
              successCount++;
              console.log(`[GG] Row ${s + 1} QA PASSED — saved to newRows[${rowIndex}]. successCount=${successCount}`);
              addLog(`Row ${s + 1}: Done`);
              break;
            } else {
              console.log(`[GG] Row ${s + 1} QA FAILED (attempt ${attempt}):`, finalErrors);
              addLog(`Row ${s + 1}: QA issues: ${finalErrors.join(", ")}`);
            }
          } catch (err) {
            if (err?.name === "AbortError") break;
            console.error(`[GG] Row ${s + 1} attempt ${attempt}:`, err);
            addLog(`Row ${s + 1}: Error: ${err.message}`);
          }
        }

        if (finalErrors.length > 0 && !newRows[rowIndex]?.AI_Output) {
          addLog(`Row ${s + 1}: Failed after ${attempt} attempts.`);
        }

        setProgress({ current: s + 1, total: needsGenRows.length });
      }

      const wasAborted = abortRef.current?.signal?.aborted;

      const updatedData = { rows: newRows, headers: newHeaders, platform: project.data?.platform || "Wordpress" };
      console.log(`[GG] ===== SAVING TO SUPABASE =====`);
      console.log(`[GG] project.id=${project.id} | successCount=${successCount} | wasAborted=${wasAborted}`);
      console.log(`[GG] newRows length=${newRows.length} | newHeaders:`, newHeaders);
      console.log(`[GG] Sample of newRows[0]:`, { ...newRows[0], html_body: newRows[0]?.html_body ? `[${newRows[0].html_body.length} chars]` : null });
      console.log(`[GG] updatedData structure:`, { rowCount: updatedData.rows?.length, headers: updatedData.headers, platform: updatedData.platform });

      const { data: updateData, error: updateError } = await supabase
        .from("projects")
        .update({
          data:      updatedData,
          row_count: newRows.length,
          status:    wasAborted ? "Draft" : "Completed",
        })
        .eq("id", project.id)
        .select();

      console.log(`[GG] Supabase UPDATE result:`, {
        success:     !updateError,
        error:       updateError,
        errorMessage: updateError?.message,
        errorCode:   updateError?.code,
        dataReturned: !!updateData,
        rowsReturned: updateData?.length,
      });

      if (updateError) {
        console.error(`[GG] SUPABASE SAVE FAILED:`, updateError);
        addLog(`Save error: ${updateError.message}`);
      } else {
        console.log(`[GG] Supabase save SUCCESS. Rows returned:`, updateData?.length);
      }

      onUpdateSuccess?.();

      if (successCount > 0) {
        const nextUsed = (profile.pages_used || 0) + successCount;
        console.log(`[GG] Updating profile pages_used: ${profile.pages_used} → ${nextUsed}`);
        const { error: profileError } = await supabase.from("profiles").update({ pages_used: nextUsed }).eq("id", session.user.id);
        if (profileError) console.error(`[GG] Profile update failed:`, profileError);
        else setProfile?.({ ...profile, pages_used: nextUsed });
      }

      console.log(`[GG] ===== GENERATION COMPLETE: ${successCount} pages saved =====`);
      addLog(wasAborted ? "Stopped." : `Complete: ${successCount} pages generated.`);
      setDone(!wasAborted);
    } catch (err) {
      console.error("[GG] Generation error:", err);
      addLog(`Fatal error: ${err.message}`);
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  };

  // ── UI ───────────────────────────────────────────────────────────────────────
  const STEPS = ["Template", "Settings", "Preview", "Confirm", "Generate"];

  const filteredPresets  = PRESET_TEMPLATES.filter((t) =>
    String(t.name || "").toLowerCase().includes(templateSearch.toLowerCase()));
  const filteredUserTmpl = userTemplates.filter((t) =>
    String(t.name || "").toLowerCase().includes(templateSearch.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border dark:border-slate-700 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-8 py-5 border-b dark:border-slate-700 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-bold text-lg dark:text-white">Generate Pages</h2>
            <p className="text-sm text-slate-500">{project?.name}: {needsGenRows.length} page{needsGenRows.length !== 1 ? "s" : ""} to generate</p>
          </div>
          <button onClick={onClose} disabled={isGenerating} className="text-slate-400 hover:text-slate-600 disabled:opacity-40 dark:text-[#fbfbfb]">
            <X size={20} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-8 py-4 border-b dark:border-slate-700 shrink-0">
          <div className="flex items-center">
            {STEPS.map((label, i) => {
              const n       = i + 1;
              const past    = step > n;
              const current = step === n;
              const future  = step < n;
              return (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      current ? "bg-[#2B5E44] text-white" :
                      past    ? "bg-emerald-100 text-[#2B5E44] dark:bg-emerald-900/40 dark:text-emerald-300" :
                                "bg-slate-100 dark:bg-slate-700 text-slate-400"
                    }`}>
                      {past ? <Check size={14} /> : n}
                    </div>
                    <span className={`text-xs mt-1 font-medium whitespace-nowrap ${
                      current ? "text-[#2B5E44]" : past ? "text-slate-500" : "text-slate-400"
                    }`}>{label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-3 mb-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                      <div className={`h-full bg-[#2B5E44] transition-all ${past || current ? "w-full" : "w-0"}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Step 1: Template ── */}
          {step === 1 && (
            <div className="p-8">
              <h3 className="font-bold text-xl dark:text-white mb-1">Choose a Template</h3>
              <p className="text-slate-500 mb-6">Pick the layout that best fits your pages</p>

              <input
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full mb-6 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2B5E44]/30"
              />

              {filteredUserTmpl.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 dark:text-[#fbfbfb]">My Templates</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredUserTmpl.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { setSelectedTemplate(t); setStep(2); }}
                        className={`text-left border-2 rounded-xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                          selectedTemplate?.id === t.id
                            ? "border-[#2B5E44] bg-[#2B5E44]/5"
                            : "border-slate-200 dark:border-slate-700 hover:border-[#2B5E44]/40"
                        }`}
                      >
                        <div className="font-semibold text-sm dark:text-white truncate">{t.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{t.category || "Custom"}</div>
                        <div className="text-xs text-slate-400 mt-1 dark:text-[#fbfbfb]">{t.structure?.length || 0} sections</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 dark:text-[#fbfbfb]">Preset Library</h4>
                {filteredPresets.length === 0 ? (
                  <p className="text-slate-400 text-sm dark:text-[#fbfbfb]">No presets match your search.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredPresets.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { setSelectedTemplate(t); setStep(2); }}
                        className={`text-left border-2 rounded-xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                          selectedTemplate?.id === t.id
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                        }`}
                      >
                        <div className="font-semibold text-sm dark:text-white truncate">{t.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{t.category}</div>
                        <div className="text-xs text-slate-400 mt-1 dark:text-[#fbfbfb]">{t.structure?.length || 0} sections</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Settings ── */}
          {step === 2 && (
            <div className="p-8 max-w-2xl">
              <h3 className="font-bold text-xl dark:text-white mb-1">Content Settings</h3>
              <p className="text-slate-500 mb-8">How should the AI write your content?</p>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold dark:text-white mb-3">Content Tone</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Professional", "Casual", "Friendly"].map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setAiSettings((s) => ({ ...s, tone: tone.toLowerCase() }))}
                        className={`p-4 border-2 rounded-xl text-sm font-semibold transition-all ${
                          aiSettings.tone === tone.toLowerCase()
                            ? "border-[#2B5E44] bg-[#2B5E44]/5 text-[#2B5E44]"
                            : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold dark:text-white mb-3">Content Length <span className="text-slate-400 font-normal dark:text-[#fbfbfb]">(per section)</span></label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "short",  label: "Short",  desc: "~100 words" },
                      { value: "medium", label: "Medium", desc: "~200 words" },
                      { value: "long",   label: "Long",   desc: "~400 words" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setAiSettings((s) => ({ ...s, length: opt.value }))}
                        className={`p-4 border-2 rounded-xl text-sm transition-all ${
                          aiSettings.length === opt.value
                            ? "border-[#2B5E44] bg-[#2B5E44]/5 text-[#2B5E44]"
                            : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        <div className="font-semibold">{opt.label}</div>
                        <div className="text-xs text-slate-500 mt-1">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-10">
                <button onClick={() => setStep(1)} className="px-5 py-2.5 border rounded-xl text-sm font-medium dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="px-5 py-2.5 bg-[#2B5E44] text-white rounded-xl text-sm font-bold hover:bg-[#234d37]">
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Preview ── */}
          {step === 3 && (
            <div className="p-8">
              <h3 className="font-bold text-xl dark:text-white mb-1">Preview Sample Pages</h3>
              <p className="text-slate-500 mb-6">
                Generate 3 sample pages to review quality before running the full batch.
              </p>

              {previewPages.length === 0 && !isGeneratingPreviews && (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                  <p className="text-slate-400 text-sm mb-4 dark:text-[#fbfbfb]">No previews yet. Takes about 30 seconds.</p>
                  <button
                    onClick={generatePreviews}
                    className="px-6 py-3 bg-[#2B5E44] text-white rounded-xl font-bold hover:bg-[#234d37] text-sm"
                  >
                    Generate 3 Preview Pages
                  </button>
                </div>
              )}

              {isGeneratingPreviews && (
                <div className="text-center py-16">
                  <Loader2 size={32} className="animate-spin text-[#2B5E44] mx-auto mb-4" />
                  <p className="font-semibold dark:text-white">Generating previews...</p>
                  <p className="text-sm text-slate-500 mt-1">This takes about 30 seconds</p>
                </div>
              )}

              {previewPages.length > 0 && (
                <div className="space-y-4">
                  {previewPages.map((preview, idx) => (
                    <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                      <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="font-semibold text-sm dark:text-white truncate">{preview.title}</span>
                        <span className="font-mono text-xs text-slate-400 truncate dark:text-[#fbfbfb]">/{preview.slug}</span>
                      </div>
                      <div className="h-80 overflow-hidden">
                        <iframe
                          srcDoc={preview.html}
                          sandbox="allow-scripts"
                          className="w-full h-full border-0 scale-[0.85] origin-top-left"
                          style={{ width: "117%", height: "117%" }}
                          title={`Preview ${idx + 1}`}
                          sandbox="allow-scripts"
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => { setStep(2); setPreviewPages([]); }}
                      className="px-5 py-2.5 border rounded-xl text-sm font-medium dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Change Settings
                    </button>
                    <button
                      onClick={generatePreviews}
                      className="px-5 py-2.5 border border-[#2B5E44] text-[#2B5E44] rounded-xl text-sm font-medium hover:bg-[#2B5E44]/5"
                    >
                      Regenerate
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      className="flex-1 px-6 py-2.5 bg-[#2B5E44] text-white rounded-xl text-sm font-bold hover:bg-[#234d37]"
                    >
                      Looks Good. Confirm &amp; Generate All {needsGenRows.length} Pages
                    </button>
                  </div>
                </div>
              )}

              {!isGeneratingPreviews && previewPages.length === 0 && (
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(2)} className="px-5 py-2.5 border rounded-xl text-sm font-medium dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="px-5 py-2.5 text-slate-500 text-sm hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Skip Preview →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Confirm ── */}
          {step === 4 && (
            <div className="p-8 max-w-2xl">
              <h3 className="font-bold text-xl dark:text-white mb-1">Ready to Generate</h3>
              <p className="text-slate-500 mb-6">Review your settings before we start</p>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 mb-6 grid grid-cols-2 gap-5 text-sm">
                {[
                  { label: "Template",    value: selectedTemplate?.name },
                  { label: "Pages",       value: needsGenRows.length },
                  { label: "Tone",        value: aiSettings.tone, capitalize: true },
                  { label: "Length",      value: `${aiSettings.length} (~${WORD_COUNTS[aiSettings.length]}w/section)`, capitalize: true },
                ].map(({ label, value, capitalize }) => (
                  <div key={label}>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1 dark:text-[#fbfbfb]">{label}</p>
                    <p className={`font-semibold dark:text-white ${capitalize ? "capitalize" : ""}`}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 mb-8 text-sm">
                <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Estimated time</p>
                <p className="text-amber-700 dark:text-amber-400">
                  About {Math.max(1, Math.ceil(needsGenRows.length * 15 / 60))} minute{needsGenRows.length > 4 ? "s" : ""} for {needsGenRows.length} page{needsGenRows.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="px-5 py-2.5 border rounded-xl text-sm font-medium dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                  Back
                </button>
                <button
                  onClick={() => { setStep(5); generate(); }}
                  className="px-6 py-2.5 bg-[#2B5E44] text-white rounded-xl text-sm font-bold hover:bg-[#234d37]"
                >
                  Generate {needsGenRows.length} Page{needsGenRows.length !== 1 ? "s" : ""}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 5: Generating ── */}
          {step === 5 && (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-1">
                {isGenerating
                  ? <Loader2 size={20} className="animate-spin text-[#2B5E44]" />
                  : <Check size={20} className={done ? "text-emerald-500" : "text-slate-400"} />
                }
                <h3 className="font-bold text-xl dark:text-white">
                  {isGenerating ? "Generating..." : done ? "Complete!" : "Stopped"}
                </h3>
              </div>

              <p className="text-slate-500 mb-6 ml-8">
                {isGenerating
                  ? `Processing page ${progress.current} of ${progress.total}`
                  : `${progress.current} of ${progress.total} pages processed`
                }
              </p>

              <div className="mb-6">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Progress</span>
                  <span>{progress.current} / {progress.total}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2B5E44] to-[#3d7a5b] rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Live log */}
              <div className="bg-slate-900 rounded-xl p-4 h-52 overflow-y-auto font-mono text-xs text-slate-300 space-y-0.5">
                {logs.length === 0 && <div className="text-slate-500">Starting...</div>}
                {logs.map((l, i) => <div key={i}>{l}</div>)}
                {isGenerating && <div className="text-emerald-400 animate-pulse">▋</div>}
                <div ref={logsEnd} />
              </div>

              <div className="mt-4 flex gap-3">
                {isGenerating && (
                  <button
                    onClick={() => { abortRef.current?.abort(); addLog("Stopped by user."); }}
                    className="px-4 py-2 text-sm border border-red-200 text-red-600 rounded-xl hover:bg-red-50"
                  >
                    Stop Generation
                  </button>
                )}
                {!isGenerating && done && (
                  <button onClick={onClose} className="px-5 py-2.5 bg-[#2B5E44] text-white rounded-xl text-sm font-bold hover:bg-[#234d37]">
                    Done. View Projects
                  </button>
                )}
                {!isGenerating && !done && (
                  <button onClick={() => setStep(4)} className="px-5 py-2.5 border rounded-xl text-sm font-medium dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                    Back
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
