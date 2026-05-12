"use client";

import { useEffect, useRef, useState } from "react";
import TemplateModal from "./components/builder/TemplateModal";
import MarbleAvatar from "./components/MarbleAvatar";
import GenerateModal from "./components/modals/GenerateModal";
import SimpleNewProject from "./components/modals/SimpleNewProject";
import ViewModal from "./components/modals/ViewModal";
import DashboardView from "./components/views/DashboardView";
import ProjectsView from "./components/views/ProjectsView";
import TemplatesView from "./components/views/TemplatesView";
import BrandKitView from "./components/views/BrandKitView";
import SettingsView from "./components/views/SettingsView";
import OnboardingWizard from "./components/OnboardingWizard";
import SuccessScreen from "./components/SuccessScreen";
import DeployOptions from "./components/DeployOptions";
import { ensureProfile } from "../lib/profile";
import { supabase } from "../lib/supabaseClient";
import ErrorBoundary from "./components/ErrorBoundary";
import Loader from "./components/Loader";

function LoginScreen() {
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const isSignup = mode === "signup";

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim() || null },
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
          },
        });
        if (error) throw error;
        setInfo("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err?.message || String(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1c1c1c] flex">
      {/* Left: form */}
      <div className="flex-1 flex flex-col px-6 sm:px-10 lg:px-16 py-8 lg:py-12 overflow-y-auto">
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center">
          {/* Logo — sits right above the heading */}
          <div className="mb-8 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/grogoliath_horizontal_transparent_2400x900.png" alt="GroGoliath" className="h-12 w-auto dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/GroGoliath_Dark_C_BrandTeal.png" alt="GroGoliath" className="h-12 w-auto hidden dark:block" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#262626] dark:text-white tracking-[-0.02em] leading-tight mb-2">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-base text-[#666666] dark:text-[#bbbbbb] mb-8 leading-relaxed">
            {isSignup
              ? "Sign up to start your 30-day free trial. No card required."
              : "Sign in to keep building SEO pages that rank."}
          </p>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-xl text-sm font-semibold text-[#262626] dark:text-white hover:bg-[#fafafa] dark:hover:bg-[#2a2a2a] hover:border-[#d4d4d4] dark:hover:border-[#444444] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.4h5.9c-.3 1.4-1 2.6-2.2 3.4v2.8h3.6c2.1-1.9 3.2-4.7 3.2-8.3z"/>
              <path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.8c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8C4.1 20.6 7.8 23 12 23z"/>
              <path fill="#FBBC05" d="M6 14.3c-.2-.7-.4-1.4-.4-2.3s.1-1.6.4-2.3V6.9H2.3C1.5 8.4 1 10.1 1 12s.5 3.6 1.3 5.1L6 14.3z"/>
              <path fill="#EA4335" d="M12 5.4c1.6 0 3 .5 4.1 1.6l3.1-3.1C17.4 2.1 14.9 1 12 1 7.8 1 4.1 3.4 2.3 6.9L6 9.7c.9-2.5 3.2-4.3 6-4.3z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#e5e5e5] dark:bg-[#333333]" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#aaaaaa] dark:text-[#666666]">or</span>
            <div className="flex-1 h-px bg-[#e5e5e5] dark:bg-[#333333]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#666666] dark:text-[#bbbbbb] mb-2">
                  Name <span className="text-[#dc2626] dark:text-[#f87171] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#333333] rounded-xl text-sm text-[#262626] dark:text-white placeholder:text-[#bbbbbb] dark:placeholder:text-[#555555] focus:outline-none focus:border-[#075056] dark:focus:border-[#5eead4] focus:ring-4 focus:ring-[#075056]/10 transition-all"
                />
              </div>
            )}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#666666] dark:text-[#bbbbbb] mb-2">
                Email <span className="text-[#dc2626] dark:text-[#f87171] ml-0.5">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-white dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#333333] rounded-xl text-sm text-[#262626] dark:text-white placeholder:text-[#bbbbbb] dark:placeholder:text-[#555555] focus:outline-none focus:border-[#075056] dark:focus:border-[#5eead4] focus:ring-4 focus:ring-[#075056]/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#666666] dark:text-[#bbbbbb] mb-2">
                Password <span className="text-[#dc2626] dark:text-[#f87171] ml-0.5">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignup ? "At least 6 characters" : "Enter your password"}
                required
                autoComplete={isSignup ? "new-password" : "current-password"}
                className="w-full px-4 py-3 bg-white dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#333333] rounded-xl text-sm text-[#262626] dark:text-white placeholder:text-[#bbbbbb] dark:placeholder:text-[#555555] focus:outline-none focus:border-[#075056] dark:focus:border-[#5eead4] focus:ring-4 focus:ring-[#075056]/10 transition-all"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}
            {info && (
              <div className="px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900 text-sm text-emerald-700 dark:text-emerald-300">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#262626] dark:bg-white text-white dark:text-[#262626] text-sm font-bold rounded-xl hover:bg-[#1a1a1a] dark:hover:bg-[#f5f5f5] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading && (
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? (isSignup ? "Creating…" : "Signing in…") : (isSignup ? "Create Account" : "Sign In")}
            </button>
          </form>

          <p className="mt-6 text-sm text-[#666666] dark:text-[#bbbbbb] text-center">
            {isSignup ? "Already have an account? " : "New here? "}
            <button
              type="button"
              onClick={() => { setMode(isSignup ? "signin" : "signup"); setError(""); setInfo(""); }}
              className="text-[#075056] dark:text-[#5eead4] font-semibold hover:underline"
            >
              {isSignup ? "Sign in" : "Create an account"}
            </button>
          </p>
        </div>
      </div>

      {/* Right: gradient panel with floating cards (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#075056] m-4 rounded-3xl">
        {/* Animated swirling gradient backdrop */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(60% 50% at 20% 30%, rgba(94,234,212,0.55) 0%, rgba(94,234,212,0) 60%),
              radial-gradient(50% 40% at 80% 25%, rgba(20,184,166,0.45) 0%, rgba(20,184,166,0) 60%),
              radial-gradient(70% 60% at 50% 80%, rgba(7,80,86,0.85) 0%, rgba(7,80,86,0) 60%),
              radial-gradient(40% 35% at 90% 75%, rgba(94,234,212,0.35) 0%, rgba(94,234,212,0) 60%),
              linear-gradient(135deg, #075056 0%, #053a3e 50%, #0a6b73 100%)
            `,
          }}
        />

        {/* Floating dummy cards (replace with rotating set later) */}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-12">
          <div className="relative w-full max-w-md aspect-[4/5]">
            {/* Top stats chip */}
            <div className="absolute top-0 left-0 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 animate-fade-in animate-float-slow">
              <div className="w-9 h-9 rounded-xl bg-[#075056] text-white flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18M7 14l4-4 4 4 6-6"/></svg>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#888888]">Indexed</div>
                <div className="text-base font-black text-[#262626]">+1,247 pages</div>
              </div>
            </div>

            {/* Quote card */}
            <div className="absolute top-[28%] right-0 w-[78%] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-5 animate-fade-in animate-float-medium" style={{ animationDelay: '0.1s, 0.8s' }}>
              <p className="text-base font-bold text-[#075056] leading-snug mb-3">
                &ldquo;GroGoliath ranked us on page 1 for 240 location keywords in three months.&rdquo;
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5eead4] to-[#075056] flex items-center justify-center text-white text-xs font-bold">
                  AM
                </div>
                <div>
                  <div className="text-xs font-bold text-[#262626]">Alex Morgan</div>
                  <div className="text-[10px] text-[#888888]">Head of Growth, Northwind</div>
                </div>
              </div>
            </div>

            {/* Growth card */}
            <div className="absolute bottom-0 left-[10%] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-5 w-[68%] animate-fade-in animate-float-fast" style={{ animationDelay: '0.2s, 1.5s' }}>
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#888888] mb-1">Organic traffic</div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-black text-[#262626]">+312%</div>
                <div className="text-xs font-semibold text-[#075056]">last month</div>
              </div>
              <div className="mt-3 h-1 rounded-full bg-[#f0f0f0] overflow-hidden">
                <div className="h-full w-[78%] bg-gradient-to-r from-[#075056] to-[#5eead4] rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-left tagline */}
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5eead4] mb-1.5">Programmatic SEO</p>
          <p className="text-2xl font-black tracking-tight leading-tight">
            Hundreds of pages.<br />One brand voice.
          </p>
        </div>
      </div>
    </div>
  );
}

// Sidebar profile chip. Click anywhere on it = a random fun animation.
// (Logout still lives in Settings.) Double-click opens Settings as a shortcut.
const AVATAR_ANIMATIONS = [
  'animate-avatar-pop',
  'animate-avatar-spin',
  'animate-avatar-flip',
  'animate-avatar-jelly',
  'animate-avatar-shake',
  'animate-avatar-heartbeat',
  'animate-avatar-tada',
  'animate-avatar-rubber',
];

function SidebarProfile({ session, profile, onOpenSettings }) {
  const [anim, setAnim] = useState('');
  const lastAnimRef = useRef('');

  const fullName =
    profile?.full_name ||
    session?.user?.user_metadata?.full_name ||
    session?.user?.email?.split('@')[0] ||
    'You';
  const email = session?.user?.email || '';
  const seed = session?.user?.id || email || fullName;

  const avatarUrl =
    profile?.avatar_url ||
    session?.user?.user_metadata?.avatar_url ||
    session?.user?.user_metadata?.picture;

  const playRandomAnim = () => {
    // Pick a new animation different from the last one.
    let next;
    do {
      next = AVATAR_ANIMATIONS[Math.floor(Math.random() * AVATAR_ANIMATIONS.length)];
    } while (next === lastAnimRef.current && AVATAR_ANIMATIONS.length > 1);
    lastAnimRef.current = next;
    setAnim('');
    requestAnimationFrame(() => setAnim(next));
    setTimeout(() => setAnim(''), 900);
  };

  return (
    <div className="border-t border-[#ebebeb] dark:border-[#262626] px-4 py-4">
      <button
        type="button"
        onClick={playRandomAnim}
        onDoubleClick={onOpenSettings}
        title="Double-click for settings"
        className="flex items-center gap-3 w-full text-left rounded-xl p-1 -m-1 hover:bg-[#fafafa] dark:hover:bg-[#222222] transition-colors"
      >
        <div className={`w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 ring-white dark:ring-[#075056]/30 ${anim}`}>
          {avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatarUrl}
              alt="avatar"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling && (e.currentTarget.nextSibling.style.display = 'block'); }}
              className="w-full h-full object-cover"
            />
          ) : null}
          <div style={{ display: avatarUrl ? 'none' : 'block' }} className="w-full h-full">
            <MarbleAvatar seed={seed} size={36} className="w-full h-full block" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#262626] dark:text-white truncate leading-tight">
            {fullName}
          </p>
          {email && (
            <p className="text-[11px] text-[#888888] dark:text-[#888888] truncate leading-tight mt-0.5">
              {email}
            </p>
          )}
        </div>
      </button>
    </div>
  );
}

export default function App() {
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved !== null ? saved === 'true' : false;
    }
    return false;
  });

  // Sync dark class to <html> so all screens (login, wizard, etc.) get dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Queue status lifted here so it survives tab switches
  const [queueStatus, setQueueStatus] = useState({ running: false, done: 0, total: 0, projectName: '', projectId: null, currentItem: null });

  // Read current nav state from URL
  const getNavFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      tab: params.get('tab') || 'dashboard',
      wizard: params.get('wizard') === 'true',
    };
  };

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") return "dashboard";
    // If a Template Builder draft survived a refresh, force back to Templates so it can reopen
    try {
      if (localStorage.getItem("gg-template-builder-draft")) return "templates";
    } catch { /* ignore */ }
    return getNavFromUrl().tab;
  });

  // Navigate to a tab — pushes a real history entry + refreshes that tab's data
  // Also dispatches gg-navigate so views can re-sync state from the URL (since
  // pushState does NOT fire popstate, views otherwise miss the change).
  const handleSetActiveTab = (tab) => {
    setActiveTab(tab);
    window.history.pushState({ tab }, '', `?tab=${tab}`);
    window.dispatchEvent(new Event('gg-navigate'));
    if (tab === 'projects') fetchProjects(false);
    if (tab === 'templates') fetchTemplates();
    if (tab === 'dashboard') fetchProjects(false);
  };

  // Replace current history entry without adding one (used internally)
  const replaceTab = (tab) => {
    setActiveTab(tab);
    window.history.replaceState({ tab }, '', `?tab=${tab}`);
    window.dispatchEvent(new Event('gg-navigate'));
  };

  const [pendingProjectId, setPendingProjectId] = useState(null);
  const [pendingTemplate, setPendingTemplate] = useState(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [viewProject, setViewProject] = useState(null);
  const [generateProject, setGenerateProject] = useState(null);
  const [editProjectData, setEditProjectData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState(null); // null = not yet fetched
  const [generateTemplateId, setGenerateTemplateId] = useState("");
  const [autoStartFirstDraft, setAutoStartFirstDraft] = useState(false);
  const [generationExpandSignal, setGenerationExpandSignal] = useState(0);
  // Onboarding / success flow
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [wizardMinimized, setWizardMinimized] = useState(false);
  const [minimizedDraftSummary, setMinimizedDraftSummary] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeploy, setShowDeploy] = useState(false);
  const [wizardResult, setWizardResult] = useState(null); // { project, pages, totalPages }

  const [_templatesRefreshKey, setTemplatesRefreshKey] = useState(0);

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

  // On first load, surface a Resume pill if a wizard draft is sitting in localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('gg-wizard-draft');
      if (raw) {
        const d = JSON.parse(raw);
        setMinimizedDraftSummary({
          name: d.businessType || d.keyword || 'Untitled project',
          step: typeof d.currentStep === 'number' ? d.currentStep : 1,
        });
        setWizardMinimized(true);
      }
    } catch { /* ignore */ }
  }, []);

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
        fetchTemplates();
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

    // Global back/forward handler — reads URL and syncs React state
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const wizard = params.get('wizard') === 'true';
      const tab = params.get('tab') || 'dashboard';

      if (wizard) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
        setActiveTab(tab);
      }
    };

    window.addEventListener('popstate', onPopState);

    return () => {
      if (unsubscribe?.unsubscribe) unsubscribe.unsubscribe();
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  const fetchProjects = async (firstLoad = false) => {
    try {
      const result = await Promise.race([
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
      ]);
      if (result.data) {
        setProjects(result.data);
        const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true';
        if (firstLoad && result.data.length === 0 && !hasCompletedOnboarding && !hasSeenOnboarding) setShowOnboarding(true);
      }
    } catch {
      // timed out — keep existing projects state
    }
  };

  const fetchTemplates = async () => {
    try {
      const result = await Promise.race([
        supabase.from('templates').select('*').order('created_at', { ascending: false }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
      ]);
      const userTemplates = (result.data || []).map(t => ({ ...t, _isUserTemplate: true }));
      setTemplates(userTemplates);
    } catch {
      setTemplates([]); // fall back to empty — starters are added in TemplatesView
    }
  };

  const handleOnboardingComplete = (result) => {
    setShowOnboarding(false);
    setShowSuccess(false);
    setWizardResult(null);
    setPendingTemplate(null);
    localStorage.setItem('hasSeenOnboarding', 'true');
    if (result !== null) {
      localStorage.setItem('hasCompletedOnboarding', 'true');
      // Optimistically add the new project immediately so it shows up without waiting for a fetch
      if (result.project) {
        setProjects(prev => [result.project, ...prev.filter(p => p.id !== result.project.id)]);
      }
      // Refetch immediately and again after a short delay — Supabase background writes may
      // not be queryable on the very next request, so a second pass catches them.
      fetchProjects(false);
      setTimeout(() => fetchProjects(false), 1500);
      setTimeout(() => fetchProjects(false), 4000);
    }
    replaceTab('projects');
  };

  const handleNewProject = () => {
    setShowOnboarding(true);
    setShowSuccess(false);
    setShowDeploy(false);
    window.history.pushState({ wizard: true }, '', '?wizard=true');
  };

  const handleUseTemplate = (template) => {
    setPendingTemplate(template);
    handleNewProject();
  };

  const handleLogout = async () => await supabase.auth.signOut();

  if (loading) return <Loader />;
  if (!session) return <LoginScreen />;
  if (showOnboarding) return (
    <OnboardingWizard
      session={session}
      onComplete={(result) => {
        setWizardMinimized(false);
        setMinimizedDraftSummary(null);
        handleOnboardingComplete(result);
      }}
      onMinimize={() => {
        // Read a quick summary of the draft so the resume pill can label itself
        try {
          const raw = localStorage.getItem('gg-wizard-draft');
          if (raw) {
            const d = JSON.parse(raw);
            setMinimizedDraftSummary({
              name: d.businessType || d.keyword || 'Untitled project',
              step: typeof d.currentStep === 'number' ? d.currentStep : 1,
            });
          }
        } catch { /* ignore */ }
        setShowOnboarding(false);
        setWizardMinimized(true);
      }}
      initialTemplate={pendingTemplate}
    />
  );
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
      <div className="flex h-screen bg-[#f5f5f5] dark:bg-[#1c1c1c] text-[#262626] dark:text-white font-sans">
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

        <aside className="w-64 bg-white dark:bg-[#262626] border-r border-[#ebebeb] dark:border-[#262626] flex flex-col shrink-0" style={{ paddingTop: '24px' }}>

          {/* Logo */}
          <div className="px-3 pt-1 pb-6">
            <img src="/grogoliath_horizontal_transparent_2400x900.png" alt="GroGoliath" className="w-full h-auto dark:hidden" />
            <img src="/GroGoliath_Dark_C_BrandTeal.png" alt="GroGoliath" className="w-full h-auto hidden dark:block" />
          </div>

          <nav className="flex-1 px-3 pb-3 flex flex-col gap-1 overflow-y-auto">

            {/* New Project button */}
            <button onClick={handleNewProject}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 mb-5 bg-[#075056] hover:bg-[#064548] text-white text-[15px] font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-[#075056]/30"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              New Project
            </button>

            {/* MENU */}
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-[#aaaaaa] dark:text-[#555555]">Menu</p>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></> },
              { id: 'projects', label: 'Projects', icon: <><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></> },
              { id: 'templates', label: 'Templates', icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></> },
              { id: 'brandkit', label: 'Brand Kit', icon: <><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 22a10 10 0 0 1-4-19.5A10 10 0 0 1 22 12c0 1-.7 2-2 2h-2a2 2 0 0 0-2 2 4 4 0 0 1-4 6z"/></> },
            ].map(({ id, label, icon }) => (
              <button key={id} onClick={() => { setPendingProjectId(null); handleSetActiveTab(id); }}
                className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium transition-all ${activeTab === id ? 'text-[#262626] dark:text-white bg-[#f5f5f5] dark:bg-[#262626]' : 'text-[#777777] dark:text-[#888888] hover:text-[#262626] dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#262626]'}`}
              >
                {activeTab === id && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#075056] dark:bg-[#14b8a6] rounded-r-full" />}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                {label}
              </button>
            ))}

            {/* CONFIG */}
            <p className="px-3 pt-6 pb-2 text-[11px] font-semibold uppercase tracking-widest text-[#aaaaaa] dark:text-[#555555]">Config</p>
            <button onClick={() => handleSetActiveTab('settings')}
              className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium transition-all ${activeTab === 'settings' ? 'text-[#262626] dark:text-white bg-[#f5f5f5] dark:bg-[#262626]' : 'text-[#777777] dark:text-[#888888] hover:text-[#262626] dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#262626]'}`}
            >
              {activeTab === 'settings' && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#075056] dark:bg-[#14b8a6] rounded-r-full" />}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
              </svg>
              Settings
            </button>
          </nav>

          {/* User profile at bottom */}
          <SidebarProfile
            session={session}
            profile={profile}
            onOpenSettings={() => handleSetActiveTab('settings')}
          />
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden bg-[#f5f5f5] dark:bg-[#1c1c1c] relative">
          {/* Dark mode toggle — top right */}
          <div className="absolute top-5 right-14 z-50">
            <label className="ui-switch">
              <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(d => !d)} />
              <div className="slider" />
            </label>
          </div>

          {/* All views always mounted — hidden via CSS so state (incl. queues) survives tab switches */}
          <div className={`flex-1 overflow-auto ${activeTab === 'dashboard' ? '' : 'hidden'}`}>
            <DashboardView
              projects={projects}
              onNewProject={handleNewProject}
              onTemplates={() => handleSetActiveTab('templates')}
              onProjectsTab={() => handleSetActiveTab('projects')}
              onProjectClick={(project) => { setPendingProjectId(project.id); handleSetActiveTab('projects'); }}
              session={session}
              profile={profile}
            />
          </div>
          <div className={`flex-1 overflow-auto ${activeTab === 'projects' ? '' : 'hidden'}`}>
            <ProjectsView
              projects={projects}
              session={session}
              onNewProject={handleNewProject}
              onRefresh={() => fetchProjects(false)}
              onQueueUpdate={setQueueStatus}
              initialProjectId={pendingProjectId}
            />
          </div>
          <div className={`flex-1 overflow-auto ${activeTab === 'templates' ? '' : 'hidden'}`}>
            <TemplatesView
              user={session.user}
              session={session}
              templates={templates}
              onTemplateAdded={(t) => setTemplates(prev => [{ ...t, _isUserTemplate: true }, ...(prev || [])])}
              onTemplateDeleted={(id) => setTemplates(prev => (prev || []).filter(t => t.id !== id))}
              onRefresh={fetchTemplates}
              onUseTemplate={handleUseTemplate}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          </div>
          <div className={`flex-1 overflow-auto ${activeTab === 'brandkit' ? '' : 'hidden'}`}>
            <BrandKitView session={session} profile={profile} />
          </div>
          <div className={`flex-1 overflow-auto ${activeTab === 'settings' ? '' : 'hidden'}`}>
            <SettingsView email={session.user.email} onLogout={handleLogout} profile={profile} session={session} onProfileUpdate={(updated) => setProfile(prev => ({ ...prev, ...updated }))} />
          </div>
        </main>
      </div>

      {/* Minimized wizard — floating Resume pill */}
      {wizardMinimized && !showOnboarding && (
        <div className="fixed bottom-6 right-6 z-[150] animate-fade-in">
          <button
            onClick={() => {
              setShowOnboarding(true);
              setWizardMinimized(false);
            }}
            className="group flex items-center gap-3 pl-3 pr-5 py-3 bg-white dark:bg-[#262626] border border-[#d4d4d4] dark:border-[#3a3a3a] rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_40px_rgba(7,80,86,0.2)] dark:hover:shadow-[0_12px_40px_rgba(7,80,86,0.35)] hover:-translate-y-0.5 hover:border-[#075056] transition-all"
            title="Resume project setup"
          >
            <div className="w-9 h-9 rounded-full bg-[#075056] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
            <div className="text-left min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#075056] dark:text-[#14b8a6] leading-none mb-1">Project setup</div>
              <div className="text-sm font-bold text-[#262626] dark:text-white truncate max-w-[220px] leading-none">
                {minimizedDraftSummary?.name || 'Resume'}
              </div>
              {minimizedDraftSummary?.step ? (
                <div className="text-[11px] text-slate-500 dark:text-[#fbfbfb] mt-1 leading-none">
                  Paused at step {minimizedDraftSummary.step} · auto-saved
                </div>
              ) : null}
            </div>
          </button>
        </div>
      )}

      {!!generateProject && (generationCenter.isGenerating || generationCenter.isMinimized || generationCenter.awaitingConfirm) && (
        <div className="fixed bottom-4 right-4 z-[95] w-[340px] rounded-2xl border border-slate-200 dark:border-[#303030] bg-white dark:bg-[#1c1c1c] shadow-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider dark:text-[#fbfbfb]">Generation Center</p>
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
          <div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-[#303030] overflow-hidden">
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
          <div className="mt-2 text-xs text-slate-500 dark:text-[#fbfbfb]">
            Progress: {generationCenter.progress?.current || 0}/{generationCenter.progress?.total || 0}
            {generationCenter.etaSeconds ? ` · ETA ~${Math.ceil(generationCenter.etaSeconds / 60)}m` : ""}
          </div>
          {generationCenter.awaitingConfirm && (
            <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">First draft ready. Open generator and click Generate Remaining.</div>
          )}
          {generationCenter.isMinimized && generationCenter.isGenerating && (
            <div className="mt-2 text-xs text-slate-500 dark:text-[#fbfbfb]">
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
      {/* Floating queue widget — visible when generating and user is on another tab */}
      {queueStatus.running && activeTab !== 'projects' && (
        <div className="fixed bottom-6 right-6 z-[95] w-80 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#303030] rounded-2xl shadow-2xl shadow-black/10 overflow-hidden">
          <div className="h-1 bg-slate-100 dark:bg-[#303030]">
            <div
              className="h-full bg-[#5b4cdb] transition-all duration-500"
              style={{ width: `${queueStatus.total > 0 ? Math.round((queueStatus.done / queueStatus.total) * 100) : 0}%` }}
            />
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#5b4cdb] animate-pulse shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">Generating pages…</p>
              </div>
              <span className="text-xs font-semibold text-slate-400 shrink-0 dark:text-[#fbfbfb]">{queueStatus.done}/{queueStatus.total}</span>
            </div>
            {queueStatus.currentItem && (
              <p className="text-xs text-slate-500 dark:text-[#fbfbfb] ml-4 mb-3 truncate">
                {queueStatus.currentItem.keyword} / {queueStatus.currentItem.location}
              </p>
            )}
            <p className="text-xs text-slate-400 ml-4 mb-3 dark:text-[#fbfbfb]">{queueStatus.projectName}</p>
            <button
              onClick={() => handleSetActiveTab('projects')}
              className="w-full px-4 py-2 bg-[#5b4cdb] text-white text-xs font-bold rounded-xl hover:bg-[#4a3dc4] transition-colors"
            >
              View Progress →
            </button>
          </div>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}
