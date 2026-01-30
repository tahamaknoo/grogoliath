"use client";

const PRESET_TEMPLATES = [
  // ==================================
  // 1) B2B COMPANY HOMEPAGE
  // ==================================
  {
    id: "preset-1",
    name: "B2B Company Homepage (15-Section)",
    category: "Company",
    structure: [
      { id: 1, type: "hero", category: "premium", content: "Hero for {{Company}} with a crisp value prop, 1 proof line, and 2 CTAs (Book demo / Contact). Desktop split, mobile stacked." },
      { id: 2, type: "trust_badges", category: "premium", content: "Logo strip + trust badges (secure, compliant, support)." },
      { id: 3, type: "header", category: "basic", content: "H2: What we do" },
      { id: 4, type: "text", category: "basic", content: "2 short paragraphs + 3 outcome bullets. Keep it concrete and business-focused." },
      { id: 5, type: "header", category: "basic", content: "H2: Industries we serve" },
      { id: 6, type: "grid_2x2", category: "basic", content: "Healthcare || Finance\nLogistics || SaaS" },
      { id: 7, type: "header", category: "basic", content: "H2: Core solutions" },
      { id: 8, type: "columns_2", category: "basic", content: "Solution A: what it is + outcome || Solution B: what it is + outcome" },
      { id: 9, type: "header", category: "basic", content: "H2: Proof and impact" },
      { id: 10, type: "stats", category: "seo", content: "3 stats (time saved, revenue impact, uptime). Use placeholders if unknown." },
      { id: 11, type: "header", category: "basic", content: "H2: Customer story" },
      { id: 12, type: "case_study", category: "premium", content: "Case study: challenge -> solution -> measurable result." },
      { id: 13, type: "header", category: "basic", content: "H2: Security & compliance" },
      { id: 14, type: "text", category: "basic", content: "Bullets: encryption, access control, audit logs, data retention (avoid claims if unknown)." },
      { id: 15, type: "cta", category: "marketing", content: "CTA: Book a demo + secondary CTA, with a short trust line." }
    ]
  },

  // ==================================
  // 2) SAAS LANDING PAGE
  // ==================================
  {
    id: "preset-2",
    name: "SaaS Landing Page (15-Section)",
    category: "SaaS",
    structure: [
      { id: 1, type: "hero", category: "premium", content: "Modern SaaS hero for {{Product}}. Split layout, 2 CTAs, 3 bullets, product preview card. Mobile stacked." },
      { id: 2, type: "trust_badges", category: "premium", content: "Add logo strip + 3 proof badges (secure, fast setup, support)." },
      { id: 3, type: "header", category: "basic", content: "H2: The problem" },
      { id: 4, type: "pain_point", category: "marketing", content: "Describe 3 pains in crisp, business language. Use cards." },
      { id: 5, type: "header", category: "basic", content: "H2: How it works" },
      { id: 6, type: "process", category: "premium", content: "3-step process. Each step 1-2 short sentences." },
      { id: 7, type: "header", category: "basic", content: "H2: Key features" },
      { id: 8, type: "grid_2x2", category: "basic", content: "Feature A || Feature B\nFeature C || Feature D" },
      { id: 9, type: "header", category: "basic", content: "H2: Use cases" },
      { id: 10, type: "columns_2", category: "basic", content: "Role 1: outcome || Role 2: outcome" },
      { id: 11, type: "header", category: "basic", content: "H2: Results" },
      { id: 12, type: "stats", category: "seo", content: "3 measurable results. Use placeholders if unknown." },
      { id: 13, type: "header", category: "basic", content: "H2: Security" },
      { id: 14, type: "text", category: "basic", content: "Bulleted security summary. Avoid hard claims if unsure." },
      { id: 15, type: "cta", category: "marketing", content: "Final CTA with 2 buttons and short onboarding reassurance." }
    ]
  },

  // ==================================
  // 3) SAAS INTEGRATION PAGE
  // ==================================
  {
    id: "preset-3",
    name: "SaaS Integration Page (15-Section)",
    category: "SaaS",
    structure: [
      { id: 1, type: "hero", category: "premium", content: "Hero: {{Product}} + {{Integration}}. Benefits, 2 CTAs. Responsive split layout." },
      { id: 2, type: "trust_badges", category: "premium", content: "Trust strip: secure connection, permissions-based, support." },
      { id: 3, type: "header", category: "basic", content: "H2: What this integration does" },
      { id: 4, type: "text", category: "basic", content: "2 short paragraphs + 6 bullets describing what syncs and why." },
      { id: 5, type: "header", category: "basic", content: "H2: Popular workflows" },
      { id: 6, type: "grid_2x2", category: "basic", content: "Trigger -> Action || Trigger -> Action\nTrigger -> Action || Trigger -> Action" },
      { id: 7, type: "header", category: "basic", content: "H2: Setup in minutes" },
      { id: 8, type: "process", category: "premium", content: "5-step setup guide. Keep steps short." },
      { id: 9, type: "header", category: "basic", content: "H2: Data mapping" },
      { id: 10, type: "text", category: "basic", content: "Explain field mapping, tags, and sync rules in a simple table-like layout." },
      { id: 11, type: "header", category: "basic", content: "H2: Permissions & security" },
      { id: 12, type: "text", category: "basic", content: "Bullets: least privilege, encryption, access control, logs (if true)." },
      { id: 13, type: "header", category: "basic", content: "H2: Comparison" },
      { id: 14, type: "comparison", category: "premium", content: "With integration vs without. Focus on time saved and fewer errors." },
      { id: 15, type: "cta", category: "marketing", content: "CTA: Connect now + secondary CTA + support note." }
    ]
  },

  // ==================================
  // 4) LOCAL SERVICE PAGE
  // ==================================
  {
    id: "preset-4",
    name: "Local Service Page (15-Section)",
    category: "Services",
    structure: [
      { id: 1, type: "hero", category: "premium", content: "Hero for {{Service}} in {{City}}. Split layout, booking card, 2 CTAs. Mobile stacked." },
      { id: 2, type: "trust_badges", category: "premium", content: "Trust strip: rating, licensed, insured, fast response, hours." },
      { id: 3, type: "header", category: "basic", content: "H2: Common problems" },
      { id: 4, type: "pain_point", category: "marketing", content: "3 local pain points customers face." },
      { id: 5, type: "header", category: "basic", content: "H2: How we help" },
      { id: 6, type: "solution", category: "marketing", content: "3 solution cards with outcomes + short proof lines." },
      { id: 7, type: "header", category: "basic", content: "H2: Our process" },
      { id: 8, type: "process", category: "premium", content: "5-step process. Keep steps short and clear." },
      { id: 9, type: "header", category: "basic", content: "H2: What you get" },
      { id: 10, type: "grid_2x2", category: "basic", content: "Benefit 1 || Benefit 2\nBenefit 3 || Benefit 4" },
      { id: 11, type: "header", category: "basic", content: "H2: Pricing" },
      { id: 12, type: "pricing", category: "marketing", content: "3 pricing cards or explain factors if exact pricing is unknown." },
      { id: 13, type: "header", category: "basic", content: "H2: FAQs" },
      { id: 14, type: "faq_auto", category: "seo", content: "Generate 8 FAQs about cost, timing, guarantees, and booking." },
      { id: 15, type: "contact_form", category: "premium", content: "Booking form + phone CTA + map placeholder." }
    ]
  },

  // ==================================
  // 5) E-COMMERCE PRODUCT PAGE
  // ==================================
  {
    id: "preset-5",
    name: "E-commerce Product Page (15-Section)",
    category: "E-commerce",
    structure: [
      { id: 1, type: "hero", category: "premium", content: "Product hero for {{Product}} with gallery placeholder, price, rating, variants, CTAs. Mobile stacked." },
      { id: 2, type: "trust_badges", category: "premium", content: "Trust row: shipping, returns, warranty, secure payments." },
      { id: 3, type: "header", category: "basic", content: "H2: Why you will love it" },
      { id: 4, type: "grid_2x2", category: "basic", content: "Feature 1 || Feature 2\nFeature 3 || Feature 4" },
      { id: 5, type: "header", category: "basic", content: "H2: Whats included" },
      { id: 6, type: "text", category: "basic", content: "Checklist of items in the box + compatibility notes." },
      { id: 7, type: "header", category: "basic", content: "H2: Specs" },
      { id: 8, type: "stats", category: "seo", content: "Specs table-style section. Use typical ranges if unknown." },
      { id: 9, type: "header", category: "basic", content: "H2: Pros and considerations" },
      { id: 10, type: "pros_cons", category: "premium", content: "Honest pros and considerations." },
      { id: 11, type: "header", category: "basic", content: "H2: Compare" },
      { id: 12, type: "comparison", category: "premium", content: "Compare with 2-3 alternatives. Focus on best-for and price band." },
      { id: 13, type: "header", category: "basic", content: "H2: Reviews" },
      { id: 14, type: "social_proof", category: "premium", content: "Short testimonial quotes with role + verified badge placeholders." },
      { id: 15, type: "cta", category: "marketing", content: "CTA: Add to cart + secondary CTA + trust note." }
    ]
  },

  // ==================================
  // 6) PROFESSIONAL SERVICES PAGE
  // ==================================
  {
    id: "preset-6",
    name: "Professional Services Page (15-Section)",
    category: "Services",
    structure: [
      { id: 1, type: "hero", category: "premium", content: "Hero for {{Service}} with outcome-driven headline, credibility line, 2 CTAs. Mobile first." },
      { id: 2, type: "trust_badges", category: "premium", content: "Trust row: years experience, industries served, certifications." },
      { id: 3, type: "header", category: "basic", content: "H2: The challenge" },
      { id: 4, type: "pain_point", category: "marketing", content: "3 common problems your buyers face." },
      { id: 5, type: "header", category: "basic", content: "H2: Our approach" },
      { id: 6, type: "process", category: "premium", content: "3-5 step approach. Client-friendly and scannable." },
      { id: 7, type: "header", category: "basic", content: "H2: Deliverables" },
      { id: 8, type: "grid_2x2", category: "basic", content: "Deliverable 1 || Deliverable 2\nDeliverable 3 || Deliverable 4" },
      { id: 9, type: "header", category: "basic", content: "H2: Engagement models" },
      { id: 10, type: "columns_2", category: "basic", content: "Fixed scope: ideal for X || Retainer: ideal for Y" },
      { id: 11, type: "header", category: "basic", content: "H2: Results" },
      { id: 12, type: "stats", category: "seo", content: "3 result metrics with placeholders." },
      { id: 13, type: "header", category: "basic", content: "H2: FAQs" },
      { id: 14, type: "faq_auto", category: "seo", content: "Generate 8 FAQs about scope, timeline, pricing, onboarding." },
      { id: 15, type: "contact_form", category: "premium", content: "Consultation form + calendar placeholder + response time note." }
    ]
  },

  // ==================================
  // 7) B2B CASE STUDY
  // ==================================
  {
    id: "preset-7",
    name: "B2B Case Study Page (15-Section)",
    category: "Company",
    structure: [
      { id: 1, type: "hero", category: "premium", content: "Hero for {{Client}} + {{Company}} with headline, 1-line summary, CTA." },
      { id: 2, type: "trust_badges", category: "premium", content: "Client logo placeholder + industry + engagement length." },
      { id: 3, type: "header", category: "basic", content: "H2: The client" },
      { id: 4, type: "text", category: "basic", content: "Short background: size, industry, goals." },
      { id: 5, type: "header", category: "basic", content: "H2: The challenge" },
      { id: 6, type: "pain_point", category: "marketing", content: "3 specific problems or blockers." },
      { id: 7, type: "header", category: "basic", content: "H2: The solution" },
      { id: 8, type: "solution", category: "marketing", content: "Explain the solution in 3 concise steps." },
      { id: 9, type: "header", category: "basic", content: "H2: Implementation" },
      { id: 10, type: "process", category: "premium", content: "Timeline with 3-5 steps. Emphasize collaboration." },
      { id: 11, type: "header", category: "basic", content: "H2: Results" },
      { id: 12, type: "grid_2x2", category: "basic", content: "+25% efficiency || -30% costs\n2x faster delivery || +15 NPS" },
      { id: 13, type: "header", category: "basic", content: "H2: Customer quote" },
      { id: 14, type: "social_proof", category: "premium", content: "Short testimonial with role + company." },
      { id: 15, type: "cta", category: "marketing", content: "CTA: See how we can help. Add 2 buttons and a short reassurance line." }
    ]
  },

  // ==================================
  // 8) RESTAURANT / CAFE PAGE
  // ==================================
  {
    id: "preset-8",
    name: "Restaurant / Cafe Page (15-Section)",
    category: "Hospitality",
    structure: [
      { id: 1, type: "hero", category: "premium", content: "Hero for {{RestaurantName}} in {{City}} with cuisine chips, hours, CTAs (Reserve / View menu)." },
      { id: 2, type: "trust_badges", category: "premium", content: "Review strip placeholders + freshness badges." },
      { id: 3, type: "header", category: "basic", content: "H2: Our story" },
      { id: 4, type: "text", category: "basic", content: "Short story with vibe + what makes you different." },
      { id: 5, type: "header", category: "basic", content: "H2: Signature dishes" },
      { id: 6, type: "grid_2x2", category: "basic", content: "Dish 1 || Dish 2\nDish 3 || Dish 4" },
      { id: 7, type: "header", category: "basic", content: "H2: Menu highlights" },
      { id: 8, type: "columns_2", category: "basic", content: "Starters and mains || Desserts and drinks" },
      { id: 9, type: "header", category: "basic", content: "H2: Events and group bookings" },
      { id: 10, type: "text", category: "basic", content: "Explain private dining, group size, and booking flow." },
      { id: 11, type: "header", category: "basic", content: "H2: Location" },
      { id: 12, type: "text", category: "basic", content: "Address, map placeholder, parking note, public transport note." },
      { id: 13, type: "header", category: "basic", content: "H2: FAQs" },
      { id: 14, type: "faq_auto", category: "seo", content: "Generate 8 FAQs (reservations, dietary options, parking, delivery, timings)." },
      { id: 15, type: "cta", category: "marketing", content: "CTA: Reserve now + secondary CTA + newsletter signup." }
    ]
  },

  // ==================================
  // 9) NONPROFIT DONATION PAGE
  // ==================================
  {
    id: "preset-9",
    name: "Nonprofit Donation Page (15-Section)",
    category: "Nonprofit",
    structure: [
      { id: 1, type: "hero", category: "premium", content: "Hero for {{Cause}} with emotional headline, short story intro, CTA (Donate)." },
      { id: 2, type: "trust_badges", category: "premium", content: "Trust row: secure payments, transparency note, nonprofit status placeholder." },
      { id: 3, type: "header", category: "basic", content: "H2: The mission" },
      { id: 4, type: "text", category: "basic", content: "Mission with 3 pillars as cards." },
      { id: 5, type: "header", category: "basic", content: "H2: Where your donation goes" },
      { id: 6, type: "columns_2", category: "basic", content: "Program impact || Operations and community" },
      { id: 7, type: "header", category: "basic", content: "H2: Impact stories" },
      { id: 8, type: "grid_2x2", category: "basic", content: "Story 1 || Story 2\nStory 3 || Story 4" },
      { id: 9, type: "header", category: "basic", content: "H2: Choose your impact" },
      { id: 10, type: "comparison", category: "premium", content: "Donation tiers table: $X helps with Y (3-5 tiers)." },
      { id: 11, type: "header", category: "basic", content: "H2: Donate now" },
      { id: 12, type: "contact_form", category: "premium", content: "Donation form UI: preset amounts + custom + recurring option." },
      { id: 13, type: "header", category: "basic", content: "H2: FAQs" },
      { id: 14, type: "faq_auto", category: "seo", content: "Generate 8 FAQs (tax receipt, recurring, payment methods, refunds)." },
      { id: 15, type: "cta", category: "marketing", content: "Final CTA: donate + share buttons + newsletter signup." }
    ]
  },

  // ==================================
  // 10) SEO BLOG POST
  // ==================================
  {
    id: "preset-10",
    name: "SEO Blog Post (15-Section)",
    category: "Content",
    structure: [
      { id: 1, type: "header", category: "basic", content: "H1: {{Keyword}} - The Practical Guide" },
      { id: 2, type: "text", category: "basic", content: "Intro: 2 short paragraphs + a 3-bullet 'You will learn' list. Keep it crisp." },
      { id: 3, type: "schema_blog", category: "seo", content: "{\n  \"@context\":\"https://schema.org\",\n  \"@type\":\"BlogPosting\",\n  \"headline\":\"{{Keyword}} - The Practical Guide\",\n  \"description\":\"A practical guide to {{Keyword}} with steps, examples, mistakes, and FAQs.\",\n  \"author\":{\"@type\":\"Person\",\"name\":\"{{Author}}\"}\n}" },
      { id: 4, type: "header", category: "basic", content: "H2: What is {{Keyword}}?" },
      { id: 5, type: "text", category: "basic", content: "Explain {{Keyword}} simply. Include 1 analogy + 1 example." },
      { id: 6, type: "header", category: "basic", content: "H2: Why it matters" },
      { id: 7, type: "grid_2x2", category: "basic", content: "Benefit 1 || Benefit 2\nBenefit 3 || Benefit 4" },
      { id: 8, type: "header", category: "basic", content: "H2: How it works" },
      { id: 9, type: "process", category: "premium", content: "6-step process. Each step 1-2 sentences. Mobile first." },
      { id: 10, type: "header", category: "basic", content: "H2: Examples" },
      { id: 11, type: "grid_2x2", category: "basic", content: "Example 1 || Example 2\nExample 3 || Example 4" },
      { id: 12, type: "header", category: "basic", content: "H2: Common mistakes" },
      { id: 13, type: "text", category: "basic", content: "List 8 mistakes with quick fixes. Keep each under 18 words." },
      { id: 14, type: "faq_auto", category: "seo", content: "Generate 8 FAQs about {{Keyword}} with short, direct answers." },
      { id: 15, type: "cta", category: "marketing", content: "CTA: recommend {{Product}} or {{Brand}} with 2 buttons + short trust note." }
    ]
  },

  // ==================================
  // 11) PREMIUM ENTERPRISE HOMEPAGE
  // ==================================
  {
    id: "preset-11",
    name: "Enterprise Homepage (Premium 15-Section)",
    category: "Premium",
    structure: [
      { id: 1, type: "hero", category: "premium", content: "Enterprise hero for {{Company}} with a crisp value prop, proof line, and 2 CTAs (Book demo / Talk to sales). Mobile-first." },
      { id: 2, type: "trust_badges", category: "premium", content: "Global logos + compliance badges (SOC 2, ISO) if applicable." },
      { id: 3, type: "header", category: "basic", content: "H2: Enterprise-grade outcomes" },
      { id: 4, type: "grid_2x2", category: "basic", content: "Outcome 1 || Outcome 2\nOutcome 3 || Outcome 4" },
      { id: 5, type: "header", category: "basic", content: "H2: Platform overview" },
      { id: 6, type: "columns_2", category: "basic", content: "Module A: value + outcome || Module B: value + outcome" },
      { id: 7, type: "header", category: "basic", content: "H2: Security and compliance" },
      { id: 8, type: "text", category: "basic", content: "Bullets: encryption, access controls, audit logs, data retention. Avoid claims if unknown." },
      { id: 9, type: "header", category: "basic", content: "H2: Implementation" },
      { id: 10, type: "process", category: "premium", content: "4-step enterprise rollout plan. Keep it scannable." },
      { id: 11, type: "header", category: "basic", content: "H2: Customer story" },
      { id: 12, type: "case_study", category: "premium", content: "Case study with measurable impact and timeline." },
      { id: 13, type: "header", category: "basic", content: "H2: FAQs" },
      { id: 14, type: "faq_auto", category: "seo", content: "Generate 6-8 enterprise FAQs (procurement, security, onboarding, SLAs)." },
      { id: 15, type: "cta", category: "marketing", content: "CTA: Book enterprise demo + secondary CTA with reassurance line." }
    ]
  },

  // ==================================
  // 12) PREMIUM PRODUCT LAUNCH
  // ==================================
  {
    id: "preset-12",
    name: "Product Launch Page (Premium 15-Section)",
    category: "Premium",
    structure: [
      { id: 1, type: "hero", category: "premium", content: "Launch hero for {{Product}} with launch hook, countdown placeholder, 2 CTAs (Join waitlist / Get updates)." },
      { id: 2, type: "trust_badges", category: "premium", content: "Press logos placeholder + awards badges." },
      { id: 3, type: "header", category: "basic", content: "H2: Why now" },
      { id: 4, type: "text", category: "basic", content: "Short explanation of market shift + urgency. 2 short paragraphs." },
      { id: 5, type: "header", category: "basic", content: "H2: What you get" },
      { id: 6, type: "grid_2x2", category: "basic", content: "Benefit 1 || Benefit 2\nBenefit 3 || Benefit 4" },
      { id: 7, type: "header", category: "basic", content: "H2: How it works" },
      { id: 8, type: "process", category: "premium", content: "3-step flow with short descriptions." },
      { id: 9, type: "header", category: "basic", content: "H2: Early access" },
      { id: 10, type: "pricing", category: "marketing", content: "Founding plans or early access tiers. Use placeholders if unknown." },
      { id: 11, type: "header", category: "basic", content: "H2: Social proof" },
      { id: 12, type: "social_proof", category: "premium", content: "Short testimonial quotes + role + company." },
      { id: 13, type: "header", category: "basic", content: "H2: FAQs" },
      { id: 14, type: "faq_auto", category: "seo", content: "Generate 6-8 FAQs about launch timing, access, pricing, support." },
      { id: 15, type: "cta", category: "marketing", content: "Final CTA: Join waitlist + secondary CTA with trust note." }
    ]
  },

  // ==================================
  // 13) PREMIUM AGENCY PORTFOLIO
  // ==================================
  {
    id: "preset-13",
    name: "Agency Portfolio (Premium 15-Section)",
    category: "Premium",
    structure: [
      { id: 1, type: "hero", category: "premium", content: "Agency hero for {{Agency}} with positioning, specialty, 2 CTAs (Get proposal / View work)." },
      { id: 2, type: "trust_badges", category: "premium", content: "Client logos + awards placeholders." },
      { id: 3, type: "header", category: "basic", content: "H2: What we do" },
      { id: 4, type: "columns_2", category: "basic", content: "Service line A || Service line B" },
      { id: 5, type: "header", category: "basic", content: "H2: Selected work" },
      { id: 6, type: "grid_2x2", category: "basic", content: "Project 1 || Project 2\nProject 3 || Project 4" },
      { id: 7, type: "header", category: "basic", content: "H2: Results" },
      { id: 8, type: "stats", category: "seo", content: "3 outcome metrics with placeholders." },
      { id: 9, type: "header", category: "basic", content: "H2: Process" },
      { id: 10, type: "process", category: "premium", content: "4-step delivery process." },
      { id: 11, type: "header", category: "basic", content: "H2: Testimonials" },
      { id: 12, type: "social_proof", category: "premium", content: "Short testimonials with role + company." },
      { id: 13, type: "header", category: "basic", content: "H2: FAQs" },
      { id: 14, type: "faq_auto", category: "seo", content: "Generate FAQs about scope, timelines, and pricing." },
      { id: 15, type: "cta", category: "marketing", content: "CTA: Start a project + secondary CTA + trust note." }
    ]
  },

  // ==================================
  // 14) PREMIUM CAREERS PAGE
  // ==================================
  {
    id: "preset-14",
    name: "Careers Page (Premium 15-Section)",
    category: "Premium",
    structure: [
      { id: 1, type: "hero", category: "premium", content: "Careers hero for {{Company}} with mission, team photo placeholder, 2 CTAs (View roles / Meet team)." },
      { id: 2, type: "trust_badges", category: "premium", content: "Benefits badges: remote, flexible, health, growth." },
      { id: 3, type: "header", category: "basic", content: "H2: Our mission" },
      { id: 4, type: "text", category: "basic", content: "Short mission statement + values list." },
      { id: 5, type: "header", category: "basic", content: "H2: Life at {{Company}}" },
      { id: 6, type: "grid_2x2", category: "basic", content: "Culture 1 || Culture 2\nCulture 3 || Culture 4" },
      { id: 7, type: "header", category: "basic", content: "H2: Benefits" },
      { id: 8, type: "columns_2", category: "basic", content: "Core benefits || Growth and learning" },
      { id: 9, type: "header", category: "basic", content: "H2: Open roles" },
      { id: 10, type: "text", category: "basic", content: "List 6 roles with location and short blurb." },
      { id: 11, type: "header", category: "basic", content: "H2: Hiring process" },
      { id: 12, type: "process", category: "premium", content: "4-step hiring process (screen, interview, task, offer)." },
      { id: 13, type: "header", category: "basic", content: "H2: FAQs" },
      { id: 14, type: "faq_auto", category: "seo", content: "Generate FAQs about remote work, benefits, timelines, and roles." },
      { id: 15, type: "cta", category: "marketing", content: "CTA: View open roles + secondary CTA (Submit resume)." }
    ]
  },

  // ==================================
  // 15) PREMIUM INVESTOR / PRESS PAGE
  // ==================================
  {
    id: "preset-15",
    name: "Investor / Press Page (Premium 15-Section)",
    category: "Premium",
    structure: [
      { id: 1, type: "hero", category: "premium", content: "Investor and press hero for {{Company}} with overview and 2 CTAs (Download deck / Contact IR)." },
      { id: 2, type: "trust_badges", category: "premium", content: "Press logos + awards placeholders." },
      { id: 3, type: "header", category: "basic", content: "H2: Company snapshot" },
      { id: 4, type: "stats", category: "seo", content: "Key metrics: ARR, growth, customers, regions (use placeholders)." },
      { id: 5, type: "header", category: "basic", content: "H2: Latest news" },
      { id: 6, type: "grid_2x2", category: "basic", content: "Press item 1 || Press item 2\nPress item 3 || Press item 4" },
      { id: 7, type: "header", category: "basic", content: "H2: Leadership" },
      { id: 8, type: "columns_2", category: "basic", content: "Founder bio || Executive bio" },
      { id: 9, type: "header", category: "basic", content: "H2: Investor resources" },
      { id: 10, type: "text", category: "basic", content: "Links to deck, financials, and press kit." },
      { id: 11, type: "header", category: "basic", content: "H2: FAQs" },
      { id: 12, type: "faq_auto", category: "seo", content: "Generate FAQs about investment, press inquiries, and coverage." },
      { id: 13, type: "header", category: "basic", content: "H2: Contact" },
      { id: 14, type: "contact_form", category: "premium", content: "Investor and press contact form + email placeholder." },
      { id: 15, type: "cta", category: "marketing", content: "CTA: Contact IR + secondary CTA (Download deck)." }
    ]
  }
];

export default PRESET_TEMPLATES;
