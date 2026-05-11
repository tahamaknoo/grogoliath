'use client';

import { useState } from 'react';
import { apiFetch } from '../../lib/apiFetch';

export default function SuccessScreen({ project, pages, onDeploy, onView, onDownload, onDashboard }) {
  const totalPages = pages?.length || 0;
  const [previewPage, setPreviewPage] = useState(null);

  return (
    <div className="fixed inset-0 bg-white dark:bg-[#111111] z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-3xl w-full text-center">

          {/* Success animation */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center animate-scale-in">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="font-display text-6xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
              🎉 {totalPages} Pages Ready!
            </h1>
            <p className="text-2xl text-slate-500 dark:text-[#fbfbfb]">
              Your pages have been generated successfully
            </p>
          </div>

          {/* Project info */}
          <div className="p-8 bg-slate-50 dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#303030] rounded-3xl mb-8">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-sm font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wide mb-2">
                  Project
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {project?.name || 'Untitled'}
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wide mb-2">
                  Pages
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {totalPages}
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wide mb-2">
                  Status
                </div>
                <div className="text-xl font-bold text-green-600">
                  ✓ Ready
                </div>
              </div>
            </div>
          </div>

          {/* Preview samples */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              Preview a few pages:
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {pages.slice(0, 3).map((page, idx) => (
                <div key={idx} className="p-6 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#303030] rounded-2xl hover:shadow-lg transition-all">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm">
                    {page.keyword || page.title || `Page ${idx + 1}`}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-[#fbfbfb] mb-4">
                    {page.location || page.slug || 'Generated page'}
                  </p>
                  <button
                    onClick={() => setPreviewPage(page)}
                    className="w-full px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#303030] rounded-xl hover:bg-slate-100 dark:hover:bg-[#303030] transition-all"
                  >
                    Preview
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Next steps */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              What's next?
            </h3>

            <div className="grid grid-cols-2 gap-6">
              {/* Deploy */}
              <button
                onClick={onDeploy}
                className="group p-8 bg-gradient-to-r from-[#5b4cdb] to-[#4a3dc4] text-white rounded-3xl hover:shadow-2xl hover:shadow-[#5b4cdb]/30 hover:scale-105 transition-all text-left"
              >
                <div className="text-4xl mb-4">🚀</div>
                <h4 className="text-2xl font-black mb-2">Deploy Now</h4>
                <p className="text-purple-100">
                  Go live in 30 seconds with Vercel or Netlify
                </p>
                <div className="mt-4 flex items-center gap-2 text-purple-100 font-semibold">
                  Deploy →
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* View/Edit */}
              <button
                onClick={onView}
                className="group p-8 bg-white dark:bg-[#1c1c1c] border-2 border-slate-200 dark:border-[#303030] rounded-3xl hover:border-slate-300 dark:hover:border-[#404040] hover:shadow-lg transition-all text-left"
              >
                <div className="text-4xl mb-4">✏️</div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                  View & Edit
                </h4>
                <p className="text-slate-600 dark:text-[#fbfbfb]">
                  Preview all pages and customize before deploying
                </p>
                <div className="mt-4 flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                  View Pages →
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Secondary actions */}
            <div className="flex items-center justify-center gap-6 pt-6">
              <button
                onClick={async () => {
                  try {
                    const response = await apiFetch('/api/download-zip', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ pages, projectName: project?.name || 'My Pages' }),
                    });
                    const result = await response.json();
                    if (result.success) {
                      const byteCharacters = atob(result.data);
                      const byteArray = new Uint8Array(byteCharacters.length);
                      for (let i = 0; i < byteCharacters.length; i++) {
                        byteArray[i] = byteCharacters.charCodeAt(i);
                      }
                      const blob = new Blob([byteArray], { type: 'application/zip' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = result.filename;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    } else {
                      alert('Failed to generate ZIP: ' + (result.error || 'Unknown error'));
                    }
                  } catch (error) {
                    console.error('Download error:', error);
                    alert('Failed to download ZIP');
                  }
                }}
                className="px-6 py-3 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-[#303030] transition-all"
              >
                💾 Download ZIP
              </button>
              <button
                onClick={onDashboard}
                className="px-6 py-3 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-[#303030] transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Preview Modal */}
      {previewPage && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-8"
          onClick={() => setPreviewPage(null)}
        >
          <div
            className="bg-white dark:bg-[#111111] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="p-6 border-b border-slate-200 dark:border-[#303030] flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {previewPage.keyword || previewPage.title || 'Page Preview'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-[#fbfbfb] mt-1">
                  {previewPage.location || previewPage.slug}
                </p>
              </div>
              <button
                onClick={() => setPreviewPage(null)}
                className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-[#303030] flex items-center justify-center transition-colors"
              >
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal content — always render AI HTML inside a sandboxed iframe.
                 dangerouslySetInnerHTML on raw AI output is a parent-origin XSS risk. */}
            <div className="overflow-hidden" style={{ height: 'calc(90vh - 180px)' }}>
              {(() => {
                const html = previewPage.content || previewPage.html_content || previewPage.html || '';
                const isFullDoc = /^\s*<!DOCTYPE\s+html/i.test(html) || /^\s*<html/i.test(html);
                const wrapped = isFullDoc
                  ? html
                  : `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.6;padding:2rem;max-width:48rem;margin:auto;color:#262626}img{max-width:100%;height:auto}</style></head><body>${html}</body></html>`;
                return (
                  <iframe
                    srcDoc={wrapped}
                    sandbox="allow-same-origin"
                    className="w-full h-full border-0"
                    title="Page preview"
                  />
                );
              })()}
            </div>

            {/* Modal footer */}
            <div className="p-6 border-t border-slate-200 dark:border-[#303030] flex justify-between">
              <div className="text-sm text-slate-500 dark:text-[#fbfbfb]">
                {previewPage.tone && <span className="mr-4">Tone: {previewPage.tone}</span>}
                {previewPage.length && <span>Length: {previewPage.length}</span>}
              </div>
              <button
                onClick={() => setPreviewPage(null)}
                className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
