'use client';
import { useState, useRef, useEffect } from 'react';
import TemplateBuilder from '../TemplateBuilder';
import STARTER_TEMPLATES from '../../data/starterTemplates';
import { supabase } from '../../../lib/supabaseClient';
import { IDEAL_FOR, styleForTemplate } from '../../../lib/templateMeta';

// Add a starter ID to this set after dropping its PNG into /public/template-screenshots/<id>.png
// IDs not in this set fall back to the icon-based card design (no 404s, no flicker).
const AVAILABLE_SCREENSHOTS = new Set([
  // 'starter-1', 'starter-2', ... — uncomment as you add files
]);

// Hide iframe scrollbars inside tiny thumbnail previews (grid cards only)
const HIDE_SCROLL_CSS = '<style>html,body{overflow:hidden!important;scrollbar-width:none!important}html::-webkit-scrollbar,body::-webkit-scrollbar,*::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}</style>';

// Disable all link/button/form interactions inside the preview iframe so clicks
// don't navigate the iframe to broken anchors (#contact etc.) or submit forms.
// Pointer events are kept ON so the user can scroll and hover normally.
const DISABLE_INTERACTIONS = `<style>
  a, button, [role="button"] { cursor: default !important; }
  a:hover, button:hover { text-decoration: none !important; }
</style>
<script>
  (function() {
    var stop = function(e) {
      var t = e.target.closest && e.target.closest('a, button, [role="button"], form, input, textarea, select');
      if (t) { e.preventDefault(); e.stopPropagation(); }
    };
    document.addEventListener('click', stop, true);
    document.addEventListener('submit', stop, true);
    // Also block keyboard activation so Enter on a focused link doesn't navigate
    document.addEventListener('keydown', function(e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('a, button')) {
        e.preventDefault();
      }
    }, true);
  })();
</script>`;

// Replace placeholders with demo copy — `hideScroll` true for thumbnails, false for the full preview modal
const previewHtml = (html, { hideScroll = true } = {}) => ((hideScroll ? HIDE_SCROLL_CSS : '') + DISABLE_INTERACTIONS + html)
  // Business page placeholders
  .replace(/\{\{KEYWORD\}\}/g, 'Your Business')
  .replace(/\{\{LOCATION\}\}/g, 'Your City')
  .replace(/\{\{SERVICE\}\}/g, 'Your Service')
  .replace(/\{\{TAGLINE\}\}/g, 'Professional • Reliable • Trusted')
  .replace(/\{\{PHONE\}\}/g, '(555) 000-0000')
  .replace(/\{\{EMAIL\}\}/g, 'hello@yourbusiness.com')
  .replace(/\{\{HERO_HEADLINE\}\}/g, 'Your Business Name')
  .replace(/\{\{HERO_SUB\}\}/g, 'Professional services you can trust.')
  .replace(/\{\{CTA_PRIMARY\}\}/g, 'Get Started')
  .replace(/\{\{CTA_SECONDARY\}\}/g, 'Learn More')
  // Blog placeholders
  .replace(/\{\{POST_TITLE\}\}/g, 'Tool A vs Tool B: Which Is Right for You in 2025?')
  .replace(/\{\{POST_CATEGORY\}\}/g, 'Comparison')
  .replace(/\{\{SITE_NAME\}\}/g, 'YourBlog')
  .replace(/\{\{AUTHOR_NAME\}\}/g, 'Alex Johnson')
  .replace(/\{\{AUTHOR_INITIAL\}\}/g, 'A')
  .replace(/\{\{AUTHOR_BIO\}\}/g, 'Writer and researcher covering productivity tools and software.')
  .replace(/\{\{PUBLISH_DATE\}\}/g, 'April 2025')
  .replace(/\{\{READ_TIME\}\}/g, '8')
  .replace(/\{\{POST_INTRO\}\}/g, 'Choosing the right tool can make or break your workflow. In this guide, we compare the top options side by side so you can make the best decision.')
  .replace(/\{\{POST_INTRO_2\}\}/g, 'We\'ve tested both tools extensively and broken down the key differences across pricing, features, and ease of use.')
  .replace(/\{\{QUICK_ANSWER\}\}/g, 'If you\'re a solo creator, Tool A is the better pick. Teams and power users will get more out of Tool B.')
  .replace(/\{\{OPTION_A\}\}/g, 'Tool A')
  .replace(/\{\{OPTION_B\}\}/g, 'Tool B')
  .replace(/\{\{VERDICT_TITLE\}\}/g, 'Which Should You Choose?')
  .replace(/\{\{VERDICT_BODY\}\}/g, 'Both tools are excellent in their own right. Your choice ultimately depends on your team size, budget, and workflow needs.')
  .replace(/\{\{SECTION_1_TITLE\}\}/g, 'What Is Tool A?')
  .replace(/\{\{SECTION_1_BODY\}\}/g, 'Tool A is a modern productivity platform designed for individuals and small teams. It offers a clean interface with powerful integrations.')
  .replace(/\{\{SECTION_2_TITLE\}\}/g, 'What Is Tool B?')
  .replace(/\{\{SECTION_2_BODY\}\}/g, 'Tool B takes a different approach, focusing on collaboration and scalability. It\'s built for growing teams that need structure.')
  .replace(/\{\{TOC_[0-9]+\}\}/g, 'Section heading')
  .replace(/\{\{COMPARE_[0-9]+\}\}/g, 'Feature')
  .replace(/\{\{PRO_[AB][0-9]+\}\}/g, 'Key advantage of this tool')
  .replace(/\{\{CON_[AB][0-9]+\}\}/g, 'Limitation to consider')
  .replace(/\{\{RELATED_[0-9]+_TITLE\}\}/g, 'Related Article Title')
  .replace(/\{\{RELATED_[0-9]+_DESC\}\}/g, 'A short description of this related post.')
  .replace(/\{\{STEP_([0-9]+)_TITLE\}\}/g, 'Step $1: Complete This Action')
  .replace(/\{\{STEP_[0-9]+_BODY\}\}/g, 'Detailed instructions for completing this step successfully.')
  .replace(/\{\{STEP_[0-9]+_TIP\}\}/g, 'Pro tip: Here\'s a helpful shortcut to save you time.')
  .replace(/\{\{STEP_[0-9]+_WARNING\}\}/g, 'Be careful not to skip this — it\'s easy to miss and can cause issues later.')
  .replace(/\{\{STEP_[0-9]+_CODE\}\}/g, '# Example command\nnpm install your-package --save')
  .replace(/\{\{STEP_[0-9]+_BULLET_[0-9]+\}\}/g, 'Important sub-step to follow')
  .replace(/\{\{PREREQ_[0-9]+\}\}/g, 'Basic requirement or tool needed')
  .replace(/\{\{SUMMARY_HEADLINE\}\}/g, 'What You\'ve Learned')
  .replace(/\{\{SUMMARY_[0-9]+\}\}/g, 'Key takeaway from this guide')
  .replace(/\{\{LIST_([0-9]+)_TITLE\}\}/g, 'Option $1: Great Tool Name')
  .replace(/\{\{LIST_[0-9]+_BODY\}\}/g, 'A reliable and well-regarded option in this category, known for its ease of use and solid feature set.')
  .replace(/\{\{LIST_[0-9]+_PRO_[0-9]+\}\}/g, 'Notable strength of this option')
  .replace(/\{\{LIST_[0-9]+_RATING\}\}/g, '4.5')
  .replace(/\{\{LIST_[0-9]+_REVIEWS\}\}/g, '2,400+')
  .replace(/\{\{LIST_[0-9]+_FEAT_[0-9]+\}\}/g, 'Key feature of this option')
  .replace(/\{\{LIST_[0-9]+_BOTTOM_LINE\}\}/g, 'A solid choice for most users looking for reliability and ease of use.')
  .replace(/\{\{LIST_COUNT\}\}/g, '6')
  .replace(/\{\{CTA_HEADLINE\}\}/g, 'Ready to Get Started?')
  .replace(/\{\{CTA_SUBTEXT\}\}/g, 'Join thousands of people already using the best tools for their workflow.')
  // Comparison article extras
  .replace(/\{\{TLDR_[0-9]+\}\}/g, 'Key insight about these tools to help you decide faster.')
  .replace(/\{\{VERDICT_A\}\}/g, 'you want simplicity and a faster learning curve')
  .replace(/\{\{VERDICT_B\}\}/g, 'you need advanced collaboration and scalability')
  .replace(/\{\{VERDICT_A_[0-9]+\}\}/g, 'Prefer a cleaner, simpler interface')
  .replace(/\{\{VERDICT_B_[0-9]+\}\}/g, 'Need powerful team collaboration features')
  .replace(/\{\{UPDATED_DATE\}\}/g, 'March 2025')
  .replace(/\{\{EVAL_INTRO\}\}/g, 'We spent weeks hands-on testing both tools across six key dimensions.')
  .replace(/\{\{EVAL_[0-9]+_TITLE\}\}/g, 'Evaluation Criterion')
  .replace(/\{\{EVAL_[0-9]+_DESC\}\}/g, 'How each tool performs on this dimension based on our testing.')
  .replace(/\{\{FEATURE_[0-9]+\}\}/g, 'Notable capability of this tool')
  .replace(/\{\{PRICE_[AB]_FREE\}\}/g, 'Free forever')
  .replace(/\{\{PRICE_[AB]_PAID\}\}/g, '$12/month')
  .replace(/\{\{PRICE_[AB]_FEAT_[0-9]+\}\}/g, 'Included in this plan')
  .replace(/\{\{AUTHOR_TITLE\}\}/g, 'Senior Editor')
  .replace(/\{\{SOURCE_[0-9]+\}\}/g, 'Official documentation and product research, 2025.')
  // How-to guide extras
  .replace(/\{\{EST_TIME\}\}/g, '30 min')
  .replace(/\{\{DIFFICULTY\}\}/g, 'Beginner')
  .replace(/\{\{STEP_COUNT\}\}/g, '5')
  .replace(/\{\{STEP_[0-9]+_NOTE\}\}/g, 'Note: Keep this in mind as you proceed through the next steps.')
  .replace(/\{\{STEP_[0-9]+_CODE\}\}/g, '# Example command\nnpm install your-package')
  .replace(/\{\{STEP_[0-9]+_BULLET_[0-9]+\}\}/g, 'Important detail to keep in mind')
  .replace(/\{\{STEP_[0-9]+_TIP\}\}/g, 'Pro tip: This shortcut will save you significant time.')
  .replace(/\{\{TROUBLE_[0-9]+_Q\}\}/g, 'What if something goes wrong at this step?')
  .replace(/\{\{TROUBLE_[0-9]+_A\}\}/g, 'Try restarting the process from step 1. Check that all prerequisites are installed correctly.')
  // Listicle extras
  .replace(/\{\{METHODOLOGY_NOTE\}\}/g, 'We independently tested each option and reviewed thousands of user ratings to compile this list.')
  .replace(/\{\{HOW_TO_CHOOSE_TITLE\}\}/g, 'How to Choose the Right Option')
  .replace(/\{\{HOW_TO_CHOOSE_BODY\}\}/g, 'The best choice depends on your specific needs. Here are the four most important factors to consider:')
  .replace(/\{\{CHOOSE_[0-9]+_TITLE\}\}/g, 'Key Factor')
  .replace(/\{\{CHOOSE_[0-9]+_DESC\}\}/g, 'Consider how this factor affects your specific situation and workflow requirements.')
  // Catch-all
  .replace(/\{\{[A-Z0-9_]+\}\}/g, 'Sample content');

// ── SVG thumbnail mockups ─────────────────────────────────────────────────────
// Each is a 400×280 mini visual representing the template's design style

function T1() { // Clean Minimal — white bg, #111 nav+CTA, gray cards, black CTA band
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="280" fill="#ffffff"/>
      {/* Nav */}
      <line x1="0" y1="44" x2="400" y2="44" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="24" y="15" width="52" height="14" rx="2" fill="#262626"/>
      <rect x="308" y="13" width="68" height="18" rx="5" fill="#262626"/>
      {/* Hero */}
      <rect x="24" y="60" width="82" height="7" rx="2" fill="#d1d5db"/>
      <rect x="24" y="75" width="230" height="24" rx="3" fill="#262626"/>
      <rect x="24" y="107" width="170" height="7" rx="2" fill="#e5e7eb"/>
      <rect x="24" y="120" width="130" height="7" rx="2" fill="#e5e7eb"/>
      <rect x="24" y="142" width="90" height="26" rx="6" fill="#262626"/>
      <rect x="122" y="142" width="78" height="26" rx="6" fill="none" stroke="#e5e7eb" strokeWidth="1.5"/>
      {/* Gray card grid */}
      <line x1="0" y1="186" x2="400" y2="186" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="24" y="198" width="108" height="58" rx="8" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="148" y="198" width="106" height="58" rx="8" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="270" y="198" width="106" height="58" rx="8" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="36" y="212" width="58" height="7" rx="2" fill="#d1d5db"/>
      <rect x="36" y="225" width="76" height="5" rx="2" fill="#e5e7eb"/>
    </svg>
  );
}

function T2() { // Bold Dark — #0a0a0a bg, #7c3aed purple accent, white text, purple CTA band
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="280" fill="#0a0a0a"/>
      {/* Nav */}
      <line x1="0" y1="44" x2="400" y2="44" stroke="#2a2a2a" strokeWidth="1"/>
      <rect x="24" y="15" width="50" height="14" rx="2" fill="#f5f5f5"/>
      <rect x="308" y="13" width="68" height="18" rx="5" fill="#7c3aed"/>
      {/* Hero eyebrow: purple */}
      <rect x="24" y="58" width="80" height="6" rx="1" fill="#7c3aed"/>
      {/* H1: white */}
      <rect x="24" y="72" width="240" height="26" rx="3" fill="#ffffff"/>
      <rect x="24" y="106" width="180" height="8" rx="2" fill="#303030"/>
      <rect x="24" y="120" width="150" height="8" rx="2" fill="#303030"/>
      {/* Buttons: purple + ghost */}
      <rect x="24" y="142" width="100" height="26" rx="6" fill="#7c3aed"/>
      <rect x="132" y="142" width="80" height="26" rx="6" fill="none" stroke="#333333" strokeWidth="1.5"/>
      {/* Stats row */}
      <line x1="0" y1="186" x2="400" y2="186" stroke="#2a2a2a" strokeWidth="1"/>
      <line x1="0" y1="226" x2="400" y2="226" stroke="#2a2a2a" strokeWidth="1"/>
      <rect x="24" y="196" width="36" height="14" rx="2" fill="#ffffff"/>
      <rect x="24" y="215" width="58" height="5" rx="1" fill="#4b5563"/>
      <rect x="144" y="196" width="36" height="14" rx="2" fill="#ffffff"/>
      <rect x="144" y="215" width="58" height="5" rx="1" fill="#4b5563"/>
      <rect x="264" y="196" width="36" height="14" rx="2" fill="#ffffff"/>
      <rect x="264" y="215" width="58" height="5" rx="1" fill="#4b5563"/>
      {/* CTA band: purple */}
      <rect x="0" y="244" width="400" height="36" fill="#7c3aed"/>
      <rect x="152" y="255" width="96" height="13" rx="4" fill="#ffffff" opacity="0.85"/>
    </svg>
  );
}

function T3() { // Warm Earthy — cream #faf6f0 bg, amber #b45309 nav+CTA, dark #1c1008 text, white cards
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="280" fill="#faf6f0"/>
      {/* Nav: cream with border */}
      <line x1="0" y1="44" x2="400" y2="44" stroke="#e8ddd0" strokeWidth="1"/>
      <rect x="24" y="15" width="56" height="14" rx="2" fill="#1c1008"/>
      <rect x="304" y="12" width="72" height="20" rx="5" fill="#b45309"/>
      {/* Hero location: amber-brown */}
      <rect x="24" y="58" width="78" height="7" rx="1" fill="#92400e" opacity="0.7"/>
      {/* H1: dark brown */}
      <rect x="24" y="73" width="220" height="24" rx="2" fill="#1c1008"/>
      {/* text: warm gray */}
      <rect x="24" y="105" width="168" height="7" rx="2" fill="#c4b9ae"/>
      <rect x="24" y="118" width="128" height="7" rx="2" fill="#c4b9ae"/>
      {/* Buttons: amber fill + text underline style */}
      <rect x="24" y="140" width="96" height="26" rx="5" fill="#b45309"/>
      <rect x="130" y="152" width="62" height="2" rx="1" fill="#b45309"/>
      <rect x="130" y="146" width="62" height="9" rx="1" fill="#b45309" opacity="0.15"/>
      {/* Divider */}
      <line x1="0" y1="184" x2="400" y2="184" stroke="#e8ddd0" strokeWidth="1"/>
      {/* White cards with warm borders */}
      <rect x="24" y="196" width="108" height="60" rx="6" fill="#ffffff" stroke="#e8ddd0" strokeWidth="1"/>
      <rect x="148" y="196" width="106" height="60" rx="6" fill="#ffffff" stroke="#e8ddd0" strokeWidth="1"/>
      <rect x="270" y="196" width="106" height="60" rx="6" fill="#ffffff" stroke="#e8ddd0" strokeWidth="1"/>
      <rect x="36" y="210" width="58" height="7" rx="2" fill="#a8998c"/>
      <rect x="36" y="223" width="74" height="5" rx="2" fill="#c4b9ae"/>
    </svg>
  );
}

function T4() { // Navy Professional — dark navy #0f172a nav+hero, blue #2563eb accents, trust bar, white cards
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* Navy nav */}
      <rect width="400" height="44" fill="#0f172a"/>
      {/* Navy hero */}
      <rect x="0" y="44" width="400" height="110" fill="#0f172a"/>
      {/* White body */}
      <rect x="0" y="154" width="400" height="126" fill="#ffffff"/>
      {/* Nav: logo white, links slate, btn blue */}
      <rect x="24" y="15" width="52" height="14" rx="2" fill="#ffffff"/>
      <rect x="220" y="17" width="38" height="8" rx="2" fill="#fbfbfb"/>
      <rect x="268" y="17" width="34" height="8" rx="2" fill="#fbfbfb"/>
      <rect x="316" y="12" width="60" height="20" rx="5" fill="#2563eb"/>
      {/* Hero badge: blue bg */}
      <rect x="24" y="56" width="86" height="14" rx="3" fill="#1e40af" opacity="0.5"/>
      <rect x="30" y="60" width="62" height="5" rx="1" fill="#60a5fa"/>
      {/* H1: white */}
      <rect x="24" y="78" width="220" height="22" rx="2" fill="#ffffff"/>
      {/* text: slate */}
      <rect x="24" y="108" width="160" height="7" rx="2" fill="#4c7aaa"/>
      {/* Buttons: blue + ghost */}
      <rect x="24" y="124" width="108" height="22" rx="5" fill="#2563eb"/>
      <rect x="140" y="124" width="70" height="22" rx="5" fill="none" stroke="#1e293b" strokeWidth="1"/>
      {/* Trust bar */}
      <rect x="0" y="154" width="400" height="28" fill="#f8fafc"/>
      <line x1="0" y1="182" x2="400" y2="182" stroke="#e2e8f0" strokeWidth="1"/>
      <rect x="24" y="162" width="58" height="7" rx="2" fill="#fbfbfb"/>
      <rect x="100" y="162" width="68" height="7" rx="2" fill="#fbfbfb"/>
      <rect x="186" y="162" width="52" height="7" rx="2" fill="#fbfbfb"/>
      {/* White cards with blue accent line */}
      <rect x="24" y="192" width="108" height="62" rx="7" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1"/>
      <rect x="148" y="192" width="106" height="62" rx="7" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1"/>
      <rect x="270" y="192" width="106" height="62" rx="7" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1"/>
      <rect x="36" y="204" width="36" height="3" rx="1" fill="#2563eb"/>
      <rect x="160" y="204" width="36" height="3" rx="1" fill="#2563eb"/>
      <rect x="282" y="204" width="36" height="3" rx="1" fill="#2563eb"/>
      <rect x="36" y="214" width="56" height="7" rx="2" fill="#d1d5db"/>
    </svg>
  );
}

function T5() { // Editorial — white bg, THICK 2px black nav border, red #dc2626 kicker, serif large H1, article grid
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="280" fill="#ffffff"/>
      {/* Nav: thick 2px black bottom border */}
      <line x1="0" y1="44" x2="400" y2="44" stroke="#262626" strokeWidth="2"/>
      {/* Logo: wide serif-style block */}
      <rect x="24" y="14" width="98" height="16" rx="0" fill="#262626"/>
      {/* Nav btn: black, no radius */}
      <rect x="316" y="12" width="60" height="20" rx="0" fill="#262626"/>
      {/* Hero kicker: red */}
      <rect x="24" y="60" width="74" height="7" rx="0" fill="#dc2626"/>
      {/* H1: very large black (editorial) */}
      <rect x="24" y="74" width="340" height="36" rx="0" fill="#262626"/>
      {/* hero-deck: left red border */}
      <rect x="24" y="118" width="3" height="38" rx="0" fill="#dc2626"/>
      <rect x="34" y="122" width="180" height="7" rx="0" fill="#9ca3af"/>
      <rect x="34" y="136" width="150" height="7" rx="0" fill="#9ca3af"/>
      {/* Buttons */}
      <rect x="24" y="165" width="88" height="22" rx="0" fill="#262626"/>
      <rect x="120" y="165" width="76" height="22" rx="0" fill="none" stroke="#262626" strokeWidth="1.5"/>
      {/* Article grid border */}
      <line x1="0" y1="204" x2="400" y2="204" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="24" y="212" width="108" height="54" rx="0" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="132" y="212" width="110" height="54" rx="0" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="242" y="212" width="110" height="54" rx="0" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1"/>
      {/* Red article numbers */}
      <rect x="32" y="220" width="14" height="6" rx="0" fill="#dc2626"/>
      <rect x="140" y="220" width="14" height="6" rx="0" fill="#dc2626"/>
      <rect x="250" y="220" width="14" height="6" rx="0" fill="#dc2626"/>
      <rect x="32" y="232" width="72" height="6" rx="0" fill="#d1d5db"/>
      <rect x="140" y="232" width="72" height="6" rx="0" fill="#d1d5db"/>
      <rect x="250" y="232" width="72" height="6" rx="0" fill="#d1d5db"/>
    </svg>
  );
}

function T6() { // Soft Card Grid — #f4f4f5 bg, white hero+nav, purple #5b4cdb chips+btn, rounded cards, purple CTA band
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="280" fill="#f4f4f5"/>
      {/* Nav: white */}
      <rect width="400" height="44" fill="#ffffff"/>
      <line x1="0" y1="44" x2="400" y2="44" stroke="#e4e4e7" strokeWidth="1"/>
      <rect x="24" y="15" width="50" height="14" rx="2" fill="#1c1c1c"/>
      <rect x="308" y="12" width="68" height="20" rx="7" fill="#5b4cdb"/>
      {/* Hero: white */}
      <rect x="0" y="44" width="400" height="106" fill="#ffffff"/>
      <line x1="0" y1="150" x2="400" y2="150" stroke="#e4e4e7" strokeWidth="1"/>
      {/* Purple pill chip */}
      <rect x="24" y="60" width="84" height="16" rx="8" fill="#ede9fe"/>
      <rect x="32" y="65" width="60" height="6" rx="2" fill="#5b4cdb"/>
      {/* H1 */}
      <rect x="24" y="84" width="210" height="22" rx="3" fill="#1c1c1c"/>
      {/* text */}
      <rect x="24" y="114" width="150" height="7" rx="2" fill="#d4d4d8"/>
      {/* Buttons: purple + gray */}
      <rect x="24" y="130" width="90" height="22" rx="7" fill="#5b4cdb"/>
      <rect x="122" y="130" width="76" height="22" rx="7" fill="#f4f4f5"/>
      {/* White rounded cards on gray */}
      <rect x="24" y="162" width="108" height="68" rx="10" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1"/>
      <rect x="148" y="162" width="106" height="68" rx="10" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1"/>
      <rect x="270" y="162" width="106" height="68" rx="10" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1"/>
      {/* Purple dots */}
      <circle cx="40" cy="180" r="5" fill="#5b4cdb"/>
      <circle cx="164" cy="180" r="5" fill="#5b4cdb"/>
      <circle cx="286" cy="180" r="5" fill="#5b4cdb"/>
      <rect x="36" y="193" width="58" height="7" rx="2" fill="#d4d4d8"/>
      <rect x="36" y="207" width="80" height="5" rx="2" fill="#e4e4e7"/>
    </svg>
  );
}

function T7() { // Split Hero — indigo #4f46e5 full nav + left panel, #eef2ff right panel, white below
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* Full indigo nav */}
      <rect width="400" height="44" fill="#4f46e5"/>
      <rect x="24" y="15" width="52" height="14" rx="2" fill="#ffffff"/>
      {/* Nav btn: white with indigo text */}
      <rect x="308" y="12" width="68" height="20" rx="6" fill="#ffffff"/>
      {/* Split hero: indigo left, light indigo right */}
      <rect x="0" y="44" width="200" height="160" fill="#4f46e5"/>
      <rect x="200" y="44" width="200" height="160" fill="#eef2ff"/>
      {/* Left: tag, H1, text, btn */}
      <rect x="16" y="66" width="70" height="6" rx="1" fill="#a5b4fc"/>
      <rect x="16" y="80" width="158" height="22" rx="2" fill="#ffffff"/>
      <rect x="16" y="110" width="130" height="7" rx="1" fill="#c7d2fe"/>
      <rect x="16" y="123" width="100" height="7" rx="1" fill="#c7d2fe"/>
      <rect x="16" y="142" width="88" height="24" rx="6" fill="#ffffff"/>
      {/* Right: stats */}
      <rect x="214" y="66" width="56" height="18" rx="2" fill="#4f46e5" opacity="0.6"/>
      <rect x="214" y="90" width="80" height="6" rx="1" fill="#6b7280"/>
      <line x1="214" y1="108" x2="358" y2="108" stroke="#c7d2fe" strokeWidth="1"/>
      <rect x="214" y="116" width="56" height="18" rx="2" fill="#4f46e5" opacity="0.6"/>
      <rect x="214" y="140" width="80" height="6" rx="1" fill="#6b7280"/>
      <line x1="214" y1="158" x2="358" y2="158" stroke="#c7d2fe" strokeWidth="1"/>
      {/* White body below */}
      <rect x="0" y="204" width="400" height="76" fill="#ffffff"/>
      <line x1="0" y1="204" x2="400" y2="204" stroke="#e5e7eb" strokeWidth="1"/>
      {/* Indigo CTA band at bottom */}
      <rect x="0" y="244" width="400" height="36" fill="#4f46e5"/>
      <rect x="150" y="254" width="100" height="14" rx="4" fill="#ffffff" opacity="0.85"/>
    </svg>
  );
}

function T8() { // Centered Focus — white bg, centered pill badge+H1+buttons, black CTA band
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="280" fill="#ffffff"/>
      {/* Nav: thin border */}
      <line x1="0" y1="44" x2="400" y2="44" stroke="#f3f4f6" strokeWidth="1"/>
      <rect x="24" y="15" width="52" height="14" rx="2" fill="#262626"/>
      <rect x="308" y="13" width="68" height="18" rx="6" fill="#262626"/>
      {/* Centered pill badge */}
      <rect x="150" y="62" width="100" height="18" rx="9" fill="#f3f4f6"/>
      <rect x="160" y="67" width="78" height="8" rx="2" fill="#9ca3af"/>
      {/* H1: centered large */}
      <rect x="56" y="88" width="288" height="26" rx="3" fill="#262626"/>
      {/* Text centered */}
      <rect x="80" y="122" width="240" height="7" rx="2" fill="#e5e7eb"/>
      <rect x="100" y="135" width="200" height="7" rx="2" fill="#e5e7eb"/>
      {/* Buttons: centered */}
      <rect x="112" y="158" width="92" height="26" rx="7" fill="#262626"/>
      <rect x="212" y="158" width="76" height="26" rx="7" fill="#f3f4f6"/>
      {/* Divider */}
      <line x1="0" y1="202" x2="400" y2="202" stroke="#f3f4f6" strokeWidth="1"/>
      {/* 3 Cards */}
      <rect x="24" y="212" width="108" height="54" rx="8" fill="#fafafa" stroke="#f3f4f6" strokeWidth="1"/>
      <rect x="148" y="212" width="106" height="54" rx="8" fill="#fafafa" stroke="#f3f4f6" strokeWidth="1"/>
      <rect x="270" y="212" width="106" height="54" rx="8" fill="#fafafa" stroke="#f3f4f6" strokeWidth="1"/>
      <rect x="36" y="224" width="56" height="7" rx="2" fill="#d1d5db"/>
      <rect x="36" y="237" width="74" height="5" rx="2" fill="#e5e7eb"/>
    </svg>
  );
}

function T9() { // Conversion — white bg, black nav, green #16a34a accents, two-col hero with CTA box
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="280" fill="#ffffff"/>
      {/* Nav: black */}
      <rect width="400" height="40" fill="#262626"/>
      <rect x="24" y="13" width="52" height="14" rx="2" fill="#ffffff"/>
      <rect x="200" y="14" width="70" height="12" rx="2" fill="#262626"/>
      <rect x="260" y="16" width="52" height="8" rx="1" fill="#16a34a"/>
      {/* Two-column hero */}
      {/* Left: green tag, H1, lead, checklist */}
      <rect x="24" y="52" width="78" height="14" rx="3" fill="#dcfce7"/>
      <rect x="30" y="56" width="58" height="6" rx="1" fill="#15803d"/>
      <rect x="24" y="73" width="178" height="20" rx="2" fill="#262626"/>
      <rect x="24" y="101" width="150" height="6" rx="1" fill="#e5e7eb"/>
      <rect x="24" y="113" width="130" height="6" rx="1" fill="#e5e7eb"/>
      {/* Green checklist circles */}
      <circle cx="32" cy="132" r="6" fill="#16a34a"/>
      <rect x="46" y="128" width="88" height="6" rx="1" fill="#e5e7eb"/>
      <circle cx="32" cy="150" r="6" fill="#16a34a"/>
      <rect x="46" y="146" width="76" height="6" rx="1" fill="#e5e7eb"/>
      <circle cx="32" cy="168" r="6" fill="#16a34a"/>
      <rect x="46" y="164" width="96" height="6" rx="1" fill="#e5e7eb"/>
      {/* Right: CTA box — green border */}
      <rect x="228" y="48" width="148" height="148" rx="8" fill="#f0fdf4" stroke="#16a34a" strokeWidth="2"/>
      <rect x="240" y="62" width="100" height="9" rx="2" fill="#262626"/>
      <rect x="240" y="77" width="80" height="6" rx="2" fill="#d1d5db"/>
      {/* Green call btn */}
      <rect x="240" y="94" width="124" height="28" rx="6" fill="#16a34a"/>
      <rect x="268" y="102" width="70" height="11" rx="2" fill="#ffffff" opacity="0.7"/>
      {/* "or" line */}
      <line x1="240" y1="132" x2="364" y2="132" stroke="#bbf7d0" strokeWidth="1"/>
      {/* Email btn */}
      <rect x="240" y="142" width="124" height="24" rx="5" fill="#ffffff" stroke="#d1d5db" strokeWidth="1"/>
      <rect x="272" y="149" width="62" height="7" rx="2" fill="#d1d5db"/>
      {/* Trust row */}
      <line x1="0" y1="210" x2="400" y2="210" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="24" y="220" width="58" height="7" rx="2" fill="#d1d5db"/>
      <rect x="98" y="220" width="68" height="7" rx="2" fill="#d1d5db"/>
      <rect x="182" y="220" width="58" height="7" rx="2" fill="#d1d5db"/>
      {/* Final CTA: black + green btn */}
      <rect x="0" y="244" width="400" height="36" fill="#262626"/>
      <rect x="152" y="254" width="96" height="14" rx="5" fill="#16a34a"/>
    </svg>
  );
}

function T10() { // Dark Luxury
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="280" fill="#0a0a08"/>
      <line x1="0" y1="46" x2="400" y2="46" stroke="#1c1c18" strokeWidth="1"/>
      <rect x="24" y="14" width="60" height="16" rx="2" fill="#c9a84c"/>
      <rect x="310" y="13" width="66" height="20" rx="2" fill="none" stroke="#c9a84c" strokeWidth="1"/>
      <rect x="24" y="62" width="40" height="1" fill="#c9a84c"/>
      <rect x="24" y="74" width="260" height="30" rx="2" fill="#ffffff"/>
      <rect x="24" y="114" width="180" height="8" rx="1" fill="#2a2a24"/>
      <rect x="24" y="130" width="140" height="8" rx="1" fill="#2a2a24"/>
      <rect x="24" y="152" width="100" height="28" rx="2" fill="#c9a84c"/>
      <rect x="132" y="152" width="80" height="28" rx="2" fill="none" stroke="#2a2a24" strokeWidth="1"/>
      <rect x="0" y="195" width="400" height="1" fill="#1c1c18"/>
      <rect x="24" y="212" width="108" height="50" rx="4" fill="#111110" stroke="#1c1c18" strokeWidth="1"/>
      <rect x="148" y="212" width="108" height="50" rx="4" fill="#111110" stroke="#1c1c18" strokeWidth="1"/>
      <rect x="270" y="212" width="106" height="50" rx="4" fill="#111110" stroke="#1c1c18" strokeWidth="1"/>
      <rect x="36" y="226" width="60" height="6" rx="1" fill="#c9a84c" opacity="0.6"/>
      <rect x="36" y="238" width="80" height="5" rx="1" fill="#2a2a24"/>
    </svg>
  );
}

function T11() { // Feature Split — white bg, teal #0d9488 accent, split hero, teal checklist
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="280" fill="#ffffff"/>
      {/* Nav */}
      <line x1="0" y1="44" x2="400" y2="44" stroke="#f0fdf4" strokeWidth="1"/>
      <rect x="24" y="15" width="52" height="14" rx="2" fill="#262626"/>
      <rect x="308" y="13" width="68" height="18" rx="6" fill="#0d9488"/>
      {/* Hero split */}
      <rect x="24" y="56" width="60" height="6" rx="1" fill="#0d9488"/>
      <rect x="24" y="70" width="178" height="20" rx="2" fill="#262626"/>
      <rect x="24" y="98" width="140" height="6" rx="2" fill="#e5e7eb"/>
      <rect x="24" y="110" width="110" height="6" rx="2" fill="#e5e7eb"/>
      <rect x="24" y="130" width="90" height="22" rx="6" fill="#0d9488"/>
      <rect x="120" y="130" width="72" height="22" rx="6" fill="none" stroke="#e5e7eb" strokeWidth="1.5"/>
      {/* Right visual: teal gradient card */}
      <rect x="224" y="54" width="152" height="106" rx="12" fill="#f0fdfa"/>
      <rect x="248" y="78" width="48" height="16" rx="2" fill="#0d9488"/>
      <rect x="248" y="100" width="72" height="6" rx="1" fill="#99f6e4"/>
      <line x1="248" y1="116" x2="360" y2="116" stroke="#99f6e4" strokeWidth="1"/>
      <rect x="248" y="124" width="48" height="16" rx="2" fill="#0d9488"/>
      {/* Feature list */}
      <line x1="0" y1="178" x2="400" y2="178" stroke="#f0fdf4" strokeWidth="1"/>
      <rect x="24" y="190" width="28" height="28" rx="5" fill="#f0fdfa"/>
      <rect x="34" y="202" width="10" height="3" rx="1" fill="#0d9488"/>
      <rect x="62" y="195" width="80" height="7" rx="1" fill="#d1d5db"/>
      <rect x="62" y="207" width="120" height="5" rx="1" fill="#e5e7eb"/>
      <rect x="24" y="228" width="28" height="28" rx="5" fill="#f0fdfa"/>
      <rect x="34" y="240" width="10" height="3" rx="1" fill="#0d9488"/>
      <rect x="62" y="233" width="72" height="7" rx="1" fill="#d1d5db"/>
      <rect x="62" y="245" width="100" height="5" rx="1" fill="#e5e7eb"/>
    </svg>
  );
}

function T12() { // Bold Local — black nav, orange #f97316 stats band, orange-top cards
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="280" fill="#ffffff"/>
      {/* Black nav */}
      <rect width="400" height="40" fill="#262626"/>
      <rect x="24" y="13" width="52" height="14" rx="2" fill="#ffffff"/>
      <rect x="220" y="14" width="80" height="12" rx="1" fill="#262626"/>
      <rect x="288" y="16" width="60" height="8" rx="1" fill="#f97316"/>
      {/* Hero */}
      <rect x="24" y="52" width="68" height="12" rx="2" fill="#fff7ed"/>
      <rect x="32" y="56" width="50" height="5" rx="1" fill="#f97316"/>
      <rect x="24" y="72" width="200" height="20" rx="2" fill="#262626"/>
      <rect x="24" y="100" width="150" height="6" rx="1" fill="#e5e7eb"/>
      <rect x="24" y="120" width="88" height="22" rx="5" fill="#f97316"/>
      <rect x="120" y="120" width="70" height="22" rx="5" fill="none" stroke="#e5e7eb" strokeWidth="1.5"/>
      {/* Orange stats band */}
      <rect x="0" y="154" width="400" height="36" fill="#f97316"/>
      <rect x="24" y="163" width="30" height="10" rx="1" fill="#ffffff"/>
      <rect x="24" y="176" width="50" height="5" rx="1" fill="rgba(255,255,255,0.7)"/>
      <rect x="144" y="163" width="30" height="10" rx="1" fill="#ffffff"/>
      <rect x="144" y="176" width="50" height="5" rx="1" fill="rgba(255,255,255,0.7)"/>
      <rect x="264" y="163" width="30" height="10" rx="1" fill="#ffffff"/>
      <rect x="264" y="176" width="50" height="5" rx="1" fill="rgba(255,255,255,0.7)"/>
      {/* Orange-top cards */}
      <rect x="24" y="200" width="108" height="58" rx="6" fill="#ffffff" stroke="#f3f4f6" strokeWidth="1"/>
      <rect x="24" y="200" width="108" height="3" rx="0" fill="#f97316"/>
      <rect x="148" y="200" width="106" height="58" rx="6" fill="#ffffff" stroke="#f3f4f6" strokeWidth="1"/>
      <rect x="148" y="200" width="106" height="3" rx="0" fill="#f97316"/>
      <rect x="270" y="200" width="106" height="58" rx="6" fill="#ffffff" stroke="#f3f4f6" strokeWidth="1"/>
      <rect x="270" y="200" width="106" height="3" rx="0" fill="#f97316"/>
      <rect x="36" y="214" width="60" height="7" rx="1" fill="#d1d5db"/>
    </svg>
  );
}

function T13() { // Community Trust — blue #1d4ed8 nav, white bg, blue badge row, alternating sections
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* Blue nav */}
      <rect width="400" height="44" fill="#1d4ed8"/>
      <rect x="24" y="15" width="52" height="14" rx="2" fill="#ffffff"/>
      <rect x="308" y="13" width="68" height="18" rx="6" fill="#ffffff"/>
      {/* White hero */}
      <rect x="0" y="44" width="400" height="130" fill="#ffffff"/>
      <line x1="0" y1="174" x2="400" y2="174" stroke="#e2e8f0" strokeWidth="1"/>
      <rect x="24" y="56" width="60" height="7" rx="1" fill="#1d4ed8" opacity="0.6"/>
      <rect x="24" y="71" width="200" height="20" rx="2" fill="#0f172a"/>
      <rect x="24" y="99" width="150" height="6" rx="1" fill="#cbd5e1"/>
      <rect x="24" y="120" width="88" height="22" rx="6" fill="#1d4ed8"/>
      <rect x="120" y="120" width="70" height="22" rx="6" fill="none" stroke="#e2e8f0" strokeWidth="1.5"/>
      {/* Badge row */}
      <rect x="24" y="150" width="72" height="18" rx="4" fill="#eff6ff"/>
      <rect x="30" y="156" width="6" height="6" rx="3" fill="#1d4ed8"/>
      <rect x="42" y="158" width="44" height="5" rx="1" fill="#1d4ed8" opacity="0.6"/>
      <rect x="106" y="150" width="72" height="18" rx="4" fill="#eff6ff"/>
      <rect x="112" y="156" width="6" height="6" rx="3" fill="#1d4ed8"/>
      <rect x="124" y="158" width="44" height="5" rx="1" fill="#1d4ed8" opacity="0.6"/>
      {/* Gray section with cards */}
      <rect x="0" y="174" width="400" height="106" fill="#f8fafc"/>
      <rect x="24" y="186" width="108" height="54" rx="7" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1"/>
      <rect x="24" y="186" width="36" height="3" rx="1" fill="#1d4ed8"/>
      <rect x="148" y="186" width="106" height="54" rx="7" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1"/>
      <rect x="148" y="186" width="36" height="3" rx="1" fill="#1d4ed8"/>
      <rect x="270" y="186" width="106" height="54" rx="7" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1"/>
      <rect x="270" y="186" width="36" height="3" rx="1" fill="#1d4ed8"/>
      <rect x="36" y="200" width="56" height="7" rx="1" fill="#d1d5db"/>
      <rect x="36" y="213" width="76" height="5" rx="1" fill="#e2e8f0"/>
    </svg>
  );
}

function T14() { // Corporate Pro — white bg, sky blue #0ea5e9, two-col feature list, dark CTA
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="280" fill="#ffffff"/>
      {/* White nav with border */}
      <line x1="0" y1="44" x2="400" y2="44" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="24" y="15" width="52" height="14" rx="2" fill="#262626"/>
      <rect x="220" y="17" width="36" height="8" rx="1" fill="#9ca3af"/>
      <rect x="264" y="17" width="36" height="8" rx="1" fill="#9ca3af"/>
      <rect x="308" y="13" width="68" height="18" rx="5" fill="#0ea5e9"/>
      {/* Hero: light gray bg */}
      <rect x="0" y="44" width="400" height="110" fill="#f8fafc"/>
      <line x1="0" y1="154" x2="400" y2="154" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="24" y="58" width="74" height="12" rx="2" fill="#e0f2fe"/>
      <rect x="30" y="62" width="54" height="5" rx="1" fill="#0284c7"/>
      <rect x="24" y="78" width="210" height="20" rx="2" fill="#0f172a"/>
      <rect x="24" y="106" width="88" height="22" rx="6" fill="#0ea5e9"/>
      <rect x="120" y="106" width="70" height="22" rx="6" fill="none" stroke="#cbd5e1" strokeWidth="1"/>
      {/* Trust dots row */}
      <circle cx="32" cy="140" r="3" fill="#0ea5e9"/>
      <rect x="40" y="136" width="52" height="7" rx="1" fill="#fbfbfb"/>
      <circle cx="108" cy="140" r="3" fill="#0ea5e9"/>
      <rect x="116" y="136" width="52" height="7" rx="1" fill="#fbfbfb"/>
      {/* Two-col feature list */}
      <rect x="24" y="166" width="172" height="36" rx="6" fill="#f8fafc" stroke="#f1f5f9" strokeWidth="1"/>
      <rect x="24" y="166" width="3" height="36" rx="1" fill="#0ea5e9"/>
      <rect x="36" y="175" width="80" height="7" rx="1" fill="#d1d5db"/>
      <rect x="36" y="187" width="110" height="5" rx="1" fill="#e5e7eb"/>
      <rect x="210" y="166" width="166" height="36" rx="6" fill="#f8fafc" stroke="#f1f5f9" strokeWidth="1"/>
      <rect x="210" y="166" width="3" height="36" rx="1" fill="#0ea5e9"/>
      <rect x="222" y="175" width="72" height="7" rx="1" fill="#d1d5db"/>
      <rect x="222" y="187" width="100" height="5" rx="1" fill="#e5e7eb"/>
      {/* Dark CTA band */}
      <rect x="0" y="218" width="400" height="62" fill="#0f172a"/>
      <rect x="24" y="232" width="150" height="14" rx="2" fill="#1e293b"/>
      <rect x="24" y="250" width="100" height="8" rx="1" fill="#1e293b"/>
      <rect x="296" y="232" width="80" height="26" rx="5" fill="#0ea5e9"/>
    </svg>
  );
}

function T15() { // Agency Dark — very dark #0a0a0a bg, teal #0d9488 stats + accents
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="280" fill="#0a0a0a"/>
      {/* Dark nav */}
      <line x1="0" y1="44" x2="400" y2="44" stroke="#262626" strokeWidth="1"/>
      <rect x="24" y="15" width="52" height="14" rx="2" fill="#ffffff"/>
      <rect x="220" y="17" width="38" height="8" rx="1" fill="#3e3e3e"/>
      <rect x="308" y="12" width="68" height="20" rx="5" fill="none" stroke="#0d9488" strokeWidth="1"/>
      <rect x="314" y="17" width="54" height="7" rx="1" fill="#0d9488" opacity="0.7"/>
      {/* Hero */}
      <rect x="24" y="58" width="64" height="6" rx="1" fill="#0d9488"/>
      <rect x="24" y="72" width="280" height="28" rx="2" fill="#ffffff"/>
      <rect x="24" y="108" width="180" height="7" rx="1" fill="#3e3e3e"/>
      <rect x="24" y="126" width="96" height="22" rx="6" fill="#0d9488"/>
      <rect x="128" y="126" width="80" height="22" rx="6" fill="none" stroke="#333333" strokeWidth="1"/>
      {/* Stats row with teal numbers */}
      <line x1="0" y1="162" x2="400" y2="162" stroke="#262626" strokeWidth="1"/>
      <rect x="24" y="172" width="38" height="16" rx="1" fill="#0d9488"/>
      <rect x="24" y="192" width="56" height="5" rx="1" fill="#3e3e3e"/>
      <rect x="144" y="172" width="38" height="16" rx="1" fill="#0d9488"/>
      <rect x="144" y="192" width="56" height="5" rx="1" fill="#3e3e3e"/>
      <rect x="264" y="172" width="38" height="16" rx="1" fill="#0d9488"/>
      <rect x="264" y="192" width="56" height="5" rx="1" fill="#3e3e3e"/>
      {/* Dark card grid */}
      <line x1="0" y1="212" x2="400" y2="212" stroke="#262626" strokeWidth="1"/>
      <rect x="24" y="222" width="108" height="46" rx="6" fill="#262626" stroke="#262626" strokeWidth="1"/>
      <rect x="24" y="222" width="28" height="2" rx="1" fill="#0d9488"/>
      <rect x="148" y="222" width="106" height="46" rx="6" fill="#262626" stroke="#262626" strokeWidth="1"/>
      <rect x="148" y="222" width="28" height="2" rx="1" fill="#0d9488"/>
      <rect x="270" y="222" width="106" height="46" rx="6" fill="#262626" stroke="#262626" strokeWidth="1"/>
      <rect x="270" y="222" width="28" height="2" rx="1" fill="#0d9488"/>
    </svg>
  );
}

function T16() { // Prestige — warm #f5f0e8 bg, bronze #9b8b5e accents, Cormorant serif feel
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="280" fill="#f5f0e8"/>
      {/* Nav */}
      <line x1="0" y1="46" x2="400" y2="46" stroke="#d6c9b0" strokeWidth="1"/>
      <rect x="24" y="14" width="72" height="18" rx="2" fill="#1a1a14"/>
      <rect x="310" y="13" width="66" height="20" rx="0" fill="none" stroke="#9b8b5e" strokeWidth="1"/>
      <rect x="316" y="18" width="52" height="7" rx="1" fill="#9b8b5e" opacity="0.7"/>
      {/* Hero ornament rule */}
      <rect x="24" y="58" width="40" height="1" fill="#d6c9b0"/>
      <rect x="72" y="54" width="60" height="7" rx="0" fill="#9b8b5e" opacity="0.6"/>
      <rect x="140" y="58" width="40" height="1" fill="#d6c9b0"/>
      {/* H1: serif-wide */}
      <rect x="24" y="72" width="280" height="28" rx="0" fill="#1a1a14"/>
      {/* subtext */}
      <rect x="24" y="108" width="180" height="7" rx="0" fill="#c4b89a"/>
      <rect x="24" y="120" width="140" height="7" rx="0" fill="#c4b89a"/>
      {/* Buttons */}
      <rect x="24" y="142" width="110" height="24" rx="0" fill="#9b8b5e"/>
      <rect x="144" y="142" width="90" height="24" rx="0" fill="none" stroke="#c4b89a" strokeWidth="1"/>
      {/* Gold card grid */}
      <line x1="0" y1="184" x2="400" y2="184" stroke="#d6c9b0" strokeWidth="1"/>
      <rect x="24" y="196" width="108" height="64" rx="0" fill="#f5f0e8" stroke="#d6c9b0" strokeWidth="1"/>
      <rect x="148" y="196" width="106" height="64" rx="0" fill="#f5f0e8" stroke="#d6c9b0" strokeWidth="1"/>
      <rect x="270" y="196" width="106" height="64" rx="0" fill="#f5f0e8" stroke="#d6c9b0" strokeWidth="1"/>
      <rect x="36" y="208" width="20" height="1" fill="#9b8b5e"/>
      <rect x="160" y="208" width="20" height="1" fill="#9b8b5e"/>
      <rect x="282" y="208" width="20" height="1" fill="#9b8b5e"/>
      <rect x="36" y="218" width="64" height="7" rx="0" fill="#d6c9b0"/>
      <rect x="160" y="218" width="56" height="7" rx="0" fill="#d6c9b0"/>
      <rect x="282" y="218" width="72" height="7" rx="0" fill="#d6c9b0"/>
    </svg>
  );
}

function T17() { // Comparison Article — two-col layout, serif headline, sidebar TOC, comparison table
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="280" fill="#ffffff"/>
      {/* Nav */}
      <rect width="400" height="40" fill="#ffffff"/>
      <line x1="0" y1="40" x2="400" y2="40" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="20" y="14" width="48" height="12" rx="2" fill="#262626"/>
      <rect x="310" y="12" width="66" height="16" rx="5" fill="#262626"/>
      {/* Breadcrumb */}
      <rect x="20" y="48" width="120" height="5" rx="1" fill="#e5e7eb"/>
      {/* Main column */}
      {/* Category tag */}
      <rect x="20" y="60" width="52" height="10" rx="2" fill="#fef9c3"/>
      <rect x="22" y="62" width="44" height="6" rx="1" fill="#854d0e" opacity="0.8"/>
      {/* Title - serif wide */}
      <rect x="20" y="76" width="228" height="18" rx="1" fill="#111827"/>
      <rect x="20" y="98" width="180" height="7" rx="1" fill="#e5e7eb"/>
      {/* Meta */}
      <rect x="20" y="112" width="140" height="5" rx="1" fill="#d1d5db"/>
      <line x1="20" y1="122" x2="248" y2="122" stroke="#f3f4f6" strokeWidth="1"/>
      {/* Body text */}
      <rect x="20" y="128" width="220" height="5" rx="1" fill="#e5e7eb"/>
      <rect x="20" y="138" width="200" height="5" rx="1" fill="#e5e7eb"/>
      {/* Quick answer box */}
      <rect x="20" y="150" width="228" height="28" rx="6" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1"/>
      <rect x="20" y="150" width="4" height="28" rx="2" fill="#16a34a"/>
      <rect x="30" y="155" width="40" height="4" rx="1" fill="#16a34a"/>
      <rect x="30" y="163" width="160" height="4" rx="1" fill="#bbf7d0"/>
      {/* Comparison table */}
      <rect x="20" y="186" width="228" height="12" rx="1" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="20" y="186" width="80" height="12" rx="0" fill="#f9fafb"/>
      <rect x="130" y="186" width="58" height="12" rx="0" fill="#f1f5f9"/>
      <rect x="190" y="186" width="58" height="12" rx="0" fill="#f1f5f9"/>
      <rect x="20" y="198" width="228" height="8" rx="0" fill="#fff" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="20" y="206" width="228" height="8" rx="0" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="20" y="214" width="228" height="8" rx="0" fill="#fff" stroke="#e5e7eb" strokeWidth="1"/>
      {/* Check/cross marks */}
      <rect x="142" y="201" width="8" height="3" rx="1" fill="#16a34a"/>
      <rect x="202" y="201" width="8" height="3" rx="1" fill="#dc2626"/>
      <rect x="142" y="209" width="8" height="3" rx="1" fill="#16a34a"/>
      <rect x="202" y="209" width="8" height="3" rx="1" fill="#16a34a"/>
      {/* Verdict box */}
      <rect x="20" y="228" width="228" height="36" rx="8" fill="#111827"/>
      <rect x="28" y="233" width="40" height="4" rx="1" fill="#9ca3af"/>
      <rect x="28" y="241" width="120" height="6" rx="1" fill="#ffffff"/>
      <rect x="28" y="251" width="150" height="4" rx="1" fill="#4b5563"/>
      {/* Sidebar */}
      <rect x="264" y="60" width="116" height="130" rx="8" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="272" y="68" width="60" height="5" rx="1" fill="#9ca3af"/>
      <rect x="272" y="80" width="90" height="4" rx="1" fill="#374151"/>
      <rect x="272" y="90" width="76" height="4" rx="1" fill="#d1d5db"/>
      <rect x="272" y="100" width="84" height="4" rx="1" fill="#d1d5db"/>
      <rect x="272" y="110" width="70" height="4" rx="1" fill="#d1d5db"/>
      <rect x="272" y="120" width="78" height="4" rx="1" fill="#d1d5db"/>
      <line x1="272" y1="134" x2="372" y2="134" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="272" y="140" width="60" height="5" rx="1" fill="#9ca3af"/>
      <rect x="272" y="152" width="100" height="20" rx="5" fill="#fff" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="278" y="157" width="70" height="4" rx="1" fill="#374151"/>
      <rect x="278" y="165" width="50" height="3" rx="1" fill="#d1d5db"/>
    </svg>
  );
}

function T18() { // How-To Guide — indigo numbered steps, tip/warning boxes, clean single column
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="280" fill="#ffffff"/>
      {/* Nav */}
      <rect width="400" height="40" fill="#ffffff"/>
      <line x1="0" y1="40" x2="400" y2="40" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="24" y="14" width="48" height="12" rx="2" fill="#262626"/>
      <rect x="310" y="12" width="66" height="16" rx="6" fill="#4f46e5"/>
      {/* Category + title */}
      <rect x="24" y="48" width="52" height="10" rx="2" fill="#eef2ff"/>
      <rect x="26" y="50" width="44" height="6" rx="1" fill="#4f46e5"/>
      <rect x="24" y="64" width="300" height="16" rx="1" fill="#111827"/>
      <rect x="24" y="84" width="220" height="5" rx="1" fill="#e5e7eb"/>
      {/* Prerequisites box */}
      <rect x="24" y="96" width="352" height="28" rx="7" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"/>
      <rect x="32" y="100" width="60" height="4" rx="1" fill="#fbfbfb"/>
      <rect x="32" y="108" width="200" height="4" rx="1" fill="#cbd5e1"/>
      <rect x="32" y="115" width="160" height="4" rx="1" fill="#cbd5e1"/>
      {/* Step 1 */}
      <rect x="24" y="132" width="40" height="40" rx="10" fill="#4f46e5"/>
      <rect x="36" y="144" width="18" height="14" rx="2" fill="#ffffff" opacity="0.9"/>
      <rect x="74" y="138" width="200" height="10" rx="2" fill="#111827"/>
      <rect x="74" y="152" width="240" height="4" rx="1" fill="#e5e7eb"/>
      <rect x="74" y="160" width="180" height="4" rx="1" fill="#e5e7eb"/>
      {/* Tip box */}
      <rect x="74" y="170" width="280" height="20" rx="5" fill="#fffbeb" stroke="#fde68a" strokeWidth="1"/>
      <rect x="74" y="170" width="3" height="20" rx="1" fill="#f59e0b"/>
      <rect x="82" y="173" width="24" height="4" rx="1" fill="#b45309"/>
      <rect x="82" y="181" width="160" height="4" rx="1" fill="#fcd34d"/>
      {/* Step 2 */}
      <rect x="24" y="198" width="40" height="40" rx="10" fill="#4f46e5"/>
      <rect x="36" y="210" width="18" height="14" rx="2" fill="#ffffff" opacity="0.9"/>
      <rect x="74" y="204" width="180" height="10" rx="2" fill="#111827"/>
      <rect x="74" y="218" width="240" height="4" rx="1" fill="#e5e7eb"/>
      <rect x="74" y="226" width="200" height="4" rx="1" fill="#e5e7eb"/>
      {/* Step 3 partial */}
      <rect x="24" y="246" width="40" height="28" rx="10" fill="#4f46e5"/>
      <rect x="36" y="252" width="18" height="14" rx="2" fill="#ffffff" opacity="0.9"/>
      <rect x="74" y="252" width="160" height="10" rx="2" fill="#111827"/>
      <rect x="74" y="266" width="220" height="4" rx="1" fill="#e5e7eb"/>
    </svg>
  );
}

function T19() { // Listicle — gray bg, white numbered cards, colored number badges, rating stars
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="280" fill="#f9fafb"/>
      {/* White nav */}
      <rect width="400" height="40" fill="#ffffff"/>
      <line x1="0" y1="40" x2="400" y2="40" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="24" y="14" width="48" height="12" rx="2" fill="#262626"/>
      <rect x="310" y="12" width="66" height="16" rx="6" fill="#262626"/>
      {/* White hero header */}
      <rect x="0" y="40" width="400" height="60" fill="#ffffff"/>
      <line x1="0" y1="100" x2="400" y2="100" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="24" y="48" width="48" height="8" rx="2" fill="#f3f4f6"/>
      <rect x="24" y="61" width="280" height="14" rx="2" fill="#111827"/>
      <rect x="24" y="80" width="200" height="5" rx="1" fill="#d1d5db"/>
      <rect x="24" y="88" width="140" height="5" rx="1" fill="#e5e7eb"/>
      {/* Card 1 — dark badge */}
      <rect x="24" y="108" width="352" height="46" rx="10" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="32" y="116" width="32" height="30" rx="8" fill="#111827"/>
      <rect x="38" y="123" width="18" height="14" rx="2" fill="#ffffff" opacity="0.9"/>
      <rect x="74" y="118" width="36" height="6" rx="1" fill="#f0fdf4"/>
      <rect x="74" y="126" width="160" height="8" rx="2" fill="#111827"/>
      <rect x="74" y="138" width="200" height="4" rx="1" fill="#e5e7eb"/>
      <rect x="260" y="138" width="36" height="4" rx="1" fill="#f59e0b"/>
      {/* Card 2 — blue badge */}
      <rect x="24" y="160" width="352" height="46" rx="10" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="32" y="168" width="32" height="30" rx="8" fill="#1e40af"/>
      <rect x="38" y="175" width="18" height="14" rx="2" fill="#ffffff" opacity="0.9"/>
      <rect x="74" y="170" width="40" height="6" rx="1" fill="#eff6ff"/>
      <rect x="74" y="178" width="140" height="8" rx="2" fill="#111827"/>
      <rect x="74" y="190" width="190" height="4" rx="1" fill="#e5e7eb"/>
      <rect x="260" y="190" width="36" height="4" rx="1" fill="#f59e0b"/>
      {/* Card 3 — green badge */}
      <rect x="24" y="212" width="352" height="46" rx="10" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="32" y="220" width="32" height="30" rx="8" fill="#065f46"/>
      <rect x="38" y="227" width="18" height="14" rx="2" fill="#ffffff" opacity="0.9"/>
      <rect x="74" y="222" width="44" height="6" rx="1" fill="#fef3c7"/>
      <rect x="74" y="230" width="150" height="8" rx="2" fill="#111827"/>
      <rect x="74" y="242" width="200" height="4" rx="1" fill="#e5e7eb"/>
      <rect x="260" y="242" width="36" height="4" rx="1" fill="#f59e0b"/>
    </svg>
  );
}

const THUMBNAILS = {
  'starter-1': <T1 />,
  'starter-2': <T2 />,
  'starter-3': <T3 />,
  'starter-4': <T4 />,
  'starter-5': <T5 />,
  'starter-6': <T6 />,
  'starter-7': <T7 />,
  'starter-8': <T8 />,
  'starter-9': <T9 />,
  'starter-10': <T10 />,
  'starter-11': <T11 />,
  'starter-12': <T12 />,
  'starter-13': <T13 />,
  'starter-14': <T14 />,
  'starter-15': <T15 />,
  'starter-16': <T16 />,
  'starter-17': <T17 />,
  'starter-18': <T18 />,
  'starter-19': <T19 />,
};

// ── Template card ─────────────────────────────────────────────────────────────
function TemplateCard({ template, onPreview, onRename, onDelete, isRenaming, renameValue, onRenameChange, onRenameSubmit, renameInputRef }) {
  const idealFor = IDEAL_FOR[template.id];
  const style = styleForTemplate(template);
  const description = idealFor
    ? `Ideal for ${idealFor}.`
    : (template._isUserTemplate ? 'Your custom template - click to preview or use.' : 'Click to preview the full template.');
  const badge = template._isStarter ? 'Starter' : template._isUserTemplate ? 'Custom' : null;

  // Try a static screenshot at /template-screenshots/<id>.png — opt-in via the
  // AVAILABLE_SCREENSHOTS set so we don't spam the network with 404s for IDs that
  // don't have files yet. Add an ID to the set once you've dropped its PNG in /public/template-screenshots/.
  const screenshotUrl = template._isStarter && AVAILABLE_SCREENSHOTS.has(template.id)
    ? `/template-screenshots/${template.id}.png`
    : null;
  const [imageOk, setImageOk] = useState(!!screenshotUrl);

  return (
    <div
      onClick={!isRenaming ? onPreview : undefined}
      className="group relative flex flex-col bg-white dark:bg-[#1c1c1c] border border-[#d4d4d4] dark:border-[#404040] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_28px_rgba(0,0,0,0.5)] hover:border-[#075056] dark:hover:border-white hover:-translate-y-0.5 transition-all duration-300 cursor-pointer min-h-[200px]"
    >
      {/* Header: screenshot OR icon */}
      {imageOk && screenshotUrl ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-[#fafafa] dark:bg-[#111111] border-b border-[#f0f0f0] dark:border-[#2c2c2c]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={screenshotUrl}
            alt={template.name}
            loading="lazy"
            onError={() => setImageOk(false)}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
          />
          {badge && (
            <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white bg-black/55 backdrop-blur-md border border-white/15 px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-start justify-between p-5 pb-0">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${style.bg} ${style.fg}`}>
            {style.icon}
          </div>
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#777777] dark:text-[#888888] bg-[#f5f5f5] dark:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#333333] px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
      )}

      {/* Body — title + description + footer */}
      <div className="flex flex-col flex-1 p-5 pt-4">
        {/* Title */}
        <div className="mb-1.5">
          {isRenaming ? (
            <input
              ref={renameInputRef}
              value={renameValue}
              onChange={(e) => onRenameChange(e.target.value)}
              onBlur={onRenameSubmit}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); onRenameSubmit(); }
                if (e.key === 'Escape') onRenameChange(null);
              }}
              className="w-full text-[15px] font-bold text-[#262626] dark:text-white bg-slate-100 dark:bg-[#333333] rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-[#075056]"
              autoFocus
            />
          ) : (
            <h3 className="text-[15px] font-bold text-[#262626] dark:text-white tracking-tight leading-tight">{template.name}</h3>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-[#777777] dark:text-[#888888] leading-relaxed line-clamp-2 mb-4 flex-1">
          {description}
        </p>

        {/* Footer: category + actions */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-[#f0f0f0] dark:border-[#2c2c2c]">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#aaaaaa] dark:text-[#666666] truncate">
            {template.category || 'Template'}
          </span>
          <div className="flex items-center gap-0.5 shrink-0">
            {template._isUserTemplate && !isRenaming && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onRename(); }}
                  title="Rename"
                  className="p-1.5 rounded-md text-[#aaaaaa] hover:text-[#262626] dark:hover:text-white hover:bg-[#f0f0f0] dark:hover:bg-[#303030] opacity-0 group-hover:opacity-100 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                  title="Delete"
                  className="p-1.5 rounded-md text-[#aaaaaa] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
                  </svg>
                </button>
              </>
            )}
            <svg
              className="w-4 h-4 ml-1 text-[#cccccc] dark:text-[#464646] group-hover:text-[#262626] dark:group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
            >
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Render helpers ─────────────────────────────────────────────────────────────
// Full-width "Create your own template" banner (sits above everything else)
function renderCreateBanner(openBuilder) {
  return (
    <button
      onClick={() => openBuilder(true)}
      className="group w-full text-left flex items-center gap-5 p-5 sm:p-6 mb-10 bg-gradient-to-br from-white to-[#fafafa] dark:from-[#1a1a1a] dark:to-[#111111] border border-dashed border-[#b8b8b8] dark:border-[#525252] rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_40px_rgba(7,80,86,0.18)] dark:hover:shadow-[0_12px_40px_rgba(7,80,86,0.35)] hover:border-solid hover:border-[#075056] dark:hover:border-[#075056] hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#075056]/10 dark:bg-[#075056]/20 flex items-center justify-center text-[#075056] dark:text-[#5eead4] group-hover:bg-[#075056] group-hover:text-white dark:group-hover:bg-[#075056] dark:group-hover:text-white group-hover:rotate-90 transition-all duration-500 shrink-0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base sm:text-lg font-bold text-[#262626] dark:text-white tracking-tight">Create your own template</h3>
          <span className="hidden sm:inline-flex items-center text-[10px] font-bold uppercase tracking-[0.1em] text-[#075056] dark:text-[#5eead4] bg-[#075056]/10 dark:bg-[#075056]/20 px-2 py-0.5 rounded-full">New</span>
        </div>
        <p className="text-xs sm:text-sm text-[#777777] dark:text-[#888888] line-clamp-1 sm:line-clamp-2">
          Start from a blank canvas. Drag in elements, choose your brand color, and save.
        </p>
      </div>
      <span className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#075056] text-white text-sm font-bold rounded-xl group-hover:bg-[#064548] group-hover:shadow-lg group-hover:shadow-[#075056]/30 transition-all shrink-0">
        Get started
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 5l7 7-7 7"/>
        </svg>
      </span>
      <span className="sm:hidden flex items-center justify-center w-10 h-10 bg-[#075056] text-white rounded-xl shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 5l7 7-7 7"/>
        </svg>
      </span>
    </button>
  );
}

// Factory: returns a function that renders a TemplateCard with the right closures
function renderTemplateCardFn(deps) {
  const {
    setSelectedTemplate, onUseTemplate,
    startRename, handleDelete,
    renamingId, renameValue, cancelRename, setRenameValue,
    submitRename, renameInputRef,
  } = deps;
  return (template) => (
    <TemplateCard
      key={template.id}
      template={template}
      onPreview={() => setSelectedTemplate(template)}
      onUse={() => {
        if (onUseTemplate) onUseTemplate(template);
        else setSelectedTemplate(template);
      }}
      onRename={() => startRename(template)}
      onDelete={() => handleDelete(template)}
      isRenaming={renamingId === template.id}
      renameValue={renameValue}
      onRenameChange={(v) => v === null ? cancelRename() : setRenameValue(v)}
      onRenameSubmit={submitRename}
      renameInputRef={renameInputRef}
    />
  );
}

// Curated "All" tab layout: Featured row → Your Templates section → Categorized sections
function CuratedLayout({ featured, customs, grouped, renderCard }) {
  return (
    <div className="space-y-12">
      {/* Featured row — 3 hand-picked highlighted starters */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-black text-[#262626] dark:text-white tracking-tight">Featured</h2>
          <span className="text-xs text-[#888888] dark:text-[#666666]">Hand-picked starters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
          {featured.map(renderCard)}
        </div>
      </section>

      {/* Your Templates — only if user has any */}
      {customs.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-black text-[#262626] dark:text-white tracking-tight">Your Templates</h2>
            <span className="text-xs text-[#888888] dark:text-[#666666]">{customs.length} {customs.length === 1 ? 'template' : 'templates'}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-6">
            {customs.map(renderCard)}
          </div>
        </section>
      )}

      {/* Categorized starter sections */}
      {grouped.map(({ category, templates }) => (
        <section key={category}>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-black text-[#262626] dark:text-white tracking-tight">{category}</h2>
            <span className="text-xs text-[#888888] dark:text-[#666666]">{templates.length} {templates.length === 1 ? 'template' : 'templates'}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-6">
            {templates.map(renderCard)}
          </div>
        </section>
      ))}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function TemplatesView({ user, session, templates: userTemplatesProp, onTemplateAdded, onTemplateDeleted, onRefresh, onUseTemplate, darkMode, setDarkMode }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  // 'closed' | 'open' | 'minimized'
  const [builderState, setBuilderState] = useState('closed');
  const [minimizedDraft, setMinimizedDraft] = useState(null);

  // Auto-open the builder if a draft survived a page refresh
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('gg-template-builder-draft')) {
        setBuilderState('open');
      }
    } catch { /* ignore */ }
  }, []);

  // Cache the draft summary so the floating pill can show what's queued up
  useEffect(() => {
    if (builderState !== 'minimized') return;
    try {
      const raw = localStorage.getItem('gg-template-builder-draft');
      if (!raw) { setMinimizedDraft(null); return; }
      const d = JSON.parse(raw);
      setMinimizedDraft({
        name: (d.templateName && d.templateName.trim()) || 'Untitled template',
        sectionCount: Array.isArray(d.sections) ? d.sections.length : 0
      });
    } catch { setMinimizedDraft(null); }
  }, [builderState]);

  // Backwards-compatible alias used by existing callers like setShowBuilder(true)
  const setShowBuilder = (v) => setBuilderState(v ? 'open' : 'closed');
  const showBuilder = builderState === 'open';
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef(null);

  // Esc closes the preview modal
  useEffect(() => {
    if (!selectedTemplate) return;
    const onKey = (e) => { if (e.key === 'Escape') setSelectedTemplate(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedTemplate]);

  const effectiveUser = session?.user || user;

  const starters = STARTER_TEMPLATES.map(t => ({ ...t, _isStarter: true }));
  const allTemplates = userTemplatesProp === null
    ? null
    : [...(userTemplatesProp || []), ...starters];

  // Fixed category tabs — all templates are still accessible via All/Custom/Starter
  const categories = ['All', 'Custom', 'Starter', 'Blog', 'Premium'];

  const filteredTemplates = !allTemplates ? [] :
    activeCategory === 'All' ? allTemplates :
    activeCategory === 'Custom' ? allTemplates.filter(t => t._isUserTemplate) :
    activeCategory === 'Starter' ? allTemplates.filter(t => t._isStarter) :
    allTemplates.filter(t => t.category === activeCategory);

  const customCount = (userTemplatesProp || []).length;
  const starterCount = starters.length;

  // ── Curated layout for the "All" tab ─────────────────────────────────────
  // 3 hand-picked starters featured at the top, the rest get grouped by category below.
  const FEATURED_IDS = ['starter-10', 'starter-17', 'starter-9'];
  const CATEGORY_ORDER = ['General', 'Local Business', 'Professional Services', 'Blog', 'Premium'];

  const featuredTemplates = FEATURED_IDS
    .map(id => starters.find(s => s.id === id))
    .filter(Boolean);

  const customTemplates = (userTemplatesProp || []).map(t => ({ ...t }));

  const groupedStarters = (() => {
    const featuredSet = new Set(FEATURED_IDS);
    const groups = {};
    starters.forEach(s => {
      if (featuredSet.has(s.id)) return;
      const cat = s.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });
    return CATEGORY_ORDER
      .filter(cat => groups[cat])
      .map(cat => ({ category: cat, templates: groups[cat] }))
      .concat(
        Object.keys(groups)
          .filter(cat => !CATEGORY_ORDER.includes(cat))
          .map(cat => ({ category: cat, templates: groups[cat] }))
      );
  })();

  const startRename = (template) => {
    setRenamingId(template.id);
    setRenameValue(template.name);
    setTimeout(() => renameInputRef.current?.select(), 50);
  };

  const cancelRename = () => setRenamingId(null);

  const submitRename = async () => {
    const newName = renameValue?.trim();
    if (!newName || !renamingId) { setRenamingId(null); return; }
    setRenamingId(null);
    supabase.from('templates').update({ name: newName }).eq('id', renamingId)
      .then(({ error }) => {
        if (error) console.error('Rename failed:', error.message);
        onRefresh?.();
      });
  };

  const handleDelete = async (template) => {
    if (!template?.id) return;
    const ok = window.confirm(`Delete "${template.name}"? This can't be undone.`);
    if (!ok) return;

    // .select() returns the rows that were actually deleted. If RLS blocks the row,
    // the query returns success but an empty array — we want to flag that explicitly.
    const { data, error } = await supabase
      .from('templates')
      .delete()
      .eq('id', template.id)
      .select();

    if (error) {
      console.error('Delete failed:', error);
      window.alert(`Could not delete the template: ${error.message}`);
      return;
    }
    if (!data || data.length === 0) {
      console.warn('Delete returned 0 rows — likely a Supabase RLS policy is blocking it.');
      window.alert(
        'Could not delete the template. You may not have permission.\n\n' +
        'If you just set this up, add a DELETE policy on the `templates` table in Supabase:\n' +
        'create policy "users delete own templates" on templates for delete using (auth.uid() = user_id);'
      );
      return;
    }

    // Optimistically clean up local state so the card disappears immediately
    if (selectedTemplate?.id === template.id) setSelectedTemplate(null);
    onTemplateDeleted?.(template.id);
    onRefresh?.();
  };

  if (allTemplates === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#075056] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-8 pb-8" style={{ paddingTop: '48px' }}>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[40px] font-black text-[#262626] dark:text-white tracking-[-0.02em] leading-none mb-3">Templates</h1>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#555555] dark:text-[#999999] bg-[#f5f5f5] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#075056]" />
            {customCount} Custom
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#555555] dark:text-[#999999] bg-[#f5f5f5] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5eead4]" />
            {starterCount} Starter
          </span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center gap-0.5 p-1 bg-[#f5f5f5] dark:bg-[#1a1a1a] border border-[#e8e8e8] dark:border-[#2c2c2c] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 text-[13px] font-semibold rounded-full transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-white dark:bg-gradient-to-b dark:from-[#075056] dark:to-[#064548] text-[#262626] dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(7,80,86,0.4)]'
                  : 'text-[#777777] dark:text-[#888888] hover:text-[#262626] dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Standalone create-template banner — full width, always at the top */}
      {renderCreateBanner(setShowBuilder)}

      {/* Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-20 text-[#aaaaaa] dark:text-[#555555]">
          <p className="text-sm">No templates in this category yet.</p>
        </div>
      ) : activeCategory === 'All' ? (
        <CuratedLayout
          featured={featuredTemplates}
          customs={customTemplates}
          grouped={groupedStarters}
          renderCard={renderTemplateCardFn({
            setSelectedTemplate, onUseTemplate,
            startRename, handleDelete,
            renamingId, renameValue, cancelRename, setRenameValue,
            submitRename, renameInputRef,
          })}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-6">
          {filteredTemplates.map(template =>
            renderTemplateCardFn({
              setSelectedTemplate, onUseTemplate,
              startRename, handleDelete,
              renamingId, renameValue, cancelRename, setRenameValue,
              submitRename, renameInputRef,
            })(template)
          )}
        </div>
      )}

      {/* Template Builder modal */}
      {showBuilder && (
        <TemplateBuilder
          session={session || { user: effectiveUser }}
          onClose={() => setBuilderState('closed')}
          onMinimize={() => setBuilderState('minimized')}
          onSave={(newTemplate) => {
            onTemplateAdded?.(newTemplate);
            setBuilderState('closed');
          }}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}

      {/* Minimized Template Builder — floating restore pill */}
      {builderState === 'minimized' && (
        <div className="fixed bottom-6 right-6 z-[150] animate-fade-in">
          <button
            onClick={() => setBuilderState('open')}
            className="group flex items-center gap-3 pl-3 pr-5 py-3 bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#333333] rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_40px_rgba(7,80,86,0.2)] dark:hover:shadow-[0_12px_40px_rgba(7,80,86,0.35)] hover:-translate-y-0.5 hover:border-[#075056] transition-all"
            title="Resume template builder"
          >
            <div className="w-9 h-9 rounded-full bg-[#075056] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5,3 19,12 5,21" fill="currentColor"/>
              </svg>
            </div>
            <div className="text-left min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#075056] dark:text-[#5eead4] leading-none mb-1">Template Builder</div>
              <div className="text-sm font-bold text-[#262626] dark:text-white truncate max-w-[200px] leading-none">
                {minimizedDraft?.name || 'Resume editing'}
              </div>
              {minimizedDraft?.sectionCount > 0 && (
                <div className="text-[11px] text-[#777777] dark:text-[#888888] mt-1 leading-none">
                  {minimizedDraft.sectionCount} section{minimizedDraft.sectionCount === 1 ? '' : 's'} &middot; auto-saved
                </div>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Full-screen preview modal */}
      {selectedTemplate && (
        <div
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setSelectedTemplate(null)}
        >
          <div
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl w-full max-w-6xl flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-[#e5e5e5] dark:border-[#333333]"
            style={{ height: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-7 py-5 border-b border-[#ebebeb] dark:border-[#2c2c2c] flex items-center justify-between gap-6 bg-white dark:bg-[#1a1a1a]">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#555555] dark:text-[#999999] bg-[#f5f5f5] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-full">
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedTemplate._isStarter ? 'bg-[#5eead4]' : 'bg-[#075056]'}`} />
                    {selectedTemplate._isStarter ? 'Starter' : selectedTemplate._isUserTemplate ? 'Custom' : 'Template'}
                  </span>
                  {selectedTemplate.category && (
                    <span className="inline-flex items-center px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#555555] dark:text-[#999999] bg-[#f5f5f5] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-full">
                      {selectedTemplate.category}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-[#262626] dark:text-white tracking-tight truncate">{selectedTemplate.name}</h3>
                {IDEAL_FOR[selectedTemplate.id] && (
                  <p className="text-sm text-[#777777] dark:text-[#888888] mt-1 truncate">
                    <span className="text-[#555555] dark:text-[#aaaaaa] font-semibold">Ideal for</span> {IDEAL_FOR[selectedTemplate.id]}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setSelectedTemplate(null);
                    if (onUseTemplate) onUseTemplate(selectedTemplate);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#075056] text-white text-sm font-bold rounded-xl hover:bg-[#064548] hover:shadow-lg hover:shadow-[#075056]/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Use this template
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 5l7 7-7 7"/>
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="w-10 h-10 rounded-xl hover:bg-[#f5f5f5] dark:hover:bg-[#303030] flex items-center justify-center transition-colors text-[#777777] dark:text-[#888888] hover:text-[#262626] dark:hover:text-white"
                  title="Close (Esc)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Preview area — iframe handles its own scroll */}
            <div className="flex-1 min-h-0 bg-[#f5f5f5] dark:bg-[#0a0a0a] p-4 overflow-hidden" style={{ contain: 'layout paint' }}>
              <div className="w-full h-full rounded-xl overflow-hidden border border-[#e5e5e5] dark:border-[#333333] bg-white">
                {selectedTemplate.structure ? (
                  <iframe
                    srcDoc={previewHtml(selectedTemplate.structure, { hideScroll: false })}
                    sandbox="allow-scripts"
                    className="w-full h-full border-0 block"
                    title={`Preview: ${selectedTemplate.name}`}
                    style={{ transform: 'translateZ(0)', willChange: 'transform', contain: 'strict' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-[#aaaaaa] dark:text-[#555555]">
                    No preview available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
