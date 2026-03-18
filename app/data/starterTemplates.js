"use client";

const STARTER_TEMPLATES = [
  {
    id: 'starter-1',
    name: 'Clean Minimal',
    category: 'General',
    structure: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{KEYWORD}} | {{LOCATION}}</title>
<meta name="description" content="{{META_DESCRIPTION}}">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', system-ui, sans-serif; color: #111; background: #fff; -webkit-font-smoothing: antialiased; line-height: 1.6; }
a { text-decoration: none; color: inherit; }
.c { max-width: 1080px; margin: 0 auto; padding: 0 28px; }
nav { border-bottom: 1px solid #e5e7eb; padding: 18px 0; }
.nav-row { display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: 1rem; font-weight: 700; }
.nav-btn { background: #111; color: #fff; padding: 9px 18px; border-radius: 7px; font-size: 0.8125rem; font-weight: 600; }
.hero { padding: 92px 0 72px; }
.hero-tag { font-size: 0.75rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #6b7280; margin-bottom: 18px; }
.hero h1 { font-size: clamp(2.25rem, 5vw, 3.5rem); font-weight: 800; line-height: 1.1; margin-bottom: 20px; max-width: 740px; }
.hero p { font-size: 1.0625rem; color: #6b7280; max-width: 520px; line-height: 1.75; margin-bottom: 36px; }
.btn-row { display: flex; gap: 10px; flex-wrap: wrap; }
.btn-dark { background: #111; color: #fff; padding: 13px 26px; border-radius: 8px; font-weight: 600; font-size: .9375rem; display: inline-block; }
.btn-outline { color: #111; padding: 13px 26px; font-weight: 600; font-size: .9375rem; border: 1px solid #e5e7eb; border-radius: 8px; display: inline-block; }
.sec { padding: 72px 0; border-top: 1px solid #e5e7eb; }
.sec-tag { font-size: .75rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #6b7280; margin-bottom: 12px; }
.sec h2 { font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight: 700; margin-bottom: 14px; }
.sec-lead { font-size: 1rem; color: #6b7280; max-width: 520px; line-height: 1.75; margin-bottom: 48px; }
.grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
.card { padding: 28px; border: 1px solid #e5e7eb; border-radius: 10px; }
.card-title { font-size: .9375rem; font-weight: 700; margin-bottom: 8px; }
.card-body { font-size: .875rem; color: #6b7280; line-height: 1.7; }
.testi { background: #f9fafb; padding: 24px; border-radius: 10px; }
.testi-quote { font-size: .9375rem; color: #374151; line-height: 1.75; margin-bottom: 16px; font-style: italic; }
.testi-name { font-size: .8125rem; font-weight: 600; }
.cta-band { background: #111; padding: 80px 0; text-align: center; }
.cta-band h2 { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 800; color: #fff; margin-bottom: 12px; }
.cta-band p { font-size: 1rem; color: #9ca3af; margin-bottom: 32px; }
.btn-white { background: #fff; color: #111; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: .9375rem; display: inline-block; }
footer { padding: 32px 0; border-top: 1px solid #e5e7eb; }
.foot { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: .8125rem; color: #9ca3af; }
</style>
</head>
<body>
<nav><div class="c"><div class="nav-row">
  <div class="logo">{{KEYWORD}}</div>
  <a href="#contact" class="nav-btn">Get in touch</a>
</div></div></nav>

<section class="hero"><div class="c">
  <div class="hero-tag">{{SERVICE}} in {{LOCATION}}</div>
  <h1>{{HERO_HEADLINE}}</h1>
  <p>{{HERO_SUBHEADLINE}}</p>
  <div class="btn-row">
    <a href="#contact" class="btn-dark">Get a free quote</a>
    <a href="#services" class="btn-outline">Learn more</a>
  </div>
</div></section>

<section class="sec" id="services"><div class="c">
  <div class="sec-tag">What we do</div>
  <h2>{{SERVICES_HEADLINE}}</h2>
  <p class="sec-lead">{{SERVICES_INTRO}}</p>
  <div class="grid3">
    <div class="card"><div class="card-title">{{FEATURE_1_TITLE}}</div><div class="card-body">{{FEATURE_1_TEXT}}</div></div>
    <div class="card"><div class="card-title">{{FEATURE_2_TITLE}}</div><div class="card-body">{{FEATURE_2_TEXT}}</div></div>
    <div class="card"><div class="card-title">{{FEATURE_3_TITLE}}</div><div class="card-body">{{FEATURE_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="why"><div class="c">
  <div class="sec-tag">Why choose us</div>
  <h2>{{WHY_HEADLINE}}</h2>
  <p class="sec-lead">{{WHY_INTRO}}</p>
  <div class="grid3">
    <div class="card"><div class="card-title">{{WHY_1_TITLE}}</div><div class="card-body">{{WHY_1_TEXT}}</div></div>
    <div class="card"><div class="card-title">{{WHY_2_TITLE}}</div><div class="card-body">{{WHY_2_TEXT}}</div></div>
    <div class="card"><div class="card-title">{{WHY_3_TITLE}}</div><div class="card-body">{{WHY_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="reviews"><div class="c">
  <div class="sec-tag">Reviews</div>
  <h2>Trusted across {{LOCATION}}</h2>
  <p class="sec-lead">Real feedback from real customers in {{LOCATION}}.</p>
  <div class="grid2">
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_1_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_1_NAME}}, {{LOCATION}}</div></div>
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_2_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_2_NAME}}, {{LOCATION}}</div></div>
  </div>
</div></section>

<section class="cta-band" id="contact"><div class="c">
  <h2>{{CTA_HEADLINE}}</h2>
  <p>{{CTA_SUBTEXT}}</p>
  <a href="tel:+1-555-000-0000" class="btn-white">Call us now</a>
</div></section>

<footer><div class="c"><div class="foot">
  <span>{{KEYWORD}} &mdash; {{LOCATION}}</span>
  <span>&copy; 2024 {{KEYWORD}}. All rights reserved.</span>
</div></div></footer>
</body></html>`
  },

  {
    id: 'starter-2',
    name: 'Bold Dark',
    category: 'General',
    structure: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{KEYWORD}} | {{LOCATION}}</title>
<meta name="description" content="{{META_DESCRIPTION}}">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', system-ui, sans-serif; background: #0a0a0a; color: #f5f5f5; -webkit-font-smoothing: antialiased; line-height: 1.6; }
a { text-decoration: none; color: inherit; }
.c { max-width: 1080px; margin: 0 auto; padding: 0 28px; }
nav { padding: 20px 0; border-bottom: 1px solid #1f1f1f; }
.nav-row { display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: 1rem; font-weight: 700; color: #fff; }
.nav-btn { background: #7c3aed; color: #fff; padding: 9px 18px; border-radius: 7px; font-size: 0.8125rem; font-weight: 600; }
.hero { padding: 100px 0 80px; }
.hero-eyebrow { font-size: 0.75rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: #7c3aed; margin-bottom: 20px; }
.hero h1 { font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 900; line-height: 1.05; color: #fff; margin-bottom: 24px; max-width: 800px; }
.hero h1 span { color: #7c3aed; }
.hero p { font-size: 1.125rem; color: #a3a3a3; max-width: 500px; line-height: 1.75; margin-bottom: 40px; }
.btn-row { display: flex; gap: 12px; flex-wrap: wrap; }
.btn-purple { background: #7c3aed; color: #fff; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: .9375rem; display: inline-block; }
.btn-ghost { color: #a3a3a3; padding: 14px 28px; font-weight: 600; font-size: .9375rem; border: 1px solid #2a2a2a; border-radius: 8px; display: inline-block; }
.stats-row { display: flex; gap: 48px; flex-wrap: wrap; padding: 48px 0; border-top: 1px solid #1f1f1f; border-bottom: 1px solid #1f1f1f; margin-top: 64px; }
.stat-num { font-size: 2.25rem; font-weight: 800; color: #fff; }
.stat-lbl { font-size: .8125rem; color: #6b7280; margin-top: 4px; }
.sec { padding: 80px 0; border-top: 1px solid #1f1f1f; }
.sec-tag { font-size: .75rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #7c3aed; margin-bottom: 12px; }
.sec h2 { font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight: 700; color: #fff; margin-bottom: 14px; }
.sec-lead { font-size: 1rem; color: #a3a3a3; max-width: 520px; line-height: 1.75; margin-bottom: 48px; }
.grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 2px; border: 1px solid #1f1f1f; border-radius: 12px; overflow: hidden; }
.card { padding: 32px; background: #111; border: none; }
.card-num { font-size: .75rem; font-weight: 700; color: #7c3aed; margin-bottom: 16px; }
.card-title { font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 10px; }
.card-body { font-size: .875rem; color: #6b7280; line-height: 1.7; }
.testi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.testi { background: #111; padding: 28px; border-radius: 10px; border: 1px solid #1f1f1f; }
.testi-quote { font-size: .9375rem; color: #d4d4d4; line-height: 1.75; margin-bottom: 20px; }
.testi-name { font-size: .8125rem; font-weight: 600; color: #fff; }
.cta-band { background: #7c3aed; padding: 80px 0; text-align: center; }
.cta-band h2 { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 800; color: #fff; margin-bottom: 12px; }
.cta-band p { font-size: 1rem; color: rgba(255,255,255,.75); margin-bottom: 32px; }
.btn-white { background: #fff; color: #7c3aed; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: .9375rem; display: inline-block; }
footer { padding: 32px 0; border-top: 1px solid #1f1f1f; }
.foot { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: .8125rem; color: #4b5563; }
</style>
</head>
<body>
<nav><div class="c"><div class="nav-row">
  <div class="logo">{{KEYWORD}}</div>
  <a href="#contact" class="nav-btn">Get a quote</a>
</div></div></nav>

<section class="hero"><div class="c">
  <div class="hero-eyebrow">{{SERVICE}} &mdash; {{LOCATION}}</div>
  <h1>{{HERO_HEADLINE}}</h1>
  <p>{{HERO_SUBHEADLINE}}</p>
  <div class="btn-row">
    <a href="#contact" class="btn-purple">Get started</a>
    <a href="#services" class="btn-ghost">See our work</a>
  </div>
  <div class="stats-row">
    <div><div class="stat-num">{{STAT_1_NUMBER}}</div><div class="stat-lbl">{{STAT_1_LABEL}}</div></div>
    <div><div class="stat-num">{{STAT_2_NUMBER}}</div><div class="stat-lbl">{{STAT_2_LABEL}}</div></div>
    <div><div class="stat-num">{{STAT_3_NUMBER}}</div><div class="stat-lbl">{{STAT_3_LABEL}}</div></div>
  </div>
</div></section>

<section class="sec" id="services"><div class="c">
  <div class="sec-tag">Services</div>
  <h2>{{SERVICES_HEADLINE}}</h2>
  <p class="sec-lead">{{SERVICES_INTRO}}</p>
  <div class="grid3">
    <div class="card"><div class="card-num">01</div><div class="card-title">{{FEATURE_1_TITLE}}</div><div class="card-body">{{FEATURE_1_TEXT}}</div></div>
    <div class="card"><div class="card-num">02</div><div class="card-title">{{FEATURE_2_TITLE}}</div><div class="card-body">{{FEATURE_2_TEXT}}</div></div>
    <div class="card"><div class="card-num">03</div><div class="card-title">{{FEATURE_3_TITLE}}</div><div class="card-body">{{FEATURE_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="reviews"><div class="c">
  <div class="sec-tag">Reviews</div>
  <h2>What clients say</h2>
  <p class="sec-lead">Trusted by businesses and residents across {{LOCATION}}.</p>
  <div class="testi-grid">
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_1_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_1_NAME}}</div></div>
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_2_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_2_NAME}}</div></div>
  </div>
</div></section>

<section class="cta-band" id="contact"><div class="c">
  <h2>{{CTA_HEADLINE}}</h2>
  <p>{{CTA_SUBTEXT}}</p>
  <a href="tel:+1-555-000-0000" class="btn-white">Call us today</a>
</div></section>

<footer><div class="c"><div class="foot">
  <span>{{KEYWORD}} &mdash; {{LOCATION}}</span>
  <span>&copy; 2024 {{KEYWORD}}</span>
</div></div></footer>
</body></html>`
  },

  {
    id: 'starter-3',
    name: 'Warm Earthy',
    category: 'Local Business',
    structure: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{KEYWORD}} | {{LOCATION}}</title>
<meta name="description" content="{{META_DESCRIPTION}}">
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', system-ui, sans-serif; background: #faf6f0; color: #1c1008; -webkit-font-smoothing: antialiased; line-height: 1.6; }
a { text-decoration: none; color: inherit; }
.c { max-width: 1060px; margin: 0 auto; padding: 0 28px; }
h1, h2, h3 { font-family: 'Lora', Georgia, serif; }
nav { background: #faf6f0; padding: 20px 0; border-bottom: 1px solid #e8ddd0; position: sticky; top: 0; z-index: 10; }
.nav-row { display: flex; justify-content: space-between; align-items: center; }
.logo { font-family: 'Lora', serif; font-size: 1.125rem; font-weight: 700; color: #1c1008; }
.nav-btn { background: #b45309; color: #fff; padding: 9px 20px; border-radius: 6px; font-size: 0.875rem; font-weight: 600; }
.hero { padding: 88px 0 72px; }
.hero-location { font-size: 0.8125rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #92400e; margin-bottom: 20px; }
.hero h1 { font-size: clamp(2.25rem, 5vw, 3.75rem); font-weight: 700; line-height: 1.15; color: #1c1008; margin-bottom: 22px; max-width: 720px; }
.hero p { font-size: 1.0625rem; color: #78716c; max-width: 540px; line-height: 1.8; margin-bottom: 36px; }
.btn-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.btn-amber { background: #b45309; color: #fff; padding: 13px 28px; border-radius: 6px; font-weight: 600; font-size: .9375rem; display: inline-block; }
.btn-text { color: #b45309; font-weight: 600; font-size: .9375rem; border-bottom: 1px solid #b45309; padding-bottom: 2px; }
.divider { border: none; border-top: 1px solid #e8ddd0; }
.sec { padding: 72px 0; }
.sec-label { font-size: .75rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #92400e; margin-bottom: 14px; }
.sec h2 { font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight: 700; color: #1c1008; margin-bottom: 14px; }
.sec-lead { font-size: 1rem; color: #78716c; max-width: 520px; line-height: 1.8; margin-bottom: 48px; }
.grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
.card { background: #fff; padding: 32px; border-radius: 8px; border: 1px solid #e8ddd0; }
.card-title { font-family: 'Lora', serif; font-size: 1.0625rem; font-weight: 600; color: #1c1008; margin-bottom: 10px; }
.card-body { font-size: .875rem; color: #78716c; line-height: 1.75; }
.testi { background: #fff; padding: 28px; border-radius: 8px; border-left: 3px solid #b45309; }
.testi-quote { font-family: 'Lora', serif; font-style: italic; font-size: 1rem; color: #44403c; line-height: 1.75; margin-bottom: 18px; }
.testi-name { font-size: .8125rem; font-weight: 600; color: #1c1008; }
.cta-band { background: #1c1008; padding: 80px 0; }
.cta-inner { max-width: 580px; }
.cta-band h2 { font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 700; color: #faf6f0; margin-bottom: 14px; }
.cta-band p { font-size: 1rem; color: #a8a29e; line-height: 1.75; margin-bottom: 32px; }
.btn-amber-lg { background: #b45309; color: #fff; padding: 15px 36px; border-radius: 6px; font-weight: 700; font-size: 1rem; display: inline-block; }
footer { padding: 32px 0; border-top: 1px solid #e8ddd0; background: #faf6f0; }
.foot { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: .8125rem; color: #a8a29e; }
</style>
</head>
<body>
<nav><div class="c"><div class="nav-row">
  <div class="logo">{{KEYWORD}}</div>
  <a href="#contact" class="nav-btn">Get in touch</a>
</div></div></nav>

<section class="hero"><div class="c">
  <div class="hero-location">Serving {{LOCATION}}</div>
  <h1>{{HERO_HEADLINE}}</h1>
  <p>{{HERO_SUBHEADLINE}}</p>
  <div class="btn-row">
    <a href="#contact" class="btn-amber">Free consultation</a>
    <a href="#services" class="btn-text">Our services</a>
  </div>
</div></section>

<hr class="divider">

<section class="sec" id="services"><div class="c">
  <div class="sec-label">What we offer</div>
  <h2>{{SERVICES_HEADLINE}}</h2>
  <p class="sec-lead">{{SERVICES_INTRO}}</p>
  <div class="grid3">
    <div class="card"><div class="card-title">{{FEATURE_1_TITLE}}</div><div class="card-body">{{FEATURE_1_TEXT}}</div></div>
    <div class="card"><div class="card-title">{{FEATURE_2_TITLE}}</div><div class="card-body">{{FEATURE_2_TEXT}}</div></div>
    <div class="card"><div class="card-title">{{FEATURE_3_TITLE}}</div><div class="card-body">{{FEATURE_3_TEXT}}</div></div>
  </div>
</div></section>

<hr class="divider">

<section class="sec" id="why"><div class="c">
  <div class="sec-label">Our approach</div>
  <h2>{{WHY_HEADLINE}}</h2>
  <p class="sec-lead">{{WHY_INTRO}}</p>
  <div class="grid3">
    <div class="card"><div class="card-title">{{WHY_1_TITLE}}</div><div class="card-body">{{WHY_1_TEXT}}</div></div>
    <div class="card"><div class="card-title">{{WHY_2_TITLE}}</div><div class="card-body">{{WHY_2_TEXT}}</div></div>
    <div class="card"><div class="card-title">{{WHY_3_TITLE}}</div><div class="card-body">{{WHY_3_TEXT}}</div></div>
  </div>
</div></section>

<hr class="divider">

<section class="sec" id="reviews"><div class="c">
  <div class="sec-label">Kind words</div>
  <h2>Trusted by {{LOCATION}} residents</h2>
  <p class="sec-lead">Here is what our customers have to say.</p>
  <div class="grid2">
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_1_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_1_NAME}}, {{LOCATION}}</div></div>
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_2_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_2_NAME}}, {{LOCATION}}</div></div>
  </div>
</div></section>

<section class="cta-band" id="contact"><div class="c">
  <div class="cta-inner">
    <h2>{{CTA_HEADLINE}}</h2>
    <p>{{CTA_SUBTEXT}}</p>
    <a href="tel:+1-555-000-0000" class="btn-amber-lg">Call us today</a>
  </div>
</div></section>

<footer><div class="c"><div class="foot">
  <span>{{KEYWORD}} &mdash; {{LOCATION}}</span>
  <span>&copy; 2024 {{KEYWORD}}. All rights reserved.</span>
</div></div></footer>
</body></html>`
  },

  {
    id: 'starter-4',
    name: 'Navy Professional',
    category: 'Professional Services',
    structure: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{KEYWORD}} | {{LOCATION}}</title>
<meta name="description" content="{{META_DESCRIPTION}}">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; background: #fff; -webkit-font-smoothing: antialiased; line-height: 1.6; }
a { text-decoration: none; color: inherit; }
.c { max-width: 1080px; margin: 0 auto; padding: 0 28px; }
nav { background: #0f172a; padding: 18px 0; }
.nav-row { display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: 1rem; font-weight: 700; color: #fff; }
.nav-links { display: flex; gap: 32px; align-items: center; }
.nav-link { font-size: .875rem; color: #94a3b8; font-weight: 500; }
.nav-btn { background: #2563eb; color: #fff; padding: 9px 18px; border-radius: 6px; font-size: .8125rem; font-weight: 600; }
.hero { background: #0f172a; padding: 96px 0 80px; }
.hero-badge { display: inline-block; background: rgba(37,99,235,.15); color: #60a5fa; font-size: .75rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; padding: 5px 12px; border-radius: 4px; margin-bottom: 24px; }
.hero h1 { font-size: clamp(2.25rem, 5vw, 3.5rem); font-weight: 800; line-height: 1.1; color: #fff; margin-bottom: 20px; max-width: 720px; }
.hero p { font-size: 1.0625rem; color: #94a3b8; max-width: 520px; line-height: 1.75; margin-bottom: 36px; }
.btn-row { display: flex; gap: 12px; flex-wrap: wrap; }
.btn-blue { background: #2563eb; color: #fff; padding: 13px 26px; border-radius: 7px; font-weight: 600; font-size: .9375rem; display: inline-block; }
.btn-ghost { color: #94a3b8; padding: 13px 26px; font-weight: 600; font-size: .9375rem; border: 1px solid #1e293b; border-radius: 7px; display: inline-block; }
.trust-bar { background: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 20px 0; }
.trust-row { display: flex; gap: 40px; flex-wrap: wrap; align-items: center; }
.trust-item { font-size: .875rem; font-weight: 600; color: #475569; }
.sec { padding: 80px 0; border-top: 1px solid #e2e8f0; }
.sec-badge { display: inline-block; background: #eff6ff; color: #2563eb; font-size: .75rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; margin-bottom: 14px; }
.sec h2 { font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight: 700; color: #0f172a; margin-bottom: 14px; }
.sec-lead { font-size: 1rem; color: #64748b; max-width: 520px; line-height: 1.75; margin-bottom: 48px; }
.grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
.card { padding: 28px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; }
.card-icon { width: 36px; height: 3px; background: #2563eb; margin-bottom: 20px; }
.card-title { font-size: .9375rem; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
.card-body { font-size: .875rem; color: #64748b; line-height: 1.7; }
.testi { background: #f8fafc; padding: 28px; border-radius: 8px; }
.testi-quote { font-size: .9375rem; color: #334155; line-height: 1.75; margin-bottom: 20px; }
.testi-name { font-size: .8125rem; font-weight: 600; color: #0f172a; }
.cta-band { background: #0f172a; padding: 80px 0; }
.cta-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 32px; }
.cta-text h2 { font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 800; color: #fff; margin-bottom: 10px; }
.cta-text p { font-size: 1rem; color: #94a3b8; }
.btn-blue-lg { background: #2563eb; color: #fff; padding: 15px 36px; border-radius: 7px; font-weight: 700; font-size: 1rem; display: inline-block; white-space: nowrap; }
footer { padding: 32px 0; border-top: 1px solid #e2e8f0; }
.foot { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: .8125rem; color: #94a3b8; }
</style>
</head>
<body>
<nav><div class="c"><div class="nav-row">
  <div class="logo">{{KEYWORD}}</div>
  <div class="nav-links">
    <a href="#services" class="nav-link">Services</a>
    <a href="#about" class="nav-link">About</a>
    <a href="#contact" class="nav-btn">Contact us</a>
  </div>
</div></div></nav>

<section class="hero"><div class="c">
  <div class="hero-badge">{{SERVICE}} &mdash; {{LOCATION}}</div>
  <h1>{{HERO_HEADLINE}}</h1>
  <p>{{HERO_SUBHEADLINE}}</p>
  <div class="btn-row">
    <a href="#contact" class="btn-blue">Schedule a consultation</a>
    <a href="#services" class="btn-ghost">Our services</a>
  </div>
</div></section>

<div class="trust-bar"><div class="c"><div class="trust-row">
  <span class="trust-item">{{TRUST_1}}</span>
  <span class="trust-item">{{TRUST_2}}</span>
  <span class="trust-item">{{TRUST_3}}</span>
  <span class="trust-item">{{TRUST_4}}</span>
</div></div></div>

<section class="sec" id="services"><div class="c">
  <div class="sec-badge">Services</div>
  <h2>{{SERVICES_HEADLINE}}</h2>
  <p class="sec-lead">{{SERVICES_INTRO}}</p>
  <div class="grid3">
    <div class="card"><div class="card-icon"></div><div class="card-title">{{FEATURE_1_TITLE}}</div><div class="card-body">{{FEATURE_1_TEXT}}</div></div>
    <div class="card"><div class="card-icon"></div><div class="card-title">{{FEATURE_2_TITLE}}</div><div class="card-body">{{FEATURE_2_TEXT}}</div></div>
    <div class="card"><div class="card-icon"></div><div class="card-title">{{FEATURE_3_TITLE}}</div><div class="card-body">{{FEATURE_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="about"><div class="c">
  <div class="sec-badge">About</div>
  <h2>{{WHY_HEADLINE}}</h2>
  <p class="sec-lead">{{WHY_INTRO}}</p>
  <div class="grid3">
    <div class="card"><div class="card-icon"></div><div class="card-title">{{WHY_1_TITLE}}</div><div class="card-body">{{WHY_1_TEXT}}</div></div>
    <div class="card"><div class="card-icon"></div><div class="card-title">{{WHY_2_TITLE}}</div><div class="card-body">{{WHY_2_TEXT}}</div></div>
    <div class="card"><div class="card-icon"></div><div class="card-title">{{WHY_3_TITLE}}</div><div class="card-body">{{WHY_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="reviews"><div class="c">
  <div class="sec-badge">Testimonials</div>
  <h2>Trusted in {{LOCATION}}</h2>
  <p class="sec-lead">Hear from clients who rely on our {{SERVICE}} services.</p>
  <div class="grid2">
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_1_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_1_NAME}}</div></div>
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_2_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_2_NAME}}</div></div>
  </div>
</div></section>

<section class="cta-band" id="contact"><div class="c">
  <div class="cta-inner">
    <div class="cta-text">
      <h2>{{CTA_HEADLINE}}</h2>
      <p>{{CTA_SUBTEXT}}</p>
    </div>
    <a href="tel:+1-555-000-0000" class="btn-blue-lg">Call now</a>
  </div>
</div></section>

<footer><div class="c"><div class="foot">
  <span>{{KEYWORD}} &mdash; {{LOCATION}}</span>
  <span>&copy; 2024 {{KEYWORD}}. All rights reserved.</span>
</div></div></footer>
</body></html>`
  },

  {
    id: 'starter-5',
    name: 'Editorial',
    category: 'General',
    structure: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{KEYWORD}} | {{LOCATION}}</title>
<meta name="description" content="{{META_DESCRIPTION}}">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', system-ui, sans-serif; background: #fff; color: #111; -webkit-font-smoothing: antialiased; line-height: 1.6; }
a { text-decoration: none; color: inherit; }
.c { max-width: 1080px; margin: 0 auto; padding: 0 28px; }
h1, h2 { font-family: 'Playfair Display', Georgia, serif; }
nav { padding: 20px 0; }
.nav-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #111; padding-bottom: 20px; }
.logo { font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 900; }
.nav-right { display: flex; gap: 24px; align-items: center; }
.nav-link { font-size: .875rem; font-weight: 500; color: #666; }
.nav-btn { background: #111; color: #fff; padding: 9px 20px; font-size: .875rem; font-weight: 600; }
.hero { padding: 72px 0 64px; border-bottom: 1px solid #e5e7eb; }
.hero-kicker { font-size: .8125rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: #dc2626; margin-bottom: 20px; }
.hero h1 { font-size: clamp(3rem, 7vw, 5.5rem); font-weight: 900; line-height: 1.0; color: #111; margin-bottom: 24px; max-width: 900px; }
.hero-deck { font-size: 1.125rem; color: #4b5563; max-width: 600px; line-height: 1.75; margin-bottom: 40px; border-left: 3px solid #dc2626; padding-left: 20px; }
.btn-row { display: flex; gap: 12px; flex-wrap: wrap; }
.btn-dark { background: #111; color: #fff; padding: 13px 28px; font-weight: 600; font-size: .9375rem; display: inline-block; }
.btn-outline { border: 2px solid #111; color: #111; padding: 11px 26px; font-weight: 600; font-size: .9375rem; display: inline-block; }
.sec { padding: 72px 0; border-bottom: 1px solid #e5e7eb; }
.sec-kicker { font-size: .75rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #dc2626; margin-bottom: 14px; }
.sec h2 { font-size: clamp(1.875rem, 4vw, 3rem); font-weight: 800; color: #111; margin-bottom: 16px; }
.sec-lead { font-size: 1rem; color: #6b7280; max-width: 540px; line-height: 1.8; margin-bottom: 48px; }
.article-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0; border: 1px solid #e5e7eb; }
.article-card { padding: 32px; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
.article-card:last-child { border-right: none; }
.article-num { font-size: .75rem; font-weight: 700; color: #dc2626; margin-bottom: 12px; letter-spacing: .06em; }
.article-title { font-family: 'Playfair Display', serif; font-size: 1.125rem; font-weight: 700; color: #111; margin-bottom: 10px; }
.article-body { font-size: .875rem; color: #6b7280; line-height: 1.7; }
.pull-quote { border-left: 4px solid #111; padding: 24px 32px; margin: 48px 0 0; }
.pull-quote blockquote { font-family: 'Playfair Display', serif; font-size: clamp(1.25rem, 3vw, 1.75rem); font-weight: 700; color: #111; line-height: 1.4; margin-bottom: 12px; }
.pull-quote cite { font-size: .875rem; color: #6b7280; font-style: normal; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
@media (max-width: 640px) { .two-col { grid-template-columns: 1fr; } .article-card { border-right: none; } }
.testi { margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid #e5e7eb; }
.testi:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.testi-quote { font-family: 'Playfair Display', serif; font-size: 1.0625rem; font-style: italic; color: #374151; line-height: 1.7; margin-bottom: 12px; }
.testi-name { font-size: .8125rem; font-weight: 600; color: #6b7280; }
.cta-band { background: #111; padding: 80px 0; }
.cta-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 32px; }
.cta-band h2 { font-size: clamp(2rem, 4vw, 3rem); font-weight: 900; color: #fff; }
.cta-band p { font-size: 1rem; color: #9ca3af; margin-top: 8px; }
.btn-red { background: #dc2626; color: #fff; padding: 14px 32px; font-weight: 700; font-size: .9375rem; display: inline-block; white-space: nowrap; }
footer { padding: 32px 0; border-top: 2px solid #111; }
.foot { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: .8125rem; color: #9ca3af; }
</style>
</head>
<body>
<nav><div class="c"><div class="nav-row">
  <div class="logo">{{KEYWORD}}</div>
  <div class="nav-right">
    <a href="#services" class="nav-link">Services</a>
    <a href="#contact" class="nav-btn">Get started</a>
  </div>
</div></div></nav>

<section class="hero"><div class="c">
  <div class="hero-kicker">{{SERVICE}} &mdash; {{LOCATION}}</div>
  <h1>{{HERO_HEADLINE}}</h1>
  <div class="hero-deck">{{HERO_SUBHEADLINE}}</div>
  <div class="btn-row">
    <a href="#contact" class="btn-dark">Get a free quote</a>
    <a href="#services" class="btn-outline">View services</a>
  </div>
</div></section>

<section class="sec" id="services"><div class="c">
  <div class="sec-kicker">What we offer</div>
  <h2>{{SERVICES_HEADLINE}}</h2>
  <p class="sec-lead">{{SERVICES_INTRO}}</p>
  <div class="article-grid">
    <div class="article-card"><div class="article-num">01</div><div class="article-title">{{FEATURE_1_TITLE}}</div><div class="article-body">{{FEATURE_1_TEXT}}</div></div>
    <div class="article-card"><div class="article-num">02</div><div class="article-title">{{FEATURE_2_TITLE}}</div><div class="article-body">{{FEATURE_2_TEXT}}</div></div>
    <div class="article-card"><div class="article-num">03</div><div class="article-title">{{FEATURE_3_TITLE}}</div><div class="article-body">{{FEATURE_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="about"><div class="c">
  <div class="two-col">
    <div>
      <div class="sec-kicker">Our approach</div>
      <h2>{{WHY_HEADLINE}}</h2>
      <p style="color:#6b7280;line-height:1.8;margin-top:16px;">{{WHY_INTRO}}</p>
      <div class="pull-quote">
        <blockquote>{{WHY_1_TITLE}}</blockquote>
        <cite>{{WHY_1_TEXT}}</cite>
      </div>
    </div>
    <div style="padding-top:60px;">
      <div class="testi"><div class="testi-quote">{{TESTIMONIAL_1_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_1_NAME}}, {{LOCATION}}</div></div>
      <div class="testi"><div class="testi-quote">{{TESTIMONIAL_2_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_2_NAME}}, {{LOCATION}}</div></div>
    </div>
  </div>
</div></section>

<section class="cta-band" id="contact"><div class="c">
  <div class="cta-inner">
    <div>
      <h2>{{CTA_HEADLINE}}</h2>
      <p>{{CTA_SUBTEXT}}</p>
    </div>
    <a href="tel:+1-555-000-0000" class="btn-red">Call us now</a>
  </div>
</div></section>

<footer><div class="c"><div class="foot">
  <span>{{KEYWORD}} &mdash; {{LOCATION}}</span>
  <span>&copy; 2024 {{KEYWORD}}. All rights reserved.</span>
</div></div></footer>
</body></html>`
  },

  {
    id: 'starter-6',
    name: 'Soft Card Grid',
    category: 'General',
    structure: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{KEYWORD}} | {{LOCATION}}</title>
<meta name="description" content="{{META_DESCRIPTION}}">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', system-ui, sans-serif; background: #f4f4f5; color: #18181b; -webkit-font-smoothing: antialiased; line-height: 1.6; }
a { text-decoration: none; color: inherit; }
.c { max-width: 1080px; margin: 0 auto; padding: 0 28px; }
nav { background: #fff; padding: 18px 0; border-bottom: 1px solid #e4e4e7; }
.nav-row { display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: 1rem; font-weight: 700; color: #18181b; }
.nav-btn { background: #5b4cdb; color: #fff; padding: 9px 18px; border-radius: 8px; font-size: .8125rem; font-weight: 600; }
.hero { background: #fff; padding: 80px 0; border-bottom: 1px solid #e4e4e7; }
.hero-chip { display: inline-block; background: #ede9fe; color: #5b4cdb; font-size: .75rem; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-bottom: 20px; }
.hero h1 { font-size: clamp(2.25rem, 5vw, 3.5rem); font-weight: 800; line-height: 1.1; color: #18181b; margin-bottom: 20px; max-width: 720px; }
.hero p { font-size: 1.0625rem; color: #71717a; max-width: 520px; line-height: 1.75; margin-bottom: 36px; }
.btn-row { display: flex; gap: 10px; flex-wrap: wrap; }
.btn-main { background: #5b4cdb; color: #fff; padding: 13px 26px; border-radius: 8px; font-weight: 600; font-size: .9375rem; display: inline-block; }
.btn-soft { background: #f4f4f5; color: #18181b; padding: 13px 26px; border-radius: 8px; font-weight: 600; font-size: .9375rem; display: inline-block; }
.sec { padding: 72px 0; }
.sec-header { display: flex; flex-direction: column; margin-bottom: 40px; }
.sec-chip { display: inline-block; background: #ede9fe; color: #5b4cdb; font-size: .75rem; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-bottom: 14px; align-self: flex-start; }
.sec h2 { font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight: 700; color: #18181b; margin-bottom: 10px; }
.sec-lead { font-size: 1rem; color: #71717a; max-width: 520px; line-height: 1.75; }
.grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 40px; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 40px; }
.card { background: #fff; padding: 28px; border-radius: 12px; border: 1px solid #e4e4e7; }
.card-dot { width: 8px; height: 8px; border-radius: 50%; background: #5b4cdb; margin-bottom: 20px; }
.card-title { font-size: .9375rem; font-weight: 700; color: #18181b; margin-bottom: 8px; }
.card-body { font-size: .875rem; color: #71717a; line-height: 1.7; }
.testi { background: #fff; padding: 28px; border-radius: 12px; border: 1px solid #e4e4e7; }
.testi-stars { color: #5b4cdb; font-size: .875rem; margin-bottom: 14px; letter-spacing: .05em; }
.testi-quote { font-size: .9375rem; color: #3f3f46; line-height: 1.75; margin-bottom: 18px; }
.testi-name { font-size: .8125rem; font-weight: 600; color: #18181b; }
.cta-band { background: #5b4cdb; padding: 80px 0; margin-top: 8px; border-radius: 16px; text-align: center; }
.cta-band h2 { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 800; color: #fff; margin-bottom: 12px; }
.cta-band p { font-size: 1rem; color: rgba(255,255,255,.8); margin-bottom: 32px; }
.btn-white { background: #fff; color: #5b4cdb; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: .9375rem; display: inline-block; }
.cta-wrap { padding: 40px 0 72px; }
footer { background: #fff; padding: 32px 0; border-top: 1px solid #e4e4e7; }
.foot { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: .8125rem; color: #a1a1aa; }
</style>
</head>
<body>
<nav><div class="c"><div class="nav-row">
  <div class="logo">{{KEYWORD}}</div>
  <a href="#contact" class="nav-btn">Contact us</a>
</div></div></nav>

<section class="hero"><div class="c">
  <div class="hero-chip">{{SERVICE}} in {{LOCATION}}</div>
  <h1>{{HERO_HEADLINE}}</h1>
  <p>{{HERO_SUBHEADLINE}}</p>
  <div class="btn-row">
    <a href="#contact" class="btn-main">Get started</a>
    <a href="#services" class="btn-soft">Learn more</a>
  </div>
</div></section>

<section class="sec" id="services"><div class="c">
  <div class="sec-header">
    <div class="sec-chip">Services</div>
    <h2>{{SERVICES_HEADLINE}}</h2>
    <p class="sec-lead">{{SERVICES_INTRO}}</p>
  </div>
  <div class="grid3">
    <div class="card"><div class="card-dot"></div><div class="card-title">{{FEATURE_1_TITLE}}</div><div class="card-body">{{FEATURE_1_TEXT}}</div></div>
    <div class="card"><div class="card-dot"></div><div class="card-title">{{FEATURE_2_TITLE}}</div><div class="card-body">{{FEATURE_2_TEXT}}</div></div>
    <div class="card"><div class="card-dot"></div><div class="card-title">{{FEATURE_3_TITLE}}</div><div class="card-body">{{FEATURE_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="why"><div class="c">
  <div class="sec-header">
    <div class="sec-chip">Why us</div>
    <h2>{{WHY_HEADLINE}}</h2>
    <p class="sec-lead">{{WHY_INTRO}}</p>
  </div>
  <div class="grid3">
    <div class="card"><div class="card-dot"></div><div class="card-title">{{WHY_1_TITLE}}</div><div class="card-body">{{WHY_1_TEXT}}</div></div>
    <div class="card"><div class="card-dot"></div><div class="card-title">{{WHY_2_TITLE}}</div><div class="card-body">{{WHY_2_TEXT}}</div></div>
    <div class="card"><div class="card-dot"></div><div class="card-title">{{WHY_3_TITLE}}</div><div class="card-body">{{WHY_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="reviews"><div class="c">
  <div class="sec-header">
    <div class="sec-chip">Reviews</div>
    <h2>Customers love us in {{LOCATION}}</h2>
  </div>
  <div class="grid2">
    <div class="testi"><div class="testi-stars">* * * * *</div><div class="testi-quote">{{TESTIMONIAL_1_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_1_NAME}}</div></div>
    <div class="testi"><div class="testi-stars">* * * * *</div><div class="testi-quote">{{TESTIMONIAL_2_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_2_NAME}}</div></div>
  </div>
</div></section>

<div class="cta-wrap" id="contact"><div class="c">
  <div class="cta-band">
    <h2>{{CTA_HEADLINE}}</h2>
    <p>{{CTA_SUBTEXT}}</p>
    <a href="tel:+1-555-000-0000" class="btn-white">Call us today</a>
  </div>
</div></div>

<footer><div class="c"><div class="foot">
  <span>{{KEYWORD}} &mdash; {{LOCATION}}</span>
  <span>&copy; 2024 {{KEYWORD}}</span>
</div></div></footer>
</body></html>`
  },

  {
    id: 'starter-7',
    name: 'Split Hero',
    category: 'General',
    structure: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{KEYWORD}} | {{LOCATION}}</title>
<meta name="description" content="{{META_DESCRIPTION}}">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', system-ui, sans-serif; background: #fff; color: #111; -webkit-font-smoothing: antialiased; line-height: 1.6; }
a { text-decoration: none; color: inherit; }
.c { max-width: 1080px; margin: 0 auto; padding: 0 28px; }
nav { padding: 18px 28px; display: flex; justify-content: space-between; align-items: center; background: #4f46e5; }
.logo { font-size: 1rem; font-weight: 700; color: #fff; }
.nav-btn { background: #fff; color: #4f46e5; padding: 9px 18px; border-radius: 7px; font-size: .8125rem; font-weight: 700; }
.hero { display: grid; grid-template-columns: 1fr 1fr; min-height: 520px; }
.hero-left { background: #4f46e5; padding: 72px 56px; display: flex; flex-direction: column; justify-content: center; }
.hero-left-tag { font-size: .75rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #a5b4fc; margin-bottom: 20px; }
.hero-left h1 { font-size: clamp(2rem, 4vw, 3rem); font-weight: 900; line-height: 1.1; color: #fff; margin-bottom: 20px; }
.hero-left p { font-size: 1rem; color: #c7d2fe; line-height: 1.75; margin-bottom: 36px; }
.btn-white { background: #fff; color: #4f46e5; padding: 13px 26px; border-radius: 7px; font-weight: 700; font-size: .9375rem; display: inline-block; }
.hero-right { background: #eef2ff; padding: 56px; display: flex; flex-direction: column; justify-content: center; gap: 24px; }
.hero-stat { }
.hero-stat-num { font-size: 2.5rem; font-weight: 800; color: #4f46e5; line-height: 1; }
.hero-stat-lbl { font-size: .875rem; color: #6b7280; margin-top: 4px; }
.hero-stat-divider { border: none; border-top: 1px solid #c7d2fe; margin-top: 24px; }
@media (max-width: 700px) { .hero { grid-template-columns: 1fr; } .hero-right { display: none; } }
.sec { padding: 80px 0; border-top: 1px solid #e5e7eb; }
.sec-tag { font-size: .75rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #4f46e5; margin-bottom: 12px; }
.sec h2 { font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight: 700; color: #111; margin-bottom: 14px; }
.sec-lead { font-size: 1rem; color: #6b7280; max-width: 520px; line-height: 1.75; margin-bottom: 48px; }
.split-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
@media (max-width: 700px) { .split-grid { grid-template-columns: 1fr; } }
.split-content h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: 12px; }
.split-content p { font-size: .9375rem; color: #6b7280; line-height: 1.75; margin-bottom: 20px; }
.split-features { display: flex; flex-direction: column; gap: 16px; }
.split-feat { display: flex; gap: 16px; }
.split-feat-marker { width: 4px; background: #4f46e5; border-radius: 2px; flex-shrink: 0; }
.split-feat-title { font-size: .9375rem; font-weight: 600; color: #111; margin-bottom: 4px; }
.split-feat-body { font-size: .875rem; color: #6b7280; line-height: 1.65; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
.testi { background: #f9fafb; padding: 28px; border-radius: 10px; }
.testi-quote { font-size: .9375rem; color: #374151; line-height: 1.75; margin-bottom: 18px; }
.testi-name { font-size: .8125rem; font-weight: 600; color: #111; }
.cta-band { background: #4f46e5; padding: 80px 0; text-align: center; }
.cta-band h2 { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 800; color: #fff; margin-bottom: 12px; }
.cta-band p { font-size: 1rem; color: #c7d2fe; margin-bottom: 32px; }
.btn-white-lg { background: #fff; color: #4f46e5; padding: 14px 36px; border-radius: 8px; font-weight: 700; font-size: 1rem; display: inline-block; }
footer { padding: 32px 0; border-top: 1px solid #e5e7eb; }
.foot { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: .8125rem; color: #9ca3af; }
</style>
</head>
<body>
<nav>
  <div class="logo">{{KEYWORD}}</div>
  <a href="#contact" class="nav-btn">Free quote</a>
</nav>

<section class="hero">
  <div class="hero-left">
    <div class="hero-left-tag">{{SERVICE}} &mdash; {{LOCATION}}</div>
    <h1>{{HERO_HEADLINE}}</h1>
    <p>{{HERO_SUBHEADLINE}}</p>
    <a href="#contact" class="btn-white">Get started</a>
  </div>
  <div class="hero-right">
    <div class="hero-stat"><div class="hero-stat-num">{{STAT_1_NUMBER}}</div><div class="hero-stat-lbl">{{STAT_1_LABEL}}</div></div>
    <hr class="hero-stat-divider">
    <div class="hero-stat"><div class="hero-stat-num">{{STAT_2_NUMBER}}</div><div class="hero-stat-lbl">{{STAT_2_LABEL}}</div></div>
    <hr class="hero-stat-divider">
    <div class="hero-stat"><div class="hero-stat-num">{{STAT_3_NUMBER}}</div><div class="hero-stat-lbl">{{STAT_3_LABEL}}</div></div>
  </div>
</section>

<section class="sec" id="services"><div class="c">
  <div class="sec-tag">What we offer</div>
  <h2>{{SERVICES_HEADLINE}}</h2>
  <p class="sec-lead">{{SERVICES_INTRO}}</p>
  <div class="split-grid">
    <div>
      <div class="split-features">
        <div class="split-feat"><div class="split-feat-marker"></div><div><div class="split-feat-title">{{FEATURE_1_TITLE}}</div><div class="split-feat-body">{{FEATURE_1_TEXT}}</div></div></div>
        <div class="split-feat"><div class="split-feat-marker"></div><div><div class="split-feat-title">{{FEATURE_2_TITLE}}</div><div class="split-feat-body">{{FEATURE_2_TEXT}}</div></div></div>
        <div class="split-feat"><div class="split-feat-marker"></div><div><div class="split-feat-title">{{FEATURE_3_TITLE}}</div><div class="split-feat-body">{{FEATURE_3_TEXT}}</div></div></div>
      </div>
    </div>
    <div class="split-content">
      <h3>{{WHY_HEADLINE}}</h3>
      <p>{{WHY_INTRO}}</p>
      <p>{{WHY_1_TEXT}}</p>
    </div>
  </div>
</div></section>

<section class="sec" id="reviews"><div class="c">
  <div class="sec-tag">Testimonials</div>
  <h2>Serving {{LOCATION}} with pride</h2>
  <p class="sec-lead">Real words from real customers.</p>
  <div class="grid2">
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_1_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_1_NAME}}</div></div>
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_2_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_2_NAME}}</div></div>
  </div>
</div></section>

<section class="cta-band" id="contact"><div class="c">
  <h2>{{CTA_HEADLINE}}</h2>
  <p>{{CTA_SUBTEXT}}</p>
  <a href="tel:+1-555-000-0000" class="btn-white-lg">Call us now</a>
</div></section>

<footer><div class="c"><div class="foot">
  <span>{{KEYWORD}} &mdash; {{LOCATION}}</span>
  <span>&copy; 2024 {{KEYWORD}}</span>
</div></div></footer>
</body></html>`
  },

  {
    id: 'starter-8',
    name: 'Centered Focus',
    category: 'General',
    structure: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{KEYWORD}} | {{LOCATION}}</title>
<meta name="description" content="{{META_DESCRIPTION}}">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', system-ui, sans-serif; background: #fff; color: #111; -webkit-font-smoothing: antialiased; line-height: 1.6; }
a { text-decoration: none; color: inherit; }
.c { max-width: 860px; margin: 0 auto; padding: 0 28px; }
.c-wide { max-width: 1080px; margin: 0 auto; padding: 0 28px; }
nav { padding: 20px 0; border-bottom: 1px solid #f3f4f6; }
.nav-row { display: flex; justify-content: space-between; align-items: center; max-width: 1080px; margin: 0 auto; padding: 0 28px; }
.logo { font-size: 1rem; font-weight: 700; }
.nav-btn { background: #111; color: #fff; padding: 9px 18px; border-radius: 7px; font-size: .8125rem; font-weight: 600; }
.hero { padding: 100px 0 80px; text-align: center; }
.hero-pre { display: inline-flex; align-items: center; gap: 8px; background: #f3f4f6; padding: 5px 14px; border-radius: 20px; font-size: .8125rem; font-weight: 600; color: #6b7280; margin-bottom: 28px; }
.hero h1 { font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 900; line-height: 1.05; color: #111; margin-bottom: 24px; }
.hero p { font-size: 1.125rem; color: #6b7280; max-width: 560px; margin: 0 auto 40px; line-height: 1.75; }
.btn-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.btn-dark { background: #111; color: #fff; padding: 13px 28px; border-radius: 8px; font-weight: 600; font-size: .9375rem; display: inline-block; }
.btn-light { background: #f3f4f6; color: #111; padding: 13px 28px; border-radius: 8px; font-weight: 600; font-size: .9375rem; display: inline-block; }
.divider { border: none; border-top: 1px solid #f3f4f6; }
.sec { padding: 80px 0; text-align: center; }
.sec-tag { font-size: .75rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #9ca3af; margin-bottom: 14px; }
.sec h2 { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 800; color: #111; margin-bottom: 14px; }
.sec-lead { font-size: 1rem; color: #6b7280; max-width: 520px; margin: 0 auto 56px; line-height: 1.75; }
.grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; text-align: left; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; text-align: left; }
.card { padding: 28px; border: 1px solid #f3f4f6; border-radius: 10px; background: #fafafa; }
.card-title { font-size: .9375rem; font-weight: 700; color: #111; margin-bottom: 8px; }
.card-body { font-size: .875rem; color: #6b7280; line-height: 1.7; }
.testi { padding: 24px; border: 1px solid #f3f4f6; border-radius: 10px; background: #fafafa; text-align: left; }
.testi-quote { font-size: .9375rem; color: #374151; line-height: 1.75; margin-bottom: 14px; }
.testi-name { font-size: .8125rem; font-weight: 600; color: #111; }
.cta-band { background: #111; padding: 88px 0; text-align: center; }
.cta-band h2 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 900; color: #fff; margin-bottom: 16px; max-width: 700px; margin-left: auto; margin-right: auto; }
.cta-band p { font-size: 1rem; color: #9ca3af; margin-bottom: 36px; }
.btn-white { background: #fff; color: #111; padding: 15px 36px; border-radius: 8px; font-weight: 700; font-size: 1rem; display: inline-block; }
footer { padding: 32px 0; border-top: 1px solid #f3f4f6; text-align: center; }
.foot-text { font-size: .8125rem; color: #9ca3af; }
</style>
</head>
<body>
<nav><div class="nav-row">
  <div class="logo">{{KEYWORD}}</div>
  <a href="#contact" class="nav-btn">Get in touch</a>
</div></nav>

<section class="hero"><div class="c">
  <div class="hero-pre">{{SERVICE}} in {{LOCATION}}</div>
  <h1>{{HERO_HEADLINE}}</h1>
  <p>{{HERO_SUBHEADLINE}}</p>
  <div class="btn-row">
    <a href="#contact" class="btn-dark">Get a free quote</a>
    <a href="#services" class="btn-light">See services</a>
  </div>
</div></section>

<hr class="divider">

<section class="sec" id="services"><div class="c-wide">
  <div class="sec-tag">What we offer</div>
  <h2>{{SERVICES_HEADLINE}}</h2>
  <p class="sec-lead">{{SERVICES_INTRO}}</p>
  <div class="grid3">
    <div class="card"><div class="card-title">{{FEATURE_1_TITLE}}</div><div class="card-body">{{FEATURE_1_TEXT}}</div></div>
    <div class="card"><div class="card-title">{{FEATURE_2_TITLE}}</div><div class="card-body">{{FEATURE_2_TEXT}}</div></div>
    <div class="card"><div class="card-title">{{FEATURE_3_TITLE}}</div><div class="card-body">{{FEATURE_3_TEXT}}</div></div>
  </div>
</div></section>

<hr class="divider">

<section class="sec" id="why"><div class="c-wide">
  <div class="sec-tag">Our promise</div>
  <h2>{{WHY_HEADLINE}}</h2>
  <p class="sec-lead">{{WHY_INTRO}}</p>
  <div class="grid3">
    <div class="card"><div class="card-title">{{WHY_1_TITLE}}</div><div class="card-body">{{WHY_1_TEXT}}</div></div>
    <div class="card"><div class="card-title">{{WHY_2_TITLE}}</div><div class="card-body">{{WHY_2_TEXT}}</div></div>
    <div class="card"><div class="card-title">{{WHY_3_TITLE}}</div><div class="card-body">{{WHY_3_TEXT}}</div></div>
  </div>
</div></section>

<hr class="divider">

<section class="sec" id="reviews"><div class="c-wide">
  <div class="sec-tag">Reviews</div>
  <h2>Loved in {{LOCATION}}</h2>
  <p class="sec-lead">Hear from people who chose {{KEYWORD}}.</p>
  <div class="grid2">
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_1_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_1_NAME}}, {{LOCATION}}</div></div>
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_2_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_2_NAME}}, {{LOCATION}}</div></div>
  </div>
</div></section>

<section class="cta-band" id="contact"><div class="c">
  <h2>{{CTA_HEADLINE}}</h2>
  <p>{{CTA_SUBTEXT}}</p>
  <a href="tel:+1-555-000-0000" class="btn-white">Call us now</a>
</div></section>

<footer><div class="c">
  <p class="foot-text">{{KEYWORD}} &mdash; {{LOCATION}} &nbsp;&bull;&nbsp; &copy; 2024 {{KEYWORD}}. All rights reserved.</p>
</div></footer>
</body></html>`
  },

  {
    id: 'starter-9',
    name: 'Conversion',
    category: 'Local Business',
    structure: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{KEYWORD}} | {{LOCATION}}</title>
<meta name="description" content="{{META_DESCRIPTION}}">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', system-ui, sans-serif; background: #fff; color: #111; -webkit-font-smoothing: antialiased; line-height: 1.6; }
a { text-decoration: none; color: inherit; }
.c { max-width: 1080px; margin: 0 auto; padding: 0 28px; }
nav { background: #111; padding: 16px 0; }
.nav-row { display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: .9375rem; font-weight: 700; color: #fff; }
.nav-phone { color: #fff; font-weight: 700; font-size: 1rem; letter-spacing: -.01em; }
.nav-phone span { color: #16a34a; }
.hero { padding: 56px 0; background: #fff; }
.hero-layout { display: grid; grid-template-columns: 1fr 380px; gap: 48px; align-items: start; }
@media (max-width: 860px) { .hero-layout { grid-template-columns: 1fr; } }
.hero-tag { display: inline-block; background: #dcfce7; color: #15803d; font-size: .75rem; font-weight: 700; padding: 4px 12px; border-radius: 4px; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 16px; }
.hero h1 { font-size: clamp(2rem, 4.5vw, 3.25rem); font-weight: 900; line-height: 1.1; color: #111; margin-bottom: 18px; }
.hero-lead { font-size: 1.0625rem; color: #4b5563; line-height: 1.75; margin-bottom: 28px; }
.check-list { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 36px; }
.check-list li { display: flex; gap: 10px; align-items: flex-start; font-size: .9375rem; color: #374151; }
.check-list li::before { content: ''; width: 18px; height: 18px; background: #16a34a; border-radius: 50%; flex-shrink: 0; margin-top: 2px; }
.cta-box { background: #f0fdf4; border: 2px solid #16a34a; border-radius: 10px; padding: 28px; }
.cta-box-title { font-size: 1rem; font-weight: 800; color: #111; margin-bottom: 4px; }
.cta-box-sub { font-size: .875rem; color: #6b7280; margin-bottom: 20px; }
.cta-phone { display: block; background: #16a34a; color: #fff; padding: 16px; text-align: center; border-radius: 8px; font-weight: 800; font-size: 1.125rem; margin-bottom: 12px; }
.cta-phone span { display: block; font-size: .75rem; font-weight: 500; opacity: .85; }
.cta-divider { text-align: center; font-size: .8125rem; color: #9ca3af; margin: 12px 0; }
.cta-email { display: block; background: #fff; color: #111; border: 1px solid #d1d5db; padding: 13px; text-align: center; border-radius: 8px; font-weight: 600; font-size: .875rem; }
.cta-note { font-size: .75rem; color: #9ca3af; text-align: center; margin-top: 12px; }
.trust-row { display: flex; gap: 28px; flex-wrap: wrap; padding: 24px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; margin: 48px 0 0; }
.trust-item { font-size: .875rem; font-weight: 600; color: #374151; }
.sec { padding: 64px 0; border-top: 1px solid #e5e7eb; }
.sec-tag { font-size: .75rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #16a34a; margin-bottom: 10px; }
.sec h2 { font-size: clamp(1.5rem, 3vw, 2.25rem); font-weight: 800; color: #111; margin-bottom: 12px; }
.sec-lead { font-size: .9375rem; color: #6b7280; max-width: 520px; line-height: 1.75; margin-bottom: 40px; }
.grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.feat { padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; }
.feat-line { height: 3px; width: 32px; background: #16a34a; margin-bottom: 16px; }
.feat-title { font-size: .9375rem; font-weight: 700; color: #111; margin-bottom: 8px; }
.feat-body { font-size: .875rem; color: #6b7280; line-height: 1.7; }
.testi { background: #f9fafb; padding: 24px; border-radius: 8px; }
.testi-quote { font-size: .9375rem; color: #374151; line-height: 1.75; margin-bottom: 14px; }
.testi-name { font-size: .8125rem; font-weight: 600; color: #111; }
.final-cta { background: #111; padding: 64px 0; text-align: center; }
.final-cta h2 { font-size: clamp(1.5rem, 3.5vw, 2.5rem); font-weight: 800; color: #fff; margin-bottom: 10px; }
.final-cta p { font-size: .9375rem; color: #9ca3af; margin-bottom: 28px; }
.btn-green { background: #16a34a; color: #fff; padding: 15px 36px; border-radius: 8px; font-weight: 800; font-size: 1rem; display: inline-block; }
footer { padding: 24px 0; border-top: 1px solid #e5e7eb; }
.foot { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; font-size: .8125rem; color: #9ca3af; }
</style>
</head>
<body>
<nav><div class="c"><div class="nav-row">
  <div class="logo">{{KEYWORD}}</div>
  <div class="nav-phone">Call now: <span>+1 (555) 000-0000</span></div>
</div></div></nav>

<section class="hero"><div class="c">
  <div class="hero-layout">
    <div>
      <div class="hero-tag">Serving {{LOCATION}}</div>
      <h1>{{HERO_HEADLINE}}</h1>
      <p class="hero-lead">{{HERO_SUBHEADLINE}}</p>
      <ul class="check-list">
        <li>{{WHY_1_TITLE}}</li>
        <li>{{WHY_2_TITLE}}</li>
        <li>{{WHY_3_TITLE}}</li>
      </ul>
      <div class="trust-row">
        <span class="trust-item">{{TRUST_1}}</span>
        <span class="trust-item">{{TRUST_2}}</span>
        <span class="trust-item">{{TRUST_3}}</span>
      </div>
    </div>
    <div>
      <div class="cta-box">
        <div class="cta-box-title">Get a free quote today</div>
        <div class="cta-box-sub">No obligation. Response within 1 hour.</div>
        <a href="tel:+1-555-000-0000" class="cta-phone">Call +1 (555) 000-0000 <span>Available 7 days a week</span></a>
        <div class="cta-divider">or</div>
        <a href="mailto:hello@example.com" class="cta-email">Send us an email</a>
        <div class="cta-note">100% free, no strings attached</div>
      </div>
    </div>
  </div>
</div></section>

<section class="sec" id="services"><div class="c">
  <div class="sec-tag">Services</div>
  <h2>{{SERVICES_HEADLINE}}</h2>
  <p class="sec-lead">{{SERVICES_INTRO}}</p>
  <div class="grid3">
    <div class="feat"><div class="feat-line"></div><div class="feat-title">{{FEATURE_1_TITLE}}</div><div class="feat-body">{{FEATURE_1_TEXT}}</div></div>
    <div class="feat"><div class="feat-line"></div><div class="feat-title">{{FEATURE_2_TITLE}}</div><div class="feat-body">{{FEATURE_2_TEXT}}</div></div>
    <div class="feat"><div class="feat-line"></div><div class="feat-title">{{FEATURE_3_TITLE}}</div><div class="feat-body">{{FEATURE_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="reviews"><div class="c">
  <div class="sec-tag">Reviews</div>
  <h2>{{LOCATION}} customers trust us</h2>
  <p class="sec-lead">See what people are saying about our {{SERVICE}} services.</p>
  <div class="grid2">
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_1_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_1_NAME}}</div></div>
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_2_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_2_NAME}}</div></div>
  </div>
</div></section>

<section class="final-cta" id="contact"><div class="c">
  <h2>{{CTA_HEADLINE}}</h2>
  <p>{{CTA_SUBTEXT}}</p>
  <a href="tel:+1-555-000-0000" class="btn-green">Call for a free quote</a>
</div></section>

<footer><div class="c"><div class="foot">
  <span>{{KEYWORD}} &mdash; {{LOCATION}}</span>
  <span>&copy; 2024 {{KEYWORD}}. All rights reserved.</span>
</div></div></footer>
</body></html>`
  },

  {
    id: 'starter-10',
    name: 'Dark Luxury',
    category: 'Premium',
    structure: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{KEYWORD}} | {{LOCATION}}</title>
<meta name="description" content="{{META_DESCRIPTION}}">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', system-ui, sans-serif; background: #0c0a09; color: #e7e5e4; -webkit-font-smoothing: antialiased; line-height: 1.6; }
a { text-decoration: none; color: inherit; }
.c { max-width: 1080px; margin: 0 auto; padding: 0 36px; }
h1, h2, h3, .serif { font-family: 'Cormorant Garamond', Georgia, serif; }
nav { padding: 24px 0; border-bottom: 1px solid #1c1917; }
.nav-row { display: flex; justify-content: space-between; align-items: center; }
.logo { font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 600; letter-spacing: .04em; color: #fafaf9; }
.nav-btn { border: 1px solid #c9a84c; color: #c9a84c; padding: 9px 20px; font-size: .8125rem; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; }
.hero { padding: 100px 0 88px; border-bottom: 1px solid #1c1917; }
.hero-ornament { font-size: .75rem; letter-spacing: .2em; text-transform: uppercase; color: #c9a84c; margin-bottom: 24px; }
.hero h1 { font-size: clamp(3rem, 6vw, 5rem); font-weight: 600; line-height: 1.1; color: #fafaf9; margin-bottom: 24px; max-width: 800px; }
.hero p { font-size: 1.0625rem; color: #a8a29e; max-width: 520px; line-height: 1.8; margin-bottom: 44px; font-weight: 300; }
.btn-row { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; }
.btn-gold { background: #c9a84c; color: #0c0a09; padding: 13px 32px; font-size: .875rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; display: inline-block; }
.btn-ghost { border: 1px solid #44403c; color: #a8a29e; padding: 13px 32px; font-size: .875rem; font-weight: 400; letter-spacing: .06em; text-transform: uppercase; display: inline-block; }
.gold-rule { border: none; border-top: 1px solid #2c2926; }
.sec { padding: 80px 0; border-top: 1px solid #1c1917; }
.sec-ornament { font-size: .6875rem; letter-spacing: .2em; text-transform: uppercase; color: #c9a84c; margin-bottom: 16px; }
.sec h2 { font-size: clamp(2rem, 4vw, 3rem); font-weight: 600; color: #fafaf9; margin-bottom: 16px; }
.sec-lead { font-size: .9375rem; color: #a8a29e; max-width: 520px; line-height: 1.8; margin-bottom: 56px; font-weight: 300; }
.grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1px; background: #1c1917; }
.card { background: #0c0a09; padding: 36px 28px; }
.card-marker { width: 24px; height: 1px; background: #c9a84c; margin-bottom: 24px; }
.card-title { font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 600; color: #fafaf9; margin-bottom: 12px; }
.card-body { font-size: .875rem; color: #78716c; line-height: 1.75; font-weight: 300; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1px; background: #1c1917; }
.testi { background: #0c0a09; padding: 36px; }
.testi-mark { font-family: 'Cormorant Garamond', serif; font-size: 3rem; color: #c9a84c; line-height: 1; margin-bottom: 16px; }
.testi-quote { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 1.125rem; color: #d4cfc9; line-height: 1.7; margin-bottom: 20px; }
.testi-name { font-size: .8125rem; font-weight: 500; color: #78716c; letter-spacing: .06em; text-transform: uppercase; }
.cta-band { padding: 96px 0; border-top: 1px solid #1c1917; }
.cta-band h2 { font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 600; color: #fafaf9; margin-bottom: 16px; max-width: 700px; }
.cta-band p { font-size: 1rem; color: #78716c; margin-bottom: 40px; font-weight: 300; }
.btn-gold-lg { background: #c9a84c; color: #0c0a09; padding: 15px 40px; font-size: .875rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; display: inline-block; }
footer { padding: 36px 0; border-top: 1px solid #1c1917; }
.foot { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.foot-text { font-size: .8125rem; color: #44403c; letter-spacing: .04em; }
</style>
</head>
<body>
<nav><div class="c"><div class="nav-row">
  <div class="logo">{{KEYWORD}}</div>
  <a href="#contact" class="nav-btn">Inquire now</a>
</div></div></nav>

<section class="hero"><div class="c">
  <div class="hero-ornament">{{SERVICE}} &mdash; {{LOCATION}}</div>
  <h1>{{HERO_HEADLINE}}</h1>
  <p>{{HERO_SUBHEADLINE}}</p>
  <div class="btn-row">
    <a href="#contact" class="btn-gold">Schedule a consultation</a>
    <a href="#services" class="btn-ghost">Our services</a>
  </div>
</div></section>

<section class="sec" id="services"><div class="c">
  <div class="sec-ornament">What we offer</div>
  <h2>{{SERVICES_HEADLINE}}</h2>
  <p class="sec-lead">{{SERVICES_INTRO}}</p>
  <div class="grid3">
    <div class="card"><div class="card-marker"></div><div class="card-title">{{FEATURE_1_TITLE}}</div><div class="card-body">{{FEATURE_1_TEXT}}</div></div>
    <div class="card"><div class="card-marker"></div><div class="card-title">{{FEATURE_2_TITLE}}</div><div class="card-body">{{FEATURE_2_TEXT}}</div></div>
    <div class="card"><div class="card-marker"></div><div class="card-title">{{FEATURE_3_TITLE}}</div><div class="card-body">{{FEATURE_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="why"><div class="c">
  <div class="sec-ornament">Our distinction</div>
  <h2>{{WHY_HEADLINE}}</h2>
  <p class="sec-lead">{{WHY_INTRO}}</p>
  <div class="grid3">
    <div class="card"><div class="card-marker"></div><div class="card-title">{{WHY_1_TITLE}}</div><div class="card-body">{{WHY_1_TEXT}}</div></div>
    <div class="card"><div class="card-marker"></div><div class="card-title">{{WHY_2_TITLE}}</div><div class="card-body">{{WHY_2_TEXT}}</div></div>
    <div class="card"><div class="card-marker"></div><div class="card-title">{{WHY_3_TITLE}}</div><div class="card-body">{{WHY_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="reviews"><div class="c">
  <div class="sec-ornament">Client words</div>
  <h2>Trusted across {{LOCATION}}</h2>
  <p class="sec-lead">A selection of testimonials from those we have served.</p>
  <div class="grid2">
    <div class="testi"><div class="testi-mark">"</div><div class="testi-quote">{{TESTIMONIAL_1_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_1_NAME}}, {{LOCATION}}</div></div>
    <div class="testi"><div class="testi-mark">"</div><div class="testi-quote">{{TESTIMONIAL_2_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_2_NAME}}, {{LOCATION}}</div></div>
  </div>
</div></section>

<section class="cta-band" id="contact"><div class="c">
  <h2>{{CTA_HEADLINE}}</h2>
  <p>{{CTA_SUBTEXT}}</p>
  <a href="tel:+1-555-000-0000" class="btn-gold-lg">Call us today</a>
</div></section>

<footer><div class="c"><div class="foot">
  <span class="foot-text">{{KEYWORD}} &mdash; {{LOCATION}}</span>
  <span class="foot-text">&copy; 2024 {{KEYWORD}}. All rights reserved.</span>
</div></div></footer>
</body></html>`
  }
];

export default STARTER_TEMPLATES;
