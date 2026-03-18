"use client";

import React, { useEffect, useState } from "react";
import TemplateModal from "./components/builder/TemplateModal";
import GenerateModal from "./components/modals/GenerateModal";
import SimpleNewProject from "./components/modals/SimpleNewProject";
import ViewModal from "./components/modals/ViewModal";
import DashboardView from "./components/views/DashboardView";
import ProjectsView from "./components/views/ProjectsView";
import TemplatesView from "./components/views/TemplatesView";
import SettingsView from "./components/views/SettingsView";
import OnboardingWizard from "./components/OnboardingWizard";
import SuccessScreen from "./components/SuccessScreen";
import DeployOptions from "./components/DeployOptions";
import { ensureProfile } from "../lib/profile";
import { supabase } from "../lib/supabaseClient";
import { LogOut } from "lucide-react";
import ErrorBoundary from "./components/ErrorBoundary";

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg w-full max-w-md border dark:border-slate-700">
        <h1 className="text-2xl font-bold mb-6 text-center">GroGoliath</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-3 border rounded dark:bg-slate-700 dark:text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-3 border rounded dark:bg-slate-700 dark:text-white"
        />
        <button onClick={handleLogin} disabled={loading} className="w-full bg-[#5b4cdb] text-white p-3 rounded font-bold hover:bg-[#4a3dc4]">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("activeTab") || "dashboard";
    return "dashboard";
  });
  const [darkMode] = useState(false);

  const handleSetActiveTab = (tab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") localStorage.setItem("activeTab", tab);
  };

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [viewProject, setViewProject] = useState(null);
  const [generateProject, setGenerateProject] = useState(null);
  const [editProjectData, setEditProjectData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [generateTemplateId, setGenerateTemplateId] = useState("");
  const [autoStartFirstDraft, setAutoStartFirstDraft] = useState(false);
  const [generationExpandSignal, setGenerationExpandSignal] = useState(0);
  // Onboarding / success flow
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeploy, setShowDeploy] = useState(false);
  const [wizardResult, setWizardResult] = useState(null); // { project, pages, totalPages }

  const [templatesRefreshKey, setTemplatesRefreshKey] = useState(0);

  const [generationCenter, setGenerationCenter] = useState({
    projectId: null,
    projectName: "",
    isGenerating: false,
    isMinimized: false,
    awaitingConfirm: false,
    progress: { current: 0, total: 0 },
    etaSeconds: null
  });

  const resetGenerationCenter = () => {
    setGenerationCenter({
      projectId: null,
      projectName: "",
      isGenerating: false,
      isMinimized: false,
      awaitingConfirm: false,
      progress: { current: 0, total: 0 },
      etaSeconds: null
    });
  };

  useEffect(() => {
    let unsubscribe;

    const initAuth = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      setSession(session);

      if (session) {
        const profileData = await ensureProfile(session.user);
        setProfile(profileData);

        fetchProjects(true);
      }

      setLoading(false);

      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange(async (_event, session2) => {
        setSession(session2);

        if (session2) {
          const profileData = await ensureProfile(session2.user);
          setProfile(profileData);

          fetchProjects();
        } else {
          setProfile(null);
        }
      });

      unsubscribe = subscription;
    };

    initAuth();

    return () => {
      if (unsubscribe?.unsubscribe) {
        unsubscribe.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    const viewProjectId = localStorage.getItem('viewProjectId');
    if (viewProjectId) {
      localStorage.removeItem('viewProjectId');
      handleSetActiveTab('projects');
    }
  }, [session]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['dashboard', 'projects', 'templates', 'settings'].includes(tab)) {
      handleSetActiveTab(tab);
    }
  }, []);

  const fetchProjects = async (firstLoad = false) => {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (data) {
      setProjects(data);
      // Auto-launch wizard for first-time users
      const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true';
      if (firstLoad && data.length === 0 && !hasCompletedOnboarding && !hasSeenOnboarding) setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = (result) => {
    if (result === null) {
      setShowOnboarding(false);
      setActiveTab('dashboard');
      localStorage.setItem('hasSeenOnboarding', 'true');
    } else {
      setWizardResult(result);
      setShowSuccess(true);
      fetchProjects(false);
      if (result.project?.id) {
        localStorage.setItem('lastCreatedProject', result.project.id);
      }
    }
  };

  const handleNewProject = () => {
    setShowOnboarding(true);
    setShowSuccess(false);
    setShowDeploy(false);
  };

  const handleLogout = async () => await supabase.auth.signOut();

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400">Loading...</div>;
  if (!session) return <LoginScreen />;
  if (showOnboarding) return <OnboardingWizard session={session} onComplete={handleOnboardingComplete} />;
  if (showSuccess) return (
    <SuccessScreen
      project={wizardResult?.project}
      pages={wizardResult?.pages ?? []}
      onDeploy={() => { setShowSuccess(false); setShowDeploy(true); }}
      onView={() => { setShowSuccess(false); handleSetActiveTab("projects"); }}
      onDownload={() => { setShowSuccess(false); handleSetActiveTab("projects"); }}
      onDashboard={() => { setShowSuccess(false); setWizardResult(null); fetchProjects(); }}
    />
  );
  if (showDeploy) return (
    <DeployOptions
      project={wizardResult?.project}
      pages={wizardResult?.pages ?? []}
      onBack={() => { setShowDeploy(false); setShowSuccess(true); }}
    />
  );

  return (
    <ErrorBoundary>
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen bg-[#fafbfc] dark:bg-[#0f0f10] text-slate-900 dark:text-slate-100 font-sans">
        <SimpleNewProject
          isOpen={isUploadModalOpen || !!editProjectData}
          onClose={() => {
            setIsUploadModalOpen(false);
            setEditProjectData(null);
          }}
          session={session}
          onSuccess={() => {
            fetchProjects();
            handleSetActiveTab("projects");
          }}
        />

        <ViewModal
          isOpen={!!viewProject}
          onClose={() => setViewProject(null)}
          project={viewProject}
          onProjectUpdate={(p) => {
            setProjects(projects.map((pr) => (pr.id === p.id ? p : pr)));
          }}
        />

        <GenerateModal
          isOpen={!!generateProject}
          onClose={() => {
            setGenerateProject(null);
            setGenerateTemplateId("");
            setAutoStartFirstDraft(false);
            resetGenerationCenter();
          }}
          project={generateProject}
          onUpdateSuccess={fetchProjects}
          profile={profile}
          session={session}
          setProfile={setProfile}
          initialTemplateId={generateTemplateId}
          autoStartFirstDraft={autoStartFirstDraft}
          onStatusChange={(status) => setGenerationCenter((prev) => ({ ...prev, ...status }))}
          expandSignal={generationExpandSignal}
        />

        <TemplateModal
          isOpen={isTemplateModalOpen || !!editTemplate || !!previewTemplate}
          onClose={() => {
            setIsTemplateModalOpen(false);
            setEditTemplate(null);
            setPreviewTemplate(null);
          }}
          initialData={editTemplate || previewTemplate}
          mode={previewTemplate ? previewTemplate.mode : editTemplate ? "edit" : "create"}
          onSaveSuccess={() => setTemplatesRefreshKey((k) => k + 1)}
          profile={profile}
        />

        <aside className="w-64 bg-white dark:bg-[#0f0f10] border-r border-slate-200 dark:border-[#27272a] flex flex-col shrink-0 p-8">
          {/* Logo */}
          <div className="mb-12">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">GroGoliath</div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            <button
              onClick={() => handleSetActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#f2f1fe] dark:bg-[#5b4cdb]/10 text-[#5b4cdb]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#27272a]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </button>

            <button
              onClick={() => handleSetActiveTab('projects')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'projects'
                  ? 'bg-[#f2f1fe] dark:bg-[#5b4cdb]/10 text-[#5b4cdb]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#27272a]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Projects
            </button>

            <button
              onClick={() => handleSetActiveTab('templates')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'templates'
                  ? 'bg-[#f2f1fe] dark:bg-[#5b4cdb]/10 text-[#5b4cdb]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#27272a]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              Templates
            </button>

            <div className="pt-4">
              <button
                onClick={handleNewProject}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#5b4cdb] to-[#4a3dc4] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#5b4cdb]/30 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Project
              </button>
            </div>

            <div className="flex-1" />

            <button
              onClick={() => handleSetActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#f2f1fe] dark:bg-[#5b4cdb]/10 text-[#5b4cdb]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#27272a]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
          </nav>

          <div className="border-t border-slate-200 dark:border-[#27272a] pt-6">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-sm font-medium"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white dark:bg-[#18181b] border-b border-slate-200 dark:border-[#27272a] flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-4 text-slate-400">
              <span className="text-sm font-medium">Organization</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">GroGoliath HQ</span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-[#27272a]">
                <div className="w-8 h-8 bg-[#5b4cdb] rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {session.user.email[0].toUpperCase()}
                </div>
                <div className="hidden md:block text-sm">
                  <p className="font-medium text-slate-700 dark:text-slate-200">{session.user.email}</p>
                  <p className="text-xs text-slate-400">Admin</p>
                </div>
              </div>
            </div>
          </header>

          <div key={activeTab} className="flex-1 overflow-auto animate-fade-in">
            {activeTab === "dashboard" && (
              <DashboardView
                projects={projects}
                onNewProject={handleNewProject}
                session={session}
              />
            )}

            {activeTab === "projects" && (
              <ProjectsView
                projects={projects}
                onNewProject={handleNewProject}
                onRefresh={() => fetchProjects(false)}
              />
            )}

            {activeTab === "templates" && (
              <TemplatesView
                user={session.user}
                session={session}
                onRefresh={() => setTemplatesRefreshKey(k => k + 1)}
              />
            )}

            {activeTab === "settings" && (
              <SettingsView email={session.user.email} onLogout={handleLogout} profile={profile} />
            )}
          </div>
        </main>
      </div>

      {!!generateProject && (generationCenter.isGenerating || generationCenter.isMinimized || generationCenter.awaitingConfirm) && (
        <div className="fixed bottom-4 right-4 z-[95] w-[340px] rounded-2xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#18181b] shadow-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Generation Center</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {generationCenter.projectName || generateProject?.name}
              </p>
            </div>
            {!generationCenter.isGenerating && !generationCenter.awaitingConfirm && (
              <button
                onClick={() => {
                  setGenerateProject(null);
                  setGenerateTemplateId("");
                  setAutoStartFirstDraft(false);
                  resetGenerationCenter();
                }}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Dismiss
              </button>
            )}
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-[#27272a] overflow-hidden">
            <div
              className="h-full bg-[#5b4cdb] transition-all duration-300"
              style={{
                width: `${
                  generationCenter.progress?.total > 0
                    ? (generationCenter.progress.current / generationCenter.progress.total) * 100
                    : 0
                }%`
              }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Progress: {generationCenter.progress?.current || 0}/{generationCenter.progress?.total || 0}
            {generationCenter.etaSeconds ? ` · ETA ~${Math.ceil(generationCenter.etaSeconds / 60)}m` : ""}
          </div>
          {generationCenter.awaitingConfirm && (
            <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">First draft ready. Open generator and click Generate Remaining.</div>
          )}
          {generationCenter.isMinimized && generationCenter.isGenerating && (
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Generating in the background. You can keep working and check Projects anytime.
            </div>
          )}
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => setGenerationExpandSignal((n) => n + 1)}
              className="px-3 py-1.5 text-xs rounded-lg bg-[#5b4cdb] text-white hover:bg-[#4a3dc4] transition-colors"
            >
              Open Generator
            </button>
          </div>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}
