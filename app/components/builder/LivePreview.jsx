"use client";
import React, { useMemo, useState } from "react";
import {
  LayoutTemplate,
  Monitor,
  Smartphone,
  CheckCircle2,
  ChevronDown,
  Code as CodeIcon,
  Image as ImageIcon,
  AlertCircle,
  Check,
  X,
  ShieldCheck,
  Users,
  Zap,
  Star,
  ThumbsUp,
  ThumbsDown,
  Workflow,
} from "lucide-react";

/**
 * LivePreview
 * mode:
 *  - "template" -> cleaner preview (no browser chrome, no copy button)
 *  - "page"     -> full preview chrome + copy HTML
 */
export default function LivePreview({ blocks = [], mode = "template" }) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState("desktop");
  const isMobile = viewMode === "mobile";

  const safeBlocks = Array.isArray(blocks) ? blocks : [];

  const generateHTML = () => {
    return safeBlocks
      .map(
        (b) =>
          `<!-- ${b?.type || "unknown"} -->\n<div class="block-${b?.type || "unknown"}">${escapeHtml(
            String(b?.content ?? "")
          )}</div>`
      )
      .join("\n\n");
  };

  const handleCopyHTML = async () => {
    try {
      await navigator.clipboard.writeText(generateHTML());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const hasBlocks = safeBlocks.length > 0;

  const containerWidth =
    viewMode === "mobile" ? "w-full max-w-sm" : "w-full max-w-6xl";
  const sectionPad = isMobile ? "px-4" : "px-5 sm:px-8 lg:px-14";
  const grid2 = isMobile ? "grid-cols-1" : "md:grid-cols-2";
  const grid3 = isMobile ? "grid-cols-1" : "md:grid-cols-3";
  const grid4 = isMobile ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-4";

  if (!hasBlocks) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 min-h-[400px] bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200 dark:bg-slate-900/30 dark:border-slate-700">
        <LayoutTemplate size={48} className="mb-4 opacity-20" />
        <p className="text-sm">Add blocks to build your page preview</p>
      </div>
    );
  }

  return (
    <div className={`mx-auto transition-all duration-300 flex flex-col ${containerWidth}`}>
      {/* Top chrome (only in page mode) */}
      {mode === "page" && (
        <div className="bg-slate-100 border border-b-0 border-slate-200 p-3 flex items-center justify-between gap-2 rounded-t-lg dark:bg-slate-900 dark:border-slate-700">
          <div className="flex items-center flex-1 gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 max-w-md bg-white h-6 rounded-md border border-slate-200 text-[10px] text-slate-400 flex items-center px-2 truncate dark:bg-slate-800 dark:border-slate-700">
              https://grogoliath.com/preview
            </div>
          </div>

          <div className="flex bg-white rounded-md border border-slate-200 p-0.5 dark:bg-slate-800 dark:border-slate-700">
            <button
              onClick={() => setViewMode("desktop")}
              className={`p-1.5 rounded ${
                viewMode === "desktop"
                  ? "bg-slate-100 text-indigo-600 dark:bg-slate-700"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Desktop View"
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`p-1.5 rounded ${
                viewMode === "mobile"
                  ? "bg-slate-100 text-indigo-600 dark:bg-slate-700"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Mobile View"
            >
              <Smartphone size={14} />
            </button>
          </div>

          <button
            onClick={handleCopyHTML}
            className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md hover:bg-indigo-100 transition-colors flex items-center gap-1 ml-2 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/40"
          >
            {copied ? <CheckCircle2 size={12} /> : <CodeIcon size={12} />}
            {copied ? "Copied!" : "Copy HTML"}
          </button>
        </div>
      )}

      {/* In template mode, still allow device toggle (because it matters for "professional") */}
      {mode === "template" && (
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Live Preview
          </div>
          <div className="flex bg-white rounded-md border border-slate-200 p-0.5 dark:bg-slate-800 dark:border-slate-700">
            <button
              onClick={() => setViewMode("desktop")}
              className={`p-1.5 rounded ${
                viewMode === "desktop"
                  ? "bg-slate-100 text-indigo-600 dark:bg-slate-700"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Desktop View"
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`p-1.5 rounded ${
                viewMode === "mobile"
                  ? "bg-slate-100 text-indigo-600 dark:bg-slate-700"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Mobile View"
            >
              <Smartphone size={14} />
            </button>
          </div>
        </div>
      )}

      <div
        className={`relative flex-1 bg-gradient-to-b from-white via-slate-50 to-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col ${
          mode === "page"
            ? viewMode === "mobile"
              ? "rounded-b-3xl border-8 border-slate-800 min-h-[600px]"
              : "rounded-b-lg min-h-[700px]"
            : viewMode === "mobile"
            ? "rounded-3xl border-8 border-slate-800 min-h-[600px]"
            : "rounded-2xl min-h-[700px]"
        } dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:border-slate-700`}
      >
        <div className="pointer-events-none absolute -top-32 right-6 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-500/10"></div>
        <div className="pointer-events-none absolute bottom-0 left-10 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-500/10"></div>
        <nav className={`border-b border-slate-100 py-4 flex justify-between items-center bg-white/90 backdrop-blur sticky top-0 z-10 dark:bg-slate-950/90 dark:border-slate-800 ${sectionPad}`}>
          <div className="font-bold text-lg text-slate-900 tracking-tight dark:text-white">
            Brand
          </div>
          {viewMode === "desktop" && (
            <div className="flex gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
              <span>Features</span>
              <span>Pricing</span>
              <span>Contact</span>
            </div>
          )}
          {viewMode === "mobile" ? (
            <div className="space-y-1">
              <div className="w-5 h-0.5 bg-slate-800 dark:bg-slate-200"></div>
              <div className="w-5 h-0.5 bg-slate-800 dark:bg-slate-200"></div>
              <div className="w-5 h-0.5 bg-slate-800 dark:bg-slate-200"></div>
            </div>
          ) : (
            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium dark:bg-white dark:text-slate-900">
              Get Started
            </button>
          )}
        </nav>

        <div className="flex-1 overflow-y-auto bg-transparent dark:bg-transparent">
          {safeBlocks.map((block) => {
            if (!block || !block.type) return null;

            const content = prettifyForPreview(block.content);
            const heroHeadline = block.type === "hero" ? formatHeroHeadline(block.content) : content;
            const heroSubhead = block.type === "hero" ? formatHeroSubhead(block.content) : "";

            switch (block.type) {
              case "header":
                return (
                  <section key={block.id} className={`py-6 ${sectionPad}`}>
                    <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-slate-400 font-bold">
                      <span>Service overview</span>
                      <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></span>
                    </div>
                    <div className={`mt-4 grid gap-4 ${grid2} items-stretch`}>
                      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-emerald-50 p-6 shadow-sm relative overflow-hidden dark:bg-slate-950 dark:from-slate-950 dark:to-slate-900 dark:border-slate-800">
                        <div className="absolute -right-10 -top-10 w-28 h-28 rounded-full bg-emerald-100/60 dark:bg-emerald-500/10"></div>
                        <div className="absolute -left-10 -bottom-10 w-24 h-24 rounded-full bg-indigo-100/60 dark:bg-indigo-500/10"></div>
                        <div className="relative">
                          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                            Section highlight
                          </div>
                          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-tight dark:text-white">
                            {content}
                          </h2>
                          <p className="text-sm text-slate-500 mt-2 dark:text-slate-300">
                            Clear, outcome-driven headline with a short supporting line.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                            {["Problem aware", "Solution focused", "Actionable"].map((item) => (
                              <span key={item} className="px-3 py-1.5 rounded-full bg-white/70 border border-slate-200 dark:bg-slate-900/70 dark:border-slate-800">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                        <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">Quick takeaway</div>
                        <p className="text-sm text-slate-600 leading-relaxed dark:text-slate-300">
                          Use this space to summarize the service value in a sentence or two and add a short proof point.
                        </p>
                        <div className="mt-4 space-y-2 text-xs text-slate-500">
                          {["Response time under 24 hours", "Clear next steps", "Transparent pricing"].map((item) => (
                            <div key={item} className="flex items-center gap-2">
                              <Check size={12} className="text-emerald-500" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                );

              case "hero":
                return (
                  <section
                    key={block.id}
                    className={`relative overflow-hidden py-14 sm:py-20 bg-gradient-to-br from-slate-50 via-white to-emerald-50 border-b border-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 dark:border-slate-800 ${sectionPad}`}
                  >
                    <div className="absolute -top-24 right-12 w-64 h-64 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/10"></div>
                    <div className="absolute -bottom-24 left-12 w-64 h-64 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-500/10"></div>
                    <div className={`relative grid gap-10 ${isMobile ? "grid-cols-1" : "lg:grid-cols-[1.1fr_0.9fr]"} items-center`}>
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200 text-xs font-bold text-slate-600 shadow-sm dark:bg-slate-900/70 dark:border-slate-800 dark:text-slate-200">
                          <Zap size={14} className="text-emerald-500" />
                          Premium launch ready
                        </div>
                        <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight dark:text-white">
                          {heroHeadline}
                        </h1>
                        <p className="text-sm sm:text-base text-slate-500 mb-6 dark:text-slate-300">
                          {heroSubhead || "Short, clear value statement with credibility and a fast path to action."}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button className="bg-gradient-to-r from-indigo-600 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 w-full sm:w-auto">
                            Start Now
                          </button>
                          <button className="border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold w-full sm:w-auto dark:border-slate-700 dark:text-slate-200">
                            See Demo
                          </button>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-500">
                          {["Trusted teams", "Fast setup", "Secure by design"].map((item) => (
                            <span key={item} className="px-3 py-1.5 rounded-full bg-white/70 border border-slate-200 dark:bg-slate-900/70 dark:border-slate-800">
                              {item}
                            </span>
                          ))}
                        </div>
                        <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                          <span className="text-slate-500">Trusted by</span>
                          {["Northwind", "Apex", "Atlas", "Nimbus"].map((brand) => (
                            <span key={brand} className="px-2.5 py-1 rounded-full bg-white/70 border border-slate-200 font-semibold text-slate-500 dark:bg-slate-900/70 dark:border-slate-800 dark:text-slate-300">
                              {brand}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="relative">
                        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-2xl dark:bg-slate-950/80 dark:border-slate-800">
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Instant estimate</span>
                            <span>Responds in 24h</span>
                          </div>
                          <div className="space-y-3">
                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                              <div className="text-xs font-semibold text-slate-500">Project type</div>
                              <div className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">Service landing page</div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                              <div className="text-xs font-semibold text-slate-500">Timeline</div>
                              <div className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">2-3 weeks</div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                              <div className="text-xs font-semibold text-slate-500">What you get</div>
                              <div className="mt-2 space-y-2 text-xs text-slate-500">
                                {["Conversion-focused copy", "SEO-ready structure", "Lead capture CTA"].map((item) => (
                                  <div key={item} className="flex items-center gap-2">
                                    <Check size={12} className="text-emerald-500" />
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <button className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-500 text-white text-sm font-bold py-3 shadow-lg">
                              Get my plan
                            </button>
                            <div className="text-[11px] text-slate-400 text-center">
                              Rated 4.9/5 from 1200+ service teams
                            </div>
                          </div>
                        </div>
                        {!isMobile && (
                          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-emerald-300/20 blur-2xl"></div>
                        )}
                      </div>
                    </div>
                  </section>
                );

              case "text":
                return (
                  <section key={block.id} className={`py-6 ${sectionPad}`}>
                    <div className={`grid gap-6 ${grid2}`}>
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Insight</span>
                          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></span>
                        </div>
                        <p
                          className="text-sm sm:text-base text-slate-700 leading-relaxed dark:text-slate-200"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}
                        >
                          {content}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                          {["Outcome focused", "Clear structure", "SEO aligned"].map((item) => (
                            <div key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:bg-slate-900/40 dark:border-slate-800">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-indigo-50 p-6 shadow-sm dark:bg-slate-950 dark:from-slate-950 dark:to-slate-900 dark:border-slate-800">
                        <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Service outcomes</div>
                        <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                          {["Clear next steps", "Proof-backed approach", "Fast turnaround"].map((item) => (
                            <div key={item} className="flex items-center gap-2">
                              <CheckCircle2 size={14} className="text-emerald-500" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 dark:bg-slate-900/40 dark:border-slate-800">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">Pro tip:</span> Add a short proof line or mini case study here.
                        </div>
                      </div>
                    </div>
                  </section>
                );

              case "columns_2": {
                const cols = parseColumns(content, 2);
                return (
                  <section key={block.id} className={`py-6 ${sectionPad}`}>
                    <div className={`grid gap-4 ${grid2}`}>
                      {cols.map((item, idx) => (
                        <div
                          key={idx}
                          className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden dark:bg-slate-950 dark:border-slate-800"
                        >
                          <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-indigo-100/60 dark:bg-indigo-500/10"></div>
                          <div className="relative">
                            <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                              <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                                {idx + 1}
                              </span>
                              Column {idx + 1}
                            </div>
                            <p className="text-sm sm:text-base text-slate-700 leading-relaxed dark:text-slate-200">
                              {item}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                              {["Outcome", "Proof", "CTA"].map((label) => (
                                <span key={label} className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900/40">
                                  {label}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              case "grid_2x2": {
                const cells = parseGrid(content, 4);
                return (
                  <section key={block.id} className={`py-6 ${sectionPad}`}>
                    <div className={`grid gap-4 ${isMobile ? "grid-cols-1" : "sm:grid-cols-2"}`}>
                      {cells.map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-5 shadow-sm dark:bg-slate-950 dark:from-slate-950 dark:to-slate-900 dark:border-slate-800"
                        >
                          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                            <span>Item {idx + 1}</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          </div>
                          <p className="text-sm sm:text-base text-slate-700 leading-relaxed dark:text-slate-200">
                            {item}
                          </p>
                          <div className="mt-3 h-1 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400"></div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              case "image":
                return (() => {
                  const label = content.includes("<") ? "Image placeholder" : content;
                  return (
                  <section key={block.id} className={`py-6 ${sectionPad}`}>
                    <div className="w-full h-48 sm:h-64 md:h-[360px] rounded-3xl border border-slate-200 overflow-hidden relative group bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 dark:border-slate-800">
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                        <ImageIcon size={36} />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-70"></div>
                      <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 border border-slate-200 p-4 shadow-lg dark:bg-slate-950/80 dark:border-slate-800">
                        <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Visual</div>
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {label || "Image placeholder"}
                        </div>
                      </div>
                    </div>
                  </section>
                  );
                })();

              case "pain_point":
                return (
                  <section key={block.id} className={`py-8 bg-red-50/40 dark:bg-red-900/10 ${sectionPad}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-red-800 flex gap-2 items-center dark:text-red-300">
                        <AlertCircle size={18} /> Pain points
                      </h3>
                      <span className="text-xs text-red-400 uppercase tracking-wider font-bold">Common blockers</span>
                    </div>
                    <div className={`grid gap-4 ${grid3}`}>
                      {parseList(content, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm dark:bg-slate-950 dark:border-red-900/30"
                        >
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                            <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold dark:bg-red-900/30">
                              {idx + 1}
                            </span>
                            Challenge
                          </div>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                );

              case "solution":
                return (
                  <section key={block.id} className={`py-8 bg-emerald-50/40 dark:bg-emerald-900/10 ${sectionPad}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-emerald-800 flex gap-2 items-center dark:text-emerald-300">
                        <CheckCircle2 size={18} /> Solution path
                      </h3>
                      <span className="text-xs text-emerald-500 uppercase tracking-wider font-bold">Proven wins</span>
                    </div>
                    <div className={`grid gap-4 ${grid3}`}>
                      {parseList(content, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm dark:bg-slate-950 dark:border-emerald-900/30"
                        >
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            Outcome
                          </div>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                );

              case "usp": {
                const items = parseList(content, 4);
                return (
                  <section key={block.id} className={`py-8 ${sectionPad}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Why teams choose us</h3>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">USP</span>
                    </div>
                    <div className={`grid gap-4 ${grid4}`}>
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-950 dark:border-slate-800"
                        >
                          <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
                            Advantage {idx + 1}
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-200">{item}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              case "stats": {
                const stats = parseList(content, 3);
                return (
                  <section key={block.id} className={`py-8 ${sectionPad}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Proof and impact</h3>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Results</span>
                    </div>
                    <div className={`grid gap-4 ${grid3}`}>
                      {stats.map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-950 dark:border-slate-800"
                        >
                          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {18 + idx * 12}%
                          </div>
                          <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mt-1">
                            Lift
                          </div>
                          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{item}</p>
                          <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-900">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-indigo-500" style={{ width: `${70 - idx * 8}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              case "pricing":
                return (
                  <section key={block.id} className={`py-12 bg-slate-50 dark:bg-slate-900/30 ${sectionPad}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Transparent pricing</div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Plans built for growth</h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800">Monthly</span>
                        <span className="px-3 py-1.5 rounded-full bg-slate-900 text-white">Annual -15%</span>
                      </div>
                    </div>
                    <div className={`grid gap-5 ${grid3}`}>
                      {[
                        { name: "Starter", price: "$29", tagline: "For new teams", chips: ["Email support", "Starter templates"] },
                        { name: "Pro", price: "$99", highlight: true, tagline: "Most popular", chips: ["Priority support", "Premium layouts"] },
                        { name: "Enterprise", price: "$299", tagline: "Custom scale", chips: ["Dedicated manager", "Custom SLAs"] },
                      ].map((plan, i) => (
                        <div
                          key={i}
                          className={`relative bg-white p-6 rounded-3xl border shadow-sm dark:bg-slate-950 dark:border-slate-800 ${
                            plan.highlight
                              ? "border-indigo-500 shadow-xl"
                              : "border-slate-200"
                          }`}
                        >
                          {plan.highlight && (
                            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white">
                              Most popular
                            </div>
                          )}
                          <div className="text-slate-500 text-xs font-bold uppercase mb-2">{plan.name}</div>
                          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{plan.price}</div>
                          <div className="text-xs text-slate-500 mt-1">{plan.tagline}</div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {plan.chips.map((chip) => (
                              <span key={chip} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
                                {chip}
                              </span>
                            ))}
                          </div>
                          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                            {["Unlimited projects", "AI first draft", "Premium layouts"].map((feat) => (
                              <li key={feat} className="flex items-center gap-2">
                                <Check size={14} className="text-emerald-500" />
                                {feat}
                              </li>
                            ))}
                          </ul>
                          <button className={`mt-5 w-full py-2.5 rounded-xl text-sm font-bold ${
                            plan.highlight
                              ? "bg-gradient-to-r from-indigo-600 to-emerald-500 text-white"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200"
                          }`}>
                            Select plan
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                );

              case "cta":
                return (
                  <section key={block.id} className={`relative overflow-hidden py-12 bg-gradient-to-r from-indigo-600 via-emerald-500 to-teal-500 text-white ${sectionPad}`}>
                    <div className="absolute -top-20 right-10 w-48 h-48 rounded-full bg-white/15 blur-3xl"></div>
                    <div className="absolute -bottom-24 left-10 w-56 h-56 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="relative rounded-3xl border border-white/25 bg-white/10 p-8 shadow-xl">
                      <div className={`grid gap-6 ${grid2} items-center`}>
                        <div>
                          <div className="text-xs uppercase tracking-wider text-white/70 font-bold">Ready to launch</div>
                          <h3 className="text-2xl sm:text-3xl font-bold mt-2">{content}</h3>
                          <p className="text-sm text-white/80 mt-3">
                            Move from draft to live pages in minutes with a service page layout that converts.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/80">
                            {["No setup fees", "Fast onboarding", "Guided launch"].map((item) => (
                              <span key={item} className="px-3 py-1.5 rounded-full bg-white/15 border border-white/20">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg">
                            Get Started
                          </button>
                          <button className="border border-white/50 px-6 py-3 rounded-xl font-bold">
                            Talk to sales
                          </button>
                          <div className="text-xs text-white/70">
                            Trusted by teams shipping thousands of pages every month.
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                );

              case "faq_auto":
                return (
                  <section key={block.id} className={`py-10 ${sectionPad}`}>
                    <h3 className="text-xl font-bold mb-6 text-center text-slate-900 dark:text-white">FAQ</h3>
                    <div className="space-y-3">
                      {parseList(content, 3).map((item, i) => (
                        <details
                          key={i}
                          className="bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-950 dark:border-slate-800"
                        >
                          <summary className="flex justify-between items-center cursor-pointer p-4 font-semibold text-slate-900 text-sm dark:text-white">
                            <span>Question {i + 1}: {item}</span>
                            <ChevronDown size={16} className="text-slate-400" />
                          </summary>
                          <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-300">
                            Short, direct answer focused on clarity and trust.
                          </div>
                        </details>
                      ))}
                    </div>
                  </section>
                );

              case "trust_badges":
                return (
                  <section
                    key={block.id}
                    className="py-10 border-y border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30"
                  >
                    <div className={`max-w-6xl mx-auto ${sectionPad}`}>
                      <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">
                        Trusted by industry leaders
                      </p>
                      <div className="flex flex-wrap justify-center gap-4">
                        {[
                          { label: "Secure", icon: ShieldCheck },
                          { label: "Team ready", icon: Users },
                          { label: "Fast setup", icon: Zap },
                          { label: "Verified", icon: CheckCircle2 },
                        ].map((badge) => (
                          <div
                            key={badge.label}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 text-sm font-semibold shadow-sm dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300"
                          >
                            <badge.icon size={16} className="text-emerald-500" />
                            {badge.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                );

              case "contact_form":
                return (
                  <section key={block.id} className={`py-12 bg-slate-50 dark:bg-slate-900/30 ${sectionPad}`}>
                    <div className={`grid gap-6 ${grid2} max-w-4xl mx-auto`}>
                      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Book a consultation</h3>
                        <p className="text-sm text-slate-500 mt-2 dark:text-slate-300">
                          Share your goals and we will respond within 24 hours.
                        </p>
                        <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            Dedicated onboarding specialist
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            Custom SEO roadmap
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            Private strategy call
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                        <div className="grid gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
                            <input
                              type="text"
                              className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-900 dark:border-slate-800"
                              placeholder="Your name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                            <input
                              type="email"
                              className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-900 dark:border-slate-800"
                              placeholder="name@example.com"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Project goal</label>
                            <textarea
                              className="w-full p-3 border rounded-xl bg-slate-50 h-24 dark:bg-slate-900 dark:border-slate-800"
                              placeholder="Tell us what you are building"
                            ></textarea>
                          </div>
                          <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                            Send request
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                );

              case "comparison":
                return (
                  <section key={block.id} className={`py-10 ${sectionPad}`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Comparison</h3>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Decision table</span>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-950 dark:border-slate-800">
                      <table className="min-w-[520px] w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 border-b dark:bg-slate-900/40 dark:border-slate-800">
                          <tr>
                            <th className="px-6 py-3">Feature</th>
                            <th className="px-6 py-3 text-emerald-600 font-bold">GroGoliath</th>
                            <th className="px-6 py-3">Alternatives</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-slate-800">
                          {[1, 2, 3].map((r) => (
                            <tr key={r} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                              <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                                Feature {r}
                              </td>
                              <td className="px-6 py-4 text-emerald-600">
                                <Check size={16} />
                              </td>
                              <td className="px-6 py-4 text-red-400">
                                <X size={16} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                );

              case "pros_cons":
                return (
                  <section key={block.id} className={`py-6 ${sectionPad}`}>
                    {(() => {
                      const items = parseList(content, 4);
                      const pros = items.slice(0, 2);
                      const cons = items.slice(2, 4);
                      return (
                    <div className={`grid gap-6 ${grid2}`}>
                      <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl shadow-sm dark:bg-emerald-900/10 dark:border-emerald-900/30">
                        <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2 dark:text-emerald-300">
                          <ThumbsUp size={16} /> Pros
                        </h4>
                            <ul className="space-y-2 text-emerald-700 text-sm dark:text-emerald-200">
                              {pros.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <Check size={14} className="mt-0.5" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-red-50 border border-red-100 p-6 rounded-2xl shadow-sm dark:bg-red-900/10 dark:border-red-900/30">
                            <h4 className="font-bold text-red-800 mb-4 flex items-center gap-2 dark:text-red-300">
                              <ThumbsDown size={16} /> Cons
                            </h4>
                            <ul className="space-y-2 text-red-700 text-sm dark:text-red-200">
                              {cons.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <X size={14} className="mt-0.5" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })()}
                  </section>
                );

              case "process":
                return (
                  <section key={block.id} className={`py-10 ${sectionPad}`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">How it works</h3>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Process</span>
                    </div>
                    <div className={`grid gap-4 ${grid3}`}>
                      {parseList(content, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className="relative p-6 border rounded-2xl bg-white shadow-sm dark:bg-slate-950 dark:border-slate-800"
                        >
                          <div className="w-10 h-10 bg-indigo-600/10 text-indigo-600 rounded-xl flex items-center justify-center font-bold mb-4">
                            {idx + 1}
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white">
                            Step {idx + 1}
                          </h4>
                          <p className="text-sm text-slate-500 mt-2 dark:text-slate-300">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                );

              case "social_proof":
                return (
                  <section key={block.id} className={`py-10 bg-slate-50 dark:bg-slate-900/30 ${sectionPad}`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">What customers say</h3>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} size={16} />
                        ))}
                      </div>
                    </div>
                    <div className={`grid gap-4 ${grid3}`}>
                      {parseList(content, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-950 dark:border-slate-800"
                        >
                          <blockquote className="text-sm text-slate-700 dark:text-slate-200">"{item}"</blockquote>
                          <div className="mt-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-500"></div>
                            <div className="text-xs text-slate-500">
                              <div className="font-semibold text-slate-800 dark:text-slate-100">Customer {idx + 1}</div>
                              <div>Operations Lead</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );

              case "case_study":
                return (
                  <section key={block.id} className={`py-10 ${sectionPad}`}>
                    <div className={`grid gap-6 ${grid2} items-center rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:bg-slate-950 dark:border-slate-800`}>
                      <div>
                        <div className="text-indigo-600 font-bold text-xs uppercase tracking-wide mb-2">
                          Case Study
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4 dark:text-white">
                          {content || "How Client X doubled organic lead flow"}
                        </h3>
                        <p className="text-slate-600 mb-6 dark:text-slate-300">
                          Short story arc: challenge, solution, and the measurable outcome delivered.
                        </p>
                        <button className="text-indigo-600 font-bold hover:underline flex items-center gap-2">
                          Read Story <Workflow size={16} />
                        </button>
                      </div>
                      <div className="grid gap-3">
                        {[
                          { label: "Lead lift", value: "+128%" },
                          { label: "Launch time", value: "14 days" },
                          { label: "Pages shipped", value: "250" }
                        ].map((metric) => (
                          <div
                            key={metric.label}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:bg-slate-900/40 dark:border-slate-800"
                          >
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{metric.value}</div>
                            <div className="text-xs text-slate-500">{metric.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                );

              // schema blocks
              case "schema_service":
              case "schema_blog":
                return (
                  <div key={block.id} className={`${sectionPad} py-4`}>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 font-mono dark:bg-amber-900/10 dark:border-amber-900/30 dark:text-amber-200">
                      Hidden Schema: {block.type}
                    </div>
                  </div>
                );

              default:
                return (
                  <div
                    key={block.id}
                    className="p-6 text-center border-b border-slate-100 dark:border-slate-800"
                  >
                    <p className="text-slate-400 font-mono text-xs">
                      Block: {block.type}
                    </p>
                  </div>
                );
            }
          })}

          <footer className={`bg-slate-900 text-slate-500 py-8 text-center text-xs mt-auto dark:bg-black ${sectionPad}`}>
            <p>(c) 2026 GroGoliath. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

/* Helpers */
function prettifyForPreview(value) {
  const s = String(value ?? "").trim();

  // strip common instruction prefixes so it looks more like real copy
  const cleaned = s
    .replace(/^H1:\s*/i, "")
    .replace(/^H2:\s*/i, "")
    .replace(/^H3:\s*/i, "")
    .replace(/^Hero Title:\s*/i, "")
    .replace(/^Image Description:\s*/i, "")
    .replace(/\s*Theme:\s*.*$/i, "")
    .replace(/\s*Style:\s*.*$/i, "")
    .replace(/\s*Interaction:\s*.*$/i, "")
    .trim();

  // keep it readable in preview
  return cleaned.length > 220 ? cleaned.slice(0, 220) + "..." : cleaned;
}

function formatHeroHeadline(value) {
  const raw = String(value ?? "").trim();
  const tokens = extractTokens(raw);

  if (tokens.includes("Service") && tokens.includes("City")) {
    return `Expert {{Service}} in {{City}} you can trust`;
  }
  if (tokens.includes("PracticeArea") && tokens.includes("LawFirm")) {
    return `{{LawFirm}} - {{PracticeArea}} guidance you can rely on`;
  }
  if (tokens.includes("Agent") && tokens.includes("City")) {
    return `{{Agent}} helps you buy and sell in {{City}}`;
  }
  if (tokens.includes("Restaurant") && tokens.includes("City")) {
    return `Experience {{Restaurant}} in {{City}}`;
  }
  if (tokens.includes("Studio") && tokens.includes("City")) {
    return `Train with {{Studio}} in {{City}}`;
  }
  if (tokens.includes("Shop") && tokens.includes("Service")) {
    return `{{Service}} for your car, done right`;
  }
  if (tokens.includes("Product") && tokens.includes("Integration")) {
    return `Connect {{Product}} with {{Integration}} in minutes`;
  }
  if (tokens.includes("Product")) {
    return `Grow faster with {{Product}}`;
  }
  if (tokens.includes("Company")) {
    return `{{Company}} builds pages that convert`;
  }

  let s = raw
    .replace(/^H1:\s*/i, "")
    .replace(/^Hero( Title)?:\s*/i, "")
    .replace(/^Hero for\s*/i, "")
    .replace(/\s*Theme:\s*.*$/i, "")
    .replace(/\s*Style:\s*.*$/i, "")
    .replace(/\s*Interaction:\s*.*$/i, "")
    .replace(/\s*Desktop.*$/i, "")
    .replace(/\s*Mobile.*$/i, "")
    .replace(/\s*\(.*?CTA.*?\)/i, "")
    .trim();

  if (!s) return "Grow faster with a service page that converts";
  if (s.length > 90) s = s.slice(0, 90) + "...";
  return s;
}

function formatHeroSubhead(value) {
  const raw = String(value ?? "").trim();
  const cleaned = raw
    .replace(/^H1:\s*/i, "")
    .replace(/^Hero( Title)?:\s*/i, "")
    .replace(/\s*Theme:\s*.*$/i, "")
    .replace(/\s*Style:\s*.*$/i, "")
    .replace(/\s*Interaction:\s*.*$/i, "")
    .replace(/\s*Desktop.*$/i, "")
    .replace(/\s*Mobile.*$/i, "")
    .trim();

  if (!cleaned) {
    return "A conversion-first service page with proof, benefits, and a clear next step.";
  }

  if (cleaned.length > 140) {
    return cleaned.slice(0, 140).replace(/\.$/, "") + "...";
  }
  return cleaned;
}

function extractTokens(value) {
  const tokens = [];
  const regex = /\{\{([^}]+)\}\}/g;
  let match = regex.exec(value);
  while (match) {
    tokens.push(match[1]);
    match = regex.exec(value);
  }
  return tokens;
}

function parseColumns(value, count) {
  const items = String(value ?? "")
    .split("||")
    .map((s) => s.trim())
    .filter(Boolean);
  while (items.length < count) items.push("Add content");
  return items.slice(0, count);
}

function parseGrid(value, count) {
  const items = String(value ?? "")
    .split(/\n|\\n|\|\|/)
    .map((s) => s.trim())
    .filter(Boolean);
  while (items.length < count) items.push("Add content");
  return items.slice(0, count);
}

function parseList(value, count) {
  const raw = String(value ?? "").trim();
  let items = raw
    .split(/\n|\\n|\|\|/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (items.length <= 1 && raw) {
    items = raw
      .split(/[.!?]\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  while (items.length < count) items.push("Add detail");
  return items.slice(0, count);
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


