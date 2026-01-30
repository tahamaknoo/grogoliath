"use client";

import React, { useEffect, useState } from "react";
import { Code, Eye, Maximize2, X } from "lucide-react";

const InspectorModal = ({ isOpen, onClose, content, headerName, onSave }) => {
  const [mode, setMode] = useState("visual");
  const [editedContent, setEditedContent] = useState(content);

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
              <Maximize2 size={18} className="text-indigo-600" />
              Inspecting:{" "}
              <span className="font-mono text-sm bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">{headerName}</span>
            </h3>
            <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 p-0.5">
              <button
                onClick={() => setMode("visual")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                  mode === "visual"
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Eye size={12} /> Visual
              </button>
              <button
                onClick={() => setMode("code")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                  mode === "code"
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Code size={12} /> Code
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative bg-white dark:bg-slate-950">
          {mode === "visual" ? (
            <div className="w-full h-full overflow-y-auto p-8">
              <div className="max-w-3xl mx-auto prose dark:prose-invert">
                <iframe
                  title="Template Preview"
                  className="w-full min-h-[60vh] border-0"
                  sandbox=""
                  srcDoc={editedContent}
                />
              </div>
            </div>
          ) : (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-full p-6 font-mono text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none resize-none"
              spellCheck="false"
            />
          )}
        </div>

        <div className="p-4 border-t flex justify-end gap-3 bg-white dark:bg-slate-800">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium">
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(editedContent);
              onClose();
            }}
            className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspectorModal;

// --- 5. AI Generation Modal (UPDATED: hard 15-section enforcement + QA + retry + premium CSS injection) ---
