'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function TemplateBuilder({ onClose, onSave, session }) {
  const [templateName, setTemplateName] = useState('My Custom Template');
  const [templateCategory, setTemplateCategory] = useState('Custom');
  const [sections, setSections] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [saving, setSaving] = useState(false);

  const sectionLibrary = [
    // ─── Navigation ──────────────────────────────────────────────────────────
    {
      id: 'nav-simple',
      category: 'Navigation',
      name: 'Navigation Bar',
      icon: '▤',
      description: 'Logo left, CTA button right',
      html: `<nav style="background:#fff;border-bottom:1px solid #e5e7eb;padding:18px 5%;">
  <div style="max-width:1080px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:1rem;font-weight:700;color:#111;">{{NAV_LOGO}}</div>
    <a href="#contact" style="background:#111;color:#fff;padding:10px 20px;border-radius:7px;font-size:.875rem;font-weight:600;text-decoration:none;">{{NAV_CTA}}</a>
  </div>
</nav>`,
      fields: [
        { key: 'NAV_LOGO', label: 'Logo / Business Name', type: 'text', default: '{{KEYWORD}}' },
        { key: 'NAV_CTA', label: 'Button Text', type: 'text', default: 'Get in touch' }
      ]
    },
    {
      id: 'nav-links',
      category: 'Navigation',
      name: 'Nav with Links',
      icon: '▤',
      description: 'Logo, nav links, and CTA',
      html: `<nav style="background:#0f172a;padding:18px 5%;">
  <div style="max-width:1080px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:1rem;font-weight:700;color:#fff;">{{NAV_LOGO}}</div>
    <div style="display:flex;gap:28px;align-items:center;">
      <a href="#services" style="font-size:.875rem;color:#94a3b8;text-decoration:none;font-weight:500;">{{LINK_1}}</a>
      <a href="#about" style="font-size:.875rem;color:#94a3b8;text-decoration:none;font-weight:500;">{{LINK_2}}</a>
      <a href="#contact" style="background:#2563eb;color:#fff;padding:9px 18px;border-radius:6px;font-size:.8125rem;font-weight:600;text-decoration:none;">{{NAV_CTA}}</a>
    </div>
  </div>
</nav>`,
      fields: [
        { key: 'NAV_LOGO', label: 'Logo / Business Name', type: 'text', default: '{{KEYWORD}}' },
        { key: 'LINK_1', label: 'Link 1 Text', type: 'text', default: 'Services' },
        { key: 'LINK_2', label: 'Link 2 Text', type: 'text', default: 'About' },
        { key: 'NAV_CTA', label: 'Button Text', type: 'text', default: 'Contact us' }
      ]
    },

    // ─── Heroes ───────────────────────────────────────────────────────────────
    {
      id: 'hero-clean',
      category: 'Hero',
      name: 'Clean Hero',
      icon: '◼',
      description: 'Left-aligned headline, subtext, two buttons',
      html: `<section style="padding:88px 5%;background:#fff;border-bottom:1px solid #e5e7eb;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;margin-bottom:18px;">{{HERO_EYEBROW}}</div>
    <h1 style="font-size:clamp(2.25rem,5vw,3.5rem);font-weight:800;line-height:1.1;color:#111;margin-bottom:20px;max-width:740px;">{{HERO_HEADLINE}}</h1>
    <p style="font-size:1.0625rem;color:#6b7280;max-width:520px;line-height:1.75;margin-bottom:36px;">{{HERO_SUBHEADLINE}}</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <a href="#contact" style="background:#111;color:#fff;padding:13px 26px;border-radius:8px;font-weight:600;font-size:.9375rem;text-decoration:none;">{{CTA_PRIMARY}}</a>
      <a href="#services" style="color:#111;padding:13px 26px;border-radius:8px;font-weight:600;font-size:.9375rem;border:1px solid #e5e7eb;text-decoration:none;">{{CTA_SECONDARY}}</a>
    </div>
  </div>
</section>`,
      fields: [
        { key: 'HERO_EYEBROW', label: 'Eyebrow label', type: 'text', default: '{{SERVICE}} in {{LOCATION}}' },
        { key: 'HERO_HEADLINE', label: 'Main Headline', type: 'text', default: '{{HERO_HEADLINE}}' },
        { key: 'HERO_SUBHEADLINE', label: 'Subheadline', type: 'textarea', default: '{{HERO_SUBHEADLINE}}' },
        { key: 'CTA_PRIMARY', label: 'Primary Button', type: 'text', default: 'Get a free quote' },
        { key: 'CTA_SECONDARY', label: 'Secondary Button', type: 'text', default: 'Learn more' }
      ]
    },
    {
      id: 'hero-dark',
      category: 'Hero',
      name: 'Bold Dark Hero',
      icon: '◼',
      description: 'Dark background, large headline, numbered stats',
      html: `<section style="background:#0a0a0a;padding:100px 5%;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="font-size:.75rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#7c3aed;margin-bottom:20px;">{{HERO_EYEBROW}}</div>
    <h1 style="font-size:clamp(2.5rem,6vw,4.5rem);font-weight:900;line-height:1.05;color:#fff;margin-bottom:24px;max-width:800px;">{{HERO_HEADLINE}}</h1>
    <p style="font-size:1.125rem;color:#a3a3a3;max-width:500px;line-height:1.75;margin-bottom:40px;">{{HERO_SUBHEADLINE}}</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:56px;">
      <a href="#contact" style="background:#7c3aed;color:#fff;padding:14px 28px;border-radius:8px;font-weight:700;font-size:.9375rem;text-decoration:none;">{{CTA_PRIMARY}}</a>
      <a href="#services" style="color:#a3a3a3;padding:14px 28px;border-radius:8px;font-weight:600;font-size:.9375rem;border:1px solid #2a2a2a;text-decoration:none;">{{CTA_SECONDARY}}</a>
    </div>
    <div style="display:flex;gap:48px;flex-wrap:wrap;padding-top:40px;border-top:1px solid #1f1f1f;">
      <div><div style="font-size:2rem;font-weight:800;color:#fff;">{{STAT_1_NUM}}</div><div style="font-size:.8125rem;color:#6b7280;margin-top:4px;">{{STAT_1_LBL}}</div></div>
      <div><div style="font-size:2rem;font-weight:800;color:#fff;">{{STAT_2_NUM}}</div><div style="font-size:.8125rem;color:#6b7280;margin-top:4px;">{{STAT_2_LBL}}</div></div>
      <div><div style="font-size:2rem;font-weight:800;color:#fff;">{{STAT_3_NUM}}</div><div style="font-size:.8125rem;color:#6b7280;margin-top:4px;">{{STAT_3_LBL}}</div></div>
    </div>
  </div>
</section>`,
      fields: [
        { key: 'HERO_EYEBROW', label: 'Eyebrow label', type: 'text', default: '{{SERVICE}} — {{LOCATION}}' },
        { key: 'HERO_HEADLINE', label: 'Main Headline', type: 'text', default: '{{HERO_HEADLINE}}' },
        { key: 'HERO_SUBHEADLINE', label: 'Subheadline', type: 'textarea', default: '{{HERO_SUBHEADLINE}}' },
        { key: 'CTA_PRIMARY', label: 'Primary Button', type: 'text', default: 'Get started' },
        { key: 'CTA_SECONDARY', label: 'Secondary Button', type: 'text', default: 'See our work' },
        { key: 'STAT_1_NUM', label: 'Stat 1 Number', type: 'text', default: '{{STAT_1_NUMBER}}' },
        { key: 'STAT_1_LBL', label: 'Stat 1 Label', type: 'text', default: '{{STAT_1_LABEL}}' },
        { key: 'STAT_2_NUM', label: 'Stat 2 Number', type: 'text', default: '{{STAT_2_NUMBER}}' },
        { key: 'STAT_2_LBL', label: 'Stat 2 Label', type: 'text', default: '{{STAT_2_LABEL}}' },
        { key: 'STAT_3_NUM', label: 'Stat 3 Number', type: 'text', default: '{{STAT_3_NUMBER}}' },
        { key: 'STAT_3_LBL', label: 'Stat 3 Label', type: 'text', default: '{{STAT_3_LABEL}}' }
      ]
    },
    {
      id: 'hero-centered',
      category: 'Hero',
      name: 'Centered Hero',
      icon: '◼',
      description: 'Everything centered, large clean type',
      html: `<section style="padding:100px 5%;background:#fff;text-align:center;">
  <div style="max-width:860px;margin:0 auto;">
    <div style="display:inline-block;background:#f3f4f6;padding:5px 14px;border-radius:20px;font-size:.8125rem;font-weight:600;color:#6b7280;margin-bottom:28px;">{{HERO_EYEBROW}}</div>
    <h1 style="font-size:clamp(2.5rem,6vw,4.5rem);font-weight:900;line-height:1.05;color:#111;margin-bottom:24px;">{{HERO_HEADLINE}}</h1>
    <p style="font-size:1.125rem;color:#6b7280;max-width:560px;margin:0 auto 40px;line-height:1.75;">{{HERO_SUBHEADLINE}}</p>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
      <a href="#contact" style="background:#111;color:#fff;padding:13px 28px;border-radius:8px;font-weight:600;font-size:.9375rem;text-decoration:none;">{{CTA_PRIMARY}}</a>
      <a href="#services" style="background:#f3f4f6;color:#111;padding:13px 28px;border-radius:8px;font-weight:600;font-size:.9375rem;text-decoration:none;">{{CTA_SECONDARY}}</a>
    </div>
  </div>
</section>`,
      fields: [
        { key: 'HERO_EYEBROW', label: 'Eyebrow label', type: 'text', default: '{{SERVICE}} in {{LOCATION}}' },
        { key: 'HERO_HEADLINE', label: 'Main Headline', type: 'text', default: '{{HERO_HEADLINE}}' },
        { key: 'HERO_SUBHEADLINE', label: 'Subheadline', type: 'textarea', default: '{{HERO_SUBHEADLINE}}' },
        { key: 'CTA_PRIMARY', label: 'Primary Button', type: 'text', default: 'Get a free quote' },
        { key: 'CTA_SECONDARY', label: 'Secondary Button', type: 'text', default: 'See services' }
      ]
    },

    // ─── Trust ────────────────────────────────────────────────────────────────
    {
      id: 'trust-bar',
      category: 'Trust',
      name: 'Trust Bar',
      icon: '—',
      description: 'Horizontal row of trust signals',
      html: `<div style="background:#f8fafc;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;padding:20px 5%;">
  <div style="max-width:1080px;margin:0 auto;display:flex;gap:40px;flex-wrap:wrap;align-items:center;">
    <span style="font-size:.875rem;font-weight:600;color:#475569;">{{TRUST_1}}</span>
    <span style="font-size:.875rem;font-weight:600;color:#475569;">{{TRUST_2}}</span>
    <span style="font-size:.875rem;font-weight:600;color:#475569;">{{TRUST_3}}</span>
    <span style="font-size:.875rem;font-weight:600;color:#475569;">{{TRUST_4}}</span>
  </div>
</div>`,
      fields: [
        { key: 'TRUST_1', label: 'Trust item 1', type: 'text', default: '{{TRUST_1}}' },
        { key: 'TRUST_2', label: 'Trust item 2', type: 'text', default: '{{TRUST_2}}' },
        { key: 'TRUST_3', label: 'Trust item 3', type: 'text', default: '{{TRUST_3}}' },
        { key: 'TRUST_4', label: 'Trust item 4', type: 'text', default: '{{TRUST_4}}' }
      ]
    },
    {
      id: 'stats-row',
      category: 'Trust',
      name: 'Stats Row',
      icon: '—',
      description: 'Three key metrics side by side',
      html: `<div style="padding:64px 5%;background:#fff;border-top:1px solid #e5e7eb;">
  <div style="max-width:1080px;margin:0 auto;display:flex;gap:56px;flex-wrap:wrap;">
    <div><div style="font-size:2.5rem;font-weight:800;color:#111;line-height:1;">{{STAT_1_NUM}}</div><div style="font-size:.875rem;color:#6b7280;margin-top:6px;">{{STAT_1_LBL}}</div></div>
    <div><div style="font-size:2.5rem;font-weight:800;color:#111;line-height:1;">{{STAT_2_NUM}}</div><div style="font-size:.875rem;color:#6b7280;margin-top:6px;">{{STAT_2_LBL}}</div></div>
    <div><div style="font-size:2.5rem;font-weight:800;color:#111;line-height:1;">{{STAT_3_NUM}}</div><div style="font-size:.875rem;color:#6b7280;margin-top:6px;">{{STAT_3_LBL}}</div></div>
  </div>
</div>`,
      fields: [
        { key: 'STAT_1_NUM', label: 'Stat 1 Number', type: 'text', default: '{{STAT_1_NUMBER}}' },
        { key: 'STAT_1_LBL', label: 'Stat 1 Label', type: 'text', default: '{{STAT_1_LABEL}}' },
        { key: 'STAT_2_NUM', label: 'Stat 2 Number', type: 'text', default: '{{STAT_2_NUMBER}}' },
        { key: 'STAT_2_LBL', label: 'Stat 2 Label', type: 'text', default: '{{STAT_2_LABEL}}' },
        { key: 'STAT_3_NUM', label: 'Stat 3 Number', type: 'text', default: '{{STAT_3_NUMBER}}' },
        { key: 'STAT_3_LBL', label: 'Stat 3 Label', type: 'text', default: '{{STAT_3_LABEL}}' }
      ]
    },

    // ─── Services / Features ──────────────────────────────────────────────────
    {
      id: 'services-3card',
      category: 'Services',
      name: '3-Card Grid',
      icon: '▦',
      description: 'Three bordered service cards with section header',
      html: `<section style="padding:72px 5%;background:#fff;border-top:1px solid #e5e7eb;" id="services">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;margin-bottom:12px;">{{SEC_LABEL}}</div>
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:700;color:#111;margin-bottom:14px;">{{SEC_HEADLINE}}</h2>
    <p style="font-size:1rem;color:#6b7280;max-width:520px;line-height:1.75;margin-bottom:48px;">{{SEC_LEAD}}</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
      <div style="padding:28px;border:1px solid #e5e7eb;border-radius:10px;">
        <div style="font-size:.9375rem;font-weight:700;color:#111;margin-bottom:8px;">{{CARD_1_TITLE}}</div>
        <div style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{CARD_1_TEXT}}</div>
      </div>
      <div style="padding:28px;border:1px solid #e5e7eb;border-radius:10px;">
        <div style="font-size:.9375rem;font-weight:700;color:#111;margin-bottom:8px;">{{CARD_2_TITLE}}</div>
        <div style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{CARD_2_TEXT}}</div>
      </div>
      <div style="padding:28px;border:1px solid #e5e7eb;border-radius:10px;">
        <div style="font-size:.9375rem;font-weight:700;color:#111;margin-bottom:8px;">{{CARD_3_TITLE}}</div>
        <div style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{CARD_3_TEXT}}</div>
      </div>
    </div>
  </div>
</section>`,
      fields: [
        { key: 'SEC_LABEL', label: 'Section label', type: 'text', default: 'What we do' },
        { key: 'SEC_HEADLINE', label: 'Section headline', type: 'text', default: '{{SERVICES_HEADLINE}}' },
        { key: 'SEC_LEAD', label: 'Lead paragraph', type: 'textarea', default: '{{SERVICES_INTRO}}' },
        { key: 'CARD_1_TITLE', label: 'Card 1 Title', type: 'text', default: '{{FEATURE_1_TITLE}}' },
        { key: 'CARD_1_TEXT', label: 'Card 1 Text', type: 'textarea', default: '{{FEATURE_1_TEXT}}' },
        { key: 'CARD_2_TITLE', label: 'Card 2 Title', type: 'text', default: '{{FEATURE_2_TITLE}}' },
        { key: 'CARD_2_TEXT', label: 'Card 2 Text', type: 'textarea', default: '{{FEATURE_2_TEXT}}' },
        { key: 'CARD_3_TITLE', label: 'Card 3 Title', type: 'text', default: '{{FEATURE_3_TITLE}}' },
        { key: 'CARD_3_TEXT', label: 'Card 3 Text', type: 'textarea', default: '{{FEATURE_3_TEXT}}' }
      ]
    },
    {
      id: 'services-4card',
      category: 'Services',
      name: '4-Card Grid',
      icon: '▦',
      description: 'Four bordered service cards',
      html: `<section style="padding:72px 5%;background:#f9fafb;border-top:1px solid #e5e7eb;" id="services">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;margin-bottom:12px;">{{SEC_LABEL}}</div>
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:700;color:#111;margin-bottom:14px;">{{SEC_HEADLINE}}</h2>
    <p style="font-size:1rem;color:#6b7280;max-width:520px;line-height:1.75;margin-bottom:48px;">{{SEC_LEAD}}</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;">
      <div style="padding:24px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;">
        <div style="font-size:.9375rem;font-weight:700;color:#111;margin-bottom:8px;">{{CARD_1_TITLE}}</div>
        <div style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{CARD_1_TEXT}}</div>
      </div>
      <div style="padding:24px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;">
        <div style="font-size:.9375rem;font-weight:700;color:#111;margin-bottom:8px;">{{CARD_2_TITLE}}</div>
        <div style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{CARD_2_TEXT}}</div>
      </div>
      <div style="padding:24px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;">
        <div style="font-size:.9375rem;font-weight:700;color:#111;margin-bottom:8px;">{{CARD_3_TITLE}}</div>
        <div style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{CARD_3_TEXT}}</div>
      </div>
      <div style="padding:24px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;">
        <div style="font-size:.9375rem;font-weight:700;color:#111;margin-bottom:8px;">{{CARD_4_TITLE}}</div>
        <div style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{CARD_4_TEXT}}</div>
      </div>
    </div>
  </div>
</section>`,
      fields: [
        { key: 'SEC_LABEL', label: 'Section label', type: 'text', default: 'What we offer' },
        { key: 'SEC_HEADLINE', label: 'Section headline', type: 'text', default: '{{SERVICES_HEADLINE}}' },
        { key: 'SEC_LEAD', label: 'Lead paragraph', type: 'textarea', default: '{{SERVICES_INTRO}}' },
        { key: 'CARD_1_TITLE', label: 'Card 1 Title', type: 'text', default: '{{FEATURE_1_TITLE}}' },
        { key: 'CARD_1_TEXT', label: 'Card 1 Text', type: 'textarea', default: '{{FEATURE_1_TEXT}}' },
        { key: 'CARD_2_TITLE', label: 'Card 2 Title', type: 'text', default: '{{FEATURE_2_TITLE}}' },
        { key: 'CARD_2_TEXT', label: 'Card 2 Text', type: 'textarea', default: '{{FEATURE_2_TEXT}}' },
        { key: 'CARD_3_TITLE', label: 'Card 3 Title', type: 'text', default: '{{FEATURE_3_TITLE}}' },
        { key: 'CARD_3_TEXT', label: 'Card 3 Text', type: 'textarea', default: '{{FEATURE_3_TEXT}}' },
        { key: 'CARD_4_TITLE', label: 'Card 4 Title', type: 'text', default: '{{FEATURE_4_TITLE}}' },
        { key: 'CARD_4_TEXT', label: 'Card 4 Text', type: 'textarea', default: '{{FEATURE_4_TEXT}}' }
      ]
    },
    {
      id: 'feature-list',
      category: 'Services',
      name: 'Feature List',
      icon: '▦',
      description: 'Vertical list with accent markers',
      html: `<section style="padding:72px 5%;background:#fff;border-top:1px solid #e5e7eb;">
  <div style="max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:start;">
    <div>
      <div style="font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;margin-bottom:12px;">{{SEC_LABEL}}</div>
      <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:700;color:#111;margin-bottom:14px;">{{SEC_HEADLINE}}</h2>
      <p style="font-size:1rem;color:#6b7280;line-height:1.75;">{{SEC_LEAD}}</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:24px;">
      <div style="display:flex;gap:16px;">
        <div style="width:4px;background:#5b4cdb;border-radius:2px;flex-shrink:0;"></div>
        <div><div style="font-size:.9375rem;font-weight:600;color:#111;margin-bottom:4px;">{{FEAT_1_TITLE}}</div><div style="font-size:.875rem;color:#6b7280;line-height:1.65;">{{FEAT_1_TEXT}}</div></div>
      </div>
      <div style="display:flex;gap:16px;">
        <div style="width:4px;background:#5b4cdb;border-radius:2px;flex-shrink:0;"></div>
        <div><div style="font-size:.9375rem;font-weight:600;color:#111;margin-bottom:4px;">{{FEAT_2_TITLE}}</div><div style="font-size:.875rem;color:#6b7280;line-height:1.65;">{{FEAT_2_TEXT}}</div></div>
      </div>
      <div style="display:flex;gap:16px;">
        <div style="width:4px;background:#5b4cdb;border-radius:2px;flex-shrink:0;"></div>
        <div><div style="font-size:.9375rem;font-weight:600;color:#111;margin-bottom:4px;">{{FEAT_3_TITLE}}</div><div style="font-size:.875rem;color:#6b7280;line-height:1.65;">{{FEAT_3_TEXT}}</div></div>
      </div>
    </div>
  </div>
</section>`,
      fields: [
        { key: 'SEC_LABEL', label: 'Section label', type: 'text', default: 'Why choose us' },
        { key: 'SEC_HEADLINE', label: 'Headline', type: 'text', default: '{{WHY_HEADLINE}}' },
        { key: 'SEC_LEAD', label: 'Lead text', type: 'textarea', default: '{{WHY_INTRO}}' },
        { key: 'FEAT_1_TITLE', label: 'Item 1 Title', type: 'text', default: '{{FEATURE_1_TITLE}}' },
        { key: 'FEAT_1_TEXT', label: 'Item 1 Text', type: 'textarea', default: '{{FEATURE_1_TEXT}}' },
        { key: 'FEAT_2_TITLE', label: 'Item 2 Title', type: 'text', default: '{{FEATURE_2_TITLE}}' },
        { key: 'FEAT_2_TEXT', label: 'Item 2 Text', type: 'textarea', default: '{{FEATURE_2_TEXT}}' },
        { key: 'FEAT_3_TITLE', label: 'Item 3 Title', type: 'text', default: '{{FEATURE_3_TITLE}}' },
        { key: 'FEAT_3_TEXT', label: 'Item 3 Text', type: 'textarea', default: '{{FEATURE_3_TEXT}}' }
      ]
    },

    // ─── Process ──────────────────────────────────────────────────────────────
    {
      id: 'how-it-works',
      category: 'Process',
      name: 'How It Works',
      icon: '→',
      description: 'Numbered 4-step process',
      html: `<section style="padding:80px 5%;background:#f9fafb;border-top:1px solid #e5e7eb;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;margin-bottom:12px;text-align:center;">{{SEC_LABEL}}</div>
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:700;color:#111;margin-bottom:48px;text-align:center;">{{SEC_HEADLINE}}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:32px;">
      <div style="text-align:center;padding:24px;">
        <div style="width:48px;height:48px;background:#111;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:800;margin:0 auto 20px;">1</div>
        <h3 style="font-size:1rem;font-weight:700;color:#111;margin-bottom:8px;">{{STEP_1_TITLE}}</h3>
        <p style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{STEP_1_DESC}}</p>
      </div>
      <div style="text-align:center;padding:24px;">
        <div style="width:48px;height:48px;background:#111;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:800;margin:0 auto 20px;">2</div>
        <h3 style="font-size:1rem;font-weight:700;color:#111;margin-bottom:8px;">{{STEP_2_TITLE}}</h3>
        <p style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{STEP_2_DESC}}</p>
      </div>
      <div style="text-align:center;padding:24px;">
        <div style="width:48px;height:48px;background:#111;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:800;margin:0 auto 20px;">3</div>
        <h3 style="font-size:1rem;font-weight:700;color:#111;margin-bottom:8px;">{{STEP_3_TITLE}}</h3>
        <p style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{STEP_3_DESC}}</p>
      </div>
      <div style="text-align:center;padding:24px;">
        <div style="width:48px;height:48px;background:#111;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:800;margin:0 auto 20px;">4</div>
        <h3 style="font-size:1rem;font-weight:700;color:#111;margin-bottom:8px;">{{STEP_4_TITLE}}</h3>
        <p style="font-size:.875rem;color:#6b7280;line-height:1.7;">{{STEP_4_DESC}}</p>
      </div>
    </div>
  </div>
</section>`,
      fields: [
        { key: 'SEC_LABEL', label: 'Section label', type: 'text', default: 'How it works' },
        { key: 'SEC_HEADLINE', label: 'Section headline', type: 'text', default: 'Simple, transparent process' },
        { key: 'STEP_1_TITLE', label: 'Step 1 Title', type: 'text', default: 'Contact us' },
        { key: 'STEP_1_DESC', label: 'Step 1 Description', type: 'textarea', default: 'Reach out via phone or email' },
        { key: 'STEP_2_TITLE', label: 'Step 2 Title', type: 'text', default: 'Free consultation' },
        { key: 'STEP_2_DESC', label: 'Step 2 Description', type: 'textarea', default: 'We assess your needs and provide a quote' },
        { key: 'STEP_3_TITLE', label: 'Step 3 Title', type: 'text', default: 'We get to work' },
        { key: 'STEP_3_DESC', label: 'Step 3 Description', type: 'textarea', default: 'Professional service delivered on time' },
        { key: 'STEP_4_TITLE', label: 'Step 4 Title', type: 'text', default: 'Your satisfaction' },
        { key: 'STEP_4_DESC', label: 'Step 4 Description', type: 'textarea', default: "We follow up to ensure you're happy" }
      ]
    },

    // ─── Social Proof ─────────────────────────────────────────────────────────
    {
      id: 'testimonials-2col',
      category: 'Social Proof',
      name: '2-Column Testimonials',
      icon: '"',
      description: 'Two testimonial cards side by side',
      html: `<section style="padding:72px 5%;background:#fff;border-top:1px solid #e5e7eb;" id="reviews">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;margin-bottom:12px;">{{SEC_LABEL}}</div>
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:700;color:#111;margin-bottom:14px;">{{SEC_HEADLINE}}</h2>
    <p style="font-size:1rem;color:#6b7280;max-width:520px;line-height:1.75;margin-bottom:48px;">{{SEC_LEAD}}</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;">
      <div style="background:#f9fafb;padding:28px;border-radius:10px;">
        <p style="font-size:.9375rem;color:#374151;line-height:1.75;margin-bottom:18px;font-style:italic;">{{QUOTE_1}}</p>
        <div style="font-size:.8125rem;font-weight:600;color:#111;">{{NAME_1}}, {{LOCATION}}</div>
      </div>
      <div style="background:#f9fafb;padding:28px;border-radius:10px;">
        <p style="font-size:.9375rem;color:#374151;line-height:1.75;margin-bottom:18px;font-style:italic;">{{QUOTE_2}}</p>
        <div style="font-size:.8125rem;font-weight:600;color:#111;">{{NAME_2}}, {{LOCATION}}</div>
      </div>
    </div>
  </div>
</section>`,
      fields: [
        { key: 'SEC_LABEL', label: 'Section label', type: 'text', default: 'Reviews' },
        { key: 'SEC_HEADLINE', label: 'Section headline', type: 'text', default: 'Trusted across {{LOCATION}}' },
        { key: 'SEC_LEAD', label: 'Lead text', type: 'textarea', default: 'Real feedback from real customers.' },
        { key: 'QUOTE_1', label: 'Quote 1', type: 'textarea', default: '{{TESTIMONIAL_1_QUOTE}}' },
        { key: 'NAME_1', label: 'Name 1', type: 'text', default: '{{TESTIMONIAL_1_NAME}}' },
        { key: 'QUOTE_2', label: 'Quote 2', type: 'textarea', default: '{{TESTIMONIAL_2_QUOTE}}' },
        { key: 'NAME_2', label: 'Name 2', type: 'text', default: '{{TESTIMONIAL_2_NAME}}' },
        { key: 'LOCATION', label: 'Location', type: 'text', default: '{{LOCATION}}' }
      ]
    },
    {
      id: 'testimonials-3col',
      category: 'Social Proof',
      name: '3-Column Testimonials',
      icon: '"',
      description: 'Three testimonial cards',
      html: `<section style="padding:72px 5%;background:#f9fafb;border-top:1px solid #e5e7eb;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;margin-bottom:12px;text-align:center;">{{SEC_LABEL}}</div>
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:700;color:#111;margin-bottom:48px;text-align:center;">{{SEC_HEADLINE}}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
      <div style="background:#fff;padding:28px;border-radius:10px;border:1px solid #e5e7eb;">
        <p style="font-size:.9375rem;color:#374151;line-height:1.75;margin-bottom:18px;font-style:italic;">{{QUOTE_1}}</p>
        <div style="font-size:.8125rem;font-weight:600;color:#111;">{{NAME_1}}</div>
      </div>
      <div style="background:#fff;padding:28px;border-radius:10px;border:1px solid #e5e7eb;">
        <p style="font-size:.9375rem;color:#374151;line-height:1.75;margin-bottom:18px;font-style:italic;">{{QUOTE_2}}</p>
        <div style="font-size:.8125rem;font-weight:600;color:#111;">{{NAME_2}}</div>
      </div>
      <div style="background:#fff;padding:28px;border-radius:10px;border:1px solid #e5e7eb;">
        <p style="font-size:.9375rem;color:#374151;line-height:1.75;margin-bottom:18px;font-style:italic;">{{QUOTE_3}}</p>
        <div style="font-size:.8125rem;font-weight:600;color:#111;">{{NAME_3}}</div>
      </div>
    </div>
  </div>
</section>`,
      fields: [
        { key: 'SEC_LABEL', label: 'Section label', type: 'text', default: 'What people say' },
        { key: 'SEC_HEADLINE', label: 'Section headline', type: 'text', default: 'Loved by customers in {{LOCATION}}' },
        { key: 'QUOTE_1', label: 'Quote 1', type: 'textarea', default: '{{TESTIMONIAL_1_QUOTE}}' },
        { key: 'NAME_1', label: 'Name 1', type: 'text', default: '{{TESTIMONIAL_1_NAME}}' },
        { key: 'QUOTE_2', label: 'Quote 2', type: 'textarea', default: '{{TESTIMONIAL_2_QUOTE}}' },
        { key: 'NAME_2', label: 'Name 2', type: 'text', default: '{{TESTIMONIAL_2_NAME}}' },
        { key: 'QUOTE_3', label: 'Quote 3', type: 'textarea', default: '{{TESTIMONIAL_3_QUOTE}}' },
        { key: 'NAME_3', label: 'Name 3', type: 'text', default: '{{TESTIMONIAL_3_NAME}}' }
      ]
    },

    // ─── CTAs ─────────────────────────────────────────────────────────────────
    {
      id: 'cta-dark',
      category: 'CTAs',
      name: 'Dark CTA Band',
      icon: '▶',
      description: 'Full-width dark background CTA',
      html: `<section style="background:#111;padding:80px 5%;text-align:center;" id="contact">
  <div style="max-width:700px;margin:0 auto;">
    <h2 style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:800;color:#fff;margin-bottom:12px;">{{CTA_HEADLINE}}</h2>
    <p style="font-size:1rem;color:#9ca3af;margin-bottom:32px;">{{CTA_SUBTEXT}}</p>
    <a href="tel:+1-555-000-0000" style="background:#fff;color:#111;padding:14px 36px;border-radius:8px;font-weight:700;font-size:1rem;text-decoration:none;display:inline-block;">{{CTA_BTN}}</a>
  </div>
</section>`,
      fields: [
        { key: 'CTA_HEADLINE', label: 'Headline', type: 'text', default: '{{CTA_HEADLINE}}' },
        { key: 'CTA_SUBTEXT', label: 'Supporting text', type: 'textarea', default: '{{CTA_SUBTEXT}}' },
        { key: 'CTA_BTN', label: 'Button text', type: 'text', default: 'Call us now' }
      ]
    },
    {
      id: 'cta-inline',
      category: 'CTAs',
      name: 'Inline CTA',
      icon: '▶',
      description: 'Text left, button right — clean horizontal layout',
      html: `<section style="background:#0f172a;padding:64px 5%;" id="contact">
  <div style="max-width:1080px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:32px;">
    <div>
      <h2 style="font-size:clamp(1.75rem,4vw,2.5rem);font-weight:800;color:#fff;margin-bottom:8px;">{{CTA_HEADLINE}}</h2>
      <p style="font-size:1rem;color:#94a3b8;">{{CTA_SUBTEXT}}</p>
    </div>
    <a href="tel:+1-555-000-0000" style="background:#2563eb;color:#fff;padding:15px 36px;border-radius:7px;font-weight:700;font-size:1rem;text-decoration:none;white-space:nowrap;display:inline-block;">{{CTA_BTN}}</a>
  </div>
</section>`,
      fields: [
        { key: 'CTA_HEADLINE', label: 'Headline', type: 'text', default: '{{CTA_HEADLINE}}' },
        { key: 'CTA_SUBTEXT', label: 'Supporting text', type: 'textarea', default: '{{CTA_SUBTEXT}}' },
        { key: 'CTA_BTN', label: 'Button text', type: 'text', default: 'Call now' }
      ]
    },
    {
      id: 'cta-phone',
      category: 'CTAs',
      name: 'Phone CTA',
      icon: '▶',
      description: 'Conversion-focused with phone number prominent',
      html: `<section style="background:#111;padding:64px 5%;" id="contact">
  <div style="max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1fr auto;gap:40px;align-items:center;flex-wrap:wrap;">
    <div>
      <h2 style="font-size:clamp(1.5rem,3.5vw,2.5rem);font-weight:800;color:#fff;margin-bottom:10px;">{{CTA_HEADLINE}}</h2>
      <p style="font-size:.9375rem;color:#9ca3af;">{{CTA_SUBTEXT}}</p>
    </div>
    <div style="text-align:center;">
      <a href="tel:+1-555-000-0000" style="display:block;background:#16a34a;color:#fff;padding:16px 32px;border-radius:8px;font-weight:800;font-size:1.125rem;text-decoration:none;margin-bottom:8px;">{{PHONE}}</a>
      <div style="font-size:.75rem;color:#6b7280;">{{AVAILABILITY}}</div>
    </div>
  </div>
</section>`,
      fields: [
        { key: 'CTA_HEADLINE', label: 'Headline', type: 'text', default: '{{CTA_HEADLINE}}' },
        { key: 'CTA_SUBTEXT', label: 'Supporting text', type: 'textarea', default: '{{CTA_SUBTEXT}}' },
        { key: 'PHONE', label: 'Phone number', type: 'text', default: 'Call +1 (555) 000-0000' },
        { key: 'AVAILABILITY', label: 'Availability note', type: 'text', default: 'Available 7 days a week' }
      ]
    },

    // ─── Footer ───────────────────────────────────────────────────────────────
    {
      id: 'footer-simple',
      category: 'Footer',
      name: 'Simple Footer',
      icon: '▬',
      description: 'Name left, copyright right',
      html: `<footer style="padding:32px 5%;border-top:1px solid #e5e7eb;">
  <div style="max-width:1080px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:.8125rem;color:#9ca3af;">
    <span>{{FOOTER_NAME}} &mdash; {{LOCATION}}</span>
    <span>&copy; {{YEAR}} {{FOOTER_NAME}}. All rights reserved.</span>
  </div>
</footer>`,
      fields: [
        { key: 'FOOTER_NAME', label: 'Business name', type: 'text', default: '{{KEYWORD}}' },
        { key: 'LOCATION', label: 'Location', type: 'text', default: '{{LOCATION}}' },
        { key: 'YEAR', label: 'Year', type: 'text', default: '2024' }
      ]
    },
    {
      id: 'footer-dark',
      category: 'Footer',
      name: 'Dark Footer',
      icon: '▬',
      description: 'Dark background footer',
      html: `<footer style="padding:40px 5%;background:#0a0a0a;border-top:1px solid #1f1f1f;">
  <div style="max-width:1080px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:.8125rem;color:#4b5563;">
    <span>{{FOOTER_NAME}} &mdash; {{LOCATION}}</span>
    <span>&copy; {{YEAR}} {{FOOTER_NAME}}. All rights reserved.</span>
  </div>
</footer>`,
      fields: [
        { key: 'FOOTER_NAME', label: 'Business name', type: 'text', default: '{{KEYWORD}}' },
        { key: 'LOCATION', label: 'Location', type: 'text', default: '{{LOCATION}}' },
        { key: 'YEAR', label: 'Year', type: 'text', default: '2024' }
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
              <div className="w-12 h-12 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <p className="text-base font-medium">Add elements from the library to start building</p>
              <p className="text-sm mt-1">Select Navigation first, then Hero, then sections below</p>
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
          <div className="flex gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-[#27272a] text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-[#3f3f46] transition-all text-sm"
            >
              {previewMode ? 'Close' : 'Preview'}
            </button>
            <button
              onClick={() => { setPreviewMode(true); setPreviewExpanded(true); }}
              disabled={sections.length === 0}
              title="Expand preview"
              className="px-3 py-2 bg-slate-100 dark:bg-[#27272a] text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-[#3f3f46] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5" />
              </svg>
            </button>
          </div>
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
                ? 'Add sections then click Preview'
                : 'Click Preview to see your template'}
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

      {/* Expanded preview modal */}
      {previewExpanded && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#18181b] border-b border-[#27272a] shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-white font-semibold text-sm">Preview</span>
              {/* Device toggle */}
              <div className="flex items-center bg-[#27272a] rounded-lg p-1 gap-1">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    previewDevice === 'desktop'
                      ? 'bg-white text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path strokeLinecap="round" d="M8 21h8M12 17v4" />
                  </svg>
                  Desktop
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    previewDevice === 'mobile'
                      ? 'bg-white text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
                  </svg>
                  Mobile
                </button>
              </div>
            </div>
            <button
              onClick={() => setPreviewExpanded(false)}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Modal body */}
          <div className="flex-1 overflow-auto bg-slate-200 dark:bg-[#0f0f10] flex items-start justify-center py-8">
            {sections.length > 0 ? (
              <div
                style={{
                  width: previewDevice === 'mobile' ? '390px' : '100%',
                  maxWidth: previewDevice === 'mobile' ? '390px' : '1280px',
                  minHeight: '100%',
                  background: '#fff',
                  boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
                  borderRadius: previewDevice === 'mobile' ? '16px' : '8px',
                  overflow: 'hidden',
                  margin: previewDevice === 'mobile' ? '0' : '0 16px',
                }}
              >
                <iframe
                  srcDoc={generateHTML()
                    .replace(/\{\{KEYWORD\}\}/g, 'Preview Service')
                    .replace(/\{\{LOCATION\}\}/g, 'Your City')}
                  style={{ width: '100%', height: '100%', minHeight: '800px', border: 'none', display: 'block' }}
                  title="Preview Expanded"
                />
              </div>
            ) : (
              <div className="text-slate-400 text-sm mt-24">Add sections to see a preview</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
