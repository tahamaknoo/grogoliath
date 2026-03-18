'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import TemplateBuilder from '../TemplateBuilder';

const BLANK_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{KEYWORD}} | {{LOCATION}}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'DM Sans', sans-serif; color: #1e293b; }
nav { background: #fff; padding: 1.5rem 5%; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.logo { font-size: 1.5rem; font-weight: 800; color: #5b4cdb; }
.hero { background: linear-gradient(135deg, #5b4cdb 0%, #4a3dc4 100%); color: #fff; padding: 8rem 5%; text-align: center; }
.hero h1 { font-size: 3.5rem; font-weight: 800; margin-bottom: 1.5rem; }
.hero p { font-size: 1.25rem; opacity: 0.9; margin-bottom: 2.5rem; max-width: 600px; margin-left: auto; margin-right: auto; }
.btn { display: inline-block; padding: 1rem 2.5rem; background: #fff; color: #5b4cdb; font-weight: 700; border-radius: 0.75rem; text-decoration: none; font-size: 1.1rem; }
.section { padding: 5rem 5%; }
.section-title { font-size: 2.25rem; font-weight: 800; text-align: center; margin-bottom: 3rem; }
footer { background: #1e293b; color: #94a3b8; padding: 3rem 5%; text-align: center; }
</style>
</head>
<body>
<nav>
  <div class="logo">{{KEYWORD}}</div>
  <a href="#contact" class="btn" style="background:#5b4cdb;color:#fff;padding:0.75rem 1.5rem;border-radius:0.5rem;font-size:0.95rem;">Get Started</a>
</nav>
<section class="hero">
  <h1>{{KEYWORD}} in {{LOCATION}}</h1>
  <p>Professional {{SERVICE}} services trusted by thousands of customers in {{LOCATION}}.</p>
  <a href="#contact" class="btn">Get a Free Quote</a>
</section>
<section class="section">
  <h2 class="section-title">Our Services</h2>
  <p style="text-align:center;color:#64748b;max-width:600px;margin:0 auto;">Add your services, features, or offerings here.</p>
</section>
<section class="section" style="background:#f8fafc;">
  <h2 class="section-title">Why Choose Us</h2>
  <p style="text-align:center;color:#64748b;max-width:600px;margin:0 auto;">Add your unique value propositions and differentiators here.</p>
</section>
<footer>
  <p>&copy; 2024 {{KEYWORD}}. All rights reserved.</p>
</footer>
</body>
</html>`;

export default function TemplatesView({ user, session, onRefresh }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const effectiveUser = session?.user || user;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'create') {
      setShowBuilder(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setTemplates(data);
      setLoading(false);
    };
    fetchTemplates();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#5b4cdb] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-2">
            Templates
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400">
            {templates.length} available {templates.length === 1 ? 'template' : 'templates'}
          </p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="px-8 py-4 bg-gradient-to-r from-[#5b4cdb] to-[#4a3dc4] text-white text-lg font-bold rounded-xl hover:shadow-lg hover:shadow-[#5b4cdb]/30 transition-all"
        >
          + Create Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-[#5b4cdb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
            No templates yet
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-8">
            Create your first template to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="group p-6 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-2xl hover:shadow-lg hover:border-[#5b4cdb] transition-all cursor-pointer"
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="h-48 rounded-xl mb-4 overflow-hidden border border-slate-200 dark:border-[#27272a]">
                {template.structure ? (
                  <iframe
                    srcDoc={template.structure
                      .replace(/\{\{KEYWORD\}\}/g, 'Example Service')
                      .replace(/\{\{LOCATION\}\}/g, 'Your City')
                      .replace(/\{\{SERVICE\}\}/g, 'Service Type')}
                    className="w-full h-full pointer-events-none"
                    title={template.name}
                    style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 flex items-center justify-center">
                    <span className="text-4xl">📄</span>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {template.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {template.category || 'Template'}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('Use Template — will launch wizard with this template pre-selected');
                  }}
                  className="flex-1 px-4 py-2 bg-[#5b4cdb] text-white font-semibold rounded-xl hover:bg-[#4a3dc4] transition-all"
                >
                  Use Template
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTemplate(template);
                  }}
                  className="px-4 py-2 border border-slate-200 dark:border-[#27272a] text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-[#27272a] transition-all"
                >
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showBuilder && (
        <TemplateBuilder
          session={session || { user: effectiveUser }}
          onClose={() => setShowBuilder(false)}
          onSave={(newTemplate) => {
            setTemplates(prev => [newTemplate, ...prev]);
            setShowBuilder(false);
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {selectedTemplate && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-8"
          onClick={() => setSelectedTemplate(null)}
        >
          <div
            className="bg-white dark:bg-[#0f0f10] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 dark:border-[#27272a] flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {selectedTemplate.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {selectedTemplate.category || 'Template'}
                </p>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-[#27272a] flex items-center justify-center transition-colors"
              >
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-hidden" style={{ height: 'calc(90vh - 180px)' }}>
              {selectedTemplate.structure ? (
                <iframe
                  srcDoc={selectedTemplate.structure
                    .replace(/\{\{KEYWORD\}\}/g, 'Example Service')
                    .replace(/\{\{LOCATION\}\}/g, 'Your City')
                    .replace(/\{\{SERVICE\}\}/g, 'Service Type')}
                  className="w-full h-full border-0"
                  title={`Preview: ${selectedTemplate.name}`}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  No preview available
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-[#27272a] flex justify-end gap-3">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-6 py-2 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-[#27272a] transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert('Use Template — will launch wizard');
                  setSelectedTemplate(null);
                }}
                className="px-6 py-2 bg-[#5b4cdb] text-white font-semibold rounded-xl hover:bg-[#4a3dc4] transition-colors"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
