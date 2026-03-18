'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function TemplateBuilder({ onClose, onSave, session }) {
  const [templateName, setTemplateName] = useState('My Custom Template');
  const [templateCategory, setTemplateCategory] = useState('Custom');
  const [sections, setSections] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [saving, setSaving] = useState(false);

  const sectionLibrary = [
    {
      id: 'hero-cta',
      category: 'Headers',
      name: 'Hero Section',
      icon: '🎯',
      description: 'Main header with headline and CTA',
      html: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 140px 32px; text-align: center;">
  <div style="max-width: 900px; margin: 0 auto;">
    <h1 style="font-size: 4rem; font-weight: 900; margin-bottom: 32px; line-height: 1.1;">{{HEADLINE}}</h1>
    <p style="font-size: 1.5rem; margin-bottom: 48px; opacity: 0.95; line-height: 1.6;">{{SUBHEADLINE}}</p>
    <a href="#contact" style="display: inline-block; background: white; color: #667eea; padding: 20px 48px; border-radius: 12px; font-weight: 700; font-size: 1.125rem; text-decoration: none; box-shadow: 0 20px 60px rgba(0,0,0,0.2);">{{CTA_TEXT}}</a>
  </div>
</div>`,
      fields: [
        { key: 'HEADLINE', label: 'Main Headline', type: 'text', default: 'Transform Your Business Today' },
        { key: 'SUBHEADLINE', label: 'Subheadline', type: 'textarea', default: "The complete solution you've been looking for" },
        { key: 'CTA_TEXT', label: 'Button Text', type: 'text', default: 'Get Started' }
      ]
    },
    {
      id: 'stats-banner',
      category: 'Headers',
      name: 'Stats Counter',
      icon: '📊',
      description: 'Achievement numbers showcase',
      html: `<div style="padding: 80px 32px; background: white;">
  <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 48px; text-align: center;">
    <div>
      <div style="font-size: 3.5rem; font-weight: 900; color: #667eea; margin-bottom: 8px;">{{STAT_1_NUMBER}}</div>
      <div style="font-size: 1rem; color: #64748b; font-weight: 600;">{{STAT_1_LABEL}}</div>
    </div>
    <div>
      <div style="font-size: 3.5rem; font-weight: 900; color: #667eea; margin-bottom: 8px;">{{STAT_2_NUMBER}}</div>
      <div style="font-size: 1rem; color: #64748b; font-weight: 600;">{{STAT_2_LABEL}}</div>
    </div>
    <div>
      <div style="font-size: 3.5rem; font-weight: 900; color: #667eea; margin-bottom: 8px;">{{STAT_3_NUMBER}}</div>
      <div style="font-size: 1rem; color: #64748b; font-weight: 600;">{{STAT_3_LABEL}}</div>
    </div>
    <div>
      <div style="font-size: 3.5rem; font-weight: 900; color: #667eea; margin-bottom: 8px;">{{STAT_4_NUMBER}}</div>
      <div style="font-size: 1rem; color: #64748b; font-weight: 600;">{{STAT_4_LABEL}}</div>
    </div>
  </div>
</div>`,
      fields: [
        { key: 'STAT_1_NUMBER', label: 'Stat 1 Number', type: 'text', default: '15+' },
        { key: 'STAT_1_LABEL', label: 'Stat 1 Label', type: 'text', default: 'Years Experience' },
        { key: 'STAT_2_NUMBER', label: 'Stat 2 Number', type: 'text', default: '5,000+' },
        { key: 'STAT_2_LABEL', label: 'Stat 2 Label', type: 'text', default: 'Happy Customers' },
        { key: 'STAT_3_NUMBER', label: 'Stat 3 Number', type: 'text', default: '24/7' },
        { key: 'STAT_3_LABEL', label: 'Stat 3 Label', type: 'text', default: 'Support Available' },
        { key: 'STAT_4_NUMBER', label: 'Stat 4 Number', type: 'text', default: '100%' },
        { key: 'STAT_4_LABEL', label: 'Stat 4 Label', type: 'text', default: 'Satisfaction Rate' }
      ]
    },
    {
      id: 'features-3col',
      category: 'Features',
      name: 'Features Grid',
      icon: '⚡',
      description: 'Three-column feature showcase',
      html: `<div style="padding: 100px 32px; background: white;">
  <div style="max-width: 1200px; margin: 0 auto;">
    <h2 style="text-align: center; font-size: 3rem; font-weight: 900; margin-bottom: 80px; color: #0f172a;">{{SECTION_TITLE}}</h2>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px;">
      <div style="padding: 40px 32px; text-align: center; border-radius: 20px; border: 2px solid #f1f5f9;">
        <div style="font-size: 3.5rem; margin-bottom: 24px;">{{ICON_1}}</div>
        <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px; color: #0f172a;">{{FEATURE_1_TITLE}}</h3>
        <p style="color: #64748b; line-height: 1.7;">{{FEATURE_1_DESC}}</p>
      </div>
      <div style="padding: 40px 32px; text-align: center; border-radius: 20px; border: 2px solid #f1f5f9;">
        <div style="font-size: 3.5rem; margin-bottom: 24px;">{{ICON_2}}</div>
        <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px; color: #0f172a;">{{FEATURE_2_TITLE}}</h3>
        <p style="color: #64748b; line-height: 1.7;">{{FEATURE_2_DESC}}</p>
      </div>
      <div style="padding: 40px 32px; text-align: center; border-radius: 20px; border: 2px solid #f1f5f9;">
        <div style="font-size: 3.5rem; margin-bottom: 24px;">{{ICON_3}}</div>
        <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px; color: #0f172a;">{{FEATURE_3_TITLE}}</h3>
        <p style="color: #64748b; line-height: 1.7;">{{FEATURE_3_DESC}}</p>
      </div>
    </div>
  </div>
</div>`,
      fields: [
        { key: 'SECTION_TITLE', label: 'Section Title', type: 'text', default: 'Powerful Features' },
        { key: 'ICON_1', label: 'Icon 1 (emoji)', type: 'text', default: '⚡' },
        { key: 'FEATURE_1_TITLE', label: 'Feature 1 Title', type: 'text', default: 'Lightning Fast' },
        { key: 'FEATURE_1_DESC', label: 'Feature 1 Description', type: 'textarea', default: 'Blazing fast performance that keeps your users happy.' },
        { key: 'ICON_2', label: 'Icon 2 (emoji)', type: 'text', default: '🔒' },
        { key: 'FEATURE_2_TITLE', label: 'Feature 2 Title', type: 'text', default: 'Secure' },
        { key: 'FEATURE_2_DESC', label: 'Feature 2 Description', type: 'textarea', default: 'Bank-level security to protect your data.' },
        { key: 'ICON_3', label: 'Icon 3 (emoji)', type: 'text', default: '📊' },
        { key: 'FEATURE_3_TITLE', label: 'Feature 3 Title', type: 'text', default: 'Analytics' },
        { key: 'FEATURE_3_DESC', label: 'Feature 3 Description', type: 'textarea', default: 'Real-time insights to make smarter decisions.' }
      ]
    },
    {
      id: 'how-it-works',
      category: 'Process',
      name: 'How It Works',
      icon: '🔄',
      description: 'Step-by-step process (4 steps)',
      html: `<div style="padding: 100px 32px; background: #faf5ff;">
  <div style="max-width: 1200px; margin: 0 auto;">
    <h2 style="text-align: center; font-size: 3rem; font-weight: 900; margin-bottom: 80px; color: #0f172a;">{{SECTION_TITLE}}</h2>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px;">
      <div style="text-align: center;">
        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 900; margin: 0 auto 24px; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);">1</div>
        <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 12px; color: #0f172a;">{{STEP_1_TITLE}}</h3>
        <p style="color: #64748b; line-height: 1.7;">{{STEP_1_DESC}}</p>
      </div>
      <div style="text-align: center;">
        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 900; margin: 0 auto 24px; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);">2</div>
        <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 12px; color: #0f172a;">{{STEP_2_TITLE}}</h3>
        <p style="color: #64748b; line-height: 1.7;">{{STEP_2_DESC}}</p>
      </div>
      <div style="text-align: center;">
        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 900; margin: 0 auto 24px; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);">3</div>
        <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 12px; color: #0f172a;">{{STEP_3_TITLE}}</h3>
        <p style="color: #64748b; line-height: 1.7;">{{STEP_3_DESC}}</p>
      </div>
      <div style="text-align: center;">
        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 900; margin: 0 auto 24px; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);">4</div>
        <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 12px; color: #0f172a;">{{STEP_4_TITLE}}</h3>
        <p style="color: #64748b; line-height: 1.7;">{{STEP_4_DESC}}</p>
      </div>
    </div>
  </div>
</div>`,
      fields: [
        { key: 'SECTION_TITLE', label: 'Section Title', type: 'text', default: 'How It Works' },
        { key: 'STEP_1_TITLE', label: 'Step 1 Title', type: 'text', default: 'Contact Us' },
        { key: 'STEP_1_DESC', label: 'Step 1 Description', type: 'textarea', default: 'Reach out via phone or form' },
        { key: 'STEP_2_TITLE', label: 'Step 2 Title', type: 'text', default: 'Consultation' },
        { key: 'STEP_2_DESC', label: 'Step 2 Description', type: 'textarea', default: 'Free assessment and quote' },
        { key: 'STEP_3_TITLE', label: 'Step 3 Title', type: 'text', default: 'Service' },
        { key: 'STEP_3_DESC', label: 'Step 3 Description', type: 'textarea', default: 'Professional work completed' },
        { key: 'STEP_4_TITLE', label: 'Step 4 Title', type: 'text', default: 'Follow-Up' },
        { key: 'STEP_4_DESC', label: 'Step 4 Description', type: 'textarea', default: 'Ensure your satisfaction' }
      ]
    },
    {
      id: 'testimonial-single',
      category: 'Social Proof',
      name: 'Testimonial',
      icon: '💬',
      description: 'Single customer review',
      html: `<div style="padding: 100px 32px; background: #f8fafc;">
  <div style="max-width: 800px; margin: 0 auto; background: white; padding: 48px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); position: relative;">
    <div style="position: absolute; top: 24px; right: 24px; font-size: 4rem; color: #e9d5ff; opacity: 0.5;">"</div>
    <div style="margin-bottom: 24px; color: #fbbf24; font-size: 1.5rem;">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
    <p style="font-size: 1.5rem; line-height: 1.8; color: #1e293b; margin-bottom: 32px; font-style: italic; position: relative; z-index: 1;">{{QUOTE}}</p>
    <div style="display: flex; align-items: center; gap: 16px;">
      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.5rem;">{{INITIAL}}</div>
      <div>
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">{{NAME}}</div>
        <div style="color: #64748b; font-size: 0.9rem;">{{TITLE}}</div>
      </div>
    </div>
  </div>
</div>`,
      fields: [
        { key: 'QUOTE', label: 'Testimonial Quote', type: 'textarea', default: 'This product changed everything for our business. Highly recommended!' },
        { key: 'INITIAL', label: 'Initial', type: 'text', default: 'JD' },
        { key: 'NAME', label: 'Customer Name', type: 'text', default: 'John Doe' },
        { key: 'TITLE', label: 'Title/Company', type: 'text', default: 'CEO, Example Corp' }
      ]
    },
    {
      id: 'cta-banner',
      category: 'CTAs',
      name: 'CTA Banner',
      icon: '🚀',
      description: 'Final call-to-action section',
      html: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 32px; text-align: center;">
  <div style="max-width: 800px; margin: 0 auto;">
    <h2 style="font-size: 3rem; font-weight: 900; margin-bottom: 24px;">{{HEADLINE}}</h2>
    <p style="font-size: 1.3rem; margin-bottom: 48px; opacity: 0.95;">{{SUBHEADLINE}}</p>
    <a href="#contact" style="display: inline-block; background: white; color: #667eea; padding: 24px 60px; border-radius: 12px; font-size: 1.3rem; font-weight: 900; text-decoration: none; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">{{CTA_TEXT}}</a>
  </div>
</div>`,
      fields: [
        { key: 'HEADLINE', label: 'Headline', type: 'text', default: 'Ready to Get Started?' },
        { key: 'SUBHEADLINE', label: 'Subheadline', type: 'textarea', default: 'Join thousands of satisfied customers today' },
        { key: 'CTA_TEXT', label: 'Button Text', type: 'text', default: 'Start Free Trial' }
      ]
    }
  ];

  const categories = ['all', ...new Set(sectionLibrary.map(s => s.category))];

  const filteredSections = selectedCategory === 'all'
    ? sectionLibrary
    : sectionLibrary.filter(s => s.category === selectedCategory);

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

  const generateHTML = () => {
    const sectionsHTML = sections.map(section => {
      let html = section.html;
      Object.keys(section.data).forEach(key => {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), section.data[key]);
      });
      return html;
    }).join('\n\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{KEYWORD}} - {{LOCATION}}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1e293b; }
  </style>
</head>
<body>
${sectionsHTML}
</body>
</html>`;
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
      const { data, error } = await supabase
        .from('templates')
        .insert({
          name: templateName,
          category: templateCategory,
          structure: generateHTML(),
          user_id: session.user.id
        })
        .select()
        .single();

      if (error) throw error;
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
    <div className="fixed inset-0 bg-black/50 z-[200] flex">
      {/* Left sidebar — Element library */}
      <div className="w-80 bg-white dark:bg-[#18181b] border-r border-slate-200 dark:border-[#27272a] flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-200 dark:border-[#27272a]">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">Template Builder</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Click elements to add them to your page</p>
        </div>

        {/* Category filter */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-[#27272a]">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-[#27272a] border border-slate-200 dark:border-[#3f3f46] rounded-lg text-slate-900 dark:text-white text-sm font-semibold"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Elements' : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredSections.map(section => (
            <button
              key={section.id}
              onClick={() => addSection(section)}
              className="w-full text-left p-4 bg-slate-50 dark:bg-[#27272a] hover:bg-[#f2f1fe] dark:hover:bg-[#5b4cdb]/10 hover:border-[#5b4cdb] rounded-xl transition-all border border-slate-200 dark:border-[#3f3f46] group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{section.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white text-sm mb-0.5 group-hover:text-[#5b4cdb] transition-colors">{section.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{section.description}</div>
                  <div className="mt-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-200 dark:bg-[#3f3f46] text-slate-600 dark:text-slate-400 rounded-full">
                      {section.category}
                    </span>
                  </div>
                </div>
                <span className="text-slate-300 dark:text-slate-600 group-hover:text-[#5b4cdb] text-lg font-bold transition-colors">+</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Center — Section editor */}
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0f0f10]">
        <div className="max-w-3xl mx-auto p-8">
          {/* Template info */}
          <div className="bg-white dark:bg-[#18181b] rounded-2xl p-6 mb-6 border border-slate-200 dark:border-[#27272a]">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full text-2xl font-black bg-transparent border-none outline-none text-slate-900 dark:text-white mb-4 placeholder:text-slate-300"
              placeholder="Template Name"
            />
            <select
              value={templateCategory}
              onChange={(e) => setTemplateCategory(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-[#27272a] border border-slate-200 dark:border-[#3f3f46] rounded-lg text-slate-900 dark:text-white text-sm"
            >
              <option>Custom</option>
              <option>Local Services</option>
              <option>SaaS &amp; Technology</option>
              <option>E-Commerce &amp; Retail</option>
              <option>Professional Services</option>
              <option>Restaurant &amp; Food</option>
            </select>
          </div>

          {/* Sections */}
          {sections.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <div className="text-6xl mb-4">👈</div>
              <p className="text-lg font-medium">Add elements from the library to start building</p>
              <p className="text-sm mt-2">Each element is fully customizable</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((section, index) => (
                <div key={section.id} className="bg-white dark:bg-[#18181b] rounded-2xl p-6 border border-slate-200 dark:border-[#27272a]">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{section.name}</h3>
                    <div className="flex items-center gap-1">
                      {index > 0 && (
                        <button
                          onClick={() => moveSection(index, 'up')}
                          title="Move up"
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-[#27272a] rounded-lg text-slate-500 transition-colors text-sm"
                        >
                          ↑
                        </button>
                      )}
                      {index < sections.length - 1 && (
                        <button
                          onClick={() => moveSection(index, 'down')}
                          title="Move down"
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-[#27272a] rounded-lg text-slate-500 transition-colors text-sm"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        onClick={() => removeSection(section.id)}
                        title="Remove"
                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {section.fields.map(field => (
                      <div key={field.key}>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                          {field.label}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            value={section.data[field.key] || ''}
                            onChange={(e) => updateSectionData(section.id, field.key, e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-[#27272a] border border-slate-200 dark:border-[#3f3f46] rounded-lg text-slate-900 dark:text-white text-sm resize-none focus:outline-none focus:border-[#5b4cdb]"
                            rows={3}
                          />
                        ) : (
                          <input
                            type="text"
                            value={section.data[field.key] || ''}
                            onChange={(e) => updateSectionData(section.id, field.key, e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-[#27272a] border border-slate-200 dark:border-[#3f3f46] rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#5b4cdb]"
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

      {/* Right sidebar — Preview & actions */}
      <div className="w-96 bg-white dark:bg-[#18181b] border-l border-slate-200 dark:border-[#27272a] flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-200 dark:border-[#27272a]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Preview
              {sections.length > 0 && (
                <span className="ml-2 text-xs font-normal text-slate-400">
                  {sections.length} section{sections.length !== 1 ? 's' : ''}
                </span>
              )}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-[#27272a] rounded-lg text-slate-500 transition-colors text-sm"
            >
              ✕
            </button>
          </div>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="w-full px-4 py-2 bg-slate-100 dark:bg-[#27272a] text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-[#3f3f46] transition-all text-sm"
          >
            {previewMode ? 'Close Preview' : 'Open Preview'}
          </button>
        </div>

        <div className="flex-1 overflow-hidden bg-slate-50 dark:bg-[#0f0f10]">
          {previewMode && sections.length > 0 ? (
            <iframe
              srcDoc={generateHTML()
                .replace(/\{\{KEYWORD\}\}/g, 'Preview Service')
                .replace(/\{\{LOCATION\}\}/g, 'Your City')}
              className="w-full h-full border-none"
              title="Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm p-8 text-center">
              {sections.length === 0
                ? 'Add sections then click Open Preview'
                : 'Click Open Preview to see your template'}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-[#27272a] space-y-3">
          <button
            onClick={handleSave}
            disabled={sections.length === 0 || saving}
            className="w-full px-6 py-3 bg-[#5b4cdb] text-white font-bold rounded-xl hover:bg-[#4a3dc4] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? 'Saving...' : 'Save Template'}
          </button>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-slate-100 dark:bg-[#27272a] text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-[#3f3f46] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
