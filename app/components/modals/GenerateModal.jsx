"use client";

import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import PRESET_TEMPLATES from "../../constants/presetTemplates";
import { supabase } from "../../../lib/supabaseClient";

const GenerateModal = ({
  isOpen,
  onClose,
  project,
  onUpdateSuccess,
  profile,
  session,
  setProfile,
  initialTemplateId,
  autoStartFirstDraft = false,
  onStatusChange,
  expandSignal
}) => {
  const [prompt, setPrompt] = useState("");
  const [targetColumn, setTargetColumn] = useState("AI_Output");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logs, setLogs] = useState([]);
  const [userTemplates, setUserTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [confirmAfterFirst, setConfirmAfterFirst] = useState(true);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const [pendingIndexes, setPendingIndexes] = useState([]);
  const [blockSettings, setBlockSettings] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [clockNow, setClockNow] = useState(Date.now());
  const abortControllerRef = useRef(null);
  const autoStartRef = useRef(false);

  // ---------- Premium responsive style kit (inject if missing) ----------
  const STYLE_KIT = `
<style>
  :root{
    --bg:#0b1220;
    --surface:#0f172a;
    --card:#111c33;
    --text:#0f172a;
    --muted:#475569;
    --brand:#4f46e5;
    --brand2:#7c3aed;
    --ok:#10b981;
    --warn:#f59e0b;
    --border:rgba(15, 23, 42, .10);
    --radius:18px;
    --radius2:26px;
    --shadow:0 18px 50px rgba(2, 6, 23, .10);
    --shadow2:0 22px 70px rgba(2, 6, 23, .14);
    --max:1100px;
  }
  *{box-sizing:border-box}
  body{margin:0;font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, "Apple Color Emoji","Segoe UI Emoji";}
  img{max-width:100%;height:auto;display:block}
  a{text-decoration:none}
  .gg-wrap{width:100%;background:linear-gradient(180deg,#ffffff 0%, #f8fafc 55%, #ffffff 100%);color:var(--text)}
  .gg-container{max-width:var(--max);margin:0 auto;padding:0 18px}
  .gg-section{padding:64px 0}
  .gg-pill{display:inline-flex;gap:8px;align-items:center;padding:8px 12px;border-radius:999px;background:rgba(79,70,229,.08);color:#3730a3;font-weight:700;font-size:12px;border:1px solid rgba(79,70,229,.18)}
  .gg-h1{font-size:clamp(30px,4vw,48px);line-height:1.05;letter-spacing:-.02em;margin:14px 0 14px;font-weight:900}
  .gg-h2{font-size:clamp(22px,2.8vw,32px);line-height:1.1;letter-spacing:-.02em;margin:0 0 14px;font-weight:900}
  .gg-lead{font-size:clamp(15px,1.6vw,18px);line-height:1.6;color:var(--muted);margin:0 0 18px}
  .gg-grid{display:grid;gap:16px}
  .gg-grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}
  .gg-grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}
  .gg-grid-4{grid-template-columns:repeat(4,minmax(0,1fr))}
  .gg-card{background:#fff;border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow);padding:18px}
  .gg-card-strong{border-radius:var(--radius2);box-shadow:var(--shadow2)}
  .gg-kpi{display:flex;gap:10px;align-items:center}
  .gg-kpi b{font-size:18px}
  .gg-muted{color:var(--muted)}
  .gg-row{display:flex;gap:14px;flex-wrap:wrap;align-items:center}
  .gg-btn{display:inline-flex;gap:10px;align-items:center;justify-content:center;padding:12px 16px;border-radius:14px;font-weight:900;border:1px solid rgba(79,70,229,.22);background:linear-gradient(135deg,var(--brand),var(--brand2));color:#fff;box-shadow:0 18px 40px rgba(79,70,229,.20)}
  .gg-btn-ghost{background:#fff;color:#1e293b;border:1px solid rgba(15,23,42,.12);box-shadow:none}
  .gg-hero{padding:78px 0 52px}
  .gg-hero-wrap{display:grid;grid-template-columns:1.1fr .9fr;gap:22px;align-items:stretch}
  .gg-hero-card{background:linear-gradient(135deg, rgba(79,70,229,.10), rgba(124,58,237,.08));border:1px solid rgba(79,70,229,.18);border-radius:var(--radius2);padding:18px;box-shadow:var(--shadow2)}
  .gg-form{display:grid;gap:10px;margin-top:10px}
  .gg-input{width:100%;padding:12px 12px;border-radius:14px;border:1px solid rgba(15,23,42,.14);outline:none}
  .gg-input:focus{border-color:rgba(79,70,229,.55);box-shadow:0 0 0 4px rgba(79,70,229,.12)}
  .gg-badges{display:flex;flex-wrap:wrap;gap:10px}
  .gg-badge{padding:7px 10px;border-radius:999px;border:1px solid rgba(15,23,42,.12);background:#fff;font-weight:800;font-size:12px;color:#334155}
  .gg-steps{display:grid;gap:12px}
  .gg-step{display:flex;gap:12px;align-items:flex-start}
  .gg-step .n{width:32px;height:32px;border-radius:12px;background:rgba(79,70,229,.10);border:1px solid rgba(79,70,229,.18);display:flex;align-items:center;justify-content:center;font-weight:900;color:#3730a3;flex:0 0 auto}
  .gg-table{width:100%;border-collapse:separate;border-spacing:0;overflow:hidden;border-radius:18px;border:1px solid rgba(15,23,42,.12)}
  .gg-table th,.gg-table td{padding:12px 12px;border-bottom:1px solid rgba(15,23,42,.08);text-align:left;font-size:14px}
  .gg-table th{background:#f8fafc;font-weight:900;color:#0f172a}
  .gg-table tr:last-child td{border-bottom:none}
  .gg-faq{display:grid;gap:10px}
  .gg-faq details{border:1px solid rgba(15,23,42,.12);background:#fff;border-radius:16px;padding:12px 14px;box-shadow:var(--shadow)}
  .gg-faq summary{cursor:pointer;font-weight:900}
  @media (max-width: 960px){
    .gg-hero-wrap{grid-template-columns:1fr}
    .gg-grid-4{grid-template-columns:repeat(2,minmax(0,1fr))}
    .gg-grid-3{grid-template-columns:repeat(2,minmax(0,1fr))}
  }
  @media (max-width: 560px){
    .gg-section{padding:52px 0}
    .gg-grid-2,.gg-grid-3,.gg-grid-4{grid-template-columns:1fr}
    .gg-card{padding:16px}
  }
</style>
`.trim();

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
      words: 200,
      notes: ""
    };
  };

  const mergeBlockSettings = (template, incomingSettings = []) => {
    const incomingMap = new Map((incomingSettings || []).map((s) => [String(s.id), s]));
    return template.structure.map((b) => {
      const base = getDefaultBlockSetting(b);
      const incoming = incomingMap.get(String(b.id));
      if (!incoming) return base;
      return {
        ...base,
        ...incoming,
        id: b.id,
        notes: String(incoming.notes || "")
      };
    });
  };

  const buildStructurePrompt = (template, settings) =>
    template.structure
      .map((b) => {
        const s = settings.find((x) => String(x.id) === String(b.id)) || getDefaultBlockSetting(b);
        const note = String(s.notes || "").trim();
        if (s.mode === "manual") {
          return `[BLOCK: ${b.type}] Instructions: Use this placeholder verbatim: ${b.content}${note ? ` Editor note: ${note}` : ""}`;
        }
        return `[BLOCK: ${b.type}] Instructions: ${b.content} Target length: ~${s.words} words.${note ? ` Editor note: ${note}` : ""}`;
      })
      .join("\n\n");

  const buildPromptFromTemplate = (template, settings) => {
    const structurePrompt = buildStructurePrompt(template, settings);
    return `Generate a full HTML page based on this structure.

ABSOLUTE RULES:
- Return ONLY raw HTML in html_body (no markdown fences).
- Wrap everything inside: <main class="gg-wrap"> ... </main>
- Use <section class="gg-section"> for each section.
- The final HTML MUST contain AT LEAST 15 <section> blocks.
- Include a <style> block (premium responsive design system). If unsure, include modern, clean styles.

STRUCTURE:
${structurePrompt}`;
  };

  const rebuildPromptFromSettings = (settings, templateId = selectedTemplateId) => {
    if (!templateId) return;
    const template = [...PRESET_TEMPLATES, ...userTemplates].find((t) => t.id.toString() === templateId.toString());
    if (!template) return;
    setPrompt(buildPromptFromTemplate(template, settings));
  };

  const applyTemplateById = (id, templatesList, incomingSettings = []) => {
    if (!id) return;
    const template = templatesList.find((t) => t.id.toString() === id.toString());
    if (template) {
      const settings = mergeBlockSettings(template, incomingSettings);
      setBlockSettings(settings);
      setSelectedTemplateId(id.toString());
      setPrompt(buildPromptFromTemplate(template, settings));
    }
  };

  useEffect(() => {
    if (isOpen) {
      setLogs([]);
      setProgress({ current: 0, total: 0 });
      setTargetColumn("AI_Output");
      setAwaitingConfirm(false);
      setPendingIndexes([]);
      setIsMinimized(false);
      setStartedAt(null);
      autoStartRef.current = false;

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
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const templateId = initialTemplateId || project?.data?.details?.TemplateId;
    if (!templateId) return;
    const all = [...PRESET_TEMPLATES, ...userTemplates];
    if (all.length === 0) return;
    const savedSettings = Array.isArray(project?.data?.details?.BlockSettings) ? project.data.details.BlockSettings : [];
    applyTemplateById(templateId, all, savedSettings);
  }, [isOpen, initialTemplateId, project, userTemplates]);

  const handleTemplateSelect = (e) => {
    const id = e.target.value;
    if (!id) {
      setSelectedTemplateId("");
      setPrompt("");
      return;
    }
    applyTemplateById(id, [...PRESET_TEMPLATES, ...userTemplates]);
  };

  if (!isOpen || !project) return null;

  const rows = Array.isArray(project.data) ? project.data : project.data?.rows || [];
  const headers =
    project.data?.headers && project.data.headers.length > 0 ? project.data.headers : rows.length > 0 ? Object.keys(rows[0]) : [];

  const addLog = (message) => setLogs((prev) => [...prev, message]);

  // helper: extract JSON even if model adds extra text/fences
  const extractJson = (txt) => {
    if (typeof txt !== "string") throw new Error("No content returned");
    const start = txt.indexOf("{");
    const end = txt.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) throw new Error("No JSON found");
    return txt.slice(start, end + 1);
  };

  // QA helpers
  const stripMarkdownFences = (s) => {
    if (!s || typeof s !== "string") return "";
    // remove common fenced code blocks
    return s.replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, "")).replace(/```/g, "");
  };

  const countSections = (html) => {
    if (!html || typeof html !== "string") return 0;
    const matches = html.match(/<section\b/gi);
    return matches ? matches.length : 0;
  };

  const hasStyleTag = (html) => /<style\b/i.test(String(html || ""));
  const hasMain = (html) => /<main\b/i.test(String(html || ""));
  const hasMainWrap = (html) => /<main\b[^>]*class=["'][^"']*\bgg-wrap\b[^"']*["'][^>]*>/i.test(String(html || ""));

  const ensureStyleKit = (html) => {
    const h = String(html || "").trim();
    if (!h) return h;
    if (hasStyleTag(h)) return h;

    // inject style kit right after <main...> if possible, else prefix
    if (hasMain(h)) {
      return h.replace(/<main\b[^>]*>/i, (m) => `${m}\n${STYLE_KIT}\n`);
    }
    return `${STYLE_KIT}\n${h}`;
  };

  const normalizeMeta = (s) => {
    if (s === null || s === undefined) return "";
    const txt = String(s).replace(/\s+/g, " ").trim();
    return txt.slice(0, 160);
  };

  const slugify = (s) => {
    const raw = String(s || "")
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return raw || "page";
  };

  const isUrlSafeSlug = (slug) => {
    if (!slug || typeof slug !== "string") return false;
    // lowercase, numbers, hyphens only. no leading/trailing hyphen.
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim());
  };

  const ensureSchemaString = (schema) => {
    if (schema === null || schema === undefined) return "";
    const str = String(schema).trim();
    if (!str) return "";

    // Try parse. If fails, attempt to extract JSON block and parse that.
    try {
      JSON.parse(str);
      return str;
    } catch {
      try {
        const extracted = extractJson(str);
        JSON.parse(extracted);
        return extracted;
      } catch {
        return str; // keep as-is (we'll fail QA if required)
      }
    }
  };

  const validateOutput = (parsed) => {
    const errors = [];

    const html = String(parsed?.html_body || "").trim();
    const sections = countSections(html);

    if (!html) errors.push("html_body empty");
    if (!hasMain(html)) errors.push("missing <main> wrapper");
    if (hasMain(html) && !hasMainWrap(html)) errors.push('main wrapper must be: <main class="gg-wrap">');
    if (sections < 15) errors.push(`needs 15+ <section> (found ${sections})`);
    if (!hasStyleTag(html)) errors.push("missing <style> (or it must be injected)");

    const slug = String(parsed?.slug || "").trim();
    if (!slug) errors.push("missing slug");
    if (slug && !isUrlSafeSlug(slug)) errors.push("slug not URL-safe");

    const meta = String(parsed?.meta_description || "");
    if (meta.length > 160) errors.push("meta_description > 160 chars");

    const schema = String(parsed?.schema || "").trim();
    if (!schema) errors.push("missing schema");
    if (schema) {
      try {
        JSON.parse(schema);
      } catch {
        errors.push("schema not valid JSON");
      }
    }

    return errors;
  };

  const buildBasePrompt = () => `
You are an SEO page generator.

Return ONLY valid JSON in this exact structure:

{
  "slug": "string",
  "title": "string",
  "meta_description": "string",
  "schema": "string",
  "html_body": "string"
}

Rules:
- Return ONLY JSON (no extra commentary)
- slug must be URL-safe (lowercase, hyphens, no spaces)
- meta_description max 160 characters
- schema must be valid JSON-LD as a string
- html_body must be full HTML (NO markdown)
- html_body MUST wrap everything inside: <main class="gg-wrap"> ... </main>
- html_body MUST contain AT LEAST 15 <section class="gg-section"> blocks
- html_body MUST include a <style> block (premium responsive)

Content instructions:
${prompt}
`.trim();

  const injectRowVars = (text, row) => {
    let out = String(text || "");
    headers.forEach((h) => {
      const regex = new RegExp(`{{${h}}}`, "g");
      out = out.replace(regex, row?.[h] ?? "");
    });
    return out;
  };

  const summarizeErrors = (errs) => (Array.isArray(errs) ? errs.map((e) => `- ${e}`).join("\n") : "");

  const runGeneration = async (indexesToGenerate, { markComplete }) => {
    if (!profile) {
      alert("Profile not loaded yet. Please wait.");
      return;
    }

    if (!prompt) {
      alert("Please enter a prompt.");
      return;
    }

    if (rows.length === 0) {
      alert("No rows to generate content for.");
      return;
    }

    setIsGenerating(true);
    if (!startedAt) setStartedAt(Date.now());
    abortControllerRef.current = new AbortController();

    const newRows = [...rows];

    // generate only rows missing output (prefer targetColumn, fallback to html_body)
    const needsGen = (r) => {
      const tc = r?.[targetColumn];
      const hb = r?.html_body;
      const tcEmpty = tc === undefined || tc === null || String(tc).trim() === "";
      const hbEmpty = hb === undefined || hb === null || String(hb).trim() === "";
      return tcEmpty && hbEmpty;
    };

    if (indexesToGenerate.length === 0) {
      alert("Everything is already generated. Nothing to do.");
      setIsGenerating(false);
      abortControllerRef.current = null;
      return;
    }

    const pagesRemaining = profile.page_limit - profile.pages_used;
    const total = indexesToGenerate.length;

    if (total > pagesRemaining) {
      alert(`You can only generate ${pagesRemaining} more pages on your current plan.\n\nUpgrade to Pro to generate more.`);
      setIsGenerating(false);
      abortControllerRef.current = null;
      return;
    }

    setProgress({ current: 0, total });

    const generatedCols = ["slug", "title", "meta_description", "schema", "html_body", targetColumn].filter(Boolean);
    const newHeaders = Array.from(new Set([...headers, ...generatedCols]));

    let successCount = 0;

    try {
      for (let step = 0; step < total; step++) {
        const i = indexesToGenerate[step];
        if (abortControllerRef.current?.signal?.aborted) break;

        const row = newRows[i];

        // Build a stable "filledPrompt" per row
        const basePrompt = buildBasePrompt();
        const filledPrompt = injectRowVars(basePrompt, row);

        let attempt = 0;
        let finalParsed = null;
        let finalErrors = [];

        while (attempt < 3 && !abortControllerRef.current?.signal?.aborted) {
          attempt += 1;

          const attemptLabel = attempt === 1 ? "try 1/3" : `retry ${attempt}/3`;
          addLog(`Row ${i + 1}: generating (${attemptLabel})...`);

          const callPrompt =
            attempt === 1
              ? filledPrompt
              : injectRowVars(
                  `
Your previous output FAILED QA.

Fix it and return ONLY JSON in the required structure.

QA FAILURES:
${summarizeErrors(finalErrors)}

Hard requirements (must satisfy all):
- slug URL-safe lowercase hyphenated
- meta_description <= 160 chars
- schema must be valid JSON-LD (as a string)
- html_body must be full HTML (no markdown)
- html_body must include <main class="gg-wrap"> ... </main>
- html_body must include AT LEAST 15 <section class="gg-section"> blocks
- include a <style> block (premium responsive)

Here is the previous JSON (do not wrap in markdown). Modify it to pass QA:
${JSON.stringify(finalParsed || {}, null, 2)}
`.trim(),
                  row
                );

          try {
            const response = await fetch("/api/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: callPrompt }),
              signal: abortControllerRef.current.signal
            });

            const data = await response.json();
            if (!response.ok || data?.error) throw new Error(data?.error || "Server Error");

            const content = typeof data?.content === "string" ? data.content : "";
            let parsed;

            try {
              parsed = JSON.parse(content);
            } catch {
              parsed = JSON.parse(extractJson(content));
            }

            // post-process & sanitize
            const clean = {
              slug: slugify(parsed?.slug),
              title: String(parsed?.title || "").trim(),
              meta_description: normalizeMeta(parsed?.meta_description),
              schema: ensureSchemaString(parsed?.schema),
              html_body: stripMarkdownFences(parsed?.html_body)
            };

            // Ensure style kit exists (inject if missing)
            clean.html_body = ensureStyleKit(clean.html_body);

            // enforce main wrapper class if they forgot it BUT had <main>
            if (hasMain(clean.html_body) && !hasMainWrap(clean.html_body)) {
              clean.html_body = clean.html_body.replace(/<main\b([^>]*)>/i, (m, attrs) => {
                // if class exists, append gg-wrap; else add class
                if (/class\s*=\s*["'][^"']*["']/.test(attrs)) {
                  return `<main${attrs.replace(/class\s*=\s*["']([^"']*)["']/, (mm, cls) => ` class="${cls} gg-wrap"`)}>`;
                }
                return `<main class="gg-wrap"${attrs}>`;
              });
            }

            finalErrors = validateOutput(clean);
            finalParsed = clean;

            if (finalErrors.length === 0) {
              // success
              newRows[i] = {
                ...row,
                slug: clean.slug,
                title: clean.title,
                meta_description: clean.meta_description,
                schema: clean.schema,
                html_body: clean.html_body,
                [targetColumn]: clean.html_body,
                blocks: []
              };

              successCount += 1;
              addLog(`Row ${i + 1} (batch ${step + 1}/${total}): Success`);
              break;
            } else {
              addLog(`Row ${i + 1}: QA failed (${finalErrors.join(", ")})`);
            }
          } catch (err) {
            if (err?.name === "AbortError") break;
            addLog(`Row ${i + 1}: error (${String(err?.message || err)})`);
            // keep looping for retry unless aborted
          }
        }

        if (finalErrors.length > 0 && !newRows[i]?.[targetColumn]) {
          addLog(`Row ${i + 1} (batch ${step + 1}/${total}): Failed after retries`);
        }

        setProgress({ current: step + 1, total });
      }

      const wasAborted = abortControllerRef.current?.signal?.aborted;

      const updatedData = {
        rows: newRows,
        headers: newHeaders,
        platform: project.data?.platform || "Wordpress"
      };

      await supabase
        .from("projects")
        .update({
          data: updatedData,
          row_count: newRows.length,
          status: wasAborted || !markComplete ? "Draft" : "Completed"
        })
        .eq("id", project.id);

      onUpdateSuccess();

      if (successCount > 0) {
        const nextUsed = profile.pages_used + successCount;

        await supabase
          .from("profiles")
          .update({ pages_used: nextUsed })
          .eq("id", session.user.id);

        setProfile({ ...profile, pages_used: nextUsed });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
      setStartedAt(null);
      abortControllerRef.current = null;
    }
  };

  const handleGenerate = async () => {
    const newRows = [...rows];
    const needsGen = (r) => {
      const tc = r?.[targetColumn];
      const hb = r?.html_body;
      const tcEmpty = tc === undefined || tc === null || String(tc).trim() === "";
      const hbEmpty = hb === undefined || hb === null || String(hb).trim() === "";
      return tcEmpty && hbEmpty;
    };
    const indexesToGenerate = newRows
      .map((r, idx) => (needsGen(r) ? idx : null))
      .filter((v) => v !== null);

    if (confirmAfterFirst && !awaitingConfirm && indexesToGenerate.length > 1) {
      const [first, ...rest] = indexesToGenerate;
      await runGeneration([first], { markComplete: false });
      if (abortControllerRef.current?.signal?.aborted) return;
      setAwaitingConfirm(true);
      setPendingIndexes(rest);
      addLog("First page generated. Review it, then click Generate Remaining.");
      return;
    }

    await runGeneration(indexesToGenerate, { markComplete: true });
    setAwaitingConfirm(false);
    setPendingIndexes([]);
  };

  const handleGenerateRemaining = async () => {
    if (pendingIndexes.length === 0) return;
    await runGeneration(pendingIndexes, { markComplete: true });
    setAwaitingConfirm(false);
    setPendingIndexes([]);
  };

  useEffect(() => {
    if (!isOpen || !project || !autoStartFirstDraft) return;
    if (autoStartRef.current || isGenerating) return;
    autoStartRef.current = true;
    handleGenerate();
  }, [isOpen, project, autoStartFirstDraft]);

  useEffect(() => {
    onStatusChange?.({
      projectId: project?.id || null,
      projectName: project?.name || "",
      isGenerating,
      isMinimized,
      awaitingConfirm,
      progress,
      etaSeconds: estimateRemainingSeconds()
    });
  }, [project, isGenerating, isMinimized, awaitingConfirm, progress, startedAt, clockNow, onStatusChange]);

  useEffect(() => {
    if (!expandSignal) return;
    setIsMinimized(false);
  }, [expandSignal]);

  useEffect(() => {
    if (!isGenerating) return;
    const tick = setInterval(() => setClockNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [isGenerating]);

  const estimateRemainingSeconds = () => {
    if (!isGenerating || !startedAt || progress.current <= 0 || progress.total <= progress.current) return null;
    const elapsed = Math.max(1, Math.floor((clockNow - startedAt) / 1000));
    const avgPerRow = elapsed / progress.current;
    const remainingRows = progress.total - progress.current;
    return Math.max(1, Math.ceil(avgPerRow * remainingRows));
  };

  const formatDuration = (totalSeconds) => {
    if (!totalSeconds || totalSeconds < 1) return "under a minute";
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins < 1) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const etaSeconds = estimateRemainingSeconds();

  const handleCloseRequest = () => {
    if (!isGenerating) {
      onClose();
      return;
    }
    const shouldStop = confirm("Generation is still running. Stop it and close?");
    if (!shouldStop) {
      setIsMinimized(true);
      return;
    }
    abortControllerRef.current?.abort();
    addLog("Stopped by user");
    onClose();
  };

  if (isMinimized) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl border dark:border-slate-700 flex flex-col overflow-hidden">
        <div className="p-6 border-b dark:border-slate-700 flex justify-between">
          <h3 className="font-bold dark:text-white">Generate Content: {project.name}</h3>
          <div className="flex items-center gap-2">
            {isGenerating && (
              <button
                onClick={() => setIsMinimized(true)}
                className="px-2.5 py-1.5 text-xs rounded border border-[#2B5E44]/30 text-[#2B5E44] hover:bg-[#2B5E44]/10"
              >
                Minimize
              </button>
            )}
            <button onClick={handleCloseRequest}>
              <X />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold mb-2 dark:text-white">Target Column</label>
            <input
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white"
            />
            <p className="text-xs text-slate-500 mt-1">This is where the generated HTML is saved. Default is AI_Output.</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="confirmFirst"
              type="checkbox"
              checked={confirmAfterFirst}
              onChange={(e) => setConfirmAfterFirst(e.target.checked)}
            />
            <label htmlFor="confirmFirst" className="text-sm text-slate-600 dark:text-slate-300">
              Generate first page only, then confirm the rest
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold mb-2 dark:text-white">Load Template</label>
            <select
              value={selectedTemplateId}
              onChange={handleTemplateSelect}
              className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white"
            >
              <option value="">-- Select --</option>
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
          </div>

          {blockSettings.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold mb-2 dark:text-white">Block Content Settings</label>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2 dark:border-slate-700">
                {blockSettings.map((b) => (
                  <div key={b.id} className="flex items-center gap-2 text-xs">
                    <span className="w-24 capitalize text-slate-500">{b.label}</span>
                    <select
                      value={b.mode}
                      onChange={(e) => {
                        const next = blockSettings.map((x) =>
                          x.id === b.id ? { ...x, mode: e.target.value } : x
                        );
                        setBlockSettings(next);
                        rebuildPromptFromSettings(next);
                      }}
                      className="p-1 border rounded dark:bg-slate-700 dark:text-white"
                    >
                      <option value="ai">AI</option>
                      <option value="manual">Manual</option>
                    </select>
                    <select
                      value={b.words}
                      onChange={(e) => {
                        const next = blockSettings.map((x) =>
                          x.id === b.id ? { ...x, words: Number(e.target.value) } : x
                        );
                        setBlockSettings(next);
                        rebuildPromptFromSettings(next);
                      }}
                      className="p-1 border rounded dark:bg-slate-700 dark:text-white"
                      disabled={b.mode !== "ai"}
                    >
                      {[100, 150, 200, 250, 300, 400, 500].map((w) => (
                        <option key={w} value={w}>
                          {w}w
                        </option>
                      ))}
                    </select>
                    <input
                      value={b.notes || ""}
                      onChange={(e) => {
                        const next = blockSettings.map((x) =>
                          x.id === b.id ? { ...x, notes: e.target.value } : x
                        );
                        setBlockSettings(next);
                        rebuildPromptFromSettings(next);
                      }}
                      className="flex-1 min-w-[140px] p-1 border rounded dark:bg-slate-700 dark:text-white"
                      placeholder="Section notes"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">Choose which sections use AI and set a word count per block.</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold mb-2 dark:text-white">Prompt</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {headers.map((h) => (
                <button
                  key={h}
                  onClick={() => setPrompt((p) => p + ` {{${h}}} `)}
                  className="px-2 py-1 text-xs border rounded bg-slate-100 dark:bg-slate-800 dark:text-white"
                >
                  {`{{${h}}}`}
                </button>
              ))}
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 p-2 border rounded dark:bg-slate-700 dark:text-white"
            />
          </div>

          {(isGenerating || logs.length > 0) && (
            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded h-44 overflow-y-auto font-mono text-xs">
              <div className="mb-2">
                Progress: {progress.current}/{progress.total}
                {etaSeconds ? ` - ETA ${formatDuration(etaSeconds)}` : ""}
              </div>
              {logs.map((l, idx) => (
                <div key={idx}>{l}</div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t dark:border-slate-700 flex justify-end gap-2">
          <button onClick={handleCloseRequest} className="px-4 py-2 border rounded">
            Cancel
          </button>

          {isGenerating && (
            <button
              onClick={() => {
                abortControllerRef.current?.abort();
                addLog("Stopped by user");
              }}
              className="px-4 py-2 border rounded text-red-600 border-red-200 hover:bg-red-50"
            >
              Stop
            </button>
          )}

          <button
            onClick={awaitingConfirm ? handleGenerateRemaining : handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-[#2B5E44] text-white rounded hover:bg-[#234d37]"
          >
            {isGenerating ? "Generating..." : awaitingConfirm ? "Generate Remaining" : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateModal;

// --- 6. New Project Modal (Guided, no CSV required) ---
