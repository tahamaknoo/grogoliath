'use client';
import { useEffect, useState } from 'react';
import { fetchBrandKits, createBrandKit, updateBrandKit, deleteBrandKit, limitForPlan } from '../../../lib/brandKits';

const PRESET_COLORS = ['#075056', '#2563eb', '#7c3aed', '#dc2626', '#ea580c', '#0d9488', '#262626'];

export default function BrandKitView({ session, profile }) {
  const [kits, setKits] = useState(null);
  const [editor, setEditor] = useState(null); // null | { mode: 'create' } | { mode: 'edit', kit }

  const plan = String(profile?.plan || 'basic').toLowerCase();
  const limit = limitForPlan(plan);
  const atLimit = (kits || []).length >= limit;

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchBrandKits(session?.access_token).then(setKits);
  }, [session?.user?.id, session?.access_token]);

  const refresh = async () => setKits(await fetchBrandKits(session?.access_token));

  const onDelete = async (kit) => {
    const ok = window.confirm(`Delete "${kit.name}"? This can't be undone.`);
    if (!ok) return;
    try {
      const removed = await deleteBrandKit(kit.id, session?.access_token);
      if (!removed) {
        window.alert('Could not delete the kit. Check Supabase RLS policies on the brand_kits table.');
        return;
      }
      setKits(prev => (prev || []).filter(k => k.id !== kit.id));
    } catch (e) {
      window.alert(`Delete failed: ${e.message}`);
    }
  };

  return (
    <div className="px-8 pb-8" style={{ paddingTop: '48px' }}>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[40px] font-black text-[#262626] dark:text-white tracking-[-0.02em] leading-none mb-3">Brand Kit</h1>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#555555] dark:text-[#999999] bg-[#f5f5f5] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#075056]" />
            {(kits || []).length} / {limit} used
          </span>
          <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#555555] dark:text-[#999999] bg-[#f5f5f5] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#333333] rounded-full">
            {plan === 'pro' ? 'Pro plan · 3 kits' : 'Basic plan · 1 kit'}
          </span>
        </div>
      </div>

      {/* Create banner */}
      <button
        onClick={() => !atLimit && setEditor({ mode: 'create' })}
        disabled={atLimit}
        className="group w-full text-left flex items-center gap-5 p-5 sm:p-6 mb-10 bg-gradient-to-br from-white to-[#fafafa] dark:from-[#1a1a1a] dark:to-[#111111] border border-dashed border-[#b8b8b8] dark:border-[#525252] rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_40px_rgba(7,80,86,0.18)] dark:hover:shadow-[0_12px_40px_rgba(7,80,86,0.35)] hover:border-solid hover:border-[#075056] dark:hover:border-[#075056] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        <div className="w-14 h-14 rounded-2xl bg-[#075056]/10 dark:bg-[#075056]/20 flex items-center justify-center text-[#075056] dark:text-[#5eead4] group-hover:bg-[#075056] group-hover:text-white dark:group-hover:bg-[#075056] dark:group-hover:text-white group-hover:rotate-90 transition-all duration-500 shrink-0 disabled:group-hover:rotate-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-[#262626] dark:text-white tracking-tight mb-1">
            {atLimit ? 'Brand kit limit reached' : 'Create a brand kit'}
          </h3>
          <p className="text-xs sm:text-sm text-[#777777] dark:text-[#888888]">
            {atLimit
              ? plan === 'pro'
                ? 'Pro plan supports up to 3 kits. Delete one to create another.'
                : 'Upgrade to Pro to create up to 3 brand kits.'
              : 'Save your colors, logo, and voice. Apply them to AI-generated pages with one click.'}
          </p>
        </div>
        {!atLimit && (
          <span className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#075056] text-white text-sm font-bold rounded-xl group-hover:bg-[#064548] group-hover:shadow-lg group-hover:shadow-[#075056]/30 transition-all shrink-0">
            New kit
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </span>
        )}
      </button>

      {/* Kits grid */}
      {kits === null ? (
        <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-[#075056] border-t-transparent rounded-full animate-spin" /></div>
      ) : kits.length === 0 ? (
        <div className="text-center py-16 text-[#aaaaaa] dark:text-[#555555]">
          <p className="text-sm">No brand kits yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
          {kits.map(kit => (
            <div
              key={kit.id}
              className="group flex flex-col bg-white dark:bg-[#1c1c1c] border border-[#d4d4d4] dark:border-[#404040] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_28px_rgba(0,0,0,0.5)] hover:border-[#075056] dark:hover:border-white hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* Color preview */}
              <div className="relative h-28 flex items-center justify-center" style={{ background: kit.primary_color }}>
                {kit.logo_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={kit.logo_url} alt={kit.name} className="max-h-16 max-w-[60%] object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <div className="text-white font-bold text-3xl tracking-tight" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                    {kit.name[0].toUpperCase()}
                  </div>
                )}
                <span className="absolute top-3 right-3 text-[10px] font-mono font-semibold text-white bg-black/40 backdrop-blur-md border border-white/15 px-2 py-0.5 rounded-full">
                  {kit.primary_color.toUpperCase()}
                </span>
              </div>

              {/* Body */}
              <div className="flex-1 flex flex-col p-5">
                <h3 className="text-[15px] font-bold text-[#262626] dark:text-white tracking-tight mb-1.5 truncate">{kit.name}</h3>
                <p className="text-xs text-[#777777] dark:text-[#888888] leading-relaxed line-clamp-2 mb-4 flex-1 italic">
                  {kit.voice || 'No voice set.'}
                </p>
                <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-[#f0f0f0] dark:border-[#2c2c2c]">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#aaaaaa] dark:text-[#666666]">
                    Brand Kit
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => setEditor({ mode: 'edit', kit })}
                      title="Edit"
                      className="p-1.5 rounded-md text-[#aaaaaa] hover:text-[#262626] dark:hover:text-white hover:bg-[#f0f0f0] dark:hover:bg-[#303030] transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(kit)}
                      title="Delete"
                      className="p-1.5 rounded-md text-[#aaaaaa] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor modal */}
      {editor && (
        <BrandKitEditor
          mode={editor.mode}
          initial={editor.kit}
          onCancel={() => setEditor(null)}
          onSave={async (payload) => {
            console.log('[BrandKit] parent onSave payload:', payload, 'mode:', editor.mode);
            try {
              if (editor.mode === 'create') {
                const created = await createBrandKit(session.user.id, payload, session?.access_token);
                console.log('[BrandKit] createBrandKit ok:', created);
                setKits(prev => [...(prev || []), created]);
              } else {
                const updated = await updateBrandKit(editor.kit.id, payload, session?.access_token);
                console.log('[BrandKit] updateBrandKit ok:', updated);
                setKits(prev => (prev || []).map(k => k.id === updated.id ? updated : k));
              }
              setEditor(null);
            } catch (e) {
              console.error('[BrandKit] save error:', e);
              const msg = e.message || '';
              if (msg.includes('Could not find the table') || msg.includes('does not exist')) {
                window.alert(
                  'The brand_kits table does not exist in Supabase yet.\n\n' +
                  'Open your Supabase dashboard → SQL Editor and run the setup SQL ' +
                  'from lib/brandKits.js (the comment at the top has the full script).'
                );
              } else if (msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('policy')) {
                window.alert(
                  'Save blocked by Supabase Row Level Security.\n\n' +
                  'Make sure you ran the four CREATE POLICY statements at the bottom of the setup SQL ' +
                  '(lib/brandKits.js). Without them, inserts are rejected.'
                );
              } else if (/column .* (does not exist|of relation)/i.test(msg) || msg.toLowerCase().includes("could not find the 'business_") || msg.toLowerCase().includes("schema cache")) {
                window.alert(
                  "The brand_kits table is missing the new business-detail columns.\n\n" +
                  "Open Supabase → SQL Editor and run:\n\n" +
                  "alter table public.brand_kits\n" +
                  "  add column if not exists business_type text,\n" +
                  "  add column if not exists business_description text,\n" +
                  "  add column if not exists services text,\n" +
                  "  add column if not exists usps text,\n" +
                  "  add column if not exists target_customer text,\n" +
                  "  add column if not exists phone text,\n" +
                  "  add column if not exists years_in_business text,\n" +
                  "  add column if not exists default_tone text,\n" +
                  "  add column if not exists default_length text;\n\n" +
                  "Then refresh and save again."
                );
              } else {
                window.alert(`Save failed: ${msg}`);
              }
            }
          }}
        />
      )}
    </div>
  );
}

const TONE_OPTIONS = ['Professional', 'Friendly', 'Bold', 'Playful', 'Authoritative', 'Conversational'];
const LENGTH_OPTIONS = ['Short', 'Medium', 'Long'];

function BarbershopProgress({ percent }) {
  const safe = Math.max(0, Math.min(100, percent));
  return (
    <>
      <style>{`
        @keyframes gg-barbershop {
          from { background-position: 0 0; }
          to   { background-position: 28px 0; }
        }
      `}</style>
      <div className="relative h-2 w-full bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${safe}%`,
            backgroundImage:
              'repeating-linear-gradient(-45deg, #075056 0, #075056 7px, #5eead4 7px, #5eead4 14px)',
            backgroundSize: '28px 28px',
            animation: 'gg-barbershop 1s linear infinite',
          }}
        />
      </div>
    </>
  );
}

function BrandKitEditor({ mode, initial, onCancel, onSave }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initial?.name || '');
  const [color, setColor] = useState(initial?.primary_color || '#075056');
  const [logoUrl, setLogoUrl] = useState(initial?.logo_url || '');
  const [voice, setVoice] = useState(initial?.voice || '');
  const [businessType, setBusinessType] = useState(initial?.business_type || '');
  const [businessDescription, setBusinessDescription] = useState(initial?.business_description || '');
  const [services, setServices] = useState(initial?.services || '');
  const [usps, setUsps] = useState(initial?.usps || '');
  const [targetCustomer, setTargetCustomer] = useState(initial?.target_customer || '');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [yearsInBusiness, setYearsInBusiness] = useState(initial?.years_in_business || '');
  const [defaultTone, setDefaultTone] = useState(initial?.default_tone || '');
  const [defaultLength, setDefaultLength] = useState(initial?.default_length || '');
  const [saving, setSaving] = useState(false);

  const canSave =
    name.trim().length > 0 &&
    /^#[0-9a-fA-F]{6}$/.test(color) &&
    businessType.trim().length > 0 &&
    services.trim().length > 0 &&
    targetCustomer.trim().length > 0 &&
    voice.trim().length > 0 &&
    !saving;
  const safeColor = /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#075056';

  // Step config — 6 focal screens + review. Required steps block Next until the
  // AI-critical field on that screen is filled in.
  const steps = [
    { key: 'identity', title: "Let's set up your brand", hint: 'A name and your color, used everywhere AI generates copy.', required: true, valid: () => name.trim().length > 0 && /^#[0-9a-fA-F]{6}$/.test(color) },
    { key: 'about', title: 'Tell us about your business', hint: "AI uses this to know what you do. Works for any kind of business.", required: true, valid: () => businessType.trim().length > 0 },
    { key: 'offer', title: 'What do you offer?', hint: 'Services or products tell AI what to actually write about.', required: true, valid: () => services.trim().length > 0 },
    { key: 'audience', title: 'Who do you serve?', hint: 'AI tailors language and examples to your target customer.', required: true, valid: () => targetCustomer.trim().length > 0 },
    { key: 'voice', title: 'How should the writing feel?', hint: 'Tone notes shape every sentence AI writes for this brand.', required: true, valid: () => voice.trim().length > 0 },
    { key: 'defaults', title: 'Pick your default tone & length', hint: 'Optional defaults. See sample sentences below.', valid: () => true },
    { key: 'review', title: "You're all set", hint: 'Quick look. Change anything before saving.', isReview: true, valid: () => canSave },
  ];

  const totalSteps = steps.length;
  const current = steps[step];
  const progressPercent = Math.round(((step + 1) / totalSteps) * 100);

  const isOptional = !current.required && !current.isReview;
  const canAdvance = current.valid();

  const next = () => { if (canAdvance) setStep(s => Math.min(s + 1, totalSteps - 1)); };
  const skip = () => { if (isOptional) setStep(s => Math.min(s + 1, totalSteps - 1)); };
  const back = () => setStep(s => Math.max(s - 1, 0));

  // Enter advances to next step; Shift+Enter for newline in textareas.
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (current.isReview) submit();
      else if (canAdvance) next();
    }
  };

  const submit = async () => {
    console.log('[BrandKit] submit click — canSave:', canSave, 'name:', name, 'color:', color);
    if (!canSave) {
      console.warn('[BrandKit] submit blocked — canSave is false');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        primary_color: color,
        logo_url: logoUrl.trim(),
        voice: voice.trim(),
        business_type: businessType.trim(),
        business_description: businessDescription.trim(),
        services: services.trim(),
        usps: usps.trim(),
        target_customer: targetCustomer.trim(),
        phone: phone.trim(),
        years_in_business: yearsInBusiness.trim(),
        default_tone: defaultTone,
        default_length: defaultLength,
      });
      console.log('[BrandKit] onSave finished');
    } catch (e) {
      console.error('[BrandKit] onSave threw:', e);
    } finally {
      setSaving(false);
    }
  };

  const renderField = () => {
    switch (current.key) {
      case 'identity':
        return (
          <div className="space-y-5">
            <FieldLabel label="Brand name" required />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="e.g. Acme Co., Brightwood Studio, Northstar Dental"
              className={tfInputCls}
              autoFocus
            />

            <FieldLabel label="Primary color" required />
            <div className="flex items-center gap-3">
              <label
                className="relative w-14 h-14 rounded-2xl border-2 border-[#e5e5e5] dark:border-[#333333] cursor-pointer overflow-hidden shrink-0"
                style={{ backgroundColor: safeColor }}
              >
                <input type="color" value={safeColor} onChange={(e) => setColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                onKeyDown={onKeyDown}
                className="flex-1 px-4 py-3.5 bg-white dark:bg-[#181818] border-2 border-[#e5e5e5] dark:border-[#333333] rounded-2xl text-base font-mono text-[#262626] dark:text-white focus:outline-none focus:border-[#075056] dark:focus:border-[#5eead4] transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-xl border-2 transition-all hover:scale-105 ${color.toLowerCase() === c ? 'border-[#262626] dark:border-white ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#1a1a1a] ring-[#075056]' : 'border-[#e5e5e5] dark:border-[#333333]'}`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>

            <FieldLabel label="Logo URL" optional />
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="https://yourbrand.com/logo.png"
              className={tfInputCls}
            />
          </div>
        );

      case 'about':
        return (
          <div className="space-y-5">
            <FieldLabel label="What kind of business is it?" required />
            <input
              type="text"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Marketing agency, dental clinic, SaaS, café, freelancer…"
              className={tfInputCls}
              autoFocus
            />

            <FieldLabel label="Describe it in a sentence or two" optional />
            <textarea
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder="What you do, who you do it for, and how you do it."
              rows={3}
              className={`${tfInputCls} resize-none`}
            />
          </div>
        );

      case 'offer':
        return (
          <div className="space-y-5">
            <FieldLabel label="Services or products" required />
            <textarea
              value={services}
              onChange={(e) => setServices(e.target.value)}
              placeholder="List what you sell or do. One per line works great."
              rows={3}
              className={`${tfInputCls} resize-none`}
              autoFocus
            />

            <FieldLabel label="What sets you apart" optional />
            <textarea
              value={usps}
              onChange={(e) => setUsps(e.target.value)}
              placeholder="Awards, guarantees, specialties, anything you're proud of."
              rows={3}
              className={`${tfInputCls} resize-none`}
            />
          </div>
        );

      case 'audience':
        return (
          <div className="space-y-5">
            <FieldLabel label="Target customer" required />
            <input
              type="text"
              value={targetCustomer}
              onChange={(e) => setTargetCustomer(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Who is this for? e.g. small businesses, parents, designers…"
              className={tfInputCls}
              autoFocus
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel label="Years in business" optional />
                <input
                  type="text"
                  value={yearsInBusiness}
                  onChange={(e) => setYearsInBusiness(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="e.g. 12"
                  className={tfInputCls}
                />
              </div>
              <div>
                <FieldLabel label="Phone" optional />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="+1 (555) 123-4567"
                  className={tfInputCls}
                />
              </div>
            </div>
          </div>
        );

      case 'voice':
        return (
          <textarea
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            placeholder="Casual and warm. Avoid jargon. Talk like a friend giving advice."
            rows={5}
            className={`${tfInputCls} resize-none`}
            autoFocus
          />
        );

      case 'defaults':
        return (
          <div className="space-y-6">
            <div>
              <FieldLabel label="Default tone" optional />
              <PillSelect options={TONE_OPTIONS} value={defaultTone} onChange={setDefaultTone} allowEmpty="No preference" />
              <SamplePreview text={TONE_EXAMPLES[defaultTone] || TONE_EXAMPLES['']} />
            </div>
            <div>
              <FieldLabel label="Default length" optional />
              <PillSelect options={LENGTH_OPTIONS} value={defaultLength} onChange={setDefaultLength} allowEmpty="No preference" />
              <SamplePreview text={LENGTH_EXAMPLES[defaultLength] || LENGTH_EXAMPLES['']} small />
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#ececec] dark:border-[#2a2a2a] overflow-hidden shadow-sm">
            <div className="relative h-28 flex items-center justify-center" style={{ background: safeColor }}>
              {logoUrl && /^https?:\/\//.test(logoUrl) ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={logoUrl} alt="" className="max-h-16 max-w-[60%] object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <div className="text-white font-bold text-4xl tracking-tight" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>
                  {(name || '?')[0]?.toUpperCase()}
                </div>
              )}
              <span className="absolute top-3 right-3 text-[10px] font-mono font-semibold text-white bg-black/40 backdrop-blur-md border border-white/15 px-2 py-0.5 rounded-full">{safeColor.toUpperCase()}</span>
            </div>
            <div className="p-4">
              <div className="text-base font-bold text-[#262626] dark:text-white truncate">{name || 'Brand name'}</div>
              {businessType && <div className="text-xs text-[#777777] dark:text-[#888888] mt-0.5 truncate">{businessType}</div>}
              {voice && <div className="mt-3 text-xs italic text-[#555555] dark:text-[#bbbbbb] line-clamp-2">“{voice}”</div>}
              {(defaultTone || defaultLength) && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {defaultTone && <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-[#075056]/10 dark:bg-[#5eead4]/10 text-[#075056] dark:text-[#5eead4]">{defaultTone}</span>}
                  {defaultLength && <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-[#262626]/5 dark:bg-white/5 text-[#555555] dark:text-[#aaaaaa]">{defaultLength}</span>}
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in" onClick={onCancel}>
      {/* Soft pastel backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#075056]/15 via-white/60 to-[#5eead4]/15 dark:from-[#0a0a0a]/95 dark:via-[#0a0a0a]/95 dark:to-[#0a0a0a]/95 backdrop-blur-sm" />

      {/* Modal stack with layered offset cards */}
      <div className="relative w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
        {/* Decorative offset layers */}
        <div className="absolute inset-0 -rotate-3 translate-x-3 translate-y-3 bg-white/40 dark:bg-[#1a1a1a]/40 border border-[#e5e5e5]/40 dark:border-[#2a2a2a]/40 rounded-3xl" aria-hidden />
        <div className="absolute inset-0 rotate-2 -translate-x-2 translate-y-1 bg-white/60 dark:bg-[#1a1a1a]/60 border border-[#e5e5e5]/60 dark:border-[#2a2a2a]/60 rounded-3xl" aria-hidden />

        {/* Main card */}
        <div className="relative bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.25)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.65)] overflow-hidden">
          {/* Top: progress + close */}
          <div className="px-7 pt-6 pb-3 flex items-center gap-4">
            <div className="flex-1"><BarbershopProgress percent={progressPercent} /></div>
            <button
              onClick={onCancel}
              className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-[#777777] dark:text-[#aaaaaa] hover:text-[#262626] dark:hover:text-white bg-[#f5f5f5] dark:bg-[#262626] hover:bg-[#ececec] dark:hover:bg-[#333333] border border-[#e5e5e5] dark:border-[#333333] transition-all"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Step body */}
          <div key={current.key} className="px-7 pt-4 pb-6 min-h-[420px] max-h-[70vh] overflow-y-auto flex flex-col animate-fade-in">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#075056] dark:text-[#5eead4] mb-3">
              {current.isReview ? 'Review' : `Question ${step + 1}`}
            </div>
            <h2 className="text-2xl sm:text-[28px] font-black text-[#262626] dark:text-white tracking-[-0.02em] leading-tight mb-2">
              {current.title}
            </h2>
            {current.hint && (
              <p className="text-base text-[#555555] dark:text-[#cccccc] mb-6 leading-relaxed">{current.hint}</p>
            )}
            <div className="flex-1">
              {renderField()}
            </div>
          </div>

          {/* Footer */}
          <div className="px-7 pb-6 pt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={back}
                disabled={step === 0}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl text-[#777777] dark:text-[#888888] hover:text-[#262626] dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#262626] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Back
              </button>
              {isOptional && (
                <button
                  onClick={skip}
                  className="px-4 py-2.5 text-sm font-semibold rounded-xl text-[#aaaaaa] hover:text-[#262626] dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#262626] transition-all"
                >
                  Skip
                </button>
              )}
            </div>

            {current.isReview ? (
              <button
                onClick={submit}
                disabled={!canSave}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#075056] text-white text-sm font-bold rounded-xl hover:bg-[#064548] hover:shadow-lg hover:shadow-[#075056]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? 'Saving…' : (mode === 'create' ? 'Create kit' : 'Save changes')}
              </button>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={next}
                  disabled={!canAdvance}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#075056] text-white text-sm font-bold rounded-xl hover:bg-[#064548] hover:shadow-lg hover:shadow-[#075056]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </button>
                {current.required && !canAdvance && (
                  <span className="text-[11px] text-[#aaaaaa] dark:text-[#777777]">Fill the required field to continue</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const tfInputCls = 'w-full px-4 py-3.5 bg-white dark:bg-[#181818] border-2 border-[#e5e5e5] dark:border-[#333333] rounded-2xl text-base text-[#262626] dark:text-white placeholder:text-[#bbbbbb] dark:placeholder:text-[#555555] focus:outline-none focus:border-[#075056] dark:focus:border-[#5eead4] transition-colors';

const TONE_EXAMPLES = {
  '': 'AI will pick a tone based on the page. Usually balanced and professional.',
  'Professional': 'Our team delivers reliable, results-driven service backed by deep expertise in the field.',
  'Friendly': "Hey there, we love what we do, and we'll always treat you like a friend.",
  'Bold': 'Stop settling. Get the result you actually want, fast, and without the runaround.',
  'Playful': "Easy peasy. Pop the kettle on, we've got the rest covered. ✨",
  'Authoritative': 'Trusted by thousands. Backed by data. Industry-leading methods, every time.',
  'Conversational': "Look, we get it. You want it done right, so here's how we actually help.",
};

const LENGTH_EXAMPLES = {
  '': 'AI will choose based on the page. Typically medium-length copy.',
  'Short': '~1 to 2 punchy sentences per section. Best for tight, conversion-focused landing pages.',
  'Medium': '~2 to 3 sentences per section. A balanced default that works for most pages.',
  'Long': '~4 to 6 sentences per section. Great for blogs, comparisons, and detail-rich pages.',
};

function FieldLabel({ label, required, optional }) {
  return (
    <div className="block text-[12px] font-bold uppercase tracking-[0.14em] text-[#666666] dark:text-[#bbbbbb] mb-2">
      {label}
      {required && <span className="text-[#dc2626] dark:text-[#f87171] ml-1">*</span>}
      {optional && <span className="ml-1.5 normal-case tracking-normal font-medium text-[#aaaaaa] dark:text-[#777777]">optional</span>}
    </div>
  );
}

function SamplePreview({ text, small }) {
  return (
    <div className="mt-3 p-4 rounded-2xl bg-[#075056]/5 dark:bg-[#5eead4]/5 border border-[#075056]/10 dark:border-[#5eead4]/15">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#075056] dark:text-[#5eead4] mb-1.5">Example</div>
      <p className={`${small ? 'text-xs' : 'text-sm'} italic text-[#444444] dark:text-[#dddddd] leading-relaxed`}>{text}</p>
    </div>
  );
}

function PillSelect({ options, value, onChange, allowEmpty }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {allowEmpty && (
        <button
          type="button"
          onClick={() => onChange('')}
          className={`px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-all hover:-translate-y-0.5 ${
            value === ''
              ? 'border-[#075056] bg-[#075056]/5 dark:bg-[#075056]/10 text-[#075056] dark:text-[#5eead4]'
              : 'border-[#e5e5e5] dark:border-[#333333] text-[#777777] dark:text-[#888888] hover:border-[#aaaaaa]'
          }`}
        >
          {allowEmpty}
        </button>
      )}
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-all hover:-translate-y-0.5 ${
            value === opt
              ? 'border-[#075056] bg-[#075056]/5 dark:bg-[#075056]/10 text-[#075056] dark:text-[#5eead4]'
              : 'border-[#e5e5e5] dark:border-[#333333] text-[#262626] dark:text-white hover:border-[#aaaaaa]'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

