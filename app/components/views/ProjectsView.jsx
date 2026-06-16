'use client';
import { useState, useEffect, useRef, Fragment } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../../../lib/supabaseClient';
import { apiFetch, supabaseFetch } from '../../../lib/apiFetch';
import { MODIFIERS, phraseFor, modifierOrDefault } from '../../../lib/modifiers';
import { resolveTemplate, variationScore } from '../../../lib/templates';
import STARTER_TEMPLATES from '../../data/starterTemplates';
import Loader from '../Loader';
import { useConfirm } from '../ConfirmDialog';
import HelpIcon from '../HelpIcon';

export default function ProjectsView({ projects, onNewProject, onRefresh, onProjectDeleted, session, onQueueUpdate, initialProjectId }) {
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
        onProjectDeleted={onProjectDeleted}
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

// ── Chip-editor helpers ──
// Parse the raw template string into HTML, turning {{var}} and [A | B]
// patterns into styled non-editable chip spans. Plain text is preserved
// inline so the user can type around the chips.
function ggEscapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function renderTemplateToHtml(value) {
  if (!value) return '';
  let html = '';
  let i = 0;
  while (i < value.length) {
    if (value[i] === '{' && value[i + 1] === '{') {
      const end = value.indexOf('}}', i + 2);
      if (end !== -1) {
        const name = value.slice(i + 2, end).trim();
        if (/^[a-zA-Z_]\w*$/.test(name)) {
          html += `<span class="gg-chip gg-chip-var" contenteditable="false" data-chip="var">${ggEscapeHtml('{{' + name + '}}')}</span>`;
          i = end + 2;
          continue;
        }
      }
    }
    if (value[i] === '[') {
      const end = value.indexOf(']', i + 1);
      if (end !== -1) {
        const inner = value.slice(i + 1, end);
        if (inner.includes('|')) {
          html += `<span class="gg-chip gg-chip-group" contenteditable="false" data-chip="group">${ggEscapeHtml('[' + inner + ']')}</span>`;
          i = end + 1;
          continue;
        }
      }
    }
    if (value[i] === '\n') {
      html += '<br>';
    } else {
      html += ggEscapeHtml(value[i]);
    }
    i += 1;
  }
  return html;
}
// Walk the editor's DOM and reconstruct the raw template string. Chip spans
// have their literal {{name}} / [A | B] in textContent so we just take it.
function extractTextFromEditor(el) {
  if (!el) return '';
  let result = '';
  const walk = (node) => {
    node.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        result += child.textContent;
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const tag = child.tagName;
        if (tag === 'BR') {
          result += '\n';
        } else if (child.dataset && child.dataset.chip) {
          result += child.textContent;
        } else if (tag === 'DIV') {
          // Some browsers (Chrome) wrap each new line in a <div>. Emit \n
          // between sibling divs so multiline content stays consistent.
          if (result && !result.endsWith('\n')) result += '\n';
          walk(child);
        } else {
          walk(child);
        }
      }
    });
  };
  walk(el);
  // Browsers auto-insert a lone <br> in an empty contenteditable to mark the
  // cursor position. That extracts as '\n' which would falsely register as a
  // "user has content" signal. Treat whitespace-only values as truly empty.
  if (!result.trim()) return '';
  return result;
}

// Contenteditable text input with inline chip rendering. Plain text editing
// works as expected; chip spans (rendered from {{var}} / [A | B] patterns)
// behave like single characters — backspace deletes the whole chip.
function ChipEditor({ inputRef, value, onChange, placeholder, multiline, ariaLabel }) {
  const innerRef = useRef(null);
  const ref = inputRef || innerRef;

  // Sync external value → DOM. Skip when the DOM already matches (i.e. the
  // change originated from the user typing in this field) — re-rendering
  // would otherwise jump the cursor.
  useEffect(() => {
    if (!ref.current) return;
    const currentText = extractTextFromEditor(ref.current);
    if (currentText === value) return;
    ref.current.innerHTML = renderTemplateToHtml(value);
  }, [value, ref]);

  const handleInput = () => {
    const text = extractTextFromEditor(ref.current);
    if (text !== value) onChange(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!multiline) {
        e.preventDefault();
        return;
      }
      // Force <br> instead of browser-default <div> wrap so the parsed text
      // stays clean. execCommand is deprecated but still the simplest path
      // that handles cursor placement correctly across browsers.
      e.preventDefault();
      try { document.execCommand('insertLineBreak'); } catch { /* ignore */ }
    }
  };

  const handlePaste = (e) => {
    // Always paste as plain text so rich-text fragments don't leak in.
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    try { document.execCommand('insertText', false, text); } catch {
      // Fallback: append at cursor via Range API
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        range.collapse(false);
      }
    }
  };

  const isEmpty = !value || !value.trim();

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={ariaLabel}
      aria-multiline={multiline ? 'true' : 'false'}
      data-placeholder={placeholder}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      className={`gg-chip-editor${multiline ? ' gg-chip-editor--multi' : ''}${isEmpty ? ' gg-empty' : ''}`}
    />
  );
}

// One page-content field. Renders a chip-aware editor with click-to-insert
// pill buttons below. Used for Title, Hero copy, and Featured image fields.
function TemplateField({
  label,
  sublabel,
  value,
  onChange,
  placeholder,
  preview,
  multiline = false,
  maxLength = null,
  variables = ['keyword', 'modifier', 'service'],
  showVariationChip = true,
  footer = null,
}) {
  const editorRef = useRef(null);

  // Insert a chip span at the current cursor position (or at end if the
  // editor isn't focused). Then re-extract the text and push onChange.
  const insertChip = (rawToken) => {
    const el = editorRef.current;
    if (!el) { onChange(value + rawToken); return; }
    el.focus();
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = renderTemplateToHtml(rawToken);
    const chipNode = tempContainer.firstChild;
    if (!chipNode) { onChange(value + rawToken); return; }

    const sel = window.getSelection();
    let range;
    if (sel && sel.rangeCount > 0 && el.contains(sel.anchorNode)) {
      range = sel.getRangeAt(0);
      range.deleteContents();
    } else {
      range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
    }
    range.insertNode(chipNode);
    // Insert a trailing space so the user can keep typing after the chip
    // without the next character merging into the chip's selection
    const trailingSpace = document.createTextNode(' ');
    chipNode.parentNode.insertBefore(trailingSpace, chipNode.nextSibling);
    range.setStartAfter(trailingSpace);
    range.setEndAfter(trailingSpace);
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
    const next = extractTextFromEditor(el);
    if (next !== value) onChange(next);
  };

  const overLimit = maxLength != null && preview && preview.length > maxLength;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-[#888888] uppercase tracking-wider">
          {label}
          {sublabel && <span className="font-normal normal-case text-[10px] text-slate-400 dark:text-[#666666] ml-1">{sublabel}</span>}
        </label>
      </div>
      <ChipEditor
        inputRef={editorRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        multiline={multiline}
        ariaLabel={label}
      />
      {/* Chip insertion row — purely visual buttons. Clicking inserts a
          styled pill at the cursor. */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-[#666666] mr-0.5">Insert</span>
        {variables.map(v => (
          <button
            key={v}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insertChip(`{{${v}}}`)}
            className="px-1.5 py-0.5 text-[10.5px] font-mono rounded-md bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border border-violet-200/60 dark:border-violet-800/40 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
          >
            {`{{ ${v} }}`}
          </button>
        ))}
        {showVariationChip && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insertChip('[option | option]')}
            className="px-1.5 py-0.5 text-[10.5px] font-mono rounded-md bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 border border-pink-200/60 dark:border-pink-800/40 hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors"
            title="Variation group — one option picked per page"
          >
            [ A | B ]
          </button>
        )}
      </div>
      {value && value.trim() && preview && preview.trim() && (
        <p className="text-[11.5px] mt-1.5">
          <span className="font-bold uppercase tracking-[0.12em] text-[9.5px] text-slate-400 dark:text-[#666666] mr-2">Preview</span>
          <span className={overLimit ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-[#dddddd]'}>{preview}</span>
          {maxLength != null && (
            <span className="text-[10px] text-slate-400 dark:text-[#666666] ml-2 font-mono">{preview.length}/{maxLength}</span>
          )}
        </p>
      )}
      {footer}
    </div>
  );
}

function ProjectDetailView({ project, session, onBack, onRefresh, onProjectDeleted, onQueueUpdate }) {
  const confirm = useConfirm();
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
  const [bulkStep, setBulkStep]           = useState(1); // 1=Setup, 2=Content, 3=Generate
  const [bulkMode, setBulkMode]           = useState('locations'); // 'locations' | 'custom'
  // Per-batch modifier-type override — defaults to project setting but lets
  // users build a different page type for this batch (e.g. comparison pages
  // even though the project was created as location-based).
  const [bulkModifierType, setBulkModifierType] = useState(
    modifierOrDefault(project.data?.settings?.modifier_type)
  );
  // Featured-image state — one image applied to every page in this batch.
  // Two sources: direct upload (own image, no credit needed) or Unsplash
  // search (URL + attribution metadata required by Unsplash's TOS).
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [featuredImageCredit, setFeaturedImageCredit] = useState(null); // { photographer, photographer_url } | null
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'unsplash'
  const [unsplashQuery, setUnsplashQuery] = useState('');
  const [unsplashResults, setUnsplashResults] = useState([]);
  const [unsplashLoading, setUnsplashLoading] = useState(false);
  const [unsplashError, setUnsplashError] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [keywordInput, setKeywordInput]   = useState(project.data?.settings?.keyword || '');
  const [customInput, setCustomInput]     = useState('');

  // Theme picker — defaults to the project's template; can be overridden per
  // batch without changing the project default. Starter templates are
  // available immediately; user-saved templates load in on mount.
  const [availableTemplates, setAvailableTemplates] = useState(STARTER_TEMPLATES);
  const [bulkTemplateId, setBulkTemplateId] = useState(
    project.data?.settings?.templateId || STARTER_TEMPLATES[0]?.id || ''
  );

  // Content templates — title, hero subtitle, meta title, meta description.
  // Same {{var}} + [A|B|C] syntax. Persisted on the project so they're reused.
  const [titleTemplate, setTitleTemplate]       = useState(project.data?.settings?.contentTemplates?.title       || '');
  const [heroTemplate, setHeroTemplate]         = useState(project.data?.settings?.contentTemplates?.heroSub     || '');
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase.from('templates').select('*').order('created_at', { ascending: false });
        if (!mounted || error || !Array.isArray(data)) return;
        const starterIds = new Set(STARTER_TEMPLATES.map(t => t.id));
        setAvailableTemplates([...STARTER_TEMPLATES, ...data.filter(t => !starterIds.has(t.id))]);
      } catch { /* ignore — fall back to starter templates */ }
    })();
    return () => { mounted = false; };
  }, []);

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
      const path = `/rest/v1/pages?select=id,keyword,location,status,created_at&project_id=eq.${encodeURIComponent(project.id)}&order=created_at.asc`;
      const fetchPromise = supabaseFetch(path);
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('fetchPages timed out after 15s.')), 15000)
      );
      const res = await Promise.race([fetchPromise, timeout]);
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
  const generateOne = async (keyword, location, template, settings, overrides = {}) => {
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
          // Locked at the project level — every page in this project shares
          // the same programmatic-SEO angle.
          modifierType:        modifierOrDefault(settings.modifier_type),
          // Resolved per-row from the content templates (if the user set any).
          // The API substitutes these into the template before the AI runs.
          titleOverride:       overrides.titleOverride || '',
          subHeadOverride:     overrides.subHeadOverride || '',
          metaTitleOverride:   overrides.metaTitleOverride || '',
          metaDescOverride:    overrides.metaDescOverride || '',
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
    const projectModifier = modifierOrDefault(settings.modifier_type);
    setPages(prev => [...prev, {
      id:         tmpId,
      keyword:    phraseFor(projectModifier, keyword, location),
      location,
      status:     'completed',
      created_at: new Date().toISOString(),
    }]);

    // Save via PostgREST directly. supabase-js's .insert().select().single()
    // chain has been silently stalling on this app — when that happens the tmp
    // row never gets a real DB id, so Preview/Delete break and the row vanishes
    // on refresh. fetch() with a timeout can't hang.
    (async () => {
      try {
        const fetchPromise = supabaseFetch(`/rest/v1/pages`, {
          method: 'POST',
          headers: {
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
    abortRef.current = false;
    // Keep the panel open + pinned on Step 3 so the user can watch the live
    // status table fill in row by row.
    setBulkStep(3);

    // Prefer the user's per-batch pick; fall back to the project's default if
    // the picked template hasn't been loaded yet (e.g., a custom user template
    // that wasn't in the initial starter list).
    let template = availableTemplates.find(t => t.id === bulkTemplateId);
    if (!template) {
      try { template = await getProjectTemplate(); } catch { template = STARTER_TEMPLATES[0]; }
    }
    // Per-batch modifier override — settings sent to the API uses the user's
    // pick for this batch, not the project default. Doesn't change the
    // project itself; just this run.
    const settings = { ...(project.data?.settings || {}), modifier_type: bulkModifierType };

    // Persist content templates onto the project so they're remembered next time
    // (best-effort — never blocks generation).
    if (titleTemplate || heroTemplate) {
      try {
        const nextData = {
          ...(project.data || {}),
          settings: {
            ...(project.data?.settings || {}),
            contentTemplates: {
              title: titleTemplate,
              heroSub: heroTemplate,
            },
          },
        };
        supabase.from('projects').update({ data: nextData }).eq('id', project.id).then(() => {}, () => {});
      } catch { /* ignore */ }
    }

    for (let i = 0; i < items.length; i++) {
      if (abortRef.current) break;
      const { keyword, location } = items[i];
      setCurrentItem({ keyword, location });
      // Per-row seed → deterministic [A|B|C] picks; same row always resolves
      // the same way, but different rows pick different options.
      const rowVars = { keyword, modifier: location, location, service: project.name };
      const overrides = {
        titleOverride:    titleTemplate    ? resolveTemplate(titleTemplate, rowVars, i)    : '',
        subHeadOverride:  heroTemplate     ? resolveTemplate(heroTemplate, rowVars, i)     : '',
        featuredImageUrl: featuredImageUrl || '',
        featuredImageCredit: featuredImageCredit || null,
      };
      try {
        await generateOne(keyword, location, template, settings, overrides);
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

  // Open the project's theme template in a new tab with sample values
  // substituted in, so the user can see what the theme actually looks like
  // before generating anything. If pages already exist, prefer previewing the
  // first one (real content beats samples).
  const handlePreviewTheme = async () => {
    // If the user already has a generated page in this project, preview that
    // — it's more useful than a sample-substituted blank template.
    const firstReal = pages.find(p => !String(p.id).startsWith('tmp-'));
    if (firstReal) {
      handlePreview(firstReal);
      return;
    }
    // Otherwise, render the theme template with sample substitutions.
    let template = availableTemplates.find(t => t.id === (project.data?.settings?.templateId));
    if (!template) {
      try { template = await getProjectTemplate(); } catch { template = STARTER_TEMPLATES[0]; }
    }
    const structure = template?.structure || template?.html_content || '';
    if (!structure) { alert('Theme HTML not available for preview.'); return; }
    const m = MODIFIERS[bulkModifierType];
    const sampleKeyword = (keywordInput || project.data?.settings?.keyword || project.name || 'Your service').trim();
    const sampleLocation = (locationInput.split('\n').map(l => l.trim()).filter(Boolean)[0]
      || m.placeholder.replace(/^e\.g\.,\s*/, '')
      || 'Sample value');
    // Hero image preview — if the user already picked an image upstream, use
    // it; otherwise fall back to a deterministic Lorem Picsum URL so the
    // template's hero slot renders visibly rather than as a broken <img>.
    // Strip the HERO_IMG_BLOCK comment markers either way (they're only used
    // by the generation API to remove the whole block when no image is set).
    const previewImg = featuredImageUrl || 'https://picsum.photos/seed/grogoliath/1200/600';
    let html = structure
      .replace(/<!--\s*\{\{\s*HERO_IMG_BLOCK_START\s*\}\}\s*-->/g, '')
      .replace(/<!--\s*\{\{\s*HERO_IMG_BLOCK_END\s*\}\}\s*-->/g, '')
      .replace(/\{\{\s*HERO_IMAGE_URL\s*\}\}/g, previewImg)
      .replace(/\{\{\s*HERO_IMAGE\s*\}\}/g, previewImg)
      .replace(/\{\{\s*IMAGE_URL\s*\}\}/g, previewImg)
      .replace(/\{\{\s*HERO_IMG_CREDIT\s*\}\}/g, featuredImageUrl ? '' : 'Sample image · replaced with your photo on generation')
      .replace(/\{\{\s*KEYWORD\s*\}\}/g, sampleKeyword)
      .replace(/\{\{\s*LOCATION\s*\}\}/g, sampleLocation)
      .replace(/\{\{\s*SERVICE\s*\}\}/g, project.name || sampleKeyword)
      .replace(/\{\{\s*PHONE\s*\}\}/g, 'Call us today');
    // Any other {{ALL_CAPS_PLACEHOLDER}} → human-readable text so the page
    // doesn't read like raw markup.
    html = html.replace(/\{\{\s*([A-Z][A-Z0-9_]*)\s*\}\}/g, (_, name) => {
      const friendly = name.toLowerCase().replace(/_/g, ' ');
      return friendly.charAt(0).toUpperCase() + friendly.slice(1);
    });
    const win = window.open('', '_blank');
    if (!win) { alert('Pop-up blocked. Allow pop-ups for this site to preview the theme.'); return; }
    try {
      win.document.open();
      win.document.write(html);
      win.document.close();
    } catch (e) {
      console.error('Theme preview failed:', e);
    }
  };

  // Upload a featured image to Supabase Storage. The returned public URL is
  // used as the {{HERO_IMAGE}} for every page in this batch.
  const handleFeaturedImageUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageUploadError('Please choose an image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setImageUploadError('Image too large — keep it under 8 MB.');
      return;
    }
    setImageUploadError('');
    setImageUploading(true);
    try {
      const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
      const path = `featured/${project.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || 'png'}`;
      const { error: uploadError } = await supabase.storage
        .from('template-assets')
        .upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false });
      if (uploadError) throw uploadError;
      const { data: pub } = supabase.storage.from('template-assets').getPublicUrl(path);
      if (!pub?.publicUrl) throw new Error('Could not read public URL after upload.');
      setFeaturedImageUrl(pub.publicUrl);
      setFeaturedImageCredit(null); // own upload → no attribution
    } catch (err) {
      console.error('Featured image upload failed:', err);
      setImageUploadError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  // Search Unsplash for hero photos. Server-side proxy keeps the API key safe
  // and slims down the payload to just what the grid needs.
  const handleUnsplashSearch = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const q = unsplashQuery.trim();
    if (!q) return;
    setUnsplashError('');
    setUnsplashLoading(true);
    try {
      const res = await apiFetch(`/api/unsplash-search?q=${encodeURIComponent(q)}&per_page=12`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Search failed (${res.status})`);
      setUnsplashResults(data.results || []);
    } catch (err) {
      console.error('Unsplash search failed:', err);
      setUnsplashError(err?.message || 'Search failed. Please try again.');
      setUnsplashResults([]);
    } finally {
      setUnsplashLoading(false);
    }
  };

  // User picked an Unsplash photo. Store the URL + attribution metadata, and
  // (per Unsplash's API guidelines) ping their download_location endpoint —
  // they count "downloads" per pick to power photographer analytics.
  const handlePickUnsplash = async (photo) => {
    setFeaturedImageUrl(photo.url);
    setFeaturedImageCredit({
      photographer: photo.photographer,
      photographer_url: photo.photographer_url,
    });
    setImageUploadError('');
    // Fire-and-forget. If the ping fails, the user still gets their image —
    // we just log so we can monitor for API-guideline compliance issues.
    if (photo.download_location) {
      apiFetch('/api/unsplash-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ downloadLocation: photo.download_location }),
      }).catch((e) => console.warn('Unsplash track ping failed:', e?.message));
    }
  };

  const handlePreview = async (page) => {
    // Optimistic rows added during queue have a tmp- id — not yet in DB
    if (String(page.id).startsWith('tmp-')) {
      setFallbackModal(page);
      return;
    }
    // Open the tab SYNCHRONOUSLY inside the click handler — popup blockers
    // bite anything called after an `await`. We then write HTML into the
    // popup's document directly (avoids blob-URL/sandboxing quirks).
    const win = window.open('', '_blank');
    if (!win) {
      setFallbackModal(page);
      return;
    }
    try {
      win.document.open();
      win.document.write('<!doctype html><meta charset="utf-8"><title>Loading…</title><body style="font:14px system-ui;padding:24px;color:#666">Loading preview…</body>');
      win.document.close();
    } catch { /* ignore */ }

    // Raw PostgREST fetch — supabase.from() can hang on this table.
    const accessToken = session?.access_token;
    if (!accessToken) {
      try { win.close(); } catch {}
      setFallbackModal(page);
      return;
    }
    try {
      const url = `${SUPABASE_URL}/rest/v1/pages?select=html_content&id=eq.${encodeURIComponent(page.id)}`;
      const res = await fetch(url, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows = await res.json();
      const html = Array.isArray(rows) ? rows[0]?.html_content : rows?.html_content;
      if (!html) {
        win.close();
        setFallbackModal(page);
        return;
      }
      win.document.open();
      win.document.write(html);
      win.document.close();
    } catch (err) {
      console.error('[projects] preview failed:', err);
      try { win.close(); } catch { /* ignore */ }
      setFallbackModal(page);
    }
  };

  const handleDeletePage = async (pageId) => {
    const ok = await confirm({
      title: 'Delete this page?',
      message: 'The generated page and its content will be permanently removed.',
      confirmLabel: 'Delete page',
      variant: 'danger',
    });
    if (!ok) return;
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
    try {
      // supabaseFetch handles auth + refresh-on-401 automatically; the cached
      // `session` prop above isn't guaranteed to be fresh.
      const fetchPromise = supabaseFetch(
        `/rest/v1/projects?id=eq.${encodeURIComponent(project.id)}`,
        {
          method: 'DELETE',
          headers: { Prefer: 'return=representation' },
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
        // Dev hint (not shown to users): the projects table likely lacks a DELETE RLS policy.
        console.warn('[projects] delete returned 0 rows — check the DELETE RLS policy on public.projects');
        throw new Error("We couldn't delete this project. Please try again in a moment.");
      }
      // Close modal, drop from local state INSTANTLY, then pop back. Refresh
      // is fire-and-forget — UI doesn't wait for the server round-trip.
      setDeleting(false);
      setDeleteOpen(false);
      onProjectDeleted?.(project.id);
      onBack();
      onRefresh();
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
          {(() => {
            const m = modifierOrDefault(project.data?.settings?.modifier_type);
            return (
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  title={`Every page in this project shares this angle: ${MODIFIERS[m].example}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#075056] dark:text-[#5eead4] bg-[#075056]/10 dark:bg-[#075056]/20 rounded-md border border-[#075056]/25"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01M12 12l-5-5M12 12l5-5M12 12l-5 5M12 12l5 5"/></svg>
                  {MODIFIERS[m].dropdownLabel}
                </span>
                <p className="text-xl text-slate-500 dark:text-[#fbfbfb]">
                  {loadingPages ? 'Loading pages…' : `${pages.length} ${pages.length === 1 ? 'page' : 'pages'} generated`}
                </p>
              </div>
            );
          })()}
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

      {/* Bulk generate wizard — 3 steps: Setup → Content → Generate. */}
      {showBulkPanel && (() => {
        const m = bulkModifierType;
        const meta = MODIFIERS[m];
        const valueCount = locationInput.split('\n').filter(l => l.trim()).length;
        const projectDefaultId = project.data?.settings?.templateId;
        const projectTemplateName = (availableTemplates.find(t => t.id === projectDefaultId)?.name) || 'Default theme';
        const projectDefaultModType = modifierOrDefault(project.data?.settings?.modifier_type);
        const sampleKeyword = (keywordInput || project.data?.settings?.keyword || project.name || 'your keyword').trim();
        const sampleModifier = (locationInput.split('\n').map(l => l.trim()).filter(Boolean)[0] || meta.placeholder.replace(/^e\.g\.,\s*/, '') || 'example');
        const sampleVars = { keyword: sampleKeyword, modifier: sampleModifier, location: sampleModifier, service: project.name };
        const titlePreview = resolveTemplate(titleTemplate, sampleVars, 0);
        const heroPreview = resolveTemplate(heroTemplate, sampleVars, 0);
        const score = variationScore(titleTemplate, heroTemplate);
        const scoreColor = { good: '#10b981', ok: '#3b82f6', warn: '#f59e0b', bad: '#94a3b8' }[score.tone];
        const queueItems = buildQueue();
        const canAdvanceFromStep1 = queueItems.length > 0;
        const canAdvanceFromStep2 = !!titleTemplate.trim();
        const modType = bulkModifierType;
        const modMeta = MODIFIERS[modType];
        const valueLabel = modMeta.valueLabel || 'Modifier';
        const hasAnyTemplate = !!(titleTemplate || heroTemplate || featuredImageUrl);

        const steps = [
          { n: 1, label: 'Setup',    desc: 'Theme and data',     title: 'Page setup',            blurb: 'Choose the page type and add your data sources for this batch.' },
          { n: 2, label: 'Content',  desc: 'Per-page copy',      title: 'Page content',          blurb: 'Define the title, hero copy, and featured image used on every page.' },
          { n: 3, label: 'Generate', desc: 'Review and publish', title: 'Review and generate',   blurb: 'Review the list of pages, then generate them in one batch.' },
        ];
        const currentStep = steps[bulkStep - 1];

        return (
        <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333333] rounded-2xl p-5 mb-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Generate Pages</h2>
            <button onClick={() => setShowBulkPanel(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* 2-col layout: vertical step sidebar + single form card */}
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
            {/* Vertical stepper sidebar */}
            <aside className="space-y-1">
              {steps.map((s) => {
                const isActive = bulkStep === s.n;
                const isDone = bulkStep > s.n;
                const clickable = s.n < bulkStep || (s.n === 2 && canAdvanceFromStep1) || (s.n === 3 && canAdvanceFromStep1 && canAdvanceFromStep2);
                return (
                  <button
                    key={s.n}
                    type="button"
                    disabled={!clickable && !isActive}
                    onClick={() => clickable && setBulkStep(s.n)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                      isActive ? 'bg-slate-100 dark:bg-[#262626]' :
                      clickable ? 'hover:bg-slate-50 dark:hover:bg-[#1f1f1f]' :
                      'opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                      isDone ? 'bg-emerald-500 text-white' :
                      isActive ? 'bg-[#075056] text-white' :
                      'bg-slate-200 dark:bg-[#333333] text-slate-500 dark:text-[#888888]'
                    }`}>
                      {isDone ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : s.n}
                    </span>
                    <span className={`text-[13.5px] font-semibold leading-none ${isActive ? 'text-slate-900 dark:text-white' : isDone ? 'text-slate-700 dark:text-[#cccccc]' : 'text-slate-400 dark:text-[#666666]'}`}>
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </aside>

            {/* Form card — gray bg, contains current step's title, fields, and actions */}
            <section className="rounded-xl bg-slate-50 dark:bg-[#262626] border border-slate-200 dark:border-[#333333] p-6">
              <div className="mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{currentStep.title}</h3>
                <p className="text-[13.5px] text-slate-500 dark:text-[#888888] mt-1">{currentStep.blurb}</p>
              </div>

          {/* ── Step 1: Setup (page type + data) ── */}
          {bulkStep === 1 && (
            <div className="space-y-5">
              {/* Read-only theme line — locked to the project's default. */}
              <div className="flex items-center gap-3 p-3 rounded-md bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333333]">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-slate-100 dark:bg-[#262626] border border-slate-200 dark:border-[#333333]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 dark:text-[#888888]"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-[#888888] uppercase tracking-wider">Theme</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{projectTemplateName}</p>
                </div>
                <button
                  type="button"
                  onClick={handlePreviewTheme}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-semibold text-slate-600 dark:text-[#cccccc] bg-white dark:bg-[#262626] border border-slate-200 dark:border-[#404040] rounded-md hover:border-[#075056] hover:text-[#075056] dark:hover:border-[#5eead4]/40 dark:hover:text-[#5eead4] transition-colors"
                  title={pages.length > 0 ? 'Open the first generated page' : 'Open the theme with sample data'}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  Preview
                </button>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-[#666666]">Project default</span>
              </div>

              {/* Page type (left) + Page count card (right) — 2-col grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-[#888888] uppercase tracking-wider mb-2">
                    Page type
                    <HelpIcon align="left">
                      <p className="font-semibold mb-1">{meta.dropdownLabel}</p>
                      <p className="opacity-80">Example: &ldquo;{meta.example}&rdquo;.</p>
                      {meta.hint && <p className="opacity-80 mt-1">{meta.hint}</p>}
                      <p className="opacity-60 mt-2 text-[10.5px]">Defaults to your project&rsquo;s choice. Changing it here only affects this batch.</p>
                    </HelpIcon>
                  </label>
                  <select
                    value={bulkModifierType}
                    onChange={(e) => setBulkModifierType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1f1f1f] border-[1.5px] border-slate-300 dark:border-[#404040] rounded-md focus:outline-none focus:border-[#075056] text-[15px] transition-colors"
                  >
                    {Object.entries(MODIFIERS).map(([key, mInfo]) => (
                      <option key={key} value={key}>
                        {mInfo.dropdownLabel}{key === projectDefaultModType ? '  (project default)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-[#888888] uppercase tracking-wider mb-2">This batch will generate</label>
                  <div className={`flex items-center px-3.5 py-2.5 rounded-md border-[1.5px] ${queueItems.length > 0 ? 'border-[#075056]/30 bg-[#075056]/5 dark:border-[#5eead4]/25 dark:bg-[#5eead4]/5' : 'border-slate-300 dark:border-[#404040] bg-white dark:bg-[#1f1f1f]'}`}>
                    <span className="text-xl font-black text-slate-900 dark:text-white">{queueItems.length}</span>
                    <span className="text-sm text-slate-500 dark:text-[#888888] ml-2">page{queueItems.length !== 1 ? 's' : ''}</span>
                    {queueItems.length === 0 && (
                      <span className="ml-auto text-[10.5px] text-amber-700 dark:text-amber-400 font-semibold">Add rows below</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Fill Fields / Fill Data toggle — iOS segmented control */}
              <div className="flex items-center gap-2">
                <div className="inline-flex p-1 rounded-md bg-slate-100 dark:bg-[#1a1a1a]">
                  <button
                    onClick={() => setBulkMode('locations')}
                    className={`px-5 py-1.5 rounded text-[14px] font-semibold transition-all ${bulkMode === 'locations' ? 'bg-white dark:bg-[#2a2a2a] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-[#888888] hover:text-slate-700 dark:hover:text-[#dddddd]'}`}
                  >
                    Fill Fields
                  </button>
                  <button
                    onClick={() => setBulkMode('custom')}
                    className={`px-5 py-1.5 rounded text-[14px] font-semibold transition-all ${bulkMode === 'custom' ? 'bg-white dark:bg-[#2a2a2a] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-[#888888] hover:text-slate-700 dark:hover:text-[#dddddd]'}`}
                  >
                    Fill Data
                  </button>
                </div>
                <HelpIcon align="left">
                  <p className="font-semibold mb-1">Fill Fields</p>
                  <p className="opacity-80 mb-2">One keyword (e.g. plumbing) applied to many {meta.countNoun}s. Each {meta.countNoun} = one page.</p>
                  <p className="font-semibold mb-1">Fill Data</p>
                  <p className="opacity-80">Each line is its own keyword + {meta.countNoun} pair — different keywords allowed.</p>
                </HelpIcon>
              </div>

              {bulkMode === 'locations' ? (
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-[#888888] uppercase tracking-wider mb-2">
                      Keyword / Service
                      <HelpIcon align="left">
                        <p>The one keyword (or service) that every page in this batch covers. Combined with each {meta.countNoun} below to form phrases like &ldquo;{meta.example}&rdquo;.</p>
                      </HelpIcon>
                    </label>
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={e => setKeywordInput(e.target.value)}
                      placeholder={meta.keywordPlaceholder}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1f1f1f] border-[1.5px] border-slate-300 dark:border-[#404040] rounded-md focus:outline-none focus:border-[#075056] text-[15px] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-[#888888] uppercase tracking-wider mb-2">
                      {meta.valueLabelPlural || 'Values'}
                      <span className="normal-case font-normal text-[10px] text-slate-400 dark:text-[#666666]">(one per line)</span>
                      <HelpIcon align="left">
                        <p>One {meta.countNoun} per line. Each line becomes its own page, sharing the keyword above.</p>
                      </HelpIcon>
                    </label>
                    <textarea
                      value={locationInput}
                      onChange={e => setLocationInput(e.target.value)}
                      placeholder={meta.bulkPlaceholder}
                      rows={8}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1f1f1f] border-[1.5px] border-slate-300 dark:border-[#404040] rounded-md focus:outline-none focus:border-[#075056] text-[14.5px] font-mono transition-colors resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-[#888888] uppercase tracking-wider mb-2">
                    {meta.pairsLabel || 'Keyword, Value pairs'}
                    <span className="normal-case font-normal text-[10px] text-slate-400 dark:text-[#666666]">(one per line)</span>
                    <HelpIcon align="left">
                      <p>Each line is one keyword + one {meta.countNoun}, separated by a comma. Different keywords are allowed across lines.</p>
                      <p className="opacity-70 mt-1 font-mono text-[10.5px]">{meta.pairsPlaceholder.split('\n')[0]}</p>
                    </HelpIcon>
                  </label>
                  <textarea
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    placeholder={meta.pairsPlaceholder}
                    rows={10}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1f1f1f] border-[1.5px] border-slate-300 dark:border-[#404040] rounded-md focus:outline-none focus:border-[#075056] text-[14.5px] font-mono transition-colors resize-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Content (two-column: score card + fields) ── */}
          {bulkStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Score card — left column */}
              <div className="lg:col-span-4">
                <div className="rounded-2xl border-[1.5px] border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] p-6 text-center sticky top-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-[#888888] mb-4">Dynamic Content Score</p>
                  <div className="relative inline-block">
                    <svg viewBox="0 0 120 70" className="w-40 h-24">
                      <path d="M 12 60 A 48 48 0 0 1 108 60" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" className="dark:stroke-[#333333]" />
                      <path d="M 12 60 A 48 48 0 0 1 108 60" fill="none" stroke={scoreColor} strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={`${(score.percent / 100) * 151} 151`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                      <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{Math.round(score.percent)}<span className="text-base">%</span></p>
                    </div>
                  </div>
                  <p className="text-sm font-bold mt-2" style={{ color: scoreColor }}>{score.label}</p>
                  <p className="text-[11px] text-slate-500 dark:text-[#888888] mt-4 leading-relaxed">
                    Higher variation = more lexical diversity across your pages, which Google&rsquo;s quality algorithms reward.
                  </p>
                </div>
              </div>

              {/* Fields — right column */}
              <div className="lg:col-span-8">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Page content</h3>
                  <p className="text-[12.5px] text-slate-500 dark:text-[#888888] mt-1">Title is required. Click the chips below each text field to insert variables and variation groups.</p>
                </div>
                <div className="space-y-5">
                  <TemplateField
                    label="Title"
                    sublabel={<span className="text-rose-600 dark:text-rose-400">* required</span>}
                    value={titleTemplate}
                    onChange={setTitleTemplate}
                    placeholder={`e.g., [Best | Top-Rated | Trusted] {{keyword}} in {{modifier}} | 24/7 Service`}
                    preview={titlePreview}
                  />

                  {/* Featured image — two sources: direct upload (own image)
                      or Unsplash search (free stock photos with attribution).
                      One image applies to every page in the batch. */}
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-[#888888] uppercase tracking-wider">
                        Featured image
                        <span className="font-normal normal-case text-[10px] text-slate-400 dark:text-[#666666] ml-1">(one image, every page in this batch)</span>
                      </label>
                    </div>

                    {featuredImageUrl ? (
                      <div className="flex items-center gap-3 p-3 rounded-md border-[1.5px] border-slate-300 dark:border-[#404040] bg-white dark:bg-[#1f1f1f]">
                        <div className="w-16 h-16 rounded overflow-hidden bg-slate-100 dark:bg-[#262626] shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={featuredImageUrl} alt="Featured" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-slate-700 dark:text-[#dddddd] truncate">
                            {featuredImageCredit ? `Photo by ${featuredImageCredit.photographer}` : 'Uploaded ✓'}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-[#666666] truncate">
                            {featuredImageCredit ? 'via Unsplash · attribution shown on every page' : featuredImageUrl}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setFeaturedImageUrl(''); setFeaturedImageCredit(null); setImageUploadError(''); }}
                          className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 dark:text-[#888888] dark:hover:text-rose-400 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Source tabs — Upload vs. Unsplash */}
                        <div className="inline-flex p-1 rounded-md bg-slate-100 dark:bg-[#1a1a1a] mb-3">
                          <button
                            type="button"
                            onClick={() => setImageTab('upload')}
                            className={`px-4 py-1.5 rounded text-[13.5px] font-semibold transition-all ${imageTab === 'upload' ? 'bg-white dark:bg-[#2a2a2a] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-[#888888] hover:text-slate-700 dark:hover:text-[#dddddd]'}`}
                          >
                            Upload
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageTab('unsplash')}
                            className={`px-4 py-1.5 rounded text-[13.5px] font-semibold transition-all ${imageTab === 'unsplash' ? 'bg-white dark:bg-[#2a2a2a] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-[#888888] hover:text-slate-700 dark:hover:text-[#dddddd]'}`}
                          >
                            Unsplash
                          </button>
                        </div>

                        {imageTab === 'upload' ? (
                          <label className="block">
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              disabled={imageUploading}
                              onChange={(e) => handleFeaturedImageUpload(e.target.files?.[0])}
                            />
                            <div className={`flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-md border-[1.5px] border-dashed cursor-pointer transition-colors ${imageUploading ? 'border-[#075056] bg-[#075056]/5' : 'border-slate-300 dark:border-[#404040] hover:border-[#075056] dark:hover:border-[#5eead4]/40 bg-white dark:bg-[#1f1f1f]'}`}>
                              {imageUploading ? (
                                <>
                                  <div className="w-6 h-6 border-2 border-[#075056]/30 border-t-[#075056] rounded-full animate-spin" />
                                  <p className="text-[12px] font-semibold text-[#075056] dark:text-[#5eead4]">Uploading…</p>
                                </>
                              ) : (
                                <>
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-[#666666]"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                  <p className="text-[13px] font-semibold text-slate-700 dark:text-[#dddddd]">Click to upload an image</p>
                                  <p className="text-[11px] text-slate-400 dark:text-[#666666]">PNG, JPG, WebP up to 8 MB</p>
                                </>
                              )}
                            </div>
                          </label>
                        ) : (
                          <div>
                            <form onSubmit={handleUnsplashSearch} className="flex gap-2 mb-3">
                              <input
                                type="text"
                                value={unsplashQuery}
                                onChange={(e) => setUnsplashQuery(e.target.value)}
                                placeholder="Search Unsplash — e.g. 'plumber working', 'modern office'"
                                className="flex-1 px-3.5 py-2.5 bg-white dark:bg-[#1f1f1f] border-[1.5px] border-slate-300 dark:border-[#404040] rounded-md focus:outline-none focus:border-[#075056] text-[14px] transition-colors"
                              />
                              <button
                                type="submit"
                                disabled={unsplashLoading || !unsplashQuery.trim()}
                                className="px-5 py-2.5 bg-[#075056] text-white text-[13.5px] font-semibold rounded-md hover:bg-[#064548] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                {unsplashLoading ? 'Searching…' : 'Search'}
                              </button>
                            </form>
                            {unsplashError && (
                              <p className="text-[11.5px] text-rose-600 dark:text-rose-400 mb-2">{unsplashError}</p>
                            )}
                            {unsplashResults.length > 0 ? (
                              <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto p-1 rounded-md border border-slate-200 dark:border-[#333333]">
                                {unsplashResults.map((photo) => (
                                  <button
                                    key={photo.id}
                                    type="button"
                                    onClick={() => handlePickUnsplash(photo)}
                                    className="group relative aspect-[4/3] rounded overflow-hidden bg-slate-100 dark:bg-[#1a1a1a] hover:ring-2 hover:ring-[#075056] dark:hover:ring-[#5eead4] transition-all"
                                    title={`${photo.alt} — by ${photo.photographer}`}
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={photo.thumb} alt={photo.alt} className="w-full h-full object-cover" />
                                    <div className="absolute inset-x-0 bottom-0 px-2 py-1 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                      <p className="text-[10px] text-white truncate">{photo.photographer}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              !unsplashLoading && (
                                <div className="px-4 py-8 rounded-md border-[1.5px] border-dashed border-slate-300 dark:border-[#404040] bg-white dark:bg-[#1f1f1f] text-center">
                                  <p className="text-[12.5px] text-slate-500 dark:text-[#888888]">Free hero photos from Unsplash, no account needed.</p>
                                  <p className="text-[11px] text-slate-400 dark:text-[#666666] mt-1">Search above and click a thumbnail to pick.</p>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {imageUploadError && (
                      <p className="text-[11.5px] text-rose-600 dark:text-rose-400 mt-1.5">{imageUploadError}</p>
                    )}
                    <p className="text-[10.5px] text-slate-400 dark:text-[#666666] mt-2">
                      All templates have a hero image slot. Leave empty to skip the image entirely.
                    </p>
                  </div>

                  <TemplateField
                    label="Hero copy"
                    sublabel="(sub-headline shown beneath the title)"
                    value={heroTemplate}
                    onChange={setHeroTemplate}
                    placeholder={`e.g., [Licensed | Certified] and trusted by {{modifier}} homeowners for over [10 | 15 | 20]+ years.`}
                    preview={heroPreview}
                    multiline
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Generate (live status table) ── */}
          {bulkStep === 3 && (() => {
            // Match a queue row to its corresponding saved page (if any).
            // The page row is created during generation with `location` matching
            // the queue item's location, so we look up by that.
            const pageForRow = (item) => pages.find(p => p.location === item.location && p.keyword?.includes(item.keyword));
            // Derive a per-row status from queue state + saved pages.
            const rowStatus = (i, item) => {
              const p = pageForRow(item);
              if (p?.status === 'failed') return { kind: 'failed', page: p };
              if (p?.status === 'completed') return { kind: 'completed', page: p };
              if (queueRunning && currentItem && currentItem.keyword === item.keyword && currentItem.location === item.location) {
                return { kind: 'generating', page: null };
              }
              if (queueRunning || queueDone > 0) return { kind: 'queued', page: null };
              return { kind: 'ready', page: null };
            };
            const completedCount = queueItems.reduce((acc, item) => acc + (rowStatus(0, item).kind === 'completed' ? 1 : 0), 0);
            const anyCompleted = queueItems.some(item => rowStatus(0, item).kind === 'completed');
            const allDone = queueDone > 0 && !queueRunning;

            return (
            <div className="space-y-4">
              {/* Summary callout */}
              <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-[#075056]/5 dark:bg-[#5eead4]/5 border border-[#075056]/15 dark:border-[#5eead4]/20">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-2xl font-black text-[#075056] dark:text-[#5eead4]">{queueItems.length}</span>
                  <span className="text-slate-700 dark:text-[#dddddd]">page{queueItems.length !== 1 ? 's' : ''} {queueRunning ? 'generating…' : allDone ? 'complete' : 'ready to generate'}</span>
                </div>
                <div className="ml-auto flex flex-wrap items-center gap-2 text-[11.5px]">
                  {featuredImageUrl && <span className="px-2 py-1 rounded-md bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 font-semibold">Featured image attached</span>}
                  {hasAnyTemplate && <span className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-semibold">Templates active</span>}
                  {anyCompleted && (
                    <button
                      type="button"
                      onClick={() => alert('Connect a CMS first — the publish flow ships in the next step.')}
                      className="px-3 py-1 rounded-md bg-[#075056] text-white font-semibold hover:bg-[#064548] transition-colors flex items-center gap-1.5"
                      title="CMS connection required"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4Z"/></svg>
                      Publish all
                    </button>
                  )}
                </div>
              </div>

              {queueItems.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-400 dark:text-[#666666]">
                  No pages to generate yet. Go back to Setup and add some {modMeta.countNoun}s.
                </div>
              ) : (
                <div className="rounded-xl border-[1.5px] border-slate-200 dark:border-[#333333] overflow-hidden">
                  <div className="max-h-[28rem] overflow-y-auto">
                    <table className="w-full text-[12px]">
                      <thead className="sticky top-0 bg-slate-50 dark:bg-[#1a1a1a] border-b border-slate-200 dark:border-[#333333]">
                        <tr className="text-left text-[10px] font-bold text-slate-500 dark:text-[#888888] uppercase tracking-wider">
                          <th className="px-3 py-2.5 w-10">#</th>
                          <th className="px-3 py-2.5">Keyword</th>
                          {modType !== 'none' && <th className="px-3 py-2.5">{valueLabel}</th>}
                          <th className="px-3 py-2.5">Title</th>
                          <th className="px-3 py-2.5 w-32">Status</th>
                          <th className="px-3 py-2.5 w-44 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {queueItems.map((item, i) => {
                          const rowVars = { keyword: item.keyword, modifier: item.location, location: item.location, service: project.name };
                          const titleR = titleTemplate ? resolveTemplate(titleTemplate, rowVars, i) : '';
                          const heroR = heroTemplate ? resolveTemplate(heroTemplate, rowVars, i) : '';
                          const status = rowStatus(i, item);
                          const statusPill = {
                            ready:      { text: 'Ready',      cls: 'bg-slate-100 dark:bg-[#262626] text-slate-600 dark:text-[#aaaaaa]' },
                            queued:     { text: 'Queued',     cls: 'bg-slate-100 dark:bg-[#262626] text-slate-600 dark:text-[#aaaaaa]' },
                            generating: { text: 'Generating', cls: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
                            completed:  { text: 'Completed',  cls: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' },
                            failed:     { text: 'Failed',     cls: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400' },
                          }[status.kind];
                          return (
                            <tr key={i} className={`border-b border-slate-100 dark:border-[#262626] last:border-b-0 ${i % 2 === 1 ? 'bg-slate-50/40 dark:bg-[#161616]' : ''}`}>
                              <td className="px-3 py-2.5 text-slate-400 dark:text-[#666666] font-mono text-[11px]">{String(i + 1).padStart(2, '0')}</td>
                              <td className="px-3 py-2.5 text-slate-700 dark:text-[#dddddd]">{item.keyword}</td>
                              {modType !== 'none' && <td className="px-3 py-2.5 text-slate-700 dark:text-[#dddddd]">{item.location}</td>}
                              <td className="px-3 py-2.5 text-slate-700 dark:text-[#dddddd] max-w-[300px]" title={titleR || heroR}>
                                <div className="truncate">{titleR || <span className="italic text-slate-400 dark:text-[#666666]">AI-written</span>}</div>
                                {heroR && <div className="truncate text-[11px] text-slate-500 dark:text-[#888888] mt-0.5" title={heroR}>{heroR}</div>}
                              </td>
                              <td className="px-3 py-2.5">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${statusPill.cls}`}>
                                  {status.kind === 'generating' && (
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                  )}
                                  {statusPill.text}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={status.kind !== 'completed'}
                                    onClick={() => status.page && handlePreview(status.page)}
                                    title="Preview"
                                    className="p-1.5 rounded-md text-slate-500 dark:text-[#888888] hover:bg-slate-100 dark:hover:bg-[#262626] hover:text-slate-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={status.kind !== 'completed'}
                                    onClick={() => alert('Connect a CMS first — the publish flow ships in the next step.')}
                                    title="Publish (connect a CMS first)"
                                    className="p-1.5 rounded-md text-slate-500 dark:text-[#888888] hover:bg-slate-100 dark:hover:bg-[#262626] hover:text-[#075056] dark:hover:text-[#5eead4] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4Z"/></svg>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={!status.page}
                                    onClick={() => status.page && handleDeletePage(status.page.id)}
                                    title="Delete"
                                    className="p-1.5 rounded-md text-slate-500 dark:text-[#888888] hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            );
          })()}

              {/* ── Action row inside the form card ── */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-[#333333]">
                {/* Back / Cancel / Stop button */}
                {bulkStep === 1 ? (
                  <button
                    onClick={() => setShowBulkPanel(false)}
                    className="px-4 py-2 text-slate-500 dark:text-[#888888] text-sm font-semibold rounded-md hover:bg-slate-100 dark:hover:bg-[#1f1f1f] transition-colors"
                  >
                    Cancel
                  </button>
                ) : queueRunning ? (
                  <button
                    onClick={handleStopQueue}
                    className="flex items-center gap-1.5 px-4 py-2 text-rose-600 dark:text-rose-400 text-sm font-semibold rounded-md border border-rose-200 dark:border-rose-800/40 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={() => setBulkStep(bulkStep - 1)}
                    aria-label="Back"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-300 dark:border-[#404040] text-slate-600 dark:text-[#aaaaaa] hover:bg-slate-100 dark:hover:bg-[#1f1f1f] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                )}

                {/* Forward action — Save and continue / Generate / Done */}
                {bulkStep < 3 ? (
                  <div className="flex items-center gap-3">
                    {bulkStep === 2 && !canAdvanceFromStep2 && (
                      <span className="text-[11.5px] text-rose-600 dark:text-rose-400 font-semibold">Title is required</span>
                    )}
                    <button
                      onClick={() => setBulkStep(bulkStep + 1)}
                      disabled={(bulkStep === 1 && !canAdvanceFromStep1) || (bulkStep === 2 && !canAdvanceFromStep2)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#075056] text-white text-sm font-bold rounded-full hover:bg-[#064548] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Save and continue
                    </button>
                  </div>
                ) : queueRunning ? (
                  <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-200 dark:bg-[#262626] text-slate-500 dark:text-[#888888] text-sm font-bold rounded-full">
                    <div className="w-4 h-4 border-2 border-slate-400/40 border-t-slate-600 dark:border-t-slate-300 rounded-full animate-spin" />
                    Generating {queueDone + 1}/{queue.length}
                  </div>
                ) : queueDone > 0 ? (
                  <button
                    onClick={() => setShowBulkPanel(false)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#075056] text-white text-sm font-bold rounded-full hover:bg-[#064548] transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Done
                  </button>
                ) : (
                  <button
                    onClick={handleStartQueue}
                    disabled={queueItems.length === 0}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#075056] text-white text-sm font-bold rounded-full hover:bg-[#064548] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Generate {queueItems.length} page{queueItems.length !== 1 ? 's' : ''}
                  </button>
                )}
              </div>
            </section>
          </div>
        </div>
        );
      })()}

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
              onClick={() => { setBulkStep(1); setBulkModifierType(modifierOrDefault(project.data?.settings?.modifier_type)); setImageUploadError(''); setShowBulkPanel(true); }}
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
            modifierType={modifierOrDefault(project.data?.settings?.modifier_type)}
            onPreview={handlePreview}
            onDelete={handleDeletePage}
            onGenerateMore={() => { setBulkStep(1); setBulkModifierType(modifierOrDefault(project.data?.settings?.modifier_type)); setImageUploadError(''); setShowBulkPanel(true); }}
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

// Modifier-aware icon — pin for location, link for integration, etc.
function ModifierIcon({ type = 'location', size = 11, className = '' }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className };
  switch (type) {
    case 'comparison':
      // git-compare style
      return (<svg {...p}><circle cx="6" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/></svg>);
    case 'integration':
      // link/chain
      return (<svg {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>);
    case 'audience':
      // users
      return (<svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
    case 'usecase':
      // lightbulb
      return (<svg {...p}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15 14c.18-.7.5-1.2 1-1.66.8-.76 1.5-1.46 1.5-2.84a5 5 0 0 0-10 0c0 1.38.7 2.08 1.5 2.84.5.46.82.96 1 1.66"/></svg>);
    case 'none':
      // tag
      return (<svg {...p}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>);
    case 'location':
    default:
      return (<svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
  }
}

function PagesGrid({ pages, queueRunning, currentItem, accessToken, modifierType, onPreview, onDelete, onGenerateMore }) {
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
            modifierType={modifierType}
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

function PageThumbCard({ page, accessToken, modifierType, onPreview, onDelete }) {
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
          <ModifierIcon type={modifierType} size={11} />
          <span className="truncate">{page.location}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-[#f0f0f0] dark:border-[#2a2a2a] flex items-center justify-between gap-2">
          <span className="text-[13px] font-semibold text-[#777777] dark:text-[#888888]">
            {new Date(page.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <button
            onClick={() => onDelete(page.id)}
            className="gg-del-btn"
            title="Delete page"
            aria-label="Delete page"
          >
            <span className="gg-del-text">Delete</span>
            <span className="gg-del-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/></svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
