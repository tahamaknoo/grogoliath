"use client";

import React, { useEffect, useState } from "react";
import { Download, Eye, Plus, Save, Trash2, X } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import InspectorModal from "./InspectorModal";

const ViewModal = ({ isOpen, onClose, project, onProjectUpdate }) => {
  const [localProject, setLocalProject] = useState(project);
  const [newRow, setNewRow] = useState({});
  const [showAddRow, setShowAddRow] = useState(false);
  const [newHeader, setNewHeader] = useState("");
  const [inspectCell, setInspectCell] = useState(null);

  useEffect(() => {
    setLocalProject(project);
  }, [project]);

  if (!isOpen || !localProject) return null;

  // ---- normalize data shape (supports older array-only projects)
  const dataObj = Array.isArray(localProject.data)
    ? { rows: localProject.data, headers: [], platform: "Wordpress" }
    : (localProject.data || {});

  const rows = Array.isArray(dataObj.rows) ? dataObj.rows : [];

  const storedHeaders = Array.isArray(dataObj.headers) ? dataObj.headers.filter(Boolean) : [];

  // ---- helpers
  const looksLikeHTML = (val) => {
    if (typeof val !== "string") return false;
    const s = val.trim();
    if (!s) return false;
    // must contain a tag-ish pattern; avoid matching "< 5"
    return /<\s*(div|section|main|article|header|footer|nav|h1|h2|h3|p|span|a|img|ul|ol|li|table|thead|tbody|tr|td|script|style)\b/i.test(s);
  };

  const isAIOutputColumn = (h) => /ai[_-]?output/i.test(String(h || ""));

  const isHTMLCell = (headerName, cellValue) => {
    const h = String(headerName || "");
    const lower = h.toLowerCase();

    if (lower.includes("html")) return true;
    if (isAIOutputColumn(h)) return true;
    if (looksLikeHTML(cellValue)) return true;

    return false;
  };

  const computeHeaders = (rowsArr, stored) => {
    const firstRowKeys = rowsArr?.[0] ? Object.keys(rowsArr[0]) : [];

    // If it's truly empty (no stored headers + no rows), keep empty to show your "Empty Project" UI.
    if ((stored?.length || 0) === 0 && firstRowKeys.length === 0 && (rowsArr?.length || 0) === 0) {
      return [];
    }

    const mustInclude = ["slug", "title", "meta_description", "schema", "html_body"];

    // Start with stored headers if available; else start with first-row keys
    const base = (stored?.length ? stored : firstRowKeys).slice();

    // Add any keys seen in rows that aren't in base
    const allRowKeys = new Set();
    (rowsArr || []).forEach((r) => {
      if (r && typeof r === "object") Object.keys(r).forEach((k) => allRowKeys.add(k));
    });

    const seen = new Set(base);

    // Keep base order, then append missing row keys
    Array.from(allRowKeys).forEach((k) => {
      if (!seen.has(k)) {
        base.push(k);
        seen.add(k);
      }
    });

    // Ensure generated columns exist
    mustInclude.forEach((k) => {
      if (!seen.has(k)) {
        base.push(k);
        seen.add(k);
      }
    });

    // If AI_Output (or similar) exists in rows but wasn't in stored headers, keep it
    // (already handled by row keys append) — this is just to ensure presence if empty row keys were sparse.
    if (!base.some((h) => isAIOutputColumn(h))) {
      const aiLike = Array.from(allRowKeys).find((k) => isAIOutputColumn(k));
      if (aiLike && !seen.has(aiLike)) base.push(aiLike);
    }

    return base.filter(Boolean);
  };

  const headers = computeHeaders(rows, storedHeaders);

  const handleUpdate = async (newRows, newHeaders) => {
    const updatedHeaders = Array.isArray(newHeaders) ? newHeaders : computeHeaders(newRows, storedHeaders);

    const updatedData = {
      ...dataObj,
      rows: newRows,
      headers: updatedHeaders
    };

    const { error } = await supabase
      .from("projects")
      .update({ data: updatedData, row_count: newRows.length })
      .eq("id", localProject.id);

    if (!error) {
      const updated = { ...localProject, data: updatedData, row_count: newRows.length };
      setLocalProject(updated);
      onProjectUpdate(updated);
    }
  };

  const handleCellSave = (newContent) => {
    if (!inspectCell) return;
    const newRows = [...rows];
    newRows[inspectCell.rowIndex] = {
      ...newRows[inspectCell.rowIndex],
      [inspectCell.headerName]: newContent
    };

    // Keep current headers (don’t revert)
    handleUpdate(newRows, headers);
    setInspectCell(null);
  };

  const handleExport = () => {
    if (rows.length === 0) return alert("No data to export.");

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((h) => `"${(row?.[h] ?? "").toString().replace(/"/g, '""')}"`)
          .join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${localProject.name}_export.csv`;
    link.click();
  };

  const handleExportJSON = () => {
    if (rows.length === 0) return alert("No data to export.");

    const pages = rows.map((r) => ({
      slug: r?.slug,
      title: r?.title,
      meta_description: r?.meta_description,
      html_body: r?.html_body,
      schema: r?.schema
    }));

    const blob = new Blob([JSON.stringify(pages, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${localProject.name}_pages.json`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      {inspectCell && (
        <InspectorModal
          isOpen={!!inspectCell}
          onClose={() => setInspectCell(null)}
          content={inspectCell.content || ""}
          headerName={inspectCell.headerName}
          onSave={handleCellSave}
        />
      )}

      <div className="bg-white dark:bg-slate-800 w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl border dark:border-slate-700 flex flex-col overflow-hidden">
        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-bold dark:text-white">{localProject.name}</h3>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-sm font-medium flex items-center gap-1"
            >
              <Download size={16} /> Export CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium flex items-center gap-1"
            >
              Export JSON
            </button>
            <button
              onClick={() => setShowAddRow(!showAddRow)}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium"
            >
              <Plus size={16} className="inline" /> Add Row
            </button>
            <button onClick={onClose}>
              <X className="text-slate-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-900/50">
          {headers.length === 0 && rows.length === 0 ? (
            <div className="text-center p-12">
              <p className="mb-4 text-slate-500">Empty Project.</p>
              <div className="flex justify-center gap-2">
                <input
                  value={newHeader}
                  onChange={(e) => setNewHeader(e.target.value)}
                  placeholder="Column Name"
                  className="p-2 border rounded text-sm"
                />
                <button
                  onClick={() => {
                    const h = String(newHeader || "").trim();
                    if (!h) return;
                    handleUpdate(rows, [h]); // first header
                    setNewHeader("");
                  }}
                  className="px-3 py-2 bg-indigo-600 text-white rounded text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <table className="w-full text-sm text-left bg-white dark:bg-slate-800">
              <thead className="bg-slate-100 dark:bg-slate-700">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-4 py-2 border-b dark:border-slate-600">
                      {h}
                    </th>
                  ))}
                  <th className="w-10 border-b dark:border-slate-600"></th>
                </tr>
              </thead>

              <tbody>
                {showAddRow && (
                  <tr className="bg-indigo-50">
                    {headers.map((h, i) => (
                      <td key={i} className="p-2">
                        <input
                          placeholder={h}
                          value={newRow[h] || ""}
                          onChange={(e) => setNewRow({ ...newRow, [h]: e.target.value })}
                          className="w-full border rounded p-1 text-xs"
                        />
                      </td>
                    ))}
                    <td className="p-2">
                      <button
                        onClick={() => {
                          handleUpdate([...rows, newRow], headers);
                          setNewRow({});
                          setShowAddRow(false);
                        }}
                        className="bg-indigo-600 text-white p-1 rounded"
                      >
                        <Save size={14} />
                      </button>
                    </td>
                  </tr>
                )}

                {rows.map((row, i) => (
                  <tr key={i} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 group">
                    {headers.map((h, j) => {
                      const cellData = row?.[h];
                      const isHTML = isHTMLCell(h, cellData);

                      return (
                        <td key={j} className="px-4 py-2 truncate max-w-[200px]">
                          {isHTML && typeof cellData === "string" && cellData.trim() ? (
                            <button
                              onClick={() => setInspectCell({ rowIndex: i, headerName: h, content: cellData })}
                              className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 flex items-center gap-1 font-bold"
                            >
                              <Eye size={12} /> View Page
                            </button>
                          ) : (
                            (cellData ?? "").toString()
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-2">
                      <button
                        onClick={() => {
                          if (confirm("Delete?")) handleUpdate(rows.filter((_, idx) => idx !== i), headers);
                        }}
                        className="text-slate-300 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
