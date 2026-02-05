"use client";

import React, { useEffect, useRef, useState } from "react";
import { FileSpreadsheet, HardDrive, Trash2, UploadCloud } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import Card from "../ui/Card";

const DatasetsView = ({ user }) => {
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

      const payload = {
        user_id: user.id,
        name: file.name,
        row_count: lines.length - 1,
        data: { rows, headers }
      };

      // IMPORTANT: select() gives you the inserted row back so you can update UI without reloading
      const { data, error } = await supabase
        .from("datasets")
        .insert(payload)
        .select("*")
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      // Update UI instantly (no refresh)
      setDatasets((prev) => [data, ...prev]);
    };

    reader.readAsText(file);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete dataset?")) {
      await supabase.from("datasets").delete().eq("id", id);
      setDatasets(datasets.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Datasets</h1>
          <p className="text-slate-500 mt-1">Manage your uploaded files.</p>
        </div>
        <button
          onClick={() => fileInputRef.current.click()}
          className="bg-[#2B5E44] text-white px-4 py-2 rounded-lg font-bold flex gap-2 shadow-lg hover:bg-[#234d37] transition-all"
        >
          <UploadCloud size={18} /> Upload New
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleUpload} />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : datasets.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <HardDrive size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold dark:text-white">No Datasets Yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">Upload your CSV files here to reuse them across multiple projects.</p>
          <button onClick={() => fileInputRef.current.click()} className="mt-6 text-[#2B5E44] font-bold hover:underline">
            Upload First Dataset
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {datasets.map((d) => (
            <Card key={d.id} className="p-6 flex flex-col group relative overflow-hidden hover:border-[#2B5E44]/30 dark:hover:border-[#2B5E44]/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#2B5E44]/10 dark:bg-[#2B5E44]/20 rounded-lg text-[#2B5E44]">
                  <FileSpreadsheet size={24} />
                </div>
                <button onClick={() => handleDelete(d.id)} className="text-slate-300 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">{d.name}</h3>
              <p className="text-sm text-slate-500">{d.row_count} Rows • CSV</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DatasetsView;

// --- 10. Templates Tab View (Updated refreshKey) ---
