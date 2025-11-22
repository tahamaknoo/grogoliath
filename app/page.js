"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; 
import { 
  LayoutDashboard, FileText, Database, Settings, Zap, BarChart3, Plus, 
  Search, Bell, User, ChevronDown, MoreHorizontal, ArrowUpRight, 
  ArrowDownRight, Layers, Globe, Moon, Sun, CheckCircle2, AlertCircle, 
  TrendingUp, Target, LogOut, Mail, Loader2
} from 'lucide-react';

// --- 1. Login Component ---
const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    // Send Magic Link
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Check your email for the login link!' });
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 text-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-indigo-600/20 mx-auto mb-6">G</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome back</h1>
        <p className="text-slate-500 mb-8">Sign in to access your GroGoliath dashboard</p>

        <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Mail size={20} />}
            {loading ? 'Sending Link...' : 'Send Magic Link'}
          </button>
        </form>

        {message && <div className={`mt-4 p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{message.text}</div>}
        
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-slate-800 text-slate-500">Or continue with</span></div>
        </div>

        <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white font-medium py-3 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-all">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
          Google
        </button>
      </div>
    </div>
  );
};

// --- 2. Dashboard Components ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm ${className}`}>{children}</div>
);

const Badge = ({ children, type = "neutral" }) => {
  const styles = {
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    neutral: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    primary: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type] || styles.neutral}`}>{children}</span>;
};

// --- 3. Main App Logic ---
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // AUTH CHECK: This runs when the page loads
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // FIX: Changed from onAuthStateChanged to onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  // LOADING STATE
  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400 animate-pulse">Loading GroGoliath...</div>;
  }

  // LOGIN GATE: If no session, show Login Screen
  if (!session) {
    return <LoginScreen />;
  }

  // DASHBOARD: If session exists, show Dashboard
  const userEmail = session.user.email;
  const stats = [
    { label: 'Total Pages Generated', value: '12,405', change: '+12%', trend: 'up', icon: FileText },
    { label: 'Total Keywords', value: '15,200', change: '+8.4%', trend: 'up', icon: Target },
    { label: 'Avg. Keyword Difficulty', value: '14', change: '-2%', trend: 'down', icon: BarChart3 },
    { label: 'Est. Monthly Traffic', value: '45.2k', change: '+22%', trend: 'up', icon: TrendingUp },
  ];
  const projects = [
    { id: 1, name: 'Best Coffee Near Me', pages: 4500, status: 'Live', lastRun: '2h ago', platform: 'Wordpress' },
    { id: 2, name: 'SaaS Alternatives', pages: 120, status: 'Building', lastRun: 'Just now', platform: 'Webflow' },
    { id: 3, name: 'Local Plumbers Dir', pages: 8900, status: 'Paused', lastRun: '3d ago', platform: 'Next.js' },
  ];

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300`}>
          <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/20">G</div>
              {isSidebarOpen && <span className="font-bold text-lg tracking-tight">GroGoliath</span>}
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <NavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} expanded={isSidebarOpen} onClick={() => setActiveTab('dashboard')} />
            <NavItem icon={Layers} label="Projects" active={activeTab === 'projects'} expanded={isSidebarOpen} onClick={() => setActiveTab('projects')} />
            <NavItem icon={Database} label="Datasets" active={activeTab === 'datasets'} expanded={isSidebarOpen} onClick={() => setActiveTab('datasets')} />
            <NavItem icon={FileText} label="Templates" active={activeTab === 'templates'} expanded={isSidebarOpen} onClick={() => setActiveTab('templates')} />
            <div className="pt-4 pb-2">
              {isSidebarOpen && <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Settings</p>}
            </div>
            <NavItem icon={Settings} label="Configuration" active={activeTab === 'settings'} expanded={isSidebarOpen} onClick={() => setActiveTab('settings')} />
            <NavItem icon={User} label="Account" active={activeTab === 'account'} expanded={isSidebarOpen} onClick={() => setActiveTab('account')} />
          </nav>
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <button onClick={toggleTheme} className={`flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${!isSidebarOpen ? 'justify-center' : ''}`}>
              {darkMode ? <Sun size={20} className="text-slate-400" /> : <Moon size={20} className="text-slate-400" />}
              {isSidebarOpen && <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>
            <button onClick={handleLogout} className={`flex items-center gap-3 w-full p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <LogOut size={20} />
              {isSidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
            </button>
          </div>
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8">
            <div className="flex items-center gap-4 text-slate-500">
              <span className="text-sm font-medium">Organization</span>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">GroGoliath HQ</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {userEmail?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block text-sm">
                  <p className="font-medium text-slate-700 dark:text-slate-200">{userEmail}</p>
                  <p className="text-xs text-slate-400">Admin</p>
                </div>
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h1>
                  <p className="text-slate-500 mt-1">Here's what's happening with your GroGoliath sites.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-indigo-600/20"><Plus size={18} />New Project</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-start justify-between">
                      <div><p className="text-sm font-medium text-slate-500">{stat.label}</p><h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</h3></div>
                      <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"><stat.icon size={20} /></div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      {stat.trend === 'up' && <span className="text-emerald-600 flex items-center gap-1"><ArrowUpRight size={16} /> {stat.change}</span>}
                      {stat.trend === 'down' && <span className="text-red-500 flex items-center gap-1"><ArrowDownRight size={16} /> {stat.change}</span>}
                      {stat.trend === 'neutral' && <span className="text-slate-500">{stat.change}</span>}
                      <span className="text-slate-400">vs last month</span>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between"><h2 className="font-semibold text-slate-900 dark:text-white">Active Deployments</h2><button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</button></div>
                    <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500"><tr><th className="px-6 py-4 font-medium">Project Name</th><th className="px-6 py-4 font-medium">Status</th><th className="px-6 py-4 font-medium">Pages</th><th className="px-6 py-4 font-medium">Platform</th><th className="px-6 py-4 font-medium text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-200 dark:divide-slate-700">{projects.map((project) => (<tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"><td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{project.name}</td><td className="px-6 py-4"><Badge type={project.status === 'Live' ? 'success' : project.status === 'Building' ? 'primary' : 'neutral'}>{project.status}</Badge></td><td className="px-6 py-4 text-slate-600 dark:text-slate-300">{project.pages.toLocaleString()}</td><td className="px-6 py-4 text-slate-600 dark:text-slate-300 flex items-center gap-2">{project.platform}</td><td className="px-6 py-4 text-right"><button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><MoreHorizontal size={18} /></button></td></tr>))}</tbody></table></div>
                  </Card>
                </div>
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">System Status</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-500" /><div className="flex-1"><p className="text-sm font-medium text-slate-700 dark:text-slate-200">OpenAI API</p><p className="text-xs text-slate-500">Operational</p></div></div>
                      <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-500" /><div className="flex-1"><p className="text-sm font-medium text-slate-700 dark:text-slate-200">Database (Supabase)</p><p className="text-xs text-slate-500">Operational</p></div></div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Helper NavItem Component
function NavItem({ icon: Icon, label, active, onClick, expanded }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${active ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'} ${!expanded ? 'justify-center' : ''}`}>
      <Icon size={20} className={active ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
      {expanded && <span className="text-sm font-medium">{label}</span>}
      {!expanded && active && <div className="absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">{label}</div>}
    </button>
  );
}