"use client";

import React from "react";
import { BarChart3, CheckCircle2, FileText, Layers, Plus, Target, TrendingUp } from "lucide-react";
import Card from "../ui/Card";

const DashboardView = ({ projects, profile, onNewProject, onOpenTemplates }) => {
  const projectLimit = profile?.project_limit ?? 0;
  const canCreateProject = projects.length < projectLimit;

  const totalProjects = projects.length;
  const totalRows = projects.reduce((acc, curr) => acc + (curr.row_count || 0), 0);

  const stats = [
    { label: "Total Projects", value: totalProjects, icon: Layers },
    { label: "Total Keywords", value: totalRows.toLocaleString(), icon: Target },
    { label: "Avg. Difficulty", value: "-", icon: BarChart3 },
    { label: "Monthly Traffic", value: "-", icon: TrendingUp }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Overview</h1>

        <button
          onClick={onNewProject}
          disabled={!canCreateProject}
          className={`px-4 py-2 rounded-lg font-bold flex gap-2 shadow-lg transition-colors ${
            canCreateProject ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-300 text-slate-500 cursor-not-allowed"
          }`}
        >
          <Plus size={18} /> New Project
        </button>
      </div>

      {!canCreateProject && (
        <p className="mt-2 text-xs text-amber-600 font-medium">Project limit reached. Upgrade to Pro to create more projects.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <Card key={i} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium">{s.label}</p>
                <h3 className="text-2xl font-bold dark:text-white mt-1">{s.value}</h3>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                <s.icon size={20} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 bg-gradient-to-r from-indigo-600 to-violet-600 border-none text-white shadow-xl shadow-indigo-600/20">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold mb-2">Ready to scale?</h2>
                <p className="text-indigo-100 max-w-md mb-6 text-sm leading-relaxed">
                  Start with a template, then add your keywords to generate pages in bulk.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onOpenTemplates}
                    className="bg-white text-indigo-600 px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors shadow-lg"
                  >
                    Create Template
                  </button>
                  <button
                    onClick={onNewProject}
                    className="bg-indigo-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-400 transition-colors shadow-lg"
                  >
                    New Project
                  </button>
                </div>
              </div>
              <FileText size={64} className="text-indigo-100 opacity-80" />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold dark:text-white mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium dark:text-slate-200">OpenAI API</p>
                  <p className="text-xs text-slate-500">Operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium dark:text-slate-200">Database</p>
                  <p className="text-xs text-slate-500">Operational</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
