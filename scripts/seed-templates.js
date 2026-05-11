const { createClient } = require('@supabase/supabase-js');

// Run with: node --env-file=.env.local scripts/seed-templates.js <user-uuid>
// Never hardcode keys here — keep them in .env.local (which is gitignored).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  console.error('Run with: node --env-file=.env.local scripts/seed-templates.js <user-uuid>');
  process.exit(1);
}

const USER_ID = process.argv[2] || process.env.SEED_USER_ID;
if (!USER_ID) {
  console.error('Usage: node --env-file=.env.local scripts/seed-templates.js <user-uuid>');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const LOCAL_SERVICE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{{KEYWORD}} - {{LOCATION}}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',-apple-system,sans-serif;line-height:1.7;color:#1e293b;background:#fff;overflow-x:hidden}
.container{max-width:1280px;margin:0 auto;padding:0 32px}
/* NAV */
.nav{background:rgba(255,255,255,.96);backdrop-filter:blur(12px);padding:18px 0;position:sticky;top:0;z-index:100;border-bottom:1px solid #e2e8f0}
.nav-inner{display:flex;justify-content:space-between;align-items:center}
.logo{font-size:1.4rem;font-weight:900;color:#7c3aed}
.nav-links{display:flex;gap:36px;list-style:none}
.nav-links a{color:#475569;text-decoration:none;font-weight:500}
.nav-links a:hover{color:#7c3aed}
.nav-cta{background:#7c3aed;color:#fff;padding:11px 26px;border-radius:8px;font-weight:700;text-decoration:none}
/* HERO */
.hero{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:140px 0 100px;text-align:center}
.hero-inner{max-width:860px;margin:0 auto}
.hero-badge{display:inline-block;background:rgba(255,255,255,.18);padding:8px 22px;border-radius:50px;font-size:.875rem;font-weight:600;margin-bottom:28px;border:1px solid rgba(255,255,255,.3)}
.hero h1{font-size:4.25rem;font-weight:900;margin-bottom:28px;line-height:1.1}
.hero .lead{font-size:1.4rem;margin-bottom:44px;opacity:.95;line-height:1.6}
.btns{display:flex;gap:18px;justify-content:center;flex-wrap:wrap;margin-bottom:48px}
.btn-white{background:#fff;color:#7c3aed;padding:17px 40px;border-radius:12px;font-weight:700;font-size:1.1rem;text-decoration:none;box-shadow:0 16px 50px rgba(0,0,0,.2)}
.btn-ghost{background:rgba(255,255,255,.15);color:#fff;padding:17px 40px;border-radius:12px;font-weight:700;font-size:1.1rem;text-decoration:none;border:2px solid rgba(255,255,255,.7)}
.hero-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;max-width:700px;margin:0 auto;border-top:1px solid rgba(255,255,255,.2);padding-top:40px}
.hs .num{font-size:2.8rem;font-weight:900;display:block;margin-bottom:6px}
.hs .lbl{font-size:.95rem;opacity:.9}
/* TRUST */
.trust{background:#f8fafc;padding:48px 0;border-bottom:1px solid #e2e8f0}
.trust-items{display:flex;justify-content:center;gap:56px;flex-wrap:wrap}
.ti{text-align:center;color:#475569;font-weight:600;font-size:.9rem}
.ti .icon{font-size:1.8rem;display:block;margin-bottom:8px}
/* SECTION BASE */
.section{padding:110px 0}
.sh{text-align:center;margin-bottom:72px}
.sh .lbl{color:#7c3aed;font-weight:700;font-size:.8rem;text-transform:uppercase;letter-spacing:.12em;display:block;margin-bottom:14px}
.sh h2{font-size:3.2rem;font-weight:900;color:#0f172a;line-height:1.15;margin-bottom:20px}
.sh p{font-size:1.2rem;color:#64748b;max-width:640px;margin:0 auto;line-height:1.8}
/* SERVICES */
.svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px}
.svc-card{background:#fff;padding:44px 30px;border-radius:22px;border:2px solid #f1f5f9;transition:all .3s;position:relative;overflow:hidden}
.svc-card::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#7c3aed,#a855f7);opacity:0;transition:opacity .3s}
.svc-card:hover{transform:translateY(-8px);box-shadow:0 24px 60px rgba(124,58,237,.12);border-color:#e9d5ff}
.svc-card:hover::after{opacity:1}
.svc-card .icon{font-size:3.2rem;margin-bottom:20px;display:block}
.svc-card h3{font-size:1.6rem;font-weight:700;margin-bottom:14px;color:#0f172a}
.svc-card p{color:#64748b;line-height:1.7;margin-bottom:20px}
.svc-card .more{color:#7c3aed;font-weight:700;text-decoration:none}
/* PROCESS */
.process{background:linear-gradient(to bottom,#faf5ff,#fff)}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:36px}
.step{text-align:center}
.step-num{width:72px;height:72px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:900;margin:0 auto 20px;box-shadow:0 10px 28px rgba(124,58,237,.3)}
.step h3{font-size:1.4rem;font-weight:700;margin-bottom:10px;color:#0f172a}
.step p{color:#64748b;font-size:.975rem;line-height:1.7}
/* WHY */
.why{background:#0f172a;color:#fff}
.why .sh .lbl{color:#a78bfa}
.why .sh h2{color:#fff}
.why .sh p{color:#94a3b8}
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:36px}
.feat{text-align:center;padding:24px}
.feat-icon{width:70px;height:70px;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:2.2rem;margin:0 auto 20px}
.feat h3{font-size:1.35rem;font-weight:700;margin-bottom:10px}
.feat p{color:#94a3b8;line-height:1.7;font-size:.975rem}
/* AREA */
.area-grid{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center}
.area-text h3{font-size:2rem;font-weight:700;margin-bottom:20px;color:#0f172a}
.area-text p{color:#64748b;font-size:1.1rem;line-height:1.8;margin-bottom:20px}
.locs{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px}
.locs li{padding:10px 0;color:#475569;font-weight:500;display:flex;align-items:center;gap:10px}
.locs li::before{content:'\\2713';color:#7c3aed;font-weight:700;font-size:1.1rem}
.area-map{background:#f8fafc;border:2px dashed #e2e8f0;border-radius:22px;padding:60px;text-align:center}
.area-map .icon{font-size:5rem;margin-bottom:20px;display:block}
/* PRICING */
.pricing{background:#f8fafc}
.price-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;max-width:1050px;margin:0 auto}
.pc{background:#fff;padding:44px 30px;border-radius:22px;border:2px solid #e2e8f0;position:relative;transition:all .3s}
.pc:hover{transform:translateY(-6px);box-shadow:0 20px 50px rgba(0,0,0,.08);border-color:#7c3aed}
.pc.featured{border-color:#7c3aed;box-shadow:0 20px 50px rgba(124,58,237,.18)}
.pc .badge{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#7c3aed;color:#fff;padding:6px 20px;border-radius:50px;font-size:.8rem;font-weight:700;white-space:nowrap}
.pc h3{font-size:1.4rem;font-weight:700;margin-bottom:10px;color:#0f172a}
.pc .price{font-size:3.2rem;font-weight:900;color:#7c3aed;margin-bottom:6px}
.pc .per{color:#64748b;font-size:.95rem;display:block;margin-bottom:28px}
.pc ul{list-style:none;margin-bottom:28px}
.pc li{padding:10px 0;color:#475569;border-bottom:1px solid #f1f5f9;display:flex;gap:10px;align-items:flex-start}
.pc li::before{content:'\\2713';color:#7c3aed;font-weight:700;flex-shrink:0}
.pc .btn{display:block;text-align:center;padding:14px;border-radius:10px;font-weight:700;text-decoration:none}
.pc:not(.featured) .btn{background:#f1f5f9;color:#7c3aed}
.pc.featured .btn{background:#7c3aed;color:#fff}
/* EMERGENCY */
.emergency{background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff;padding:80px 0;text-align:center}
.emergency h2{font-size:2.8rem;font-weight:900;margin-bottom:20px}
.emergency p{font-size:1.2rem;margin-bottom:32px;opacity:.95}
.emrg-btn{display:inline-block;background:#fff;color:#dc2626;padding:18px 48px;border-radius:12px;font-weight:900;font-size:1.2rem;text-decoration:none;box-shadow:0 16px 50px rgba(0,0,0,.25)}
/* TESTIMONIALS */
.testi-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:36px}
.tc{background:#f8fafc;padding:44px;border-radius:22px;border-left:5px solid #7c3aed;position:relative}
.tc .qi{position:absolute;top:20px;right:24px;font-size:3.5rem;color:#e9d5ff;font-family:Georgia,serif;line-height:1}
.tc .stars{color:#fbbf24;font-size:1.4rem;margin-bottom:18px}
.tc p{font-size:1.15rem;line-height:1.8;color:#1e293b;margin-bottom:22px;position:relative;z-index:1}
.tc .author{display:flex;align-items:center;gap:14px}
.tc .av{width:50px;height:50px;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:1.3rem;flex-shrink:0}
.tc .name{font-weight:700;color:#0f172a;display:block;margin-bottom:2px}
.tc .loc{color:#64748b;font-size:.85rem}
/* TEAM */
.team{background:linear-gradient(to bottom,#faf5ff,#fff)}
.team-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:28px}
.tm{text-align:center}
.tm .photo{width:100%;aspect-ratio:1;background:linear-gradient(135deg,#e9d5ff,#ddd6fe);border-radius:16px;margin-bottom:18px;display:flex;align-items:center;justify-content:center;font-size:3.5rem}
.tm h3{font-size:1.2rem;font-weight:700;margin-bottom:6px;color:#0f172a}
.tm .role{color:#7c3aed;font-weight:600;font-size:.9rem;margin-bottom:10px}
.tm p{color:#64748b;font-size:.9rem;line-height:1.6}
/* FAQ */
.faq-list{max-width:860px;margin:0 auto}
.faq-item{background:#f8fafc;padding:30px;border-radius:16px;margin-bottom:18px;border-left:4px solid #7c3aed}
.faq-item h3{font-size:1.3rem;font-weight:700;margin-bottom:12px;color:#0f172a}
.faq-item p{color:#475569;line-height:1.8;font-size:1rem}
/* CERTS */
.certs{background:#f8fafc;padding:72px 0;text-align:center}
.certs h3{margin-bottom:36px;font-size:1.3rem;color:#64748b;font-weight:600}
.cert-row{display:flex;justify-content:center;gap:48px;flex-wrap:wrap}
.cert-badge{width:110px;height:110px;background:#fff;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:2.8rem;box-shadow:0 4px 12px rgba(0,0,0,.06)}
/* CTA */
.cta-final{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:120px 0;text-align:center}
.cta-final h2{font-size:3.25rem;font-weight:900;margin-bottom:20px}
.cta-final p{font-size:1.3rem;margin-bottom:44px;opacity:.95}
.cta-big{display:inline-block;background:#fff;color:#7c3aed;padding:22px 56px;border-radius:12px;font-size:1.3rem;font-weight:900;text-decoration:none;box-shadow:0 18px 55px rgba(0,0,0,.25)}
/* FOOTER */
.footer{background:#0f172a;color:#94a3b8;padding:80px 0 36px}
.ft-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:56px;margin-bottom:56px}
.ft-col h4{color:#fff;font-weight:700;margin-bottom:20px;font-size:1.05rem}
.ft-col p{line-height:1.8;margin-bottom:16px}
.ft-col ul{list-style:none}
.ft-col li{margin-bottom:10px}
.ft-col a{color:#94a3b8;text-decoration:none}
.ft-col a:hover{color:#a78bfa}
.ft-bot{border-top:1px solid #1e293b;padding-top:28px;text-align:center;color:#475569;font-size:.9rem}
@media(max-width:1024px){.steps{grid-template-columns:repeat(2,1fr)}.feat-grid{grid-template-columns:repeat(2,1fr)}.price-grid{grid-template-columns:1fr}.team-grid{grid-template-columns:repeat(2,1fr)}.area-grid{grid-template-columns:1fr}.ft-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:768px){.hero h1{font-size:2.75rem}.sh h2{font-size:2.2rem}.section{padding:80px 0}.nav-links{display:none}.hero-stats{grid-template-columns:1fr;gap:24px}.testi-grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<nav class="nav"><div class="container nav-inner"><div class="logo">{{KEYWORD}}</div><ul class="nav-links"><li><a href="#services">Services</a></li><li><a href="#pricing">Pricing</a></li><li><a href="#reviews">Reviews</a></li><li><a href="#faq">FAQ</a></li></ul><a href="#quote" class="nav-cta">Free Quote</a></div></nav>

<div class="hero"><div class="container"><div class="hero-inner">
<span class="hero-badge">Licensed &amp; Insured &bull; 15+ Years in {{LOCATION}}</span>
<h1>Expert {{SERVICE}}<br/>in {{LOCATION}}</h1>
<p class="lead">Professional {{KEYWORD}} services you can trust &mdash; fast response, upfront pricing, guaranteed satisfaction.</p>
<div class="btns"><a href="#quote" class="btn-white">Get Free Quote</a><a href="tel:5550100" class="btn-ghost">&#128222; (555) 010-0100</a></div>
<div class="hero-stats"><div class="hs"><span class="num">15+</span><span class="lbl">Years Experience</span></div><div class="hs"><span class="num">5,000+</span><span class="lbl">Happy Customers</span></div><div class="hs"><span class="num">24/7</span><span class="lbl">Emergency Service</span></div></div>
</div></div></div>

<div class="trust"><div class="container"><div class="trust-items">
<div class="ti"><span class="icon">&#10003;</span>Licensed &amp; Insured</div>
<div class="ti"><span class="icon">&#11088;</span>BBB A+ Rated</div>
<div class="ti"><span class="icon">&#127942;</span>Award Winning</div>
<div class="ti"><span class="icon">&#128175;</span>Satisfaction Guaranteed</div>
<div class="ti"><span class="icon">&#9200;</span>Same-Day Service</div>
</div></div></div>

<div class="section" id="services"><div class="container">
<div class="sh"><span class="lbl">Our Services</span><h2>Complete {{SERVICE}} Solutions</h2><p>From emergency repairs to full installations, we handle all your {{KEYWORD}} needs with expertise and care in {{LOCATION}}.</p></div>
<div class="svc-grid">
<div class="svc-card"><span class="icon">&#9889;</span><h3>Emergency Service</h3><p>Available 24/7 for urgent {{KEYWORD}} needs. Fast response times throughout {{LOCATION}}.</p><a href="#" class="more">Learn more &rarr;</a></div>
<div class="svc-card"><span class="icon">&#128295;</span><h3>Professional Installations</h3><p>Expert installation services backed by a comprehensive quality guarantee and warranty protection.</p><a href="#" class="more">Learn more &rarr;</a></div>
<div class="svc-card"><span class="icon">&#128296;</span><h3>Repairs &amp; Maintenance</h3><p>Comprehensive repair services and preventive maintenance programs for long-term reliability.</p><a href="#" class="more">Learn more &rarr;</a></div>
<div class="svc-card"><span class="icon">&#10003;</span><h3>Safety Inspections</h3><p>Thorough safety and quality inspections to protect your investment and ensure compliance.</p><a href="#" class="more">Learn more &rarr;</a></div>
<div class="svc-card"><span class="icon">&#128260;</span><h3>System Upgrades</h3><p>Modern upgrades to improve efficiency, performance, and reduce long-term operating costs.</p><a href="#" class="more">Learn more &rarr;</a></div>
<div class="svc-card"><span class="icon">&#128222;</span><h3>24/7 Support</h3><p>Round-the-clock customer support for all your {{KEYWORD}} questions and concerns in {{LOCATION}}.</p><a href="#" class="more">Learn more &rarr;</a></div>
</div>
</div></div>

<div class="section process"><div class="container">
<div class="sh"><span class="lbl">How It Works</span><h2>Simple 4-Step Process</h2><p>Transparent and easy from first contact to project completion.</p></div>
<div class="steps">
<div class="step"><div class="step-num">1</div><h3>Contact Us</h3><p>Call or submit our online form &mdash; we respond within 60 minutes.</p></div>
<div class="step"><div class="step-num">2</div><h3>Free Consultation</h3><p>We assess your {{KEYWORD}} needs and provide upfront, transparent pricing.</p></div>
<div class="step"><div class="step-num">3</div><h3>Expert Service</h3><p>Our certified professionals complete the work to exact specifications.</p></div>
<div class="step"><div class="step-num">4</div><h3>Guaranteed Results</h3><p>We follow up to ensure your complete satisfaction with every job.</p></div>
</div>
</div></div>

<div class="section why"><div class="container">
<div class="sh"><span class="lbl">Why Choose Us</span><h2>The {{LOCATION}} Difference</h2><p>What makes us the most trusted {{KEYWORD}} provider in {{LOCATION}}.</p></div>
<div class="feat-grid">
<div class="feat"><div class="feat-icon">&#127891;</div><h3>Certified Experts</h3><p>Licensed, certified professionals with extensive training and years of experience.</p></div>
<div class="feat"><div class="feat-icon">&#128176;</div><h3>Upfront Pricing</h3><p>Transparent quotes with no hidden fees or surprise charges &mdash; ever.</p></div>
<div class="feat"><div class="feat-icon">&#9889;</div><h3>Fast Response</h3><p>Same-day service available for emergency {{KEYWORD}} situations in {{LOCATION}}.</p></div>
<div class="feat"><div class="feat-icon">&#128737;</div><h3>Satisfaction Guaranteed</h3><p>We stand behind every job with comprehensive warranties and follow-up care.</p></div>
<div class="feat"><div class="feat-icon">&#127942;</div><h3>Award Winning</h3><p>Recognized for outstanding service excellence in the {{LOCATION}} community.</p></div>
<div class="feat"><div class="feat-icon">&#128241;</div><h3>24/7 Availability</h3><p>Always available when you need us &mdash; day, night, weekends, and holidays.</p></div>
</div>
</div></div>

<div class="section"><div class="container">
<div class="area-grid">
<div class="area-text">
<span style="color:#7c3aed;font-weight:700;font-size:.8rem;text-transform:uppercase;letter-spacing:.12em;display:block;margin-bottom:14px">Service Area</span>
<h3>Proudly Serving {{LOCATION}} &amp; Surrounding Areas</h3>
<p>We provide professional {{SERVICE}} throughout {{LOCATION}} and neighboring communities. Our local expertise and fast response make us the preferred choice for both residential and commercial customers.</p>
<ul class="locs"><li>Downtown {{LOCATION}}</li><li>{{LOCATION}} Heights</li><li>West {{LOCATION}}</li><li>East {{LOCATION}}</li><li>North {{LOCATION}}</li><li>South {{LOCATION}}</li></ul>
</div>
<div class="area-map"><span class="icon">&#128506;</span><p style="color:#64748b;font-size:1.1rem">Serving 30+ mile radius from {{LOCATION}}</p><p style="color:#7c3aed;font-weight:600;margin-top:12px">Call to confirm your area</p></div>
</div>
</div></div>

<div class="section pricing" id="pricing"><div class="container">
<div class="sh"><span class="lbl">Pricing</span><h2>Transparent, Competitive Rates</h2><p>Quality {{SERVICE}} at prices that fit your budget &mdash; no hidden fees.</p></div>
<div class="price-grid">
<div class="pc"><h3>Basic Service</h3><div class="price">$79</div><span class="per">Starting Price</span><ul><li>Diagnostic inspection</li><li>Minor repairs included</li><li>Safety check</li><li>90-day warranty</li><li>Same-day available</li></ul><a href="#quote" class="btn">Get Quote</a></div>
<div class="pc featured"><span class="badge">Most Popular</span><h3>Complete Service</h3><div class="price">$199</div><span class="per">Starting Price</span><ul><li>Full system inspection</li><li>All repairs included</li><li>Parts &amp; labor covered</li><li>1-year warranty</li><li>Priority scheduling</li><li>Follow-up service</li></ul><a href="#quote" class="btn">Get Quote</a></div>
<div class="pc"><h3>Premium Plan</h3><div class="price">Custom</div><span class="per">Contact for Pricing</span><ul><li>Complete installation</li><li>Premium equipment</li><li>Extended warranty</li><li>Ongoing maintenance</li><li>VIP support</li><li>Lifetime guarantee</li></ul><a href="#quote" class="btn">Get Quote</a></div>
</div>
</div></div>

<div class="emergency"><div class="container"><h2>Need Emergency {{SERVICE}}?</h2><p>Available 24/7 for urgent situations throughout {{LOCATION}}</p><a href="tel:5550100" class="emrg-btn">Call Emergency Line: (555) 010-0100</a></div></div>

<div class="section" id="reviews"><div class="container">
<div class="sh"><span class="lbl">Reviews</span><h2>What {{LOCATION}} Customers Say</h2><p>Real reviews from real customers in your community.</p></div>
<div class="testi-grid">
<div class="tc"><span class="qi">&ldquo;</span><div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"Outstanding service! They arrived promptly and resolved our {{KEYWORD}} issue quickly and professionally. Highly recommend to anyone in {{LOCATION}}!"</p><div class="author"><div class="av">S</div><cite><span class="name">Sarah Martinez</span><span class="loc">{{LOCATION}} Resident</span></cite></div></div>
<div class="tc"><span class="qi">&ldquo;</span><div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"Fair pricing, quality work, excellent communication. Our go-to for all {{SERVICE}} needs. The team was respectful and professional throughout."</p><div class="author"><div class="av">J</div><cite><span class="name">James Rodriguez</span><span class="loc">{{LOCATION}} Business Owner</span></cite></div></div>
<div class="tc"><span class="qi">&ldquo;</span><div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"Professional, knowledgeable, and respectful of our home. The work was completed on time and exceeded our expectations. Will definitely use again!"</p><div class="author"><div class="av">L</div><cite><span class="name">Lisa Wang</span><span class="loc">{{LOCATION}} Homeowner</span></cite></div></div>
<div class="tc"><span class="qi">&ldquo;</span><div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"Best {{KEYWORD}} service in {{LOCATION}}! Quick response, honest pricing, and they stand behind their work. Five stars all the way &mdash; couldn't be happier."</p><div class="author"><div class="av">M</div><cite><span class="name">Michael Thompson</span><span class="loc">{{LOCATION}} Property Manager</span></cite></div></div>
</div>
</div></div>

<div class="section team"><div class="container">
<div class="sh"><span class="lbl">Our Team</span><h2>Meet the Experts</h2><p>Experienced professionals dedicated to delivering exceptional {{KEYWORD}} service.</p></div>
<div class="team-grid">
<div class="tm"><div class="photo">&#128736;</div><h3>John Smith</h3><div class="role">Lead Technician</div><p>15+ years, Master Certified in {{KEYWORD}}</p></div>
<div class="tm"><div class="photo">&#128188;</div><h3>Mike Johnson</h3><div class="role">Operations Manager</div><p>Ensures quality and customer satisfaction</p></div>
<div class="tm"><div class="photo">&#128293;</div><h3>Sarah Davis</h3><div class="role">Senior Technician</div><p>Specialist in complex {{SERVICE}} installations</p></div>
<div class="tm"><div class="photo">&#128241;</div><h3>Tom Wilson</h3><div class="role">Customer Support</div><p>24/7 support and {{LOCATION}} scheduling</p></div>
</div>
</div></div>

<div class="section" id="faq"><div class="container">
<div class="sh"><span class="lbl">FAQ</span><h2>Frequently Asked Questions</h2><p>Everything you need to know about our {{SERVICE}} services in {{LOCATION}}.</p></div>
<div class="faq-list">
<div class="faq-item"><h3>Do you offer emergency {{SERVICE}}?</h3><p>Yes! We provide 24/7 emergency service throughout {{LOCATION}} and surrounding areas. Call our emergency line anytime for immediate assistance &mdash; typical response is under 2 hours.</p></div>
<div class="faq-item"><h3>Are you licensed and insured?</h3><p>Absolutely. We maintain all required licenses, certifications, and comprehensive insurance coverage to protect you and your property on every job.</p></div>
<div class="faq-item"><h3>What areas do you serve?</h3><p>We serve all of {{LOCATION}} and neighboring communities within a 30-mile radius. Contact us to confirm service availability in your specific area.</p></div>
<div class="faq-item"><h3>Do you provide free estimates?</h3><p>Yes, we offer free, no-obligation quotes for all {{KEYWORD}} projects. We assess your needs and provide transparent, upfront pricing before any work begins.</p></div>
<div class="faq-item"><h3>What is your warranty policy?</h3><p>All our work is backed by comprehensive warranties on both parts and labor. Basic service carries a 90-day warranty; complete service comes with a full 1-year warranty.</p></div>
<div class="faq-item"><h3>How quickly can you respond?</h3><p>For emergencies we typically respond within 1&ndash;2 hours in {{LOCATION}}. For scheduled service, we often have same-day or next-day availability.</p></div>
</div>
</div></div>

<div class="certs"><div class="container"><h3>Licensed &amp; Certified Professionals</h3><div class="cert-row"><div class="cert-badge">&#10003;</div><div class="cert-badge">&#127942;</div><div class="cert-badge">&#11088;</div><div class="cert-badge">&#127891;</div><div class="cert-badge">&#128737;</div></div></div></div>

<div class="cta-final"><div class="container"><h2>Ready for Expert {{KEYWORD}} in {{LOCATION}}?</h2><p>Get your free quote today &mdash; fast response, professional service, guaranteed results.</p><a href="#quote" class="cta-big">Get Your Free Quote Now</a></div></div>

<div class="footer"><div class="container">
<div class="ft-grid">
<div class="ft-col"><h4>{{KEYWORD}}</h4><p>Professional {{SERVICE}} in {{LOCATION}}. Licensed, insured, and dedicated to your satisfaction for over 15 years.</p><p>&#128222; (555) 010-0100<br/>&#128231; contact@example.com<br/>&#128205; {{LOCATION}}, USA</p></div>
<div class="ft-col"><h4>Services</h4><ul><li><a href="#">Emergency Service</a></li><li><a href="#">Installations</a></li><li><a href="#">Repairs</a></li><li><a href="#">Maintenance</a></li><li><a href="#">Inspections</a></li></ul></div>
<div class="ft-col"><h4>Company</h4><ul><li><a href="#">About Us</a></li><li><a href="#">Our Team</a></li><li><a href="#">Reviews</a></li><li><a href="#">Service Area</a></li><li><a href="#">Contact</a></li></ul></div>
<div class="ft-col"><h4>Legal</h4><ul><li><a href="#">Privacy Policy</a></li><li><a href="#">Terms of Service</a></li><li><a href="#">Warranty Info</a></li><li><a href="#">Licenses</a></li></ul></div>
</div>
<div class="ft-bot"><p>&copy; 2025 {{KEYWORD}} {{LOCATION}}. All rights reserved.</p></div>
</div></div>
</body></html>`;

const SAAS = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{{KEYWORD}} - SaaS Platform</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',-apple-system,sans-serif;line-height:1.7;color:#e2e8f0;background:#0a0a12;overflow-x:hidden}
.container{max-width:1280px;margin:0 auto;padding:0 32px}
/* NAV */
.nav{background:rgba(10,10,18,.9);backdrop-filter:blur(16px);padding:18px 0;position:sticky;top:0;z-index:100;border-bottom:1px solid rgba(255,255,255,.08)}
.nav-inner{display:flex;justify-content:space-between;align-items:center}
.logo{font-size:1.4rem;font-weight:900;background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.nav-links{display:flex;gap:36px;list-style:none}
.nav-links a{color:#94a3b8;text-decoration:none;font-weight:500}
.nav-links a:hover{color:#6366f1}
.nav-cta{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:11px 26px;border-radius:8px;font-weight:700;text-decoration:none}
/* HERO */
.hero{padding:150px 0 110px;text-align:center;background:radial-gradient(ellipse at 50% 0%,rgba(99,102,241,.18) 0%,transparent 70%)}
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.3);color:#818cf8;padding:8px 20px;border-radius:50px;font-size:.85rem;font-weight:600;margin-bottom:28px}
.hero h1{font-size:4.5rem;font-weight:900;margin-bottom:24px;line-height:1.08;background:linear-gradient(180deg,#fff 40%,#94a3b8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero .lead{font-size:1.4rem;color:#94a3b8;margin-bottom:44px;max-width:640px;margin-left:auto;margin-right:auto;margin-bottom:44px;line-height:1.7}
.btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:20px}
.btn-primary{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:17px 40px;border-radius:12px;font-weight:700;font-size:1.1rem;text-decoration:none}
.btn-ghost{background:rgba(255,255,255,.06);color:#e2e8f0;padding:17px 40px;border-radius:12px;font-weight:700;font-size:1.1rem;text-decoration:none;border:1px solid rgba(255,255,255,.14)}
.trust-line{color:#64748b;font-size:.9rem}
/* STATS */
.stats-bar{display:flex;justify-content:center;gap:72px;padding:56px 0;border-top:1px solid rgba(255,255,255,.07);border-bottom:1px solid rgba(255,255,255,.07);flex-wrap:wrap;background:rgba(255,255,255,.02)}
.stat .num{font-size:2.6rem;font-weight:900;color:#818cf8;display:block;margin-bottom:6px}
.stat .lbl{font-size:.9rem;color:#64748b}
/* SECTION */
.section{padding:110px 0}
.sh{text-align:center;margin-bottom:72px}
.sh .lbl{color:#6366f1;font-weight:700;font-size:.8rem;text-transform:uppercase;letter-spacing:.12em;display:block;margin-bottom:14px}
.sh h2{font-size:3.2rem;font-weight:900;color:#fff;line-height:1.15;margin-bottom:20px}
.sh p{font-size:1.2rem;color:#94a3b8;max-width:640px;margin:0 auto;line-height:1.8}
/* FEATURES */
.feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}
.feat-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);padding:36px;border-radius:18px;transition:all .3s}
.feat-card:hover{border-color:#6366f1;background:rgba(99,102,241,.08);transform:translateY(-6px)}
.feat-card .icon{font-size:2.8rem;margin-bottom:18px;display:block}
.feat-card h3{font-size:1.35rem;font-weight:700;margin-bottom:12px;color:#fff}
.feat-card p{color:#94a3b8;font-size:.975rem;line-height:1.7}
/* BENEFITS */
.benefits{background:rgba(99,102,241,.05);border-top:1px solid rgba(99,102,241,.12);border-bottom:1px solid rgba(99,102,241,.12)}
.ben-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.ben-text h2{font-size:2.8rem;font-weight:900;color:#fff;margin-bottom:28px;line-height:1.15}
.ben-text p{color:#94a3b8;font-size:1.1rem;line-height:1.8;margin-bottom:32px}
.ben-list{list-style:none}
.ben-list li{padding:14px 0;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;gap:14px;color:#cbd5e1;font-size:1rem}
.ben-list li::before{content:'\\2713';color:#818cf8;font-weight:700;font-size:1.1rem;flex-shrink:0}
.ben-visual{background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.2);border-radius:20px;padding:52px;text-align:center;font-size:5rem}
/* INTEGRATIONS */
.int-row{display:flex;justify-content:center;gap:32px;flex-wrap:wrap;margin-top:16px}
.int-item{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:20px 28px;color:#94a3b8;font-weight:600;font-size:.95rem;text-align:center}
/* PRICING */
.pricing{background:rgba(99,102,241,.05)}
.price-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1020px;margin:0 auto}
.pc{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);padding:44px 30px;border-radius:20px;position:relative;transition:all .3s}
.pc:hover{border-color:#6366f1;transform:translateY(-6px)}
.pc.featured{border-color:#6366f1;background:rgba(99,102,241,.1)}
.pc .badge{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:6px 20px;border-radius:50px;font-size:.8rem;font-weight:700;white-space:nowrap}
.pc h3{font-size:1.4rem;font-weight:700;margin-bottom:10px;color:#fff}
.pc .price{font-size:3.2rem;font-weight:900;color:#818cf8;margin-bottom:6px}
.pc .per{color:#64748b;font-size:.9rem;display:block;margin-bottom:28px}
.pc ul{list-style:none;margin-bottom:28px}
.pc li{padding:10px 0;color:#94a3b8;border-bottom:1px solid rgba(255,255,255,.06);display:flex;gap:10px}
.pc li::before{content:'\\2713';color:#818cf8;font-weight:700;flex-shrink:0}
.pc .btn{display:block;text-align:center;padding:14px;border-radius:10px;font-weight:700;text-decoration:none}
.pc:not(.featured) .btn{background:rgba(99,102,241,.15);color:#818cf8;border:1px solid rgba(99,102,241,.3)}
.pc.featured .btn{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff}
/* TESTIMONIALS */
.tc-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.tc{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);padding:36px;border-radius:18px;border-left:4px solid #6366f1}
.tc .stars{color:#fbbf24;font-size:1.3rem;margin-bottom:16px}
.tc p{font-size:1.1rem;color:#cbd5e1;line-height:1.8;margin-bottom:20px;font-style:italic}
.tc .author{display:flex;align-items:center;gap:12px}
.tc .av{width:44px;height:44px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;flex-shrink:0}
.tc .name{font-weight:700;color:#fff;display:block;font-size:.95rem;margin-bottom:2px}
.tc .role{color:#64748b;font-size:.8rem}
/* FAQ */
.faq-list{max-width:820px;margin:0 auto}
.faq-item{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);padding:28px;border-radius:14px;margin-bottom:16px;border-left:4px solid #6366f1}
.faq-item h3{font-size:1.2rem;font-weight:700;color:#fff;margin-bottom:12px}
.faq-item p{color:#94a3b8;line-height:1.8;font-size:.975rem}
/* CTA */
.cta-final{background:linear-gradient(135deg,rgba(99,102,241,.2),rgba(139,92,246,.2));border:1px solid rgba(99,102,241,.3);border-radius:28px;padding:100px 40px;text-align:center;margin:80px 32px}
.cta-final h2{font-size:3rem;font-weight:900;color:#fff;margin-bottom:20px}
.cta-final p{color:#94a3b8;font-size:1.2rem;margin-bottom:40px}
.cta-big{display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:20px 52px;border-radius:12px;font-size:1.25rem;font-weight:900;text-decoration:none}
/* FOOTER */
.footer{background:#060610;color:#64748b;padding:72px 0 32px;border-top:1px solid rgba(255,255,255,.06)}
.ft-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:56px;margin-bottom:48px}
.ft-col h4{color:#e2e8f0;font-weight:700;margin-bottom:18px;font-size:1rem}
.ft-col p{line-height:1.8;margin-bottom:14px;font-size:.9rem}
.ft-col ul{list-style:none}
.ft-col li{margin-bottom:10px}
.ft-col a{color:#64748b;text-decoration:none;font-size:.9rem}
.ft-col a:hover{color:#818cf8}
.ft-bot{border-top:1px solid rgba(255,255,255,.06);padding-top:24px;text-align:center;font-size:.85rem}
@media(max-width:1024px){.price-grid{grid-template-columns:1fr}.ben-grid{grid-template-columns:1fr}.tc-grid{grid-template-columns:1fr}.ft-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:768px){.hero h1{font-size:2.75rem}.sh h2{font-size:2.2rem}.section{padding:80px 0}.nav-links{display:none}}
</style>
</head>
<body>
<nav class="nav"><div class="container nav-inner"><div class="logo">{{KEYWORD}}</div><ul class="nav-links"><li><a href="#features">Features</a></li><li><a href="#pricing">Pricing</a></li><li><a href="#reviews">Reviews</a></li><li><a href="#faq">FAQ</a></li></ul><a href="#trial" class="nav-cta">Start Free Trial</a></div></nav>

<div class="hero"><div class="container">
<div class="hero-eyebrow">&#128640; Trusted by 10,000+ Teams Worldwide</div>
<h1>{{KEYWORD}}<br/>Built for Scale</h1>
<p class="lead">The #1 {{SERVICE}} platform that automates your work, drives real results, and grows with your business.</p>
<div class="btns"><a href="#trial" class="btn-primary">Start Free 14-Day Trial</a><a href="#demo" class="btn-ghost">&#9654; Watch Demo</a></div>
<p class="trust-line">No credit card required &bull; Full access &bull; Cancel anytime</p>
</div></div>

<div class="stats-bar"><div class="container" style="display:flex;justify-content:center;gap:72px;flex-wrap:wrap">
<div class="stat"><span class="num">10,000+</span><span class="lbl">Active Teams</span></div>
<div class="stat"><span class="num">50M+</span><span class="lbl">Tasks Automated</span></div>
<div class="stat"><span class="num">99.9%</span><span class="lbl">Uptime SLA</span></div>
<div class="stat"><span class="num">4.9 / 5</span><span class="lbl">Avg Rating</span></div>
</div></div>

<div class="section" id="features"><div class="container">
<div class="sh"><span class="lbl">Features</span><h2>Everything You Need for {{KEYWORD}}</h2><p>Powerful tools designed to scale your {{SERVICE}} operations from day one.</p></div>
<div class="feat-grid">
<div class="feat-card"><span class="icon">&#9889;</span><h3>Lightning Fast</h3><p>Process thousands of {{KEYWORD}} operations in milliseconds with our optimized global infrastructure.</p></div>
<div class="feat-card"><span class="icon">&#128274;</span><h3>Bank-Level Security</h3><p>SOC 2 Type II certified with end-to-end encryption protecting your {{SERVICE}} data.</p></div>
<div class="feat-card"><span class="icon">&#128202;</span><h3>Real-Time Analytics</h3><p>Deep insights into your {{KEYWORD}} performance with live dashboards and custom reports.</p></div>
<div class="feat-card"><span class="icon">&#128260;</span><h3>100+ Integrations</h3><p>Works seamlessly with Slack, Salesforce, HubSpot, Jira, and all your existing tools.</p></div>
<div class="feat-card"><span class="icon">&#129302;</span><h3>AI-Powered Automation</h3><p>Smart automation that learns your {{KEYWORD}} patterns and handles repetitive tasks automatically.</p></div>
<div class="feat-card"><span class="icon">&#127760;</span><h3>Multi-Region Scale</h3><p>Deploy in any region with 99.9% SLA guarantee for global {{SERVICE}} teams.</p></div>
</div>
</div></div>

<div class="section benefits"><div class="container">
<div class="ben-grid">
<div class="ben-text">
<h2>Why 10,000+ Teams Choose {{KEYWORD}}</h2>
<p>Companies that switch to our platform see measurable results in their first 30 days &mdash; from reduced manual work to accelerated {{SERVICE}} growth.</p>
<ul class="ben-list">
<li>Save 10+ hours per week on repetitive {{KEYWORD}} tasks</li>
<li>Increase team productivity by 40% on average</li>
<li>Reduce errors and eliminate costly manual work</li>
<li>Scale effortlessly from 5 to 5,000 team members</li>
<li>Up and running in under 15 minutes</li>
</ul>
</div>
<div class="ben-visual">&#128200;</div>
</div>
</div></div>

<div class="section"><div class="container">
<div class="sh"><span class="lbl">Integrations</span><h2>Works With Your Entire Stack</h2><p>Connect {{KEYWORD}} to 100+ tools your team already uses &mdash; in one click.</p></div>
<div class="int-row">
<div class="int-item">&#128172; Slack</div><div class="int-item">&#9729; Salesforce</div><div class="int-item">&#127381; HubSpot</div><div class="int-item">&#128736; Jira</div><div class="int-item">&#128196; Notion</div><div class="int-item">&#128202; Google Analytics</div><div class="int-item">+ 94 more</div>
</div>
</div></div>

<div class="section pricing" id="pricing"><div class="container">
<div class="sh"><span class="lbl">Pricing</span><h2>Simple, Transparent Pricing</h2><p>Start free, scale as you grow. No hidden fees, no surprises.</p></div>
<div class="price-grid">
<div class="pc"><h3>Starter</h3><div class="price">$29</div><span class="per">/month</span><ul><li>Up to 5 team members</li><li>Core {{KEYWORD}} features</li><li>5GB storage</li><li>Email support</li></ul><a href="#signup" class="btn">Get Started</a></div>
<div class="pc featured"><span class="badge">Most Popular</span><h3>Professional</h3><div class="price">$99</div><span class="per">/month</span><ul><li>Up to 25 team members</li><li>Advanced {{SERVICE}} tools</li><li>50GB storage</li><li>Priority support</li><li>Advanced analytics</li></ul><a href="#trial" class="btn">Start Free Trial</a></div>
<div class="pc"><h3>Enterprise</h3><div class="price">Custom</div><span class="per">Contact us</span><ul><li>Unlimited members</li><li>All features unlocked</li><li>Unlimited storage</li><li>Dedicated support</li><li>Custom SLA</li></ul><a href="#contact" class="btn">Contact Sales</a></div>
</div>
</div></div>

<div class="section" id="reviews"><div class="container">
<div class="sh"><span class="lbl">Reviews</span><h2>Loved by Teams Worldwide</h2><p>Real results from real companies using {{KEYWORD}} every day.</p></div>
<div class="tc-grid">
<div class="tc"><div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"{{KEYWORD}} completely transformed how our team handles {{SERVICE}}. We couldn't imagine going back &mdash; 10x faster and far fewer errors."</p><div class="author"><div class="av">S</div><cite><span class="name">Sarah Chen</span><span class="role">VP of Operations, TechCorp</span></cite></div></div>
<div class="tc"><div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"Best investment we've made this year. Our {{SERVICE}} efficiency jumped 40% in the first month. The onboarding was seamless."</p><div class="author"><div class="av">M</div><cite><span class="name">Marcus Rivera</span><span class="role">CEO, GrowthLab</span></cite></div></div>
<div class="tc"><div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"The AI automation alone saves our team 12 hours a week on {{KEYWORD}} tasks. It pays for itself 10x over every single month."</p><div class="author"><div class="av">A</div><cite><span class="name">Aisha Johnson</span><span class="role">Head of {{SERVICE}}, Accel Inc</span></cite></div></div>
<div class="tc"><div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"Enterprise-grade security, startup-friendly pricing. Finally a {{KEYWORD}} platform that meets our compliance requirements and our budget."</p><div class="author"><div class="av">D</div><cite><span class="name">David Kim</span><span class="role">CTO, FinanceFlow</span></cite></div></div>
</div>
</div></div>

<div class="section" id="faq"><div class="container">
<div class="sh"><span class="lbl">FAQ</span><h2>Common Questions</h2><p>Everything you need to know before getting started with {{KEYWORD}}.</p></div>
<div class="faq-list">
<div class="faq-item"><h3>Is there a free trial?</h3><p>Yes! You get full access to all Professional features for 14 days &mdash; no credit card required. Upgrade, downgrade, or cancel anytime.</p></div>
<div class="faq-item"><h3>How long does setup take?</h3><p>Most teams are fully set up and running {{KEYWORD}} within 15 minutes. Our onboarding wizard guides you through every step.</p></div>
<div class="faq-item"><h3>What integrations are supported?</h3><p>We support 100+ integrations including Slack, Salesforce, HubSpot, Google Workspace, Microsoft 365, and many more &mdash; with more added monthly.</p></div>
<div class="faq-item"><h3>Is my data secure?</h3><p>Absolutely. We are SOC 2 Type II certified with end-to-end encryption, regular penetration testing, and GDPR compliance for all your {{SERVICE}} data.</p></div>
<div class="faq-item"><h3>Can I change plans?</h3><p>Yes, upgrade or downgrade anytime. Changes take effect immediately and we pro-rate billing so you always pay only for what you use.</p></div>
<div class="faq-item"><h3>What support options are available?</h3><p>Starter plans include email support. Professional and Enterprise plans include priority support with dedicated account managers and SLA guarantees.</p></div>
</div>
</div></div>

<div class="cta-final"><div class="container"><h2>Ready to Transform Your {{SERVICE}}?</h2><p>Join 10,000+ teams already using {{KEYWORD}} to automate, scale, and grow.</p><a href="#trial" class="cta-big">Start Your Free 14-Day Trial &rarr;</a></div></div>

<div class="footer"><div class="container">
<div class="ft-grid">
<div class="ft-col"><h4>{{KEYWORD}}</h4><p>The #1 {{SERVICE}} platform for modern teams. Built for speed, security, and scale.</p><p>&#128231; hello@example.com<br/>&#128172; Live chat available</p></div>
<div class="ft-col"><h4>Product</h4><ul><li><a href="#">Features</a></li><li><a href="#">Pricing</a></li><li><a href="#">Integrations</a></li><li><a href="#">Changelog</a></li><li><a href="#">Status</a></li></ul></div>
<div class="ft-col"><h4>Company</h4><ul><li><a href="#">About</a></li><li><a href="#">Blog</a></li><li><a href="#">Careers</a></li><li><a href="#">Press</a></li><li><a href="#">Contact</a></li></ul></div>
<div class="ft-col"><h4>Legal</h4><ul><li><a href="#">Privacy Policy</a></li><li><a href="#">Terms of Service</a></li><li><a href="#">Security</a></li><li><a href="#">GDPR</a></li></ul></div>
</div>
<div class="ft-bot"><p>&copy; 2025 {{KEYWORD}}. All rights reserved.</p></div>
</div></div>
</body></html>`;

const ECOMMERCE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{{KEYWORD}} - Premium {{SERVICE}}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',-apple-system,sans-serif;line-height:1.7;color:#111827;background:#fff;overflow-x:hidden}
.container{max-width:1280px;margin:0 auto;padding:0 32px}
/* URGENCY BAR */
.urgency{background:linear-gradient(90deg,#dc2626,#ef4444);color:#fff;padding:11px;text-align:center;font-size:.9rem;font-weight:600}
/* NAV */
.nav{background:#fff;padding:16px 0;border-bottom:2px solid #fef2f2;position:sticky;top:0;z-index:100}
.nav-inner{display:flex;justify-content:space-between;align-items:center}
.logo{font-size:1.4rem;font-weight:900;color:#dc2626}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{color:#374151;text-decoration:none;font-weight:500}
.nav-links a:hover{color:#dc2626}
.nav-cart{background:#dc2626;color:#fff;padding:10px 22px;border-radius:8px;font-weight:700;text-decoration:none;display:flex;align-items:center;gap:8px}
/* HERO */
.hero{background:linear-gradient(135deg,#fff5f5,#fef2f2);padding:100px 0}
.hero-inner{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.hero-text h1{font-size:3.8rem;font-weight:900;line-height:1.1;margin-bottom:20px;color:#111827}
.hero-text h1 span{color:#dc2626}
.hero-price{margin:24px 0}
.price-now{font-size:3.2rem;font-weight:900;color:#dc2626;margin-right:16px}
.price-was{font-size:1.6rem;color:#9ca3af;text-decoration:line-through;margin-right:14px}
.save-badge{background:#dc2626;color:#fff;padding:6px 16px;border-radius:50px;font-size:.85rem;font-weight:700}
.hero-rating{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.stars{color:#fbbf24;font-size:1.4rem}
.rating-txt{color:#6b7280;font-weight:500}
.stock{color:#16a34a;font-weight:700;font-size:1rem;margin-bottom:28px}
.hero-ctas{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:20px}
.btn-buy{background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;padding:17px 40px;border-radius:12px;font-weight:900;font-size:1.1rem;text-decoration:none;box-shadow:0 12px 36px rgba(220,38,38,.3)}
.btn-save{background:#fff;color:#dc2626;padding:17px 32px;border-radius:12px;font-weight:700;font-size:1rem;text-decoration:none;border:2px solid #fecaca}
.hero-badges{display:flex;gap:20px;flex-wrap:wrap}
.hb{display:flex;align-items:center;gap:7px;color:#6b7280;font-size:.85rem;font-weight:600}
.hero-visual{background:#fff;border-radius:24px;padding:60px;text-align:center;box-shadow:0 20px 60px rgba(220,38,38,.1);font-size:8rem}
/* SECTION */
.section{padding:100px 0}
.sh{text-align:center;margin-bottom:64px}
.sh .lbl{color:#dc2626;font-weight:700;font-size:.8rem;text-transform:uppercase;letter-spacing:.12em;display:block;margin-bottom:12px}
.sh h2{font-size:3rem;font-weight:900;color:#111827;margin-bottom:18px;line-height:1.15}
.sh p{font-size:1.15rem;color:#6b7280;max-width:600px;margin:0 auto;line-height:1.8}
/* SPECS */
.spec-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
.spec-card{background:#fef2f2;border-radius:16px;padding:32px;text-align:center;border:2px solid #fecaca}
.spec-card .val{font-size:2.2rem;font-weight:900;color:#dc2626;display:block;margin-bottom:8px}
.spec-card .key{color:#6b7280;font-size:.9rem;font-weight:600}
/* FEATURES */
.features{background:#f9fafb}
.feat-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}
.feat-item{display:flex;align-items:flex-start;gap:16px;padding:24px;background:#fff;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,.04)}
.feat-check{width:36px;height:36px;background:linear-gradient(135deg,#dc2626,#ef4444);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;flex-shrink:0;font-size:1rem}
.feat-text strong{display:block;color:#111827;margin-bottom:4px;font-size:1rem}
.feat-text span{color:#6b7280;font-size:.9rem;line-height:1.6}
/* GALLERY */
.gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.gallery-item{background:linear-gradient(135deg,#fef2f2,#fecaca);border-radius:16px;padding:48px;text-align:center;font-size:4rem}
/* REVIEWS */
.reviews{background:#f9fafb}
.review-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.rv{background:#fff;padding:32px;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,.05);border-top:4px solid #dc2626}
.rv-stars{color:#fbbf24;font-size:1.3rem;margin-bottom:14px}
.rv p{font-size:1.05rem;font-style:italic;color:#374151;margin-bottom:16px;line-height:1.8}
.rv .author{display:flex;align-items:center;gap:12px}
.rv .av{width:42px;height:42px;background:linear-gradient(135deg,#dc2626,#ef4444);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700}
.rv .name{font-weight:700;color:#111827;font-size:.9rem;display:block;margin-bottom:2px}
.rv .badge{color:#16a34a;font-size:.75rem;font-weight:600}
/* GUARANTEE */
.guarantee{background:linear-gradient(135deg,#065f46,#047857);color:#fff;padding:80px 0;text-align:center}
.guarantee h2{font-size:2.8rem;font-weight:900;margin-bottom:18px;color:#fff}
.guarantee p{font-size:1.2rem;margin-bottom:32px;opacity:.95;max-width:640px;margin-left:auto;margin-right:auto}
.guar-badges{display:flex;justify-content:center;gap:32px;flex-wrap:wrap;margin-top:32px}
.gb{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);padding:16px 24px;border-radius:12px;font-weight:600;font-size:.95rem}
/* FAQ */
.faq-list{max-width:820px;margin:0 auto}
.faq-item{background:#fef2f2;padding:28px;border-radius:14px;margin-bottom:16px;border-left:4px solid #dc2626}
.faq-item h3{font-size:1.2rem;font-weight:700;color:#111827;margin-bottom:12px}
.faq-item p{color:#6b7280;line-height:1.8;font-size:.975rem}
/* CTA */
.cta-final{background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;padding:110px 0;text-align:center}
.cta-final h2{font-size:3rem;font-weight:900;margin-bottom:16px;color:#fff}
.cta-final p{font-size:1.2rem;margin-bottom:36px;opacity:.9}
.urgency-txt{background:rgba(255,255,255,.15);display:inline-block;padding:10px 24px;border-radius:10px;font-weight:700;font-size:1rem;margin-bottom:28px}
.cta-big{display:inline-block;background:#fff;color:#dc2626;padding:20px 52px;border-radius:12px;font-size:1.25rem;font-weight:900;text-decoration:none;box-shadow:0 16px 50px rgba(0,0,0,.25)}
/* FOOTER */
.footer{background:#111827;color:#9ca3af;padding:72px 0 32px}
.ft-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:52px;margin-bottom:48px}
.ft-col h4{color:#fff;font-weight:700;margin-bottom:18px}
.ft-col p{font-size:.9rem;line-height:1.8;margin-bottom:14px}
.ft-col ul{list-style:none}
.ft-col li{margin-bottom:10px}
.ft-col a{color:#9ca3af;text-decoration:none;font-size:.9rem}
.ft-col a:hover{color:#f87171}
.ft-bot{border-top:1px solid #1f2937;padding-top:24px;text-align:center;font-size:.85rem}
@media(max-width:1024px){.hero-inner{grid-template-columns:1fr}.spec-grid{grid-template-columns:repeat(2,1fr)}.gallery-grid{grid-template-columns:repeat(2,1fr)}.review-grid{grid-template-columns:1fr}.ft-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:768px){.hero-text h1{font-size:2.5rem}.sh h2{font-size:2.2rem}.section{padding:72px 0}.nav-links{display:none}}
</style>
</head>
<body>
<div class="urgency">&#128293; LIMITED TIME: Free Shipping on All Orders to {{LOCATION}} &mdash; Ends Today!</div>
<nav class="nav"><div class="container nav-inner"><div class="logo">{{KEYWORD}}</div><ul class="nav-links"><li><a href="#features">Features</a></li><li><a href="#reviews">Reviews</a></li><li><a href="#faq">FAQ</a></li></ul><a href="#buy" class="nav-cart">&#128722; Cart (0)</a></div></nav>

<div class="hero"><div class="container"><div class="hero-inner">
<div class="hero-text">
<h1>Premium {{KEYWORD}}<br/><span>{{SERVICE}}</span></h1>
<div class="hero-rating"><span class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span><span class="rating-txt">4.8/5 from 1,247 verified reviews</span></div>
<div class="hero-price"><span class="price-now">$129.99</span><span class="price-was">$179.99</span><span class="save-badge">Save 28%</span></div>
<p class="stock">&#10003; In Stock &mdash; Ships within 24 hours to {{LOCATION}}</p>
<div class="hero-ctas"><a href="#buy" class="btn-buy">&#128722; Add to Cart &mdash; $129.99</a><a href="#save" class="btn-save">&#9825; Save for Later</a></div>
<div class="hero-badges"><span class="hb">&#128737; 30-Day Returns</span><span class="hb">&#128274; Secure Checkout</span><span class="hb">&#128666; Free Shipping</span></div>
</div>
<div class="hero-visual">&#128717;</div>
</div></div></div>

<div class="section"><div class="container">
<div class="sh"><span class="lbl">Product Highlights</span><h2>Why Thousands Love It</h2></div>
<div class="spec-grid">
<div class="spec-card"><span class="val">4.8&#9733;</span><span class="key">Customer Rating</span></div>
<div class="spec-card"><span class="val">1,247</span><span class="key">Verified Reviews</span></div>
<div class="spec-card"><span class="val">2 Year</span><span class="key">Warranty</span></div>
<div class="spec-card"><span class="val">24hr</span><span class="key">Ships to {{LOCATION}}</span></div>
</div>
</div></div>

<div class="section features" id="features"><div class="container">
<div class="sh"><span class="lbl">Features</span><h2>Premium {{KEYWORD}} &mdash; Everything Included</h2><p>Designed for performance, built to last. Here is everything that sets our {{SERVICE}} apart from the competition.</p></div>
<div class="feat-list">
<div class="feat-item"><div class="feat-check">&#10003;</div><div class="feat-text"><strong>Premium-Grade Construction</strong><span>Built from the highest-quality materials for exceptional durability and longevity.</span></div></div>
<div class="feat-item"><div class="feat-check">&#10003;</div><div class="feat-text"><strong>Industry-Leading Performance</strong><span>Outperforms competitors in every benchmark test by a significant margin.</span></div></div>
<div class="feat-item"><div class="feat-check">&#10003;</div><div class="feat-text"><strong>Intuitive, Ready to Use</strong><span>No complicated setup &mdash; out of the box and working perfectly in minutes.</span></div></div>
<div class="feat-item"><div class="feat-check">&#10003;</div><div class="feat-text"><strong>Free Shipping to {{LOCATION}}</strong><span>Fast, free delivery directly to your door anywhere in {{LOCATION}}.</span></div></div>
<div class="feat-item"><div class="feat-check">&#10003;</div><div class="feat-text"><strong>2-Year Manufacturer Warranty</strong><span>Full coverage warranty giving you complete peace of mind with your purchase.</span></div></div>
<div class="feat-item"><div class="feat-check">&#10003;</div><div class="feat-text"><strong>30-Day Money-Back Guarantee</strong><span>Not satisfied? Return it within 30 days for a full refund, no questions asked.</span></div></div>
</div>
</div></div>

<div class="section"><div class="container">
<div class="sh"><span class="lbl">Gallery</span><h2>{{KEYWORD}} in Action</h2></div>
<div class="gallery-grid">
<div class="gallery-item">&#128717;</div><div class="gallery-item">&#127775;</div><div class="gallery-item">&#127942;</div>
</div>
</div></div>

<div class="section reviews" id="reviews"><div class="container">
<div class="sh"><span class="lbl">Reviews</span><h2>What Customers Are Saying</h2><p>Verified purchase reviews from real customers in {{LOCATION}} and beyond.</p></div>
<div class="review-grid">
<div class="rv"><div class="rv-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"Best {{KEYWORD}} I've ever purchased! Quality is outstanding and it arrived quickly to {{LOCATION}}. Exceeded every expectation."</p><div class="author"><div class="av">J</div><cite><span class="name">Jennifer L.</span><span class="badge">&#10003; Verified Purchase</span></cite></div></div>
<div class="rv"><div class="rv-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"Exceeded my expectations by a mile. Great value for the quality, customer service was also excellent when I had a question."</p><div class="author"><div class="av">M</div><cite><span class="name">Michael R.</span><span class="badge">&#10003; Verified Purchase</span></cite></div></div>
<div class="rv"><div class="rv-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"Ordered for my home in {{LOCATION}} &mdash; perfect fit, works exactly as described. Fast shipping and beautiful packaging."</p><div class="author"><div class="av">A</div><cite><span class="name">Amanda K.</span><span class="badge">&#10003; Verified Purchase</span></cite></div></div>
<div class="rv"><div class="rv-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"Premium quality at a fair price. The 2-year warranty sealed the deal for me. Already recommended to several friends in {{LOCATION}}."</p><div class="author"><div class="av">T</div><cite><span class="name">Thomas W.</span><span class="badge">&#10003; Verified Purchase</span></cite></div></div>
</div>
</div></div>

<div class="guarantee"><div class="container"><h2>&#128737; Our Triple Guarantee</h2><p>We stand 100% behind every {{KEYWORD}} we sell. Shop with complete confidence.</p><div class="guar-badges"><span class="gb">30-Day Money-Back</span><span class="gb">2-Year Warranty</span><span class="gb">Free Returns</span><span class="gb">Secure Checkout</span></div></div></div>

<div class="section" id="faq"><div class="container">
<div class="sh"><span class="lbl">FAQ</span><h2>Common Questions</h2></div>
<div class="faq-list">
<div class="faq-item"><h3>When will my order arrive in {{LOCATION}}?</h3><p>Orders ship within 24 hours and typically arrive in 2&ndash;5 business days depending on your location in {{LOCATION}}. Expedited shipping is also available at checkout.</p></div>
<div class="faq-item"><h3>What is your return policy?</h3><p>We offer a 30-day no-questions-asked return policy. If you are not completely satisfied with your {{KEYWORD}} purchase, contact us for a free return label and full refund.</p></div>
<div class="faq-item"><h3>Is the warranty transferable?</h3><p>Yes! The 2-year manufacturer warranty is fully transferable. Registration is simple and can be done online within 30 days of purchase.</p></div>
<div class="faq-item"><h3>Do you ship to all areas of {{LOCATION}}?</h3><p>We ship to all addresses throughout {{LOCATION}} and most international destinations. Free shipping applies to all standard domestic orders.</p></div>
<div class="faq-item"><h3>Is my payment information secure?</h3><p>Absolutely. We use 256-bit SSL encryption and are PCI DSS compliant. Your payment information is never stored on our servers.</p></div>
</div>
</div></div>

<div class="cta-final"><div class="container"><div class="urgency-txt">&#9889; Only 14 left in stock!</div><h2>Order Your {{KEYWORD}} Today</h2><p>Free shipping to {{LOCATION}} &bull; 30-day money-back guarantee</p><a href="#buy" class="cta-big">Add to Cart &mdash; $129.99 &rarr;</a></div></div>

<div class="footer"><div class="container">
<div class="ft-grid">
<div class="ft-col"><h4>{{KEYWORD}}</h4><p>Premium {{SERVICE}} delivered fast. Thousands of satisfied customers across {{LOCATION}} and beyond.</p><p>&#128231; support@example.com<br/>&#128222; (555) 010-0100</p></div>
<div class="ft-col"><h4>Shop</h4><ul><li><a href="#">All Products</a></li><li><a href="#">Best Sellers</a></li><li><a href="#">New Arrivals</a></li><li><a href="#">Sale</a></li></ul></div>
<div class="ft-col"><h4>Support</h4><ul><li><a href="#">Track Order</a></li><li><a href="#">Returns</a></li><li><a href="#">Warranty</a></li><li><a href="#">Contact Us</a></li></ul></div>
<div class="ft-col"><h4>Company</h4><ul><li><a href="#">About</a></li><li><a href="#">Reviews</a></li><li><a href="#">Privacy Policy</a></li><li><a href="#">Terms</a></li></ul></div>
</div>
<div class="ft-bot"><p>&copy; 2025 {{KEYWORD}}. All rights reserved. &bull; Ships to {{LOCATION}}</p></div>
</div></div>
</body></html>`;

const RESTAURANT = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{{KEYWORD}} - {{LOCATION}}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',-apple-system,sans-serif;line-height:1.7;color:#f5f0e8;background:#111008;overflow-x:hidden}
.container{max-width:1200px;margin:0 auto;padding:0 32px}
/* NAV */
.nav{background:rgba(17,16,8,.92);backdrop-filter:blur(16px);padding:20px 0;position:sticky;top:0;z-index:100;border-bottom:1px solid rgba(212,175,55,.2)}
.nav-inner{display:flex;justify-content:space-between;align-items:center}
.logo{font-family:'Cormorant Garamond',Georgia,serif;font-size:1.6rem;font-weight:700;color:#d4af37;letter-spacing:1px}
.nav-links{display:flex;gap:36px;list-style:none}
.nav-links a{color:#c8b89a;text-decoration:none;font-weight:500;font-size:.95rem}
.nav-links a:hover{color:#d4af37}
.nav-cta{background:#d4af37;color:#111008;padding:11px 26px;border-radius:4px;font-weight:700;text-decoration:none;font-size:.9rem;letter-spacing:.5px}
/* HERO */
.hero{background:linear-gradient(160deg,#080600,#1a0f00,#080600);padding:160px 0 120px;text-align:center;border-bottom:1px solid rgba(212,175,55,.3);position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(212,175,55,.06) 0%,transparent 60%)}
.hero-inner{position:relative;z-index:1;max-width:820px;margin:0 auto}
.hero-eyebrow{color:#d4af37;font-size:.8rem;letter-spacing:4px;text-transform:uppercase;margin-bottom:24px;display:block}
.hero h1{font-family:'Cormorant Garamond',Georgia,serif;font-size:5.5rem;font-weight:700;margin-bottom:16px;color:#d4af37;line-height:1.05;letter-spacing:1px}
.tagline{font-family:'Cormorant Garamond',Georgia,serif;font-size:1.6rem;font-style:italic;color:#c8b89a;margin-bottom:44px;font-weight:400}
.btns{display:flex;gap:20px;justify-content:center;flex-wrap:wrap}
.btn-gold{background:#d4af37;color:#111008;padding:16px 44px;border-radius:4px;font-weight:700;text-decoration:none;font-size:1rem;letter-spacing:.5px}
.btn-outline{background:transparent;color:#d4af37;padding:16px 44px;border-radius:4px;font-weight:700;text-decoration:none;border:1px solid rgba(212,175,55,.6);font-size:1rem}
/* HOURS */
.hours-bar{background:#1a1408;border-top:1px solid rgba(212,175,55,.15);border-bottom:1px solid rgba(212,175,55,.15);padding:20px;text-align:center;color:#c8b89a;font-size:.9rem}
.hours-bar span{color:#d4af37;font-weight:600;margin:0 12px}
/* SECTION */
.section{padding:110px 0}
.sh{text-align:center;margin-bottom:72px}
.sh .lbl{color:#d4af37;font-size:.75rem;letter-spacing:4px;text-transform:uppercase;display:block;margin-bottom:16px}
.sh h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:3.8rem;font-weight:700;color:#d4af37;margin-bottom:18px;letter-spacing:.5px}
.sh p{font-size:1.1rem;color:#9d8a72;max-width:600px;margin:0 auto;line-height:1.8}
.gold-line{width:50px;height:1px;background:linear-gradient(90deg,transparent,#d4af37,transparent);margin:0 auto 16px}
/* MENU */
.menu-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:32px}
.menu-card{background:#1a1408;border:1px solid rgba(212,175,55,.15);border-radius:8px;padding:36px;display:flex;justify-content:space-between;align-items:flex-start;gap:20px;transition:all .3s}
.menu-card:hover{border-color:rgba(212,175,55,.4);background:#201a0a}
.menu-info h3{font-family:'Cormorant Garamond',Georgia,serif;font-size:1.8rem;font-weight:700;color:#d4af37;margin-bottom:8px}
.menu-info p{color:#9d8a72;font-size:.95rem;line-height:1.7}
.menu-info .tag{color:#d4af37;font-size:.75rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;display:block;opacity:.7}
.menu-price{color:#d4af37;font-size:1.6rem;font-weight:700;white-space:nowrap;font-family:'Cormorant Garamond',Georgia,serif}
/* EXPERIENCE */
.experience{background:#151008;border-top:1px solid rgba(212,175,55,.12);border-bottom:1px solid rgba(212,175,55,.12)}
.exp-grid{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center}
.exp-text h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:3rem;font-weight:700;color:#d4af37;margin-bottom:20px}
.exp-text p{color:#9d8a72;font-size:1.05rem;line-height:1.9;margin-bottom:20px}
.exp-badges{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:28px}
.eb{background:rgba(212,175,55,.08);border:1px solid rgba(212,175,55,.15);padding:16px 20px;border-radius:8px;text-align:center}
.eb .icon{font-size:1.6rem;display:block;margin-bottom:8px}
.eb p{color:#c8b89a;font-size:.85rem;font-weight:600}
.exp-visual{background:rgba(212,175,55,.05);border:1px solid rgba(212,175,55,.15);border-radius:12px;padding:72px;text-align:center;font-size:6rem}
/* CHEF */
.chef{text-align:center;max-width:800px;margin:0 auto}
.chef-quote{font-family:'Cormorant Garamond',Georgia,serif;font-size:1.6rem;font-style:italic;color:#c8b89a;line-height:1.8;margin-bottom:24px}
/* DINING OPTIONS */
.dining-opts{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
.do{background:#1a1408;border:1px solid rgba(212,175,55,.15);border-radius:8px;padding:28px;text-align:center}
.do .icon{font-size:2rem;margin-bottom:14px;display:block}
.do h3{font-size:1.1rem;font-weight:700;color:#d4af37;margin-bottom:8px}
.do p{color:#9d8a72;font-size:.875rem;line-height:1.6}
/* REVIEWS */
.reviews{background:#151008}
.rv-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.rv{background:#111008;border-left:2px solid #d4af37;padding:36px;border-radius:0 8px 8px 0}
.rv .stars{color:#fbbf24;font-size:1.3rem;margin-bottom:14px}
.rv p{font-family:'Cormorant Garamond',Georgia,serif;font-size:1.3rem;font-style:italic;color:#c8b89a;margin-bottom:18px;line-height:1.8}
.rv cite{color:#d4af37;font-weight:600;font-style:normal;font-size:.9rem}
/* RESERVE */
.reserve{background:linear-gradient(135deg,#d4af37,#c8a030);color:#111008;padding:110px 0;text-align:center}
.reserve h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:3.5rem;font-weight:700;margin-bottom:18px;color:#111008}
.reserve p{font-size:1.15rem;color:#2a1f00;margin-bottom:36px}
.reserve-btn{display:inline-block;background:#111008;color:#d4af37;padding:18px 52px;border-radius:4px;font-size:1.2rem;font-weight:700;text-decoration:none;margin-bottom:20px;letter-spacing:.5px}
/* FAQ */
.faq-list{max-width:800px;margin:0 auto}
.faq-item{background:#1a1408;border-left:2px solid #d4af37;padding:26px;margin-bottom:16px;border-radius:0 8px 8px 0}
.faq-item h3{font-size:1.15rem;font-weight:700;color:#d4af37;margin-bottom:10px}
.faq-item p{color:#9d8a72;line-height:1.8;font-size:.975rem}
/* FOOTER */
.footer{background:#080600;color:#6b5d48;padding:72px 0 32px;border-top:1px solid rgba(212,175,55,.12)}
.ft-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:56px;margin-bottom:48px}
.ft-col h4{color:#d4af37;font-family:'Cormorant Garamond',Georgia,serif;font-size:1.2rem;font-weight:700;margin-bottom:18px}
.ft-col p{font-size:.9rem;line-height:1.8;margin-bottom:12px}
.ft-col ul{list-style:none}
.ft-col li{margin-bottom:10px}
.ft-col a{color:#6b5d48;text-decoration:none;font-size:.9rem}
.ft-col a:hover{color:#d4af37}
.ft-bot{border-top:1px solid rgba(212,175,55,.1);padding-top:24px;text-align:center;font-size:.85rem}
@media(max-width:1024px){.exp-grid{grid-template-columns:1fr}.dining-opts{grid-template-columns:repeat(2,1fr)}.rv-grid{grid-template-columns:1fr}.ft-grid{grid-template-columns:1fr}}
@media(max-width:768px){.hero h1{font-size:3.5rem}.sh h2{font-size:2.8rem}.section{padding:80px 0}.nav-links{display:none}}
</style>
</head>
<body>
<nav class="nav"><div class="container nav-inner"><div class="logo">{{KEYWORD}}</div><ul class="nav-links"><li><a href="#menu">Menu</a></li><li><a href="#experience">Experience</a></li><li><a href="#reviews">Reviews</a></li><li><a href="#reserve">Reserve</a></li></ul><a href="#reserve" class="nav-cta">Reserve a Table</a></div></nav>

<div class="hero"><div class="container"><div class="hero-inner">
<span class="hero-eyebrow">{{LOCATION}} &bull; Est. 2008 &bull; Award Winning</span>
<h1>{{KEYWORD}}</h1>
<p class="tagline">{{LOCATION}}'s finest {{SERVICE}} &mdash; where every dish tells a story</p>
<div class="btns"><a href="#reserve" class="btn-gold">Reserve a Table</a><a href="#menu" class="btn-outline">View Menu</a></div>
</div></div></div>

<div class="hours-bar">Open: <span>Tue &ndash; Sun</span> Lunch 11:30am &ndash; 2:30pm <span>&bull;</span> Dinner 5:30pm &ndash; 10:00pm <span>&bull;</span> Call: (555) 010-0200</div>

<div class="section" id="menu"><div class="container">
<div class="sh"><span class="lbl">Our Menu</span><div class="gold-line"></div><h2>Signature {{SERVICE}}</h2><p>Each dish crafted with seasonal local ingredients, honoring the culinary traditions of {{LOCATION}}.</p></div>
<div class="menu-grid">
<div class="menu-card"><div class="menu-info"><span class="tag">Chef's Selection</span><h3>The Signature</h3><p>Our award-winning dish &mdash; aged perfection with {{LOCATION}}-sourced artisan ingredients</p></div><div class="menu-price">$38</div></div>
<div class="menu-card"><div class="menu-info"><span class="tag">Seasonal</span><h3>Harvest Tasting</h3><p>Five courses celebrating the finest seasonal produce from local {{LOCATION}} farms</p></div><div class="menu-price">$65</div></div>
<div class="menu-card"><div class="menu-info"><span class="tag">Classic</span><h3>{{LOCATION}} Heritage</h3><p>A beloved tradition since 2008 &mdash; the dish that made us {{LOCATION}}'s favorite</p></div><div class="menu-price">$28</div></div>
<div class="menu-card"><div class="menu-info"><span class="tag">Weekend Special</span><h3>Sunday Roast</h3><p>Chef's rotating masterpiece, available Friday through Sunday while ingredients last</p></div><div class="menu-price">$42</div></div>
<div class="menu-card"><div class="menu-info"><span class="tag">Vegetarian</span><h3>Garden Symphony</h3><p>A celebration of the season's finest vegetables, thoughtfully composed</p></div><div class="menu-price">$26</div></div>
<div class="menu-card"><div class="menu-info"><span class="tag">Dessert</span><h3>Sweet Finale</h3><p>House-made desserts using imported chocolate and {{LOCATION}} dairy</p></div><div class="menu-price">$14</div></div>
</div>
</div></div>

<div class="section experience" id="experience"><div class="container">
<div class="exp-grid">
<div class="exp-text">
<h2>The {{KEYWORD}} Experience</h2>
<div class="gold-line" style="margin:0 0 20px"></div>
<p>Step into a world of culinary artistry at {{LOCATION}}'s most celebrated {{SERVICE}} destination. Our intimate dining room &mdash; seating just 48 guests &mdash; creates an atmosphere of warmth and exclusivity.</p>
<p>Every detail, from the hand-picked flowers to the custom ceramics, is curated to elevate your evening into an unforgettable memory.</p>
<div class="exp-badges">
<div class="eb"><span class="icon">&#127769;</span><p>Romantic Atmosphere</p></div>
<div class="eb"><span class="icon">&#127857;</span><p>Private Dining Rooms</p></div>
<div class="eb"><span class="icon">&#127863;</span><p>Curated Wine List</p></div>
<div class="eb"><span class="icon">&#127942;</span><p>Award Winning</p></div>
</div>
</div>
<div class="exp-visual">&#127869;</div>
</div>
</div></div>

<div class="section"><div class="container">
<div class="sh"><span class="lbl">Our Chef</span><div class="gold-line"></div><h2>A Culinary Vision</h2></div>
<div class="chef">
<p class="chef-quote">"Every plate is a love letter to {{LOCATION}} &mdash; its farmers, its seasons, and its soul. We cook not just with technique, but with memory and meaning."</p>
<p style="color:#d4af37;font-weight:700;letter-spacing:1px;font-size:.9rem">&mdash; Executive Chef, {{KEYWORD}}</p>
<p style="color:#9d8a72;font-size:1rem;margin-top:16px;line-height:1.8">With 20 years of culinary experience and classical training in Paris and Tokyo, our chef has earned {{LOCATION}}'s highest culinary honors. Every dish on our menu reflects a deep commitment to local sourcing, seasonal inspiration, and flawless technique.</p>
</div>
</div></div>

<div class="section"><div class="container">
<div class="sh"><span class="lbl">Dining Options</span><div class="gold-line"></div><h2>Every Occasion, Perfected</h2></div>
<div class="dining-opts">
<div class="do"><span class="icon">&#127861;</span><h3>Dine-In</h3><p>Full-service experience with our complete menu</p></div>
<div class="do"><span class="icon">&#127881;</span><h3>Private Events</h3><p>Exclusive spaces for your special occasions</p></div>
<div class="do"><span class="icon">&#127859;</span><h3>Catering</h3><p>Bringing {{KEYWORD}} quality to your events</p></div>
<div class="do"><span class="icon">&#128241;</span><h3>Online Ordering</h3><p>Delivery and takeout across {{LOCATION}}</p></div>
</div>
</div></div>

<div class="section reviews" id="reviews"><div class="container">
<div class="sh"><span class="lbl">Guest Reviews</span><div class="gold-line"></div><h2>What Our Guests Say</h2></div>
<div class="rv-grid">
<div class="rv"><div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"The finest dining experience in {{LOCATION}}. The {{KEYWORD}} was transcendent &mdash; each course more beautiful than the last. We have dined here six times and it never disappoints."</p><cite>&mdash; Elena V., {{LOCATION}} Food Writer</cite></div>
<div class="rv"><div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"We celebrated our anniversary here and it was everything we dreamed of. The atmosphere, the service, the food &mdash; perfection in every detail. {{LOCATION}}'s crown jewel."</p><cite>&mdash; David &amp; Marie L., {{LOCATION}}</cite></div>
<div class="rv"><div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"As a professional chef myself, I rarely find restaurants that genuinely move me. {{KEYWORD}} is one of perhaps three in all of {{LOCATION}} that truly achieves culinary excellence."</p><cite>&mdash; Chef Marcus T., {{LOCATION}}</cite></div>
<div class="rv"><div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"Booked for a corporate dinner of 12 guests. The private dining room, impeccable service, and extraordinary menu made a flawless impression. Already rebooked for next quarter."</p><cite>&mdash; Sandra K., {{LOCATION}} Executive</cite></div>
</div>
</div></div>

<div class="section" id="faq"><div class="container">
<div class="sh"><span class="lbl">FAQ</span><div class="gold-line"></div><h2>Reservations &amp; Dining</h2></div>
<div class="faq-list">
<div class="faq-item"><h3>How far in advance should I reserve?</h3><p>We recommend booking at least 2 weeks in advance, especially for weekend evenings and special occasions. Same-week tables occasionally become available &mdash; call us directly to check.</p></div>
<div class="faq-item"><h3>Do you accommodate dietary restrictions?</h3><p>Absolutely. Our kitchen takes great pride in accommodating all dietary needs including vegetarian, vegan, gluten-free, and allergen requirements. Please note restrictions when booking.</p></div>
<div class="faq-item"><h3>Is there a dress code?</h3><p>We maintain a smart casual to formal dress code that honors the dining experience we create. We kindly ask guests to avoid athletic wear and very casual attire.</p></div>
<div class="faq-item"><h3>Can you accommodate large parties?</h3><p>Yes! Our private dining rooms seat 8 to 40 guests and can be reserved for special occasions, corporate events, and celebrations. Contact us directly to discuss arrangements.</p></div>
<div class="faq-item"><h3>Do you offer tasting menus?</h3><p>Yes, our signature tasting menu is available daily and features 5 courses with optional wine pairing. A vegetarian tasting menu is also available with 48 hours notice.</p></div>
</div>
</div></div>

<div class="reserve" id="reserve"><div class="container"><h2>Reserve Your Table</h2><p>{{LOCATION}}'s most celebrated {{SERVICE}} &mdash; book now before it's full</p><a href="#book" class="reserve-btn">Book Your Table Tonight</a><p style="color:#3a2800;font-size:.9rem">Or call: (555) 010-0200 &bull; Open Tue &ndash; Sun</p></div></div>

<div class="footer"><div class="container">
<div class="ft-grid">
<div class="ft-col"><h4>{{KEYWORD}}</h4><p>Award-winning {{SERVICE}} in the heart of {{LOCATION}}. Est. 2008.</p><p>&#128205; {{LOCATION}}, USA<br/>&#128222; (555) 010-0200<br/>&#128231; dining@example.com</p></div>
<div class="ft-col"><h4>Dining</h4><ul><li><a href="#">Our Menu</a></li><li><a href="#">Wine List</a></li><li><a href="#">Private Events</a></li><li><a href="#">Catering</a></li><li><a href="#">Gift Cards</a></li></ul></div>
<div class="ft-col"><h4>About</h4><ul><li><a href="#">Our Story</a></li><li><a href="#">The Chef</a></li><li><a href="#">Awards</a></li><li><a href="#">Press</a></li><li><a href="#">Contact</a></li></ul></div>
</div>
<div class="ft-bot"><p>&copy; 2025 {{KEYWORD}} &mdash; {{LOCATION}}. All rights reserved.</p></div>
</div></div>
</body></html>`;

const templates = [
  { name: 'Local Service Complete - Modern Purple', category: 'Local Services', structure: LOCAL_SERVICE },
  { name: 'SaaS Complete - Dark Tech', category: 'SaaS & Technology', structure: SAAS },
  { name: 'E-Commerce Complete - Bold Red', category: 'E-Commerce & Retail', structure: ECOMMERCE },
  { name: 'Restaurant Complete - Dark Elegant', category: 'Restaurant & Food', structure: RESTAURANT },
];

async function seedTemplates() {
  console.log('🌱 Seeding templates...\n');

  const { error: deleteError } = await supabase.from('templates').delete().gt('id', 0);
  if (deleteError) {
    console.log('Note: Could not clear existing templates:', deleteError.message);
  } else {
    console.log('🗑️  Cleared existing templates\n');
  }

  for (const template of templates) {
    const { error } = await supabase
      .from('templates')
      .insert({ ...template, user_id: USER_ID })
      .select();

    if (error) {
      console.error(`❌ Error creating "${template.name}":`, error.message);
    } else {
      console.log(`✅ Created: ${template.name} (${template.category})`);
    }
  }

  console.log(`\n✨ Done! ${templates.length} templates seeded.`);
  process.exit(0);
}

seedTemplates();
