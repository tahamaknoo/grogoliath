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
 *  - "template" → cleaner preview (no browser chrome, no copy button)
 *  - "page"     → full preview chrome + copy HTML
 */
export default function LivePreview({ blocks = [], mode = "template" }) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState("desktop");

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
    viewMode === "mobile" ? "w-full max-w-sm" : "w-full max-w-5xl";
  const sectionPad = "px-4 sm:px-6 lg:px-10";

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

      {/* In template mode, still allow device toggle (because it matters for “professional”) */}
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
        className={`flex-1 bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col ${
          mode === "page"
            ? viewMode === "mobile"
              ? "rounded-b-3xl border-8 border-slate-800 min-h-[600px]"
              : "rounded-b-lg min-h-[700px]"
            : viewMode === "mobile"
            ? "rounded-3xl border-8 border-slate-800 min-h-[600px]"
            : "rounded-2xl min-h-[700px]"
        } dark:bg-slate-950 dark:border-slate-700`}
      >
        <nav className={`border-b border-slate-100 py-4 flex justify-between items-center bg-white sticky top-0 z-10 dark:bg-slate-950 dark:border-slate-800 ${sectionPad}`}>
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

        <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
          {safeBlocks.map((block) => {
            if (!block || !block.type) return null;

            const content = prettifyForPreview(block.content);

            switch (block.type) {
              case "header":
                return (
                  <section key={block.id} className={`py-6 ${sectionPad}`}>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                        Heading
                      </div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-tight dark:text-white">
                        {content}
                      </h2>
                    </div>
                  </section>
                );

              case "hero":
                return (
                  <section
                    key={block.id}
                    className={`py-12 sm:py-16 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 dark:from-slate-900 dark:to-slate-950 dark:border-slate-800 ${sectionPad}`}
                  >
                    <div className="grid gap-8 lg:grid-cols-2 items-center">
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                          Hero
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight dark:text-white">
                          {content}
                        </h1>
                        <p className="text-sm sm:text-base text-slate-500 mb-6 dark:text-slate-300">
                          Short, clear value statement that reads well on mobile.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 w-full sm:w-auto">
                            Start Now
                          </button>
                          <button className="border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold w-full sm:w-auto dark:border-slate-700 dark:text-slate-200">
                            See Demo
                          </button>
                        </div>
                      </div>
                      <div className="hidden lg:block">
                        <div className="w-full h-56 rounded-2xl bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800"></div>
                      </div>
                    </div>
                  </section>
                );

              case "text":
                return (
                  <section key={block.id} className={`py-4 ${sectionPad}`}>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                        Text
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
                    </div>
                  </section>
                );

              case "columns_2": {
                const cols = parseColumns(content, 2);
                return (
                  <section key={block.id} className={`py-6 ${sectionPad}`}>
                    <div className="grid gap-4 md:grid-cols-2">
                      {cols.map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-950 dark:border-slate-800"
                        >
                          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                            Column {idx + 1}
                          </div>
                          <p className="text-sm sm:text-base text-slate-700 leading-relaxed dark:text-slate-200">
                            {item}
                          </p>
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
                    <div className="grid gap-4 sm:grid-cols-2">
                      {cells.map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-950 dark:border-slate-800"
                        >
                          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                            Item {idx + 1}
                          </div>
                          <p className="text-sm sm:text-base text-slate-700 leading-relaxed dark:text-slate-200">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              case "image":
                return (
                  <section key={block.id} className={`py-6 ${sectionPad}`}>
                    <div className="w-full h-40 sm:h-56 md:h-[340px] bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-slate-200 overflow-hidden relative group dark:bg-slate-900 dark:border-slate-800">
                      <ImageIcon size={32} className="mb-2 text-slate-300" />
                      <span className="font-medium text-sm text-center px-4">
                        {content || "Image placeholder"}
                      </span>
                    </div>
                  </section>
                );

              case "pain_point":
                return (
                  <section key={block.id} className={`py-6 bg-red-50/50 dark:bg-red-900/10 ${sectionPad}`}>
                    <div className="p-5 bg-white border border-red-100 rounded-xl shadow-sm dark:bg-slate-950 dark:border-red-900/30">
                      <h3 className="text-lg font-bold text-red-800 mb-2 flex gap-2 items-center dark:text-red-300">
                        <AlertCircle size={18} /> Problem
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">{content}</p>
                    </div>
                  </section>
                );

              case "solution":
                return (
                  <section key={block.id} className={`py-6 bg-emerald-50/50 dark:bg-emerald-900/10 ${sectionPad}`}>
                    <div className="p-5 bg-white border border-emerald-100 rounded-xl shadow-sm dark:bg-slate-950 dark:border-emerald-900/30">
                      <h3 className="text-lg font-bold text-emerald-800 mb-2 flex gap-2 items-center dark:text-emerald-300">
                        <CheckCircle2 size={18} /> Solution
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">{content}</p>
                    </div>
                  </section>
                );

              case "pricing":
                return (
                  <section key={block.id} className={`py-10 bg-slate-50 dark:bg-slate-900/30 ${sectionPad}`}>
                    <div className={`grid gap-4 ${viewMode === "mobile" ? "grid-cols-1" : "grid-cols-3"}`}>
                      {[
                        { name: "Starter", price: "$29" },
                        { name: "Pro", price: "$99", highlight: true },
                        { name: "Enterprise", price: "$299" },
                      ].map((plan, i) => (
                        <div
                          key={i}
                          className={`bg-white p-6 rounded-xl border dark:bg-slate-950 dark:border-slate-800 ${
                            plan.highlight
                              ? "border-indigo-500 shadow-lg"
                              : "border-slate-200"
                          }`}
                        >
                          <div className="text-slate-500 text-sm font-bold uppercase mb-2">
                            {plan.name}
                          </div>
                          <div className="text-3xl font-extrabold text-slate-900 mb-4 dark:text-white">
                            {plan.price}
                          </div>
                          <button className="w-full py-2 rounded-lg bg-slate-100 text-sm font-bold dark:bg-slate-900 dark:text-slate-200">
                            Select
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                );

              case "cta":
                return (
                  <section key={block.id} className={`py-12 bg-indigo-600 text-white text-center ${sectionPad}`}>
                    <h3 className="text-2xl font-bold mb-4">{content}</h3>
                    <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg">
                      Get Started
                    </button>
                  </section>
                );

              case "faq_auto":
                return (
                  <section key={block.id} className={`py-10 ${sectionPad}`}>
                    <h3 className="text-xl font-bold mb-6 text-center text-slate-900 dark:text-white">
                      FAQ
                    </h3>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <details
                          key={i}
                          className="bg-white border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800"
                        >
                          <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-slate-900 text-sm dark:text-white">
                            <span>Question {i}?</span>
                            <ChevronDown size={16} className="text-slate-400" />
                          </summary>
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
                      <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-wider mb-8">
                        Trusted by industry leaders
                      </p>
                      <div className="flex justify-center gap-12 opacity-60 grayscale flex-wrap">
                        <div className="font-bold text-2xl text-slate-600 flex items-center gap-2 dark:text-slate-300">
                          <ShieldCheck /> Secure
                        </div>
                        <div className="font-bold text-2xl text-slate-600 flex items-center gap-2 dark:text-slate-300">
                          <Users /> Teams
                        </div>
                        <div className="font-bold text-2xl text-slate-600 flex items-center gap-2 dark:text-slate-300">
                          <Zap /> Fast
                        </div>
                      </div>
                    </div>
                  </section>
                );

              case "contact_form":
                return (
                  <section key={block.id} className={`py-12 bg-slate-50 dark:bg-slate-900/30 ${sectionPad}`}>
                    <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                      <h3 className="text-xl font-bold mb-6 text-center text-slate-900 dark:text-white">
                        Contact Us
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
                            Name
                          </label>
                          <input
                            type="text"
                            className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-800"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
                            Email
                          </label>
                          <input
                            type="email"
                            className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-800"
                            placeholder="name@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
                            Message
                          </label>
                          <textarea
                            className="w-full p-3 border rounded-lg bg-slate-50 h-24 dark:bg-slate-900 dark:border-slate-800"
                            placeholder="How can we help?"
                          ></textarea>
                        </div>
                        <button className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                          Send Message
                        </button>
                      </div>
                    </div>
                  </section>
                );

              case "comparison":
                return (
                  <section key={block.id} className={`py-10 ${sectionPad}`}>
                    <h3 className="text-xl font-bold mb-6 text-center text-slate-900 dark:text-white">
                      Comparison
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-[520px] w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 border-b dark:bg-slate-900/40 dark:border-slate-800">
                          <tr>
                            <th className="px-6 py-3">Feature</th>
                            <th className="px-6 py-3 text-indigo-600 font-bold">Us</th>
                            <th className="px-6 py-3">Them</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-slate-800">
                          {[1, 2, 3].map((r) => (
                            <tr key={r}>
                              <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-200">
                                Feature {r}
                              </td>
                              <td className="px-6 py-3 text-emerald-600">
                                <Check size={16} />
                              </td>
                              <td className="px-6 py-3 text-red-400">
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
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl dark:bg-emerald-900/10 dark:border-emerald-900/30">
                        <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2 dark:text-emerald-300">
                          <ThumbsUp size={16} /> Pros
                        </h4>
                        <ul className="space-y-2 text-emerald-700 text-sm dark:text-emerald-200">
                          <li>
                            <Check size={14} className="inline mr-2" />
                            Benefit 1
                          </li>
                          <li>
                            <Check size={14} className="inline mr-2" />
                            Benefit 2
                          </li>
                        </ul>
                      </div>
                      <div className="bg-red-50 border border-red-100 p-6 rounded-xl dark:bg-red-900/10 dark:border-red-900/30">
                        <h4 className="font-bold text-red-800 mb-4 flex items-center gap-2 dark:text-red-300">
                          <ThumbsDown size={16} /> Cons
                        </h4>
                        <ul className="space-y-2 text-red-700 text-sm dark:text-red-200">
                          <li>
                            <X size={14} className="inline mr-2" />
                            Drawback 1
                          </li>
                          <li>
                            <X size={14} className="inline mr-2" />
                            Drawback 2
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>
                );

              case "process":
                return (
                  <section key={block.id} className={`py-10 ${sectionPad}`}>
                    <div className="flex flex-col md:flex-row gap-4 text-center">
                      {[1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className="flex-1 p-6 border rounded-xl bg-slate-50 dark:bg-slate-900/30 dark:border-slate-800"
                        >
                          <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">
                            {step}
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white">
                            Step {step}
                          </h4>
                          <p className="text-sm text-slate-500 mt-2 dark:text-slate-300">
                            Description of this step.
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                );

              case "social_proof":
                return (
                  <section key={block.id} className={`py-10 bg-slate-50 dark:bg-slate-900/30 ${sectionPad}`}>
                    <div className="max-w-2xl mx-auto text-center">
                      <div className="flex justify-center mb-4">
                        <Star size={20} />
                        <Star size={20} />
                        <Star size={20} />
                        <Star size={20} />
                        <Star size={20} />
                      </div>
                      <blockquote className="text-xl font-medium text-slate-800 italic dark:text-slate-100">
                        "This product completely changed how we work. Highly recommended!"
                      </blockquote>
                      <div className="mt-4 font-bold text-slate-900 dark:text-white">
                        - Happy Customer
                      </div>
                    </div>
                  </section>
                );

              case "case_study":
                return (
                  <section key={block.id} className={`py-10 ${sectionPad}`}>
                    <div className="flex gap-6 items-center bg-indigo-50 p-8 rounded-2xl border border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30">
                      <div className="flex-1">
                        <div className="text-indigo-600 font-bold text-sm uppercase tracking-wide mb-2">
                          Case Study
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4 dark:text-white">
                          How Client X grew 200%
                        </h3>
                        <p className="text-slate-600 mb-6 dark:text-slate-300">
                          Full story placeholder text describing the success.
                        </p>
                        <button className="text-indigo-600 font-bold hover:underline flex items-center gap-2">
                          Read Story <Workflow size={16} />
                        </button>
                      </div>
                      <div className="w-1/3 h-40 bg-indigo-200 rounded-xl hidden md:block dark:bg-indigo-900/30"></div>
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
    .trim();

  // keep it readable in preview
  return cleaned.length > 220 ? cleaned.slice(0, 220) + "..." : cleaned;
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

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


