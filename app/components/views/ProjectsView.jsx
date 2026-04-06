'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import STARTER_TEMPLATES from '../../data/starterTemplates';

export default function ProjectsView({ projects, onNewProject, onRefresh, session }) {
  const [selectedProject, setSelectedProject] = useState(null);

  if (selectedProject) {
    return (
      <ProjectDetailView
        project={selectedProject}
        session={session}
        onBack={() => setSelectedProject(null)}
        onRefresh={() => { onRefresh(); }}
      />
    );
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-2">My Projects</h1>
          <p className="text-xl text-slate-500 dark:text-slate-400">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </p>
        </div>
        <button
          onClick={onNewProject}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#5b4cdb] to-[#4a3dc4] text-white text-lg font-bold rounded-xl hover:shadow-lg hover:shadow-[#5b4cdb]/30 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-[#5b4cdb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">No projects yet</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-8">Create your first project to get started</p>
          <button
            onClick={onNewProject}
            className="flex items-center gap-2 mx-auto px-12 py-5 bg-gradient-to-r from-[#5b4cdb] to-[#4a3dc4] text-white text-xl font-black rounded-2xl hover:shadow-2xl hover:shadow-[#5b4cdb]/30 hover:scale-105 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Project
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
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{project.name}</h3>
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
                      {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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

function ProjectDetailView({ project, session, onBack, onRefresh }) {
  const [pages, setPages]               = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [showAddForm, setShowAddForm]   = useState(false);
  const [newKeyword, setNewKeyword]     = useState('');
  const [newLocation, setNewLocation]   = useState('');
  const [generatingIdx, setGeneratingIdx] = useState(null);
  const [fallbackModal, setFallbackModal] = useState(null);

  useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => {
    setLoadingPages(true);
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('id, keyword, location, status, html_content, created_at')
        .eq('project_id', project.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setPages(data || []);
    } catch (err) {
      console.error('Failed to load pages:', err);
    } finally {
      setLoadingPages(false);
    }
  };

  const getProjectTemplate = async () => {
    const templateId = project.data?.settings?.templateId;
    if (templateId) {
      const starter = STARTER_TEMPLATES.find(t => t.id === templateId);
      if (starter) return starter;
      const { data } = await supabase.from('templates').select('*').eq('id', templateId).single();
      if (data) return data;
    }
    return STARTER_TEMPLATES[0];
  };

  const handleGeneratePage = async (keyword, location) => {
    const idx = pages.length; // placeholder index for loading state
    setGeneratingIdx(idx);
    try {
      const template = await getProjectTemplate();
      const settings = project.data?.settings || {};

      const response = await fetch('/api/generate-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId:           project.id,
          keyword,
          location,
          service:             project.name,
          tone:                settings.tone || 'Professional',
          length:              settings.length || 'Medium',
          template_html:       template?.structure || '',
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Generation failed');

      const { error } = await supabase.from('pages').insert({
        project_id:   project.id,
        user_id:      session?.user?.id,
        keyword:      `${keyword} in ${location}`,
        location,
        html_content: result.html,
        status:       'completed',
      });
      if (error) throw error;

      // Update project row_count
      await supabase
        .from('projects')
        .update({ row_count: pages.length + 1 })
        .eq('id', project.id);

      setNewKeyword('');
      setNewLocation('');
      setShowAddForm(false);
      await fetchPages();
    } catch (err) {
      alert(`Failed to generate page: ${err.message}`);
    } finally {
      setGeneratingIdx(null);
    }
  };

  const handlePreview = async (page) => {
    if (page.html_content) {
      const blob = new Blob([page.html_content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } else {
      setFallbackModal(page);
    }
  };

  const handleDeletePage = async (pageId) => {
    if (!confirm('Delete this page? This cannot be undone.')) return;
    await supabase.from('pages').delete().eq('id', pageId);
    await fetchPages();
  };

  const handleDownload = async () => {
    try {
      const downloadPages = pages.map(p => ({
        html_content: p.html_content,
        keyword: p.keyword,
        location: p.location,
        slug: p.keyword.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-'),
      }));
      const response = await fetch('/api/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: downloadPages, projectName: project.name }),
      });
      const result = await response.json();
      if (result.success) {
        const byteCharacters = atob(result.data);
        const byteArray = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) byteArray[i] = byteCharacters.charCodeAt(i);
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
    } catch (err) {
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
    } catch (err) {
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

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-2">{project.name}</h1>
          <p className="text-xl text-slate-500 dark:text-slate-400">
            {loadingPages ? 'Loading pages…' : `${pages.length} ${pages.length === 1 ? 'page' : 'pages'} generated`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={pages.length === 0}
            className="px-5 py-3 bg-white dark:bg-[#18181b] border-2 border-slate-200 dark:border-[#27272a] text-slate-900 dark:text-white font-bold rounded-xl hover:border-[#5b4cdb] disabled:opacity-40 transition-all"
          >
            Download ZIP
          </button>
          <button
            onClick={handleDeleteProject}
            className="px-5 py-3 text-red-600 dark:text-red-400 font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Pages table */}
      <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-2xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#27272a]">
          <h2 className="font-bold text-slate-900 dark:text-white">Pages</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#5b4cdb] text-white text-sm font-semibold rounded-xl hover:bg-[#4a3dc4] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Page
          </button>
        </div>

        {/* Add page form */}
        {showAddForm && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-[#0f0f10] border-b border-slate-200 dark:border-[#27272a]">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">New page — Claude will generate it using your project&apos;s template and settings</p>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Keyword / Service</label>
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="e.g., drain cleaning"
                  className="w-full px-4 py-3 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl focus:outline-none focus:border-[#5b4cdb] text-sm transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g., Dallas"
                  className="w-full px-4 py-3 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl focus:outline-none focus:border-[#5b4cdb] text-sm transition-colors"
                />
              </div>
              <button
                onClick={() => handleGeneratePage(newKeyword.trim(), newLocation.trim())}
                disabled={!newKeyword.trim() || !newLocation.trim() || generatingIdx !== null}
                className="px-5 py-3 bg-[#5b4cdb] text-white text-sm font-semibold rounded-xl hover:bg-[#4a3dc4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                {generatingIdx !== null ? 'Generating…' : 'Generate'}
              </button>
              <button
                onClick={() => { setShowAddForm(false); setNewKeyword(''); setNewLocation(''); }}
                className="px-4 py-3 text-slate-500 dark:text-slate-400 text-sm font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-[#27272a] transition-colors shrink-0"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loadingPages ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="w-6 h-6 border-2 border-[#5b4cdb] border-t-transparent rounded-full animate-spin mr-3" />
            Loading pages…
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">
            <p className="mb-2 font-medium">No pages yet</p>
            <p className="text-sm">Click &quot;Add Page&quot; to generate your first page</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#27272a]">
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Keyword</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#27272a]">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50 dark:hover:bg-[#0f0f10] transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">{page.keyword}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{page.location}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      page.status === 'completed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${page.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}`} />
                      {page.status === 'completed' ? 'Ready' : page.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {new Date(page.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handlePreview(page)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#5b4cdb] border border-[#5b4cdb]/30 rounded-lg hover:bg-[#5b4cdb]/5 transition-colors"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleDeletePage(page.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Fallback modal for pages without stored HTML */}
      {fallbackModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-8" onClick={() => setFallbackModal(null)}>
          <div className="bg-white dark:bg-[#0f0f10] rounded-3xl max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{fallbackModal.keyword}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{fallbackModal.location}</p>
            <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
              Preview unavailable — this page may have been generated before HTML storage was enabled. Download the ZIP to access the full file.
            </p>
            <button onClick={() => setFallbackModal(null)} className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
