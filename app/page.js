"use client";
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Database, 
  Settings, 
  Zap, 
  BarChart3, 
  Plus, 
  Search, 
  Bell, 
  User, 
  ChevronDown,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Globe,
  Moon,
  Sun,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Target
} from 'lucide-react';

// --- Components ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, type = "neutral" }) => {
  const styles = {
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    neutral: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    primary: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type] || styles.neutral}`}>
      {children}
    </span>
  );
};

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Toggle Dark Mode
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Mock Data - UPDATED for GroGoliath
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
        
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300`}>
          <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {/* GroGoliath Logo Placeholder */}
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/20">
                G
              </div>
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

          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <button 
              onClick={toggleTheme}
              className={`flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${!isSidebarOpen ? 'justify-center' : ''}`}
            >
              {darkMode ? <Sun size={20} className="text-slate-400" /> : <Moon size={20} className="text-slate-400" />}
              {isSidebarOpen && <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          
          {/* Header */}
          <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8">
            <div className="flex items-center gap-4 text-slate-500">
              <span className="text-sm font-medium">Organization</span>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">My First Project</span>
            </div>

            <div className="flex items-center gap-6">
              <button className="relative text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-800"></span>
              </button>
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  JD
                </div>
                <div className="hidden md:block text-sm">
                  <p className="font-medium text-slate-700 dark:text-slate-200">John Doe</p>
                  <p className="text-xs text-slate-400">GroGoliath Member</p>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-6xl mx-auto space-y-8">
              
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h1>
                  <p className="text-slate-500 mt-1">Here's what's happening with your GroGoliath sites.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-indigo-600/20">
                  <Plus size={18} />
                  New Project
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</h3>
                      </div>
                      <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                        <stat.icon size={20} />
                      </div>
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

              {/* Main Content Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Projects Table */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <h2 className="font-semibold text-slate-900 dark:text-white">Active Deployments</h2>
                      <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500">
                          <tr>
                            <th className="px-6 py-4 font-medium">Project Name</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Pages</th>
                            <th className="px-6 py-4 font-medium">Platform</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {projects.map((project) => (
                            <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{project.name}</td>
                              <td className="px-6 py-4">
                                <Badge type={project.status === 'Live' ? 'success' : project.status === 'Building' ? 'primary' : 'neutral'}>
                                  {project.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{project.pages.toLocaleString()}</td>
                              <td className="px-6 py-4 text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                {project.platform}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                  <MoreHorizontal size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Quick Setup Area */}
                   <Card className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 border-none text-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-bold mb-2">Start a new campaign</h2>
                        <p className="text-indigo-100 max-w-md">Import your CSV dataset, map your keywords, and generate 1000s of landing pages in minutes.</p>
                        <button className="mt-6 bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                          Upload Dataset
                        </button>
                      </div>
                      <div className="hidden sm:block bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                        <FileText size={48} className="text-indigo-100" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Sidebar Stats / Activity */}
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">System Status</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">OpenAI API</p>
                          <p className="text-xs text-slate-500">Operational</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Database (Supabase)</p>
                          <p className="text-xs text-slate-500">Operational</p>
                        </div>
                      </div>
                       <div className="flex items-center gap-3">
                        <AlertCircle size={18} className="text-amber-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Indexing API</p>
                          <p className="text-xs text-slate-500">Slow response times</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                     <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Keyword Wins</h3>
                     <div className="space-y-4">
                        {[
                          { kw: "best vegan soap", pos: 3, vol: "1.2k" },
                          { kw: "crm for plumbers", pos: 8, vol: "450" },
                          { kw: "cheap seo tools", pos: 12, vol: "2.8k" }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2 last:border-0 last:pb-0">
                            <div>
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.kw}</p>
                              <p className="text-xs text-slate-400">{item.vol} vol</p>
                            </div>
                            <div className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded">
                              #{item.pos}
                            </div>
                          </div>
                        ))}
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
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group
        ${active 
          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
        }
        ${!expanded ? 'justify-center' : ''}
      `}
    >
      <Icon size={20} className={active ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
      {expanded && <span className="text-sm font-medium">{label}</span>}
      {!expanded && active && <div className="absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">{label}</div>}
    </button>
  );
}