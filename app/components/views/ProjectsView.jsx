"use client";

import React, { useState } from "react";
import { Download, Edit3, Eye, Monitor, Search, Sparkles, Trash2 } from "lucide-react";
import Badge from "../ui/Badge";
import Card from "../ui/Card";

const ProjectsView = ({ projects, onDelete, onView, onGenerate, onEdit }) => {
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const tabs = ["All", "Draft", "Completed"];

  const filtered = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = activeStatus === "All" || p.status === activeStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (s) => (s === "Completed" ? "success" : s === "Draft" ? "neutral" : "warning");

  const handleDownload = (e, project) => {
    e.stopPropagation();
    const rows = Array.isArray(project.data) ? project.data : project.data?.rows || [];
    const headers = project.data?.headers && project.data.headers.length > 0 ? project.data.headers : rows.length > 0 ? Object.keys(rows[0]) : [];
    if (rows.length === 0) return alert("No data.");
    const csvContent = [headers.join(","), ...rows.map((row) => headers.map((h) => `"${(row[h] || "").toString().replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${project.name}.csv`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Projects</h1>
          <p className="text-slate-500 mt-1">Manage your active campaigns.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveStatus(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeStatus === tab ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Rows</th>
              <th className="px-6 py-4 font-medium">Platform</th>
              <th className="px-6 py-4 font-medium">Created</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y dark:divide-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500">
                  No projects found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-6 py-4 font-medium dark:text-white">{p.name}</td>
                  <td className="px-6 py-4">
                    <Badge type={getStatusColor(p.status)}>{p.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{p.row_count}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    {p.data?.platform === "Wordpress" ? <Monitor size={14} className="text-indigo-500" /> : <Monitor size={14} className="text-indigo-500" />} {p.data?.platform}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onGenerate(p);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs"
                    >
                      <Sparkles size={14} /> Generate
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(p);
                      }}
                      className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 transition-colors"
                      title="Edit Project"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(p);
                      }}
                      className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 transition-colors"
                      title="View Data"
                    >
                      <Eye size={18} />
                    </button>
                    <button onClick={(e) => handleDownload(e, p)} className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-2 transition-colors" title="Download CSV">
                      <Download size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(p.id);
                      }}
                      className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-2 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default ProjectsView;

