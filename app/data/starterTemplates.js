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
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
.step-num { font-size: 2.5rem; font-weight: 800; color: #e5e7eb; line-height: 1; margin-bottom: 12px; }
.step-title { font-size: .9375rem; font-weight: 700; color: #111; margin-bottom: 8px; }
.step-body { font-size: .875rem; color: #6b7280; line-height: 1.7; }
.area-chips { display: flex; flex-wrap: wrap; gap: 10px; }
.area-chip { padding: 7px 16px; border: 1px solid #e5e7eb; border-radius: 20px; font-size: .8125rem; font-weight: 500; color: #374151; background: #f9fafb; }
.faq-list { display: flex; flex-direction: column; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
.faq-item { border-bottom: 1px solid #e5e7eb; }
.faq-item:last-child { border-bottom: none; }
.faq-item summary { padding: 18px 24px; font-size: .9375rem; font-weight: 600; color: #111; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-size: 1.25rem; color: #9ca3af; flex-shrink: 0; }
.faq-item[open] summary::after { content: '−'; }
.faq-answer { padding: 0 24px 18px; font-size: .875rem; color: #6b7280; line-height: 1.75; }
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

<section class="sec" id="how-it-works"><div class="c">
  <div class="sec-tag">How it works</div>
  <h2>{{PROCESS_HEADLINE}}</h2>
  <p class="sec-lead">{{PROCESS_INTRO}}</p>
  <div class="steps">
    <div><div class="step-num">01</div><div class="step-title">{{STEP_1_TITLE}}</div><div class="step-body">{{STEP_1_TEXT}}</div></div>
    <div><div class="step-num">02</div><div class="step-title">{{STEP_2_TITLE}}</div><div class="step-body">{{STEP_2_TEXT}}</div></div>
    <div><div class="step-num">03</div><div class="step-title">{{STEP_3_TITLE}}</div><div class="step-body">{{STEP_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="areas"><div class="c">
  <div class="sec-tag">Service areas</div>
  <h2>Serving {{LOCATION}} and nearby</h2>
  <p class="sec-lead">We provide {{SERVICE}} across {{LOCATION}} and the surrounding communities.</p>
  <div class="area-chips">
    <span class="area-chip">{{AREA_1}}</span><span class="area-chip">{{AREA_2}}</span><span class="area-chip">{{AREA_3}}</span>
    <span class="area-chip">{{AREA_4}}</span><span class="area-chip">{{AREA_5}}</span><span class="area-chip">{{AREA_6}}</span>
  </div>
</div></section>

<section class="sec" id="faq"><div class="c">
  <div class="sec-tag">FAQ</div>
  <h2>{{FAQ_HEADLINE}}</h2>
  <div class="faq-list">
    <details class="faq-item"><summary>{{FAQ_1_Q}}</summary><div class="faq-answer">{{FAQ_1_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_2_Q}}</summary><div class="faq-answer">{{FAQ_2_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_3_Q}}</summary><div class="faq-answer">{{FAQ_3_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_4_Q}}</summary><div class="faq-answer">{{FAQ_4_A}}</div></details>
  </div>
</div></section>

<section class="cta-band" id="contact"><div class="c">
  <h2>{{CTA_HEADLINE}}</h2>
  <p>{{CTA_SUBTEXT}}</p>
  <a href="tel:+1-555-000-0000" class="btn-white">Call us now</a>
</div></section>

<footer><div class="c"><div class="foot">
  <span>{{KEYWORD}} | {{LOCATION}}</span>
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
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2px; border: 1px solid #1f1f1f; border-radius: 12px; overflow: hidden; }
.step { background: #111; padding: 32px; }
.step-num { font-size: 2rem; font-weight: 800; color: #7c3aed; line-height: 1; margin-bottom: 14px; }
.step-title { font-size: .9375rem; font-weight: 700; color: #fff; margin-bottom: 8px; }
.step-body { font-size: .875rem; color: #6b7280; line-height: 1.7; }
.area-chips { display: flex; flex-wrap: wrap; gap: 10px; }
.area-chip { padding: 7px 16px; border: 1px solid #2a2a2a; border-radius: 20px; font-size: .8125rem; font-weight: 500; color: #a3a3a3; background: #111; }
.faq-list { display: flex; flex-direction: column; border: 1px solid #1f1f1f; border-radius: 10px; overflow: hidden; }
.faq-item { border-bottom: 1px solid #1f1f1f; }
.faq-item:last-child { border-bottom: none; }
.faq-item summary { padding: 18px 24px; font-size: .9375rem; font-weight: 600; color: #e5e5e5; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; background: #111; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-size: 1.25rem; color: #7c3aed; flex-shrink: 0; }
.faq-item[open] summary::after { content: '−'; }
.faq-answer { padding: 0 24px 18px; font-size: .875rem; color: #6b7280; line-height: 1.75; background: #111; }
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
  <div class="hero-eyebrow">{{SERVICE}} | {{LOCATION}}</div>
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

<section class="sec" id="how-it-works"><div class="c">
  <div class="sec-tag">How it works</div>
  <h2>{{PROCESS_HEADLINE}}</h2>
  <p class="sec-lead">{{PROCESS_INTRO}}</p>
  <div class="steps">
    <div class="step"><div class="step-num">01</div><div class="step-title">{{STEP_1_TITLE}}</div><div class="step-body">{{STEP_1_TEXT}}</div></div>
    <div class="step"><div class="step-num">02</div><div class="step-title">{{STEP_2_TITLE}}</div><div class="step-body">{{STEP_2_TEXT}}</div></div>
    <div class="step"><div class="step-num">03</div><div class="step-title">{{STEP_3_TITLE}}</div><div class="step-body">{{STEP_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="areas"><div class="c">
  <div class="sec-tag">Service areas</div>
  <h2>Serving {{LOCATION}} and beyond</h2>
  <p class="sec-lead">We cover {{LOCATION}} and every surrounding area. If you need {{SERVICE}}, we can get there.</p>
  <div class="area-chips">
    <span class="area-chip">{{AREA_1}}</span><span class="area-chip">{{AREA_2}}</span><span class="area-chip">{{AREA_3}}</span>
    <span class="area-chip">{{AREA_4}}</span><span class="area-chip">{{AREA_5}}</span><span class="area-chip">{{AREA_6}}</span>
  </div>
</div></section>

<section class="sec" id="faq"><div class="c">
  <div class="sec-tag">FAQ</div>
  <h2>{{FAQ_HEADLINE}}</h2>
  <div class="faq-list">
    <details class="faq-item"><summary>{{FAQ_1_Q}}</summary><div class="faq-answer">{{FAQ_1_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_2_Q}}</summary><div class="faq-answer">{{FAQ_2_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_3_Q}}</summary><div class="faq-answer">{{FAQ_3_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_4_Q}}</summary><div class="faq-answer">{{FAQ_4_A}}</div></details>
  </div>
</div></section>

<section class="cta-band" id="contact"><div class="c">
  <h2>{{CTA_HEADLINE}}</h2>
  <p>{{CTA_SUBTEXT}}</p>
  <a href="tel:+1-555-000-0000" class="btn-white">Call us today</a>
</div></section>

<footer><div class="c"><div class="foot">
  <span>{{KEYWORD}} | {{LOCATION}}</span>
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
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
.step-num { font-family: 'Lora', serif; font-size: 2rem; font-weight: 700; color: #e8ddd0; line-height: 1; margin-bottom: 12px; }
.step-title { font-family: 'Lora', serif; font-size: 1rem; font-weight: 600; color: #1c1008; margin-bottom: 8px; }
.step-body { font-size: .875rem; color: #78716c; line-height: 1.75; }
.area-chips { display: flex; flex-wrap: wrap; gap: 10px; }
.area-chip { padding: 7px 18px; border: 1px solid #e8ddd0; border-radius: 4px; font-size: .8125rem; font-weight: 500; color: #44403c; background: #fff; }
.faq-list { display: flex; flex-direction: column; gap: 0; }
.faq-item { border-bottom: 1px solid #e8ddd0; }
.faq-item:first-child { border-top: 1px solid #e8ddd0; }
.faq-item summary { padding: 18px 4px; font-family: 'Lora', serif; font-size: .9375rem; font-weight: 600; color: #1c1008; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-size: 1.25rem; color: #b45309; flex-shrink: 0; }
.faq-item[open] summary::after { content: '−'; }
.faq-answer { padding: 0 4px 18px; font-size: .875rem; color: #78716c; line-height: 1.8; }
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

<hr class="divider">

<section class="sec" id="how-it-works"><div class="c">
  <div class="sec-label">How it works</div>
  <h2>{{PROCESS_HEADLINE}}</h2>
  <p class="sec-lead">{{PROCESS_INTRO}}</p>
  <div class="steps">
    <div><div class="step-num">01</div><div class="step-title">{{STEP_1_TITLE}}</div><div class="step-body">{{STEP_1_TEXT}}</div></div>
    <div><div class="step-num">02</div><div class="step-title">{{STEP_2_TITLE}}</div><div class="step-body">{{STEP_2_TEXT}}</div></div>
    <div><div class="step-num">03</div><div class="step-title">{{STEP_3_TITLE}}</div><div class="step-body">{{STEP_3_TEXT}}</div></div>
  </div>
</div></section>

<hr class="divider">

<section class="sec" id="areas"><div class="c">
  <div class="sec-label">Where we serve</div>
  <h2>Proudly serving {{LOCATION}}</h2>
  <p class="sec-lead">Our {{SERVICE}} team covers {{LOCATION}} and the surrounding towns and neighborhoods.</p>
  <div class="area-chips">
    <span class="area-chip">{{AREA_1}}</span><span class="area-chip">{{AREA_2}}</span><span class="area-chip">{{AREA_3}}</span>
    <span class="area-chip">{{AREA_4}}</span><span class="area-chip">{{AREA_5}}</span><span class="area-chip">{{AREA_6}}</span>
  </div>
</div></section>

<hr class="divider">

<section class="sec" id="faq"><div class="c">
  <div class="sec-label">Questions</div>
  <h2>{{FAQ_HEADLINE}}</h2>
  <div class="faq-list">
    <details class="faq-item"><summary>{{FAQ_1_Q}}</summary><div class="faq-answer">{{FAQ_1_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_2_Q}}</summary><div class="faq-answer">{{FAQ_2_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_3_Q}}</summary><div class="faq-answer">{{FAQ_3_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_4_Q}}</summary><div class="faq-answer">{{FAQ_4_A}}</div></details>
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
  <span>{{KEYWORD}} | {{LOCATION}}</span>
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
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
.step-num { font-size: .75rem; font-weight: 700; color: #2563eb; letter-spacing: .06em; margin-bottom: 16px; }
.step-line { width: 36px; height: 3px; background: #2563eb; margin-bottom: 14px; }
.step-title { font-size: .9375rem; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
.step-body { font-size: .875rem; color: #64748b; line-height: 1.7; }
.area-chips { display: flex; flex-wrap: wrap; gap: 10px; }
.area-chip { padding: 7px 16px; border: 1px solid #e2e8f0; border-radius: 5px; font-size: .8125rem; font-weight: 600; color: #475569; background: #f8fafc; }
.faq-list { display: flex; flex-direction: column; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.faq-item { border-bottom: 1px solid #e2e8f0; }
.faq-item:last-child { border-bottom: none; }
.faq-item summary { padding: 18px 24px; font-size: .9375rem; font-weight: 600; color: #0f172a; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; background: #fff; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-size: 1.25rem; color: #2563eb; flex-shrink: 0; }
.faq-item[open] summary::after { content: '−'; }
.faq-answer { padding: 0 24px 18px; font-size: .875rem; color: #64748b; line-height: 1.75; background: #fff; }
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
  <div class="hero-badge">{{SERVICE}} | {{LOCATION}}</div>
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

<section class="sec" id="how-it-works"><div class="c">
  <div class="sec-badge">How it works</div>
  <h2>{{PROCESS_HEADLINE}}</h2>
  <p class="sec-lead">{{PROCESS_INTRO}}</p>
  <div class="steps">
    <div class="card"><div class="step-num">STEP 01</div><div class="step-line"></div><div class="step-title">{{STEP_1_TITLE}}</div><div class="step-body">{{STEP_1_TEXT}}</div></div>
    <div class="card"><div class="step-num">STEP 02</div><div class="step-line"></div><div class="step-title">{{STEP_2_TITLE}}</div><div class="step-body">{{STEP_2_TEXT}}</div></div>
    <div class="card"><div class="step-num">STEP 03</div><div class="step-line"></div><div class="step-title">{{STEP_3_TITLE}}</div><div class="step-body">{{STEP_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="areas"><div class="c">
  <div class="sec-badge">Service areas</div>
  <h2>Serving {{LOCATION}} and surrounding regions</h2>
  <p class="sec-lead">Our professional {{SERVICE}} team is available across {{LOCATION}} and the greater surrounding area.</p>
  <div class="area-chips">
    <span class="area-chip">{{AREA_1}}</span><span class="area-chip">{{AREA_2}}</span><span class="area-chip">{{AREA_3}}</span>
    <span class="area-chip">{{AREA_4}}</span><span class="area-chip">{{AREA_5}}</span><span class="area-chip">{{AREA_6}}</span>
  </div>
</div></section>

<section class="sec" id="faq"><div class="c">
  <div class="sec-badge">FAQ</div>
  <h2>{{FAQ_HEADLINE}}</h2>
  <div class="faq-list">
    <details class="faq-item"><summary>{{FAQ_1_Q}}</summary><div class="faq-answer">{{FAQ_1_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_2_Q}}</summary><div class="faq-answer">{{FAQ_2_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_3_Q}}</summary><div class="faq-answer">{{FAQ_3_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_4_Q}}</summary><div class="faq-answer">{{FAQ_4_A}}</div></details>
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
  <span>{{KEYWORD}} | {{LOCATION}}</span>
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
.steps-editorial { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0; border: 1px solid #e5e7eb; }
.step-ed { padding: 32px; border-right: 1px solid #e5e7eb; }
.step-ed:last-child { border-right: none; }
.step-num { font-size: .75rem; font-weight: 700; color: #dc2626; letter-spacing: .1em; margin-bottom: 16px; }
.step-title { font-family: 'Playfair Display', serif; font-size: 1.0625rem; font-weight: 700; color: #111; margin-bottom: 10px; }
.step-body { font-size: .875rem; color: #6b7280; line-height: 1.7; }
.area-chips { display: flex; flex-wrap: wrap; gap: 10px; }
.area-chip { padding: 7px 16px; border: 1px solid #e5e7eb; font-size: .8125rem; font-weight: 500; color: #374151; }
.faq-list { display: flex; flex-direction: column; }
.faq-item { border-bottom: 1px solid #e5e7eb; }
.faq-item:first-child { border-top: 2px solid #111; }
.faq-item summary { padding: 18px 0; font-family: 'Playfair Display', serif; font-size: .9375rem; font-weight: 700; color: #111; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-family: 'Inter', sans-serif; font-size: 1.25rem; color: #dc2626; flex-shrink: 0; }
.faq-item[open] summary::after { content: '−'; }
.faq-answer { padding: 0 0 18px; font-size: .875rem; color: #6b7280; line-height: 1.8; }
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
  <div class="hero-kicker">{{SERVICE}} | {{LOCATION}}</div>
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

<section class="sec" id="how-it-works"><div class="c">
  <div class="sec-kicker">How it works</div>
  <h2>{{PROCESS_HEADLINE}}</h2>
  <p class="sec-lead">{{PROCESS_INTRO}}</p>
  <div class="steps-editorial">
    <div class="step-ed"><div class="step-num">01</div><div class="step-title">{{STEP_1_TITLE}}</div><div class="step-body">{{STEP_1_TEXT}}</div></div>
    <div class="step-ed"><div class="step-num">02</div><div class="step-title">{{STEP_2_TITLE}}</div><div class="step-body">{{STEP_2_TEXT}}</div></div>
    <div class="step-ed"><div class="step-num">03</div><div class="step-title">{{STEP_3_TITLE}}</div><div class="step-body">{{STEP_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="areas"><div class="c">
  <div class="sec-kicker">Where we work</div>
  <h2>Covering {{LOCATION}} and surrounds</h2>
  <p class="sec-lead">Our team provides {{SERVICE}} throughout {{LOCATION}} and the wider region.</p>
  <div class="area-chips">
    <span class="area-chip">{{AREA_1}}</span><span class="area-chip">{{AREA_2}}</span><span class="area-chip">{{AREA_3}}</span>
    <span class="area-chip">{{AREA_4}}</span><span class="area-chip">{{AREA_5}}</span><span class="area-chip">{{AREA_6}}</span>
  </div>
</div></section>

<section class="sec" id="faq"><div class="c">
  <div class="sec-kicker">FAQ</div>
  <h2>{{FAQ_HEADLINE}}</h2>
  <div class="faq-list">
    <details class="faq-item"><summary>{{FAQ_1_Q}}</summary><div class="faq-answer">{{FAQ_1_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_2_Q}}</summary><div class="faq-answer">{{FAQ_2_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_3_Q}}</summary><div class="faq-answer">{{FAQ_3_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_4_Q}}</summary><div class="faq-answer">{{FAQ_4_A}}</div></details>
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
  <span>{{KEYWORD}} | {{LOCATION}}</span>
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
body { font-family: 'Inter', system-ui, sans-serif; background: #f4f4f5; color: #161616; -webkit-font-smoothing: antialiased; line-height: 1.6; }
a { text-decoration: none; color: inherit; }
.c { max-width: 1080px; margin: 0 auto; padding: 0 28px; }
nav { background: #fff; padding: 18px 0; border-bottom: 1px solid #e4e4e7; }
.nav-row { display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: 1rem; font-weight: 700; color: #161616; }
.nav-btn { background: #5b4cdb; color: #fff; padding: 9px 18px; border-radius: 8px; font-size: .8125rem; font-weight: 600; }
.hero { background: #fff; padding: 80px 0; border-bottom: 1px solid #e4e4e7; }
.hero-chip { display: inline-block; background: #ede9fe; color: #5b4cdb; font-size: .75rem; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-bottom: 20px; }
.hero h1 { font-size: clamp(2.25rem, 5vw, 3.5rem); font-weight: 800; line-height: 1.1; color: #161616; margin-bottom: 20px; max-width: 720px; }
.hero p { font-size: 1.0625rem; color: #71717a; max-width: 520px; line-height: 1.75; margin-bottom: 36px; }
.btn-row { display: flex; gap: 10px; flex-wrap: wrap; }
.btn-main { background: #5b4cdb; color: #fff; padding: 13px 26px; border-radius: 8px; font-weight: 600; font-size: .9375rem; display: inline-block; }
.btn-soft { background: #f4f4f5; color: #161616; padding: 13px 26px; border-radius: 8px; font-weight: 600; font-size: .9375rem; display: inline-block; }
.sec { padding: 72px 0; }
.sec-header { display: flex; flex-direction: column; margin-bottom: 40px; }
.sec-chip { display: inline-block; background: #ede9fe; color: #5b4cdb; font-size: .75rem; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-bottom: 14px; align-self: flex-start; }
.sec h2 { font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight: 700; color: #161616; margin-bottom: 10px; }
.sec-lead { font-size: 1rem; color: #71717a; max-width: 520px; line-height: 1.75; }
.grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 40px; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 40px; }
.card { background: #fff; padding: 28px; border-radius: 12px; border: 1px solid #e4e4e7; }
.card-dot { width: 8px; height: 8px; border-radius: 50%; background: #5b4cdb; margin-bottom: 20px; }
.card-title { font-size: .9375rem; font-weight: 700; color: #161616; margin-bottom: 8px; }
.card-body { font-size: .875rem; color: #71717a; line-height: 1.7; }
.testi { background: #fff; padding: 28px; border-radius: 12px; border: 1px solid #e4e4e7; }
.testi-stars { color: #5b4cdb; font-size: .875rem; margin-bottom: 14px; letter-spacing: .05em; }
.testi-quote { font-size: .9375rem; color: #3a3a3a; line-height: 1.75; margin-bottom: 18px; }
.testi-name { font-size: .8125rem; font-weight: 600; color: #161616; }
.cta-band { background: #5b4cdb; padding: 80px 0; margin-top: 8px; border-radius: 16px; text-align: center; }
.cta-band h2 { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 800; color: #fff; margin-bottom: 12px; }
.cta-band p { font-size: 1rem; color: rgba(255,255,255,.8); margin-bottom: 32px; }
.btn-white { background: #fff; color: #5b4cdb; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: .9375rem; display: inline-block; }
.cta-wrap { padding: 40px 0 72px; }
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
.step-num { font-size: 2rem; font-weight: 800; color: #e4e4e7; line-height: 1; margin-bottom: 14px; }
.step-title { font-size: .9375rem; font-weight: 700; color: #161616; margin-bottom: 8px; }
.step-body { font-size: .875rem; color: #71717a; line-height: 1.7; }
.area-chips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
.area-chip { padding: 7px 16px; background: #ede9fe; color: #5b4cdb; font-size: .8125rem; font-weight: 600; border-radius: 20px; }
.faq-list { display: flex; flex-direction: column; gap: 12px; margin-top: 32px; }
.faq-item { background: #fff; border-radius: 12px; border: 1px solid #e4e4e7; overflow: hidden; }
.faq-item summary { padding: 18px 20px; font-size: .9375rem; font-weight: 600; color: #161616; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-size: 1.25rem; color: #5b4cdb; flex-shrink: 0; }
.faq-item[open] summary::after { content: '−'; }
.faq-answer { padding: 0 20px 18px; font-size: .875rem; color: #71717a; line-height: 1.75; }
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

<section class="sec" id="how-it-works"><div class="c">
  <div class="sec-header">
    <div class="sec-chip">How it works</div>
    <h2>{{PROCESS_HEADLINE}}</h2>
    <p class="sec-lead">{{PROCESS_INTRO}}</p>
  </div>
  <div class="steps">
    <div class="card"><div class="step-num">01</div><div class="step-title">{{STEP_1_TITLE}}</div><div class="step-body">{{STEP_1_TEXT}}</div></div>
    <div class="card"><div class="step-num">02</div><div class="step-title">{{STEP_2_TITLE}}</div><div class="step-body">{{STEP_2_TEXT}}</div></div>
    <div class="card"><div class="step-num">03</div><div class="step-title">{{STEP_3_TITLE}}</div><div class="step-body">{{STEP_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="areas"><div class="c">
  <div class="sec-header">
    <div class="sec-chip">Where we serve</div>
    <h2>Serving {{LOCATION}} and nearby areas</h2>
    <p class="sec-lead">We bring our {{SERVICE}} services to every corner of {{LOCATION}} and the surrounding communities.</p>
  </div>
  <div class="area-chips">
    <span class="area-chip">{{AREA_1}}</span><span class="area-chip">{{AREA_2}}</span><span class="area-chip">{{AREA_3}}</span>
    <span class="area-chip">{{AREA_4}}</span><span class="area-chip">{{AREA_5}}</span><span class="area-chip">{{AREA_6}}</span>
  </div>
</div></section>

<section class="sec" id="faq"><div class="c">
  <div class="sec-header">
    <div class="sec-chip">FAQ</div>
    <h2>{{FAQ_HEADLINE}}</h2>
  </div>
  <div class="faq-list">
    <details class="faq-item"><summary>{{FAQ_1_Q}}</summary><div class="faq-answer">{{FAQ_1_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_2_Q}}</summary><div class="faq-answer">{{FAQ_2_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_3_Q}}</summary><div class="faq-answer">{{FAQ_3_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_4_Q}}</summary><div class="faq-answer">{{FAQ_4_A}}</div></details>
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
  <span>{{KEYWORD}} | {{LOCATION}}</span>
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
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
.step-num { font-size: 2rem; font-weight: 800; color: #e0e7ff; line-height: 1; margin-bottom: 14px; }
.step-title { font-size: .9375rem; font-weight: 700; color: #111; margin-bottom: 8px; }
.step-body { font-size: .875rem; color: #6b7280; line-height: 1.7; }
.area-chips { display: flex; flex-wrap: wrap; gap: 10px; }
.area-chip { padding: 7px 16px; background: #eef2ff; color: #4f46e5; font-size: .8125rem; font-weight: 600; border-radius: 7px; }
.faq-list { display: flex; flex-direction: column; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
.faq-item { border-bottom: 1px solid #e5e7eb; }
.faq-item:last-child { border-bottom: none; }
.faq-item summary { padding: 18px 24px; font-size: .9375rem; font-weight: 600; color: #111; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-size: 1.25rem; color: #4f46e5; flex-shrink: 0; }
.faq-item[open] summary::after { content: '−'; }
.faq-answer { padding: 0 24px 18px; font-size: .875rem; color: #6b7280; line-height: 1.75; }
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
    <div class="hero-left-tag">{{SERVICE}} | {{LOCATION}}</div>
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

<section class="sec" id="how-it-works"><div class="c">
  <div class="sec-tag">How it works</div>
  <h2>{{PROCESS_HEADLINE}}</h2>
  <p class="sec-lead">{{PROCESS_INTRO}}</p>
  <div class="steps">
    <div><div class="step-num">01</div><div class="step-title">{{STEP_1_TITLE}}</div><div class="step-body">{{STEP_1_TEXT}}</div></div>
    <div><div class="step-num">02</div><div class="step-title">{{STEP_2_TITLE}}</div><div class="step-body">{{STEP_2_TEXT}}</div></div>
    <div><div class="step-num">03</div><div class="step-title">{{STEP_3_TITLE}}</div><div class="step-body">{{STEP_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="areas"><div class="c">
  <div class="sec-tag">Service areas</div>
  <h2>Covering {{LOCATION}} and beyond</h2>
  <p class="sec-lead">We deliver expert {{SERVICE}} to {{LOCATION}} and surrounding communities.</p>
  <div class="area-chips">
    <span class="area-chip">{{AREA_1}}</span><span class="area-chip">{{AREA_2}}</span><span class="area-chip">{{AREA_3}}</span>
    <span class="area-chip">{{AREA_4}}</span><span class="area-chip">{{AREA_5}}</span><span class="area-chip">{{AREA_6}}</span>
  </div>
</div></section>

<section class="sec" id="faq"><div class="c">
  <div class="sec-tag">FAQ</div>
  <h2>{{FAQ_HEADLINE}}</h2>
  <div class="faq-list">
    <details class="faq-item"><summary>{{FAQ_1_Q}}</summary><div class="faq-answer">{{FAQ_1_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_2_Q}}</summary><div class="faq-answer">{{FAQ_2_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_3_Q}}</summary><div class="faq-answer">{{FAQ_3_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_4_Q}}</summary><div class="faq-answer">{{FAQ_4_A}}</div></details>
  </div>
</div></section>

<section class="cta-band" id="contact"><div class="c">
  <h2>{{CTA_HEADLINE}}</h2>
  <p>{{CTA_SUBTEXT}}</p>
  <a href="tel:+1-555-000-0000" class="btn-white-lg">Call us now</a>
</div></section>

<footer><div class="c"><div class="foot">
  <span>{{KEYWORD}} | {{LOCATION}}</span>
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
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; text-align: left; }
.step-pill { display: inline-block; background: #111; color: #fff; font-size: .6875rem; font-weight: 700; padding: 4px 10px; border-radius: 20px; letter-spacing: .06em; margin-bottom: 14px; }
.step-title { font-size: .9375rem; font-weight: 700; color: #111; margin-bottom: 8px; }
.step-body { font-size: .875rem; color: #6b7280; line-height: 1.7; }
.area-chips { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.area-chip { padding: 7px 18px; border: 1px solid #f3f4f6; border-radius: 20px; font-size: .8125rem; font-weight: 500; color: #374151; background: #fafafa; }
.faq-list { display: flex; flex-direction: column; border: 1px solid #f3f4f6; border-radius: 10px; overflow: hidden; max-width: 700px; margin: 0 auto; }
.faq-item { border-bottom: 1px solid #f3f4f6; }
.faq-item:last-child { border-bottom: none; }
.faq-item summary { padding: 18px 24px; font-size: .9375rem; font-weight: 600; color: #111; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; background: #fafafa; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-size: 1.25rem; color: #9ca3af; flex-shrink: 0; }
.faq-item[open] summary::after { content: '−'; }
.faq-answer { padding: 0 24px 18px; font-size: .875rem; color: #6b7280; line-height: 1.75; background: #fafafa; text-align: left; }
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

<hr class="divider">

<section class="sec" id="how-it-works"><div class="c-wide">
  <div class="sec-tag">How it works</div>
  <h2>{{PROCESS_HEADLINE}}</h2>
  <p class="sec-lead">{{PROCESS_INTRO}}</p>
  <div class="steps">
    <div><div class="step-pill">STEP 01</div><div class="step-title">{{STEP_1_TITLE}}</div><div class="step-body">{{STEP_1_TEXT}}</div></div>
    <div><div class="step-pill">STEP 02</div><div class="step-title">{{STEP_2_TITLE}}</div><div class="step-body">{{STEP_2_TEXT}}</div></div>
    <div><div class="step-pill">STEP 03</div><div class="step-title">{{STEP_3_TITLE}}</div><div class="step-body">{{STEP_3_TEXT}}</div></div>
  </div>
</div></section>

<hr class="divider">

<section class="sec" id="areas"><div class="c">
  <div class="sec-tag">Service areas</div>
  <h2>Serving {{LOCATION}} and surrounding areas</h2>
  <p class="sec-lead">We proudly bring our {{SERVICE}} to {{LOCATION}} and nearby communities.</p>
  <div class="area-chips">
    <span class="area-chip">{{AREA_1}}</span><span class="area-chip">{{AREA_2}}</span><span class="area-chip">{{AREA_3}}</span>
    <span class="area-chip">{{AREA_4}}</span><span class="area-chip">{{AREA_5}}</span><span class="area-chip">{{AREA_6}}</span>
  </div>
</div></section>

<hr class="divider">

<section class="sec" id="faq"><div class="c">
  <div class="sec-tag">FAQ</div>
  <h2>{{FAQ_HEADLINE}}</h2>
  <div class="faq-list">
    <details class="faq-item"><summary>{{FAQ_1_Q}}</summary><div class="faq-answer">{{FAQ_1_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_2_Q}}</summary><div class="faq-answer">{{FAQ_2_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_3_Q}}</summary><div class="faq-answer">{{FAQ_3_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_4_Q}}</summary><div class="faq-answer">{{FAQ_4_A}}</div></details>
  </div>
</div></section>

<section class="cta-band" id="contact"><div class="c">
  <h2>{{CTA_HEADLINE}}</h2>
  <p>{{CTA_SUBTEXT}}</p>
  <a href="tel:+1-555-000-0000" class="btn-white">Call us now</a>
</div></section>

<footer><div class="c">
  <p class="foot-text">{{KEYWORD}} | {{LOCATION}} &nbsp;&bull;&nbsp; &copy; 2024 {{KEYWORD}}. All rights reserved.</p>
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
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
.step-num { font-size: .75rem; font-weight: 700; color: #16a34a; letter-spacing: .1em; text-transform: uppercase; margin-bottom: 14px; }
.step-line { height: 3px; width: 32px; background: #16a34a; margin-bottom: 14px; }
.step-title { font-size: .9375rem; font-weight: 700; color: #111; margin-bottom: 8px; }
.step-body { font-size: .875rem; color: #6b7280; line-height: 1.7; }
.area-chips { display: flex; flex-wrap: wrap; gap: 10px; }
.area-chip { padding: 7px 16px; border: 1px solid #e5e7eb; border-radius: 5px; font-size: .8125rem; font-weight: 600; color: #374151; background: #f9fafb; }
.faq-list { display: flex; flex-direction: column; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
.faq-item { border-bottom: 1px solid #e5e7eb; }
.faq-item:last-child { border-bottom: none; }
.faq-item summary { padding: 18px 20px; font-size: .9375rem; font-weight: 600; color: #111; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-size: 1.25rem; color: #16a34a; flex-shrink: 0; }
.faq-item[open] summary::after { content: '−'; }
.faq-answer { padding: 0 20px 18px; font-size: .875rem; color: #6b7280; line-height: 1.75; }
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

<section class="sec" id="how-it-works"><div class="c">
  <div class="sec-tag">How it works</div>
  <h2>{{PROCESS_HEADLINE}}</h2>
  <p class="sec-lead">{{PROCESS_INTRO}}</p>
  <div class="steps">
    <div><div class="step-num">STEP 01</div><div class="step-line"></div><div class="step-title">{{STEP_1_TITLE}}</div><div class="step-body">{{STEP_1_TEXT}}</div></div>
    <div><div class="step-num">STEP 02</div><div class="step-line"></div><div class="step-title">{{STEP_2_TITLE}}</div><div class="step-body">{{STEP_2_TEXT}}</div></div>
    <div><div class="step-num">STEP 03</div><div class="step-line"></div><div class="step-title">{{STEP_3_TITLE}}</div><div class="step-body">{{STEP_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="areas"><div class="c">
  <div class="sec-tag">Areas we serve</div>
  <h2>{{LOCATION}} and surrounding areas</h2>
  <p class="sec-lead">We provide reliable {{SERVICE}} to homeowners and businesses across {{LOCATION}} and nearby.</p>
  <div class="area-chips">
    <span class="area-chip">{{AREA_1}}</span><span class="area-chip">{{AREA_2}}</span><span class="area-chip">{{AREA_3}}</span>
    <span class="area-chip">{{AREA_4}}</span><span class="area-chip">{{AREA_5}}</span><span class="area-chip">{{AREA_6}}</span>
  </div>
</div></section>

<section class="sec" id="faq"><div class="c">
  <div class="sec-tag">FAQ</div>
  <h2>{{FAQ_HEADLINE}}</h2>
  <div class="faq-list">
    <details class="faq-item"><summary>{{FAQ_1_Q}}</summary><div class="faq-answer">{{FAQ_1_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_2_Q}}</summary><div class="faq-answer">{{FAQ_2_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_3_Q}}</summary><div class="faq-answer">{{FAQ_3_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_4_Q}}</summary><div class="faq-answer">{{FAQ_4_A}}</div></details>
  </div>
</div></section>

<section class="final-cta" id="contact"><div class="c">
  <h2>{{CTA_HEADLINE}}</h2>
  <p>{{CTA_SUBTEXT}}</p>
  <a href="tel:+1-555-000-0000" class="btn-green">Call for a free quote</a>
</div></section>

<footer><div class="c"><div class="foot">
  <span>{{KEYWORD}} | {{LOCATION}}</span>
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
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1px; background: #1c1917; }
.step { background: #0c0a09; padding: 32px 28px; }
.step-num { font-family: 'Cormorant Garamond', serif; font-size: 1.75rem; font-weight: 600; color: #c9a84c; line-height: 1; margin-bottom: 16px; }
.step-title { font-family: 'Cormorant Garamond', serif; font-size: 1.125rem; font-weight: 600; color: #fafaf9; margin-bottom: 10px; }
.step-body { font-size: .875rem; color: #78716c; line-height: 1.75; font-weight: 300; }
.area-chips { display: flex; flex-wrap: wrap; gap: 10px; }
.area-chip { padding: 7px 18px; border: 1px solid #2c2926; color: #a8a29e; font-size: .8125rem; font-weight: 400; letter-spacing: .04em; }
.faq-list { display: flex; flex-direction: column; }
.faq-item { border-bottom: 1px solid #1c1917; }
.faq-item:first-child { border-top: 1px solid #1c1917; }
.faq-item summary { padding: 20px 0; font-family: 'Cormorant Garamond', serif; font-size: 1.0625rem; font-weight: 600; color: #fafaf9; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; letter-spacing: .02em; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-family: 'Inter', sans-serif; font-size: 1.25rem; color: #c9a84c; flex-shrink: 0; }
.faq-item[open] summary::after { content: '−'; }
.faq-answer { padding: 0 0 20px; font-size: .875rem; color: #78716c; line-height: 1.8; font-weight: 300; }
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
  <div class="hero-ornament">{{SERVICE}} | {{LOCATION}}</div>
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

<section class="sec" id="how-it-works"><div class="c">
  <div class="sec-ornament">How it works</div>
  <h2>{{PROCESS_HEADLINE}}</h2>
  <p class="sec-lead">{{PROCESS_INTRO}}</p>
  <div class="steps">
    <div class="step"><div class="step-num">I</div><div class="step-title">{{STEP_1_TITLE}}</div><div class="step-body">{{STEP_1_TEXT}}</div></div>
    <div class="step"><div class="step-num">II</div><div class="step-title">{{STEP_2_TITLE}}</div><div class="step-body">{{STEP_2_TEXT}}</div></div>
    <div class="step"><div class="step-num">III</div><div class="step-title">{{STEP_3_TITLE}}</div><div class="step-body">{{STEP_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="areas"><div class="c">
  <div class="sec-ornament">Where we serve</div>
  <h2>Available across {{LOCATION}}</h2>
  <p class="sec-lead">Our {{SERVICE}} services extend throughout {{LOCATION}} and the surrounding region.</p>
  <div class="area-chips">
    <span class="area-chip">{{AREA_1}}</span><span class="area-chip">{{AREA_2}}</span><span class="area-chip">{{AREA_3}}</span>
    <span class="area-chip">{{AREA_4}}</span><span class="area-chip">{{AREA_5}}</span><span class="area-chip">{{AREA_6}}</span>
  </div>
</div></section>

<section class="sec" id="faq"><div class="c">
  <div class="sec-ornament">Questions</div>
  <h2>{{FAQ_HEADLINE}}</h2>
  <div class="faq-list">
    <details class="faq-item"><summary>{{FAQ_1_Q}}</summary><div class="faq-answer">{{FAQ_1_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_2_Q}}</summary><div class="faq-answer">{{FAQ_2_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_3_Q}}</summary><div class="faq-answer">{{FAQ_3_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_4_Q}}</summary><div class="faq-answer">{{FAQ_4_A}}</div></details>
  </div>
</div></section>

<section class="cta-band" id="contact"><div class="c">
  <h2>{{CTA_HEADLINE}}</h2>
  <p>{{CTA_SUBTEXT}}</p>
  <a href="tel:+1-555-000-0000" class="btn-gold-lg">Call us today</a>
</div></section>

<footer><div class="c"><div class="foot">
  <span class="foot-text">{{KEYWORD}} | {{LOCATION}}</span>
  <span class="foot-text">&copy; 2024 {{KEYWORD}}. All rights reserved.</span>
</div></div></footer>
</body></html>`
  },

  // ── T11: Feature Split ── General ─────────────────────────────────────────
  {
    id: 'starter-11',
    name: 'Feature Split',
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
.c { max-width: 1100px; margin: 0 auto; padding: 0 28px; }
nav { padding: 18px 0; border-bottom: 1px solid #f0fdf4; background: #fff; }
.nav-row { display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: 1rem; font-weight: 800; color: #111; }
.nav-links { display: flex; gap: 28px; align-items: center; }
.nav-link { font-size: .875rem; font-weight: 500; color: #6b7280; }
.nav-btn { background: #0d9488; color: #fff; padding: 9px 20px; border-radius: 8px; font-size: .8125rem; font-weight: 700; }
.hero { padding: 80px 0 72px; }
.hero-split { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
@media (max-width: 720px) { .hero-split { grid-template-columns: 1fr; } .hero-visual { display: none; } }
.hero-tag { font-size: .75rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #0d9488; margin-bottom: 18px; }
.hero h1 { font-size: clamp(2.25rem, 4.5vw, 3.5rem); font-weight: 900; line-height: 1.08; color: #111; margin-bottom: 20px; }
.hero p { font-size: 1.0625rem; color: #6b7280; line-height: 1.8; margin-bottom: 36px; }
.btn-row { display: flex; gap: 12px; flex-wrap: wrap; }
.btn-teal { background: #0d9488; color: #fff; padding: 13px 28px; border-radius: 8px; font-weight: 700; font-size: .9375rem; display: inline-block; }
.btn-outline { border: 2px solid #e5e7eb; color: #111; padding: 11px 26px; border-radius: 8px; font-weight: 600; font-size: .9375rem; display: inline-block; }
.hero-visual { background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border-radius: 16px; aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; }
.visual-inner { text-align: center; }
.visual-num { font-size: 3.5rem; font-weight: 900; color: #0d9488; line-height: 1; }
.visual-lbl { font-size: .875rem; color: #6b7280; margin-top: 8px; }
.visual-divider { border: none; border-top: 1px solid #99f6e4; margin: 20px 24px; }
.sec { padding: 80px 0; border-top: 1px solid #f0f9ff; }
.sec-tag { font-size: .75rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #0d9488; margin-bottom: 12px; }
.sec h2 { font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight: 800; color: #111; margin-bottom: 14px; }
.sec-lead { font-size: 1rem; color: #6b7280; max-width: 520px; line-height: 1.75; margin-bottom: 48px; }
.feat-list { display: flex; flex-direction: column; gap: 0; }
.feat-row { display: flex; gap: 24px; padding: 28px 0; border-bottom: 1px solid #f0f9ff; align-items: flex-start; }
.feat-row:first-child { padding-top: 0; }
.feat-icon { width: 40px; height: 40px; background: #f0fdfa; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.feat-icon-bar { width: 18px; height: 3px; background: #0d9488; border-radius: 2px; }
.feat-title { font-size: .9375rem; font-weight: 700; color: #111; margin-bottom: 6px; }
.feat-body { font-size: .875rem; color: #6b7280; line-height: 1.7; }
.why-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
@media (max-width: 700px) { .why-grid { grid-template-columns: 1fr; } }
.why-list { display: flex; flex-direction: column; gap: 20px; }
.why-item { display: flex; gap: 16px; }
.why-check { width: 22px; height: 22px; background: #0d9488; border-radius: 50%; flex-shrink: 0; margin-top: 2px; }
.why-title { font-size: .9375rem; font-weight: 700; color: #111; margin-bottom: 4px; }
.why-body { font-size: .875rem; color: #6b7280; line-height: 1.65; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
.testi { background: #f0fdfa; padding: 28px; border-radius: 12px; }
.testi-quote { font-size: .9375rem; color: #374151; line-height: 1.75; margin-bottom: 16px; }
.testi-name { font-size: .8125rem; font-weight: 700; color: #111; }
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
.step-num { font-size: 2.5rem; font-weight: 900; color: #ccfbf1; line-height: 1; margin-bottom: 12px; }
.step-title { font-size: .9375rem; font-weight: 700; color: #111; margin-bottom: 8px; }
.step-body { font-size: .875rem; color: #6b7280; line-height: 1.7; }
.area-chips { display: flex; flex-wrap: wrap; gap: 10px; }
.area-chip { padding: 7px 16px; background: #f0fdfa; color: #0f766e; font-size: .8125rem; font-weight: 600; border-radius: 8px; border: 1px solid #99f6e4; }
.faq-list { display: flex; flex-direction: column; border: 1px solid #f0fdf4; border-radius: 10px; overflow: hidden; }
.faq-item { border-bottom: 1px solid #f0fdf4; }
.faq-item:last-child { border-bottom: none; }
.faq-item summary { padding: 18px 24px; font-size: .9375rem; font-weight: 600; color: #111; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; background: #f9fafb; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-size: 1.25rem; color: #0d9488; flex-shrink: 0; }
.faq-item[open] summary::after { content: '−'; }
.faq-answer { padding: 0 24px 18px; font-size: .875rem; color: #6b7280; line-height: 1.75; background: #f9fafb; }
.cta-band { background: #0d9488; padding: 80px 0; text-align: center; }
.cta-band h2 { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 900; color: #fff; margin-bottom: 12px; }
.cta-band p { font-size: 1rem; color: rgba(255,255,255,.8); margin-bottom: 32px; }
.btn-white { background: #fff; color: #0d9488; padding: 14px 36px; border-radius: 8px; font-weight: 800; font-size: .9375rem; display: inline-block; }
footer { padding: 32px 0; border-top: 1px solid #f0fdf4; }
.foot { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: .8125rem; color: #9ca3af; }
</style>
</head>
<body>
<nav><div class="c"><div class="nav-row">
  <div class="logo">{{KEYWORD}}</div>
  <div class="nav-links">
    <a href="#services" class="nav-link">Services</a>
    <a href="#contact" class="nav-btn">Get a quote</a>
  </div>
</div></div></nav>

<section class="hero"><div class="c">
  <div class="hero-split">
    <div>
      <div class="hero-tag">{{SERVICE}} | {{LOCATION}}</div>
      <h1>{{HERO_HEADLINE}}</h1>
      <p>{{HERO_SUBHEADLINE}}</p>
      <div class="btn-row">
        <a href="#contact" class="btn-teal">Get started</a>
        <a href="#services" class="btn-outline">Learn more</a>
      </div>
    </div>
    <div class="hero-visual">
      <div class="visual-inner">
        <div class="visual-num">{{STAT_1_NUMBER}}</div>
        <div class="visual-lbl">{{STAT_1_LABEL}}</div>
        <hr class="visual-divider">
        <div class="visual-num">{{STAT_2_NUMBER}}</div>
        <div class="visual-lbl">{{STAT_2_LABEL}}</div>
      </div>
    </div>
  </div>
</div></section>

<section class="sec" id="services"><div class="c">
  <div class="sec-tag">What we offer</div>
  <h2>{{SERVICES_HEADLINE}}</h2>
  <p class="sec-lead">{{SERVICES_INTRO}}</p>
  <div class="feat-list">
    <div class="feat-row"><div class="feat-icon"><div class="feat-icon-bar"></div></div><div><div class="feat-title">{{FEATURE_1_TITLE}}</div><div class="feat-body">{{FEATURE_1_TEXT}}</div></div></div>
    <div class="feat-row"><div class="feat-icon"><div class="feat-icon-bar"></div></div><div><div class="feat-title">{{FEATURE_2_TITLE}}</div><div class="feat-body">{{FEATURE_2_TEXT}}</div></div></div>
    <div class="feat-row"><div class="feat-icon"><div class="feat-icon-bar"></div></div><div><div class="feat-title">{{FEATURE_3_TITLE}}</div><div class="feat-body">{{FEATURE_3_TEXT}}</div></div></div>
  </div>
</div></section>

<section class="sec" id="why"><div class="c">
  <div class="why-grid">
    <div>
      <div class="sec-tag">Why choose us</div>
      <h2>{{WHY_HEADLINE}}</h2>
      <p style="font-size:1rem;color:#6b7280;line-height:1.8;margin-top:14px;margin-bottom:32px;">{{WHY_INTRO}}</p>
    </div>
    <div class="why-list">
      <div class="why-item"><div class="why-check"></div><div><div class="why-title">{{WHY_1_TITLE}}</div><div class="why-body">{{WHY_1_TEXT}}</div></div></div>
      <div class="why-item"><div class="why-check"></div><div><div class="why-title">{{WHY_2_TITLE}}</div><div class="why-body">{{WHY_2_TEXT}}</div></div></div>
      <div class="why-item"><div class="why-check"></div><div><div class="why-title">{{WHY_3_TITLE}}</div><div class="why-body">{{WHY_3_TEXT}}</div></div></div>
    </div>
  </div>
</div></section>

<section class="sec" id="reviews"><div class="c">
  <div class="sec-tag">Reviews</div>
  <h2>Trusted in {{LOCATION}}</h2>
  <p class="sec-lead">Real feedback from real customers across {{LOCATION}}.</p>
  <div class="grid2">
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_1_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_1_NAME}}, {{LOCATION}}</div></div>
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_2_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_2_NAME}}, {{LOCATION}}</div></div>
  </div>
</div></section>

<section class="sec" id="how-it-works"><div class="c">
  <div class="sec-tag">How it works</div>
  <h2>{{PROCESS_HEADLINE}}</h2>
  <p class="sec-lead">{{PROCESS_INTRO}}</p>
  <div class="steps">
    <div><div class="step-num">01</div><div class="step-title">{{STEP_1_TITLE}}</div><div class="step-body">{{STEP_1_TEXT}}</div></div>
    <div><div class="step-num">02</div><div class="step-title">{{STEP_2_TITLE}}</div><div class="step-body">{{STEP_2_TEXT}}</div></div>
    <div><div class="step-num">03</div><div class="step-title">{{STEP_3_TITLE}}</div><div class="step-body">{{STEP_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="areas"><div class="c">
  <div class="sec-tag">Service areas</div>
  <h2>Serving {{LOCATION}} and nearby</h2>
  <p class="sec-lead">We deliver {{SERVICE}} throughout {{LOCATION}} and surrounding communities.</p>
  <div class="area-chips">
    <span class="area-chip">{{AREA_1}}</span><span class="area-chip">{{AREA_2}}</span><span class="area-chip">{{AREA_3}}</span>
    <span class="area-chip">{{AREA_4}}</span><span class="area-chip">{{AREA_5}}</span><span class="area-chip">{{AREA_6}}</span>
  </div>
</div></section>

<section class="sec" id="faq"><div class="c">
  <div class="sec-tag">FAQ</div>
  <h2>{{FAQ_HEADLINE}}</h2>
  <div class="faq-list">
    <details class="faq-item"><summary>{{FAQ_1_Q}}</summary><div class="faq-answer">{{FAQ_1_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_2_Q}}</summary><div class="faq-answer">{{FAQ_2_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_3_Q}}</summary><div class="faq-answer">{{FAQ_3_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_4_Q}}</summary><div class="faq-answer">{{FAQ_4_A}}</div></details>
  </div>
</div></section>

<section class="cta-band" id="contact"><div class="c">
  <h2>{{CTA_HEADLINE}}</h2>
  <p>{{CTA_SUBTEXT}}</p>
  <a href="tel:+1-555-000-0000" class="btn-white">Call us now</a>
</div></section>

<footer><div class="c"><div class="foot">
  <span>{{KEYWORD}} | {{LOCATION}}</span>
  <span>&copy; 2024 {{KEYWORD}}. All rights reserved.</span>
</div></div></footer>
</body></html>`
  },

  // ── T12: Bold Local ── Local Business ─────────────────────────────────────
  {
    id: 'starter-12',
    name: 'Bold Local',
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
.logo { font-size: .9375rem; font-weight: 800; color: #fff; }
.nav-phone { font-size: 1.0625rem; font-weight: 900; color: #f97316; letter-spacing: -.01em; }
.hero { padding: 52px 0 48px; }
.hero-badge { display: inline-flex; align-items: center; gap: 8px; background: #fff7ed; color: #c2410c; font-size: .75rem; font-weight: 800; padding: 5px 12px; border-radius: 4px; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 20px; }
.hero h1 { font-size: clamp(2.25rem, 5.5vw, 3.75rem); font-weight: 900; line-height: 1.04; color: #111; margin-bottom: 18px; max-width: 700px; }
.hero-lead { font-size: 1.0625rem; color: #4b5563; line-height: 1.75; margin-bottom: 32px; max-width: 560px; }
.btn-row { display: flex; gap: 12px; flex-wrap: wrap; }
.btn-orange { background: #f97316; color: #fff; padding: 15px 32px; border-radius: 6px; font-weight: 900; font-size: 1rem; display: inline-block; }
.btn-ghost { border: 2px solid #e5e7eb; color: #111; padding: 13px 28px; border-radius: 6px; font-weight: 600; font-size: .9375rem; display: inline-block; }
.stats-band { background: #f97316; padding: 24px 0; margin-top: 48px; }
.stats-row { display: flex; gap: 48px; flex-wrap: wrap; }
.stat-num { font-size: 1.875rem; font-weight: 900; color: #fff; line-height: 1; }
.stat-lbl { font-size: .8125rem; color: rgba(255,255,255,.85); margin-top: 4px; font-weight: 500; }
.sec { padding: 72px 0; border-top: 1px solid #f3f4f6; }
.sec-tag { font-size: .75rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #f97316; margin-bottom: 12px; }
.sec h2 { font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight: 800; color: #111; margin-bottom: 14px; }
.sec-lead { font-size: 1rem; color: #6b7280; max-width: 520px; line-height: 1.75; margin-bottom: 48px; }
.grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.card { padding: 28px; border: 1px solid #f3f4f6; border-radius: 8px; border-top: 3px solid #f97316; }
.card-title { font-size: .9375rem; font-weight: 700; color: #111; margin-bottom: 8px; }
.card-body { font-size: .875rem; color: #6b7280; line-height: 1.7; }
.testi { background: #fff7ed; padding: 24px; border-radius: 8px; border-left: 3px solid #f97316; }
.testi-quote { font-size: .9375rem; color: #374151; line-height: 1.75; margin-bottom: 14px; }
.testi-name { font-size: .8125rem; font-weight: 700; color: #111; }
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
.step-num { font-size: .75rem; font-weight: 800; color: #f97316; letter-spacing: .1em; text-transform: uppercase; margin-bottom: 10px; }
.step-bar { height: 3px; width: 28px; background: #f97316; margin-bottom: 12px; border-radius: 2px; }
.step-title { font-size: .9375rem; font-weight: 700; color: #111; margin-bottom: 8px; }
.step-body { font-size: .875rem; color: #6b7280; line-height: 1.7; }
.area-chips { display: flex; flex-wrap: wrap; gap: 10px; }
.area-chip { padding: 7px 16px; border: 1px solid #f3f4f6; border-radius: 5px; font-size: .8125rem; font-weight: 600; color: #374151; }
.faq-list { display: flex; flex-direction: column; border: 1px solid #f3f4f6; border-radius: 8px; overflow: hidden; }
.faq-item { border-bottom: 1px solid #f3f4f6; }
.faq-item:last-child { border-bottom: none; }
.faq-item summary { padding: 18px 20px; font-size: .9375rem; font-weight: 600; color: #111; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-size: 1.25rem; color: #f97316; flex-shrink: 0; }
.faq-item[open] summary::after { content: '−'; }
.faq-answer { padding: 0 20px 18px; font-size: .875rem; color: #6b7280; line-height: 1.75; }
.cta-band { background: #111; padding: 72px 0; }
.cta-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 32px; }
.cta-band h2 { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 900; color: #fff; margin-bottom: 10px; }
.cta-band p { font-size: 1rem; color: #9ca3af; }
.btn-orange-lg { background: #f97316; color: #fff; padding: 15px 36px; border-radius: 6px; font-weight: 900; font-size: 1rem; display: inline-block; white-space: nowrap; }
footer { padding: 24px 0; border-top: 1px solid #f3f4f6; }
.foot { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; font-size: .8125rem; color: #9ca3af; }
</style>
</head>
<body>
<nav><div class="c"><div class="nav-row">
  <div class="logo">{{KEYWORD}}</div>
  <div class="nav-phone">{{PHONE}}</div>
</div></div></nav>

<section class="hero"><div class="c">
  <div class="hero-badge">Serving {{LOCATION}}</div>
  <h1>{{HERO_HEADLINE}}</h1>
  <p class="hero-lead">{{HERO_SUBHEADLINE}}</p>
  <div class="btn-row">
    <a href="#contact" class="btn-orange">Get a free quote</a>
    <a href="#services" class="btn-ghost">Our services</a>
  </div>
</div></section>

<div class="stats-band"><div class="c">
  <div class="stats-row">
    <div><div class="stat-num">{{STAT_1_NUMBER}}</div><div class="stat-lbl">{{STAT_1_LABEL}}</div></div>
    <div><div class="stat-num">{{STAT_2_NUMBER}}</div><div class="stat-lbl">{{STAT_2_LABEL}}</div></div>
    <div><div class="stat-num">{{STAT_3_NUMBER}}</div><div class="stat-lbl">{{STAT_3_LABEL}}</div></div>
  </div>
</div></div>

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
  <h2>{{LOCATION}} customers trust us</h2>
  <p class="sec-lead">See what people are saying about our {{SERVICE}} services.</p>
  <div class="grid2">
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_1_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_1_NAME}}</div></div>
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_2_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_2_NAME}}</div></div>
  </div>
</div></section>

<section class="sec" id="how-it-works"><div class="c">
  <div class="sec-tag">How it works</div>
  <h2>{{PROCESS_HEADLINE}}</h2>
  <p class="sec-lead">{{PROCESS_INTRO}}</p>
  <div class="steps">
    <div><div class="step-num">STEP 01</div><div class="step-bar"></div><div class="step-title">{{STEP_1_TITLE}}</div><div class="step-body">{{STEP_1_TEXT}}</div></div>
    <div><div class="step-num">STEP 02</div><div class="step-bar"></div><div class="step-title">{{STEP_2_TITLE}}</div><div class="step-body">{{STEP_2_TEXT}}</div></div>
    <div><div class="step-num">STEP 03</div><div class="step-bar"></div><div class="step-title">{{STEP_3_TITLE}}</div><div class="step-body">{{STEP_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="areas"><div class="c">
  <div class="sec-tag">Where we work</div>
  <h2>Serving {{LOCATION}} and surrounding areas</h2>
  <p class="sec-lead">We provide {{SERVICE}} across {{LOCATION}} and every nearby town and neighborhood.</p>
  <div class="area-chips">
    <span class="area-chip">{{AREA_1}}</span><span class="area-chip">{{AREA_2}}</span><span class="area-chip">{{AREA_3}}</span>
    <span class="area-chip">{{AREA_4}}</span><span class="area-chip">{{AREA_5}}</span><span class="area-chip">{{AREA_6}}</span>
  </div>
</div></section>

<section class="sec" id="faq"><div class="c">
  <div class="sec-tag">FAQ</div>
  <h2>{{FAQ_HEADLINE}}</h2>
  <div class="faq-list">
    <details class="faq-item"><summary>{{FAQ_1_Q}}</summary><div class="faq-answer">{{FAQ_1_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_2_Q}}</summary><div class="faq-answer">{{FAQ_2_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_3_Q}}</summary><div class="faq-answer">{{FAQ_3_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_4_Q}}</summary><div class="faq-answer">{{FAQ_4_A}}</div></details>
  </div>
</div></section>

<section class="cta-band" id="contact"><div class="c">
  <div class="cta-inner">
    <div><h2>{{CTA_HEADLINE}}</h2><p>{{CTA_SUBTEXT}}</p></div>
    <a href="tel:+1-555-000-0000" class="btn-orange-lg">Call us now</a>
  </div>
</div></section>

<footer><div class="c"><div class="foot">
  <span>{{KEYWORD}} | {{LOCATION}}</span>
  <span>&copy; 2024 {{KEYWORD}}. All rights reserved.</span>
</div></div></footer>
</body></html>`
  },

  // ── T13: Community Trust ── Local Business ────────────────────────────────
  {
    id: 'starter-13',
    name: 'Community Trust',
    category: 'Local Business',
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
body { font-family: 'Inter', system-ui, sans-serif; background: #f8fafc; color: #1e293b; -webkit-font-smoothing: antialiased; line-height: 1.6; }
a { text-decoration: none; color: inherit; }
.c { max-width: 1080px; margin: 0 auto; padding: 0 28px; }
nav { background: #1d4ed8; padding: 18px 0; }
.nav-row { display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: 1rem; font-weight: 700; color: #fff; }
.nav-btn { background: #fff; color: #1d4ed8; padding: 9px 20px; border-radius: 7px; font-size: .8125rem; font-weight: 700; }
.hero { background: #fff; padding: 72px 0 64px; border-bottom: 1px solid #e2e8f0; }
.hero-tag { font-size: .75rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #1d4ed8; margin-bottom: 20px; }
.hero h1 { font-size: clamp(2.25rem, 5vw, 3.5rem); font-weight: 800; line-height: 1.1; color: #0f172a; margin-bottom: 20px; max-width: 680px; }
.hero p { font-size: 1.0625rem; color: #64748b; max-width: 540px; line-height: 1.8; margin-bottom: 36px; }
.btn-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 48px; }
.btn-blue { background: #1d4ed8; color: #fff; padding: 13px 28px; border-radius: 7px; font-weight: 700; font-size: .9375rem; display: inline-block; }
.btn-outline { border: 2px solid #e2e8f0; color: #1e293b; padding: 11px 26px; border-radius: 7px; font-weight: 600; font-size: .9375rem; display: inline-block; }
.badges { display: flex; gap: 16px; flex-wrap: wrap; }
.badge { display: flex; align-items: center; gap: 8px; background: #eff6ff; padding: 10px 16px; border-radius: 8px; }
.badge-dot { width: 8px; height: 8px; background: #1d4ed8; border-radius: 50%; }
.badge-text { font-size: .8125rem; font-weight: 700; color: #1d4ed8; }
.sec { padding: 72px 0; }
.sec-bg-white { background: #fff; }
.sec-tag { font-size: .75rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #1d4ed8; margin-bottom: 12px; }
.sec h2 { font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight: 700; color: #0f172a; margin-bottom: 14px; }
.sec-lead { font-size: 1rem; color: #64748b; max-width: 520px; line-height: 1.75; margin-bottom: 48px; }
.grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.card { background: #fff; padding: 28px; border-radius: 10px; border: 1px solid #e2e8f0; }
.card-bar { height: 3px; width: 32px; background: #1d4ed8; margin-bottom: 18px; border-radius: 2px; }
.card-title { font-size: .9375rem; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
.card-body { font-size: .875rem; color: #64748b; line-height: 1.7; }
.testi { background: #fff; padding: 28px; border-radius: 10px; border: 1px solid #e2e8f0; }
.testi-stars { color: #f59e0b; font-size: 1rem; margin-bottom: 14px; letter-spacing: .08em; }
.testi-quote { font-size: .9375rem; color: #334155; line-height: 1.75; margin-bottom: 16px; }
.testi-name { font-size: .8125rem; font-weight: 700; color: #0f172a; }
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
.step-num { font-size: .75rem; font-weight: 700; color: #1d4ed8; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 10px; }
.step-bar { height: 3px; width: 32px; background: #1d4ed8; border-radius: 2px; margin-bottom: 14px; }
.step-title { font-size: .9375rem; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
.step-body { font-size: .875rem; color: #64748b; line-height: 1.7; }
.area-chips { display: flex; flex-wrap: wrap; gap: 10px; }
.area-chip { padding: 7px 16px; background: #eff6ff; color: #1d4ed8; font-size: .8125rem; font-weight: 600; border-radius: 7px; }
.faq-list { display: flex; flex-direction: column; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: #fff; }
.faq-item { border-bottom: 1px solid #e2e8f0; }
.faq-item:last-child { border-bottom: none; }
.faq-item summary { padding: 18px 24px; font-size: .9375rem; font-weight: 600; color: #0f172a; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-size: 1.25rem; color: #1d4ed8; flex-shrink: 0; }
.faq-item[open] summary::after { content: '−'; }
.faq-answer { padding: 0 24px 18px; font-size: .875rem; color: #64748b; line-height: 1.75; }
.cta-band { background: #1d4ed8; padding: 80px 0; text-align: center; }
.cta-band h2 { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 800; color: #fff; margin-bottom: 12px; }
.cta-band p { font-size: 1rem; color: rgba(255,255,255,.8); margin-bottom: 32px; }
.btn-white { background: #fff; color: #1d4ed8; padding: 14px 36px; border-radius: 8px; font-weight: 800; font-size: .9375rem; display: inline-block; }
footer { background: #fff; padding: 32px 0; border-top: 1px solid #e2e8f0; }
.foot { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: .8125rem; color: #94a3b8; }
</style>
</head>
<body>
<nav><div class="c"><div class="nav-row">
  <div class="logo">{{KEYWORD}}</div>
  <a href="#contact" class="nav-btn">Get a free quote</a>
</div></div></nav>

<section class="hero sec-bg-white"><div class="c">
  <div class="hero-tag">{{SERVICE}} in {{LOCATION}}</div>
  <h1>{{HERO_HEADLINE}}</h1>
  <p>{{HERO_SUBHEADLINE}}</p>
  <div class="btn-row">
    <a href="#contact" class="btn-blue">Schedule service</a>
    <a href="#services" class="btn-outline">See all services</a>
  </div>
  <div class="badges">
    <div class="badge"><div class="badge-dot"></div><div class="badge-text">{{TRUST_1}}</div></div>
    <div class="badge"><div class="badge-dot"></div><div class="badge-text">{{TRUST_2}}</div></div>
    <div class="badge"><div class="badge-dot"></div><div class="badge-text">{{TRUST_3}}</div></div>
    <div class="badge"><div class="badge-dot"></div><div class="badge-text">{{TRUST_4}}</div></div>
  </div>
</div></section>

<section class="sec" id="services"><div class="c">
  <div class="sec-tag">Services</div>
  <h2>{{SERVICES_HEADLINE}}</h2>
  <p class="sec-lead">{{SERVICES_INTRO}}</p>
  <div class="grid3">
    <div class="card"><div class="card-bar"></div><div class="card-title">{{FEATURE_1_TITLE}}</div><div class="card-body">{{FEATURE_1_TEXT}}</div></div>
    <div class="card"><div class="card-bar"></div><div class="card-title">{{FEATURE_2_TITLE}}</div><div class="card-body">{{FEATURE_2_TEXT}}</div></div>
    <div class="card"><div class="card-bar"></div><div class="card-title">{{FEATURE_3_TITLE}}</div><div class="card-body">{{FEATURE_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec sec-bg-white" id="why"><div class="c">
  <div class="sec-tag">Why choose us</div>
  <h2>{{WHY_HEADLINE}}</h2>
  <p class="sec-lead">{{WHY_INTRO}}</p>
  <div class="grid3">
    <div class="card"><div class="card-bar"></div><div class="card-title">{{WHY_1_TITLE}}</div><div class="card-body">{{WHY_1_TEXT}}</div></div>
    <div class="card"><div class="card-bar"></div><div class="card-title">{{WHY_2_TITLE}}</div><div class="card-body">{{WHY_2_TEXT}}</div></div>
    <div class="card"><div class="card-bar"></div><div class="card-title">{{WHY_3_TITLE}}</div><div class="card-body">{{WHY_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="reviews"><div class="c">
  <div class="sec-tag">Reviews</div>
  <h2>Trusted by {{LOCATION}} families</h2>
  <p class="sec-lead">Hear from homeowners and businesses who count on us for {{SERVICE}}.</p>
  <div class="grid2">
    <div class="testi"><div class="testi-stars">★★★★★</div><div class="testi-quote">{{TESTIMONIAL_1_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_1_NAME}}, {{LOCATION}}</div></div>
    <div class="testi"><div class="testi-stars">★★★★★</div><div class="testi-quote">{{TESTIMONIAL_2_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_2_NAME}}, {{LOCATION}}</div></div>
  </div>
</div></section>

<section class="sec sec-bg-white" id="how-it-works"><div class="c">
  <div class="sec-tag">How it works</div>
  <h2>{{PROCESS_HEADLINE}}</h2>
  <p class="sec-lead">{{PROCESS_INTRO}}</p>
  <div class="steps">
    <div><div class="step-num">STEP 01</div><div class="step-bar"></div><div class="step-title">{{STEP_1_TITLE}}</div><div class="step-body">{{STEP_1_TEXT}}</div></div>
    <div><div class="step-num">STEP 02</div><div class="step-bar"></div><div class="step-title">{{STEP_2_TITLE}}</div><div class="step-body">{{STEP_2_TEXT}}</div></div>
    <div><div class="step-num">STEP 03</div><div class="step-bar"></div><div class="step-title">{{STEP_3_TITLE}}</div><div class="step-body">{{STEP_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="areas"><div class="c">
  <div class="sec-tag">Service areas</div>
  <h2>Serving {{LOCATION}} and the surrounding community</h2>
  <p class="sec-lead">Our local {{SERVICE}} team covers {{LOCATION}} and every nearby neighborhood.</p>
  <div class="area-chips">
    <span class="area-chip">{{AREA_1}}</span><span class="area-chip">{{AREA_2}}</span><span class="area-chip">{{AREA_3}}</span>
    <span class="area-chip">{{AREA_4}}</span><span class="area-chip">{{AREA_5}}</span><span class="area-chip">{{AREA_6}}</span>
  </div>
</div></section>

<section class="sec sec-bg-white" id="faq"><div class="c">
  <div class="sec-tag">FAQ</div>
  <h2>{{FAQ_HEADLINE}}</h2>
  <div class="faq-list">
    <details class="faq-item"><summary>{{FAQ_1_Q}}</summary><div class="faq-answer">{{FAQ_1_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_2_Q}}</summary><div class="faq-answer">{{FAQ_2_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_3_Q}}</summary><div class="faq-answer">{{FAQ_3_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_4_Q}}</summary><div class="faq-answer">{{FAQ_4_A}}</div></details>
  </div>
</div></section>

<section class="cta-band" id="contact"><div class="c">
  <h2>{{CTA_HEADLINE}}</h2>
  <p>{{CTA_SUBTEXT}}</p>
  <a href="tel:+1-555-000-0000" class="btn-white">Call us today</a>
</div></section>

<footer><div class="c"><div class="foot">
  <span>{{KEYWORD}} | {{LOCATION}}</span>
  <span>&copy; 2024 {{KEYWORD}}. All rights reserved.</span>
</div></div></footer>
</body></html>`
  },

  // ── T14: Corporate Pro ── Professional Services ────────────────────────────
  {
    id: 'starter-14',
    name: 'Corporate Pro',
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
body { font-family: 'Inter', system-ui, sans-serif; background: #fff; color: #111; -webkit-font-smoothing: antialiased; line-height: 1.6; }
a { text-decoration: none; color: inherit; }
.c { max-width: 1080px; margin: 0 auto; padding: 0 28px; }
nav { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 18px 0; }
.nav-row { display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: 1rem; font-weight: 700; color: #111; }
.nav-links { display: flex; gap: 32px; align-items: center; }
.nav-link { font-size: .875rem; color: #6b7280; font-weight: 500; }
.nav-btn { background: #0ea5e9; color: #fff; padding: 9px 20px; border-radius: 6px; font-size: .8125rem; font-weight: 700; }
.hero { background: #f8fafc; padding: 88px 0 80px; border-bottom: 1px solid #e5e7eb; }
.hero-eyebrow { display: inline-block; background: #e0f2fe; color: #0284c7; font-size: .75rem; font-weight: 700; padding: 4px 12px; border-radius: 4px; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 24px; }
.hero h1 { font-size: clamp(2.25rem, 5vw, 3.5rem); font-weight: 800; line-height: 1.1; color: #0f172a; margin-bottom: 20px; max-width: 740px; }
.hero p { font-size: 1.0625rem; color: #475569; max-width: 540px; line-height: 1.8; margin-bottom: 40px; }
.btn-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 56px; }
.btn-sky { background: #0ea5e9; color: #fff; padding: 13px 28px; border-radius: 7px; font-weight: 700; font-size: .9375rem; display: inline-block; }
.btn-ghost { color: #475569; border: 1px solid #cbd5e1; padding: 12px 26px; border-radius: 7px; font-weight: 600; font-size: .9375rem; display: inline-block; }
.trust-row { display: flex; gap: 40px; flex-wrap: wrap; }
.trust-item { display: flex; align-items: center; gap: 8px; font-size: .875rem; font-weight: 600; color: #334155; }
.trust-dot { width: 6px; height: 6px; border-radius: 50%; background: #0ea5e9; }
.sec { padding: 80px 0; border-top: 1px solid #e5e7eb; }
.sec-eyebrow { display: inline-block; background: #e0f2fe; color: #0284c7; font-size: .75rem; font-weight: 700; padding: 3px 10px; border-radius: 4px; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 14px; }
.sec h2 { font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight: 700; color: #0f172a; margin-bottom: 14px; }
.sec-lead { font-size: 1rem; color: #475569; max-width: 520px; line-height: 1.75; margin-bottom: 48px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
@media (max-width: 700px) { .two-col { grid-template-columns: 1fr; } }
.feat-item { display: flex; gap: 20px; padding: 24px; border: 1px solid #f1f5f9; border-radius: 8px; background: #f8fafc; }
.feat-line { width: 3px; flex-shrink: 0; background: #0ea5e9; border-radius: 2px; }
.feat-title { font-size: .9375rem; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
.feat-body { font-size: .875rem; color: #64748b; line-height: 1.7; }
.grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
.card { padding: 28px; border: 1px solid #e5e7eb; border-radius: 8px; }
.card-num { font-size: .75rem; font-weight: 700; color: #0ea5e9; margin-bottom: 14px; letter-spacing: .06em; }
.card-title { font-size: .9375rem; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
.card-body { font-size: .875rem; color: #64748b; line-height: 1.7; }
.testi { background: #f8fafc; padding: 28px; border-radius: 8px; border-left: 3px solid #0ea5e9; }
.testi-quote { font-size: .9375rem; color: #334155; line-height: 1.75; margin-bottom: 16px; }
.testi-name { font-size: .8125rem; font-weight: 700; color: #0f172a; }
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
.step-num { font-size: .75rem; font-weight: 700; color: #0ea5e9; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 12px; }
.step-bar { height: 2px; width: 28px; background: #0ea5e9; margin-bottom: 14px; }
.step-title { font-size: .9375rem; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
.step-body { font-size: .875rem; color: #64748b; line-height: 1.7; }
.area-chips { display: flex; flex-wrap: wrap; gap: 10px; }
.area-chip { padding: 6px 14px; border: 1px solid #e0f2fe; color: #0284c7; font-size: .8125rem; font-weight: 600; border-radius: 5px; background: #f0f9ff; }
.faq-list { display: flex; flex-direction: column; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
.faq-item { border-bottom: 1px solid #e5e7eb; }
.faq-item:last-child { border-bottom: none; }
.faq-item summary { padding: 18px 24px; font-size: .9375rem; font-weight: 600; color: #0f172a; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-size: 1.25rem; color: #0ea5e9; flex-shrink: 0; }
.faq-item[open] summary::after { content: '−'; }
.faq-answer { padding: 0 24px 18px; font-size: .875rem; color: #64748b; line-height: 1.75; }
.cta-band { background: #0f172a; padding: 88px 0; }
.cta-layout { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 40px; }
.cta-band h2 { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 800; color: #fff; margin-bottom: 10px; }
.cta-band p { font-size: 1rem; color: #94a3b8; }
.btn-sky-lg { background: #0ea5e9; color: #fff; padding: 15px 36px; border-radius: 7px; font-weight: 700; font-size: 1rem; display: inline-block; white-space: nowrap; }
footer { padding: 32px 0; border-top: 1px solid #e5e7eb; }
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
  <div class="hero-eyebrow">{{SERVICE}} | {{LOCATION}}</div>
  <h1>{{HERO_HEADLINE}}</h1>
  <p>{{HERO_SUBHEADLINE}}</p>
  <div class="btn-row">
    <a href="#contact" class="btn-sky">Schedule a consultation</a>
    <a href="#services" class="btn-ghost">View services</a>
  </div>
  <div class="trust-row">
    <div class="trust-item"><div class="trust-dot"></div>{{TRUST_1}}</div>
    <div class="trust-item"><div class="trust-dot"></div>{{TRUST_2}}</div>
    <div class="trust-item"><div class="trust-dot"></div>{{TRUST_3}}</div>
  </div>
</div></section>

<section class="sec" id="services"><div class="c">
  <div class="sec-eyebrow">Services</div>
  <h2>{{SERVICES_HEADLINE}}</h2>
  <p class="sec-lead">{{SERVICES_INTRO}}</p>
  <div class="two-col">
    <div class="feat-item"><div class="feat-line"></div><div><div class="feat-title">{{FEATURE_1_TITLE}}</div><div class="feat-body">{{FEATURE_1_TEXT}}</div></div></div>
    <div class="feat-item"><div class="feat-line"></div><div><div class="feat-title">{{FEATURE_2_TITLE}}</div><div class="feat-body">{{FEATURE_2_TEXT}}</div></div></div>
    <div class="feat-item"><div class="feat-line"></div><div><div class="feat-title">{{FEATURE_3_TITLE}}</div><div class="feat-body">{{FEATURE_3_TEXT}}</div></div></div>
    <div class="feat-item"><div class="feat-line"></div><div><div class="feat-title">{{WHY_1_TITLE}}</div><div class="feat-body">{{WHY_1_TEXT}}</div></div></div>
  </div>
</div></section>

<section class="sec" id="about"><div class="c">
  <div class="sec-eyebrow">About</div>
  <h2>{{WHY_HEADLINE}}</h2>
  <p class="sec-lead">{{WHY_INTRO}}</p>
  <div class="grid3">
    <div class="card"><div class="card-num">{{STAT_1_NUMBER}}</div><div class="card-title">{{STAT_1_LABEL}}</div><div class="card-body">{{WHY_2_TEXT}}</div></div>
    <div class="card"><div class="card-num">{{STAT_2_NUMBER}}</div><div class="card-title">{{STAT_2_LABEL}}</div><div class="card-body">{{WHY_3_TEXT}}</div></div>
    <div class="card"><div class="card-num">{{STAT_3_NUMBER}}</div><div class="card-title">{{STAT_3_LABEL}}</div><div class="card-body">{{FEATURE_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="reviews"><div class="c">
  <div class="sec-eyebrow">Testimonials</div>
  <h2>Trusted professionals in {{LOCATION}}</h2>
  <p class="sec-lead">Hear directly from clients who rely on our {{SERVICE}} expertise.</p>
  <div class="grid2">
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_1_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_1_NAME}}</div></div>
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_2_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_2_NAME}}</div></div>
  </div>
</div></section>

<section class="sec" id="how-it-works"><div class="c">
  <div class="sec-eyebrow">Process</div>
  <h2>{{PROCESS_HEADLINE}}</h2>
  <p class="sec-lead">{{PROCESS_INTRO}}</p>
  <div class="steps">
    <div><div class="step-num">01</div><div class="step-bar"></div><div class="step-title">{{STEP_1_TITLE}}</div><div class="step-body">{{STEP_1_TEXT}}</div></div>
    <div><div class="step-num">02</div><div class="step-bar"></div><div class="step-title">{{STEP_2_TITLE}}</div><div class="step-body">{{STEP_2_TEXT}}</div></div>
    <div><div class="step-num">03</div><div class="step-bar"></div><div class="step-title">{{STEP_3_TITLE}}</div><div class="step-body">{{STEP_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="areas"><div class="c">
  <div class="sec-eyebrow">Service areas</div>
  <h2>Serving {{LOCATION}} and surrounding regions</h2>
  <p class="sec-lead">Our {{SERVICE}} professionals serve {{LOCATION}} and the wider surrounding area.</p>
  <div class="area-chips">
    <span class="area-chip">{{AREA_1}}</span><span class="area-chip">{{AREA_2}}</span><span class="area-chip">{{AREA_3}}</span>
    <span class="area-chip">{{AREA_4}}</span><span class="area-chip">{{AREA_5}}</span><span class="area-chip">{{AREA_6}}</span>
  </div>
</div></section>

<section class="sec" id="faq"><div class="c">
  <div class="sec-eyebrow">FAQ</div>
  <h2>{{FAQ_HEADLINE}}</h2>
  <div class="faq-list">
    <details class="faq-item"><summary>{{FAQ_1_Q}}</summary><div class="faq-answer">{{FAQ_1_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_2_Q}}</summary><div class="faq-answer">{{FAQ_2_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_3_Q}}</summary><div class="faq-answer">{{FAQ_3_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_4_Q}}</summary><div class="faq-answer">{{FAQ_4_A}}</div></details>
  </div>
</div></section>

<section class="cta-band" id="contact"><div class="c">
  <div class="cta-layout">
    <div><h2>{{CTA_HEADLINE}}</h2><p>{{CTA_SUBTEXT}}</p></div>
    <a href="tel:+1-555-000-0000" class="btn-sky-lg">Get in touch</a>
  </div>
</div></section>

<footer><div class="c"><div class="foot">
  <span>{{KEYWORD}} | {{LOCATION}}</span>
  <span>&copy; 2024 {{KEYWORD}}. All rights reserved.</span>
</div></div></footer>
</body></html>`
  },

  // ── T15: Agency Dark ── Professional Services ──────────────────────────────
  {
    id: 'starter-15',
    name: 'Agency Dark',
    category: 'Professional Services',
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
body { font-family: 'Inter', system-ui, sans-serif; background: #0a0a0a; color: #e5e5e5; -webkit-font-smoothing: antialiased; line-height: 1.6; }
a { text-decoration: none; color: inherit; }
.c { max-width: 1080px; margin: 0 auto; padding: 0 28px; }
nav { padding: 20px 0; border-bottom: 1px solid #1a1a1a; }
.nav-row { display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: 1rem; font-weight: 800; color: #fff; }
.nav-links { display: flex; gap: 28px; align-items: center; }
.nav-link { font-size: .875rem; color: #737373; font-weight: 500; }
.nav-btn { border: 1px solid #0d9488; color: #0d9488; padding: 9px 20px; font-size: .8125rem; font-weight: 700; border-radius: 6px; }
.hero { padding: 96px 0 80px; border-bottom: 1px solid #1a1a1a; }
.hero-tag { font-size: .75rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #0d9488; margin-bottom: 24px; }
.hero h1 { font-size: clamp(2.75rem, 6vw, 5rem); font-weight: 900; line-height: 1.04; color: #fff; margin-bottom: 24px; max-width: 800px; }
.hero h1 span { color: #0d9488; }
.hero p { font-size: 1.125rem; color: #737373; max-width: 520px; line-height: 1.8; margin-bottom: 40px; }
.btn-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 64px; }
.btn-teal { background: #0d9488; color: #fff; padding: 14px 32px; border-radius: 7px; font-weight: 700; font-size: .9375rem; display: inline-block; }
.btn-ghost { border: 1px solid #2a2a2a; color: #a3a3a3; padding: 13px 28px; border-radius: 7px; font-weight: 600; font-size: .9375rem; display: inline-block; }
.stats-row { display: flex; gap: 48px; flex-wrap: wrap; padding-top: 40px; border-top: 1px solid #1a1a1a; }
.stat-num { font-size: 2.5rem; font-weight: 900; color: #0d9488; line-height: 1; }
.stat-lbl { font-size: .8125rem; color: #525252; margin-top: 6px; }
.sec { padding: 80px 0; border-top: 1px solid #1a1a1a; }
.sec-tag { font-size: .75rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #0d9488; margin-bottom: 14px; }
.sec h2 { font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight: 800; color: #fff; margin-bottom: 14px; }
.sec-lead { font-size: 1rem; color: #737373; max-width: 520px; line-height: 1.75; margin-bottom: 48px; }
.grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 2px; border: 1px solid #1a1a1a; border-radius: 10px; overflow: hidden; }
.card { background: #111; padding: 32px; }
.card-teal { display: block; width: 28px; height: 2px; background: #0d9488; margin-bottom: 20px; }
.card-title { font-size: .9375rem; font-weight: 700; color: #fff; margin-bottom: 10px; }
.card-body { font-size: .875rem; color: #525252; line-height: 1.7; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.testi { background: #111; padding: 28px; border-radius: 8px; border: 1px solid #1a1a1a; }
.testi-quote { font-size: .9375rem; color: #d4d4d4; line-height: 1.75; margin-bottom: 18px; }
.testi-name { font-size: .8125rem; font-weight: 700; color: #fff; }
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2px; border: 1px solid #1a1a1a; border-radius: 10px; overflow: hidden; }
.step { background: #111; padding: 28px; }
.step-num { font-size: 2rem; font-weight: 900; color: #0d9488; line-height: 1; margin-bottom: 14px; }
.step-title { font-size: .9375rem; font-weight: 700; color: #fff; margin-bottom: 8px; }
.step-body { font-size: .875rem; color: #525252; line-height: 1.7; }
.area-chips { display: flex; flex-wrap: wrap; gap: 10px; }
.area-chip { padding: 7px 16px; border: 1px solid #1f2937; border-radius: 20px; font-size: .8125rem; font-weight: 500; color: #9ca3af; background: #111; }
.faq-list { display: flex; flex-direction: column; border: 1px solid #1a1a1a; border-radius: 10px; overflow: hidden; }
.faq-item { border-bottom: 1px solid #1a1a1a; }
.faq-item:last-child { border-bottom: none; }
.faq-item summary { padding: 18px 24px; font-size: .9375rem; font-weight: 600; color: #e5e5e5; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; background: #111; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-size: 1.25rem; color: #0d9488; flex-shrink: 0; }
.faq-item[open] summary::after { content: '−'; }
.faq-answer { padding: 0 24px 18px; font-size: .875rem; color: #737373; line-height: 1.75; background: #111; }
.cta-band { background: #0d9488; padding: 80px 0; text-align: center; }
.cta-band h2 { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 900; color: #fff; margin-bottom: 12px; }
.cta-band p { font-size: 1rem; color: rgba(255,255,255,.8); margin-bottom: 32px; }
.btn-dark { background: #0a0a0a; color: #fff; padding: 15px 36px; border-radius: 7px; font-weight: 800; font-size: 1rem; display: inline-block; }
footer { padding: 32px 0; border-top: 1px solid #1a1a1a; }
.foot { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: .8125rem; color: #525252; }
</style>
</head>
<body>
<nav><div class="c"><div class="nav-row">
  <div class="logo">{{KEYWORD}}</div>
  <div class="nav-links">
    <a href="#services" class="nav-link">Services</a>
    <a href="#contact" class="nav-btn">Work with us</a>
  </div>
</div></div></nav>

<section class="hero"><div class="c">
  <div class="hero-tag">{{SERVICE}} | {{LOCATION}}</div>
  <h1>{{HERO_HEADLINE}}</h1>
  <p>{{HERO_SUBHEADLINE}}</p>
  <div class="btn-row">
    <a href="#contact" class="btn-teal">Start a project</a>
    <a href="#services" class="btn-ghost">Our work</a>
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
    <div class="card"><div class="card-teal"></div><div class="card-title">{{FEATURE_1_TITLE}}</div><div class="card-body">{{FEATURE_1_TEXT}}</div></div>
    <div class="card"><div class="card-teal"></div><div class="card-title">{{FEATURE_2_TITLE}}</div><div class="card-body">{{FEATURE_2_TEXT}}</div></div>
    <div class="card"><div class="card-teal"></div><div class="card-title">{{FEATURE_3_TITLE}}</div><div class="card-body">{{FEATURE_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="why"><div class="c">
  <div class="sec-tag">Why us</div>
  <h2>{{WHY_HEADLINE}}</h2>
  <p class="sec-lead">{{WHY_INTRO}}</p>
  <div class="grid3">
    <div class="card"><div class="card-teal"></div><div class="card-title">{{WHY_1_TITLE}}</div><div class="card-body">{{WHY_1_TEXT}}</div></div>
    <div class="card"><div class="card-teal"></div><div class="card-title">{{WHY_2_TITLE}}</div><div class="card-body">{{WHY_2_TEXT}}</div></div>
    <div class="card"><div class="card-teal"></div><div class="card-title">{{WHY_3_TITLE}}</div><div class="card-body">{{WHY_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="reviews"><div class="c">
  <div class="sec-tag">Client results</div>
  <h2>Trusted by {{LOCATION}} professionals</h2>
  <p class="sec-lead">Real feedback from clients who partner with us.</p>
  <div class="grid2">
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_1_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_1_NAME}}</div></div>
    <div class="testi"><div class="testi-quote">{{TESTIMONIAL_2_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_2_NAME}}</div></div>
  </div>
</div></section>

<section class="sec" id="how-it-works"><div class="c">
  <div class="sec-tag">Process</div>
  <h2>{{PROCESS_HEADLINE}}</h2>
  <p class="sec-lead">{{PROCESS_INTRO}}</p>
  <div class="steps">
    <div class="step"><div class="step-num">01</div><div class="step-title">{{STEP_1_TITLE}}</div><div class="step-body">{{STEP_1_TEXT}}</div></div>
    <div class="step"><div class="step-num">02</div><div class="step-title">{{STEP_2_TITLE}}</div><div class="step-body">{{STEP_2_TEXT}}</div></div>
    <div class="step"><div class="step-num">03</div><div class="step-title">{{STEP_3_TITLE}}</div><div class="step-body">{{STEP_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="areas"><div class="c">
  <div class="sec-tag">Where we work</div>
  <h2>Operating in {{LOCATION}} and beyond</h2>
  <p class="sec-lead">We serve clients in {{LOCATION}} and the surrounding region with our {{SERVICE}} expertise.</p>
  <div class="area-chips">
    <span class="area-chip">{{AREA_1}}</span><span class="area-chip">{{AREA_2}}</span><span class="area-chip">{{AREA_3}}</span>
    <span class="area-chip">{{AREA_4}}</span><span class="area-chip">{{AREA_5}}</span><span class="area-chip">{{AREA_6}}</span>
  </div>
</div></section>

<section class="sec" id="faq"><div class="c">
  <div class="sec-tag">FAQ</div>
  <h2>{{FAQ_HEADLINE}}</h2>
  <div class="faq-list">
    <details class="faq-item"><summary>{{FAQ_1_Q}}</summary><div class="faq-answer">{{FAQ_1_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_2_Q}}</summary><div class="faq-answer">{{FAQ_2_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_3_Q}}</summary><div class="faq-answer">{{FAQ_3_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_4_Q}}</summary><div class="faq-answer">{{FAQ_4_A}}</div></details>
  </div>
</div></section>

<section class="cta-band" id="contact"><div class="c">
  <h2>{{CTA_HEADLINE}}</h2>
  <p>{{CTA_SUBTEXT}}</p>
  <a href="tel:+1-555-000-0000" class="btn-dark">Get started today</a>
</div></section>

<footer><div class="c"><div class="foot">
  <span>{{KEYWORD}} | {{LOCATION}}</span>
  <span>&copy; 2024 {{KEYWORD}}.</span>
</div></div></footer>
</body></html>`
  },

  // ── T16: Prestige ── Premium ───────────────────────────────────────────────
  {
    id: 'starter-16',
    name: 'Prestige',
    category: 'Premium',
    structure: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{KEYWORD}} | {{LOCATION}}</title>
<meta name="description" content="{{META_DESCRIPTION}}">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', system-ui, sans-serif; background: #f5f0e8; color: #1a1a14; -webkit-font-smoothing: antialiased; line-height: 1.6; }
a { text-decoration: none; color: inherit; }
.c { max-width: 1060px; margin: 0 auto; padding: 0 36px; }
h1, h2, h3 { font-family: 'Cormorant Garamond', Georgia, serif; }
nav { background: #f5f0e8; padding: 28px 0; border-bottom: 1px solid #d6c9b0; }
.nav-row { display: flex; justify-content: space-between; align-items: center; }
.logo { font-family: 'Cormorant Garamond', serif; font-size: 1.375rem; font-weight: 700; color: #1a1a14; letter-spacing: .03em; }
.nav-btn { border: 1px solid #9b8b5e; color: #9b8b5e; padding: 9px 22px; font-size: .8125rem; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; }
.hero { padding: 96px 0 80px; border-bottom: 1px solid #d6c9b0; }
.hero-rule { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
.hero-line { flex: 1; height: 1px; background: #d6c9b0; max-width: 48px; }
.hero-ornament { font-size: .6875rem; letter-spacing: .22em; text-transform: uppercase; color: #9b8b5e; white-space: nowrap; }
.hero h1 { font-size: clamp(3rem, 6.5vw, 5.5rem); font-weight: 600; line-height: 1.08; color: #1a1a14; margin-bottom: 24px; max-width: 840px; }
.hero p { font-size: 1.0625rem; color: #6b6453; max-width: 520px; line-height: 1.85; margin-bottom: 44px; font-weight: 300; }
.btn-row { display: flex; gap: 20px; flex-wrap: wrap; align-items: center; }
.btn-bronze { background: #9b8b5e; color: #f5f0e8; padding: 13px 36px; font-size: .875rem; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; display: inline-block; }
.btn-ghost { border: 1px solid #c4b89a; color: #6b6453; padding: 12px 32px; font-size: .875rem; font-weight: 400; letter-spacing: .06em; text-transform: uppercase; display: inline-block; }
.sec { padding: 80px 0; border-top: 1px solid #d6c9b0; }
.sec-ornament { font-size: .6875rem; letter-spacing: .22em; text-transform: uppercase; color: #9b8b5e; margin-bottom: 16px; }
.sec h2 { font-size: clamp(2rem, 4vw, 3.25rem); font-weight: 600; color: #1a1a14; margin-bottom: 16px; }
.sec-lead { font-size: .9375rem; color: #6b6453; max-width: 520px; line-height: 1.85; margin-bottom: 56px; font-weight: 300; }
.grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1px; background: #d6c9b0; }
.card { background: #f5f0e8; padding: 36px 28px; }
.card-marker { width: 20px; height: 1px; background: #9b8b5e; margin-bottom: 22px; }
.card-title { font-family: 'Cormorant Garamond', serif; font-size: 1.1875rem; font-weight: 600; color: #1a1a14; margin-bottom: 12px; }
.card-body { font-size: .875rem; color: #7a705a; line-height: 1.8; font-weight: 300; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1px; background: #d6c9b0; }
.testi { background: #f5f0e8; padding: 36px; }
.testi-mark { font-family: 'Cormorant Garamond', serif; font-size: 3.5rem; color: #9b8b5e; line-height: 1; margin-bottom: 16px; }
.testi-quote { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 1.125rem; color: #2d2b1e; line-height: 1.7; margin-bottom: 20px; }
.testi-name { font-size: .8125rem; font-weight: 500; color: #9b8b5e; letter-spacing: .08em; text-transform: uppercase; }
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1px; background: #d6c9b0; }
.step { background: #f5f0e8; padding: 32px 28px; }
.step-num { font-family: 'Cormorant Garamond', serif; font-size: 2.25rem; font-weight: 600; color: #9b8b5e; line-height: 1; margin-bottom: 16px; }
.step-title { font-family: 'Cormorant Garamond', serif; font-size: 1.125rem; font-weight: 600; color: #1a1a14; margin-bottom: 10px; }
.step-body { font-size: .875rem; color: #7a705a; line-height: 1.8; font-weight: 300; }
.area-chips { display: flex; flex-wrap: wrap; gap: 10px; }
.area-chip { padding: 8px 20px; border: 1px solid #c4b89a; color: #6b6453; font-size: .8125rem; font-weight: 400; letter-spacing: .04em; }
.faq-list { display: flex; flex-direction: column; }
.faq-item { border-bottom: 1px solid #d6c9b0; }
.faq-item:first-child { border-top: 1px solid #d6c9b0; }
.faq-item summary { padding: 20px 0; font-family: 'Cormorant Garamond', serif; font-size: 1.0625rem; font-weight: 600; color: #1a1a14; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; letter-spacing: .02em; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-family: 'Inter', sans-serif; font-size: 1.25rem; color: #9b8b5e; flex-shrink: 0; }
.faq-item[open] summary::after { content: '−'; }
.faq-answer { padding: 0 0 20px; font-size: .875rem; color: #7a705a; line-height: 1.85; font-weight: 300; }
.cta-band { background: #1a1a14; padding: 96px 0; border-top: 1px solid #d6c9b0; }
.cta-band h2 { font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 600; color: #f5f0e8; margin-bottom: 18px; max-width: 680px; }
.cta-band p { font-size: 1rem; color: #7a705a; margin-bottom: 40px; font-weight: 300; }
.btn-bronze-lg { background: #9b8b5e; color: #1a1a14; padding: 15px 44px; font-size: .875rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; display: inline-block; }
footer { background: #f5f0e8; padding: 36px 0; border-top: 1px solid #d6c9b0; }
.foot { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.foot-text { font-size: .8125rem; color: #a89880; letter-spacing: .04em; }
</style>
</head>
<body>
<nav><div class="c"><div class="nav-row">
  <div class="logo">{{KEYWORD}}</div>
  <a href="#contact" class="nav-btn">Enquire</a>
</div></div></nav>

<section class="hero"><div class="c">
  <div class="hero-rule"><div class="hero-line"></div><div class="hero-ornament">{{SERVICE}} | {{LOCATION}}</div><div class="hero-line"></div></div>
  <h1>{{HERO_HEADLINE}}</h1>
  <p>{{HERO_SUBHEADLINE}}</p>
  <div class="btn-row">
    <a href="#contact" class="btn-bronze">Book a consultation</a>
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
  <p class="sec-lead">A selection of testimonials from those we have had the privilege to serve.</p>
  <div class="grid2">
    <div class="testi"><div class="testi-mark">"</div><div class="testi-quote">{{TESTIMONIAL_1_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_1_NAME}}, {{LOCATION}}</div></div>
    <div class="testi"><div class="testi-mark">"</div><div class="testi-quote">{{TESTIMONIAL_2_QUOTE}}</div><div class="testi-name">{{TESTIMONIAL_2_NAME}}, {{LOCATION}}</div></div>
  </div>
</div></section>

<section class="sec" id="how-it-works"><div class="c">
  <div class="sec-ornament">How it works</div>
  <h2>{{PROCESS_HEADLINE}}</h2>
  <p class="sec-lead">{{PROCESS_INTRO}}</p>
  <div class="steps">
    <div class="step"><div class="step-num">I</div><div class="step-title">{{STEP_1_TITLE}}</div><div class="step-body">{{STEP_1_TEXT}}</div></div>
    <div class="step"><div class="step-num">II</div><div class="step-title">{{STEP_2_TITLE}}</div><div class="step-body">{{STEP_2_TEXT}}</div></div>
    <div class="step"><div class="step-num">III</div><div class="step-title">{{STEP_3_TITLE}}</div><div class="step-body">{{STEP_3_TEXT}}</div></div>
  </div>
</div></section>

<section class="sec" id="areas"><div class="c">
  <div class="sec-ornament">Where we serve</div>
  <h2>Available throughout {{LOCATION}}</h2>
  <p class="sec-lead">Our {{SERVICE}} services extend across {{LOCATION}} and surrounding areas.</p>
  <div class="area-chips">
    <span class="area-chip">{{AREA_1}}</span><span class="area-chip">{{AREA_2}}</span><span class="area-chip">{{AREA_3}}</span>
    <span class="area-chip">{{AREA_4}}</span><span class="area-chip">{{AREA_5}}</span><span class="area-chip">{{AREA_6}}</span>
  </div>
</div></section>

<section class="sec" id="faq"><div class="c">
  <div class="sec-ornament">Questions</div>
  <h2>{{FAQ_HEADLINE}}</h2>
  <div class="faq-list">
    <details class="faq-item"><summary>{{FAQ_1_Q}}</summary><div class="faq-answer">{{FAQ_1_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_2_Q}}</summary><div class="faq-answer">{{FAQ_2_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_3_Q}}</summary><div class="faq-answer">{{FAQ_3_A}}</div></details>
    <details class="faq-item"><summary>{{FAQ_4_Q}}</summary><div class="faq-answer">{{FAQ_4_A}}</div></details>
  </div>
</div></section>

<section class="cta-band" id="contact"><div class="c">
  <h2>{{CTA_HEADLINE}}</h2>
  <p>{{CTA_SUBTEXT}}</p>
  <a href="tel:+1-555-000-0000" class="btn-bronze-lg">Call us today</a>
</div></section>

<footer><div class="c"><div class="foot">
  <span class="foot-text">{{KEYWORD}} | {{LOCATION}}</span>
  <span class="foot-text">&copy; 2024 {{KEYWORD}}. All rights reserved.</span>
</div></div></footer>
</body></html>`
  },
  // ── Blog Templates ──────────────────────────────────────────────────────────────────
  {
    id: 'starter-17',
    name: 'Comparison Article',
    category: 'Blog',
    structure: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{POST_TITLE}}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;color:#374151;background:#fff;line-height:1.7;-webkit-font-smoothing:antialiased}
a{color:#2563eb;text-decoration:none}
a:hover{text-decoration:underline}
img{display:block;max-width:100%}
.wrap{max-width:740px;margin:0 auto;padding:0 28px}
nav{border-bottom:1px solid #e5e7eb;height:54px;display:flex;align-items:center;position:sticky;top:0;background:#fff;z-index:100}
.nav-in{display:flex;justify-content:space-between;align-items:center;width:100%}
.nav-logo{font-weight:800;font-size:16px;color:#111;text-decoration:none}
.nav-btn{background:#111;color:#fff;padding:7px 16px;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none}
.nav-btn:hover{background:#374151;text-decoration:none}
.post-header{padding:40px 0 32px;border-bottom:1px solid #e5e7eb;margin-bottom:36px}
.cat-tag{display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9ca3af;margin-bottom:14px}
h1{font-size:clamp(28px,4vw,40px);font-weight:800;line-height:1.2;color:#111;margin-bottom:16px}
.meta{display:flex;gap:10px;flex-wrap:wrap;font-size:13px;color:#9ca3af}
.meta strong{color:#6b7280}
.meta .sep{color:#d1d5db}
h2{font-size:22px;font-weight:700;color:#111;margin:44px 0 14px;padding-top:14px;border-top:1px solid #e5e7eb}
h3{font-size:17px;font-weight:600;color:#111;margin:24px 0 10px}
p{margin-bottom:14px;color:#374151;font-size:16px}
ul,ol{margin:10px 0 16px 22px}
li{margin-bottom:7px;font-size:15px;color:#374151}
.takeaways{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px 24px;margin:0 0 36px}
.box-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;margin-bottom:12px}
.takeaways ul{margin:0 0 0 18px}
.takeaways li{font-size:15px;color:#374151;margin-bottom:7px}
.toc-box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px 24px;margin:0 0 44px}
.toc-box ol{margin:0 0 0 18px}
.toc-box li{margin-bottom:6px;font-size:14px;color:#6b7280}
.toc-box a{color:#2563eb}
.tbl-wrap{overflow-x:auto;margin:16px 0 28px}
table{width:100%;border-collapse:collapse;font-size:14px}
th{background:#f9fafb;padding:10px 14px;text-align:left;font-weight:600;color:#111;border:1px solid #e5e7eb;font-size:13px}
td{padding:10px 14px;border:1px solid #e5e7eb;color:#374151;vertical-align:top}
tr:nth-child(even) td{background:#fafafa}
.ck{color:#16a34a;font-weight:700;text-align:center}
.cx{color:#dc2626;text-align:center}
.author-box{display:flex;gap:16px;align-items:flex-start;border-top:1px solid #e5e7eb;padding-top:32px;margin:48px 0 32px}
.author-av{width:48px;height:48px;border-radius:50%;background:#e5e7eb;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;color:#6b7280}
.author-name{font-weight:700;font-size:15px;color:#111;margin-bottom:2px}
.author-role{font-size:12px;color:#9ca3af;margin-bottom:6px}
.author-bio{font-size:13px;color:#6b7280;line-height:1.6;margin:0}
.faq-item{border-bottom:1px solid #e5e7eb}
.faq-item:first-of-type{border-top:1px solid #e5e7eb}
details summary{padding:14px 0;font-size:15px;font-weight:600;cursor:pointer;color:#111;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:12px}
details summary::-webkit-details-marker{display:none}
details summary::after{content:'+';font-size:20px;color:#9ca3af;flex-shrink:0;line-height:1}
details[open] summary::after{content:'−'}
.faq-ans{padding-bottom:16px;font-size:14px;color:#6b7280;line-height:1.65;margin:0}
.sources{margin:12px 0 0 20px}
.sources li{font-size:13px;color:#9ca3af;margin-bottom:6px}
footer{border-top:1px solid #e5e7eb;padding:24px 0;margin-top:16px}
.foot-in{display:flex;justify-content:space-between;align-items:center;font-size:13px;color:#9ca3af}
.pc{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0 28px}
.pc-col h4{font-size:14px;font-weight:700;color:#111;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #e5e7eb}
.pc-col ul{margin-left:18px}
.pc-col li{font-size:14px;margin-bottom:5px}
.verdict-box{background:#111;color:#fff;border-radius:8px;padding:24px 28px;margin:28px 0}
.verdict-box h3{font-size:18px;font-weight:700;color:#fff;margin-bottom:10px}
.verdict-box p{color:#d1d5db;font-size:15px;margin:0}
</style>
</head>
<body>

<nav><div class="wrap"><div class="nav-in">
  <a class="nav-logo" href="#">{{SITE_NAME}}</a>
  <a class="nav-btn" href="#">{{CTA_PRIMARY}}</a>
</div></div></nav>

<div class="wrap">
  <div class="post-header">
    <div class="cat-tag">{{POST_CATEGORY}}</div>
    <h1>{{POST_TITLE}}</h1>
    <div class="meta">
      <span>By <strong>{{AUTHOR_NAME}}</strong></span>
      <span class="sep">&#183;</span>
      <span>{{PUBLISH_DATE}}</span>
      <span class="sep">&#183;</span>
      <span>{{READ_TIME}} min read</span>
      <span class="sep">&#183;</span>
      <span>Updated {{UPDATED_DATE}}</span>
    </div>
  </div>

  <div class="takeaways">
    <div class="box-label">Key Takeaways</div>
    <ul>
      <li>{{TLDR_1}}</li>
      <li>{{TLDR_2}}</li>
      <li>{{TLDR_3}}</li>
      <li>{{TLDR_4}}</li>
    </ul>
  </div>

  <div class="toc-box">
    <div class="box-label">In This Article</div>
    <ol>
      <li><a href="#overview">{{OPTION_A}} vs {{OPTION_B}}: Overview</a></li>
      <li><a href="#features">Feature Comparison</a></li>
      <li><a href="#pricing">Pricing</a></li>
      <li><a href="#procons">Pros and Cons</a></li>
      <li><a href="#verdict">Final Verdict</a></li>
      <li><a href="#faq">FAQ</a></li>
    </ol>
  </div>

  <p>{{POST_INTRO}}</p>
  <p>{{POST_INTRO_2}}</p>

  <h2 id="overview">{{OPTION_A}} vs {{OPTION_B}}: Overview</h2>
  <p>{{SECTION_1_BODY}}</p>

  <h3>{{OPTION_A}}</h3>
  <p>{{SECTION_A_DETAIL}}</p>
  <ul>
    <li>{{FEATURE_1}}</li>
    <li>{{FEATURE_2}}</li>
    <li>{{FEATURE_3}}</li>
  </ul>

  <h3>{{OPTION_B}}</h3>
  <p>{{SECTION_B_DETAIL}}</p>
  <ul>
    <li>{{FEATURE_4}}</li>
    <li>{{FEATURE_5}}</li>
    <li>{{FEATURE_6}}</li>
  </ul>

  <h2 id="features">Feature Comparison</h2>
  <div class="tbl-wrap"><table>
    <thead><tr><th>Feature</th><th>{{OPTION_A}}</th><th>{{OPTION_B}}</th></tr></thead>
    <tbody>
      <tr><td>{{COMPARE_1}}</td><td class="ck">&#10003;</td><td class="cx">&#10007;</td></tr>
      <tr><td>{{COMPARE_2}}</td><td class="ck">&#10003;</td><td class="ck">&#10003;</td></tr>
      <tr><td>{{COMPARE_3}}</td><td class="cx">&#10007;</td><td class="ck">&#10003;</td></tr>
      <tr><td>{{COMPARE_4}}</td><td class="ck">&#10003;</td><td class="ck">&#10003;</td></tr>
      <tr><td>{{COMPARE_5}}</td><td class="cx">&#10007;</td><td class="ck">&#10003;</td></tr>
      <tr><td>{{COMPARE_6}}</td><td class="ck">&#10003;</td><td class="cx">&#10007;</td></tr>
      <tr><td>{{COMPARE_7}}</td><td class="ck">&#10003;</td><td class="ck">&#10003;</td></tr>
      <tr><td>{{COMPARE_8}}</td><td class="cx">&#10007;</td><td class="ck">&#10003;</td></tr>
    </tbody>
  </table></div>

  <h2 id="pricing">Pricing</h2>
  <p>{{PRICING_INTRO}}</p>
  <div class="tbl-wrap"><table>
    <thead><tr><th>Plan</th><th>{{OPTION_A}}</th><th>{{OPTION_B}}</th></tr></thead>
    <tbody>
      <tr><td>Free</td><td>{{PRICE_A_FREE}}</td><td>{{PRICE_B_FREE}}</td></tr>
      <tr><td>Pro</td><td>{{PRICE_A_PAID}}</td><td>{{PRICE_B_PAID}}</td></tr>
    </tbody>
  </table></div>

  <h2 id="procons">Pros and Cons</h2>
  <div class="pc">
    <div class="pc-col">
      <h4>{{OPTION_A}}</h4>
      <ul>
        <li>&#10003;&nbsp;{{PRO_A1}}</li>
        <li>&#10003;&nbsp;{{PRO_A2}}</li>
        <li>&#10003;&nbsp;{{PRO_A3}}</li>
        <li style="color:#dc2626">&#10007;&nbsp;{{CON_A1}}</li>
        <li style="color:#dc2626">&#10007;&nbsp;{{CON_A2}}</li>
      </ul>
    </div>
    <div class="pc-col">
      <h4>{{OPTION_B}}</h4>
      <ul>
        <li>&#10003;&nbsp;{{PRO_B1}}</li>
        <li>&#10003;&nbsp;{{PRO_B2}}</li>
        <li>&#10003;&nbsp;{{PRO_B3}}</li>
        <li style="color:#dc2626">&#10007;&nbsp;{{CON_B1}}</li>
        <li style="color:#dc2626">&#10007;&nbsp;{{CON_B2}}</li>
      </ul>
    </div>
  </div>

  <h2 id="verdict">Final Verdict</h2>
  <p>{{VERDICT_INTRO}}</p>
  <div class="verdict-box">
    <h3>{{VERDICT_TITLE}}</h3>
    <p>{{VERDICT_BODY}}</p>
  </div>

  <div class="author-box">
    <div class="author-av">{{AUTHOR_INITIAL}}</div>
    <div>
      <div class="author-name">{{AUTHOR_NAME}}</div>
      <div class="author-role">{{AUTHOR_TITLE}}</div>
      <p class="author-bio">{{AUTHOR_BIO}}</p>
    </div>
  </div>

  <h2 id="faq">{{FAQ_HEADLINE}}</h2>
  <div class="faq-item"><details><summary>{{FAQ_1_Q}}</summary><p class="faq-ans">{{FAQ_1_A}}</p></details></div>
  <div class="faq-item"><details><summary>{{FAQ_2_Q}}</summary><p class="faq-ans">{{FAQ_2_A}}</p></details></div>
  <div class="faq-item"><details><summary>{{FAQ_3_Q}}</summary><p class="faq-ans">{{FAQ_3_A}}</p></details></div>
  <div class="faq-item"><details><summary>{{FAQ_4_Q}}</summary><p class="faq-ans">{{FAQ_4_A}}</p></details></div>

  <h2>Sources</h2>
  <ol class="sources">
    <li>{{SOURCE_1}}</li>
    <li>{{SOURCE_2}}</li>
    <li>{{SOURCE_3}}</li>
    <li>{{SOURCE_4}}</li>
  </ol>
</div>

<footer><div class="wrap"><div class="foot-in">
  <span>{{SITE_NAME}}</span>
  <span>&copy; 2025 {{SITE_NAME}}</span>
</div></div></footer>

</body></html>`
  },

  {
    id: 'starter-18',
    name: 'How-To Guide',
    category: 'Blog',
    structure: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{POST_TITLE}}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;color:#374151;background:#fff;line-height:1.7;-webkit-font-smoothing:antialiased}
a{color:#2563eb;text-decoration:none}
a:hover{text-decoration:underline}
img{display:block;max-width:100%}
.wrap{max-width:740px;margin:0 auto;padding:0 28px}
nav{border-bottom:1px solid #e5e7eb;height:54px;display:flex;align-items:center;position:sticky;top:0;background:#fff;z-index:100}
.nav-in{display:flex;justify-content:space-between;align-items:center;width:100%}
.nav-logo{font-weight:800;font-size:16px;color:#111;text-decoration:none}
.nav-btn{background:#111;color:#fff;padding:7px 16px;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none}
.nav-btn:hover{background:#374151;text-decoration:none}
.post-header{padding:40px 0 32px;border-bottom:1px solid #e5e7eb;margin-bottom:36px}
.cat-tag{display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9ca3af;margin-bottom:14px}
h1{font-size:clamp(28px,4vw,40px);font-weight:800;line-height:1.2;color:#111;margin-bottom:16px}
.meta{display:flex;gap:10px;flex-wrap:wrap;font-size:13px;color:#9ca3af}
.meta strong{color:#6b7280}
.meta .sep{color:#d1d5db}
h2{font-size:22px;font-weight:700;color:#111;margin:44px 0 14px;padding-top:14px;border-top:1px solid #e5e7eb}
h3{font-size:17px;font-weight:600;color:#111;margin:24px 0 10px}
p{margin-bottom:14px;color:#374151;font-size:16px}
ul,ol{margin:10px 0 16px 22px}
li{margin-bottom:7px;font-size:15px;color:#374151}
.takeaways{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px 24px;margin:0 0 36px}
.box-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;margin-bottom:12px}
.takeaways ul{margin:0 0 0 18px}
.takeaways li{font-size:15px;color:#374151;margin-bottom:7px}
.toc-box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px 24px;margin:0 0 44px}
.toc-box ol{margin:0 0 0 18px}
.toc-box li{margin-bottom:6px;font-size:14px;color:#6b7280}
.toc-box a{color:#2563eb}
.tbl-wrap{overflow-x:auto;margin:16px 0 28px}
table{width:100%;border-collapse:collapse;font-size:14px}
th{background:#f9fafb;padding:10px 14px;text-align:left;font-weight:600;color:#111;border:1px solid #e5e7eb;font-size:13px}
td{padding:10px 14px;border:1px solid #e5e7eb;color:#374151;vertical-align:top}
tr:nth-child(even) td{background:#fafafa}
.ck{color:#16a34a;font-weight:700;text-align:center}
.cx{color:#dc2626;text-align:center}
.author-box{display:flex;gap:16px;align-items:flex-start;border-top:1px solid #e5e7eb;padding-top:32px;margin:48px 0 32px}
.author-av{width:48px;height:48px;border-radius:50%;background:#e5e7eb;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;color:#6b7280}
.author-name{font-weight:700;font-size:15px;color:#111;margin-bottom:2px}
.author-role{font-size:12px;color:#9ca3af;margin-bottom:6px}
.author-bio{font-size:13px;color:#6b7280;line-height:1.6;margin:0}
.faq-item{border-bottom:1px solid #e5e7eb}
.faq-item:first-of-type{border-top:1px solid #e5e7eb}
details summary{padding:14px 0;font-size:15px;font-weight:600;cursor:pointer;color:#111;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:12px}
details summary::-webkit-details-marker{display:none}
details summary::after{content:'+';font-size:20px;color:#9ca3af;flex-shrink:0;line-height:1}
details[open] summary::after{content:'−'}
.faq-ans{padding-bottom:16px;font-size:14px;color:#6b7280;line-height:1.65;margin:0}
.sources{margin:12px 0 0 20px}
.sources li{font-size:13px;color:#9ca3af;margin-bottom:6px}
footer{border-top:1px solid #e5e7eb;padding:24px 0;margin-top:16px}
.foot-in{display:flex;justify-content:space-between;align-items:center;font-size:13px;color:#9ca3af}
.stats-row{display:flex;gap:24px;flex-wrap:wrap;margin:0 0 36px;padding:0 0 32px;border-bottom:1px solid #e5e7eb}
.stat{display:flex;flex-direction:column;gap:2px}
.stat-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af}
.stat-val{font-size:15px;font-weight:600;color:#111}
.prereq-list{margin:0 0 0 20px}
.prereq-list li{font-size:15px;color:#374151;margin-bottom:7px}
.step-block{margin-bottom:40px;padding-bottom:40px;border-bottom:1px solid #e5e7eb}
.step-block:last-of-type{border-bottom:none}
.step-num{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:#111;color:#fff;font-size:14px;font-weight:700;margin-bottom:12px}
.callout{border-left:3px solid #e5e7eb;padding:12px 16px;margin:14px 0;background:#f9fafb;border-radius:0 6px 6px 0}
.callout.tip{border-color:#16a34a}
.callout.warn{border-color:#dc2626}
.callout.note{border-color:#2563eb}
.callout-lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;margin-bottom:5px}
.callout.tip .callout-lbl{color:#16a34a}
.callout.warn .callout-lbl{color:#dc2626}
.callout.note .callout-lbl{color:#2563eb}
.callout p{margin:0;font-size:14px;color:#374151}
.code-block{background:#1a1a2e;border-radius:8px;padding:16px 20px;margin:14px 0;overflow-x:auto}
.code-block code{font-family:'Courier New',Consolas,monospace;font-size:13px;color:#a6e3a1;line-height:1.65;white-space:pre;display:block}
.trouble-item{margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #f3f4f6}
.trouble-item:last-child{border:none;padding:0;margin:0}
.trouble-q{font-weight:600;font-size:15px;color:#111;margin-bottom:6px}
.trouble-a{font-size:14px;color:#6b7280}
</style>
</head>
<body>

<nav><div class="wrap"><div class="nav-in">
  <a class="nav-logo" href="#">{{SITE_NAME}}</a>
  <a class="nav-btn" href="#">{{CTA_PRIMARY}}</a>
</div></div></nav>

<div class="wrap">
  <div class="post-header">
    <div class="cat-tag">{{POST_CATEGORY}}</div>
    <h1>{{POST_TITLE}}</h1>
    <div class="meta">
      <span>By <strong>{{AUTHOR_NAME}}</strong></span>
      <span class="sep">&#183;</span>
      <span>{{PUBLISH_DATE}}</span>
      <span class="sep">&#183;</span>
      <span>{{READ_TIME}} min read</span>
      <span class="sep">&#183;</span>
      <span>Updated {{UPDATED_DATE}}</span>
    </div>
  </div>

  <div class="stats-row">
    <div class="stat"><span class="stat-label">Time Required</span><span class="stat-val">{{EST_TIME}}</span></div>
    <div class="stat"><span class="stat-label">Difficulty</span><span class="stat-val">{{DIFFICULTY}}</span></div>
    <div class="stat"><span class="stat-label">Steps</span><span class="stat-val">{{STEP_COUNT}}</span></div>
  </div>

  <div class="takeaways">
    <div class="box-label">What You&rsquo;ll Learn</div>
    <ul>
      <li>{{TLDR_1}}</li>
      <li>{{TLDR_2}}</li>
      <li>{{TLDR_3}}</li>
      <li>{{TLDR_4}}</li>
    </ul>
  </div>

  <div class="toc-box">
    <div class="box-label">In This Guide</div>
    <ol>
      <li><a href="#prereqs">Prerequisites</a></li>
      <li><a href="#step-1">{{STEP_1_TITLE}}</a></li>
      <li><a href="#step-2">{{STEP_2_TITLE}}</a></li>
      <li><a href="#step-3">{{STEP_3_TITLE}}</a></li>
      <li><a href="#step-4">{{STEP_4_TITLE}}</a></li>
      <li><a href="#step-5">{{STEP_5_TITLE}}</a></li>
      <li><a href="#troubleshoot">Troubleshooting</a></li>
      <li><a href="#faq">FAQ</a></li>
    </ol>
  </div>

  <p>{{POST_INTRO}}</p>

  <h2 id="prereqs">Prerequisites</h2>
  <p>Before you begin, make sure you have the following:</p>
  <ul class="prereq-list">
    <li>{{PREREQ_1}}</li>
    <li>{{PREREQ_2}}</li>
    <li>{{PREREQ_3}}</li>
    <li>{{PREREQ_4}}</li>
  </ul>

  <h2>Steps</h2>

  <div class="step-block" id="step-1">
    <div class="step-num">1</div>
    <h3>{{STEP_1_TITLE}}</h3>
    <p>{{STEP_1_BODY}}</p>
    <ul><li>{{STEP_1_BULLET_1}}</li><li>{{STEP_1_BULLET_2}}</li><li>{{STEP_1_BULLET_3}}</li></ul>
    <div class="callout tip"><div class="callout-lbl">Tip</div><p>{{STEP_1_TIP}}</p></div>
  </div>

  <div class="step-block" id="step-2">
    <div class="step-num">2</div>
    <h3>{{STEP_2_TITLE}}</h3>
    <p>{{STEP_2_BODY}}</p>
    <div class="code-block"><code>{{STEP_2_CODE}}</code></div>
    <div class="callout note"><div class="callout-lbl">Note</div><p>{{STEP_2_NOTE}}</p></div>
  </div>

  <div class="step-block" id="step-3">
    <div class="step-num">3</div>
    <h3>{{STEP_3_TITLE}}</h3>
    <p>{{STEP_3_BODY}}</p>
    <ul><li>{{STEP_3_BULLET_1}}</li><li>{{STEP_3_BULLET_2}}</li><li>{{STEP_3_BULLET_3}}</li></ul>
    <div class="callout warn"><div class="callout-lbl">Warning</div><p>{{STEP_3_WARNING}}</p></div>
  </div>

  <div class="step-block" id="step-4">
    <div class="step-num">4</div>
    <h3>{{STEP_4_TITLE}}</h3>
    <p>{{STEP_4_BODY}}</p>
    <div class="code-block"><code>{{STEP_4_CODE}}</code></div>
    <div class="callout tip"><div class="callout-lbl">Tip</div><p>{{STEP_4_TIP}}</p></div>
  </div>

  <div class="step-block" id="step-5">
    <div class="step-num">5</div>
    <h3>{{STEP_5_TITLE}}</h3>
    <p>{{STEP_5_BODY}}</p>
    <ul><li>{{STEP_5_BULLET_1}}</li><li>{{STEP_5_BULLET_2}}</li></ul>
  </div>

  <h2 id="troubleshoot">Troubleshooting</h2>
  <div class="trouble-item"><div class="trouble-q">{{TROUBLE_1_Q}}</div><div class="trouble-a">{{TROUBLE_1_A}}</div></div>
  <div class="trouble-item"><div class="trouble-q">{{TROUBLE_2_Q}}</div><div class="trouble-a">{{TROUBLE_2_A}}</div></div>
  <div class="trouble-item"><div class="trouble-q">{{TROUBLE_3_Q}}</div><div class="trouble-a">{{TROUBLE_3_A}}</div></div>

  <div class="author-box">
    <div class="author-av">{{AUTHOR_INITIAL}}</div>
    <div>
      <div class="author-name">{{AUTHOR_NAME}}</div>
      <div class="author-role">{{AUTHOR_TITLE}}</div>
      <p class="author-bio">{{AUTHOR_BIO}}</p>
    </div>
  </div>

  <h2 id="faq">{{FAQ_HEADLINE}}</h2>
  <div class="faq-item"><details><summary>{{FAQ_1_Q}}</summary><p class="faq-ans">{{FAQ_1_A}}</p></details></div>
  <div class="faq-item"><details><summary>{{FAQ_2_Q}}</summary><p class="faq-ans">{{FAQ_2_A}}</p></details></div>
  <div class="faq-item"><details><summary>{{FAQ_3_Q}}</summary><p class="faq-ans">{{FAQ_3_A}}</p></details></div>
  <div class="faq-item"><details><summary>{{FAQ_4_Q}}</summary><p class="faq-ans">{{FAQ_4_A}}</p></details></div>

  <h2>Sources</h2>
  <ol class="sources">
    <li>{{SOURCE_1}}</li>
    <li>{{SOURCE_2}}</li>
    <li>{{SOURCE_3}}</li>
    <li>{{SOURCE_4}}</li>
  </ol>
</div>

<footer><div class="wrap"><div class="foot-in">
  <span>{{SITE_NAME}}</span>
  <span>&copy; 2025 {{SITE_NAME}}</span>
</div></div></footer>

</body></html>`
  },

  {
    id: 'starter-19',
    name: 'Listicle',
    category: 'Blog',
    structure: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{POST_TITLE}}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;color:#374151;background:#fff;line-height:1.7;-webkit-font-smoothing:antialiased}
a{color:#2563eb;text-decoration:none}
a:hover{text-decoration:underline}
img{display:block;max-width:100%}
.wrap{max-width:740px;margin:0 auto;padding:0 28px}
nav{border-bottom:1px solid #e5e7eb;height:54px;display:flex;align-items:center;position:sticky;top:0;background:#fff;z-index:100}
.nav-in{display:flex;justify-content:space-between;align-items:center;width:100%}
.nav-logo{font-weight:800;font-size:16px;color:#111;text-decoration:none}
.nav-btn{background:#111;color:#fff;padding:7px 16px;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none}
.nav-btn:hover{background:#374151;text-decoration:none}
.post-header{padding:40px 0 32px;border-bottom:1px solid #e5e7eb;margin-bottom:36px}
.cat-tag{display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9ca3af;margin-bottom:14px}
h1{font-size:clamp(28px,4vw,40px);font-weight:800;line-height:1.2;color:#111;margin-bottom:16px}
.meta{display:flex;gap:10px;flex-wrap:wrap;font-size:13px;color:#9ca3af}
.meta strong{color:#6b7280}
.meta .sep{color:#d1d5db}
h2{font-size:22px;font-weight:700;color:#111;margin:44px 0 14px;padding-top:14px;border-top:1px solid #e5e7eb}
h3{font-size:17px;font-weight:600;color:#111;margin:24px 0 10px}
p{margin-bottom:14px;color:#374151;font-size:16px}
ul,ol{margin:10px 0 16px 22px}
li{margin-bottom:7px;font-size:15px;color:#374151}
.takeaways{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px 24px;margin:0 0 36px}
.box-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;margin-bottom:12px}
.takeaways ul{margin:0 0 0 18px}
.takeaways li{font-size:15px;color:#374151;margin-bottom:7px}
.toc-box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px 24px;margin:0 0 44px}
.toc-box ol{margin:0 0 0 18px}
.toc-box li{margin-bottom:6px;font-size:14px;color:#6b7280}
.toc-box a{color:#2563eb}
.tbl-wrap{overflow-x:auto;margin:16px 0 28px}
table{width:100%;border-collapse:collapse;font-size:14px}
th{background:#f9fafb;padding:10px 14px;text-align:left;font-weight:600;color:#111;border:1px solid #e5e7eb;font-size:13px}
td{padding:10px 14px;border:1px solid #e5e7eb;color:#374151;vertical-align:top}
tr:nth-child(even) td{background:#fafafa}
.ck{color:#16a34a;font-weight:700;text-align:center}
.cx{color:#dc2626;text-align:center}
.author-box{display:flex;gap:16px;align-items:flex-start;border-top:1px solid #e5e7eb;padding-top:32px;margin:48px 0 32px}
.author-av{width:48px;height:48px;border-radius:50%;background:#e5e7eb;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;color:#6b7280}
.author-name{font-weight:700;font-size:15px;color:#111;margin-bottom:2px}
.author-role{font-size:12px;color:#9ca3af;margin-bottom:6px}
.author-bio{font-size:13px;color:#6b7280;line-height:1.6;margin:0}
.faq-item{border-bottom:1px solid #e5e7eb}
.faq-item:first-of-type{border-top:1px solid #e5e7eb}
details summary{padding:14px 0;font-size:15px;font-weight:600;cursor:pointer;color:#111;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:12px}
details summary::-webkit-details-marker{display:none}
details summary::after{content:'+';font-size:20px;color:#9ca3af;flex-shrink:0;line-height:1}
details[open] summary::after{content:'−'}
.faq-ans{padding-bottom:16px;font-size:14px;color:#6b7280;line-height:1.65;margin:0}
.sources{margin:12px 0 0 20px}
.sources li{font-size:13px;color:#9ca3af;margin-bottom:6px}
footer{border-top:1px solid #e5e7eb;padding:24px 0;margin-top:16px}
.foot-in{display:flex;justify-content:space-between;align-items:center;font-size:13px;color:#9ca3af}
.methodology{font-size:13px;color:#9ca3af;font-style:italic;margin:0 0 36px;padding-left:12px;border-left:3px solid #e5e7eb}
.item-block{margin-bottom:44px;padding-bottom:44px;border-bottom:1px solid #e5e7eb}
.item-block:last-of-type{border-bottom:none}
.item-header{display:flex;align-items:baseline;gap:12px;margin-bottom:12px}
.item-num{font-size:13px;font-weight:700;color:#9ca3af;min-width:24px}
.item-header h2{margin:0;padding:0;border:none;font-size:20px}
.item-badge{display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;background:#f3f4f6;color:#6b7280;padding:2px 8px;border-radius:4px;margin-left:4px;vertical-align:middle}
.item-feats{margin:12px 0 0 0;list-style:none;padding:0;display:flex;flex-direction:column;gap:4px}
.item-feats li{font-size:14px;color:#374151;display:flex;align-items:flex-start;gap:8px}
.item-feats li::before{content:'&#10003;';color:#16a34a;font-weight:700;flex-shrink:0;font-size:13px}
.item-rating{font-size:13px;color:#9ca3af;margin-top:10px}
.item-rating strong{color:#374151}
.choose-section{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:24px 28px;margin:44px 0}
.choose-section h2{border:none;padding:0;margin:0 0 8px;font-size:20px}
.choose-intro{font-size:14px;color:#6b7280;margin-bottom:18px}
.choose-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.choose-card h4{font-size:14px;font-weight:600;color:#111;margin-bottom:4px}
.choose-card p{font-size:13px;color:#6b7280;margin:0}
</style>
</head>
<body>

<nav><div class="wrap"><div class="nav-in">
  <a class="nav-logo" href="#">{{SITE_NAME}}</a>
  <a class="nav-btn" href="#">{{CTA_PRIMARY}}</a>
</div></div></nav>

<div class="wrap">
  <div class="post-header">
    <div class="cat-tag">{{POST_CATEGORY}}</div>
    <h1>{{POST_TITLE}}</h1>
    <div class="meta">
      <span>By <strong>{{AUTHOR_NAME}}</strong></span>
      <span class="sep">&#183;</span>
      <span>{{PUBLISH_DATE}}</span>
      <span class="sep">&#183;</span>
      <span>{{READ_TIME}} min read</span>
      <span class="sep">&#183;</span>
      <span>Updated {{UPDATED_DATE}}</span>
    </div>
  </div>

  <p class="methodology">{{METHODOLOGY_NOTE}}</p>

  <div class="takeaways">
    <div class="box-label">Key Takeaways</div>
    <ul>
      <li>{{TLDR_1}}</li>
      <li>{{TLDR_2}}</li>
      <li>{{TLDR_3}}</li>
      <li>{{TLDR_4}}</li>
    </ul>
  </div>

  <div class="toc-box">
    <div class="box-label">All {{LIST_COUNT}} Picks</div>
    <ol>
      <li><a href="#item-1">{{LIST_1_TITLE}}</a> &mdash; Best Overall</li>
      <li><a href="#item-2">{{LIST_2_TITLE}}</a> &mdash; Best Free Option</li>
      <li><a href="#item-3">{{LIST_3_TITLE}}</a> &mdash; Best for Teams</li>
      <li><a href="#item-4">{{LIST_4_TITLE}}</a> &mdash; Budget Pick</li>
      <li><a href="#item-5">{{LIST_5_TITLE}}</a> &mdash; Runner-Up</li>
      <li><a href="#item-6">{{LIST_6_TITLE}}</a> &mdash; Also Great</li>
    </ol>
  </div>

  <p>{{POST_INTRO}}</p>

  <div class="item-block" id="item-1">
    <div class="item-header">
      <span class="item-num">#1</span>
      <h2>{{LIST_1_TITLE}} <span class="item-badge">Best Overall</span></h2>
    </div>
    <p>{{LIST_1_BODY}}</p>
    <ul class="item-feats">
      <li>{{LIST_1_FEAT_1}}</li>
      <li>{{LIST_1_FEAT_2}}</li>
      <li>{{LIST_1_FEAT_3}}</li>
    </ul>
    <div class="item-rating">Rating: <strong>{{LIST_1_RATING}}/5</strong> &nbsp;&middot;&nbsp; {{LIST_1_REVIEWS}} reviews</div>
  </div>

  <div class="item-block" id="item-2">
    <div class="item-header">
      <span class="item-num">#2</span>
      <h2>{{LIST_2_TITLE}} <span class="item-badge">Best Free</span></h2>
    </div>
    <p>{{LIST_2_BODY}}</p>
    <ul class="item-feats">
      <li>{{LIST_2_FEAT_1}}</li>
      <li>{{LIST_2_FEAT_2}}</li>
      <li>{{LIST_2_FEAT_3}}</li>
    </ul>
    <div class="item-rating">Rating: <strong>{{LIST_2_RATING}}/5</strong> &nbsp;&middot;&nbsp; {{LIST_2_REVIEWS}} reviews</div>
  </div>

  <div class="item-block" id="item-3">
    <div class="item-header">
      <span class="item-num">#3</span>
      <h2>{{LIST_3_TITLE}} <span class="item-badge">Best for Teams</span></h2>
    </div>
    <p>{{LIST_3_BODY}}</p>
    <ul class="item-feats">
      <li>{{LIST_3_FEAT_1}}</li>
      <li>{{LIST_3_FEAT_2}}</li>
      <li>{{LIST_3_FEAT_3}}</li>
    </ul>
    <div class="item-rating">Rating: <strong>{{LIST_3_RATING}}/5</strong> &nbsp;&middot;&nbsp; {{LIST_3_REVIEWS}} reviews</div>
  </div>

  <div class="item-block" id="item-4">
    <div class="item-header">
      <span class="item-num">#4</span>
      <h2>{{LIST_4_TITLE}} <span class="item-badge">Budget Pick</span></h2>
    </div>
    <p>{{LIST_4_BODY}}</p>
    <ul class="item-feats">
      <li>{{LIST_4_FEAT_1}}</li>
      <li>{{LIST_4_FEAT_2}}</li>
      <li>{{LIST_4_FEAT_3}}</li>
    </ul>
    <div class="item-rating">Rating: <strong>{{LIST_4_RATING}}/5</strong> &nbsp;&middot;&nbsp; {{LIST_4_REVIEWS}} reviews</div>
  </div>

  <div class="item-block" id="item-5">
    <div class="item-header">
      <span class="item-num">#5</span>
      <h2>{{LIST_5_TITLE}} <span class="item-badge">Runner-Up</span></h2>
    </div>
    <p>{{LIST_5_BODY}}</p>
    <ul class="item-feats">
      <li>{{LIST_5_FEAT_1}}</li>
      <li>{{LIST_5_FEAT_2}}</li>
      <li>{{LIST_5_FEAT_3}}</li>
    </ul>
    <div class="item-rating">Rating: <strong>{{LIST_5_RATING}}/5</strong> &nbsp;&middot;&nbsp; {{LIST_5_REVIEWS}} reviews</div>
  </div>

  <div class="item-block" id="item-6">
    <div class="item-header">
      <span class="item-num">#6</span>
      <h2>{{LIST_6_TITLE}} <span class="item-badge">Also Great</span></h2>
    </div>
    <p>{{LIST_6_BODY}}</p>
    <ul class="item-feats">
      <li>{{LIST_6_FEAT_1}}</li>
      <li>{{LIST_6_FEAT_2}}</li>
      <li>{{LIST_6_FEAT_3}}</li>
    </ul>
    <div class="item-rating">Rating: <strong>{{LIST_6_RATING}}/5</strong> &nbsp;&middot;&nbsp; {{LIST_6_REVIEWS}} reviews</div>
  </div>

  <div class="choose-section">
    <h2>{{HOW_TO_CHOOSE_TITLE}}</h2>
    <p class="choose-intro">{{HOW_TO_CHOOSE_BODY}}</p>
    <div class="choose-grid">
      <div class="choose-card"><h4>{{CHOOSE_1_TITLE}}</h4><p>{{CHOOSE_1_DESC}}</p></div>
      <div class="choose-card"><h4>{{CHOOSE_2_TITLE}}</h4><p>{{CHOOSE_2_DESC}}</p></div>
      <div class="choose-card"><h4>{{CHOOSE_3_TITLE}}</h4><p>{{CHOOSE_3_DESC}}</p></div>
      <div class="choose-card"><h4>{{CHOOSE_4_TITLE}}</h4><p>{{CHOOSE_4_DESC}}</p></div>
    </div>
  </div>

  <div class="author-box">
    <div class="author-av">{{AUTHOR_INITIAL}}</div>
    <div>
      <div class="author-name">{{AUTHOR_NAME}}</div>
      <div class="author-role">{{AUTHOR_TITLE}}</div>
      <p class="author-bio">{{AUTHOR_BIO}}</p>
    </div>
  </div>

  <h2 id="faq">{{FAQ_HEADLINE}}</h2>
  <div class="faq-item"><details><summary>{{FAQ_1_Q}}</summary><p class="faq-ans">{{FAQ_1_A}}</p></details></div>
  <div class="faq-item"><details><summary>{{FAQ_2_Q}}</summary><p class="faq-ans">{{FAQ_2_A}}</p></details></div>
  <div class="faq-item"><details><summary>{{FAQ_3_Q}}</summary><p class="faq-ans">{{FAQ_3_A}}</p></details></div>
  <div class="faq-item"><details><summary>{{FAQ_4_Q}}</summary><p class="faq-ans">{{FAQ_4_A}}</p></details></div>

  <h2>Sources</h2>
  <ol class="sources">
    <li>{{SOURCE_1}}</li>
    <li>{{SOURCE_2}}</li>
    <li>{{SOURCE_3}}</li>
    <li>{{SOURCE_4}}</li>
  </ol>
</div>

<footer><div class="wrap"><div class="foot-in">
  <span>{{SITE_NAME}}</span>
  <span>&copy; 2025 {{SITE_NAME}}</span>
</div></div></footer>

</body></html>`
  },
];

export default STARTER_TEMPLATES;
