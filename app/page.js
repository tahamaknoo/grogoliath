"use client";
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient'; 
import { 
  LayoutDashboard, FileText, Database, Settings, BarChart3, Plus, 
  Search, Bell, User, ChevronDown, MoreHorizontal, Layers, 
  CheckCircle2, AlertCircle, TrendingUp, Target, LogOut, Mail, 
  Loader2, UploadCloud, X, FileSpreadsheet, Trash2, Eye, Table as TableIcon,
  Moon, Sun, ArrowUpRight, ArrowDownRight, Monitor, Globe, Keyboard, Save, Key, 
  Sparkles, Play, StopCircle, LayoutTemplate, Type, Image as ImageIcon, AlignLeft, Code,
  List, CheckSquare, DollarSign, Megaphone, Scale, ThumbsUp, HelpCircle, Link, 
  FileCode, ShieldCheck, Users, Workflow, Briefcase, FormInput, Award, Zap, Download, Wand2, Copy, BookOpen, Palette, ChevronRight, ArrowUp, ArrowDown, Smartphone, Check, Star, ThumbsDown, HardDrive, FolderOpen
} from 'lucide-react';

// --- 0. PRESET TEMPLATES (Unchanged) ---
const PRESET_TEMPLATES = [
  {
    id: 'preset-1',
    name: 'SEO Blog Post (Standard)',
    category: 'Content',
    structure: [
      { id: 1, type: 'header', category: 'basic', content: 'H1: {{Keyword}} - Complete Guide' },
      { id: 2, type: 'text', category: 'basic', content: 'Write an engaging introduction about {{Keyword}} that hooks the reader...' },
      { id: 3, type: 'schema_blog', category: 'seo', content: '{\n  "@context": "https://schema.org",\n  "@type": "BlogPosting",\n  "headline": "Guide to {{Keyword}}"\n}' },
      { id: 4, type: 'header', category: 'basic', content: 'H2: What is {{Keyword}}?' },
      { id: 5, type: 'text', category: 'basic', content: 'Define {{Keyword}} in simple terms...' },
      { id: 6, type: 'faq_auto', category: 'seo', content: 'Generate 5 FAQs about {{Keyword}}.' },
      { id: 7, type: 'cta', category: 'marketing', content: 'Subscribe to our newsletter for more tips on {{Keyword}}.' }
    ]
  },
  {
    id: 'preset-2',
    name: 'Local Service Page',
    category: 'Landing Page',
    structure: [
      { id: 1, type: 'hero', category: 'premium', content: 'Best {{Service}} in {{City}} - Trusted & Reliable' },
      { id: 2, type: 'schema_service', category: 'seo', content: '{\n  "@context": "https://schema.org",\n  "@type": "Service",\n  "name": "{{Service}}",\n  "areaServed": "{{City}}"\n}' },
      { id: 3, type: 'pain_point', category: 'marketing', content: 'Identify 3 common problems people in {{City}} face with {{Service}}.' },
      { id: 4, type: 'solution', category: 'marketing', content: 'Explain why our {{Service}} is the perfect solution for {{City}} residents.' },
      { id: 5, type: 'trust_badges', category: 'premium', content: '<div class="badges">🏆 #1 in {{City}} | 🔒 Licensed | ⚡ 24/7 Support</div>' },
      { id: 6, type: 'contact_form', category: 'premium', content: '<!-- Contact Form -->' }
    ]
  },
  {
    id: 'preset-3',
    name: 'Product Review / Comparison',
    category: 'Affiliate',
    structure: [
      { id: 1, type: 'header', category: 'basic', content: 'H1: {{Product}} Review - Is it Worth It?' },
      { id: 2, type: 'image', category: 'basic', content: 'https://via.placeholder.com/800x400?text={{Product}}' },
      { id: 3, type: 'comparison', category: 'premium', content: 'Create a comparison table: {{Product}} vs Competitors.' },
      { id: 4, type: 'pros_cons', category: 'premium', content: 'List Pros and Cons for {{Product}}.' },
      { id: 5, type: 'stats', category: 'seo', content: 'Find technical specs or stats for {{Product}}.' },
      { id: 6, type: 'cta', category: 'marketing', content: 'Buy {{Product}} Now for Best Price' }
    ]
  }
];

// --- 1. UI Components ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm transition-all duration-200 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, type = "neutral" }) => {
  const styles = {
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
    neutral: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600",
    primary: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20",
    premium: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[type] || styles.neutral}`}>
      {children}
    </span>
  );
};

// --- Live Preview Component ---
const LivePreview = ({ blocks }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('desktop');

  const generateHTML = () => {
    return blocks.map(b => `<!-- ${b.type} -->\n<div class="block-${b.type}">${b.content}</div>`).join('\n\n');
  };

  const handleCopyHTML = () => {
    navigator.clipboard.writeText(generateHTML());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!blocks || blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 min-h-[400px] bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
        <LayoutTemplate size={48} className="mb-4 opacity-20" />
        <p>Add blocks to build your page preview</p>
      </div>
    );
  }

  return (
    <div className={`mx-auto transition-all duration-300 flex flex-col ${viewMode === 'mobile' ? 'max-w-sm' : 'w-full max-w-5xl'}`}>
      <div className="bg-slate-100 border border-b-0 border-slate-200 p-3 flex items-center justify-between gap-2 rounded-t-lg">
        <div className="flex items-center flex-1 gap-4">
           <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-amber-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div></div>
           <div className="flex-1 max-w-md bg-white h-6 rounded-md border border-slate-200 text-[10px] text-slate-400 flex items-center px-2 truncate">https://grogoliath.com/preview</div>
        </div>
        <div className="flex bg-white rounded-md border border-slate-200 p-0.5">
           <button onClick={() => setViewMode('desktop')} className={`p-1.5 rounded ${viewMode === 'desktop' ? 'bg-slate-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`} title="Desktop View"><Monitor size={14} /></button>
           <button onClick={() => setViewMode('mobile')} className={`p-1.5 rounded ${viewMode === 'mobile' ? 'bg-slate-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`} title="Mobile View"><Smartphone size={14} /></button>
        </div>
        <button onClick={handleCopyHTML} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md hover:bg-indigo-100 transition-colors flex items-center gap-1 ml-2">{copied ? <CheckCircle2 size={12}/> : <Code size={12}/>} {copied ? 'Copied!' : 'Copy HTML'}</button>
      </div>
      <div className={`flex-1 bg-white border border-slate-200 border-t-0 shadow-2xl overflow-hidden flex flex-col ${viewMode === 'mobile' ? 'rounded-b-3xl border-8 border-slate-800 min-h-[600px]' : 'rounded-b-lg min-h-[800px]'}`}>
        <nav className="border-b border-slate-100 px-6 py-4 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="font-bold text-lg text-slate-900 tracking-tight">Brand</div>
          {viewMode === 'desktop' && (<div className="flex gap-6 text-sm font-medium text-slate-600"><span>Features</span><span>Pricing</span><span>Contact</span></div>)}
          {viewMode === 'mobile' ? <div className="space-y-1"><div className="w-5 h-0.5 bg-slate-800"></div><div className="w-5 h-0.5 bg-slate-800"></div><div className="w-5 h-0.5 bg-slate-800"></div></div> : <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium">Get Started</button>}
        </nav>
        <div className="flex-1 overflow-y-auto bg-white">
          {blocks.map((block) => {
            if (!block || !block.type) return null; 
            switch (block.type) {
              case 'header': return <section key={block.id} className="px-6 py-8"><h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{block.content}</h2></section>;
              case 'hero': return <section key={block.id} className="text-center py-16 px-6 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100"><h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">{block.content}</h1><p className="text-lg text-slate-500 mb-8">Your compelling subheadline goes here.</p><button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 w-full md:w-auto">Start Now</button></section>;
              case 'text': return <section key={block.id} className="px-6 py-4"><p className="text-base md:text-lg text-slate-700 leading-relaxed">{block.content}</p></section>;
              case 'image': return <section key={block.id} className="px-6 py-8"><div className="w-full h-48 md:h-[400px] bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-slate-200 overflow-hidden relative group"><ImageIcon size={32} className="mb-2 text-slate-300"/> <span className="font-medium text-sm">{block.content}</span></div></section>;
              case 'pain_point': return <section key={block.id} className="px-6 py-8 bg-red-50/50"><div className="p-5 bg-white border border-red-100 rounded-xl shadow-sm"><h3 className="text-lg font-bold text-red-800 mb-2 flex gap-2 items-center"><AlertCircle size={18}/> Problem</h3><p className="text-slate-600">{block.content}</p></div></section>;
              case 'solution': return <section key={block.id} className="px-6 py-8 bg-emerald-50/50"><div className="p-5 bg-white border border-emerald-100 rounded-xl shadow-sm"><h3 className="text-lg font-bold text-emerald-800 mb-2 flex gap-2 items-center"><CheckCircle2 size={18}/> Solution</h3><p className="text-slate-600">{block.content}</p></div></section>;
              case 'pricing': return <section key={block.id} className="px-6 py-12 bg-slate-50"><div className={`grid gap-4 ${viewMode==='mobile'?'grid-cols-1':'grid-cols-3'}`}>{[{ name: 'Starter', price: '$29' }, { name: 'Pro', price: '$99', highlight: true }, { name: 'Enterprise', price: '$299' }].map((plan, i) => (<div key={i} className={`bg-white p-6 rounded-xl border ${plan.highlight ? 'border-indigo-500 shadow-lg' : 'border-slate-200'}`}><div className="text-slate-500 text-sm font-bold uppercase mb-2">{plan.name}</div><div className="text-3xl font-extrabold text-slate-900 mb-4">{plan.price}</div><button className="w-full py-2 rounded-lg bg-slate-100 text-sm font-bold">Select</button></div>))}</div></section>;
              case 'cta': return <section key={block.id} className="px-6 py-16 bg-indigo-600 text-white text-center"><h3 className="text-2xl font-bold mb-4">{block.content}</h3><button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg">Get Started</button></section>;
              case 'faq_auto': return <section key={block.id} className="px-6 py-12"><h3 className="text-xl font-bold mb-6 text-center">FAQ</h3><div className="space-y-3">{[1, 2, 3].map(i => (<details key={i} className="bg-white border border-slate-200 rounded-lg"><summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-slate-900 text-sm"><span>Question {i}?</span><ChevronDown size={16} className="text-slate-400"/></summary></details>))}</div></section>;
              case 'trust_badges': return <section key={block.id} className="py-12 border-y border-slate-100 bg-slate-50/50"><div className="max-w-6xl mx-auto px-8"><p className="text-center text-sm font-bold text-slate-400 uppercase tracking-wider mb-8">Trusted by industry leaders</p><div className="flex justify-center gap-12 opacity-50 grayscale flex-wrap"><div className="font-bold text-2xl text-slate-600 flex items-center gap-2"><ShieldCheck/> Secure</div><div className="font-bold text-2xl text-slate-600 flex items-center gap-2"><Users/> CrowdSource</div><div className="font-bold text-2xl text-slate-600 flex items-center gap-2"><Zap/> Fast</div></div></div></section>;
              case 'contact_form': return <section key={block.id} className="px-6 py-16 bg-slate-50"><div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200"><h3 className="text-xl font-bold mb-6 text-center">Contact Us</h3><div className="space-y-4"><div><label className="block text-sm font-medium text-slate-700 mb-1">Name</label><input type="text" className="w-full p-3 border rounded-lg bg-slate-50" placeholder="Your name"/></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input type="email" className="w-full p-3 border rounded-lg bg-slate-50" placeholder="name@example.com"/></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Message</label><textarea className="w-full p-3 border rounded-lg bg-slate-50 h-24" placeholder="How can we help?"></textarea></div><button className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800">Send Message</button></div></div></section>;
              case 'comparison': return <section key={block.id} className="px-6 py-12"><h3 className="text-xl font-bold mb-6 text-center">Comparison</h3><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-50 text-slate-500 border-b"><tr><th className="px-6 py-3">Feature</th><th className="px-6 py-3 text-indigo-600 font-bold">Us</th><th className="px-6 py-3">Them</th></tr></thead><tbody className="divide-y">{[1,2,3].map(r=><tr key={r}><td className="px-6 py-3 font-medium">Feature {r}</td><td className="px-6 py-3 text-emerald-600"><Check size={16}/></td><td className="px-6 py-3 text-red-400"><X size={16}/></td></tr>)}</tbody></table></div></section>;
              case 'pros_cons': return <section key={block.id} className="px-6 py-8"><div className="grid md:grid-cols-2 gap-6"><div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl"><h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2"><ThumbsUp size={16}/> Pros</h4><ul className="space-y-2 text-emerald-700 text-sm"><li><Check size={14} className="inline mr-2"/> Benefit 1</li><li><Check size={14} className="inline mr-2"/> Benefit 2</li></ul></div><div className="bg-red-50 border border-red-100 p-6 rounded-xl"><h4 className="font-bold text-red-800 mb-4 flex items-center gap-2"><ThumbsDown size={16}/> Cons</h4><ul className="space-y-2 text-red-700 text-sm"><li><X size={14} className="inline mr-2"/> Drawback 1</li><li><X size={14} className="inline mr-2"/> Drawback 2</li></ul></div></div></section>;
              case 'process': return <section key={block.id} className="px-6 py-12"><div className="flex flex-col md:flex-row gap-4 text-center">{[1,2,3].map(step=><div key={step} className="flex-1 p-6 border rounded-xl bg-slate-50"><div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">{step}</div><h4 className="font-bold text-slate-900">Step {step}</h4><p className="text-sm text-slate-500 mt-2">Description of this step.</p></div>)}</div></section>;
              case 'social_proof': return <section key={block.id} className="px-6 py-12 bg-slate-50"><div className="max-w-2xl mx-auto text-center"><div className="flex justify-center mb-4 text-yellow-400"><Star fill="currentColor" size={20}/><Star fill="currentColor" size={20}/><Star fill="currentColor" size={20}/><Star fill="currentColor" size={20}/><Star fill="currentColor" size={20}/></div><blockquote className="text-xl font-medium text-slate-800 italic">"This product completely changed how we work. Highly recommended!"</blockquote><div className="mt-4 font-bold text-slate-900">- Happy Customer</div></div></section>;
              case 'case_study': return <section key={block.id} className="px-6 py-12"><div className="flex gap-6 items-center bg-indigo-50 p-8 rounded-2xl border border-indigo-100"><div className="flex-1"><div className="text-indigo-600 font-bold text-sm uppercase tracking-wide mb-2">Case Study</div><h3 className="text-2xl font-bold text-slate-900 mb-4">How Client X grew 200%</h3><p className="text-slate-600 mb-6">Full story placeholder text describing the success.</p><button className="text-indigo-600 font-bold hover:underline">Read Story &rarr;</button></div><div className="w-1/3 h-40 bg-indigo-200 rounded-xl hidden md:block"></div></div></section>;
              case 'schema_service': case 'schema_blog': return <div key={block.id} className="px-6 py-4"><div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 font-mono">Hidden Schema: {block.type}</div></div>;
              default: return <div key={block.id} className="p-6 text-center border-b border-slate-100"><p className="text-slate-400 font-mono text-xs">Block: {block.type}</p></div>;
            }
          })}
          <footer className="bg-slate-900 text-slate-500 py-8 px-6 text-center text-xs mt-auto"><p>© 2025 GroGoliath. All rights reserved.</p></footer>
        </div>
      </div>
    </div>
  );
};

// --- 2. Template Builder Modal ---
const TemplateModal = ({ isOpen, onClose, onSaveSuccess, initialData, mode = 'edit' }) => {
  const [name, setName] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode); 
  const [viewTab, setViewTab] = useState('edit'); 

  useEffect(() => {
    if (isOpen) {
      setCurrentMode(mode);
      setViewTab(mode.startsWith('preview') ? 'preview' : 'edit');
      if (initialData) {
        const isPreset = initialData.id.toString().startsWith('preset');
        setName(initialData.name + (isPreset ? ' (Clone)' : ''));
        setBlocks(initialData.structure || []);
      } else {
        setName('');
        setBlocks([]);
      }
      setAiPrompt('');
    }
  }, [isOpen, initialData, mode]);

  if (!isOpen) return null;

  const isReadOnly = currentMode.startsWith('preview');

  const addBlock = (type, category = 'basic') => {
    if (isReadOnly) return;
    const newBlock = { id: Date.now(), type, category, content: getDefaultContent(type) };
    setBlocks([...blocks, newBlock]);
  };

  const getDefaultContent = (type) => {
    switch(type) {
      case 'header': return 'H2: Guide to {{Keyword}}';
      case 'text': return 'Write a 100-word engaging introduction about {{Keyword}}. Use short paragraphs.';
      case 'service_keyword': return '{{Keyword}}'; 
      case 'image': return 'Image Description: {{Keyword}}';
      case 'html': return '<div class="custom-block">...</div>';
      case 'pain_point': return 'Identify 3 pain points for {{Keyword}}.';
      case 'solution': return 'Explain how we solve {{Keyword}} issues.';
      case 'usp': return 'List 5 USPs for {{Keyword}}.';
      case 'pricing': return 'Create a 3-column HTML Pricing Table.';
      case 'cta': return 'Sign up now for {{Keyword}} solutions.';
      case 'schema_service': return '{"@type": "Service", "name": "{{Keyword}}"}';
      case 'schema_blog': return '{"@type": "BlogPosting", "headline": "Guide to {{Keyword}}"}';
      case 'faq_auto': return 'Generate 5 FAQs about {{Keyword}}.';
      case 'stats': return 'Find 3 stats about {{Keyword}}.';
      case 'hero': return 'Hero Title: Best {{Keyword}} Service';
      case 'comparison': return 'Compare Us vs Competitors for {{Keyword}}.';
      case 'pros_cons': return 'List Pros and Cons for {{Keyword}}.';
      case 'social_proof': return 'Generate a testimonial for {{Keyword}}.';
      case 'process': return 'Create a 3-step process for {{Keyword}}.';
      case 'case_study': return 'Write a mini case study for {{Keyword}}.';
      case 'contact_form': return '<!-- Contact Form Placeholder -->';
      case 'trust_badges': return '[Trust Badges: Secure, Verified, Top Rated]';
      default: return 'Write content...';
    }
  };

  const updateBlock = (id, content) => { if (!isReadOnly) setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b)); };
  const removeBlock = (id) => { if (!isReadOnly) setBlocks(blocks.filter(b => b.id !== id)); };
  const moveBlock = (index, direction) => {
    if (isReadOnly) return;
    const newBlocks = [...blocks];
    if (direction === 'up' && index > 0) { [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]]; } 
    else if (direction === 'down' && index < newBlocks.length - 1) { [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]]; }
    setBlocks(newBlocks);
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("Please name your template.");
    if (blocks.length === 0) return alert("Please add at least one block.");
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    let error;
    if (initialData && !initialData.id.toString().startsWith('preset') && currentMode !== 'create') {
       const { error: err } = await supabase.from('templates').update({ name, structure: blocks }).eq('id', initialData.id);
       error = err;
    } else {
       const { error: err } = await supabase.from('templates').insert({ user_id: user.id, name, structure: blocks });
       error = err;
    }
    setSaving(false);
    if (error) alert(error.message); else { onSaveSuccess(); onClose(); }
  };

  const handleMagicBuild = async () => {
    if (isReadOnly) return;
    if (!aiPrompt.trim()) return alert("Please enter a description for the AI.");
    setAiLoading(true);
    try {
      const systemPrompt = `You are a JSON generator. Create a JSON structure for a website template based on this description: "${aiPrompt}". Return ONLY a JSON array of objects. Each object must have: "id" (number), "type" (string), "category" (string), and "content" (string). Allowed types: header, text, hero, pain_point, solution, usp, pricing, cta, schema_service, faq_auto, comparison, pros_cons. Allowed categories: basic, marketing, seo, premium.`;
      
      const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: systemPrompt }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI Error');
      let cleanJson = data.content.replace(/```json/g, '').replace(/```/g, '').trim();
      const newBlocks = JSON.parse(cleanJson);
      
      // SAFETY CHECK: Ensure all blocks have a valid 'type'
      const sanitizedBlocks = newBlocks.filter(b => b.type).map(b => ({ ...b, id: Date.now() + Math.random() }));
      if (sanitizedBlocks.length > 0) setBlocks([...blocks, ...sanitizedBlocks]);
      else alert("AI returned empty blocks.");
      
    } catch (err) { alert("Failed to generate template: " + err.message); } finally { setAiLoading(false); }
  };

  const renderBlockEditor = (block, index) => {
    if (!block || !block.type) return null; // Safety Check 2
    const isPremium = block.category === 'premium';
    const needsTextArea = ['text', 'pain_point', 'solution', 'usp', 'pricing', 'cta', 'faq_auto', 'stats', 'hero', 'comparison', 'pros_cons', 'social_proof', 'process', 'case_study', 'schema_service', 'schema_blog', 'html', 'image'].includes(block.type);

    return (
      <div key={block.id} className={`group relative bg-white dark:bg-slate-800 p-4 rounded-xl border shadow-sm transition-all ${isPremium ? 'border-amber-200 dark:border-amber-700/50' : 'border-slate-200 dark:border-slate-700'}`}>
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-100"><div className={`text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${isPremium ? 'bg-amber-500' : 'bg-indigo-600'}`}>{index + 1}</div></div>
        {!isReadOnly && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="text-slate-300 hover:text-indigo-500 p-1 disabled:opacity-30"><ArrowUp size={16}/></button>
            <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="text-slate-300 hover:text-indigo-500 p-1 disabled:opacity-30"><ArrowDown size={16}/></button>
            <div className="w-px h-4 bg-slate-200 mx-1"></div>
            <button onClick={() => removeBlock(block.id)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={16}/></button>
          </div>
        )}
        <div className={`mb-2 text-xs font-bold uppercase flex items-center gap-2 ${isPremium ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-500'}`}>
          {block.type === 'header' && <Type size={12}/>}
          {block.type.includes('schema') && <FileCode size={12}/>}
          {block.category === 'premium' && <Award size={12}/>}
          {block.type.replace('_', ' ')}
        </div>
        {needsTextArea ? <textarea value={block.content} onChange={(e) => updateBlock(block.id, e.target.value)} disabled={isReadOnly} className={`w-full p-3 text-sm border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white resize-y ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''} min-h-[80px]`} /> : <input type="text" value={block.content} onChange={(e) => updateBlock(block.id, e.target.value)} disabled={isReadOnly} className={`w-full p-2.5 text-sm border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`} />}
      </div>
    );
  };

  const BlockButton = ({ label, icon: Icon, onClick, premium = false }) => (
    <button onClick={onClick} disabled={isReadOnly} className={`w-full flex items-center gap-3 p-2.5 border rounded-lg transition-all text-xs font-medium shadow-sm ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''} ${premium ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>
      <Icon size={14} className={premium ? "text-amber-500" : "opacity-70"} /> {label} {premium && <span className="ml-auto text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 rounded">PRO</span>}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><LayoutTemplate className="text-indigo-600" size={20} /> {isReadOnly ? 'Template Preview' : 'Template Builder'}</h3>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button onClick={() => setViewTab('edit')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewTab === 'edit' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Edit Structure</button>
            <button onClick={() => setViewTab('preview')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${viewTab === 'preview' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Eye size={12}/> Live Preview</button>
          </div>
          <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
        </div>

        {viewTab === 'preview' ? (<div className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-slate-950"><LivePreview blocks={blocks} /></div>) : (
          <div className="flex-1 flex overflow-hidden">
            <div className="w-72 border-r border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className={`bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 ${isReadOnly ? 'opacity-50 pointer-events-none' : ''}`}>
                   <label className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 mb-2 block flex items-center gap-1"><Wand2 size={12}/> Magic Build</label>
                   <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder={isReadOnly ? "Switch to edit mode to use AI" : "e.g. 'A landing page for a plumber'"} className="w-full p-2 text-xs border rounded mb-2 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" rows={3} disabled={isReadOnly}/>
                   <button onClick={handleMagicBuild} disabled={aiLoading} className="w-full py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 flex items-center justify-center gap-1">{aiLoading ? <Loader2 className="animate-spin" size={12}/> : <Sparkles size={12}/>} Auto-Generate</button>
                </div>
                <div><label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Template Name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Landing Page" disabled={isReadOnly && currentMode !== 'preview_preset'} className={`w-full p-2.5 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white outline-none ${isReadOnly && currentMode !== 'preview_preset' ? 'opacity-70' : ''}`} /></div>
                <div><label className="text-xs font-bold uppercase text-slate-400 mb-2 block flex items-center gap-1"><Layers size={12}/> Core Elements</label><div className="space-y-2"><BlockButton label="Heading (H2/H3)" icon={Type} onClick={() => addBlock('header')} /><BlockButton label="Text Paragraph" icon={AlignLeft} onClick={() => addBlock('text')} /><BlockButton label="Dynamic Keyword" icon={Key} onClick={() => addBlock('service_keyword')} /><BlockButton label="Image / Visual" icon={ImageIcon} onClick={() => addBlock('image')} /><BlockButton label="Custom HTML" icon={Code} onClick={() => addBlock('html')} /></div></div>
                <div><label className="text-xs font-bold uppercase text-slate-400 mb-2 block flex items-center gap-1"><Megaphone size={12}/> Marketing</label><div className="space-y-2"><BlockButton label="Pain Point Block" icon={AlertCircle} onClick={() => addBlock('pain_point')} /><BlockButton label="Solution Block" icon={CheckCircle2} onClick={() => addBlock('solution')} /><BlockButton label="USP Features" icon={Award} onClick={() => addBlock('usp')} /><BlockButton label="Pricing Table" icon={DollarSign} onClick={() => addBlock('pricing')} /><BlockButton label="Call to Action" icon={Megaphone} onClick={() => addBlock('cta')} /></div></div>
                <div><label className="text-xs font-bold uppercase text-slate-400 mb-2 block flex items-center gap-1"><Search size={12}/> SEO & Logic</label><div className="space-y-2"><BlockButton label="Service Schema" icon={FileCode} onClick={() => addBlock('schema_service')} /><BlockButton label="Article Schema" icon={FileCode} onClick={() => addBlock('schema_blog')} /><BlockButton label="Auto FAQs" icon={HelpCircle} onClick={() => addBlock('faq_auto')} /><BlockButton label="Auto Statistics" icon={TrendingUp} onClick={() => addBlock('stats')} /></div></div>
                <div><label className="text-xs font-bold uppercase text-amber-500 mb-2 block flex items-center gap-1"><Zap size={12}/> Premium ($99+)</label><div className="space-y-2"><BlockButton label="Hero Headline" icon={Type} onClick={() => addBlock('hero', 'premium')} premium /><BlockButton label="Comparison Table" icon={Scale} onClick={() => addBlock('comparison', 'premium')} premium /><BlockButton label="Pros & Cons" icon={ThumbsUp} onClick={() => addBlock('pros_cons', 'premium')} premium /><BlockButton label="Social Proof" icon={Users} onClick={() => addBlock('social_proof', 'premium')} premium /><BlockButton label="Process Steps" icon={Workflow} onClick={() => addBlock('process', 'premium')} premium /><BlockButton label="Case Studies" icon={Briefcase} onClick={() => addBlock('case_study', 'premium')} premium /><BlockButton label="Contact Form" icon={FormInput} onClick={() => addBlock('contact_form', 'premium')} premium /><BlockButton label="Trust Badges" icon={ShieldCheck} onClick={() => addBlock('trust_badges', 'premium')} premium /></div></div>
              </div>
            </div>
            <div className="flex-1 p-8 overflow-y-auto bg-slate-100 dark:bg-slate-950">
              <div className="max-w-3xl mx-auto space-y-4 pb-12">
                {blocks.length === 0 ? (<div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl"><LayoutTemplate size={48} className="text-slate-300 mb-4" /><p className="text-slate-900 dark:text-white font-bold text-lg">{isReadOnly ? "Empty Template" : "Start Building"}</p><p className="text-sm text-slate-500 max-w-xs text-center mt-1">{isReadOnly ? "This template has no blocks yet." : "Select elements from the sidebar to construct your page layout."}</p></div>) : (blocks.map((block, index) => renderBlockEditor(block, index)))}
              </div>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-white dark:bg-slate-800">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
          {currentMode === 'preview_preset' ? (
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-600/20">{saving ? <Loader2 className="animate-spin" size={18}/> : <Copy size={18}/>} Clone Template</button>
          ) : currentMode === 'preview_user' ? (
             <button onClick={() => { setCurrentMode('edit'); setViewTab('edit'); }} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2"><FileText size={18}/> Edit Template</button>
          ) : (
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2">{saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Save Changes</button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 3. Templates Tab View (UPDATED: Use = Copy HTML) ---
const TemplatesView = ({ user, onNewTemplate, onPreview }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copyId, setCopyId] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data } = await supabase.from('templates').select('*').order('created_at', { ascending: false });
      if (data) setTemplates(data);
      setLoading(false);
    };
    fetchTemplates();
  }, []);

  const deleteTemplate = async (id) => {
    if (confirm("Delete template?")) {
      await supabase.from('templates').delete().eq('id', id);
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  // NEW: Copy HTML to Clipboard
  const handleUse = (template) => {
    const html = template.structure.map(b => `<!-- ${b.type} -->\n<div class="block-${b.type}">${b.content}</div>`).join('\n\n');
    navigator.clipboard.writeText(html);
    setCopyId(template.id);
    setTimeout(() => setCopyId(null), 2000); // Reset badge after 2 seconds
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex justify-between items-center"><div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Templates</h1><p className="text-slate-500 mt-1">Design your page layouts.</p></div><button onClick={onNewTemplate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2 shadow-lg hover:bg-indigo-700 transition-all"><Plus size={18}/> Create Template</button></div>
      <div><h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><User size={18} className="text-indigo-500"/> My Templates</h2>{loading ? (<div className="text-center py-12 text-slate-400">Loading templates...</div>) : templates.length === 0 ? (<div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl"><p className="text-slate-500 mb-4">You haven't created any templates yet.</p><button onClick={onNewTemplate} className="text-indigo-600 font-bold hover:underline">Create your first one</button></div>) : (<div className="grid grid-cols-1 md:grid-cols-3 gap-6"><button onClick={onNewTemplate} className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all group h-64"><div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors"><Plus size={24} className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"/></div><p className="font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">New Template</p></button>{templates.map(t => (<Card key={t.id} className="flex flex-col h-64 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group relative overflow-hidden"><div className="h-2 bg-indigo-500 w-full"></div><div className="p-6 flex-1 flex flex-col"><div className="flex justify-between items-start mb-4"><div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"><LayoutTemplate size={20} className="text-indigo-600 dark:text-indigo-400"/></div><button onClick={(e) => { e.stopPropagation(); deleteTemplate(t.id); }} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button></div><h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{t.name}</h3><p className="text-sm text-slate-500">{t.structure?.length || 0} Blocks</p><div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2"><button onClick={() => onPreview(t, 'preview_user')} className="flex-1 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"><Eye size={14}/> Preview</button><button onClick={() => handleUse(t)} className={`flex-1 py-2 text-xs font-bold rounded transition-all ${copyId === t.id ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'text-slate-600 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100'}`}>{copyId === t.id ? 'Copied!' : 'Use'}</button></div></div></Card>))}</div>)}</div>
      <div className="border-t border-slate-200 dark:border-slate-700"></div>
      <div><h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2"><BookOpen size={18} className="text-emerald-500"/> Template Library</h2><p className="text-slate-500 text-sm mb-6">Start with a proven structure. Clone these to your library to customize.</p><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{PRESET_TEMPLATES.map(t => (<Card key={t.id} className="flex flex-col h-64 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors group relative overflow-hidden"><div className="h-2 bg-emerald-500 w-full"></div><div className="p-6 flex-1 flex flex-col"><div className="flex justify-between items-start mb-4"><div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"><LayoutTemplate size={20} className="text-emerald-600 dark:text-emerald-400"/></div></div><h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{t.name}</h3><p className="text-sm text-slate-500">{t.category} • {t.structure.length} Blocks</p><div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2"><button onClick={() => onPreview(t, 'preview_preset')} className="w-full py-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 rounded hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"><Eye size={14}/> Preview</button></div></div><div className="absolute top-3 right-3"><Badge type="success">Preset</Badge></div></Card>))}</div></div>
    </div>
  );
};

// --- 4. AI Generation Modal (Unchanged) ---
const GenerateModal = ({ isOpen, onClose, project, onUpdateSuccess }) => {
  const [prompt, setPrompt] = useState('');
  const [targetColumn, setTargetColumn] = useState('AI_Output');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logs, setLogs] = useState([]);
  const [userTemplates, setUserTemplates] = useState([]); 
  const [selectedTemplateId, setSelectedTemplateId] = useState(''); 
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setLogs([]);
      setProgress({ current: 0, total: 0 });
      setTargetColumn('AI_Output');
      const fetchTemplates = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from('templates').select('*').order('created_at', { ascending: false });
          if (data) setUserTemplates(data);
        }
      };
      fetchTemplates();
    }
  }, [isOpen]);

  const handleTemplateSelect = (e) => {
    const id = e.target.value;
    setSelectedTemplateId(id);
    if (!id) { setPrompt(''); return; }
    const template = [...PRESET_TEMPLATES, ...userTemplates].find(t => t.id.toString() === id);
    if (template) {
      const structurePrompt = template.structure.map(b => `[BLOCK: ${b.type}] Instructions: ${b.content}`).join('\n\n');
      setPrompt(`Generate a full HTML page based on this structure. Wrap everything in a main <div> container. Do NOT output markdown code fences, just the raw HTML.\n\n${structurePrompt}`);
    }
  };

  if (!isOpen || !project) return null;

  const rows = Array.isArray(project.data) ? project.data : (project.data?.rows || []);
  const headers = (project.data?.headers && project.data.headers.length > 0) ? project.data.headers : (rows.length > 0 ? Object.keys(rows[0]) : []);
  const insertVariable = (header) => setPrompt(prev => prev + ` {{${header}}} `);
  const addLog = (message) => setLogs(prev => [...prev, message]);

  const handleGenerate = async () => {
    if (!prompt) return alert("Please enter a prompt.");
    setIsGenerating(true);
    abortControllerRef.current = new AbortController();
    const total = rows.length;
    setProgress({ current: 0, total });
    const newRows = [...rows];
    const newHeaders = headers.includes(targetColumn) ? headers : [...headers, targetColumn];

    try {
      for (let i = 0; i < total; i++) {
        if (abortControllerRef.current.signal.aborted) break;
        const row = newRows[i];
        let filledPrompt = prompt;
        headers.forEach(h => { const regex = new RegExp(`{{${h}}}`, 'g'); filledPrompt = filledPrompt.replace(regex, row[h] || ''); });
        try {
          const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: filledPrompt }), signal: abortControllerRef.current.signal });
          const data = await response.json();
          if (!response.ok || data.error) throw new Error(data.error || 'Server Error');
          newRows[i] = { ...row, [targetColumn]: data.content };
          addLog(`✅ Row ${i + 1}: Success`);
        } catch (err) { if (err.name !== 'AbortError') addLog(`❌ Row ${i + 1}: Failed`); }
        setProgress({ current: i + 1, total });
      }
      const updatedData = { rows: newRows, headers: newHeaders, platform: project.data?.platform || 'Wordpress' };
      await supabase.from('projects').update({ data: updatedData, row_count: newRows.length }).eq('id', project.id);
      onUpdateSuccess();
    } catch (error) { console.error(error); } finally { setIsGenerating(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Sparkles className="text-indigo-600" size={20} /> AI Generator: <span className="text-slate-500 font-normal">{project.name}</span></h3>
          <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-xs font-bold uppercase text-slate-500 mb-2">Output Column</label><input value={targetColumn} onChange={(e) => setTargetColumn(e.target.value)} className="w-full p-3 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white" /></div>
             <div>
               <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Load Template (Optional)</label>
               <select 
                 value={selectedTemplateId} 
                 onChange={handleTemplateSelect}
                 className="w-full p-3 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white appearance-none cursor-pointer"
               >
                 <option value="">-- Select a Template --</option>
                 <optgroup label="Presets">
                   {PRESET_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                 </optgroup>
                 {userTemplates.length > 0 && (
                   <optgroup label="My Templates">
                     {userTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                   </optgroup>
                 )}
               </select>
             </div>
          </div>
          <div className="space-y-3"><label className="block text-xs font-bold uppercase text-slate-500">Prompt</label><div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border dark:border-slate-700 max-h-32 overflow-y-auto">{headers.map((h) => (<button key={h} onClick={() => insertVariable(h)} className="px-2 py-1 text-xs font-medium bg-white dark:bg-slate-800 border rounded hover:border-indigo-500 dark:text-slate-300">{`{{${h}}}`}</button>))}</div><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Write a blog intro for {{City}}..." className="w-full h-40 p-4 rounded-lg border dark:bg-slate-800 dark:border-slate-600 dark:text-white resize-none font-mono text-sm" /></div>
          {(isGenerating || logs.length > 0) && (<div className="space-y-3"><div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-400"><span>Progress</span><span>{progress.current} / {progress.total}</span></div><div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2"><div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${(progress.current / (progress.total || 1)) * 100}%` }}></div></div><div className="p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs h-32 overflow-y-auto">{logs.map((log, i) => <div key={i}>{log}</div>)}</div></div>)}
        </div>
        <div className="p-6 border-t dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">{!isGenerating ? (<button onClick={handleGenerate} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2"><Sparkles size={18} /> Generate</button>) : (<button onClick={() => abortControllerRef.current?.abort()} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 flex items-center gap-2"><StopCircle size={18} /> Stop</button>)}</div>
      </div>
    </div>
  );
};

// --- 5. New Project Modal (Unchanged) ---
const NewProjectModal = ({ isOpen, onClose, onUploadSuccess, datasets }) => {
  const [mode, setMode] = useState('csv');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [platform, setPlatform] = useState('Wordpress');
  const [projectName, setProjectName] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => { if(isOpen) { setMode('csv'); setFile(null); setPreview(null); setProjectName(''); setSelectedDataset(''); } }, [isOpen]);
  if (!isOpen) return null;

  const processFile = (uploadedFile) => {
    if (!uploadedFile?.name.endsWith('.csv')) return alert("Please upload a CSV file.");
    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split('\n').map(line => line.trim()).filter(line => line);
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim());
        const fullData = lines.slice(1).map(line => { const v = line.split(','); return headers.reduce((o, h, i) => { o[h] = v[i]?.trim(); return o; }, {}); });
        setPreview({ headers, rows: fullData.slice(0, 5), fullData, totalRows: lines.length - 1 });
      }
    };
    reader.readAsText(uploadedFile);
  };

  const handleSave = async () => {
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    let payload = { rows: [], platform, headers: [] };
    let name = projectName;
    let count = 0;

    if (mode === 'csv') {
      if (!preview) return setUploading(false);
      name = file.name.replace('.csv', '');
      count = preview.totalRows;
      payload = { rows: preview.fullData, platform, headers: preview.headers };
    } else if (mode === 'library') {
       if (!selectedDataset) return setUploading(false);
       const dataset = datasets.find(d => d.id.toString() === selectedDataset);
       name = dataset.name;
       count = dataset.row_count;
       payload = { rows: dataset.data.rows, platform, headers: dataset.data.headers };
    } else {
      if (!projectName) return;
      name = projectName;
      payload = { rows: [], platform, headers: [] };
    }

    const { error } = await supabase.from('projects').insert({ user_id: user.id, name, row_count: count, status: 'Draft', data: payload });
    setUploading(false);
    if (!error) { onUploadSuccess(); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center"><h3 className="text-lg font-bold dark:text-white">New Project</h3><button onClick={onClose}><X className="text-slate-400"/></button></div>
        <div className="p-6 space-y-4">
          <div><label className="text-xs font-bold uppercase text-slate-500">Platform</label><div className="grid grid-cols-3 gap-2 mt-2">{['Wordpress', 'Webflow', 'Shopify'].map(p => <button key={p} onClick={() => setPlatform(p)} className={`p-2 border rounded text-sm ${platform===p?'bg-indigo-50 border-indigo-500 text-indigo-700':'dark:border-slate-600 dark:text-slate-300'}`}>{p}</button>)}</div></div>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
             <button onClick={() => setMode('csv')} className={`flex-1 py-2 text-sm rounded ${mode === 'csv' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Upload CSV</button>
             <button onClick={() => setMode('library')} className={`flex-1 py-2 text-sm rounded ${mode === 'library' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>From Library</button>
             <button onClick={() => setMode('manual')} className={`flex-1 py-2 text-sm rounded ${mode === 'manual' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Manual</button>
          </div>
          
          {mode === 'csv' && (!preview ? <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed p-8 text-center rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"><input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={(e) => processFile(e.target.files[0])} /><UploadCloud className="mx-auto mb-2 text-indigo-500" /><p className="text-sm dark:text-slate-300">Click to upload CSV</p></div> : <div className="p-4 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 flex items-center gap-2"><FileSpreadsheet size={16}/> {preview.totalRows} rows found</div>)}
          
          {mode === 'library' && (
             <div>
                <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Select Dataset</label>
                {datasets && datasets.length > 0 ? (
                   <select className="w-full p-3 border rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-white" onChange={(e) => setSelectedDataset(e.target.value)}>
                      <option value="">-- Choose File --</option>
                      {datasets.map(d => <option key={d.id} value={d.id}>{d.name} ({d.row_count} rows)</option>)}
                   </select>
                ) : <div className="text-sm text-slate-500 text-center py-4">No saved datasets found.</div>}
             </div>
          )}

          {mode === 'manual' && <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project Name" className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />}
        </div>
        <div className="p-6 border-t dark:border-slate-700 flex justify-end gap-2"><button onClick={onClose} className="px-4 py-2 text-slate-500">Cancel</button><button onClick={handleSave} disabled={uploading} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium">{uploading ? <Loader2 className="animate-spin"/> : 'Create'}</button></div>
      </div>
    </div>
  );
};

// --- 6. View Data Modal (Unchanged) ---
const ViewModal = ({ isOpen, onClose, project, onProjectUpdate }) => {
  const [localProject, setLocalProject] = useState(project);
  const [newRow, setNewRow] = useState({});
  const [showAddRow, setShowAddRow] = useState(false);
  const [newHeader, setNewHeader] = useState('');
  useEffect(() => { setLocalProject(project); }, [project]);
  if (!isOpen || !localProject) return null;
  const rows = Array.isArray(localProject.data) ? localProject.data : (localProject.data?.rows || []);
  const headers = (localProject.data?.headers && localProject.data.headers.length > 0) ? localProject.data.headers : (rows.length > 0 ? Object.keys(rows[0]) : []);
  const handleUpdate = async (newRows, newHeaders) => { const updatedData = { ...localProject.data, rows: newRows, headers: newHeaders }; const { error } = await supabase.from('projects').update({ data: updatedData, row_count: newRows.length }).eq('id', localProject.id); if (!error) { const updated = { ...localProject, data: updatedData, row_count: newRows.length }; setLocalProject(updated); onProjectUpdate(updated); } };
  
  // EXPORT FUNCTIONALITY
  const handleExport = () => {
    if (rows.length === 0) return alert("No data to export.");
    const csvContent = [
      headers.join(','),
      ...rows.map(row => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${localProject.name}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl border dark:border-slate-700 flex flex-col overflow-hidden">
        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-bold dark:text-white">{localProject.name}</h3>
          <div className="flex gap-2">
            <button onClick={handleExport} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"><Download size={16} /> Export CSV</button>
            <button onClick={() => setShowAddRow(!showAddRow)} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium"><Plus size={16} className="inline" /> Add Row</button>
            <button onClick={onClose}><X className="text-slate-400"/></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-900/50">
          {headers.length === 0 && rows.length === 0 ? (<div className="text-center p-12"><p className="mb-4 text-slate-500">Empty Project.</p><div className="flex justify-center gap-2"><input value={newHeader} onChange={(e) => setNewHeader(e.target.value)} placeholder="Column Name" className="p-2 border rounded text-sm" /><button onClick={() => { if(newHeader) handleUpdate(rows, [...headers, newHeader]); setNewHeader(''); }} className="px-3 py-2 bg-indigo-600 text-white rounded text-sm">Add</button></div></div>) : (
            <table className="w-full text-sm text-left bg-white dark:bg-slate-800"><thead className="bg-slate-100 dark:bg-slate-700"><tr>{headers.map((h, i) => <th key={i} className="px-4 py-2 border-b dark:border-slate-600">{h}</th>)}<th className="w-10 border-b dark:border-slate-600"></th></tr></thead><tbody>{showAddRow && (<tr className="bg-indigo-50">{headers.map((h, i) => <td key={i} className="p-2"><input placeholder={h} value={newRow[h]||''} onChange={(e)=>setNewRow({...newRow, [h]:e.target.value})} className="w-full border rounded p-1 text-xs" /></td>)}<td className="p-2"><button onClick={() => { handleUpdate([...rows, newRow], headers); setNewRow({}); setShowAddRow(false); }} className="bg-indigo-600 text-white p-1 rounded"><Save size={14}/></button></td></tr>)}{rows.map((row, i) => (<tr key={i} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 group">{headers.map((h, j) => <td key={j} className="px-4 py-2 truncate max-w-[200px]">{row[h]}</td>)}<td className="px-4 py-2"><button onClick={() => { if(confirm('Delete?')) handleUpdate(rows.filter((_,idx)=>idx!==i), headers); }} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button></td></tr>))}</tbody></table>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 7. Dashboard Views ---
const DashboardView = ({ projects, onNewProject }) => {
  const totalProjects = projects.length;
  const totalRows = projects.reduce((acc, curr) => acc + (curr.row_count || 0), 0);
  const stats = [
    { label: 'Total Projects', value: totalProjects, icon: Layers },
    { label: 'Total Keywords', value: totalRows.toLocaleString(), icon: Target },
    { label: 'Avg. Difficulty', value: '-', icon: BarChart3 },
    { label: 'Monthly Traffic', value: '-', icon: TrendingUp }
  ];
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold dark:text-white">Overview</h1><button onClick={onNewProject} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2 shadow-lg hover:bg-indigo-700 transition-colors"><Plus size={18}/> New Project</button></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">{stats.map((s, i) => <Card key={i} className="p-6"><div className="flex justify-between items-start"><div><p className="text-slate-500 text-sm font-medium">{s.label}</p><h3 className="text-2xl font-bold dark:text-white mt-1">{s.value}</h3></div><div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"><s.icon size={20}/></div></div></Card>)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6"><Card className="p-8 bg-gradient-to-r from-indigo-600 to-violet-600 border-none text-white shadow-xl shadow-indigo-600/20"><div className="flex justify-between items-start"><div><h2 className="text-xl font-bold mb-2">Ready to scale?</h2><p className="text-indigo-100 max-w-md mb-6 text-sm leading-relaxed">Import your dataset, map your keywords, and let AI write thousands of pages for you in minutes.</p><button onClick={onNewProject} className="bg-white text-indigo-600 px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors shadow-lg">Upload Dataset</button></div><FileText size={64} className="text-indigo-100 opacity-80"/></div></Card></div>
        <div className="space-y-6"><Card className="p-6"><h3 className="font-semibold dark:text-white mb-4">System Status</h3><div className="space-y-4"><div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-500" /><div className="flex-1"><p className="text-sm font-medium dark:text-slate-200">OpenAI API</p><p className="text-xs text-slate-500">Operational</p></div></div><div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-500" /><div className="flex-1"><p className="text-sm font-medium dark:text-slate-200">Database</p><p className="text-xs text-slate-500">Operational</p></div></div></div></Card></div>
      </div>
    </div>
  );
};

const ProjectsView = ({ projects, onDelete, onView, onGenerate }) => (
  <div className="max-w-6xl mx-auto space-y-8">
    <h1 className="text-2xl font-bold dark:text-white">Projects</h1>
    <Card className="overflow-hidden border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 uppercase tracking-wider text-xs"><tr><th className="px-6 py-4 font-medium">Name</th><th className="px-6 py-4 font-medium">Rows</th><th className="px-6 py-4 font-medium">Platform</th><th className="px-6 py-4 font-medium text-right">Actions</th></tr></thead>
        <tbody className="divide-y dark:divide-slate-700">
          {projects.length === 0 ? <tr><td colSpan={4} className="text-center py-12 text-slate-500">No projects found.</td></tr> : projects.map(p => (
            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <td className="px-6 py-4 font-medium dark:text-white">{p.name}</td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{p.row_count}</td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400 flex items-center gap-2">{p.data?.platform === 'Wordpress' ? <Globe size={14} /> : <Monitor size={14} />} {p.data?.platform}</td>
              <td className="px-6 py-4 text-right flex justify-end gap-2">
                <button onClick={() => onGenerate(p)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs"><Sparkles size={14}/> Generate</button>
                <button onClick={() => onView(p)} className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 transition-colors"><Eye size={18}/></button>
                <button onClick={() => onDelete(p.id)} className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-2 transition-colors"><Trash2 size={18}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

const SettingsView = ({ email, onLogout }) => (
  <div className="max-w-3xl mx-auto space-y-6">
    <h1 className="text-2xl font-bold dark:text-white">Settings</h1>
    <Card className="p-6"><h3 className="font-bold dark:text-white mb-4">Account</h3><p className="mb-4 text-slate-600 dark:text-slate-300">{email}</p><button onClick={onLogout} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 font-medium transition-colors"><LogOut size={16}/> Sign Out</button></Card>
  </div>
);

// --- 8. Datasets Tab (Functional) ---
const DatasetsView = ({ user, onUpload }) => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
     const fetchDatasets = async () => {
        const { data } = await supabase.from('datasets').select('*').order('created_at', { ascending: false });
        if (data) setDatasets(data);
        setLoading(false);
     };
     fetchDatasets();
  }, []);

  const handleUpload = async (e) => {
     const file = e.target.files[0];
     if (!file) return;
     
     const reader = new FileReader();
     reader.onload = async (e) => {
        const text = e.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length > 0) {
           const headers = lines[0].split(',').map(h => h.trim());
           const rows = lines.slice(1).map(line => {
              const v = line.split(',');
              return headers.reduce((acc, h, i) => ({ ...acc, [h]: v[i]?.trim() }), {});
           });
           
           const { error } = await supabase.from('datasets').insert({
              user_id: user.id,
              name: file.name,
              row_count: lines.length - 1,
              data: { rows, headers }
           });
           
           if (!error) window.location.reload(); 
        }
     };
     reader.readAsText(file);
  };

  const handleDelete = async (id) => {
     if (confirm("Delete dataset?")) {
        await supabase.from('datasets').delete().eq('id', id);
        setDatasets(datasets.filter(d => d.id !== id));
     }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold dark:text-white">Datasets</h1><p className="text-slate-500 mt-1">Manage your uploaded CSV files.</p></div>
        <button onClick={() => fileInputRef.current.click()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2 shadow-lg hover:bg-indigo-700 transition-all"><UploadCloud size={18}/> Upload New</button>
        <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleUpload} />
      </div>
      
      {loading ? <div className="text-center py-12 text-slate-400">Loading...</div> : datasets.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4"><HardDrive size={32} className="text-slate-400"/></div>
          <h3 className="text-lg font-bold dark:text-white">No Datasets Yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">Upload your CSV files here to reuse them across multiple projects.</p>
          <button onClick={() => fileInputRef.current.click()} className="mt-6 text-indigo-600 font-bold hover:underline">Upload First Dataset</button>
        </Card>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {datasets.map(d => (
               <Card key={d.id} className="p-6 flex flex-col group relative overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600"><FileSpreadsheet size={24}/></div>
                     <button onClick={() => handleDelete(d.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">{d.name}</h3>
                  <p className="text-sm text-slate-500">{d.row_count} Rows • CSV</p>
               </Card>
            ))}
         </div>
      )}
    </div>
  );
};

// --- 9. Main Layout ---
function NavItem({ icon: Icon, label, active, onClick, expanded }) {
  return <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${active ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'} ${!expanded ? 'justify-center' : ''}`}><Icon size={20} strokeWidth={active?2.5:2} />{expanded && <span className="text-sm font-medium">{label}</span>}</button>;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [viewProject, setViewProject] = useState(null);
  const [generateProject, setGenerateProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [datasets, setDatasets] = useState([]); // NEW: Store datasets

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { 
       setSession(session); 
       if(session) { fetchProjects(); fetchDatasets(); } // Fetch both
       setLoading(false); 
    });
    supabase.auth.onAuthStateChange((_event, session) => { 
       setSession(session); 
       if(session) { fetchProjects(); fetchDatasets(); }
    });
  }, []);

  const fetchProjects = async () => { const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false }); if(data) setProjects(data); };
  const fetchDatasets = async () => { const { data } = await supabase.from('datasets').select('*').order('created_at', { ascending: false }); if(data) setDatasets(data); };

  const handleDelete = async (id) => { if(confirm('Delete?')) { await supabase.from('projects').delete().eq('id', id); fetchProjects(); } };
  const handleLogout = async () => await supabase.auth.signOut();

  const handleTemplatePreview = (template, mode) => { setEditTemplate(null); setIsTemplateModalOpen(false); setPreviewTemplate({ ...template, mode }); };
  const handleTemplateEdit = (template) => { setPreviewTemplate(null); setIsTemplateModalOpen(false); setEditTemplate(template); };
  const handleNewTemplate = () => { setPreviewTemplate(null); setEditTemplate(null); setIsTemplateModalOpen(true); };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400">Loading...</div>;
  if (!session) return <LoginScreen />;

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        {/* Pass datasets to NewProjectModal */}
        <NewProjectModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUploadSuccess={fetchProjects} datasets={datasets} />
        
        <ViewModal isOpen={!!viewProject} onClose={() => setViewProject(null)} project={viewProject} onProjectUpdate={(p) => { setProjects(projects.map(pr => pr.id === p.id ? p : pr)); }} />
        <GenerateModal isOpen={!!generateProject} onClose={() => setGenerateProject(null)} project={generateProject} onUpdateSuccess={fetchProjects} />
        <TemplateModal isOpen={isTemplateModalOpen || !!editTemplate || !!previewTemplate} onClose={() => { setIsTemplateModalOpen(false); setEditTemplate(null); setPreviewTemplate(null); }} initialData={editTemplate || previewTemplate} mode={previewTemplate ? previewTemplate.mode : (editTemplate ? 'edit' : 'create')} onSaveSuccess={() => {}} />

        <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 z-20`}>
          <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/20">G</div>
            {isSidebarOpen && <span className="ml-3 font-bold text-lg tracking-tight">GroGoliath</span>}
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <NavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} expanded={isSidebarOpen} onClick={() => setActiveTab('dashboard')} />
            <NavItem icon={Layers} label="Projects" active={activeTab === 'projects'} expanded={isSidebarOpen} onClick={() => setActiveTab('projects')} />
            <NavItem icon={Database} label="Datasets" active={activeTab === 'datasets'} expanded={isSidebarOpen} onClick={() => setActiveTab('datasets')} />
            <NavItem icon={FileText} label="Templates" active={activeTab === 'templates'} expanded={isSidebarOpen} onClick={() => setActiveTab('templates')} />
            <NavItem icon={Settings} label="Settings" active={activeTab === 'settings'} expanded={isSidebarOpen} onClick={() => setActiveTab('settings')} />
          </nav>
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <button onClick={() => setDarkMode(!darkMode)} className={`flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${!isSidebarOpen ? 'justify-center' : ''}`}>
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
          <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4 text-slate-500"><span className="text-sm font-medium">Organization</span><span className="text-slate-300">/</span><span className="text-sm font-medium text-slate-900 dark:text-white">GroGoliath HQ</span></div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{session.user.email[0].toUpperCase()}</div>
                <div className="hidden md:block text-sm"><p className="font-medium text-slate-700 dark:text-slate-200">{session.user.email}</p><p className="text-xs text-slate-400">Admin</p></div>
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-8">
            {activeTab === 'dashboard' && <DashboardView projects={projects} onNewProject={() => setIsUploadModalOpen(true)} />}
            {activeTab === 'projects' && <ProjectsView projects={projects} onDelete={handleDelete} onView={setViewProject} onGenerate={setGenerateProject} />}
            {activeTab === 'datasets' && <DatasetsView user={session.user} onUpload={() => {}} />} {/* onUpload handled internally now */}
            {activeTab === 'templates' && (
              <TemplatesView 
                user={session.user} 
                onNewTemplate={handleNewTemplate}
                onPreview={handleTemplatePreview}
              />
            )}
            {activeTab === 'settings' && <SettingsView email={session.user.email} onLogout={handleLogout} />}
          </div>
        </main>
      </div>
    </div>
  );
}