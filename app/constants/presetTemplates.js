"use client";

const PRESET_TEMPLATES = [
  {
    "id": "preset-1",
    "name": "B2B Company Homepage (15-Section)",
    "category": "Company",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Hero for {{Company}} with a crisp value prop, 1 proof line, and 2 CTAs (Book demo / Contact). Desktop split, mobile stacked. Theme: clean enterprise with emerald accents, glass panels, and soft gradients. Style: cinematic split hero with gradient mesh, glass cards, floating badges, and crisp typography. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Trusted by</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">SOC 2</span>\n    <span class=\"gg-badge\">ISO 27001</span>\n    <span class=\"gg-badge\">99.9% uptime</span>\n    <span class=\"gg-badge\">24/7 support</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: What we do Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "text",
        "category": "basic",
        "content": "2 short paragraphs + 3 outcome bullets. Keep it concrete and business-focused. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: Industries we serve Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Healthcare || Finance\nLogistics || SaaS Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: Core solutions Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "columns_2",
        "category": "basic",
        "content": "Solution A: what it is + outcome || Solution B: what it is + outcome Style: split layout with icon chips and mini CTA buttons. Interaction: CTA underline on hover."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: Proof and impact Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "stats",
        "category": "seo",
        "content": "3 stats (time saved, revenue impact, uptime). Use placeholders if unknown. Style: metric cards with trend arrows and micro labels. Interaction: count-up on scroll."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Customer story Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "case_study",
        "category": "premium",
        "content": "Case study: challenge -> solution -> measurable result. Style: story card with metric strip and timeline badges. Interaction: hover reveals outcome callout."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: Security & compliance Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "text",
        "category": "basic",
        "content": "Bullets: encryption, access control, audit logs, data retention (avoid claims if unknown). Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 15,
        "type": "cta",
        "category": "marketing",
        "content": "CTA: Book a demo + secondary CTA, with a short trust line. Style: full-width gradient band with dual CTA and trust line. Interaction: primary button pulse on hover."
      }
    ]
  },
  {
    "id": "preset-2",
    "name": "SaaS Landing Page (15-Section)",
    "category": "SaaS",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Modern SaaS hero for {{Product}}. Split layout, 2 CTAs, 3 bullets, product preview card. Mobile stacked. Theme: product-led with neon blue and teal gradients, crisp lines, and subtle glow. Style: cinematic split hero with gradient mesh, glass cards, floating badges, and crisp typography. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Trusted by</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">SOC 2</span>\n    <span class=\"gg-badge\">ISO 27001</span>\n    <span class=\"gg-badge\">99.9% uptime</span>\n    <span class=\"gg-badge\">24/7 support</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: The problem Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "pain_point",
        "category": "marketing",
        "content": "Describe 3 pains in crisp, business language. Use cards. Style: alert cards with icon, red accent, and metric pill. Interaction: hover reveals quick fix."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: How it works Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "process",
        "category": "premium",
        "content": "3-step process. Each step 1-2 short sentences. Style: horizontal timeline with numbered steps and connectors. Interaction: step highlight on hover."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: Key features Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Feature A || Feature B\nFeature C || Feature D Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: Use cases Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "columns_2",
        "category": "basic",
        "content": "Role 1: outcome || Role 2: outcome Style: split layout with icon chips and mini CTA buttons. Interaction: CTA underline on hover."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Results Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "stats",
        "category": "seo",
        "content": "3 measurable results. Use placeholders if unknown. Style: metric cards with trend arrows and micro labels. Interaction: count-up on scroll."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: Security Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "text",
        "category": "basic",
        "content": "Bulleted security summary. Avoid hard claims if unsure. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 15,
        "type": "cta",
        "category": "marketing",
        "content": "Final CTA with 2 buttons and short onboarding reassurance. Style: full-width gradient band with dual CTA and trust line. Interaction: primary button pulse on hover."
      }
    ]
  },
  {
    "id": "preset-3",
    "name": "SaaS Integration Page (15-Section)",
    "category": "SaaS",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Hero: {{Product}} + {{Integration}}. Benefits, 2 CTAs. Responsive split layout. Theme: product-led with neon blue and teal gradients, crisp lines, and subtle glow. Style: cinematic split hero with gradient mesh, glass cards, floating badges, and crisp typography. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Trusted by</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">SOC 2</span>\n    <span class=\"gg-badge\">ISO 27001</span>\n    <span class=\"gg-badge\">99.9% uptime</span>\n    <span class=\"gg-badge\">24/7 support</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: What this integration does Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "text",
        "category": "basic",
        "content": "2 short paragraphs + 6 bullets describing what syncs and why. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: Popular workflows Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Trigger -> Action || Trigger -> Action\nTrigger -> Action || Trigger -> Action Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: Setup in minutes Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "process",
        "category": "premium",
        "content": "5-step setup guide. Keep steps short. Style: horizontal timeline with numbered steps and connectors. Interaction: step highlight on hover."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: Data mapping Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "text",
        "category": "basic",
        "content": "Explain field mapping, tags, and sync rules in a simple table-like layout. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Permissions & security Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "text",
        "category": "basic",
        "content": "Bullets: least privilege, encryption, access control, logs (if true). Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: Comparison Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "comparison",
        "category": "premium",
        "content": "With integration vs without. Focus on time saved and fewer errors. Style: comparison table with highlighted column and crisp icons. Interaction: row hover highlight and sticky header."
      },
      {
        "id": 15,
        "type": "cta",
        "category": "marketing",
        "content": "CTA: Connect now + secondary CTA + support note. Style: full-width gradient band with dual CTA and trust line. Interaction: primary button pulse on hover."
      }
    ]
  },
  {
    "id": "preset-4",
    "name": "Local Service Page (15-Section)",
    "category": "Services",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Hero for {{Service}} in {{City}}. Split layout, booking card, 2 CTAs. Mobile stacked. Theme: warm local service with sage palette, friendly rounded cards, and clear CTAs. Style: cinematic split hero with gradient mesh, glass cards, floating badges, and crisp typography. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Trusted by</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">SOC 2</span>\n    <span class=\"gg-badge\">ISO 27001</span>\n    <span class=\"gg-badge\">99.9% uptime</span>\n    <span class=\"gg-badge\">24/7 support</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: Common problems Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "pain_point",
        "category": "marketing",
        "content": "3 local pain points customers face. Style: alert cards with icon, red accent, and metric pill. Interaction: hover reveals quick fix."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: How we help Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "solution",
        "category": "marketing",
        "content": "3 solution cards with outcomes + short proof lines. Style: solution cards with green accents, check icons, and outcome tags. Interaction: hover glow and CTA underline."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: Our process Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "process",
        "category": "premium",
        "content": "5-step process. Keep steps short and clear. Style: horizontal timeline with numbered steps and connectors. Interaction: step highlight on hover."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: What you get Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Benefit 1 || Benefit 2\nBenefit 3 || Benefit 4 Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Pricing Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "pricing",
        "category": "marketing",
        "content": "3 pricing cards or explain factors if exact pricing is unknown. Style: three-tier cards with toggle and featured plan spotlight. Interaction: toggle slides and card glow on hover."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: FAQs Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "faq_auto",
        "category": "seo",
        "content": "Generate 8 FAQs about cost, timing, guarantees, and booking. Style: accordion list with icons and clean separators. Interaction: smooth expand with rotating chevron."
      },
      {
        "id": 15,
        "type": "contact_form",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-grid gg-grid-2\">\n    <div class=\"gg-card gg-card-strong\">\n      <div class=\"gg-pill\">Talk to us</div>\n      <h3 class=\"gg-h2\">Book a demo for {{Company}}</h3>\n      <p class=\"gg-lead\">Share your goals and we will respond within 24 hours.</p>\n      <div class=\"gg-badges\">\n        <span class=\"gg-badge\">Strategy call</span>\n        <span class=\"gg-badge\">SEO roadmap</span>\n        <span class=\"gg-badge\">Dedicated onboarding</span>\n      </div>\n    </div>\n    <div class=\"gg-card gg-card-strong\">\n      <form class=\"gg-form\">\n        <input class=\"gg-input\" placeholder=\"Full name\" />\n        <input class=\"gg-input\" placeholder=\"Work email\" />\n        <input class=\"gg-input\" placeholder=\"Company\" />\n        <textarea class=\"gg-input\" rows=\"4\" placeholder=\"What are you trying to build?\"></textarea>\n        <button class=\"gg-btn\" type=\"button\">Send request</button>\n      </form>\n    </div>\n  </div>\n</div>"
      }
    ]
  },
  {
    "id": "preset-5",
    "name": "E-commerce Product Page (15-Section)",
    "category": "E-commerce",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Product hero for {{Product}} with gallery placeholder, price, rating, variants, CTAs. Mobile stacked. Theme: high-contrast product showcase with soft shadows and glossy cards. Style: cinematic split hero with gradient mesh, glass cards, floating badges, and crisp typography. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Trusted by</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">SOC 2</span>\n    <span class=\"gg-badge\">ISO 27001</span>\n    <span class=\"gg-badge\">99.9% uptime</span>\n    <span class=\"gg-badge\">24/7 support</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: Why you will love it Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Feature 1 || Feature 2\nFeature 3 || Feature 4 Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: Whats included Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "text",
        "category": "basic",
        "content": "Checklist of items in the box + compatibility notes. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: Specs Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "stats",
        "category": "seo",
        "content": "Specs table-style section. Use typical ranges if unknown. Style: metric cards with trend arrows and micro labels. Interaction: count-up on scroll."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: Pros and considerations Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "pros_cons",
        "category": "premium",
        "content": "Honest pros and considerations. Style: two-column pros and cons with tinted panels and icons. Interaction: toggle to expand details."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Compare Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "comparison",
        "category": "premium",
        "content": "Compare with 2-3 alternatives. Focus on best-for and price band. Style: comparison table with highlighted column and crisp icons. Interaction: row hover highlight and sticky header."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: Reviews Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "social_proof",
        "category": "premium",
        "content": "Short testimonial quotes with role + verified badge placeholders. Style: testimonial cards in carousel layout with avatars. Interaction: auto-slide with pause on hover."
      },
      {
        "id": 15,
        "type": "cta",
        "category": "marketing",
        "content": "CTA: Add to cart + secondary CTA + trust note. Style: full-width gradient band with dual CTA and trust line. Interaction: primary button pulse on hover."
      }
    ]
  },
  {
    "id": "preset-6",
    "name": "Professional Services Page (15-Section)",
    "category": "Services",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Hero for {{Service}} with outcome-driven headline, credibility line, 2 CTAs. Mobile first. Theme: warm local service with sage palette, friendly rounded cards, and clear CTAs. Style: cinematic split hero with gradient mesh, glass cards, floating badges, and crisp typography. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Trusted by</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">SOC 2</span>\n    <span class=\"gg-badge\">ISO 27001</span>\n    <span class=\"gg-badge\">99.9% uptime</span>\n    <span class=\"gg-badge\">24/7 support</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: The challenge Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "pain_point",
        "category": "marketing",
        "content": "3 common problems your buyers face. Style: alert cards with icon, red accent, and metric pill. Interaction: hover reveals quick fix."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: Our approach Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "process",
        "category": "premium",
        "content": "3-5 step approach. Client-friendly and scannable. Style: horizontal timeline with numbered steps and connectors. Interaction: step highlight on hover."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: Deliverables Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Deliverable 1 || Deliverable 2\nDeliverable 3 || Deliverable 4 Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: Engagement models Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "columns_2",
        "category": "basic",
        "content": "Fixed scope: ideal for X || Retainer: ideal for Y Style: split layout with icon chips and mini CTA buttons. Interaction: CTA underline on hover."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Results Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "stats",
        "category": "seo",
        "content": "3 result metrics with placeholders. Style: metric cards with trend arrows and micro labels. Interaction: count-up on scroll."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: FAQs Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "faq_auto",
        "category": "seo",
        "content": "Generate 8 FAQs about scope, timeline, pricing, onboarding. Style: accordion list with icons and clean separators. Interaction: smooth expand with rotating chevron."
      },
      {
        "id": 15,
        "type": "contact_form",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-grid gg-grid-2\">\n    <div class=\"gg-card gg-card-strong\">\n      <div class=\"gg-pill\">Talk to us</div>\n      <h3 class=\"gg-h2\">Book a demo for {{Company}}</h3>\n      <p class=\"gg-lead\">Share your goals and we will respond within 24 hours.</p>\n      <div class=\"gg-badges\">\n        <span class=\"gg-badge\">Strategy call</span>\n        <span class=\"gg-badge\">SEO roadmap</span>\n        <span class=\"gg-badge\">Dedicated onboarding</span>\n      </div>\n    </div>\n    <div class=\"gg-card gg-card-strong\">\n      <form class=\"gg-form\">\n        <input class=\"gg-input\" placeholder=\"Full name\" />\n        <input class=\"gg-input\" placeholder=\"Work email\" />\n        <input class=\"gg-input\" placeholder=\"Company\" />\n        <textarea class=\"gg-input\" rows=\"4\" placeholder=\"What are you trying to build?\"></textarea>\n        <button class=\"gg-btn\" type=\"button\">Send request</button>\n      </form>\n    </div>\n  </div>\n</div>"
      }
    ]
  },
  {
    "id": "preset-7",
    "name": "B2B Case Study Page (15-Section)",
    "category": "Company",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Hero for {{Client}} + {{Company}} with headline, 1-line summary, CTA. Theme: clean enterprise with emerald accents, glass panels, and soft gradients. Style: cinematic split hero with gradient mesh, glass cards, floating badges, and crisp typography. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Trusted by</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">SOC 2</span>\n    <span class=\"gg-badge\">ISO 27001</span>\n    <span class=\"gg-badge\">99.9% uptime</span>\n    <span class=\"gg-badge\">24/7 support</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: The client Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "text",
        "category": "basic",
        "content": "Short background: size, industry, goals. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: The challenge Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "pain_point",
        "category": "marketing",
        "content": "3 specific problems or blockers. Style: alert cards with icon, red accent, and metric pill. Interaction: hover reveals quick fix."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: The solution Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "solution",
        "category": "marketing",
        "content": "Explain the solution in 3 concise steps. Style: solution cards with green accents, check icons, and outcome tags. Interaction: hover glow and CTA underline."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: Implementation Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "process",
        "category": "premium",
        "content": "Timeline with 3-5 steps. Emphasize collaboration. Style: horizontal timeline with numbered steps and connectors. Interaction: step highlight on hover."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Results Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "grid_2x2",
        "category": "basic",
        "content": "+25% efficiency || -30% costs\n2x faster delivery || +15 NPS Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: Customer quote Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "social_proof",
        "category": "premium",
        "content": "Short testimonial with role + company. Style: testimonial cards in carousel layout with avatars. Interaction: auto-slide with pause on hover."
      },
      {
        "id": 15,
        "type": "cta",
        "category": "marketing",
        "content": "CTA: See how we can help. Add 2 buttons and a short reassurance line. Style: full-width gradient band with dual CTA and trust line. Interaction: primary button pulse on hover."
      }
    ]
  },
  {
    "id": "preset-8",
    "name": "Restaurant / Cafe Page (15-Section)",
    "category": "Hospitality",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Hero for {{RestaurantName}} in {{City}} with cuisine chips, hours, CTAs (Reserve / View menu). Theme: rich and welcoming with editorial typography, warm tones, and ambient glow. Style: cinematic split hero with gradient mesh, glass cards, floating badges, and crisp typography. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Trusted by</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">SOC 2</span>\n    <span class=\"gg-badge\">ISO 27001</span>\n    <span class=\"gg-badge\">99.9% uptime</span>\n    <span class=\"gg-badge\">24/7 support</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: Our story Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "text",
        "category": "basic",
        "content": "Short story with vibe + what makes you different. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: Signature dishes Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Dish 1 || Dish 2\nDish 3 || Dish 4 Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: Menu highlights Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "columns_2",
        "category": "basic",
        "content": "Starters and mains || Desserts and drinks Style: split layout with icon chips and mini CTA buttons. Interaction: CTA underline on hover."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: Events and group bookings Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "text",
        "category": "basic",
        "content": "Explain private dining, group size, and booking flow. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Location Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "text",
        "category": "basic",
        "content": "Address, map placeholder, parking note, public transport note. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: FAQs Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "faq_auto",
        "category": "seo",
        "content": "Generate 8 FAQs (reservations, dietary options, parking, delivery, timings). Style: accordion list with icons and clean separators. Interaction: smooth expand with rotating chevron."
      },
      {
        "id": 15,
        "type": "cta",
        "category": "marketing",
        "content": "CTA: Reserve now + secondary CTA + newsletter signup. Style: full-width gradient band with dual CTA and trust line. Interaction: primary button pulse on hover."
      }
    ]
  },
  {
    "id": "preset-9",
    "name": "Nonprofit Donation Page (15-Section)",
    "category": "Nonprofit",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Hero for {{Cause}} with emotional headline, short story intro, CTA (Donate). Theme: human and story-led with warm neutrals and bold impact badges. Style: cinematic split hero with gradient mesh, glass cards, floating badges, and crisp typography. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Trusted by</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">SOC 2</span>\n    <span class=\"gg-badge\">ISO 27001</span>\n    <span class=\"gg-badge\">99.9% uptime</span>\n    <span class=\"gg-badge\">24/7 support</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: The mission Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "text",
        "category": "basic",
        "content": "Mission with 3 pillars as cards. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: Where your donation goes Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "columns_2",
        "category": "basic",
        "content": "Program impact || Operations and community Style: split layout with icon chips and mini CTA buttons. Interaction: CTA underline on hover."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: Impact stories Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Story 1 || Story 2\nStory 3 || Story 4 Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: Choose your impact Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "comparison",
        "category": "premium",
        "content": "Donation tiers table: $X helps with Y (3-5 tiers). Style: comparison table with highlighted column and crisp icons. Interaction: row hover highlight and sticky header."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Donate now Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "contact_form",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-grid gg-grid-2\">\n    <div class=\"gg-card gg-card-strong\">\n      <div class=\"gg-pill\">Talk to us</div>\n      <h3 class=\"gg-h2\">Book a demo for {{Company}}</h3>\n      <p class=\"gg-lead\">Share your goals and we will respond within 24 hours.</p>\n      <div class=\"gg-badges\">\n        <span class=\"gg-badge\">Strategy call</span>\n        <span class=\"gg-badge\">SEO roadmap</span>\n        <span class=\"gg-badge\">Dedicated onboarding</span>\n      </div>\n    </div>\n    <div class=\"gg-card gg-card-strong\">\n      <form class=\"gg-form\">\n        <input class=\"gg-input\" placeholder=\"Full name\" />\n        <input class=\"gg-input\" placeholder=\"Work email\" />\n        <input class=\"gg-input\" placeholder=\"Company\" />\n        <textarea class=\"gg-input\" rows=\"4\" placeholder=\"What are you trying to build?\"></textarea>\n        <button class=\"gg-btn\" type=\"button\">Send request</button>\n      </form>\n    </div>\n  </div>\n</div>"
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: FAQs Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "faq_auto",
        "category": "seo",
        "content": "Generate 8 FAQs (tax receipt, recurring, payment methods, refunds). Style: accordion list with icons and clean separators. Interaction: smooth expand with rotating chevron."
      },
      {
        "id": 15,
        "type": "cta",
        "category": "marketing",
        "content": "Final CTA: donate + share buttons + newsletter signup. Style: full-width gradient band with dual CTA and trust line. Interaction: primary button pulse on hover."
      }
    ]
  },
  {
    "id": "preset-10",
    "name": "SEO Blog Post (15-Section)",
    "category": "Content",
    "structure": [
      {
        "id": 1,
        "type": "header",
        "category": "basic",
        "content": "H1: {{Keyword}} - The Practical Guide Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 2,
        "type": "text",
        "category": "basic",
        "content": "Intro: 2 short paragraphs + a 3-bullet 'You will learn' list. Keep it crisp. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 3,
        "type": "schema_blog",
        "category": "seo",
        "content": "{\n  \"@context\":\"https://schema.org\",\n  \"@type\":\"BlogPosting\",\n  \"headline\":\"{{Keyword}} - The Practical Guide\",\n  \"description\":\"A practical guide to {{Keyword}} with steps, examples, mistakes, and FAQs.\",\n  \"author\":{\"@type\":\"Person\",\"name\":\"{{Author}}\"}\n}"
      },
      {
        "id": 4,
        "type": "header",
        "category": "basic",
        "content": "H2: What is {{Keyword}}? Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 5,
        "type": "text",
        "category": "basic",
        "content": "Explain {{Keyword}} simply. Include 1 analogy + 1 example. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 6,
        "type": "header",
        "category": "basic",
        "content": "H2: Why it matters Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 7,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Benefit 1 || Benefit 2\nBenefit 3 || Benefit 4 Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 8,
        "type": "header",
        "category": "basic",
        "content": "H2: How it works Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 9,
        "type": "process",
        "category": "premium",
        "content": "6-step process. Each step 1-2 sentences. Mobile first. Style: horizontal timeline with numbered steps and connectors. Interaction: step highlight on hover."
      },
      {
        "id": 10,
        "type": "header",
        "category": "basic",
        "content": "H2: Examples Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 11,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Example 1 || Example 2\nExample 3 || Example 4 Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 12,
        "type": "header",
        "category": "basic",
        "content": "H2: Common mistakes Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 13,
        "type": "text",
        "category": "basic",
        "content": "List 8 mistakes with quick fixes. Keep each under 18 words. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 14,
        "type": "faq_auto",
        "category": "seo",
        "content": "Generate 8 FAQs about {{Keyword}} with short, direct answers. Style: accordion list with icons and clean separators. Interaction: smooth expand with rotating chevron."
      },
      {
        "id": 15,
        "type": "cta",
        "category": "marketing",
        "content": "CTA: recommend {{Product}} or {{Brand}} with 2 buttons + short trust note. Style: full-width gradient band with dual CTA and trust line. Interaction: primary button pulse on hover."
      }
    ]
  },
  {
    "id": "preset-11",
    "name": "Enterprise Homepage (Premium 15-Section)",
    "category": "Premium",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Enterprise hero for {{Company}} with a crisp value prop, proof line, and 2 CTAs (Book demo / Talk to sales). Mobile-first. Theme: luxury dark slate with gold accents and cinematic lighting. Style: cinematic split hero with gradient mesh, glass cards, floating badges, and crisp typography. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Trusted by</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">SOC 2</span>\n    <span class=\"gg-badge\">ISO 27001</span>\n    <span class=\"gg-badge\">99.9% uptime</span>\n    <span class=\"gg-badge\">24/7 support</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: Enterprise-grade outcomes Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Outcome 1 || Outcome 2\nOutcome 3 || Outcome 4 Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: Platform overview Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "columns_2",
        "category": "basic",
        "content": "Module A: value + outcome || Module B: value + outcome Style: split layout with icon chips and mini CTA buttons. Interaction: CTA underline on hover."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: Security and compliance Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "text",
        "category": "basic",
        "content": "Bullets: encryption, access controls, audit logs, data retention. Avoid claims if unknown. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: Implementation Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "process",
        "category": "premium",
        "content": "4-step enterprise rollout plan. Keep it scannable. Style: horizontal timeline with numbered steps and connectors. Interaction: step highlight on hover."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Customer story Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "case_study",
        "category": "premium",
        "content": "Case study with measurable impact and timeline. Style: story card with metric strip and timeline badges. Interaction: hover reveals outcome callout."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: FAQs Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "faq_auto",
        "category": "seo",
        "content": "Generate 6-8 enterprise FAQs (procurement, security, onboarding, SLAs). Style: accordion list with icons and clean separators. Interaction: smooth expand with rotating chevron."
      },
      {
        "id": 15,
        "type": "cta",
        "category": "marketing",
        "content": "CTA: Book enterprise demo + secondary CTA with reassurance line. Style: full-width gradient band with dual CTA and trust line. Interaction: primary button pulse on hover."
      }
    ]
  },
  {
    "id": "preset-12",
    "name": "Product Launch Page (Premium 15-Section)",
    "category": "Premium",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Launch hero for {{Product}} with launch hook, countdown placeholder, 2 CTAs (Join waitlist / Get updates). Theme: luxury dark slate with gold accents and cinematic lighting. Style: cinematic split hero with gradient mesh, glass cards, floating badges, and crisp typography. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Trusted by</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">SOC 2</span>\n    <span class=\"gg-badge\">ISO 27001</span>\n    <span class=\"gg-badge\">99.9% uptime</span>\n    <span class=\"gg-badge\">24/7 support</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: Why now Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "text",
        "category": "basic",
        "content": "Short explanation of market shift + urgency. 2 short paragraphs. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: What you get Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Benefit 1 || Benefit 2\nBenefit 3 || Benefit 4 Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: How it works Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "process",
        "category": "premium",
        "content": "3-step flow with short descriptions. Style: horizontal timeline with numbered steps and connectors. Interaction: step highlight on hover."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: Early access Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "pricing",
        "category": "marketing",
        "content": "Founding plans or early access tiers. Use placeholders if unknown. Style: three-tier cards with toggle and featured plan spotlight. Interaction: toggle slides and card glow on hover."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Social proof Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "social_proof",
        "category": "premium",
        "content": "Short testimonial quotes + role + company. Style: testimonial cards in carousel layout with avatars. Interaction: auto-slide with pause on hover."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: FAQs Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "faq_auto",
        "category": "seo",
        "content": "Generate 6-8 FAQs about launch timing, access, pricing, support. Style: accordion list with icons and clean separators. Interaction: smooth expand with rotating chevron."
      },
      {
        "id": 15,
        "type": "cta",
        "category": "marketing",
        "content": "Final CTA: Join waitlist + secondary CTA with trust note. Style: full-width gradient band with dual CTA and trust line. Interaction: primary button pulse on hover."
      }
    ]
  },
  {
    "id": "preset-13",
    "name": "Agency Portfolio (Premium 15-Section)",
    "category": "Premium",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Agency hero for {{Agency}} with positioning, specialty, 2 CTAs (Get proposal / View work). Theme: luxury dark slate with gold accents and cinematic lighting. Style: cinematic split hero with gradient mesh, glass cards, floating badges, and crisp typography. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Trusted by</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">SOC 2</span>\n    <span class=\"gg-badge\">ISO 27001</span>\n    <span class=\"gg-badge\">99.9% uptime</span>\n    <span class=\"gg-badge\">24/7 support</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: What we do Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "columns_2",
        "category": "basic",
        "content": "Service line A || Service line B Style: split layout with icon chips and mini CTA buttons. Interaction: CTA underline on hover."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: Selected work Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Project 1 || Project 2\nProject 3 || Project 4 Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: Results Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "stats",
        "category": "seo",
        "content": "3 outcome metrics with placeholders. Style: metric cards with trend arrows and micro labels. Interaction: count-up on scroll."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: Process Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "process",
        "category": "premium",
        "content": "4-step delivery process. Style: horizontal timeline with numbered steps and connectors. Interaction: step highlight on hover."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Testimonials Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "social_proof",
        "category": "premium",
        "content": "Short testimonials with role + company. Style: testimonial cards in carousel layout with avatars. Interaction: auto-slide with pause on hover."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: FAQs Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "faq_auto",
        "category": "seo",
        "content": "Generate FAQs about scope, timelines, and pricing. Style: accordion list with icons and clean separators. Interaction: smooth expand with rotating chevron."
      },
      {
        "id": 15,
        "type": "cta",
        "category": "marketing",
        "content": "CTA: Start a project + secondary CTA + trust note. Style: full-width gradient band with dual CTA and trust line. Interaction: primary button pulse on hover."
      }
    ]
  },
  {
    "id": "preset-14",
    "name": "Careers Page (Premium 15-Section)",
    "category": "Premium",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Careers hero for {{Company}} with mission, team photo placeholder, 2 CTAs (View roles / Meet team). Theme: luxury dark slate with gold accents and cinematic lighting. Style: cinematic split hero with gradient mesh, glass cards, floating badges, and crisp typography. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Trusted by</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">SOC 2</span>\n    <span class=\"gg-badge\">ISO 27001</span>\n    <span class=\"gg-badge\">99.9% uptime</span>\n    <span class=\"gg-badge\">24/7 support</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: Our mission Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "text",
        "category": "basic",
        "content": "Short mission statement + values list. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: Life at {{Company}} Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Culture 1 || Culture 2\nCulture 3 || Culture 4 Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: Benefits Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "columns_2",
        "category": "basic",
        "content": "Core benefits || Growth and learning Style: split layout with icon chips and mini CTA buttons. Interaction: CTA underline on hover."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: Open roles Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "text",
        "category": "basic",
        "content": "List 6 roles with location and short blurb. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Hiring process Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "process",
        "category": "premium",
        "content": "4-step hiring process (screen, interview, task, offer). Style: horizontal timeline with numbered steps and connectors. Interaction: step highlight on hover."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: FAQs Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "faq_auto",
        "category": "seo",
        "content": "Generate FAQs about remote work, benefits, timelines, and roles. Style: accordion list with icons and clean separators. Interaction: smooth expand with rotating chevron."
      },
      {
        "id": 15,
        "type": "cta",
        "category": "marketing",
        "content": "CTA: View open roles + secondary CTA (Submit resume). Style: full-width gradient band with dual CTA and trust line. Interaction: primary button pulse on hover."
      }
    ]
  },
  {
    "id": "preset-15",
    "name": "Investor / Press Page (Premium 15-Section)",
    "category": "Premium",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Investor and press hero for {{Company}} with overview and 2 CTAs (Download deck / Contact IR). Theme: luxury dark slate with gold accents and cinematic lighting. Style: cinematic split hero with gradient mesh, glass cards, floating badges, and crisp typography. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Trusted by</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">SOC 2</span>\n    <span class=\"gg-badge\">ISO 27001</span>\n    <span class=\"gg-badge\">99.9% uptime</span>\n    <span class=\"gg-badge\">24/7 support</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: Company snapshot Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "stats",
        "category": "seo",
        "content": "Key metrics: ARR, growth, customers, regions (use placeholders). Style: metric cards with trend arrows and micro labels. Interaction: count-up on scroll."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: Latest news Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Press item 1 || Press item 2\nPress item 3 || Press item 4 Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: Leadership Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "columns_2",
        "category": "basic",
        "content": "Founder bio || Executive bio Style: split layout with icon chips and mini CTA buttons. Interaction: CTA underline on hover."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: Investor resources Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "text",
        "category": "basic",
        "content": "Links to deck, financials, and press kit. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: FAQs Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "faq_auto",
        "category": "seo",
        "content": "Generate FAQs about investment, press inquiries, and coverage. Style: accordion list with icons and clean separators. Interaction: smooth expand with rotating chevron."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: Contact Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "contact_form",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-grid gg-grid-2\">\n    <div class=\"gg-card gg-card-strong\">\n      <div class=\"gg-pill\">Talk to us</div>\n      <h3 class=\"gg-h2\">Book a demo for {{Company}}</h3>\n      <p class=\"gg-lead\">Share your goals and we will respond within 24 hours.</p>\n      <div class=\"gg-badges\">\n        <span class=\"gg-badge\">Strategy call</span>\n        <span class=\"gg-badge\">SEO roadmap</span>\n        <span class=\"gg-badge\">Dedicated onboarding</span>\n      </div>\n    </div>\n    <div class=\"gg-card gg-card-strong\">\n      <form class=\"gg-form\">\n        <input class=\"gg-input\" placeholder=\"Full name\" />\n        <input class=\"gg-input\" placeholder=\"Work email\" />\n        <input class=\"gg-input\" placeholder=\"Company\" />\n        <textarea class=\"gg-input\" rows=\"4\" placeholder=\"What are you trying to build?\"></textarea>\n        <button class=\"gg-btn\" type=\"button\">Send request</button>\n      </form>\n    </div>\n  </div>\n</div>"
      },
      {
        "id": 15,
        "type": "cta",
        "category": "marketing",
        "content": "CTA: Contact IR + secondary CTA (Download deck). Style: full-width gradient band with dual CTA and trust line. Interaction: primary button pulse on hover."
      }
    ]
  },
  {
    "id": "preset-16",
    "name": "Healthcare Clinic Service Page (15-Section)",
    "category": "Healthcare",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Hero for {{Clinic}} offering {{Service}} in {{City}}. Emphasize care, trust, and quick booking. Theme: clean clinical with teal accents, soft gradients, and calm spacing. Style: cinematic split hero with gradient mesh, glass cards, and clear CTA. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Trusted by</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">Board certified</span>\n    <span class=\"gg-badge\">HIPAA ready</span>\n    <span class=\"gg-badge\">Same-week visits</span>\n    <span class=\"gg-badge\">5-star care</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: Conditions we treat Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Condition A || Condition B\nCondition C || Condition D Style: tile grid with medical icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: Our care approach Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "columns_2",
        "category": "basic",
        "content": "Evaluation and diagnosis || Treatment plan and follow-up Style: split layout with icon chips and outcome highlights. Interaction: CTA underline on hover."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: Meet the care team Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "text",
        "category": "basic",
        "content": "Short bios, credentials, and specialties for providers. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: Insurance and billing Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "text",
        "category": "basic",
        "content": "Accepted insurance, self-pay guidance, and financing options. Avoid hard claims if unknown. Style: clean checklist with soft badges. Interaction: highlight key phrases on hover."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Patient outcomes Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "stats",
        "category": "seo",
        "content": "3 outcome metrics (recovery time, satisfaction, follow-up adherence). Use placeholders if unknown. Style: metric cards with trend arrows and micro labels. Interaction: count-up on scroll."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: Patient questions Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "faq_auto",
        "category": "seo",
        "content": "Generate FAQs about appointments, preparation, insurance, and recovery. Style: accordion list with icons and clean separators. Interaction: smooth expand with rotating chevron."
      },
      {
        "id": 15,
        "type": "contact_form",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-grid gg-grid-2\">\n    <div class=\"gg-card gg-card-strong\">\n      <div class=\"gg-pill\">Book care</div>\n      <h3 class=\"gg-h2\">Schedule your {{Service}} visit</h3>\n      <p class=\"gg-lead\">Share your details and our team will confirm your appointment.</p>\n      <div class=\"gg-badges\">\n        <span class=\"gg-badge\">Same-week slots</span>\n        <span class=\"gg-badge\">Insurance guidance</span>\n        <span class=\"gg-badge\">Care coordinator</span>\n      </div>\n    </div>\n    <div class=\"gg-card gg-card-strong\">\n      <form class=\"gg-form\">\n        <input class=\"gg-input\" placeholder=\"Full name\" />\n        <input class=\"gg-input\" placeholder=\"Email\" />\n        <input class=\"gg-input\" placeholder=\"Preferred date\" />\n        <textarea class=\"gg-input\" rows=\"4\" placeholder=\"Tell us about your symptoms\"></textarea>\n        <button class=\"gg-btn\" type=\"button\">Request appointment</button>\n      </form>\n    </div>\n  </div>\n</div>"
      }
    ]
  },
  {
    "id": "preset-17",
    "name": "Dental Practice Service Page (15-Section)",
    "category": "Healthcare",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Dental hero for {{Practice}} in {{City}} with {{Service}} focus. Include 2 CTAs (Book exam / Call now). Theme: bright, friendly with teal and warm neutrals. Style: cinematic split hero with gradient mesh and appointment card. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Trusted by</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">Gentle care</span>\n    <span class=\"gg-badge\">Modern tech</span>\n    <span class=\"gg-badge\">Same-day consults</span>\n    <span class=\"gg-badge\">5-star reviews</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: Common concerns we solve Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "pain_point",
        "category": "marketing",
        "content": "List 3 patient concerns and how they feel. Style: alert cards with icon, soft red accent, and reassurance line. Interaction: hover reveals quick relief note."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: Treatments and services Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Cleanings and exams || Whitening\nCrowns and bridges || Implants Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: Our process Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "process",
        "category": "premium",
        "content": "4-step care journey from exam to follow-up. Style: horizontal timeline with numbered steps and connectors. Interaction: step highlight on hover."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: Patient reviews Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "social_proof",
        "category": "premium",
        "content": "3 short reviews with name, role, and rating. Style: testimonial cards in carousel layout with avatars. Interaction: auto-slide with pause on hover."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Technology and safety Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "text",
        "category": "basic",
        "content": "Sterilization protocols, digital imaging, and comfort options. Avoid claims if unknown. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: Insurance and financing Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "pricing",
        "category": "marketing",
        "content": "Explain insurance, payment plans, and transparent estimates. Use placeholders if unknown. Style: three-tier cards with toggle and featured plan spotlight. Interaction: toggle slides and card glow on hover."
      },
      {
        "id": 15,
        "type": "contact_form",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-grid gg-grid-2\">\n    <div class=\"gg-card gg-card-strong\">\n      <div class=\"gg-pill\">Book a visit</div>\n      <h3 class=\"gg-h2\">Schedule your dental appointment</h3>\n      <p class=\"gg-lead\">Choose a time and share your needs. We will confirm quickly.</p>\n      <div class=\"gg-badges\">\n        <span class=\"gg-badge\">New patient friendly</span>\n        <span class=\"gg-badge\">Insurance help</span>\n        <span class=\"gg-badge\">Flexible times</span>\n      </div>\n    </div>\n    <div class=\"gg-card gg-card-strong\">\n      <form class=\"gg-form\">\n        <input class=\"gg-input\" placeholder=\"Full name\" />\n        <input class=\"gg-input\" placeholder=\"Email\" />\n        <input class=\"gg-input\" placeholder=\"Phone\" />\n        <textarea class=\"gg-input\" rows=\"4\" placeholder=\"How can we help?\"></textarea>\n        <button class=\"gg-btn\" type=\"button\">Request appointment</button>\n      </form>\n    </div>\n  </div>\n</div>"
      }
    ]
  },
  {
    "id": "preset-18",
    "name": "Real Estate Agent Page (15-Section)",
    "category": "Real Estate",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Hero for {{Agent}} helping buyers and sellers in {{City}}. Include 2 CTAs (Book consult / View listings). Theme: modern real estate with slate + gold accents. Style: cinematic split hero with neighborhood cards and market stats. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Trusted by</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">Top producer</span>\n    <span class=\"gg-badge\">Local expert</span>\n    <span class=\"gg-badge\">5-star clients</span>\n    <span class=\"gg-badge\">Market insights</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: Neighborhoods we cover Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Neighborhood A || Neighborhood B\nNeighborhood C || Neighborhood D Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: Buying vs selling Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "columns_2",
        "category": "basic",
        "content": "For buyers: guidance, tours, negotiation || For sellers: pricing, staging, marketing Style: split layout with icon chips and mini CTA buttons. Interaction: CTA underline on hover."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: Market insights Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "stats",
        "category": "seo",
        "content": "3 local market stats (median price, days on market, list-to-sale). Use placeholders if unknown. Style: metric cards with trend arrows and micro labels. Interaction: count-up on scroll."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: Our process Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "process",
        "category": "premium",
        "content": "4-step buying or selling process with clear milestones. Style: horizontal timeline with numbered steps and connectors. Interaction: step highlight on hover."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Client stories Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "social_proof",
        "category": "premium",
        "content": "3 testimonials with property type and result. Style: testimonial cards in carousel layout with avatars. Interaction: auto-slide with pause on hover."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: FAQs Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "faq_auto",
        "category": "seo",
        "content": "Generate FAQs about timelines, pricing, inspections, and offers. Style: accordion list with icons and clean separators. Interaction: smooth expand with rotating chevron."
      },
      {
        "id": 15,
        "type": "cta",
        "category": "marketing",
        "content": "CTA: Schedule a consult + secondary CTA (Browse listings). Style: full-width gradient band with dual CTA and trust line. Interaction: primary button pulse on hover."
      }
    ]
  },
  {
    "id": "preset-19",
    "name": "Law Firm Practice Area Page (15-Section)",
    "category": "Legal",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Hero for {{LawFirm}} handling {{PracticeArea}} in {{City}}. Include 2 CTAs (Free consult / Call now). Theme: refined legal with charcoal and gold accents. Style: cinematic split hero with confidence messaging and credibility badges. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Trusted by</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">Trial ready</span>\n    <span class=\"gg-badge\">Local counsel</span>\n    <span class=\"gg-badge\">Client first</span>\n    <span class=\"gg-badge\">24/7 intake</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: Case types we handle Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Case type A || Case type B\nCase type C || Case type D Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: Our approach Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "process",
        "category": "premium",
        "content": "4-step legal process from intake to resolution. Style: horizontal timeline with numbered steps and connectors. Interaction: step highlight on hover."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: Results and outcomes Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "case_study",
        "category": "premium",
        "content": "Case study: challenge, strategy, result. Use placeholders if unknown. Style: story card with metric strip and timeline badges. Interaction: hover reveals outcome callout."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: What to expect Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "columns_2",
        "category": "basic",
        "content": "Initial consultation || Case strategy and communication Style: split layout with icon chips and mini CTA buttons. Interaction: CTA underline on hover."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Meet your attorney Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "text",
        "category": "basic",
        "content": "Attorney bio, years of experience, and bar admissions. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: FAQs Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "faq_auto",
        "category": "seo",
        "content": "Generate FAQs about fees, timelines, and next steps. Style: accordion list with icons and clean separators. Interaction: smooth expand with rotating chevron."
      },
      {
        "id": 15,
        "type": "contact_form",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-grid gg-grid-2\">\n    <div class=\"gg-card gg-card-strong\">\n      <div class=\"gg-pill\">Free consult</div>\n      <h3 class=\"gg-h2\">Talk to a {{PracticeArea}} attorney</h3>\n      <p class=\"gg-lead\">Share your details and we will respond quickly.</p>\n      <div class=\"gg-badges\">\n        <span class=\"gg-badge\">Confidential</span>\n        <span class=\"gg-badge\">Fast response</span>\n        <span class=\"gg-badge\">Local expertise</span>\n      </div>\n    </div>\n    <div class=\"gg-card gg-card-strong\">\n      <form class=\"gg-form\">\n        <input class=\"gg-input\" placeholder=\"Full name\" />\n        <input class=\"gg-input\" placeholder=\"Email\" />\n        <input class=\"gg-input\" placeholder=\"Phone\" />\n        <textarea class=\"gg-input\" rows=\"4\" placeholder=\"Tell us about your case\"></textarea>\n        <button class=\"gg-btn\" type=\"button\">Request consultation</button>\n      </form>\n    </div>\n  </div>\n</div>"
      }
    ]
  },
  {
    "id": "preset-20",
    "name": "Home Services - HVAC or Plumbing (15-Section)",
    "category": "Home Services",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Hero for {{Company}} offering {{Service}} in {{City}}. Highlight same-day availability, emergency support, and 2 CTAs (Book now / Call). Theme: warm, dependable with sage and amber accents. Style: cinematic split hero with service cards and trust badges. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Trusted by</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">Licensed & insured</span>\n    <span class=\"gg-badge\">Same-day service</span>\n    <span class=\"gg-badge\">Upfront pricing</span>\n    <span class=\"gg-badge\">24/7 support</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: Services we offer Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Installations || Repairs\nMaintenance plans || Emergency calls Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: Service areas Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "columns_2",
        "category": "basic",
        "content": "Primary neighborhoods and cities || Surrounding areas and travel policy Style: split layout with icon chips and mini CTA buttons. Interaction: CTA underline on hover."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: Why homeowners choose us Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "usp",
        "category": "marketing",
        "content": "List 4 USPs like fast response, honest pricing, warranty, and clean work. Style: icon chips with bold headings. Interaction: hover glow and micro badges."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: Our process Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "process",
        "category": "premium",
        "content": "4-step service process from inspection to completion. Style: horizontal timeline with numbered steps and connectors. Interaction: step highlight on hover."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Pricing factors Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "pricing",
        "category": "marketing",
        "content": "Explain pricing ranges, diagnostic fees, and discounts. Use placeholders if unknown. Style: three-tier cards with toggle and featured plan spotlight. Interaction: toggle slides and card glow on hover."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: Reviews Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "social_proof",
        "category": "premium",
        "content": "3 homeowner testimonials with service and outcome. Style: testimonial cards in carousel layout with avatars. Interaction: auto-slide with pause on hover."
      },
      {
        "id": 15,
        "type": "cta",
        "category": "marketing",
        "content": "CTA: Book service + emergency callout. Style: full-width gradient band with dual CTA and trust line. Interaction: primary button pulse on hover."
      }
    ]
  },
  {
    "id": "preset-21",
    "name": "Restaurant Location Page (15-Section)",
    "category": "Hospitality",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Restaurant hero for {{Restaurant}} in {{City}} with reservation CTA and highlights. Theme: warm hospitality with amber accents and moody imagery. Style: cinematic split hero with menu card and reservation CTA. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Loved by guests</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">Top-rated</span>\n    <span class=\"gg-badge\">Fresh ingredients</span>\n    <span class=\"gg-badge\">Local favorite</span>\n    <span class=\"gg-badge\">Easy reservations</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: Signature dishes Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Dish A || Dish B\nDish C || Dish D Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: Menu highlights Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "columns_2",
        "category": "basic",
        "content": "Lunch favorites || Dinner and chef specials Style: split layout with icon chips and mini CTA buttons. Interaction: CTA underline on hover."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: Atmosphere Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "image",
        "category": "basic",
        "content": "Image Description: dining room, bar, and outdoor patio. Style: full-bleed image with overlay caption."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: Hours and location Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "text",
        "category": "basic",
        "content": "Hours, address, parking, and nearby landmarks. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Events and catering Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "text",
        "category": "basic",
        "content": "Private dining, group menus, and event availability. Style: tight paragraphs with callout bullets and subtle highlights. Interaction: highlight key phrases on hover."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: Guest reviews Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "social_proof",
        "category": "premium",
        "content": "3 short reviews with dish highlights and rating. Style: testimonial cards in carousel layout with avatars. Interaction: auto-slide with pause on hover."
      },
      {
        "id": 15,
        "type": "cta",
        "category": "marketing",
        "content": "CTA: Reserve a table + secondary CTA (View menu). Style: full-width gradient band with dual CTA and trust line. Interaction: primary button pulse on hover."
      }
    ]
  },
  {
    "id": "preset-22",
    "name": "Fitness Studio Membership Page (15-Section)",
    "category": "Fitness",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Fitness studio hero for {{Studio}} in {{City}} with membership CTA and class highlights. Theme: bold energetic with vibrant gradients and crisp typography. Style: cinematic split hero with class schedule card. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Community first</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">Certified coaches</span>\n    <span class=\"gg-badge\">Flexible classes</span>\n    <span class=\"gg-badge\">Member wins</span>\n    <span class=\"gg-badge\">Trial week</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: Classes and programs Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "grid_2x2",
        "category": "basic",
        "content": "HIIT || Strength\nYoga || Mobility Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: Membership options Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "pricing",
        "category": "marketing",
        "content": "3 membership tiers with trial option. Style: three-tier cards with toggle and featured plan spotlight. Interaction: toggle slides and card glow on hover."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: Trainer highlights Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "columns_2",
        "category": "basic",
        "content": "Coach 1 bio and specialties || Coach 2 bio and specialties Style: split layout with icon chips and mini CTA buttons. Interaction: CTA underline on hover."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: Member results Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "stats",
        "category": "seo",
        "content": "3 results metrics (consistency, strength gains, retention). Use placeholders if unknown. Style: metric cards with trend arrows and micro labels. Interaction: count-up on scroll."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Member stories Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "social_proof",
        "category": "premium",
        "content": "3 testimonials with goal and result. Style: testimonial cards in carousel layout with avatars. Interaction: auto-slide with pause on hover."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: FAQs Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "faq_auto",
        "category": "seo",
        "content": "Generate FAQs about membership, scheduling, and onboarding. Style: accordion list with icons and clean separators. Interaction: smooth expand with rotating chevron."
      },
      {
        "id": 15,
        "type": "cta",
        "category": "marketing",
        "content": "CTA: Book a trial class + secondary CTA (See schedule). Style: full-width gradient band with dual CTA and trust line. Interaction: primary button pulse on hover."
      }
    ]
  },
  {
    "id": "preset-23",
    "name": "Auto Repair Service Page (15-Section)",
    "category": "Automotive",
    "structure": [
      {
        "id": 1,
        "type": "hero",
        "category": "premium",
        "content": "Hero for {{Shop}} offering {{Service}} in {{City}}. Include 2 CTAs (Book inspection / Call now). Theme: industrial clean with slate and electric blue accents. Style: cinematic split hero with service cards and warranty badge. Interaction: CTA hover lift and subtle animated background glow."
      },
      {
        "id": 2,
        "type": "trust_badges",
        "category": "premium",
        "content": "<div class=\"gg-container\">\n  <div class=\"gg-row\">\n    <span class=\"gg-pill\">Certified care</span>\n  </div>\n  <div class=\"gg-badges\" style=\"margin-top:12px\">\n    <span class=\"gg-badge\">ASE certified</span>\n    <span class=\"gg-badge\">Warranty included</span>\n    <span class=\"gg-badge\">Fair estimates</span>\n    <span class=\"gg-badge\">Fast turnaround</span>\n  </div>\n</div>"
      },
      {
        "id": 3,
        "type": "header",
        "category": "basic",
        "content": "H2: Repair services Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 4,
        "type": "grid_2x2",
        "category": "basic",
        "content": "Brakes || Engine\nTransmission || AC and heating Style: tile grid with icons and soft gradient borders. Interaction: hover lift and glow."
      },
      {
        "id": 5,
        "type": "header",
        "category": "basic",
        "content": "H2: Diagnostics and warranty Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 6,
        "type": "columns_2",
        "category": "basic",
        "content": "Inspection and diagnostics || Warranty and quality parts Style: split layout with icon chips and mini CTA buttons. Interaction: CTA underline on hover."
      },
      {
        "id": 7,
        "type": "header",
        "category": "basic",
        "content": "H2: Our process Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 8,
        "type": "process",
        "category": "premium",
        "content": "4-step repair process from inspection to pickup. Style: horizontal timeline with numbered steps and connectors. Interaction: step highlight on hover."
      },
      {
        "id": 9,
        "type": "header",
        "category": "basic",
        "content": "H2: Pricing and estimates Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 10,
        "type": "pricing",
        "category": "marketing",
        "content": "Explain diagnostic fees and estimate ranges. Use placeholders if unknown. Style: three-tier cards with toggle and featured plan spotlight. Interaction: toggle slides and card glow on hover."
      },
      {
        "id": 11,
        "type": "header",
        "category": "basic",
        "content": "H2: Customer reviews Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 12,
        "type": "social_proof",
        "category": "premium",
        "content": "3 reviews mentioning service type and outcome. Style: testimonial cards in carousel layout with avatars. Interaction: auto-slide with pause on hover."
      },
      {
        "id": 13,
        "type": "header",
        "category": "basic",
        "content": "H2: FAQs Style: editorial header with kicker label and accent rule. Interaction: accent line animates on scroll."
      },
      {
        "id": 14,
        "type": "faq_auto",
        "category": "seo",
        "content": "Generate FAQs about warranties, timelines, and parts. Style: accordion list with icons and clean separators. Interaction: smooth expand with rotating chevron."
      },
      {
        "id": 15,
        "type": "cta",
        "category": "marketing",
        "content": "CTA: Schedule service + secondary CTA (Get estimate). Style: full-width gradient band with dual CTA and trust line. Interaction: primary button pulse on hover."
      }
    ]
  }
];

export default PRESET_TEMPLATES;
