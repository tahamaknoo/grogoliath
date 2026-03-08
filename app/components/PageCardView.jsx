"use client";

import { useState } from "react";
import { Download, Eye, X } from "lucide-react";

export default function PageCardView({ pages, projectName, onExportJSON, onExportCSV }) {
  const [previewPage, setPreviewPage] = useState(null);

  const getHTML = (page) => page?.html_body || page?.AI_Output || "";

  const downloadHTML = (page) => {
    const html = getHTML(page);
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${page.slug || "page"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generatedPages = pages.filter((p) => !!getHTML(p));
  const pendingPages   = pages.filter((p) => !getHTML(p));

  return (
    <div className="p-6">
      {/* Header stats */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div className="flex gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2 text-center">
            <div className="text-2xl font-bold text-emerald-600">{generatedPages.length}</div>
            <div className="text-xs text-emerald-600 font-medium">Generated</div>
          </div>
          {pendingPages.length > 0 && (
            <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-bold text-slate-400">{pendingPages.length}</div>
              <div className="text-xs text-slate-500 font-medium">Pending</div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onExportJSON}
            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium flex items-center gap-1.5"
          >
            <Download size={14} /> JSON
          </button>
          <button
            onClick={onExportCSV}
            className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 rounded-lg text-sm font-medium flex items-center gap-1.5"
          >
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {/* Generated pages */}
      {generatedPages.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-semibold mb-1">No pages generated yet</p>
          <p className="text-sm">Use the Generate button to create pages for this project.</p>
        </div>
      )}

      {generatedPages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {generatedPages.map((page, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-md transition-shadow"
            >
              {/* Slug */}
              <div className="font-mono text-xs text-emerald-600 dark:text-emerald-400 mb-2 truncate">
                /{page.slug || "untitled"}
              </div>

              {/* Title */}
              <h3 className="font-bold text-sm dark:text-white mb-2 line-clamp-2 leading-snug">
                {page.title || page.MetaTitle || page.Keyword || "Untitled Page"}
              </h3>

              {/* Meta description */}
              {page.meta_description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                  {page.meta_description}
                </p>
              )}

              {/* Status badge */}
              <div className="mb-4">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Generated
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewPage(page)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-medium transition-colors"
                >
                  <Eye size={13} /> Preview
                </button>
                <button
                  onClick={() => downloadHTML(page)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition-colors"
                >
                  <Download size={13} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending rows */}
      {pendingPages.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Pending ({pendingPages.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingPages.map((page, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-5 opacity-60"
              >
                <div className="font-mono text-xs text-slate-400 mb-1 truncate">
                  /{page.slug || page.Keyword || "pending"}
                </div>
                <p className="text-sm font-medium text-slate-500 line-clamp-2">
                  {page.title || page.Keyword || page.Service || "Not generated"}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-500 text-xs font-medium rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewPage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl border dark:border-slate-700 flex flex-col overflow-hidden">
            {/* Preview header */}
            <div className="px-6 py-4 border-b dark:border-slate-700 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold dark:text-white text-sm">{previewPage.title}</h3>
                <p className="font-mono text-xs text-slate-500 mt-0.5">/{previewPage.slug}</p>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => downloadHTML(previewPage)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium"
                >
                  <Download size={13} /> Download HTML
                </button>
                <button
                  onClick={() => setPreviewPage(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* iframe preview */}
            <div className="flex-1 overflow-hidden">
              <iframe
                srcDoc={getHTML(previewPage)}
                className="w-full h-full border-0"
                title="Page Preview"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
