'use client';

function Icon({ d, children, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {d ? <path d={d} /> : children}
    </svg>
  );
}

function getProjectIcon(name = '') {
  const n = name.toLowerCase();
  if (/kitchen|cook|chef|food|restaurant|cafe|bistro|pizza|burger|bakery|catering/.test(n)) return '🍳';
  if (/travel|trip|tour|flight|hotel|airbnb|vacation|holiday|resort|cruise|booking/.test(n)) return '✈️';
  if (/plumb|pipe|drain|water|sewer/.test(n)) return '🔧';
  if (/electr|wiring|power|lighting/.test(n)) return '⚡';
  if (/landscape|garden|lawn|mow|tree|plant|outdoor/.test(n)) return '🌿';
  if (/clean|maid|janitor|sanitize|pressure wash/.test(n)) return '🧹';
  if (/legal|law|attorney|lawyer|solicitor/.test(n)) return '⚖️';
  if (/dental|dentist|teeth|orthodon/.test(n)) return '🦷';
  if (/medical|health|doctor|clinic|physio|therapy|hospital/.test(n)) return '🏥';
  if (/real estate|property|home|house|apartment|realty|mortgage/.test(n)) return '🏠';
  if (/auto|car|vehicle|garage|mechanic|tyre|tire|motor/.test(n)) return '🚗';
  if (/tech|software|it |computer|digital|web|app|dev/.test(n)) return '💻';
  if (/fitness|gym|personal train|yoga|pilates|sport/.test(n)) return '💪';
  if (/beauty|salon|hair|nail|spa|barber|makeup/.test(n)) return '✂️';
  if (/pet|dog|cat|vet|animal|grooming/.test(n)) return '🐾';
  if (/education|school|tutor|learn|academy|college|university/.test(n)) return '📚';
  if (/financ|account|tax|bookkeep|insur/.test(n)) return '💰';
  if (/construc|build|renovat|contractor|roofi|flooring|paint/.test(n)) return '🏗️';
  if (/hvac|heating|cooling|air con|furnace|boiler/.test(n)) return '❄️';
  if (/moving|removal|storage|logistics|deliver/.test(n)) return '📦';
  if (/photo|video|film|media|studio/.test(n)) return '📷';
  if (/security|cctv|alarm|locksmith/.test(n)) return '🔒';
  return '📄';
}

function useGreeting(name) {
  const hour = new Date().getHours();
  const firstName = (name || '').split(' ')[0] || 'there';
  if (hour >= 5 && hour < 12)  return { greeting: `Good morning, ${firstName}`, sub: "Let's get some pages ranking today." };
  if (hour >= 12 && hour < 17) return { greeting: `Good afternoon, ${firstName}`, sub: "Hope the campaigns are performing well." };
  if (hour >= 17 && hour < 21) return { greeting: `Good evening, ${firstName}`, sub: "Wrapping up for the day?" };
  return { greeting: `Working late, ${firstName}?`, sub: "Don't forget to rest. The rankings will still be there tomorrow." };
}

// Full-bleed day/night header that reflects the active theme. Pure CSS — every
// layer transitions on the `.dark` class flip, so toggling gives a smooth
// sunrise/sunset. A bottom mask fades the whole scene into the page background
// so it blends seamlessly instead of sitting in a hard-edged box. The greeting
// renders on top of it. Non-interactive (the real toggle lives in the header).
function DayNightBand({ greeting, sub }) {
  // [leftPercent, topPx] — spread across the full width.
  const stars = [
    [10, 34], [22, 58], [34, 26], [46, 48], [55, 70], [63, 30],
    [71, 54], [78, 22], [85, 64], [90, 40], [95, 74], [16, 80],
  ];
  return (
    <div className="relative -mx-6 -mt-12 h-[160px] overflow-hidden flex items-center" aria-hidden={false}>
      {/* Scene — masked to fade into the page bg at the bottom */}
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, #000 52%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, #000 52%, transparent 100%)',
        }}
      >
        <style>{`@keyframes gg-twinkle { 0%,100%{opacity:.3} 50%{opacity:1} }`}</style>

        {/* Sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-[#eef6f2]
                        dark:from-[#0a1026] dark:via-[#121a36] dark:to-[#18213f]
                        transition-[background-image] duration-700 ease-in-out" />

        {/* Stars — fade in for night */}
        <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-700">
          {stars.map(([x, y], i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{ left: `${x}%`, top: y, width: 2, height: 2, animation: `gg-twinkle ${2 + (i % 4) * 0.5}s ease-in-out ${i * 0.25}s infinite` }}
            />
          ))}
        </div>

        {/* Sun ↔ Moon — sits in the upper-right (clear of the header toggle) */}
        <div className="absolute right-[13%] top-[26px]">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full bg-amber-300 dark:bg-slate-100
                            shadow-[0_0_44px_rgba(251,191,36,0.7)] dark:shadow-[0_0_30px_rgba(255,255,255,0.5)]
                            transition-[background-color,box-shadow] duration-700" />
            {/* Crescent shadow — only visible at night */}
            <div className="absolute -top-1.5 right-[-9px] w-10 h-10 rounded-full bg-[#0d1430]
                            opacity-0 dark:opacity-100 transition-opacity duration-700" />
          </div>
        </div>

        {/* Rolling hills — full width */}
        <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <ellipse cx="300" cy="330" rx="780" ry="180"
                   className="fill-emerald-300/90 dark:fill-[#11243b] transition-[fill] duration-700" />
          <ellipse cx="980" cy="350" rx="780" ry="170"
                   className="fill-emerald-400/90 dark:fill-[#0b1a2e] transition-[fill] duration-700" />
        </svg>
      </div>

      {/* Greeting — vertically centered on top of the scene */}
      <div className="relative z-10 px-6 w-full">
        <h1 className="text-4xl font-black text-[#262626] dark:text-white tracking-tight mb-1">
          {greeting}
        </h1>
        <p className="text-sm text-[#5a5a5a] dark:text-[#aab2cc]">{sub}</p>
      </div>
    </div>
  );
}

function ActionStat({ label, value, hint, hintTone, onClick, accent }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`group p-5 bg-white dark:bg-[#262626] border border-[#ebebeb] dark:border-[#333333] rounded-xl text-left flex items-center justify-between transition-all ${onClick ? 'hover:border-[#075056] dark:hover:border-[#075056] hover:-translate-y-0.5 cursor-pointer' : ''}`}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#aaaaaa] dark:text-[#777777] mb-1.5">{label}</p>
        <p className="text-3xl font-black text-[#262626] dark:text-white leading-none mb-1.5 tabular-nums">{value}</p>
        {hint && (
          <p className={`text-xs ${hintTone === 'warn' ? 'text-[#075056] dark:text-[#5eead4] font-semibold' : 'text-[#777777] dark:text-[#888888]'}`}>
            {hint}
          </p>
        )}
      </div>
      {accent && (
        <div className="w-10 h-10 rounded-xl bg-[#075056]/10 dark:bg-[#5eead4]/10 text-[#075056] dark:text-[#5eead4] flex items-center justify-center shrink-0 group-hover:bg-[#075056]/20 transition-colors">
          {accent}
        </div>
      )}
    </Tag>
  );
}

function ContinueCard({ project, onResume, onNewProject }) {
  if (!project) {
    return (
      <div className="p-6 sm:p-8 bg-gradient-to-br from-[#075056] to-[#064548] dark:from-[#075056] dark:to-[#053a3e] border border-[#075056] rounded-2xl flex items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-white text-2xl shrink-0">✨</div>
        <div className="flex-1 min-w-0">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#5eead4] mb-1">Get started</p>
          <p className="text-xl font-black text-white tracking-tight mb-1">Build your first page</p>
          <p className="text-sm text-white/70">Generate an SEO-optimized page in under a minute.</p>
        </div>
        <button
          onClick={onNewProject}
          className="hidden sm:flex items-center gap-2 px-5 py-3 bg-white text-[#075056] text-sm font-bold rounded-xl hover:bg-[#5eead4] transition-colors shrink-0"
        >
          New project
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </button>
      </div>
    );
  }

  const created = new Date(project.created_at);
  const days = Math.max(0, Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)));
  const ago = days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;
  const isDraft = project.status !== 'Live';

  return (
    <button
      onClick={() => onResume?.(project)}
      className="group w-full p-6 sm:p-8 bg-gradient-to-br from-[#075056] to-[#064548] dark:from-[#075056] dark:to-[#053a3e] border border-[#075056] rounded-2xl text-left flex items-center gap-6 hover:shadow-[0_12px_40px_rgba(7,80,86,0.35)] hover:-translate-y-0.5 transition-all"
    >
      <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-2xl shrink-0">{getProjectIcon(project.name)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#5eead4]">Pick up where you left off</p>
          {isDraft && <span className="text-[10px] font-bold uppercase tracking-wider text-[#5eead4] bg-[#5eead4]/10 px-2 py-0.5 rounded-full">Draft</span>}
        </div>
        <p className="text-xl font-black text-white tracking-tight mb-1 truncate">{project.name}</p>
        <p className="text-sm text-white/70">
          {project.row_count || 0} {(project.row_count || 0) === 1 ? 'page' : 'pages'} · last edited {ago.toLowerCase()}
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-2 px-5 py-3 bg-white text-[#075056] text-sm font-bold rounded-xl group-hover:bg-[#5eead4] transition-colors shrink-0">
        Resume
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
      </div>
    </button>
  );
}

export default function DashboardView({ projects, onNewProject, onTemplates, onProjectClick, onProjectsTab, session, profile }) {
  const allProjects = projects || [];
  const totalProjects = allProjects.length;
  const totalPages = allProjects.reduce((sum, p) => sum + (p.row_count || 0), 0);

  const drafts = allProjects.filter(p => (p.status || 'Draft') !== 'Live');
  const liveProjects = allProjects.filter(p => p.status === 'Live');

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const pagesThisMonth = allProjects
    .filter(p => new Date(p.created_at) >= monthStart)
    .reduce((sum, p) => sum + (p.row_count || 0), 0);

  // Most recent project (drafts preferred) — anchors the "continue" card
  const sortedByDate = [...allProjects].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const continueProject = sortedByDate.find(p => (p.status || 'Draft') !== 'Live') || sortedByDate[0] || null;

  const recentProjects = allProjects.slice(0, 5);

  const name = profile?.full_name || session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0];
  const { greeting, sub } = useGreeting(name);

  const goToProjects = onProjectsTab || onNewProject;

  return (
    <div className="px-6 pb-6 flex flex-col gap-5" style={{ paddingTop: '48px' }}>
      {/* Day/night header band (greeting renders inside) */}
      <DayNightBand greeting={greeting} sub={sub} />

      {/* Continue where you left off */}
      <ContinueCard project={continueProject} onResume={onProjectClick} onNewProject={onNewProject} />

      {/* Action stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ActionStat
          label="Drafts to finish"
          value={drafts.length}
          hint={drafts.length > 0 ? 'Tap to view all' : 'Nothing pending. Nice.'}
          hintTone={drafts.length > 0 ? 'warn' : undefined}
          onClick={drafts.length > 0 ? goToProjects : undefined}
          accent={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
            </svg>
          }
        />
        <ActionStat
          label="Pages this month"
          value={pagesThisMonth}
          hint={`${totalPages} total across ${totalProjects} project${totalProjects === 1 ? '' : 's'}`}
          accent={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18M7 14l4-4 4 4 6-6"/>
            </svg>
          }
        />
        <ActionStat
          label="Live sites"
          value={liveProjects.length}
          hint={liveProjects.length > 0 ? 'Live and ranking' : 'Deploy a draft to go live'}
          accent={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
            </svg>
          }
        />
      </div>

      {/* Recent projects table */}
      <div className="bg-white dark:bg-[#262626] border border-[#ebebeb] dark:border-[#333333] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5">
          <p className="text-base font-semibold text-[#262626] dark:text-white">Recent projects</p>
          <button onClick={goToProjects} className="text-sm text-[#075056] dark:text-[#14b8a6] hover:opacity-80 transition-opacity">
            View all projects →
          </button>
        </div>
        {recentProjects.length === 0 ? (
          <p className="text-sm text-center py-10 text-[#aaaaaa] dark:text-[#555555]">No projects yet</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-t border-[#ebebeb] dark:border-[#333333]">
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#aaaaaa] dark:text-[#555555]">Project</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#aaaaaa] dark:text-[#555555]">Created</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#aaaaaa] dark:text-[#555555]">Pages</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#aaaaaa] dark:text-[#555555]">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebebeb] dark:divide-[#333333]">
              {recentProjects.map((p) => (
                <tr key={p.id} onClick={() => onProjectClick?.(p)} className="hover:bg-[#fafafa] dark:hover:bg-[#1c1c1c] transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#333333]/20 dark:bg-[#333333] flex items-center justify-center text-base shrink-0">
                        {getProjectIcon(p.name)}
                      </div>
                      <span className="text-sm font-semibold text-[#262626] dark:text-white">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#777777] dark:text-[#888888]">
                    {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#777777] dark:text-[#888888]">
                    {p.row_count || 0} {(p.row_count || 0) === 1 ? 'page' : 'pages'}
                  </td>
                  <td className="px-6 py-4">
                    {p.status === 'Live' ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#14b8a6]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]" />
                        Live
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#f5f5f5] dark:bg-[#333333] text-[#777777] dark:text-[#888888]">
                        {p.status || 'Draft'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#aaaaaa] dark:text-[#555555] hover:text-[#262626] dark:hover:text-white transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onNewProject}
          className="p-6 bg-white dark:bg-[#262626] border border-[#ebebeb] dark:border-[#333333] rounded-xl text-left hover:border-[#075056] dark:hover:border-[#075056] transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#075056]/10 dark:bg-[#075056]/20 flex items-center justify-center text-[#075056] dark:text-[#14b8a6] mb-4 group-hover:bg-[#075056]/20 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          </div>
          <p className="text-base font-bold text-[#262626] dark:text-white mb-1">Generate pages</p>
          <p className="text-sm text-[#777777] dark:text-[#888888]">Create SEO-optimized pages with AI in seconds</p>
        </button>
        <button
          onClick={onTemplates}
          className="p-6 bg-white dark:bg-[#262626] border border-[#ebebeb] dark:border-[#333333] rounded-xl text-left hover:border-[#075056] dark:hover:border-[#075056] transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#333333]/30 dark:bg-[#333333] flex items-center justify-center text-[#777777] dark:text-[#888888] mb-4 group-hover:bg-[#333333]/50 dark:group-hover:bg-[#3a3a3a] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          </div>
          <p className="text-base font-bold text-[#262626] dark:text-white mb-1">Browse templates</p>
          <p className="text-sm text-[#777777] dark:text-[#888888]">Start from proven layouts that convert</p>
        </button>
      </div>
    </div>
  );
}
