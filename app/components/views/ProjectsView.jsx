'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../../../lib/supabaseClient';
import { apiFetch } from '../../../lib/apiFetch';
import STARTER_TEMPLATES from '../../data/starterTemplates';
import Loader from '../Loader';

export default function ProjectsView({ projects, onNewProject, onRefresh, session, onQueueUpdate, initialProjectId }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [query, setQuery] = useState('');

  const openProject = (project) => {
    window.history.pushState({ projectId: project.id }, '', `?tab=projects&project=${project.id}`);
    setSelectedProject(project);
  };

  // Always go to the projects LIST. Don't trust history.back() — if the user
  // arrived from another tab (e.g. dashboard's "Continue" card), back goes
  // there instead of here.
  const closeProject = () => {
    setSelectedProject(null);
    if (typeof window !== 'undefined') {
      window.history.pushState({ tab: 'projects' }, '', '?tab=projects');
      window.dispatchEvent(new Event('gg-navigate'));
    }
  };

  // Auto-open a project when navigating from dashboard
  useEffect(() => {
    if (initialProjectId && projects?.length) {
      const project = projects.find(p => String(p.id) === String(initialProjectId));
      if (project) openProject(project);
    }
  }, [initialProjectId, projects]);

  // Re-sync selectedProject from the URL whenever navigation happens.
  // Listens to BOTH popstate (browser back/forward) and gg-navigate (custom
  // event fired by parent on every pushState). Clears selectedProject if the
  // URL no longer has ?project=.
  useEffect(() => {
    const sync = () => {
      const params = new URLSearchParams(window.location.search);
      if (!params.has('project')) {
        setSelectedProject(null);
      }
    };
    window.addEventListener('popstate', sync);
    window.addEventListener('gg-navigate', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('gg-navigate', sync);
    };
  }, []);

  if (selectedProject) {
    return (
      <ProjectDetailView
        project={selectedProject}
        session={session}
        onBack={closeProject}
        onRefresh={() => { onRefresh(); }}
        onQueueUpdate={onQueueUpdate}
      />
    );
  }

  const statusStyle = (status) => {
    const s = String(status || 'draft').toLowerCase();
    if (s === 'published') return {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      fg: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200/70 dark:border-emerald-500/30',
      dot: 'bg-emerald-500',
    };
    if (s === 'generating') return {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      fg: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200/70 dark:border-blue-500/30',
      dot: 'bg-blue-500',
    };
    if (s === 'archived') return {
      bg: 'bg-slate-100 dark:bg-slate-800/40',
      fg: 'text-slate-500 dark:text-[#fbfbfb]',
      border: 'border-slate-200 dark:border-slate-700/50',
      dot: 'bg-slate-400',
    };
    // Draft — refined slate: soft top-to-bottom gradient + hairline border + subtle ring
    return {
      bg: 'bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/70',
      fg: 'text-slate-700 dark:text-slate-200',
      border: 'border-slate-200 dark:border-slate-700/60',
      dot: 'bg-slate-400 dark:bg-slate-300',
    };
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Pull a representative keyword/location pair from the project data for display
  const summaryFor = (project) => {
    const row = project?.data?.rows?.[0] || {};
    return {
      keyword: row.Keyword || row.keyword || null,
      location: row.Location || row.location || null,
    };
  };

  // Filter by name, keyword, or location
  const q = query.trim().toLowerCase();
  const visibleProjects = !q
    ? projects
    : projects.filter((p) => {
        const { keyword, location } = summaryFor(p);
        return (
          (p.name || '').toLowerCase().includes(q) ||
          (keyword || '').toLowerCase().includes(q) ||
          (location || '').toLowerCase().includes(q) ||
          String(p.status || 'draft').toLowerCase().includes(q)
        );
      });

  return (
    <div className="px-8 pb-8 animate-fade-in" style={{ paddingTop: '48px' }}>
      {/* Header */}
      <div className="flex items-end justify-between gap-6 mb-10 flex-wrap">
        <div>
          <h1 className="text-[40px] font-black text-[#262626] dark:text-white tracking-[-0.02em] leading-none mb-3">My Projects</h1>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#555555] dark:text-[#999999] bg-[#f5f5f5] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#075056]" />
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </span>
            {projects.filter(p => String(p.status || 'draft').toLowerCase() === 'draft').length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#555555] dark:text-[#999999] bg-[#f5f5f5] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                {projects.filter(p => String(p.status || 'draft').toLowerCase() === 'draft').length} draft
              </span>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999] dark:text-[#666666] pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, keyword, location..."
            autoComplete="off"
            spellCheck={false}
            name="gg-projects-search"
            className="w-full pl-11 pr-10 py-2.5 text-sm bg-white dark:bg-[#1a1a1a] border border-[#d4d4d4] dark:border-[#404040] rounded-full text-[#262626] dark:text-white placeholder-[#999999] dark:placeholder-[#666666] focus:outline-none focus:border-[#075056] dark:focus:border-[#075056] focus:ring-2 focus:ring-[#075056]/20 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#999999] hover:text-[#262626] dark:hover:text-white hover:bg-[#f0f0f0] dark:hover:bg-[#303030] transition-colors"
              title="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Create banner — full-width, primary action */}
      <button
        onClick={onNewProject}
        className="group w-full text-left flex items-center gap-5 p-5 sm:p-6 mb-10 bg-gradient-to-br from-white to-[#fafafa] dark:from-[#1a1a1a] dark:to-[#111111] border border-dashed border-[#b8b8b8] dark:border-[#525252] rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_40px_rgba(7,80,86,0.18)] dark:hover:shadow-[0_12px_40px_rgba(7,80,86,0.35)] hover:border-solid hover:border-[#075056] dark:hover:border-[#075056] hover:-translate-y-0.5 transition-all duration-300"
      >
        <div className="w-14 h-14 rounded-2xl bg-[#075056]/10 dark:bg-[#075056]/20 flex items-center justify-center text-[#075056] dark:text-[#5eead4] group-hover:bg-[#075056] group-hover:text-white dark:group-hover:bg-[#075056] dark:group-hover:text-white group-hover:rotate-90 transition-all duration-500 shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base sm:text-lg font-bold text-[#262626] dark:text-white tracking-tight">Start a new project</h3>
            <span className="hidden sm:inline-flex items-center text-[10px] font-bold uppercase tracking-[0.1em] text-[#075056] dark:text-[#5eead4] bg-[#075056]/10 dark:bg-[#075056]/20 px-2 py-0.5 rounded-full">New</span>
          </div>
          <p className="text-xs sm:text-sm text-[#777777] dark:text-[#888888] line-clamp-1 sm:line-clamp-2">Tell us about your business, pick a template, and we&rsquo;ll generate pages for every keyword and location.</p>
        </div>
        <span className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#075056] text-white text-sm font-bold rounded-xl group-hover:bg-[#064548] group-hover:shadow-lg group-hover:shadow-[#075056]/30 transition-all shrink-0">
          Get started
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </span>
      </button>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#1c1c1c] border border-dashed border-[#d4d4d4] dark:border-[#404040] rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#075056]/10 dark:bg-[#075056]/20 flex items-center justify-center text-[#075056] dark:text-[#5eead4] mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
          </div>
          <h2 className="text-base font-bold text-[#262626] dark:text-white mb-1">No projects yet</h2>
          <p className="text-sm text-[#777777] dark:text-[#888888]">Click &ldquo;Start a new project&rdquo; above to create your first one.</p>
        </div>
      ) : visibleProjects.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1c1c1c] border border-dashed border-[#d4d4d4] dark:border-[#404040] rounded-2xl">
          <p className="text-sm text-[#777777] dark:text-[#888888]">No projects match &ldquo;{query}&rdquo;.</p>
          <button onClick={() => setQuery('')} className="mt-3 text-sm font-semibold text-[#075056] dark:text-[#5eead4] hover:underline">Clear search</button>
        </div>
      ) : (() => {
        // Group projects by month they were created (most recent month first).
        // Build a Map keyed by YYYY-MM so insertion order = chronological-desc when
        // we sort the source array first.
        const sorted = [...visibleProjects].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const groups = new Map();
        sorted.forEach((p) => {
          const d = new Date(p.created_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!groups.has(key)) {
            groups.set(key, {
              label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
              isCurrent: (() => {
                const now = new Date();
                return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
              })(),
              list: [],
            });
          }
          groups.get(key).list.push(p);
        });

        const sections = Array.from(groups.values());

        const renderCard = (project) => {
          const ss = statusStyle(project.status);
          const pageCount = project.row_count || 0;
          const { keyword, location } = summaryFor(project);
          return (
            <button
              key={project.id}
              type="button"
              onClick={() => openProject(project)}
              className="group relative text-left flex flex-col bg-white dark:bg-[#1c1c1c] border border-[#d4d4d4] dark:border-[#404040] rounded-2xl overflow-hidden p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_28px_rgba(0,0,0,0.5)] hover:border-[#075056] dark:hover:border-white hover:-translate-y-0.5 transition-all duration-300 cursor-pointer min-h-[200px]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${ss.bg} ${ss.fg}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
                  </svg>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${ss.fg} ${ss.bg} border ${ss.border} px-2.5 py-1 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${ss.dot} shadow-[0_0_0_2px_rgba(255,255,255,0.4)] dark:shadow-[0_0_0_2px_rgba(255,255,255,0.06)]`} />
                  {project.status || 'Draft'}
                </span>
              </div>

              <h3 className="text-[15px] font-bold text-[#262626] dark:text-white tracking-tight leading-tight mb-2 line-clamp-2">{project.name}</h3>

              {/* Keyword + location chips */}
              {(keyword || location) && (
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  {keyword && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#555555] dark:text-[#bbbbbb] bg-[#f5f5f5] dark:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#333333] px-2 py-0.5 rounded-md max-w-full truncate">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M20 12V8H6a2 2 0 1 1 0-4h12.5"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>
                      <span className="truncate">{keyword}</span>
                    </span>
                  )}
                  {location && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#555555] dark:text-[#bbbbbb] bg-[#f5f5f5] dark:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#333333] px-2 py-0.5 rounded-md max-w-full truncate">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      <span className="truncate">{location}</span>
                    </span>
                  )}
                </div>
              )}

              <p className="text-xs text-[#777777] dark:text-[#888888] leading-relaxed mb-4 flex-1">
                <span className="font-bold text-[#262626] dark:text-white">{pageCount}</span> {pageCount === 1 ? 'page' : 'pages'} &middot; created {formatDate(project.created_at)}
              </p>

              <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-[#f0f0f0] dark:border-[#2c2c2c]">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#aaaaaa] dark:text-[#666666]">View pages</span>
                <svg className="w-4 h-4 text-[#cccccc] dark:text-[#464646] group-hover:text-[#075056] dark:group-hover:text-[#5eead4] group-hover:translate-x-0.5 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </button>
          );
        };

        return (
          <div className="space-y-12">
            {sections.map(({ label, isCurrent, list }) => (
              <section key={label}>
                <div className="flex items-baseline justify-between mb-4">
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-xl font-black text-[#262626] dark:text-white tracking-tight">{label}</h2>
                    {isCurrent && (
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#075056] dark:text-[#5eead4] bg-[#075056]/10 dark:bg-[#075056]/20 px-2 py-0.5 rounded-full">
                        This month
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#888888] dark:text-[#666666]">{list.length} {list.length === 1 ? 'project' : 'projects'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-6">
                  {list.map(renderCard)}
                </div>
              </section>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

function ProjectDetailView({ project, session, onBack, onRefresh, onQueueUpdate }) {
  const [pages, setPages]               = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [fallbackModal, setFallbackModal] = useState(null);

  // Project deletion
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Pages view mode — grid (default) or list (table). Persisted per-user.
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window === 'undefined') return 'grid';
    return localStorage.getItem('gg-pages-view') || 'grid';
  });
  useEffect(() => {
    try { localStorage.setItem('gg-pages-view', viewMode); } catch {}
  }, [viewMode]);

  // Bulk generation state
  const [showBulkPanel, setShowBulkPanel] = useState(false);
  const [bulkMode, setBulkMode]           = useState('locations'); // 'locations' | 'custom'
  const [locationInput, setLocationInput] = useState('');
  const [keywordInput, setKeywordInput]   = useState(project.data?.settings?.keyword || '');
  const [customInput, setCustomInput]     = useState('');

  // Queue runner state
  const [queue, setQueue]           = useState([]); // [{keyword, location, id}]
  const [queueRunning, setQueueRunning] = useState(false);
  const [queueDone, setQueueDone]   = useState(0);
  const [queueErrors, setQueueErrors] = useState([]); // [{keyword, location, error}]
  const [currentItem, setCurrentItem] = useState(null); // {keyword, location}
  const abortRef = useRef(false);

  useEffect(() => { fetchPages(); }, []);

  // Bubble queue status up to page.js so the floating widget works across tabs
  useEffect(() => {
    onQueueUpdate?.({
      running: queueRunning,
      done: queueDone,
      total: queue.length,
      projectName: project.name,
      projectId: project.id,
      currentItem,
    });
  }, [queueRunning, queueDone, queue.length, currentItem]);

  const fetchPages = async () => {
    setLoadingPages(true);
    try {
      const url = `${SUPABASE_URL}/rest/v1/pages?select=id,keyword,location,status,created_at&project_id=eq.${encodeURIComponent(project.id)}&order=created_at.asc`;

      const tryFetch = async (token) => {
        const fetchPromise = fetch(url, {
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
        });
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('fetchPages timed out after 15s.')), 15000)
        );
        return Promise.race([fetchPromise, timeout]);
      };

      let token = session?.access_token;
      if (!token) { setLoadingPages(false); return; }
      let res = await tryFetch(token);

      // Token expired? Force a refresh and retry once.
      if (res.status === 401) {
        const { data, error } = await supabase.auth.refreshSession();
        if (error || !data?.session?.access_token) {
          throw new Error('Session expired. Please refresh the page or sign in again.');
        }
        token = data.session.access_token;
        res = await tryFetch(token);
      }

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`fetchPages failed (${res.status}): ${text || res.statusText}`);
      }
      const data = await res.json();
      setPages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[projects] Failed to load pages:', err);
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

  // Parse the bulk panel inputs into a queue of {keyword, location} pairs
  const buildQueue = () => {
    if (bulkMode === 'locations') {
      const kw = keywordInput.trim() || project.name;
      return locationInput
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)
        .map(loc => ({ keyword: kw, location: loc }));
    } else {
      return customInput
        .split('\n')
        .map(line => {
          const [kw, ...rest] = line.split(',');
          return { keyword: (kw || '').trim(), location: rest.join(',').trim() };
        })
        .filter(r => r.keyword && r.location);
    }
  };

  // Generate a single page and save it
  const generateOne = async (keyword, location, template, settings) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 110000); // 110s timeout

    let response;
    try {
      response = await apiFetch('/api/generate-page', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId:           project.id,
          keyword,
          location,
          service:             project.name,
          businessDescription: settings.businessDescription || '',
          services:            settings.services || '',
          usps:                settings.usps || '',
          targetCustomer:      settings.targetCustomer || '',
          phone:               settings.phone || '',
          yearsInBusiness:     settings.yearsInBusiness || '',
          tone:                settings.tone || 'Professional',
          length:              settings.length || 'Medium',
          template_html:       template?.structure || '',
        }),
      });
    } catch (err) {
      throw new Error(err.name === 'AbortError' ? 'Timed out after 110s' : err.message);
    } finally {
      clearTimeout(timer);
    }

    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error(`HTTP ${response.status}: bad response from server`);
    }
    if (!response.ok) throw new Error(result?.error || `HTTP ${response.status}`);
    if (!result.html) throw new Error('Server returned empty HTML');

    // Add optimistic row immediately so the user sees it
    const tmpId = `tmp-${Date.now()}`;
    setPages(prev => [...prev, {
      id:         tmpId,
      keyword:    `${keyword} in ${location}`,
      location,
      status:     'completed',
      created_at: new Date().toISOString(),
    }]);

    // Save via PostgREST directly. supabase-js's .insert().select().single()
    // chain has been silently stalling on this app — when that happens the tmp
    // row never gets a real DB id, so Preview/Delete break and the row vanishes
    // on refresh. fetch() with a timeout can't hang.
    (async () => {
      const token = session?.access_token;
      if (!token) { console.error('Page save: no access token'); return; }
      try {
        const fetchPromise = fetch(`${SUPABASE_URL}/rest/v1/pages`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({
            project_id:   project.id,
            user_id:      session?.user?.id,
            keyword:      `${keyword} in ${location}`,
            location,
            html_content: result.html,
            status:       'completed',
          }),
        });
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Page insert timed out after 20s.')), 20000)
        );
        const res = await Promise.race([fetchPromise, timeout]);
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Page insert failed (${res.status}): ${text || res.statusText}`);
        }
        const rows = await res.json().catch(() => []);
        const realId = Array.isArray(rows) ? rows[0]?.id : rows?.id;
        if (realId) {
          setPages(prev => prev.map(p => p.id === tmpId ? { ...p, id: realId } : p));
          console.log('[projects] page saved', realId);
        }
      } catch (e) {
        console.error('[projects] page insert error:', e.message);
        // Mark the optimistic row as failed so the user sees something is wrong
        setPages(prev => prev.map(p => p.id === tmpId ? { ...p, status: 'failed', error: e.message } : p));
      }
    })();
  };

  const handleStartQueue = async () => {
    const items = buildQueue();
    if (!items.length) return;

    setQueue(items);
    setQueueDone(0);
    setQueueErrors([]);
    setQueueRunning(true);
    setShowBulkPanel(false);
    abortRef.current = false;

    let template;
    try {
      template = await getProjectTemplate();
    } catch {
      template = STARTER_TEMPLATES[0];
    }
    const settings = project.data?.settings || {};

    for (let i = 0; i < items.length; i++) {
      if (abortRef.current) break;
      const { keyword, location } = items[i];
      setCurrentItem({ keyword, location });
      try {
        await generateOne(keyword, location, template, settings);
      } catch (err) {
        console.error(`Failed: ${keyword} / ${location}:`, err.message);
        setQueueErrors(prev => [...prev, { keyword, location, error: err.message }]);
      }
      setQueueDone(i + 1);
    }

    setCurrentItem(null);
    setQueueRunning(false);
  };

  const handleStopQueue = () => { abortRef.current = true; };

  const handlePreview = async (page) => {
    // Optimistic rows added during queue have a tmp- id — not yet in DB
    if (String(page.id).startsWith('tmp-')) {
      setFallbackModal(page);
      return;
    }
    // html_content is not loaded in the list query — fetch it now
    const { data, error } = await supabase
      .from('pages')
      .select('html_content')
      .eq('id', page.id)
      .single();
    const html = data?.html_content;
    if (!error && html) {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } else {
      setFallbackModal(page);
    }
  };

  const handleDeletePage = async (pageId) => {
    if (!confirm('Delete this page? This cannot be undone.')) return;
    if (!String(pageId).startsWith('tmp-')) {
      await supabase.from('pages').delete().eq('id', pageId);
    }
    setPages(prev => prev.filter(p => p.id !== pageId));
  };

  const handleDownload = async () => {
    try {
      // Fetch html_content for all pages (not loaded in list query)
      const { data: fullPages } = await supabase
        .from('pages')
        .select('id, keyword, location, html_content')
        .eq('project_id', project.id);
      const downloadPages = (fullPages || []).map(p => ({
        html_content: p.html_content,
        keyword: p.keyword,
        location: p.location,
        slug: p.keyword.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-'),
      }));
      const response = await apiFetch('/api/download-zip', {
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
    setDeleting(true);
    setDeleteError(null);
    const token = session?.access_token;
    if (!token) { setDeleting(false); setDeleteError('Not signed in.'); return; }
    try {
      const fetchPromise = fetch(
        `${SUPABASE_URL}/rest/v1/projects?id=eq.${encodeURIComponent(project.id)}`,
        {
          method: 'DELETE',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token}`,
            Prefer: 'return=representation',
          },
        }
      );
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Delete timed out after 15s.')), 15000)
      );
      const res = await Promise.race([fetchPromise, timeout]);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Delete failed (${res.status}): ${text || res.statusText}`);
      }
      const rows = await res.json().catch(() => []);
      if (Array.isArray(rows) && rows.length === 0) {
        throw new Error("Couldn't delete the project — RLS may be blocking it. Add a DELETE policy on the projects table.");
      }
      // Close modal, refresh list, and pop back to Projects view
      setDeleting(false);
      setDeleteOpen(false);
      onRefresh();
      onBack();
    } catch (err) {
      console.error('[projects] delete failed:', err);
      setDeleting(false);
      setDeleteError(err?.message || String(err));
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
          <p className="text-xl text-slate-500 dark:text-[#fbfbfb]">
            {loadingPages ? 'Loading pages…' : `${pages.length} ${pages.length === 1 ? 'page' : 'pages'} generated`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={pages.length === 0}
            className="px-5 py-3 bg-white dark:bg-[#262626] border-2 border-slate-200 dark:border-[#333333] text-slate-900 dark:text-white font-bold rounded-xl hover:border-[#075056] disabled:opacity-40 transition-all"
          >
            Download ZIP
          </button>
          <button
            onClick={() => { setDeleteError(null); setDeleteOpen(true); }}
            className="px-5 py-3 text-red-600 dark:text-red-400 font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Bulk generate panel */}
      {showBulkPanel && (
        <div className="bg-white dark:bg-[#262626] border border-slate-200 dark:border-[#333333] rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Generate Pages</h2>
              <p className="text-sm text-slate-500 dark:text-[#fbfbfb] mt-0.5">Pages are generated one by one using your project&apos;s template and settings.</p>
            </div>
            <button onClick={() => setShowBulkPanel(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 dark:text-[#fbfbfb]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Mode tabs */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setBulkMode('locations')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${bulkMode === 'locations' ? 'bg-[#075056] border-[#075056] text-white' : 'bg-white dark:bg-[#333333] border-slate-200 dark:border-[#3a3a3a] text-slate-600 dark:text-[#fbfbfb] hover:border-[#075056]'}`}
            >
              By Location
            </button>
            <button
              onClick={() => setBulkMode('custom')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${bulkMode === 'custom' ? 'bg-[#075056] border-[#075056] text-white' : 'bg-white dark:bg-[#333333] border-slate-200 dark:border-[#3a3a3a] text-slate-600 dark:text-[#fbfbfb] hover:border-[#075056]'}`}
            >
              Custom List
            </button>
          </div>

          {bulkMode === 'locations' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider mb-2">Keyword / Service</label>
                <input
                  type="text"
                  value={keywordInput}
                  onChange={e => setKeywordInput(e.target.value)}
                  placeholder="e.g., emergency plumber"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#333333] border border-slate-200 dark:border-[#3a3a3a] rounded-xl focus:outline-none focus:border-[#075056] text-sm transition-colors"
                />
                <p className="text-xs text-slate-400 mt-1 dark:text-[#fbfbfb]">One keyword applied to every location below.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider mb-2">
                  Locations <span className="normal-case font-normal">(one per line)</span>
                </label>
                <textarea
                  value={locationInput}
                  onChange={e => setLocationInput(e.target.value)}
                  placeholder={"Chicago\nNew York\nLos Angeles\nHouston\nPhoenix"}
                  rows={8}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#333333] border border-slate-200 dark:border-[#3a3a3a] rounded-xl focus:outline-none focus:border-[#075056] text-sm font-mono transition-colors resize-none"
                />
                <p className="text-xs text-slate-400 mt-1 dark:text-[#fbfbfb]">
                  {locationInput.split('\n').filter(l => l.trim()).length} locations → {locationInput.split('\n').filter(l => l.trim()).length} pages
                </p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider mb-2">
                Keyword, Location pairs <span className="normal-case font-normal">(one per line)</span>
              </label>
              <textarea
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                placeholder={"emergency plumber, Chicago\ndrain cleaning, New York\nboiler repair, Los Angeles"}
                rows={10}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#333333] border border-slate-200 dark:border-[#3a3a3a] rounded-xl focus:outline-none focus:border-[#075056] text-sm font-mono transition-colors resize-none"
              />
              <p className="text-xs text-slate-400 mt-1 dark:text-[#fbfbfb]">
                {customInput.split('\n').filter(l => { const [k,,r] = [l.split(',')[0], ...l.split(',').slice(1)]; return (l.split(',')[0]||'').trim() && l.split(',').slice(1).join(',').trim(); }).length} valid pairs
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-100 dark:border-[#333333]">
            <button onClick={() => setShowBulkPanel(false)} className="px-4 py-2 text-slate-500 text-sm font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-[#303030] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleStartQueue}
              disabled={buildQueue().length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-[#075056] text-white text-sm font-bold rounded-xl hover:bg-[#064548] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Generate {buildQueue().length} page{buildQueue().length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {/* Queue progress bar */}
      {queueRunning && (
        <div className="bg-white dark:bg-[#262626] border border-[#075056]/30 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Generating {queueDone + 1} of {queue.length}…
              </p>
              {currentItem && (
                <p className="text-xs text-slate-500 dark:text-[#fbfbfb] mt-0.5">
                  {currentItem.keyword} / {currentItem.location}
                </p>
              )}
            </div>
            <button onClick={handleStopQueue} className="px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              Stop
            </button>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-[#333333] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#075056] rounded-full transition-all duration-500"
              style={{ width: `${Math.round((queueDone / queue.length) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2 dark:text-[#fbfbfb]">{queue.length - queueDone} remaining · ~{Math.round((queue.length - queueDone) * 0.75)} min</p>
        </div>
      )}

      {/* Queue done summary */}
      {!queueRunning && queueDone > 0 && (
        <div className={`rounded-2xl p-4 mb-6 text-sm font-medium ${queueErrors.length === 0 ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'}`}>
          {queueErrors.length === 0
            ? `All ${queueDone} pages generated successfully.`
            : `${queueDone - queueErrors.length} of ${queueDone} succeeded. ${queueErrors.length} failed: ${queueErrors.map(e => `${e.keyword} / ${e.location}`).join(', ')}`
          }
        </div>
      )}

      {/* Pages */}
      <div className="bg-white dark:bg-[#262626] border border-slate-200 dark:border-[#333333] rounded-2xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#333333]">
          <h2 className="font-bold text-slate-900 dark:text-white">Pages</h2>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="hidden sm:flex items-center bg-[#f5f5f5] dark:bg-[#1c1c1c] rounded-lg p-0.5 border border-[#e5e5e5] dark:border-[#333333]">
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                className={`px-2.5 py-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-[#333333] text-[#075056] dark:text-[#5eead4] shadow-sm' : 'text-[#999999] dark:text-[#777777] hover:text-[#262626] dark:hover:text-white'}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="List view"
                className={`px-2.5 py-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-[#333333] text-[#075056] dark:text-[#5eead4] shadow-sm' : 'text-[#999999] dark:text-[#777777] hover:text-[#262626] dark:hover:text-white'}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </button>
            </div>
            <button
              onClick={() => setShowBulkPanel(true)}
              disabled={queueRunning}
              className="flex items-center gap-2 px-4 py-2 bg-[#075056] text-white text-sm font-semibold rounded-xl hover:bg-[#064548] disabled:opacity-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Generate Pages
            </button>
          </div>
        </div>

        {loadingPages ? (
          <div className="flex justify-center py-16">
            <Loader inline />
          </div>
        ) : pages.length === 0 && !queueRunning ? (
          <div className="text-center py-16 text-slate-500 dark:text-[#fbfbfb]">
            <div className="w-16 h-16 bg-slate-100 dark:bg-[#333333] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400 dark:text-[#fbfbfb]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="font-semibold mb-1">No pages yet</p>
            <p className="text-sm">Click &quot;Generate Pages&quot; to start building your SEO pages</p>
          </div>
        ) : viewMode === 'grid' ? (
          <PagesGrid
            pages={pages}
            queueRunning={queueRunning}
            currentItem={currentItem}
            accessToken={session?.access_token}
            onPreview={handlePreview}
            onDelete={handleDeletePage}
            onGenerateMore={() => setShowBulkPanel(true)}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#333333]">
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider">Keyword</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-[#fbfbfb] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#303030]">
              {queueRunning && currentItem && (
                <tr className="bg-[#075056]/5 dark:bg-[#075056]/10">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">{currentItem.keyword} in {currentItem.location}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-[#fbfbfb]">{currentItem.location}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#075056]/10 text-[#075056]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#075056] animate-pulse" />
                      Generating…
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 dark:text-[#fbfbfb]">Now</td>
                  <td className="px-6 py-4" />
                </tr>
              )}
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50 dark:hover:bg-[#1c1c1c] transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">{page.keyword}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-[#fbfbfb]">{page.location}</td>
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
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-[#fbfbfb]">
                    {new Date(page.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handlePreview(page)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#075056] border border-[#075056]/30 rounded-lg hover:bg-[#075056]/5 transition-colors"
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

      {/* Deploy section */}
      <DeploySection pages={pages} />

      {/* Confirm delete project */}
      {deleteOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-6 animate-fade-in"
          onClick={() => !deleting && setDeleteOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] shadow-[0_30px_80px_rgba(0,0,0,0.4)] max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-black text-[#262626] dark:text-white tracking-tight mb-1">
                  Delete this project?
                </h3>
                <p className="text-sm text-[#555555] dark:text-[#bbbbbb] leading-relaxed">
                  <span className="font-semibold text-[#262626] dark:text-white">{project.name}</span> and all{' '}
                  {pages.length} {pages.length === 1 ? 'page' : 'pages'} inside it will be permanently removed. This cannot be undone.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-300">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
                className="px-5 py-2.5 text-[#555555] dark:text-[#bbbbbb] hover:text-[#262626] dark:hover:text-white text-sm font-semibold rounded-xl hover:bg-[#f5f5f5] dark:hover:bg-[#262626] disabled:opacity-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={deleting}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {deleting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {deleting ? 'Deleting…' : 'Delete project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fallback modal for pages without stored HTML */}
      {fallbackModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-8" onClick={() => setFallbackModal(null)}>
          <div className="bg-white dark:bg-[#1c1c1c] rounded-3xl max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{fallbackModal.keyword}</h3>
            <p className="text-slate-500 dark:text-[#fbfbfb] mb-6">{fallbackModal.location}</p>
            <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
              Preview unavailable. This page may have been generated before HTML storage was enabled. Download the ZIP to access the full file.
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

// Logo: img from Simple Icons CDN — always accurate brand icons, no SVG paths to maintain
const CmsLogo = ({ slug, label }) => (
  <img
    src={`https://cdn.simpleicons.org/${slug}/ffffff`}
    alt={label}
    width={32}
    height={32}
    className="w-8 h-8 object-contain"
  />
);

const CMS_OPTIONS = [
  {
    id: 'html',
    name: 'HTML / Static',
    logo: (
      <svg className="w-8 h-8" fill="none" stroke="white" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    color: 'from-orange-500 to-red-500',
    steps: [
      'Click "Download ZIP" to get all your HTML files.',
      'Unzip the folder. Each file is a ready-to-use landing page.',
      'Upload to Netlify (drag-and-drop), Vercel, or your cPanel File Manager.',
      'Point your domain or subdomains to the uploaded files.',
    ],
  },
  {
    id: 'wordpress',
    name: 'WordPress',
    logo: <CmsLogo slug="wordpress" label="WordPress" />,
    color: 'from-[#21759b] to-[#135e7a]',
    steps: [
      'Install the free "WP File Manager" plugin from your WordPress dashboard.',
      'Download your pages as a ZIP and extract locally.',
      'In WP File Manager, navigate to /wp-content/ and create a folder called "landing-pages".',
      'Upload your HTML files into that folder.',
      'Pages are now live at yoursite.com/wp-content/landing-pages/page-name.html',
      'Tip: Use the "Custom Permalinks" plugin to create cleaner URLs like /services/city.',
    ],
  },
  {
    id: 'webflow',
    name: 'Webflow',
    logo: <CmsLogo slug="webflow" label="Webflow" />,
    color: 'from-[#4353ff] to-[#2d3de0]',
    steps: [
      'In your Webflow project, go to Pages → Add page for each location.',
      'In Page Settings, use "Custom Code" sections to inject head styles and body content.',
      'Alternatively use "Embed" elements to drop full HTML blocks into the page.',
      'Publish your Webflow project. Each page goes live instantly.',
    ],
  },
  {
    id: 'squarespace',
    name: 'Squarespace',
    logo: <CmsLogo slug="squarespace" label="Squarespace" />,
    color: 'from-slate-700 to-slate-900',
    steps: [
      'In Squarespace, add a new blank page for each location.',
      'Add a "Code Block" element to the page body.',
      'Paste your full HTML (including inline styles) into the Code Block.',
      'Use Page Settings → Advanced → "Header Code Injection" to add any additional CSS.',
      'Save and publish.',
    ],
  },
  {
    id: 'wix',
    name: 'Wix',
    logo: <CmsLogo slug="wix" label="Wix" />,
    color: 'from-[#faad4d] to-[#f7961c]',
    steps: [
      'In Wix Editor, add a new blank page for each location.',
      'Click "+" → "More" → "HTML iFrame" element.',
      'Paste your page HTML into the HTML settings panel.',
      'Resize the iFrame to fill the full page width and height.',
      'Publish your site.',
    ],
  },
  {
    id: 'shopify',
    name: 'Shopify',
    logo: <CmsLogo slug="shopify" label="Shopify" />,
    color: 'from-[#96bf48] to-[#5e8e3e]',
    steps: [
      'In Shopify Admin, go to Online Store → Pages → Add page.',
      'Switch the editor to HTML mode (click the "<>" icon).',
      'Paste your generated page body HTML into the editor.',
      'For styles: go to Online Store → Themes → Edit Code and add a new .css asset.',
      'Save the page and view it from your storefront.',
    ],
  },
  {
    id: 'other',
    name: 'Other CMS',
    logo: (
      <svg className="w-8 h-8" fill="none" stroke="white" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    color: 'from-slate-400 to-slate-600',
    steps: [
      'Download your HTML ZIP.',
      'In your CMS, create a new page or post for each location.',
      'Look for a "Custom HTML", "Code Block", or "Raw HTML" option.',
      'Paste the HTML content for each corresponding page.',
      "Most modern CMS platforms support custom HTML injection. Check your platform's docs under \"Custom HTML page\" or \"embed code\".",
    ],
  },
];

function DeploySection({ pages }) {
  const [activeTab, setActiveTab] = useState('html');
  const activeCms = CMS_OPTIONS.find(c => c.id === activeTab) || CMS_OPTIONS[0];

  return (
    <div className="mt-8 bg-white dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-2xl overflow-hidden">
      {/* Compact header — accent stripe instead of loud gradient */}
      <div className="relative px-6 py-5 border-b border-[#f0f0f0] dark:border-[#333333]">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#075056]" />
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#075056] dark:text-[#5eead4] mb-1">Publish</div>
            <h2 className="text-lg font-black text-[#262626] dark:text-white tracking-tight">Deploy your pages</h2>
            <p className="text-sm text-[#666666] dark:text-[#aaaaaa] mt-0.5">
              {pages.length > 0
                ? `Pick the platform you'll publish ${pages.length === 1 ? 'this page' : `these ${pages.length} pages`} on.`
                : 'Pick the platform you plan to publish on.'}
            </p>
          </div>
        </div>
      </div>

      {/* Platform picker — pill row with subtle logos */}
      <div className="px-6 pt-5">
        <div className="flex flex-wrap gap-2">
          {CMS_OPTIONS.map((cms) => {
            const active = activeTab === cms.id;
            return (
              <button
                key={cms.id}
                onClick={() => setActiveTab(cms.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  active
                    ? 'bg-[#075056] border-[#075056] text-white shadow-sm'
                    : 'bg-[#fafafa] dark:bg-[#1c1c1c] border-[#e5e5e5] dark:border-[#333333] text-[#555555] dark:text-[#bbbbbb] hover:border-[#075056] hover:text-[#075056] dark:hover:text-[#5eead4]'
                }`}
              >
                {cms.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected platform — inline steps, no separate banner */}
      <div className="px-6 py-5">
        <ol className="space-y-2.5">
          {activeCms.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#075056]/10 dark:bg-[#5eead4]/10 text-[#075056] dark:text-[#5eead4] text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-[#444444] dark:text-[#dddddd] leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>

        {activeCms.id !== 'html' && (
          <p className="mt-4 text-xs text-[#888888] dark:text-[#888888]">
            Tip: download the ZIP from the top of this project page to grab the HTML files referenced in the steps above.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Pages grid view ──────────────────────────────────────────────────────────

// Block clicks/scroll inside thumbnail iframes so they're purely visual.
const THUMB_DISABLE_SCRIPT = `
<style>
  html, body { overflow: hidden !important; cursor: default !important; }
  *, *:hover { cursor: default !important; }
  a, button, [role="button"], input, textarea, select { pointer-events: none !important; }
</style>
`;

// Thumbnails are visual-only. Strip <script> tags so the sandboxed iframe doesn't
// log "Blocked script execution" warnings for every script the page tried to run.
const stripScripts = (html) => String(html || '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

function PagesGrid({ pages, queueRunning, currentItem, accessToken, onPreview, onDelete, onGenerateMore }) {
  return (
    <div className="p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {queueRunning && currentItem && (
          <div className="relative bg-white dark:bg-[#1c1c1c] border-2 border-dashed border-[#075056] dark:border-[#5eead4] rounded-2xl overflow-hidden flex flex-col">
            <div className="aspect-[16/9] flex items-center justify-center bg-gradient-to-br from-[#075056]/5 to-[#5eead4]/10 dark:from-[#075056]/10 dark:to-[#5eead4]/10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-[#075056] border-t-transparent dark:border-[#5eead4] dark:border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#075056] dark:text-[#5eead4]">Generating…</span>
              </div>
            </div>
            <div className="p-4">
              <div className="text-sm font-bold text-[#262626] dark:text-white truncate">{currentItem.keyword}</div>
              <div className="text-xs text-[#777777] dark:text-[#888888] truncate mt-0.5">{currentItem.location}</div>
            </div>
          </div>
        )}
        {pages.map((page) => (
          <PageThumbCard
            key={page.id}
            page={page}
            accessToken={accessToken}
            onPreview={onPreview}
            onDelete={onDelete}
          />
        ))}

        {/* Ghost CTA at end of grid — always present so the row never feels empty */}
        {!queueRunning && (
          <button
            type="button"
            onClick={onGenerateMore}
            className="group flex flex-col bg-transparent border-2 border-dashed border-[#d4d4d4] dark:border-[#3a3a3a] rounded-2xl overflow-hidden hover:border-[#075056] dark:hover:border-[#5eead4] hover:bg-[#075056]/5 dark:hover:bg-[#5eead4]/5 hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#075056]/10 dark:bg-[#5eead4]/10 text-[#075056] dark:text-[#5eead4] flex items-center justify-center group-hover:rotate-90 group-hover:bg-[#075056] group-hover:text-white dark:group-hover:bg-[#075056] transition-all duration-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-[#262626] dark:text-white">Generate more pages</p>
                <p className="text-xs text-[#888888] dark:text-[#888888] mt-1">Add more keywords or locations</p>
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

function PageThumbCard({ page, accessToken, onPreview, onDelete }) {
  const cardRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [html, setHtml] = useState(null);
  const [thumbState, setThumbState] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'failed' | 'pending'

  const isTmp = String(page.id).startsWith('tmp-');
  const isReady = page.status === 'completed';
  const isFailed = page.status === 'failed';

  // Lazy: only watch for visibility once
  useEffect(() => {
    if (!cardRef.current || inView) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, { rootMargin: '300px' });
    obs.observe(cardRef.current);
    return () => obs.disconnect();
  }, [inView]);

  // Fetch html_content the first time the card is in view
  useEffect(() => {
    if (!inView || html !== null || thumbState !== 'idle') return;
    if (isTmp) { setThumbState('pending'); return; }
    if (!isReady) { setThumbState('failed'); return; }
    if (!accessToken) return;
    setThumbState('loading');
    const url = `${SUPABASE_URL}/rest/v1/pages?select=html_content&id=eq.${encodeURIComponent(page.id)}`;
    fetch(url, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}` },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const rows = await r.json();
        return Array.isArray(rows) ? rows[0]?.html_content : rows?.html_content;
      })
      .then((content) => {
        setHtml(content || '');
        setThumbState(content ? 'ready' : 'failed');
      })
      .catch(() => setThumbState('failed'));
  }, [inView, html, thumbState, accessToken, page.id, isTmp, isReady]);

  const statusPill = (() => {
    if (isTmp) return { text: 'Saving…', cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' };
    if (isFailed) return { text: 'Failed', cls: 'bg-red-500/15 text-red-700 dark:text-red-300', dot: 'bg-red-500' };
    if (isReady) return { text: 'Ready', cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' };
    return { text: page.status || 'Pending', cls: 'bg-slate-500/15 text-slate-600 dark:text-slate-300', dot: 'bg-slate-400' };
  })();

  return (
    <div
      ref={cardRef}
      className="group relative flex flex-col bg-white dark:bg-[#1c1c1c] border border-[#e5e5e5] dark:border-[#333333] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)] hover:border-[#075056] dark:hover:border-[#5eead4] hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Thumbnail */}
      <button
        type="button"
        onClick={() => onPreview(page)}
        className="relative aspect-[16/9] overflow-hidden bg-[#fafafa] dark:bg-[#111111] border-b border-[#f0f0f0] dark:border-[#2a2a2a] cursor-pointer text-left"
        aria-label={`Preview ${page.keyword}`}
      >
        {thumbState === 'ready' && html ? (
          // Iframe is rendered 4x its container then scaled down 0.25 — so it
          // always fills the card edge-to-edge regardless of card width.
          <div className="absolute inset-0 pointer-events-none">
            <iframe
              title={page.keyword}
              srcDoc={THUMB_DISABLE_SCRIPT + stripScripts(html)}
              sandbox="allow-same-origin"
              className="border-0 absolute top-0 left-0"
              style={{
                width: '400%',
                height: '400%',
                transform: 'scale(0.25)',
                transformOrigin: 'top left',
                pointerEvents: 'none',
              }}
            />
          </div>
        ) : thumbState === 'loading' ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-[#075056]/30 border-t-[#075056] dark:border-[#5eead4]/30 dark:border-t-[#5eead4] rounded-full animate-spin" />
          </div>
        ) : thumbState === 'pending' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
            <div className="w-8 h-8 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">Saving</span>
          </div>
        ) : thumbState === 'failed' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-700 dark:text-red-300">Preview unavailable</span>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#fafafa] to-[#f0f0f0] dark:from-[#1c1c1c] dark:to-[#161616]" />
        )}

        {/* Status pill */}
        <span className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.12em] ${statusPill.cls} backdrop-blur-md`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusPill.dot}`} />
          {statusPill.text}
        </span>

        {/* Hover overlay */}
        {thumbState === 'ready' && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-white text-[#075056] text-xs font-bold rounded-lg shadow-md transition-opacity">
              Open preview →
            </span>
          </div>
        )}
      </button>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 min-w-0">
        <h3 className="text-sm font-bold text-[#262626] dark:text-white truncate" title={page.keyword}>
          {page.keyword}
        </h3>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-[#777777] dark:text-[#888888]">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span className="truncate">{page.location}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-[#f0f0f0] dark:border-[#2a2a2a] flex items-center justify-between gap-2">
          <span className="text-[10px] text-[#aaaaaa] dark:text-[#666666]">
            {new Date(page.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPreview(page)}
              className="px-2.5 py-1 text-[11px] font-semibold text-[#075056] dark:text-[#5eead4] hover:bg-[#075056]/5 dark:hover:bg-[#5eead4]/10 rounded-md transition-colors"
            >
              Preview
            </button>
            <button
              onClick={() => onDelete(page.id)}
              className="p-1 text-[#aaaaaa] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
              title="Delete"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
