'use client';
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function ProjectsView({ projects, onNewProject, onRefresh }) {
  const [selectedProject, setSelectedProject] = useState(null);

  if (selectedProject) {
    return (
      <ProjectDetailView
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        onRefresh={onRefresh}
      />
    );
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-2">
            My Projects
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </p>
        </div>
        <button
          onClick={onNewProject}
          className="px-8 py-4 bg-gradient-to-r from-[#5b4cdb] to-[#4a3dc4] text-white text-lg font-bold rounded-xl hover:shadow-lg hover:shadow-[#5b4cdb]/30 transition-all"
        >
          ➕ New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-[#5b4cdb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
            No projects yet
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-8">
            Create your first project to get started
          </p>
          <button
            onClick={onNewProject}
            className="px-12 py-5 bg-gradient-to-r from-[#5b4cdb] to-[#4a3dc4] text-white text-xl font-black rounded-2xl hover:shadow-2xl hover:shadow-[#5b4cdb]/30 hover:scale-105 transition-all"
          >
            ➕ Create Project
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-6 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-2xl hover:shadow-lg hover:border-[#5b4cdb] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {project.name}
                    </h3>
                    <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold rounded-full">
                      {project.status || 'Draft'}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {project.row_count || 0} pages
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(project.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProject(project)}
                  className="px-6 py-3 bg-[#5b4cdb] text-white font-semibold rounded-xl hover:bg-[#4a3dc4] transition-all"
                >
                  View Pages →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectDetailView({ project, onBack, onRefresh }) {
  const [previewPage, setPreviewPage] = useState(null);

  const pages = project.data?.rows || [];

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages, projectName: project.name }),
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
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download ZIP');
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Delete "${project.name}" and all ${pages.length} pages?\n\nThis cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', project.id);
      if (error) throw error;
      onRefresh();
      onBack();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete project');
    }
  };

  return (
    <div className="p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Projects
      </button>

      <div className="mb-8">
        <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-2">
          {project.name}
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400">
          {pages.length} pages generated
        </p>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleDownload}
          className="px-6 py-3 bg-white dark:bg-[#18181b] border-2 border-slate-200 dark:border-[#27272a] text-slate-900 dark:text-white font-bold rounded-xl hover:border-[#5b4cdb] transition-all"
        >
          💾 Download ZIP
        </button>
        <div className="flex-1" />
        <button
          onClick={handleDeleteProject}
          className="px-6 py-3 text-red-600 dark:text-red-400 font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          🗑️ Delete Project
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          No pages found in this project.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {pages.map((page, idx) => (
            <div
              key={idx}
              className="p-6 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-2xl hover:shadow-lg hover:border-[#5b4cdb] transition-all"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {page.Keyword || `Page ${idx + 1}`}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {page.Location || ''}
              </p>
              <button
                onClick={() => setPreviewPage(page)}
                className="w-full px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#27272a] rounded-xl hover:bg-slate-100 dark:hover:bg-[#27272a] transition-all"
              >
                Preview
              </button>
            </div>
          ))}
        </div>
      )}

      {previewPage && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-8"
          onClick={() => setPreviewPage(null)}
        >
          <div
            className="bg-white dark:bg-[#0f0f10] rounded-3xl max-w-2xl w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
              {previewPage.Keyword || 'Page Preview'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {previewPage.Location || ''}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Page content is stored per-generation. Download ZIP to get the full HTML.
            </p>
            <button
              onClick={() => setPreviewPage(null)}
              className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
