'use client';

export default function DashboardView({ projects, onNewProject, session }) {
  const totalProjects = projects?.length || 0;
  const totalPages = projects?.reduce((sum, p) => sum + (p.row_count || 0), 0) || 0;
  const recentProjects = projects?.slice(0, 3) || [];

  return (
    <div className="p-8 animate-fade-in">
      {/* Welcome header */}
      <div className="mb-12">
        <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-3">
          Welcome back! 👋
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400">
          Ready to create more SEO-optimized pages?
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="p-8 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-3xl">
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            Total Projects
          </div>
          <div className="text-5xl font-black text-slate-900 dark:text-white mb-1">
            {totalProjects}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Active campaigns
          </div>
        </div>

        <div className="p-8 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-3xl">
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            Total Pages
          </div>
          <div className="text-5xl font-black text-[#5b4cdb] mb-1">
            {totalPages}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Generated with AI
          </div>
        </div>

        <div className="p-8 bg-gradient-to-br from-[#5b4cdb] to-[#4a3dc4] text-white rounded-3xl">
          <div className="text-sm font-bold text-purple-100 uppercase tracking-wide mb-2">
            Live Sites
          </div>
          <div className="text-5xl font-black mb-1">
            {totalProjects}
          </div>
          <div className="text-sm text-purple-100">
            Ready to deploy
          </div>
        </div>
      </div>

      {/* Recent projects or empty state */}
      {totalProjects > 0 ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              Recent Projects
            </h2>
            <button
              onClick={onNewProject}
              className="px-6 py-3 bg-gradient-to-r from-[#5b4cdb] to-[#4a3dc4] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#5b4cdb]/30 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Project
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="p-6 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-2xl hover:shadow-lg hover:border-[#5b4cdb] transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                      {project.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(project.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold rounded-full">
                    {project.status || 'Draft'}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {project.row_count || 0} pages
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-[#5b4cdb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
            No projects yet
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Create your first project and start generating SEO-optimized pages in minutes
          </p>
          <button
            onClick={onNewProject}
            className="px-12 py-5 bg-gradient-to-r from-[#5b4cdb] to-[#4a3dc4] text-white text-xl font-black rounded-2xl hover:shadow-2xl hover:shadow-[#5b4cdb]/30 hover:scale-105 transition-all"
          >
            ➕ Create Your First Project
          </button>
        </div>
      )}
    </div>
  );
}
