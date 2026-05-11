'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { fetchBrandKits } from '../../lib/brandKits';
import { apiFetch } from '../../lib/apiFetch';

const DRAFT_STORAGE_KEY = 'gg-template-builder-draft';

// Renders the JSON-stored Table data as inline HTML <table> for both preview & save
const escapeHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function renderTableHtml(data) {
  if (!data || !Array.isArray(data.rows) || data.rows.length === 0) return '';
  const { rows, hasHeader } = data;
  const thStyle = 'padding:12px 16px;border:1px solid #e5e7eb;color:#111;font-weight:600;background:#f9fafb;font-size:.875rem;text-align:left;';
  const tdStyle = 'padding:12px 16px;border:1px solid #e5e7eb;color:#374151;font-size:.875rem;';
  const head = hasHeader && rows[0]
    ? `<thead><tr>${rows[0].map(c => `<th style="${thStyle}">${escapeHtml(c)}</th>`).join('')}</tr></thead>`
    : '';
  const bodyRows = hasHeader ? rows.slice(1) : rows;
  const body = `<tbody>${bodyRows.map(r => `<tr>${r.map(c => `<td style="${tdStyle}">${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return `<table style="width:100%;border-collapse:collapse;">${head}${body}</table>`;
}

// URL input that doubles as an AI image-generation trigger
function ImageUrlField({ value, onChange }) {
  const [genPrompt, setGenPrompt] = useState('');
  const [genOpen, setGenOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [tempWarning, setTempWarning] = useState(false);

  const generate = async () => {
    if (!genPrompt.trim() || busy) return;
    setBusy(true);
    setError(null);
    setTempWarning(false);
    try {
      const res = await apiFetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: genPrompt.trim(), size: '1024x1024' })
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || 'Generation failed');
      onChange(json.url);
      if (json.temporary) setTempWarning(true);
      setGenOpen(false);
      setGenPrompt('');
    } catch (e) {
      setError(e.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="flex-1 px-3.5 py-2.5 bg-[#fafafa] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-xl text-[#262626] dark:text-white text-sm focus:outline-none focus:border-[#075056] dark:focus:border-[#075056] focus:ring-2 focus:ring-[#075056]/20 transition-all"
        />
        <button
          type="button"
          onClick={() => { setGenOpen(o => !o); setError(null); }}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${genOpen ? 'bg-[#075056] text-white border-[#075056]' : 'bg-white dark:bg-[#262626] text-[#075056] dark:text-[#5eead4] border-[#e5e5e5] dark:border-[#333333] hover:border-[#075056]'}`}
          title="Generate with AI"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 3v4M19 17v4M3 5h4M17 19h4M9 14l-3 3m0-3l3 3m9-9l-3 3m3-3l-3-3"/>
          </svg>
          AI
        </button>
      </div>
      {value && /^https?:\/\//.test(value) && (
        <div className="rounded-lg overflow-hidden border border-[#e5e5e5] dark:border-[#333333] bg-[#fafafa] dark:bg-[#262626]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" className="w-full max-h-40 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>
      )}
      {tempWarning && (
        <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0">
            <path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="10"/>
          </svg>
          <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-snug">
            <strong>Temporary URL.</strong> This image link expires in about an hour. Save it (right-click → Save) and re-upload, or contact admin to set up the <code className="font-mono text-[10px] bg-amber-100 dark:bg-amber-500/20 px-1 rounded">template-assets</code> Supabase bucket for permanent storage.
          </p>
        </div>
      )}
      {genOpen && (
        <div className="p-3 bg-gradient-to-br from-[#075056]/10 to-transparent border border-[#075056]/30 rounded-xl space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#075056] dark:text-[#5eead4]">Describe the image</p>
          <textarea
            value={genPrompt}
            onChange={(e) => setGenPrompt(e.target.value)}
            placeholder="e.g. minimalist desk setup with a green plant, soft natural light, top-down view"
            rows={2}
            disabled={busy}
            className="w-full px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#333333] rounded-lg text-[#262626] dark:text-white text-sm resize-none focus:outline-none focus:border-[#075056] dark:focus:border-[#075056] focus:ring-2 focus:ring-[#075056]/20 transition-all disabled:opacity-50"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={generate}
              disabled={!genPrompt.trim() || busy}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#075056] text-white text-xs font-bold rounded-lg hover:bg-[#064548] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {busy ? (
                <>
                  <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  Generating...
                </>
              ) : 'Generate'}
            </button>
            <span className="text-[11px] text-[#777777] dark:text-[#888888]">DALL·E 3 · ~10s</span>
          </div>
          {error && <p className="text-[11px] text-red-500 dark:text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}

// Convert a YouTube/Vimeo/MP4 URL to an embeddable iframe/video tag at render time
function videoEmbed(url) {
  const u = (url || '').trim();
  if (!u) return '';
  const wrap = (inner) => `<div style="position:relative;padding-bottom:56.25%;height:0;border-radius:12px;overflow:hidden;background:#000;">${inner}</div>`;
  const iframe = (src) => `<iframe src="${src}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;
  // YouTube
  let m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/i);
  if (m) return wrap(iframe(`https://www.youtube.com/embed/${m[1]}`));
  // Vimeo
  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (m) return wrap(iframe(`https://player.vimeo.com/video/${m[1]}`));
  // Loom
  m = u.match(/loom\.com\/share\/([\w-]+)/i);
  if (m) return wrap(iframe(`https://www.loom.com/embed/${m[1]}`));
  // Direct video file
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(u)) {
    return `<video src="${u}" controls style="width:100%;border-radius:12px;display:block;"></video>`;
  }
  // Fallback: trust it as an embed URL
  return wrap(iframe(u));
}

// Inline mini spreadsheet editor for the 'table' field type
function TableEditor({ value, onChange }) {
  const data = (() => {
    try {
      const obj = JSON.parse(value || '{}');
      if (Array.isArray(obj.rows) && obj.rows.length > 0) return obj;
    } catch { /* fall through */ }
    return { rows: [['Column 1', 'Column 2', 'Column 3'], ['', '', '']], hasHeader: true };
  })();
  const update = (next) => onChange(JSON.stringify({ ...data, ...next }));
  const setCell = (i, j, val) => update({ rows: data.rows.map((r, ri) => ri === i ? r.map((c, ci) => ci === j ? val : c) : r) });
  const addRow = () => update({ rows: [...data.rows, new Array(data.rows[0]?.length || 1).fill('')] });
  const removeRow = (i) => update({ rows: data.rows.length > 1 ? data.rows.filter((_, idx) => idx !== i) : data.rows });
  const addCol = () => update({ rows: data.rows.map(r => [...r, '']) });
  const removeCol = (j) => update({ rows: (data.rows[0]?.length || 0) > 1 ? data.rows.map(r => r.filter((_, idx) => idx !== j)) : data.rows });
  const cols = data.rows[0]?.length || 0;

  const btn = 'inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[#fafafa] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] text-[#262626] dark:text-white hover:border-[#075056] hover:text-[#075056] dark:hover:text-[#5eead4] transition-colors';

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 flex-wrap">
        <label className="inline-flex items-center gap-1.5 text-xs text-[#555555] dark:text-[#aaaaaa] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!data.hasHeader}
            onChange={(e) => update({ hasHeader: e.target.checked })}
            className="w-3.5 h-3.5 accent-[#075056] cursor-pointer"
          />
          Header row
        </label>
        <button type="button" onClick={addRow} className={btn}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Row
        </button>
        <button type="button" onClick={addCol} className={btn}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Column
        </button>
      </div>
      <div className="overflow-x-auto border border-[#e5e5e5] dark:border-[#333333] rounded-xl bg-white dark:bg-[#1a1a1a]">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <tbody>
            {cols > 1 && (
              <tr>
                <td className="w-7"></td>
                {data.rows[0].map((_, j) => (
                  <td key={j} className="px-1 py-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeCol(j)}
                      className="w-5 h-5 rounded-md text-[#999999] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-xs"
                      title="Remove column"
                    >
                      ×
                    </button>
                  </td>
                ))}
                <td className="w-7"></td>
              </tr>
            )}
            {data.rows.map((row, i) => (
              <tr key={i}>
                <td className="w-7 text-center text-[10px] font-bold text-[#999999] dark:text-[#5a5a5a]">
                  {i === 0 && data.hasHeader ? 'H' : (data.hasHeader ? i : i + 1)}
                </td>
                {row.map((cell, j) => (
                  <td key={j} className={`p-0 border-l border-t border-[#f0f0f0] dark:border-[#222] ${i === 0 && data.hasHeader ? 'bg-[#fafafa] dark:bg-[#262626]' : ''}`}>
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => setCell(i, j, e.target.value)}
                      className={`w-full px-2.5 py-2 bg-transparent text-sm border-0 focus:outline-none focus:bg-[#075056]/5 dark:focus:bg-[#075056]/15 ${i === 0 && data.hasHeader ? 'font-semibold text-[#111] dark:text-white' : 'text-[#374151] dark:text-[#dddddd]'}`}
                      placeholder={i === 0 && data.hasHeader ? `Header ${j + 1}` : ''}
                    />
                  </td>
                ))}
                <td className="w-7 text-center border-l border-t border-[#f0f0f0] dark:border-[#222]">
                  {data.rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="w-5 h-5 rounded-md text-[#999999] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-xs"
                      title="Remove row"
                    >
                      ×
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Per-category SVG icon used in the element library
const CATEGORY_ICONS = {
  'Navigation': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="13" y2="18"/>
    </svg>
  ),
  'Hero': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><circle cx="8" cy="14" r="1.5"/>
    </svg>
  ),
  'Trust': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  'Services': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  'Process': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><path d="M7 12h3M14 12h3"/>
    </svg>
  ),
  'Social Proof': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="m8 10 1.5 2L13 8"/>
    </svg>
  ),
  'CTAs': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
  ),
  'Footer': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 17h18"/><circle cx="7" cy="20" r="0.5" fill="currentColor"/><circle cx="11" cy="20" r="0.5" fill="currentColor"/>
    </svg>
  ),
  'Content': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 12h10M4 18h16"/>
    </svg>
  ),
  'Media': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <path d="m21 15-5-5L5 21"/>
    </svg>
  ),
};

// Per-element icons — overrides the category icon for distinctness
const SECTION_ICONS = {
  // Navigation
  'nav-simple': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="3" rx="1"/>
    </svg>
  ),
  'nav-links': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="3" rx="1"/>
      <circle cx="7" cy="7.5" r="0.6" fill="currentColor"/>
      <circle cx="11" cy="7.5" r="0.6" fill="currentColor"/>
      <circle cx="15" cy="7.5" r="0.6" fill="currentColor"/>
      <rect x="17.5" y="6.3" width="2.5" height="2.4" rx="0.5" fill="currentColor"/>
    </svg>
  ),
  // Content primitives
  'heading': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4v16M18 4v16M6 12h12"/>
    </svg>
  ),
  'paragraph': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 11h16M4 16h12M4 21h8"/>
    </svg>
  ),
  'link': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/>
    </svg>
  ),
  'table': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18M9 9v12M3 15h18"/>
    </svg>
  ),
  'image': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="9" cy="9" r="2"/>
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
  ),
  'video': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2"/>
      <polygon points="10,9 16,12 10,15" fill="currentColor"/>
    </svg>
  ),
  // Heroes
  'hero-clean': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2"/>
      <path d="M7 9h7M7 13h10M7 17h5"/>
    </svg>
  ),
  'hero-dark': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2"/>
    </svg>
  ),
  // Trust
  'trust-bar': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  'stats-row': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="20" x2="6" y2="11"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="18" y1="20" x2="18" y2="14"/>
    </svg>
  ),
  // Services / Process
  'services-3card': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="6" height="12" rx="1.5"/>
      <rect x="9" y="6" width="6" height="12" rx="1.5"/>
      <rect x="16" y="6" width="6" height="12" rx="1.5"/>
    </svg>
  ),
  'services-4card': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  'feature-list': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="4" cy="6" r="1.2" fill="currentColor"/>
      <line x1="9" y1="6" x2="20" y2="6"/>
      <circle cx="4" cy="12" r="1.2" fill="currentColor"/>
      <line x1="9" y1="12" x2="20" y2="12"/>
      <circle cx="4" cy="18" r="1.2" fill="currentColor"/>
      <line x1="9" y1="18" x2="20" y2="18"/>
    </svg>
  ),
  'how-it-works': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="12" r="2.5"/>
      <circle cx="12" cy="12" r="2.5"/>
      <circle cx="19" cy="12" r="2.5"/>
      <path d="M7.5 12h2M14.5 12h2"/>
    </svg>
  ),
  // Social Proof
  'testimonials-2col': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7l-3 3v-3a1 1 0 0 1 1-1z"/>
      <path d="M13 5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2l-3 3v-3a1 1 0 0 1 1-1z"/>
    </svg>
  ),
  'testimonials-3col': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <line x1="7" y1="9" x2="17" y2="9"/>
      <line x1="7" y1="13" x2="14" y2="13"/>
    </svg>
  ),
  // CTAs
  'cta-dark': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 11 18-5v12L3 14v-3z"/>
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
    </svg>
  ),
  'cta-inline': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="12" x2="14" y2="12"/>
      <polyline points="13 6 20 12 13 18"/>
    </svg>
  ),
  'cta-phone': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  // Footer
  'footer-simple': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2"/>
      <line x1="3" y1="16" x2="21" y2="16"/>
    </svg>
  ),
  'footer-dark': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2"/>
      <rect x="3" y="16" width="18" height="4" fill="currentColor" stroke="none"/>
    </svg>
  ),
};

export default function TemplateBuilder({ onClose, onMinimize, onSave, session, darkMode, setDarkMode }) {
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState('Custom');
  const [theme, setTheme] = useState({ primary: '#075056' });
  const [sections, setSections] = useState([]);
  const [autoUrl, setAutoUrl] = useState('');
  const [autoBusy, setAutoBusy] = useState(false);
  const [autoError, setAutoError] = useState(null);
  const [brandKits, setBrandKits] = useState([]);
  const [selectedKitId, setSelectedKitId] = useState(''); // '' = no kit
  useEffect(() => { fetchBrandKits(session?.access_token).then(setBrandKits); }, [session?.access_token]);
  const [librarySearch, setLibrarySearch] = useState('');
  const [draftRestored, setDraftRestored] = useState(false);
  const [closePromptOpen, setClosePromptOpen] = useState(false);
  const [saveState, setSaveState] = useState('saved'); // 'saving' | 'saved'
  const saveStateTimerRef = useRef(null);
  const [leftWidth, setLeftWidth] = useState(320);
  const [rightWidth, setRightWidth] = useState(384);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const previewIframeRef = useRef(null);
  const expandedIframeRef = useRef(null);
  const previewScrollY = useRef(0);

  // Listen for scroll updates posted from inside the preview iframes
  useEffect(() => {
    const onMessage = (e) => {
      if (e?.data?.type === 'gg-preview-scroll' && typeof e.data.y === 'number') {
        previewScrollY.current = e.data.y;
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // After the iframe finishes loading new srcDoc, push the saved scroll back in
  const restorePreviewScroll = (ref) => () => {
    setTimeout(() => {
      try {
        ref.current?.contentWindow?.postMessage(
          { type: 'gg-preview-restore', y: previewScrollY.current },
          '*'
        );
      } catch { /* ignore */ }
    }, 30);
  };

  // Load saved sidebar widths
  useEffect(() => {
    try {
      const raw = localStorage.getItem('gg-builder-widths');
      if (!raw) return;
      const { left, right } = JSON.parse(raw);
      if (typeof left === 'number') setLeftWidth(Math.max(240, Math.min(560, left)));
      if (typeof right === 'number') setRightWidth(Math.max(280, Math.min(640, right)));
    } catch { /* ignore */ }
  }, []);

  // Persist sidebar widths
  useEffect(() => {
    try { localStorage.setItem('gg-builder-widths', JSON.stringify({ left: leftWidth, right: rightWidth })); } catch { /* ignore */ }
  }, [leftWidth, rightWidth]);

  // Drag-to-resize the sidebars
  const startResize = (which) => (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = which === 'left' ? leftWidth : rightWidth;
    const min = which === 'left' ? 240 : 280;
    const max = which === 'left' ? 560 : 640;
    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const next = which === 'left' ? startW + dx : startW - dx;
      const clamped = Math.max(min, Math.min(max, next));
      if (which === 'left') setLeftWidth(clamped); else setRightWidth(clamped);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // Restore draft on mount (page refresh keeps builder state alive)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (typeof saved.templateName === 'string') setTemplateName(saved.templateName);
        if (typeof saved.templateCategory === 'string') setTemplateCategory(saved.templateCategory);
        if (saved.theme && typeof saved.theme === 'object') setTheme({ ...{ primary: '#075056' }, ...saved.theme });
        if (Array.isArray(saved.sections)) setSections(saved.sections);
      }
    } catch { /* ignore corrupted draft */ }
    setDraftRestored(true);
  }, []);

  // Persist draft on every meaningful change
  useEffect(() => {
    if (!draftRestored) return;
    setSaveState('saving');
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
        sections, templateName, templateCategory, theme
      }));
    } catch { /* storage may be full or blocked — silently skip */ }
    if (saveStateTimerRef.current) clearTimeout(saveStateTimerRef.current);
    saveStateTimerRef.current = setTimeout(() => setSaveState('saved'), 600);
    return () => { if (saveStateTimerRef.current) clearTimeout(saveStateTimerRef.current); };
  }, [draftRestored, sections, templateName, templateCategory, theme]);

  const clearDraft = () => { try { localStorage.removeItem(DRAFT_STORAGE_KEY); } catch { /* ignore */ } };
  const discardAndClose = () => { clearDraft(); setClosePromptOpen(false); onClose?.(); };
  const minimizeBuilder = () => { setClosePromptOpen(false); onMinimize?.(); };
  const requestClose = () => { setClosePromptOpen(true); };
  const [previewMode, setPreviewMode] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [saving, setSaving] = useState(false);

  const sectionLibrary = [
    // ─── Navigation ──────────────────────────────────────────────────────────
    {
      id: 'nav-simple',
      category: 'Navigation',
      name: 'Navigation Bar',
      icon: '▤',
      description: 'Logo left, CTA button right',
      html: `<nav style="background:#fff;border-bottom:1px solid #e5e7eb;padding:18px 5%;">
  <div style="max-width:1080px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:1rem;font-weight:700;color:#111;">{{NAV_LOGO}}</div>
    <!--OPT:NAV_CTA--><a href="{{NAV_CTA_URL}}" style="background:#111;color:#fff;padding:10px 20px;border-radius:7px;font-size:.875rem;font-weight:600;text-decoration:none;">{{NAV_CTA}}</a><!--/OPT-->
  </div>
</nav>`,
      fields: [
        { key: 'NAV_LOGO', label: 'Logo / Business Name', type: 'text', default: '{{KEYWORD}}' },
        { key: 'NAV_CTA', label: 'Button Text', type: 'text', default: 'Get in touch' },
        { key: 'NAV_CTA_URL', label: 'Button URL', type: 'text', default: '#contact' }
      ]
    },
    {
      id: 'nav-links',
      category: 'Navigation',
      name: 'Nav with Links',
      icon: '▤',
      description: 'Logo, nav links, and CTA',
      html: `<nav style="background:#0f172a;padding:18px 5%;">
  <div style="max-width:1080px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:1rem;font-weight:700;color:#fff;">{{NAV_LOGO}}</div>
    <div style="display:flex;gap:28px;align-items:center;">
      <!--OPT:LINK_1--><a href="{{LINK_1_URL}}" style="font-size:.875rem;color:#fbfbfb;text-decoration:none;font-weight:500;">{{LINK_1}}</a><!--/OPT-->
      <!--OPT:LINK_2--><a href="{{LINK_2_URL}}" style="font-size:.875rem;color:#fbfbfb;text-decoration:none;font-weight:500;">{{LINK_2}}</a><!--/OPT-->
      <!--OPT:LINK_3--><a href="{{LINK_3_URL}}" style="font-size:.875rem;color:#fbfbfb;text-decoration:none;font-weight:500;">{{LINK_3}}</a><!--/OPT-->
      <!--OPT:NAV_CTA--><a href="{{NAV_CTA_URL}}" style="background:#2563eb;color:#fff;padding:9px 18px;border-radius:6px;font-size:.8125rem;font-weight:600;text-decoration:none;">{{NAV_CTA}}</a><!--/OPT-->
    </div>
  </div>
</nav>`,
      fields: [
        { key: 'NAV_LOGO', label: 'Logo / Business Name', type: 'text', default: '{{KEYWORD}}' },
        { key: 'LINK_1', label: 'Link 1 Text', type: 'text', default: 'Services' },
        { key: 'LINK_1_URL', label: 'Link 1 URL', type: 'text', default: '#services' },
        { key: 'LINK_2', label: 'Link 2 Text', type: 'text', default: 'About' },
        { key: 'LINK_2_URL', label: 'Link 2 URL', type: 'text', default: '#about' },
        { key: 'LINK_3', label: 'Link 3 Text (optional)', type: 'text', default: '' },
        { key: 'LINK_3_URL', label: 'Link 3 URL', type: 'text', default: '#' },
        { key: 'NAV_CTA', label: 'Button Text', type: 'text', default: 'Contact us' },
        { key: 'NAV_CTA_URL', label: 'Button URL', type: 'text', default: '#contact' }
      ]
    },

    // ─── Content primitives ──────────────────────────────────────────────────
    {
      id: 'heading',
      category: 'Content',
      name: 'Heading',
      description: 'A standalone heading — choose H1, H2, H3, etc.',
      html: `<div style="padding:24px 5%;">
  <div style="max-width:1080px;margin:0 auto;text-align:{{HEADING_ALIGN}};">
    <{{HEADING_LEVEL}} style="font-size:clamp(1.25rem,3vw,2.25rem);font-weight:700;color:#111;line-height:1.2;">{{HEADING_TEXT}}</{{HEADING_LEVEL}}>
  </div>
</div>`,
      fields: [
        { key: 'HEADING_TEXT', label: 'Heading Text', type: 'text', default: 'Your section heading' },
        { key: 'HEADING_LEVEL', label: 'Heading Level', type: 'select', default: 'h2', options: [
          { value: 'h1', label: 'H1 — Page title' },
          { value: 'h2', label: 'H2 — Section heading' },
          { value: 'h3', label: 'H3 — Subsection' },
          { value: 'h4', label: 'H4 — Smaller heading' },
          { value: 'h5', label: 'H5 — Minor heading' },
          { value: 'h6', label: 'H6 — Smallest heading' }
        ]},
        { key: 'HEADING_ALIGN', label: 'Alignment', type: 'select', default: 'left', options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]}
      ]
    },
    {
      id: 'paragraph',
      category: 'Content',
      name: 'Text Block',
      description: 'A paragraph of body text',
      html: `<div style="padding:16px 5%;">
  <div style="max-width:760px;margin:0 auto;">
    <p style="font-size:1rem;color:#374151;line-height:1.75;text-align:{{TEXT_ALIGN}};">{{TEXT_BODY}}</p>
  </div>
</div>`,
      fields: [
        { key: 'TEXT_BODY', label: 'Body Text', type: 'textarea', default: 'Write your paragraph text here. Keep it clear and concise.' },
        { key: 'TEXT_ALIGN', label: 'Alignment', type: 'select', default: 'left', options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
          { value: 'justify', label: 'Justified' }
        ]}
      ]
    },
    {
      id: 'table',
      category: 'Content',
      name: 'Table',
      description: 'A data table with customizable rows and columns',
      html: `<div style="padding:24px 5%;">
  <div style="max-width:1080px;margin:0 auto;">
    <!--OPT:TABLE_TITLE--><h2 style="font-size:clamp(1.25rem,3vw,1.875rem);font-weight:700;color:#111;margin-bottom:16px;line-height:1.2;">{{TABLE_TITLE}}</h2><!--/OPT-->
    {{TABLE_DATA}}
  </div>
</div>`,
      fields: [
        { key: 'TABLE_TITLE', label: 'Title (optional)', type: 'text', default: '' },
        { key: 'TABLE_DATA', label: 'Table', type: 'table', default: JSON.stringify({
          rows: [
            ['Feature', 'Basic', 'Pro'],
            ['Users', '5', 'Unlimited'],
            ['Storage', '10 GB', '1 TB'],
            ['Support', 'Email', 'Priority']
          ],
          hasHeader: true
        }) }
      ]
    },
    {
      id: 'image',
      category: 'Media',
      name: 'Image',
      description: 'Paste an image URL or generate one with AI',
      html: `<div style="padding:24px 5%;">
  <div style="max-width:1080px;margin:0 auto;text-align:{{IMAGE_ALIGN}};">
    <img src="{{IMAGE_URL}}" alt="{{IMAGE_ALT}}" style="max-width:100%;height:auto;border-radius:12px;display:inline-block;" />
    <!--OPT:IMAGE_CAPTION--><p style="font-size:.875rem;color:#6b7280;margin-top:12px;font-style:italic;">{{IMAGE_CAPTION}}</p><!--/OPT-->
  </div>
</div>`,
      fields: [
        { key: 'IMAGE_URL', label: 'Image URL (or generate)', type: 'image-url', default: '' },
        { key: 'IMAGE_ALT', label: 'Alt text', type: 'text', default: 'Image' },
        { key: 'IMAGE_CAPTION', label: 'Caption (optional)', type: 'text', default: '' },
        { key: 'IMAGE_ALIGN', label: 'Alignment', type: 'select', default: 'center', options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]}
      ]
    },
    {
      id: 'video',
      category: 'Media',
      name: 'Video',
      description: 'Embed a YouTube, Vimeo, or Loom video',
      html: `<div style="padding:24px 5%;">
  <div style="max-width:900px;margin:0 auto;">
    <!--OPT:VIDEO_TITLE--><h3 style="font-size:1.25rem;font-weight:700;color:#111;margin-bottom:14px;line-height:1.3;">{{VIDEO_TITLE}}</h3><!--/OPT-->
    {{VIDEO_URL}}
    <!--OPT:VIDEO_CAPTION--><p style="font-size:.875rem;color:#6b7280;margin-top:12px;font-style:italic;">{{VIDEO_CAPTION}}</p><!--/OPT-->
  </div>
</div>`,
      fields: [
        { key: 'VIDEO_URL', label: 'Video URL (YouTube, Vimeo, Loom, MP4)', type: 'video-url', default: '' },
        { key: 'VIDEO_TITLE', label: 'Title (optional)', type: 'text', default: '' },
        { key: 'VIDEO_CAPTION', label: 'Caption (optional)', type: 'text', default: '' }
      ]
    },
    {
      id: 'link',
      category: 'Content',
      name: 'Link / Button',
      description: 'A clickable link as a button or inline text',
      html: `<div style="padding:16px 5%;text-align:{{LINK_ALIGN}};">
  <div style="max-width:1080px;margin:0 auto;">
    <a href="{{LINK_URL}}" style="display:inline-block;{{LINK_STYLE}}">{{LINK_TEXT}}</a>
  </div>
</div>`,
      fields: [
        { key: 'LINK_TEXT', label: 'Link Text', type: 'text', default: 'Click here' },
        { key: 'LINK_URL', label: 'Link URL', type: 'text', default: 'https://' },
        { key: 'LINK_STYLE', label: 'Style', type: 'select', default: 'background:#111;color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;font-size:.9375rem;text-decoration:none;', options: [
          { value: 'background:#111;color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;font-size:.9375rem;text-decoration:none;', label: 'Solid Button' },
          { value: 'color:#111;padding:12px 24px;border-radius:8px;font-weight:600;font-size:.9375rem;border:1px solid #e5e7eb;text-decoration:none;', label: 'Outline Button' },
          { value: 'color:#2563eb;font-weight:600;text-decoration:underline;font-size:1rem;', label: 'Text Link (inline)' }
        ]},
        { key: 'LINK_ALIGN', label: 'Alignment', type: 'select', default: 'left', options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]}
      ]
    },

    // ─── Heroes ───────────────────────────────────────────────────────────────
    {
      id: 'hero-clean',
      category: 'Hero',
      name: 'Clean Hero',
      icon: '◼',
      description: 'Left-aligned headline, subtext, two buttons',
      html: `<section style="padding:88px 5%;background:#fff;border-bottom:1px solid #e5e7eb;">
  <div style="max-width:1080px;margin:0 auto;">
    <!--OPT:HERO_EYEBROW--><div style="font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;margin-bottom:18px;">{{HERO_EYEBROW}}</div><!--/OPT-->
    <h1 style="font-size:clamp(2.25rem,5vw,3.5rem);font-weight:800;line-height:1.1;color:#111;margin-bottom:20px;max-width:740px;">{{HERO_HEADLINE}}</h1>
    <!--OPT:HERO_SUBHEADLINE--><p style="font-size:1.0625rem;color:#6b7280;max-width:520px;line-height:1.75;margin-bottom:36px;">{{HERO_SUBHEADLINE}}</p><!--/OPT-->
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <!--OPT:CTA_PRIMARY--><a href="#contact" style="background:#111;color:#fff;padding:13px 26px;border-radius:8px;font-weight:600;font-size:.9375rem;text-decoration:none;">{{CTA_PRIMARY}}</a><!--/OPT-->
      <!--OPT:CTA_SECONDARY--><a href="#services" style="color:#111;padding:13px 26px;border-radius:8px;font-weight:600;font-size:.9375rem;border:1px solid #e5e7eb;text-decoration:none;">{{CTA_SECONDARY}}</a><!--/OPT-->
    </div>
  </div>
</section>`,
      fields: [
        { key: 'HERO_EYEBROW', label: 'Eyebrow label', type: 'text', default: '{{SERVICE}} in {{LOCATION}}' },
        { key: 'HERO_HEADLINE', label: 'Main Headline', type: 'text', default: '{{HERO_HEADLINE}}' },
        { key: 'HERO_SUBHEADLINE', label: 'Subheadline', type: 'textarea', default: '{{HERO_SUBHEADLINE}}' },
        { key: 'CTA_PRIMARY', label: 'Primary Button', type: 'text', default: 'Get a free quote' },
        { key: 'CTA_SECONDARY', label: 'Secondary Button', type: 'text', default: 'Learn more' }
      ]
    },
    {
      id: 'hero-dark',
      category: 'Hero',
      name: 'Bold Dark Hero',
      icon: '◼',
      description: 'Dark background, large headline, numbered stats',
      html: `<section style="background:#0a0a0a;padding:100px 5%;">
  <div style="max-width:1080px;margin:0 auto;">
    <!--OPT:HERO_EYEBROW--><div style="font-size:.75rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#7c3aed;margin-bottom:20px;">{{HERO_EYEBROW}}</div><!--/OPT-->
    <h1 style="font-size:clamp(2.5rem,6vw,4.5rem);font-weight:900;line-height:1.05;color:#fff;margin-bottom:24px;max-width:800px;">{{HERO_HEADLINE}}</h1>
    <!--OPT:HERO_SUBHEADLINE--><p style="font-size:1.125rem;color:#a3a3a3;max-width:500px;line-height:1.75;margin-bottom:40px;">{{HERO_SUBHEADLINE}}</p><!--/OPT-->
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:56px;">
      <!--OPT:CTA_PRIMARY--><a href="#contact" style="background:#7c3aed;color:#fff;padding:14px 28px;border-radius:8px;font-weight:700;font-size:.9375rem;text-decoration:none;">{{CTA_PRIMARY}}</a><!--/OPT-->
      <!--OPT:CTA_SECONDARY--><a href="#services" style="color:#a3a3a3;padding:14px 28px;border-radius:8px;font-weight:600;font-size:.9375rem;border:1px solid #333333;text-decoration:none;">{{CTA_SECONDARY}}</a><!--/OPT-->
    </div>
    <div style="display:flex;gap:48px;flex-wrap:wrap;padding-top:40px;border-top:1px solid #2a2a2a;">
      <!--OPT:STAT_1_NUM--><div><div style="font-size:2rem;font-weight:800;color:#fff;">{{STAT_1_NUM}}</div><div style="font-size:.8125rem;color:#6b7280;margin-top:4px;">{{STAT_1_LBL}}</div></div><!--/OPT-->
      <!--OPT:STAT_2_NUM--><div><div style="font-size:2rem;font-weight:800;color:#fff;">{{STAT_2_NUM}}</div><div style="font-size:.8125rem;color:#6b7280;margin-top:4px;">{{STAT_2_LBL}}</div></div><!--/OPT-->
      <!--OPT:STAT_3_NUM--><div><div style="font-size:2rem;font-weight:800;color:#fff;">{{STAT_3_NUM}}</div><div style="font-size:.8125rem;color:#6b7280;margin-top:4px;">{{STAT_3_LBL}}</div></div><!--/OPT-->
    </div>
  </div>
</section>`,
      fields: [
        { key: 'HERO_EYEBROW', label: 'Eyebrow label', type: 'text', default: '{{SERVICE}} | {{LOCATION}}' },
        { key: 'HERO_HEADLINE', label: 'Main Headline', type: 'text', default: '{{HERO_HEADLINE}}' },
        { key: 'HERO_SUBHEADLINE', label: 'Subheadline', type: 'textarea', default: '{{HERO_SUBHEADLINE}}' },
        { key: 'CTA_PRIMARY', label: 'Primary Button', type: 'text', default: 'Get started' },
        { key: 'CTA_SECONDARY', label: 'Secondary Button', type: 'text', default: 'See our work' },
        { key: 'STAT_1_NUM', label: 'Stat 1 Number', type: 'text', default: '{{STAT_1_NUMBER}}' },
        { key: 'STAT_1_LBL', label: 'Stat 1 Label', type: 'text', default: '{{STAT_1_LABEL}}' },
        { key: 'STAT_2_NUM', label: 'Stat 2 Number', type: 'text', default: '{{STAT_2_NUMBER}}' },
        { key: 'STAT_2_LBL', label: 'Stat 2 Label', type: 'text', default: '{{STAT_2_LABEL}}' },
        { key: 'STAT_3_NUM', label: 'Stat 3 Number', type: 'text', default: '{{STAT_3_NUMBER}}' },
        { key: 'STAT_3_LBL', label: 'Stat 3 Label', type: 'text', default: '{{STAT_3_LABEL}}' }
      ]
    },
    // ─── Trust ────────────────────────────────────────────────────────────────
    {
      id: 'trust-bar',
      category: 'Trust',
      name: 'Trust Bar',
      icon: '✓',
      description: 'Horizontal row of trust signals',
      html: `<div style="background:#f8fafc;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;padding:20px 5%;">
  <div style="max-width:1080px;margin:0 auto;display:flex;gap:40px;flex-wrap:wrap;align-items:center;">
    <!--OPT:TRUST_1--><span style="font-size:.875rem;font-weight:600;color:#475569;">{{TRUST_1}}</span><!--/OPT-->
    <!--OPT:TRUST_2--><span style="font-size:.875rem;font-weight:600;color:#475569;">{{TRUST_2}}</span><!--/OPT-->
    <!--OPT:TRUST_3--><span style="font-size:.875rem;font-weight:600;color:#475569;">{{TRUST_3}}</span><!--/OPT-->
    <!--OPT:TRUST_4--><span style="font-size:.875rem;font-weight:600;color:#475569;">{{TRUST_4}}</span><!--/OPT-->
  </div>
</div>`,
      fields: [
        { key: 'TRUST_1', label: 'Trust item 1', type: 'text', default: '{{TRUST_1}}' },
        { key: 'TRUST_2', label: 'Trust item 2', type: 'text', default: '{{TRUST_2}}' },
        { key: 'TRUST_3', label: 'Trust item 3', type: 'text', default: '{{TRUST_3}}' },
        { key: 'TRUST_4', label: 'Trust item 4', type: 'text', default: '{{TRUST_4}}' }
      ]
    },
    {
      id: 'stats-row',
      category: 'Trust',
      name: 'Stats Row',
      icon: '#',
      description: 'Three key metrics side by side',
      html: `<div style="padding:64px 5%;background:#fff;border-top:1px solid #e5e7eb;">
  <div style="max-width:1080px;margin:0 auto;display:flex;gap:56px;flex-wrap:wrap;">
    <!--OPT:STAT_1_NUM--><div><div style="font-size:2.5rem;font-weight:800;color:#111;line-height:1;">{{STAT_1_NUM}}</div><div style="font-size:.875rem;color:#6b7280;margin-top:6px;">{{STAT_1_LBL}}</div></div><!--/OPT-->
    <!--OPT:STAT_2_NUM--><div><div style="font-size:2.5rem;font-weight:800;color:#111;line-height:1;">{{STAT_2_NUM}}</div><div style="font-size:.875rem;color:#6b7280;margin-top:6px;">{{STAT_2_LBL}}</div></div><!--/OPT-->
    <!--OPT:STAT_3_NUM--><div><div style="font-size:2.5rem;font-weight:800;color:#111;line-height:1;">{{STAT_3_NUM}}</div><div style="font-size:.875rem;color:#6b7280;margin-top:6px;">{{STAT_3_LBL}}</div></div><!--/OPT-->
  </div>
</div>`,
      fields: [
        { key: 'STAT_1_NUM', label: 'Stat 1 Number', type: 'text', default: '{{STAT_1_NUMBER}}' },
        { key: 'STAT_1_LBL', label: 'Stat 1 Label', type: 'text', default: '{{STAT_1_LABEL}}' },
        { key: 'STAT_2_NUM', label: 'Stat 2 Number', type: 'text', default: '{{STAT_2_NUMBER}}' },
        { key: 'STAT_2_LBL', label: 'Stat 2 Label', type: 'text', default: '{{STAT_2_LABEL}}' },
        { key: 'STAT_3_NUM', label: 'Stat 3 Number', type: 'text', default: '{{STAT_3_NUMBER}}' },
        { key: 'STAT_3_LBL', label: 'Stat 3 Label', type: 'text', default: '{{STAT_3_LABEL}}' }
      ]
    },

    // ─── Services / Features ──────────────────────────────────────────────────
    {
      id: 'services-3card',
      category: 'Services',
      name: '3-Card Grid',
      icon: '▦',
      description: 'Three bordered service cards with section header',
      html: `<section style="padding:72px 5%;background:#fff;border-top:1px solid #e5e7eb;" id="services">
  <div style="max-width:1080px;margin:0 auto;">
    <!--OPT:SEC_LABEL--><div style="font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;margin-bottom:12px;">{{SEC_LABEL}}</div><!--/OPT-->
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:700;color:#111;margin-bottom:14px;">{{SEC_HEADLINE}}</h2>
    <!--OPT:SEC_LEAD--><p style="font-size:1rem;color:#6b7280;max-width:520px;line-height:1.75;margin-bottom:48px;">{{SEC_LEAD}}</p><!--/OPT-->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
      <!--OPT:CARD_1_TITLE--><div style="padding:28px;border:1px solid #e5e7eb;border-radius:10px;">
        <div style="font-size:.9375rem;font-weight:700;color:#111;margin-bottom:8px;">{{CARD_1_TITLE}}</div>
        <div style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{CARD_1_TEXT}}</div>
      </div><!--/OPT-->
      <!--OPT:CARD_2_TITLE--><div style="padding:28px;border:1px solid #e5e7eb;border-radius:10px;">
        <div style="font-size:.9375rem;font-weight:700;color:#111;margin-bottom:8px;">{{CARD_2_TITLE}}</div>
        <div style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{CARD_2_TEXT}}</div>
      </div><!--/OPT-->
      <!--OPT:CARD_3_TITLE--><div style="padding:28px;border:1px solid #e5e7eb;border-radius:10px;">
        <div style="font-size:.9375rem;font-weight:700;color:#111;margin-bottom:8px;">{{CARD_3_TITLE}}</div>
        <div style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{CARD_3_TEXT}}</div>
      </div><!--/OPT-->
    </div>
  </div>
</section>`,
      fields: [
        { key: 'SEC_LABEL', label: 'Section label', type: 'text', default: 'What we do' },
        { key: 'SEC_HEADLINE', label: 'Section headline', type: 'text', default: '{{SERVICES_HEADLINE}}' },
        { key: 'SEC_LEAD', label: 'Lead paragraph', type: 'textarea', default: '{{SERVICES_INTRO}}' },
        { key: 'CARD_1_TITLE', label: 'Card 1 Title', type: 'text', default: '{{FEATURE_1_TITLE}}' },
        { key: 'CARD_1_TEXT', label: 'Card 1 Text', type: 'textarea', default: '{{FEATURE_1_TEXT}}' },
        { key: 'CARD_2_TITLE', label: 'Card 2 Title', type: 'text', default: '{{FEATURE_2_TITLE}}' },
        { key: 'CARD_2_TEXT', label: 'Card 2 Text', type: 'textarea', default: '{{FEATURE_2_TEXT}}' },
        { key: 'CARD_3_TITLE', label: 'Card 3 Title', type: 'text', default: '{{FEATURE_3_TITLE}}' },
        { key: 'CARD_3_TEXT', label: 'Card 3 Text', type: 'textarea', default: '{{FEATURE_3_TEXT}}' }
      ]
    },
    {
      id: 'services-4card',
      category: 'Services',
      name: '4-Card Grid',
      icon: '▦',
      description: 'Four bordered service cards',
      html: `<section style="padding:72px 5%;background:#f9fafb;border-top:1px solid #e5e7eb;" id="services">
  <div style="max-width:1080px;margin:0 auto;">
    <!--OPT:SEC_LABEL--><div style="font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;margin-bottom:12px;">{{SEC_LABEL}}</div><!--/OPT-->
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:700;color:#111;margin-bottom:14px;">{{SEC_HEADLINE}}</h2>
    <!--OPT:SEC_LEAD--><p style="font-size:1rem;color:#6b7280;max-width:520px;line-height:1.75;margin-bottom:48px;">{{SEC_LEAD}}</p><!--/OPT-->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;">
      <!--OPT:CARD_1_TITLE--><div style="padding:24px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;">
        <div style="font-size:.9375rem;font-weight:700;color:#111;margin-bottom:8px;">{{CARD_1_TITLE}}</div>
        <div style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{CARD_1_TEXT}}</div>
      </div><!--/OPT-->
      <!--OPT:CARD_2_TITLE--><div style="padding:24px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;">
        <div style="font-size:.9375rem;font-weight:700;color:#111;margin-bottom:8px;">{{CARD_2_TITLE}}</div>
        <div style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{CARD_2_TEXT}}</div>
      </div><!--/OPT-->
      <!--OPT:CARD_3_TITLE--><div style="padding:24px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;">
        <div style="font-size:.9375rem;font-weight:700;color:#111;margin-bottom:8px;">{{CARD_3_TITLE}}</div>
        <div style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{CARD_3_TEXT}}</div>
      </div><!--/OPT-->
      <!--OPT:CARD_4_TITLE--><div style="padding:24px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;">
        <div style="font-size:.9375rem;font-weight:700;color:#111;margin-bottom:8px;">{{CARD_4_TITLE}}</div>
        <div style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{CARD_4_TEXT}}</div>
      </div><!--/OPT-->
    </div>
  </div>
</section>`,
      fields: [
        { key: 'SEC_LABEL', label: 'Section label', type: 'text', default: 'What we offer' },
        { key: 'SEC_HEADLINE', label: 'Section headline', type: 'text', default: '{{SERVICES_HEADLINE}}' },
        { key: 'SEC_LEAD', label: 'Lead paragraph', type: 'textarea', default: '{{SERVICES_INTRO}}' },
        { key: 'CARD_1_TITLE', label: 'Card 1 Title', type: 'text', default: '{{FEATURE_1_TITLE}}' },
        { key: 'CARD_1_TEXT', label: 'Card 1 Text', type: 'textarea', default: '{{FEATURE_1_TEXT}}' },
        { key: 'CARD_2_TITLE', label: 'Card 2 Title', type: 'text', default: '{{FEATURE_2_TITLE}}' },
        { key: 'CARD_2_TEXT', label: 'Card 2 Text', type: 'textarea', default: '{{FEATURE_2_TEXT}}' },
        { key: 'CARD_3_TITLE', label: 'Card 3 Title', type: 'text', default: '{{FEATURE_3_TITLE}}' },
        { key: 'CARD_3_TEXT', label: 'Card 3 Text', type: 'textarea', default: '{{FEATURE_3_TEXT}}' },
        { key: 'CARD_4_TITLE', label: 'Card 4 Title', type: 'text', default: '{{FEATURE_4_TITLE}}' },
        { key: 'CARD_4_TEXT', label: 'Card 4 Text', type: 'textarea', default: '{{FEATURE_4_TEXT}}' }
      ]
    },
    {
      id: 'feature-list',
      category: 'Services',
      name: 'Feature List',
      icon: '▦',
      description: 'Vertical list with accent markers',
      html: `<section style="padding:72px 5%;background:#fff;border-top:1px solid #e5e7eb;">
  <div style="max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:start;">
    <div>
      <!--OPT:SEC_LABEL--><div style="font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;margin-bottom:12px;">{{SEC_LABEL}}</div><!--/OPT-->
      <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:700;color:#111;margin-bottom:14px;">{{SEC_HEADLINE}}</h2>
      <!--OPT:SEC_LEAD--><p style="font-size:1rem;color:#6b7280;line-height:1.75;">{{SEC_LEAD}}</p><!--/OPT-->
    </div>
    <div style="display:flex;flex-direction:column;gap:24px;">
      <!--OPT:FEAT_1_TITLE--><div style="display:flex;gap:16px;">
        <div style="width:4px;background:#5b4cdb;border-radius:2px;flex-shrink:0;"></div>
        <div><div style="font-size:.9375rem;font-weight:600;color:#111;margin-bottom:4px;">{{FEAT_1_TITLE}}</div><div style="font-size:.875rem;color:#6b7280;line-height:1.65;">{{FEAT_1_TEXT}}</div></div>
      </div><!--/OPT-->
      <!--OPT:FEAT_2_TITLE--><div style="display:flex;gap:16px;">
        <div style="width:4px;background:#5b4cdb;border-radius:2px;flex-shrink:0;"></div>
        <div><div style="font-size:.9375rem;font-weight:600;color:#111;margin-bottom:4px;">{{FEAT_2_TITLE}}</div><div style="font-size:.875rem;color:#6b7280;line-height:1.65;">{{FEAT_2_TEXT}}</div></div>
      </div><!--/OPT-->
      <!--OPT:FEAT_3_TITLE--><div style="display:flex;gap:16px;">
        <div style="width:4px;background:#5b4cdb;border-radius:2px;flex-shrink:0;"></div>
        <div><div style="font-size:.9375rem;font-weight:600;color:#111;margin-bottom:4px;">{{FEAT_3_TITLE}}</div><div style="font-size:.875rem;color:#6b7280;line-height:1.65;">{{FEAT_3_TEXT}}</div></div>
      </div><!--/OPT-->
    </div>
  </div>
</section>`,
      fields: [
        { key: 'SEC_LABEL', label: 'Section label', type: 'text', default: 'Why choose us' },
        { key: 'SEC_HEADLINE', label: 'Headline', type: 'text', default: '{{WHY_HEADLINE}}' },
        { key: 'SEC_LEAD', label: 'Lead text', type: 'textarea', default: '{{WHY_INTRO}}' },
        { key: 'FEAT_1_TITLE', label: 'Item 1 Title', type: 'text', default: '{{FEATURE_1_TITLE}}' },
        { key: 'FEAT_1_TEXT', label: 'Item 1 Text', type: 'textarea', default: '{{FEATURE_1_TEXT}}' },
        { key: 'FEAT_2_TITLE', label: 'Item 2 Title', type: 'text', default: '{{FEATURE_2_TITLE}}' },
        { key: 'FEAT_2_TEXT', label: 'Item 2 Text', type: 'textarea', default: '{{FEATURE_2_TEXT}}' },
        { key: 'FEAT_3_TITLE', label: 'Item 3 Title', type: 'text', default: '{{FEATURE_3_TITLE}}' },
        { key: 'FEAT_3_TEXT', label: 'Item 3 Text', type: 'textarea', default: '{{FEATURE_3_TEXT}}' }
      ]
    },

    // ─── Process ──────────────────────────────────────────────────────────────
    {
      id: 'how-it-works',
      category: 'Process',
      name: 'How It Works',
      icon: '→',
      description: 'Numbered 4-step process',
      html: `<section style="padding:80px 5%;background:#f9fafb;border-top:1px solid #e5e7eb;">
  <div style="max-width:1080px;margin:0 auto;">
    <!--OPT:SEC_LABEL--><div style="font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;margin-bottom:12px;text-align:center;">{{SEC_LABEL}}</div><!--/OPT-->
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:700;color:#111;margin-bottom:48px;text-align:center;">{{SEC_HEADLINE}}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:32px;">
      <!--OPT:STEP_1_TITLE--><div style="text-align:center;padding:24px;">
        <div style="width:48px;height:48px;background:#111;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:800;margin:0 auto 20px;">1</div>
        <h3 style="font-size:1rem;font-weight:700;color:#111;margin-bottom:8px;">{{STEP_1_TITLE}}</h3>
        <p style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{STEP_1_DESC}}</p>
      </div><!--/OPT-->
      <!--OPT:STEP_2_TITLE--><div style="text-align:center;padding:24px;">
        <div style="width:48px;height:48px;background:#111;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:800;margin:0 auto 20px;">2</div>
        <h3 style="font-size:1rem;font-weight:700;color:#111;margin-bottom:8px;">{{STEP_2_TITLE}}</h3>
        <p style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{STEP_2_DESC}}</p>
      </div><!--/OPT-->
      <!--OPT:STEP_3_TITLE--><div style="text-align:center;padding:24px;">
        <div style="width:48px;height:48px;background:#111;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:800;margin:0 auto 20px;">3</div>
        <h3 style="font-size:1rem;font-weight:700;color:#111;margin-bottom:8px;">{{STEP_3_TITLE}}</h3>
        <p style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{STEP_3_DESC}}</p>
      </div><!--/OPT-->
      <!--OPT:STEP_4_TITLE--><div style="text-align:center;padding:24px;">
        <div style="width:48px;height:48px;background:#111;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:800;margin:0 auto 20px;">4</div>
        <h3 style="font-size:1rem;font-weight:700;color:#111;margin-bottom:8px;">{{STEP_4_TITLE}}</h3>
        <p style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{STEP_4_DESC}}</p>
      </div><!--/OPT-->
    </div>
  </div>
</section>`,
      fields: [
        { key: 'SEC_LABEL', label: 'Section label', type: 'text', default: 'How it works' },
        { key: 'SEC_HEADLINE', label: 'Section headline', type: 'text', default: 'Simple, transparent process' },
        { key: 'STEP_1_TITLE', label: 'Step 1 Title', type: 'text', default: 'Contact us' },
        { key: 'STEP_1_DESC', label: 'Step 1 Description', type: 'textarea', default: 'Reach out via phone or email' },
        { key: 'STEP_2_TITLE', label: 'Step 2 Title', type: 'text', default: 'Free consultation' },
        { key: 'STEP_2_DESC', label: 'Step 2 Description', type: 'textarea', default: 'We assess your needs and provide a quote' },
        { key: 'STEP_3_TITLE', label: 'Step 3 Title', type: 'text', default: 'We get to work' },
        { key: 'STEP_3_DESC', label: 'Step 3 Description', type: 'textarea', default: 'Professional service delivered on time' },
        { key: 'STEP_4_TITLE', label: 'Step 4 Title', type: 'text', default: 'Your satisfaction' },
        { key: 'STEP_4_DESC', label: 'Step 4 Description', type: 'textarea', default: "We follow up to ensure you're happy" }
      ]
    },

    // ─── Social Proof ─────────────────────────────────────────────────────────
    {
      id: 'testimonials-2col',
      category: 'Social Proof',
      name: '2-Column Testimonials',
      icon: '"',
      description: 'Two testimonial cards side by side',
      html: `<section style="padding:72px 5%;background:#fff;border-top:1px solid #e5e7eb;" id="reviews">
  <div style="max-width:1080px;margin:0 auto;">
    <!--OPT:SEC_LABEL--><div style="font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;margin-bottom:12px;">{{SEC_LABEL}}</div><!--/OPT-->
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:700;color:#111;margin-bottom:14px;">{{SEC_HEADLINE}}</h2>
    <!--OPT:SEC_LEAD--><p style="font-size:1rem;color:#6b7280;max-width:520px;line-height:1.75;margin-bottom:48px;">{{SEC_LEAD}}</p><!--/OPT-->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;">
      <!--OPT:QUOTE_1--><div style="background:#f9fafb;padding:28px;border-radius:10px;">
        <p style="font-size:.9375rem;color:#374151;line-height:1.75;margin-bottom:18px;font-style:italic;">{{QUOTE_1}}</p>
        <div style="font-size:.8125rem;font-weight:600;color:#111;">{{NAME_1}}, {{LOCATION}}</div>
      </div><!--/OPT-->
      <!--OPT:QUOTE_2--><div style="background:#f9fafb;padding:28px;border-radius:10px;">
        <p style="font-size:.9375rem;color:#374151;line-height:1.75;margin-bottom:18px;font-style:italic;">{{QUOTE_2}}</p>
        <div style="font-size:.8125rem;font-weight:600;color:#111;">{{NAME_2}}, {{LOCATION}}</div>
      </div><!--/OPT-->
    </div>
  </div>
</section>`,
      fields: [
        { key: 'SEC_LABEL', label: 'Section label', type: 'text', default: 'Reviews' },
        { key: 'SEC_HEADLINE', label: 'Section headline', type: 'text', default: 'Trusted across {{LOCATION}}' },
        { key: 'SEC_LEAD', label: 'Lead text', type: 'textarea', default: 'Real feedback from real customers.' },
        { key: 'QUOTE_1', label: 'Quote 1', type: 'textarea', default: '{{TESTIMONIAL_1_QUOTE}}' },
        { key: 'NAME_1', label: 'Name 1', type: 'text', default: '{{TESTIMONIAL_1_NAME}}' },
        { key: 'QUOTE_2', label: 'Quote 2', type: 'textarea', default: '{{TESTIMONIAL_2_QUOTE}}' },
        { key: 'NAME_2', label: 'Name 2', type: 'text', default: '{{TESTIMONIAL_2_NAME}}' },
        { key: 'LOCATION', label: 'Location', type: 'text', default: '{{LOCATION}}' }
      ]
    },
    {
      id: 'testimonials-3col',
      category: 'Social Proof',
      name: '3-Column Testimonials',
      icon: '"',
      description: 'Three testimonial cards',
      html: `<section style="padding:72px 5%;background:#f9fafb;border-top:1px solid #e5e7eb;">
  <div style="max-width:1080px;margin:0 auto;">
    <!--OPT:SEC_LABEL--><div style="font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;margin-bottom:12px;text-align:center;">{{SEC_LABEL}}</div><!--/OPT-->
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:700;color:#111;margin-bottom:48px;text-align:center;">{{SEC_HEADLINE}}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
      <!--OPT:QUOTE_1--><div style="background:#fff;padding:28px;border-radius:10px;border:1px solid #e5e7eb;">
        <p style="font-size:.9375rem;color:#374151;line-height:1.75;margin-bottom:18px;font-style:italic;">{{QUOTE_1}}</p>
        <div style="font-size:.8125rem;font-weight:600;color:#111;">{{NAME_1}}</div>
      </div><!--/OPT-->
      <!--OPT:QUOTE_2--><div style="background:#fff;padding:28px;border-radius:10px;border:1px solid #e5e7eb;">
        <p style="font-size:.9375rem;color:#374151;line-height:1.75;margin-bottom:18px;font-style:italic;">{{QUOTE_2}}</p>
        <div style="font-size:.8125rem;font-weight:600;color:#111;">{{NAME_2}}</div>
      </div><!--/OPT-->
      <!--OPT:QUOTE_3--><div style="background:#fff;padding:28px;border-radius:10px;border:1px solid #e5e7eb;">
        <p style="font-size:.9375rem;color:#374151;line-height:1.75;margin-bottom:18px;font-style:italic;">{{QUOTE_3}}</p>
        <div style="font-size:.8125rem;font-weight:600;color:#111;">{{NAME_3}}</div>
      </div><!--/OPT-->
    </div>
  </div>
</section>`,
      fields: [
        { key: 'SEC_LABEL', label: 'Section label', type: 'text', default: 'What people say' },
        { key: 'SEC_HEADLINE', label: 'Section headline', type: 'text', default: 'Loved by customers in {{LOCATION}}' },
        { key: 'QUOTE_1', label: 'Quote 1', type: 'textarea', default: '{{TESTIMONIAL_1_QUOTE}}' },
        { key: 'NAME_1', label: 'Name 1', type: 'text', default: '{{TESTIMONIAL_1_NAME}}' },
        { key: 'QUOTE_2', label: 'Quote 2', type: 'textarea', default: '{{TESTIMONIAL_2_QUOTE}}' },
        { key: 'NAME_2', label: 'Name 2', type: 'text', default: '{{TESTIMONIAL_2_NAME}}' },
        { key: 'QUOTE_3', label: 'Quote 3', type: 'textarea', default: '{{TESTIMONIAL_3_QUOTE}}' },
        { key: 'NAME_3', label: 'Name 3', type: 'text', default: '{{TESTIMONIAL_3_NAME}}' }
      ]
    },

    // ─── CTAs ─────────────────────────────────────────────────────────────────
    {
      id: 'cta-dark',
      category: 'CTAs',
      name: 'Dark CTA Band',
      icon: '▶',
      description: 'Full-width dark background CTA',
      html: `<section style="background:#111;padding:80px 5%;text-align:center;" id="contact">
  <div style="max-width:700px;margin:0 auto;">
    <h2 style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:800;color:#fff;margin-bottom:12px;">{{CTA_HEADLINE}}</h2>
    <!--OPT:CTA_SUBTEXT--><p style="font-size:1rem;color:#9ca3af;margin-bottom:32px;">{{CTA_SUBTEXT}}</p><!--/OPT-->
    <!--OPT:CTA_BTN--><a href="tel:+1-555-000-0000" style="background:#fff;color:#111;padding:14px 36px;border-radius:8px;font-weight:700;font-size:1rem;text-decoration:none;display:inline-block;">{{CTA_BTN}}</a><!--/OPT-->
  </div>
</section>`,
      fields: [
        { key: 'CTA_HEADLINE', label: 'Headline', type: 'text', default: '{{CTA_HEADLINE}}' },
        { key: 'CTA_SUBTEXT', label: 'Supporting text', type: 'textarea', default: '{{CTA_SUBTEXT}}' },
        { key: 'CTA_BTN', label: 'Button text', type: 'text', default: 'Call us now' }
      ]
    },
    {
      id: 'cta-inline',
      category: 'CTAs',
      name: 'Inline CTA',
      icon: '▶',
      description: 'Text left, button right: clean horizontal layout',
      html: `<section style="background:#0f172a;padding:64px 5%;" id="contact">
  <div style="max-width:1080px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:32px;">
    <div>
      <h2 style="font-size:clamp(1.75rem,4vw,2.5rem);font-weight:800;color:#fff;margin-bottom:8px;">{{CTA_HEADLINE}}</h2>
      <!--OPT:CTA_SUBTEXT--><p style="font-size:1rem;color:#fbfbfb;">{{CTA_SUBTEXT}}</p><!--/OPT-->
    </div>
    <!--OPT:CTA_BTN--><a href="tel:+1-555-000-0000" style="background:#2563eb;color:#fff;padding:15px 36px;border-radius:7px;font-weight:700;font-size:1rem;text-decoration:none;white-space:nowrap;display:inline-block;">{{CTA_BTN}}</a><!--/OPT-->
  </div>
</section>`,
      fields: [
        { key: 'CTA_HEADLINE', label: 'Headline', type: 'text', default: '{{CTA_HEADLINE}}' },
        { key: 'CTA_SUBTEXT', label: 'Supporting text', type: 'textarea', default: '{{CTA_SUBTEXT}}' },
        { key: 'CTA_BTN', label: 'Button text', type: 'text', default: 'Call now' }
      ]
    },
    {
      id: 'cta-phone',
      category: 'CTAs',
      name: 'Phone CTA',
      icon: '▶',
      description: 'Conversion-focused with phone number prominent',
      html: `<section style="background:#111;padding:64px 5%;" id="contact">
  <div style="max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1fr auto;gap:40px;align-items:center;flex-wrap:wrap;">
    <div>
      <h2 style="font-size:clamp(1.5rem,3.5vw,2.5rem);font-weight:800;color:#fff;margin-bottom:10px;">{{CTA_HEADLINE}}</h2>
      <!--OPT:CTA_SUBTEXT--><p style="font-size:.9375rem;color:#9ca3af;">{{CTA_SUBTEXT}}</p><!--/OPT-->
    </div>
    <div style="text-align:center;">
      <a href="tel:+1-555-000-0000" style="display:block;background:#16a34a;color:#fff;padding:16px 32px;border-radius:8px;font-weight:800;font-size:1.125rem;text-decoration:none;margin-bottom:8px;">{{PHONE}}</a>
      <!--OPT:AVAILABILITY--><div style="font-size:.75rem;color:#6b7280;">{{AVAILABILITY}}</div><!--/OPT-->
    </div>
  </div>
</section>`,
      fields: [
        { key: 'CTA_HEADLINE', label: 'Headline', type: 'text', default: '{{CTA_HEADLINE}}' },
        { key: 'CTA_SUBTEXT', label: 'Supporting text', type: 'textarea', default: '{{CTA_SUBTEXT}}' },
        { key: 'PHONE', label: 'Phone number', type: 'text', default: 'Call +1 (555) 000-0000' },
        { key: 'AVAILABILITY', label: 'Availability note', type: 'text', default: 'Available 7 days a week' }
      ]
    },

    // ─── Footer ───────────────────────────────────────────────────────────────
    {
      id: 'footer-simple',
      category: 'Footer',
      name: 'Simple Footer',
      icon: '▬',
      description: 'Name left, copyright right',
      html: `<footer style="padding:32px 5%;border-top:1px solid #e5e7eb;">
  <div style="max-width:1080px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:.8125rem;color:#9ca3af;">
    <span>{{FOOTER_NAME}} | {{LOCATION}}</span>
    <span>&copy; {{YEAR}} {{FOOTER_NAME}}. All rights reserved.</span>
  </div>
</footer>`,
      fields: [
        { key: 'FOOTER_NAME', label: 'Business name', type: 'text', default: '{{KEYWORD}}' },
        { key: 'LOCATION', label: 'Location', type: 'text', default: '{{LOCATION}}' },
        { key: 'YEAR', label: 'Year', type: 'text', default: '2024' }
      ]
    },
    {
      id: 'footer-dark',
      category: 'Footer',
      name: 'Dark Footer',
      icon: '▬',
      description: 'Dark background footer',
      html: `<footer style="padding:40px 5%;background:#0a0a0a;border-top:1px solid #2a2a2a;">
  <div style="max-width:1080px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:.8125rem;color:#4b5563;">
    <span>{{FOOTER_NAME}} | {{LOCATION}}</span>
    <span>&copy; {{YEAR}} {{FOOTER_NAME}}. All rights reserved.</span>
  </div>
</footer>`,
      fields: [
        { key: 'FOOTER_NAME', label: 'Business name', type: 'text', default: '{{KEYWORD}}' },
        { key: 'LOCATION', label: 'Location', type: 'text', default: '{{LOCATION}}' },
        { key: 'YEAR', label: 'Year', type: 'text', default: '2024' }
      ]
    }
  ];

  const categories = ['all', ...new Set(sectionLibrary.map(s => s.category))];

  const byCategory = selectedCategory === 'all'
    ? sectionLibrary
    : sectionLibrary.filter(s => s.category === selectedCategory);

  const sq = librarySearch.trim().toLowerCase();
  const filteredSections = !sq ? byCategory : byCategory.filter(s =>
    (s.name || '').toLowerCase().includes(sq) ||
    (s.description || '').toLowerCase().includes(sq) ||
    (s.category || '').toLowerCase().includes(sq)
  );

  const addSection = (sectionTemplate) => {
    const newSection = {
      id: Date.now(),
      templateId: sectionTemplate.id,
      name: sectionTemplate.name,
      html: sectionTemplate.html,
      fields: sectionTemplate.fields,
      data: {}
    };
    sectionTemplate.fields.forEach(field => {
      newSection.data[field.key] = field.default;
    });
    setSections(prev => [...prev, newSection]);
  };

  const updateSectionData = (sectionId, key, value) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, data: { ...section.data, [key]: value } }
        : section
    ));
  };

  const removeSection = (sectionId) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const moveSection = (index, direction) => {
    const newSections = [...sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    setSections(newSections);
  };

  const generateHTML = ({ forPreview = false } = {}) => {
    // Stock placeholders shown in the preview only — never written to the saved template
    const PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/grogoliath-img/1200/800';
    const PLACEHOLDER_VIDEO_BG = 'https://picsum.photos/seed/grogoliath-vid/1200/675';
    const placeholderVideoHtml = `<div style="position:relative;padding-bottom:56.25%;height:0;border-radius:12px;overflow:hidden;background:url('${PLACEHOLDER_VIDEO_BG}') center/cover #262626;">
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.45));display:flex;align-items:center;justify-content:center;">
    <div style="width:84px;height:84px;border-radius:50%;background:rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 28px rgba(0,0,0,0.35);">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="#111" style="margin-left:5px;"><polygon points="6,4 6,20 20,12"/></svg>
    </div>
    <div style="position:absolute;bottom:14px;left:14px;font:600 11px/1 -apple-system,BlinkMacSystemFont,sans-serif;color:#fff;background:rgba(0,0,0,0.55);padding:5px 10px;border-radius:6px;letter-spacing:.04em;">PLACEHOLDER</div>
  </div>
</div>`;

    const sectionsHTML = sections.map(section => {
      let html = section.html;

      // Strip <!--OPT:KEY-->...<!--/OPT--> blocks whose value is empty.
      // Lets users delete optional buttons / eyebrows / stats and have the markup vanish.
      html = html.replace(/<!--OPT:([A-Z0-9_]+)-->([\s\S]*?)<!--\/OPT-->/g, (_, key, content) => {
        const v = section.data[key];
        return v && String(v).trim() ? content : '';
      });

      // Iterate fields so we know each one's type — table fields need JSON → HTML conversion
      const fieldDefs = section.fields || [];
      const seen = new Set();
      fieldDefs.forEach(f => {
        seen.add(f.key);
        let val = section.data[f.key] ?? '';
        const isEmpty = !val || !String(val).trim();
        if (f.type === 'table') {
          try { val = renderTableHtml(JSON.parse(val || '{}')); } catch { val = ''; }
        } else if (f.type === 'video-url') {
          val = isEmpty ? (forPreview ? placeholderVideoHtml : '') : videoEmbed(val);
        } else if (f.type === 'image-url') {
          if (isEmpty && forPreview) val = PLACEHOLDER_IMAGE;
        }
        html = html.replace(new RegExp(`{{${f.key}}}`, 'g'), val);
      });
      // Backstop: any data keys not declared in fields (e.g. legacy templates)
      Object.keys(section.data).forEach(key => {
        if (seen.has(key)) return;
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), section.data[key] ?? '');
      });
      return html;
    }).join('\n\n');

    // Brand-color overrides — uses attribute selectors with !important to win over inline styles.
    // Targets the accent/CTA hex values used by the section library (purple, blue, indigo, green).
    const themeStyle = `
    /* Brand color override */
    [style*="background:#5b4cdb"],[style*="background: #5b4cdb"],
    [style*="background:#7c3aed"],[style*="background: #7c3aed"],
    [style*="background:#2563eb"],[style*="background: #2563eb"],
    [style*="background:#16a34a"],[style*="background: #16a34a"]{background:${theme.primary} !important}
    [style*="color:#5b4cdb"],[style*="color:#7c3aed"],[style*="color:#2563eb"],[style*="color:#16a34a"]{color:${theme.primary} !important}
    [style*="border:1px solid #5b4cdb"],[style*="border:1px solid #7c3aed"],
    [style*="border:1px solid #2563eb"],[style*="border:1px solid #16a34a"]{border-color:${theme.primary} !important}`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{KEYWORD}} - {{LOCATION}}</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1e293b; }${themeStyle}
  </style>
</head>
<body>
${sectionsHTML}
</body>
</html>`;
  };

  // Generate preview HTML with demo content.
  // For mobile device, inject CSS that forces flex columns to wrap/stack.
  const previewSrcDoc = (device = 'desktop') => {
    let html = generateHTML({ forPreview: true })
      .replace(/\{\{KEYWORD\}\}/g, 'Preview Service')
      .replace(/\{\{LOCATION\}\}/g, 'Your City')
      .replace(/\{\{[A-Z0-9_]+\}\}/g, 'Sample text');

    if (device === 'mobile') {
      const mobileOverrides = `<style id="mobile-overrides">
[style*="display:flex"],[style*="display: flex"]{flex-wrap:wrap !important;}
nav [style*="display:flex"],nav>div,[style*="justify-content:space-between"]{flex-wrap:nowrap !important;flex-direction:row !important;}
[style*="grid-template-columns"]{grid-template-columns:1fr !important;}
[style*="font-size:clamp"]{font-size:clamp(1.5rem,6vw,2.25rem) !important;}
img{max-width:100% !important;}
</style>`;
      html = html.replace('</head>', mobileOverrides + '\n</head>');
    }
    // Inject a tiny script that lets the parent preserve scroll across srcDoc reloads.
    const scrollSync = `<script>(function(){var t=null;window.addEventListener('scroll',function(){if(parent===window)return;clearTimeout(t);t=setTimeout(function(){parent.postMessage({type:'gg-preview-scroll',y:window.scrollY},'*');},80);},{passive:true});window.addEventListener('message',function(e){if(e&&e.data&&e.data.type==='gg-preview-restore'&&typeof e.data.y==='number'){window.scrollTo(0,e.data.y);}});})();</script>`;
    if (html.includes('</body>')) html = html.replace('</body>', scrollSync + '</body>');
    else html += scrollSync;
    return html;
  };

  const handleSave = async () => {
    if (!session?.user?.id) {
      alert('You must be logged in to save templates');
      return;
    }
    if (sections.length === 0) {
      alert('Please add at least one section to your template');
      return;
    }
    setSaving(true);
    try {
      const newTemplate = {
        name: templateName,
        category: templateCategory,
        structure: generateHTML(),
        user_id: session.user.id,
      };

      const insertPromise = supabase
        .from('templates')
        .insert(newTemplate)
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        });

      const data = await Promise.race([
        insertPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
      ]).catch((err) => {
        if (err.message === 'timeout') {
          // Insert is still running in background — treat as success with a local object
          return { ...newTemplate, id: `tmp-${Date.now()}` };
        }
        throw err;
      });

      clearDraft();
      if (onSave) onSave(data);
      if (onClose) onClose();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save template: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex animate-fade-in">
      {/* ── Left sidebar — Element library ─────────────────────────────── */}
      <div style={{ width: leftWidth }} className="bg-white dark:bg-[#1a1a1a] border-r border-[#e5e5e5] dark:border-[#303030] flex flex-col shrink-0">
        <div className="px-6 pt-6 pb-5 border-b border-[#ebebeb] dark:border-[#2c2c2c] flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-[#262626] dark:text-white tracking-tight mb-1">Template Builder</h2>
            {sections.length === 0 ? (
              <p className="text-xs text-[#777777] dark:text-[#888888]">Click elements to add them to your page</p>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[#777777] dark:text-[#888888]">
                {saveState === 'saving' ? (
                  <span className="inline-flex items-center gap-1.5 text-[#777777] dark:text-[#888888]">
                    <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[#075056] dark:text-[#5eead4]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#075056] dark:bg-[#5eead4]" />
                    Saved
                  </span>
                )}
                <span className="opacity-40">&middot;</span>
                <span>{sections.length} section{sections.length === 1 ? '' : 's'}</span>
              </div>
            )}
          </div>
          {setDarkMode && (
            <label className="ui-switch shrink-0 mt-1" title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              <input type="checkbox" checked={!!darkMode} onChange={() => setDarkMode(d => !d)} />
              <div className="slider" />
            </label>
          )}
        </div>

        {/* Search */}
        <div className="px-4 pt-4 pb-3">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999] dark:text-[#666666] pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="text"
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              placeholder="Search elements..."
              autoComplete="off"
              spellCheck={false}
              className="w-full pl-10 pr-9 py-2.5 bg-[#fafafa] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-xl text-[#262626] dark:text-white text-sm placeholder-[#999999] dark:placeholder-[#666666] focus:outline-none focus:border-[#075056] dark:focus:border-[#075056] focus:ring-2 focus:ring-[#075056]/20 transition-all"
            />
            {librarySearch && (
              <button
                onClick={() => setLibrarySearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#999999] hover:text-[#262626] dark:hover:text-white hover:bg-[#f0f0f0] dark:hover:bg-[#303030] transition-colors"
                title="Clear search"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category filter — custom styled select */}
        <div className="px-4 pt-1 pb-4 border-b border-[#ebebeb] dark:border-[#2c2c2c]">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#999999] dark:text-[#5a5a5a] mb-2">Filter</p>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none w-full pl-3.5 pr-10 py-2.5 bg-[#fafafa] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-xl text-[#262626] dark:text-white text-sm font-semibold focus:outline-none focus:border-[#075056] dark:focus:border-[#075056] focus:ring-2 focus:ring-[#075056]/20 cursor-pointer transition-all"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Elements' : cat}
                </option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777] dark:text-[#888888] pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {filteredSections.length === 0 ? (
            <div className="text-center py-10 px-4">
              <p className="text-sm text-[#999999] dark:text-[#666666]">No elements match &ldquo;{librarySearch}&rdquo;</p>
              <button onClick={() => { setLibrarySearch(''); setSelectedCategory('all'); }} className="mt-2 text-xs font-semibold text-[#075056] dark:text-[#5eead4] hover:underline">Reset filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filteredSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => addSection(section)}
                  title={section.description}
                  className="group flex flex-col items-center justify-center gap-3 p-3 bg-white dark:bg-[#1c1c1c] hover:bg-[#fafafa] dark:hover:bg-[#262626] hover:border-[#075056]/50 dark:hover:border-[#075056]/50 rounded-xl transition-all border border-[#e5e5e5] dark:border-[#303030] hover:shadow-[0_4px_16px_rgba(7,80,86,0.1)] dark:hover:shadow-[0_4px_16px_rgba(7,80,86,0.18)] hover:-translate-y-0.5 aspect-square"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#fafafa] dark:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#333333] flex items-center justify-center text-[#555555] dark:text-[#aaaaaa] group-hover:border-[#075056]/50 group-hover:bg-[#075056]/10 dark:group-hover:bg-[#075056]/20 group-hover:text-[#075056] dark:group-hover:text-[#5eead4] transition-all [&>svg]:w-[22px] [&>svg]:h-[22px]">
                    {SECTION_ICONS[section.id] || CATEGORY_ICONS[section.category] || section.icon}
                  </div>
                  <div className="text-[12px] font-bold text-[#262626] dark:text-white leading-tight text-center break-words px-1">
                    {section.name}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Left resize handle */}
      <div
        onMouseDown={startResize('left')}
        title="Drag to resize"
        className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-[#075056]/60 active:bg-[#075056] transition-colors"
      />

      {/* ── Center — Section editor ─────────────────────────────────────── */}
      <div className="flex-1 min-w-0 overflow-y-auto bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto px-8 py-10">
          {/* Auto-generate from URL */}
          <div className="bg-gradient-to-br from-[#075056] to-[#0f3d22] rounded-2xl p-6 mb-6 border border-[#075056] shadow-[0_8px_30px_rgba(7,80,86,0.25)] relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-white bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3v4M19 17v4M3 5h4M17 19h4M9 14l-3 3m0-3l3 3m9-9l-3 3m3-3l-3-3"/></svg>
                  AI Quickstart
                </span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight mb-1">Auto-generate from a URL</h3>
              <p className="text-sm text-white/70 mb-4">Paste a website link and we&rsquo;ll draft a layout based on it.</p>
              {/* Brand kit picker */}
              {brandKits.length > 0 && (
                <div className="mb-3 flex items-center gap-2 flex-wrap">
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/70 shrink-0">Apply brand kit</span>
                  <div className="relative">
                    <select
                      value={selectedKitId}
                      onChange={(e) => setSelectedKitId(e.target.value)}
                      disabled={autoBusy}
                      className="appearance-none pl-3 pr-9 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-xs font-semibold focus:outline-none focus:border-white/60 backdrop-blur-sm cursor-pointer transition-all disabled:opacity-50"
                    >
                      <option value="" className="text-[#111]">No brand kit</option>
                      {brandKits.map(k => (
                        <option key={k.id} value={k.id} className="text-[#111]">{k.name}</option>
                      ))}
                    </select>
                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/70 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                  {selectedKitId && (() => {
                    const k = brandKits.find(x => x.id === selectedKitId);
                    return k ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-white/80">
                        <span className="w-3 h-3 rounded-full border border-white/30" style={{ background: k.primary_color }} />
                        {k.primary_color}
                      </span>
                    ) : null;
                  })()}
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  value={autoUrl}
                  onChange={(e) => { setAutoUrl(e.target.value); if (autoError) setAutoError(null); }}
                  placeholder="https://your-site.com"
                  disabled={autoBusy}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !autoBusy) { e.preventDefault(); document.getElementById('gg-auto-go')?.click(); } }}
                  className="flex-1 min-w-[220px] px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all backdrop-blur-sm disabled:opacity-50"
                />
                <button
                  id="gg-auto-go"
                  onClick={async () => {
                    if (!autoUrl.trim() || autoBusy) return;
                    setAutoBusy(true);
                    setAutoError(null);
                    try {
                      const libraryDescriptor = sectionLibrary.map(s => ({
                        id: s.id,
                        name: s.name,
                        category: s.category,
                        description: s.description,
                        fields: s.fields.map(f => ({ key: f.key }))
                      }));
                      const selectedKit = selectedKitId ? brandKits.find(k => k.id === selectedKitId) : null;
                      const res = await apiFetch('/api/generate-template-layout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          url: autoUrl.trim(),
                          library: libraryDescriptor,
                          brandKit: selectedKit ? {
                            name: selectedKit.name,
                            primary_color: selectedKit.primary_color,
                            logo_url: selectedKit.logo_url,
                            voice: selectedKit.voice,
                          } : null,
                        })
                      });
                      const json = await res.json();
                      if (!res.ok) throw new Error(json.error || 'Generation failed');
                      const aiSections = Array.isArray(json.sections) ? json.sections : [];
                      if (aiSections.length === 0) throw new Error('No sections returned. Try a different URL.');
                      const newSections = aiSections.map((b, i) => {
                        const proto = sectionLibrary.find(s => s.id === b.sectionId);
                        if (!proto) return null;
                        const baseData = proto.fields.reduce((acc, f) => { acc[f.key] = f.default; return acc; }, {});
                        return {
                          ...proto,
                          id: `${proto.id}-${Date.now()}-${i}`,
                          data: { ...baseData, ...(b.data || {}) }
                        };
                      }).filter(Boolean);
                      if (newSections.length === 0) throw new Error('No usable sections.');
                      setSections(newSections);
                      // Auto-apply the brand kit's color to the theme too
                      if (selectedKit?.primary_color) {
                        setTheme(t => ({ ...t, primary: selectedKit.primary_color }));
                      }
                      if (!templateName.trim()) {
                        try {
                          const host = new URL(/^https?:\/\//i.test(autoUrl) ? autoUrl : `https://${autoUrl}`).hostname.replace(/^www\./, '');
                          setTemplateName(host);
                        } catch { /* ignore */ }
                      }
                    } catch (e) {
                      setAutoError(e.message || 'Something went wrong');
                    } finally {
                      setAutoBusy(false);
                    }
                  }}
                  disabled={!autoUrl.trim() || autoBusy}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#075056] text-sm font-bold rounded-xl hover:bg-white/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {autoBusy ? (
                    <>
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M13 5l7 7-7 7"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>
              {autoError && (
                <p className="text-xs text-red-200 mt-3 flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                  {autoError}
                </p>
              )}
            </div>
          </div>

          {/* Template info card */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 mb-6 border border-[#e5e5e5] dark:border-[#303030] shadow-sm">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#999999] dark:text-[#5a5a5a] mb-2">Template Name</p>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full text-2xl font-black bg-transparent border-none outline-none text-[#262626] dark:text-white mb-5 placeholder:text-[#cccccc] dark:placeholder:text-[#3e3e3e] tracking-tight"
              placeholder="Untitled Template"
            />
            <div className="flex items-end gap-6 flex-wrap">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#999999] dark:text-[#5a5a5a] mb-2">Category</p>
                <div className="relative inline-block">
                  <select
                    value={templateCategory}
                    onChange={(e) => setTemplateCategory(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 bg-[#fafafa] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-xl text-[#262626] dark:text-white text-sm font-semibold focus:outline-none focus:border-[#075056] dark:focus:border-[#075056] focus:ring-2 focus:ring-[#075056]/20 cursor-pointer transition-all min-w-[200px]"
                  >
                    <option>Custom</option>
                    <option>Local Services</option>
                    <option>SaaS &amp; Technology</option>
                    <option>E-Commerce &amp; Retail</option>
                    <option>Professional Services</option>
                    <option>Restaurant &amp; Food</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777] dark:text-[#888888] pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>

              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#999999] dark:text-[#5a5a5a] mb-2">Brand Color</p>
                <div className="flex items-center gap-2">
                  <label className="relative w-10 h-10 rounded-xl border border-[#e5e5e5] dark:border-[#333333] cursor-pointer overflow-hidden shrink-0 hover:border-[#075056] transition-colors" style={{ backgroundColor: theme.primary }}>
                    <input
                      type="color"
                      value={theme.primary}
                      onChange={(e) => setTheme(t => ({ ...t, primary: e.target.value }))}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                  <input
                    type="text"
                    value={theme.primary}
                    onChange={(e) => setTheme(t => ({ ...t, primary: e.target.value }))}
                    className="w-28 px-3 py-2.5 bg-[#fafafa] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-xl text-[#262626] dark:text-white text-sm font-mono focus:outline-none focus:border-[#075056] dark:focus:border-[#075056] focus:ring-2 focus:ring-[#075056]/20 transition-all"
                  />
                  <div className="flex items-center gap-1 ml-1">
                    {['#075056', '#2563eb', '#7c3aed', '#dc2626', '#ea580c', '#262626'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setTheme(t => ({ ...t, primary: c }))}
                        className={`w-6 h-6 rounded-full border transition-all hover:scale-110 ${theme.primary.toLowerCase() === c ? 'border-[#111] dark:border-white ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#1a1a1a] ring-[#075056]' : 'border-[#e5e5e5] dark:border-[#333333]'}`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
          {sections.length === 0 ? (
            <div className="text-center py-24 px-6 bg-white dark:bg-[#1a1a1a] rounded-2xl border-2 border-dashed border-[#e5e5e5] dark:border-[#303030]">
              <div className="w-14 h-14 rounded-2xl bg-[#fafafa] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] mx-auto mb-5 flex items-center justify-center text-[#075056] dark:text-[#5eead4]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              </div>
              <p className="text-base font-bold text-[#262626] dark:text-white tracking-tight mb-1">Start building your template</p>
              <p className="text-sm text-[#777777] dark:text-[#888888]">Pick elements from the library — Navigation first, then Hero, then any other sections.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', String(index));
                    setDragIdx(index);
                  }}
                  onDragOver={(e) => {
                    if (dragIdx === null || dragIdx === index) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverIdx !== index) setDragOverIdx(index);
                  }}
                  onDragLeave={() => {
                    if (dragOverIdx === index) setDragOverIdx(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragIdx === null || dragIdx === index) return;
                    setSections(prev => {
                      const next = [...prev];
                      const [moved] = next.splice(dragIdx, 1);
                      next.splice(index, 0, moved);
                      return next;
                    });
                    setDragIdx(null);
                    setDragOverIdx(null);
                  }}
                  onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                  className={`bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border shadow-sm transition-all ${
                    dragIdx === index
                      ? 'opacity-40 border-[#e5e5e5] dark:border-[#303030]'
                      : dragOverIdx === index
                        ? 'border-[#075056] dark:border-[#075056] shadow-[0_0_0_3px_rgba(7,80,86,0.15)]'
                        : 'border-[#e5e5e5] dark:border-[#303030] hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#f0f0f0] dark:border-[#2c2c2c]">
                    <div className="flex items-center gap-3">
                      <span className="cursor-grab active:cursor-grabbing text-[#bbbbbb] dark:text-[#555555] hover:text-[#262626] dark:hover:text-white transition-colors -ml-1" title="Drag to reorder">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="9" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/>
                          <circle cx="15" cy="6" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                        </svg>
                      </span>
                      <span className="inline-flex items-center justify-center w-7 h-7 text-[11px] font-bold rounded-lg bg-[#075056]/10 dark:bg-[#075056]/20 text-[#075056] dark:text-[#5eead4]">
                        {index + 1}
                      </span>
                      <h3 className="text-base font-bold text-[#262626] dark:text-white tracking-tight">{section.name}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#777777] dark:text-[#888888] rounded-full">
                        {section.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {index > 0 && (
                        <button
                          onClick={() => moveSection(index, 'up')}
                          title="Move up"
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] rounded-lg text-[#777777] dark:text-[#888888] hover:text-[#262626] dark:hover:text-white transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                        </button>
                      )}
                      {index < sections.length - 1 && (
                        <button
                          onClick={() => moveSection(index, 'down')}
                          title="Move down"
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] rounded-lg text-[#777777] dark:text-[#888888] hover:text-[#262626] dark:hover:text-white transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                      )}
                      <button
                        onClick={() => removeSection(section.id)}
                        title="Remove"
                        className="w-8 h-8 flex items-center justify-center text-[#999999] hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/></svg>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {section.fields.map(field => (
                      <div key={field.key}>
                        <label className="block text-[10.5px] font-bold text-[#999999] dark:text-[#5a5a5a] mb-1.5 uppercase tracking-[0.12em]">
                          {field.label}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            value={section.data[field.key] || ''}
                            onChange={(e) => updateSectionData(section.id, field.key, e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#fafafa] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-xl text-[#262626] dark:text-white text-sm resize-none focus:outline-none focus:border-[#075056] dark:focus:border-[#075056] focus:ring-2 focus:ring-[#075056]/20 transition-all"
                            rows={3}
                          />
                        ) : field.type === 'table' ? (
                          <TableEditor
                            value={section.data[field.key] || ''}
                            onChange={(v) => updateSectionData(section.id, field.key, v)}
                          />
                        ) : field.type === 'image-url' ? (
                          <ImageUrlField
                            value={section.data[field.key] || ''}
                            onChange={(v) => updateSectionData(section.id, field.key, v)}
                          />
                        ) : field.type === 'video-url' ? (
                          <input
                            type="text"
                            value={section.data[field.key] || ''}
                            onChange={(e) => updateSectionData(section.id, field.key, e.target.value)}
                            placeholder="https://youtube.com/watch?v=…"
                            className="w-full px-3.5 py-2.5 bg-[#fafafa] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-xl text-[#262626] dark:text-white text-sm focus:outline-none focus:border-[#075056] dark:focus:border-[#075056] focus:ring-2 focus:ring-[#075056]/20 transition-all"
                          />
                        ) : field.type === 'select' ? (
                          <div className="relative">
                            <select
                              value={section.data[field.key] || ''}
                              onChange={(e) => updateSectionData(section.id, field.key, e.target.value)}
                              className="appearance-none w-full pl-3.5 pr-10 py-2.5 bg-[#fafafa] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-xl text-[#262626] dark:text-white text-sm font-semibold focus:outline-none focus:border-[#075056] dark:focus:border-[#075056] focus:ring-2 focus:ring-[#075056]/20 cursor-pointer transition-all"
                            >
                              {(field.options || []).map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777] dark:text-[#888888] pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                            </svg>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={section.data[field.key] || ''}
                            onChange={(e) => updateSectionData(section.id, field.key, e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#fafafa] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-xl text-[#262626] dark:text-white text-sm focus:outline-none focus:border-[#075056] dark:focus:border-[#075056] focus:ring-2 focus:ring-[#075056]/20 transition-all"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right resize handle */}
      <div
        onMouseDown={startResize('right')}
        title="Drag to resize"
        className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-[#075056]/60 active:bg-[#075056] transition-colors"
      />

      {/* ── Right sidebar — Preview & actions ───────────────────────────── */}
      <div style={{ width: rightWidth }} className="bg-white dark:bg-[#1a1a1a] border-l border-[#e5e5e5] dark:border-[#303030] flex flex-col shrink-0">
        <div className="px-6 pt-6 pb-5 border-b border-[#ebebeb] dark:border-[#2c2c2c]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#262626] dark:text-white tracking-tight">Preview</h3>
              {sections.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.1em] bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#777777] dark:text-[#888888] rounded-full">
                  {sections.length} {sections.length === 1 ? 'section' : 'sections'}
                </span>
              )}
            </div>
            <button
              onClick={requestClose}
              className="w-9 h-9 flex items-center justify-center hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] rounded-lg text-[#777777] dark:text-[#888888] hover:text-[#262626] dark:hover:text-white transition-colors"
              title="Close (Esc)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              disabled={sections.length === 0}
              className="flex-1 px-4 py-2.5 bg-[#fafafa] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] text-[#262626] dark:text-white font-semibold rounded-xl hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] hover:border-[#d4d4d4] dark:hover:border-[#404040] transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {previewMode ? 'Hide preview' : 'Show preview'}
            </button>
            <button
              onClick={() => { setPreviewMode(true); setPreviewExpanded(true); }}
              disabled={sections.length === 0}
              title="Expand preview"
              className="px-3 py-2.5 bg-[#fafafa] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] text-[#777777] dark:text-[#888888] hover:text-[#262626] dark:hover:text-white rounded-xl hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] hover:border-[#d4d4d4] dark:hover:border-[#404040] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-[#fafafa] dark:bg-[#0a0a0a] p-3" style={{ contain: 'layout paint' }}>
          {previewMode && sections.length > 0 ? (
            <div className="w-full h-full rounded-xl overflow-hidden border border-[#e5e5e5] dark:border-[#333333] bg-white">
              <iframe
                ref={previewIframeRef}
                srcDoc={previewSrcDoc('desktop')}
                onLoad={restorePreviewScroll(previewIframeRef)}
                sandbox="allow-scripts"
                className="w-full h-full border-none block"
                title="Preview"
                style={{ transform: 'translateZ(0)', willChange: 'transform', contain: 'strict' }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#aaaaaa] dark:text-[#555555] text-sm p-8 text-center gap-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <p>{sections.length === 0 ? 'Add sections then click preview' : 'Click Show preview to render'}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-5 border-t border-[#ebebeb] dark:border-[#2c2c2c] space-y-2.5 bg-white dark:bg-[#1a1a1a]">
          <button
            onClick={handleSave}
            disabled={sections.length === 0 || saving || !templateName.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#075056] text-white text-[15px] font-bold rounded-xl hover:bg-[#064548] hover:shadow-lg hover:shadow-[#075056]/30 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200"
          >
            {saving ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Saving...
              </>
            ) : (
              <>
                Save Template
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
          {(!templateName.trim() || sections.length === 0) && (
            <p className="text-xs text-[#999999] dark:text-[#666666] text-center -mt-1">
              {!templateName.trim() ? 'Add a name to enable saving' : 'Add at least one section'}
            </p>
          )}
          <button
            onClick={requestClose}
            className="w-full px-6 py-3 bg-transparent text-[#777777] dark:text-[#888888] hover:text-[#262626] dark:hover:text-white text-sm font-semibold rounded-xl hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Close-or-minimize confirmation prompt */}
      {closePromptOpen && (
        <div
          className="fixed inset-0 z-[220] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setClosePromptOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#e5e5e5] dark:border-[#333333] shadow-[0_20px_60px_rgba(0,0,0,0.5)] max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black text-[#262626] dark:text-white tracking-tight mb-1.5">Close template builder?</h3>
            <p className="text-sm text-[#777777] dark:text-[#888888] mb-5">Your work is auto-saved. Pick what you&rsquo;d like to do.</p>
            <div className="space-y-2.5 mb-4">
              <button
                onClick={minimizeBuilder}
                className="w-full text-left flex items-start gap-3 p-3.5 bg-[#075056]/5 dark:bg-[#075056]/10 hover:bg-[#075056]/10 dark:hover:bg-[#075056]/20 border border-[#075056]/30 hover:border-[#075056] rounded-xl transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#075056] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#262626] dark:text-white">Minimize for later</div>
                  <div className="text-xs text-[#777777] dark:text-[#888888] mt-0.5">Restore from the corner anytime - nothing is lost.</div>
                </div>
              </button>
              <button
                onClick={discardAndClose}
                className="w-full text-left flex items-start gap-3 p-3.5 bg-red-50/50 dark:bg-red-500/5 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/30 hover:border-red-400 dark:hover:border-red-500/60 rounded-xl transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/></svg>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-red-600 dark:text-red-400">Discard &amp; close</div>
                  <div className="text-xs text-red-500/80 dark:text-red-400/80 mt-0.5">
                    Your draft will be permanently deleted - you&rsquo;ll start from scratch.
                  </div>
                </div>
              </button>
            </div>
            <button
              onClick={() => setClosePromptOpen(false)}
              className="w-full px-4 py-2.5 bg-transparent text-[#777777] dark:text-[#888888] hover:text-[#262626] dark:hover:text-white text-sm font-semibold rounded-xl hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-all"
            >
              Keep building
            </button>
          </div>
        </div>
      )}

      {/* Expanded preview modal */}
      {previewExpanded && (
        <div className="fixed inset-0 z-[210] bg-black/90 flex flex-col animate-fade-in">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#1a1a1a] border-b border-[#303030] shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-white font-bold text-sm tracking-tight">Preview</span>
              {/* Device toggle */}
              <div className="flex items-center gap-0.5 p-1 bg-[#262626] border border-[#303030] rounded-full">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    previewDevice === 'desktop'
                      ? 'bg-gradient-to-b from-[#075056] to-[#064548] text-white shadow-[0_2px_8px_rgba(7,80,86,0.4)]'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path strokeLinecap="round" d="M8 21h8M12 17v4" />
                  </svg>
                  Desktop
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    previewDevice === 'mobile'
                      ? 'bg-gradient-to-b from-[#075056] to-[#064548] text-white shadow-[0_2px_8px_rgba(7,80,86,0.4)]'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
                  </svg>
                  Mobile
                </button>
              </div>
            </div>
            <button
              onClick={() => setPreviewExpanded(false)}
              className="w-9 h-9 flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors"
              title="Close (Esc)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal body */}
          <div className="flex-1 overflow-auto bg-[#0a0a0a] flex items-start justify-center py-8 px-6">
            {sections.length > 0 ? (
              <div
                style={{
                  width: previewDevice === 'mobile' ? '390px' : '100%',
                  maxWidth: previewDevice === 'mobile' ? '390px' : '1280px',
                  minHeight: '100%',
                  background: '#fff',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  borderRadius: previewDevice === 'mobile' ? '20px' : '12px',
                  overflow: 'hidden',
                  border: '1px solid #333333',
                }}
              >
                <iframe
                  ref={expandedIframeRef}
                  srcDoc={previewSrcDoc(previewDevice)}
                  onLoad={restorePreviewScroll(expandedIframeRef)}
                  sandbox="allow-scripts"
                  style={{ width: '100%', height: '100%', minHeight: '800px', border: 'none', display: 'block', transform: 'translateZ(0)', willChange: 'transform', contain: 'strict' }}
                  title="Preview Expanded"
                />
              </div>
            ) : (
              <div className="text-[#666666] text-sm mt-24">Add sections to see a preview</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
