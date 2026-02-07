"use client";

import React, { useEffect, useState } from "react";
import TemplateModal from "./components/builder/TemplateModal";
import GenerateModal from "./components/modals/GenerateModal";
import NewProjectModal from "./components/modals/NewProjectModal";
import ViewModal from "./components/modals/ViewModal";
import DashboardView from "./components/views/DashboardView";
import ProjectsView from "./components/views/ProjectsView";
import DatasetsView from "./components/views/DatasetsView";
import TemplatesView from "./components/views/TemplatesView";
import SettingsView from "./components/views/SettingsView";
import { ensureProfile } from "../lib/profile";
import { supabase } from "../lib/supabaseClient";
import {
  LayoutDashboard,
  FileText,
  Database,
  Settings,
  Layers,
  LogOut,
  Moon,
  Sun
} from "lucide-react";

function NavItem({ icon: Icon, label, active, onClick, expanded }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
        active
          ? "bg-[#2B5E44]/10 text-[#2B5E44] dark:bg-[#2B5E44]/25 dark:text-emerald-300"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
      } ${!expanded ? "justify-center" : ""}`}
    >
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      {expanded && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
}

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
        <button onClick={handleLogin} disabled={loading} className="w-full bg-[#2B5E44] text-white p-3 rounded font-bold hover:bg-[#234d37]">
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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [viewProject, setViewProject] = useState(null);
  const [generateProject, setGenerateProject] = useState(null);
  const [editProjectData, setEditProjectData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [templatesRefreshKey, setTemplatesRefreshKey] = useState(0);
  const [initialTemplateId, setInitialTemplateId] = useState("");
  const [generateTemplateId, setGenerateTemplateId] = useState("");
  const [autoStartFirstDraft, setAutoStartFirstDraft] = useState(false);
  const [generationExpandSignal, setGenerationExpandSignal] = useState(0);
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

        fetchProjects();
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
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (data) setProjects(data);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this project?")) {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) alert("Error deleting project: " + error.message);
      else fetchProjects();
    }
  };

  const handleLogout = async () => await supabase.auth.signOut();

  const handleTemplatePreview = (template, mode) => {
    setEditTemplate(null);
    setIsTemplateModalOpen(false);
    setPreviewTemplate({ ...template, mode });
  };

  const handleNewTemplate = () => {
    setPreviewTemplate(null);
    setEditTemplate(null);
    setIsTemplateModalOpen(true);
  };

  const handleEditTemplate = (template) => {
    setPreviewTemplate(null);
    setEditTemplate(template);
    setIsTemplateModalOpen(true);
  };

  const handleUseTemplate = (template) => {
    setInitialTemplateId(String(template?.id || ""));
    setIsUploadModalOpen(true);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400">Loading...</div>;
  if (!session) return <LoginScreen />;

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen bg-gradient-to-br from-[#f4f8f5] via-white to-[#edf6f0] dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        <NewProjectModal
          isOpen={isUploadModalOpen || !!editProjectData}
          onClose={() => {
            setIsUploadModalOpen(false);
            setEditProjectData(null);
            setInitialTemplateId("");
          }}
          onUploadSuccess={fetchProjects}
          onCreateProject={(project, templateId) => {
            setGenerateProject(project);
            setGenerateTemplateId(templateId || "");
            setAutoStartFirstDraft(true);
            setActiveTab("projects");
          }}
          onOpenTemplateBuilder={() => {
            setIsUploadModalOpen(false);
            setEditProjectData(null);
            handleNewTemplate();
          }}
          initialData={editProjectData}
          initialTemplateId={initialTemplateId}
          profile={profile}
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

        <aside className={`${isSidebarOpen ? "w-64" : "w-20"} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 z-20`}>
          <div
            className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700 cursor-pointer"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <div className="w-8 h-8 bg-[#2B5E44] rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-[#2B5E44]/30">G</div>
            {isSidebarOpen && <span className="ml-3 font-bold text-lg tracking-tight">GroGoliath</span>}
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <NavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === "dashboard"} expanded={isSidebarOpen} onClick={() => setActiveTab("dashboard")} />
            <NavItem icon={Layers} label="Projects" active={activeTab === "projects"} expanded={isSidebarOpen} onClick={() => setActiveTab("projects")} />
            <NavItem icon={Database} label="Datasets" active={activeTab === "datasets"} expanded={isSidebarOpen} onClick={() => setActiveTab("datasets")} />
            <NavItem icon={FileText} label="Templates" active={activeTab === "templates"} expanded={isSidebarOpen} onClick={() => setActiveTab("templates")} />
            <NavItem icon={Settings} label="Settings" active={activeTab === "settings"} expanded={isSidebarOpen} onClick={() => setActiveTab("settings")} />
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${!isSidebarOpen ? "justify-center" : ""}`}
            >
              {darkMode ? <Sun size={20} className="text-slate-400" /> : <Moon size={20} className="text-slate-400" />}
              {isSidebarOpen && <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{darkMode ? "Light Mode" : "Dark Mode"}</span>}
            </button>

            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 w-full p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors ${!isSidebarOpen ? "justify-center" : ""}`}
            >
              <LogOut size={20} />
              {isSidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white/90 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 sticky top-0 z-10 backdrop-blur-sm">
            <div className="flex items-center gap-4 text-slate-500">
              <span className="text-sm font-medium">Organization</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">GroGoliath HQ</span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 bg-gradient-to-tr from-[#2B5E44] to-[#3d7a5b] rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {session.user.email[0].toUpperCase()}
                </div>
                <div className="hidden md:block text-sm">
                  <p className="font-medium text-slate-700 dark:text-slate-200">{session.user.email}</p>
                  <p className="text-xs text-slate-400">Admin</p>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-8">
            {activeTab === "dashboard" && (
              <DashboardView
                projects={projects}
                profile={profile}
                onNewProject={() => setIsUploadModalOpen(true)}
                onOpenTemplates={() => setActiveTab("templates")}
              />
            )}

            {activeTab === "projects" && (
              <ProjectsView
                projects={projects}
                onDelete={handleDelete}
                onView={setViewProject}
                onGenerate={(p) => {
                  setGenerateProject(p);
                  setGenerateTemplateId("");
                  setAutoStartFirstDraft(false);
                }}
                onEdit={(p) => setEditProjectData(p)}
              />
            )}

            {activeTab === "datasets" && <DatasetsView user={session.user} />}

            {activeTab === "templates" && (
              <TemplatesView
                user={session.user}
                onNewTemplate={handleNewTemplate}
                onPreview={handleTemplatePreview}
                onEditTemplate={handleEditTemplate}
                onUseTemplate={handleUseTemplate}
                refreshKey={templatesRefreshKey}
              />
            )}

            {activeTab === "settings" && (
              <SettingsView email={session.user.email} onLogout={handleLogout} profile={profile} />
            )}
          </div>
        </main>
      </div>

      {!!generateProject && (generationCenter.isGenerating || generationCenter.isMinimized || generationCenter.awaitingConfirm) && (
        <div className="fixed bottom-4 right-4 z-[95] w-[340px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase font-bold text-slate-500">Generation Center</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
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
          <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2B5E44] to-[#3d7a5b] transition-all duration-300"
              style={{
                width: `${
                  generationCenter.progress?.total > 0
                    ? (generationCenter.progress.current / generationCenter.progress.total) * 100
                    : 0
                }%`
              }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
            Progress: {generationCenter.progress?.current || 0}/{generationCenter.progress?.total || 0}
            {generationCenter.etaSeconds ? ` - ETA ~${Math.ceil(generationCenter.etaSeconds / 60)}m` : ""}
          </div>
          {generationCenter.awaitingConfirm && (
            <div className="mt-2 text-xs text-amber-600">First draft ready. Open generator and click Generate Remaining.</div>
          )}
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => setGenerationExpandSignal((n) => n + 1)}
              className="px-3 py-1.5 text-xs rounded bg-[#2B5E44] text-white hover:bg-[#234d37]"
            >
              Open Generator
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
