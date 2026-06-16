"use client";

import React, { useEffect, useRef, useState } from "react";
import { FileSpreadsheet, HardDrive, Trash2, UploadCloud } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import Loader from "../Loader";
import { useConfirm } from "../ConfirmDialog";

const DatasetsView = ({ user }) => {
  const confirm = useConfirm();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      const { data } = await supabase.from("datasets").select("*").order("created_at", { ascending: false });
      if (data) setDatasets(data);
      setLoading(false);
    };
    fetchDatasets();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target.result;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length === 0) return;
      const headers = lines[0].split(",").map((h) => h.trim());
      const rows = lines.slice(1).map((line) => {
        const v = line.split(",");
        return headers.reduce((acc, h, i) => ({ ...acc, [h]: v[i]?.trim() }), {});
      });
      const payload = { user_id: user.id, name: file.name, row_count: lines.length - 1, data: { rows, headers } };
      const { data, error } = await supabase.from("datasets").insert(payload).select("*").single();
      if (error) { alert(error.message); return; }
      setDatasets((prev) => [data, ...prev]);
    };
    reader.readAsText(file);
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: 'Delete this dataset?',
      message: 'The dataset and its rows will be permanently removed.',
      confirmLabel: 'Delete dataset',
      variant: 'danger',
    });
    if (ok) {
      await supabase.from("datasets").delete().eq("id", id);
      setDatasets(datasets.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-8 animate-in">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Datasets</h1>
          <p className="text-xl text-slate-500 dark:text-[#fbfbfb]">Manage and reuse your uploaded CSV files.</p>
        </div>
        <button
          onClick={() => fileInputRef.current.click()}
          className="mt-2 px-6 py-3.5 bg-[#5b4cdb] text-white text-sm font-semibold rounded-xl hover:bg-[#4a3dc4] transition-all hover:-translate-y-0.5 shadow-md shadow-[#5b4cdb]/20 flex items-center gap-2"
        >
          <UploadCloud size={16} /> Upload CSV
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleUpload} />
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader inline /></div>
      ) : datasets.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-6">📂</div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">No datasets yet</h3>
          <p className="text-lg text-slate-500 dark:text-[#fbfbfb] mb-8">Upload CSV files to reuse them across multiple projects.</p>
          <button
            onClick={() => fileInputRef.current.click()}
            className="px-8 py-4 bg-[#5b4cdb] text-white text-base font-semibold rounded-xl hover:bg-[#4a3dc4] transition-colors"
          >
            Upload First Dataset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {datasets.map((d) => (
            <div
              key={d.id}
              className="group p-6 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#303030] rounded-2xl hover:border-slate-300 dark:hover:border-[#404040] hover:shadow-sm transition-all"
            >
              <div className="flex justify-between items-start mb-5">
                <div className="w-10 h-10 bg-[#f2f1fe] dark:bg-[#5b4cdb]/10 rounded-xl flex items-center justify-center text-[#5b4cdb]">
                  <FileSpreadsheet size={20} />
                </div>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white truncate mb-1">{d.name}</h3>
              <p className="text-sm text-slate-500">{d.row_count} rows · CSV</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DatasetsView;
