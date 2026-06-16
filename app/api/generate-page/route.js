import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { requireUser, safeError } from '../../../lib/apiAuth';
import { getAvailableCredits, spendCredits, bearerToken } from '../../../lib/credits';
import { CREDIT_COST } from '../../../lib/plans';
import { MODIFIERS, modifierOrDefault } from '../../../lib/modifiers';

export const maxDuration = 180; // Vercel: blog posts need more time than landing pages.

export async function POST(request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;

  console.log('=== API ROUTE STARTED (Claude) ===');

  try {
    const body = await request.json();
    const { keyword, location, service, template_html, projectId, businessDescription, services, usps, targetCustomer, phone, yearsInBusiness, tone, length, brandKit, contentType, blogBrief, modifierType: modifierTypeRaw, titleOverride, subHeadOverride, featuredImageUrl, featuredImageCredit } = body;

    // Programmatic-SEO modifier comes from lib/modifiers (single source of truth).
    const modifierType = modifierOrDefault(modifierTypeRaw);
    const mod = MODIFIERS[modifierType];
    const hasModifier = modifierType !== 'none' && !!location;

    console.log('Request received:', {
      keyword,
      location,
      hasTemplate: !!template_html,
      templateLength: template_html?.length,
    });

    if (!template_html) {
      return NextResponse.json({ error: 'Template HTML is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Claude API key not configured' }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });

    // Strip <script> tags only. Keep all <style> blocks and inline styles intact —
    // they are part of the template design and must be preserved in the output.
    const extractedStyles = [];
    let templateForClaude = template_html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (match) => {
        extractedStyles.push(match);
        return `<!-- STYLE_BLOCK_${extractedStyles.length - 1} -->`; // placeholder marker
      });

    // Content-template overrides: if the user pre-wrote a title or hero
    // subtitle (already resolved per-row on the client), pre-substitute the
    // matching placeholders so the AI never sees those slots. Keeps the
    // user's exact phrasing (including variation tokens) verbatim.
    if (titleOverride) {
      templateForClaude = templateForClaude.replace(/\{\{\s*HERO_HEADLINE\s*\}\}/g, titleOverride);
      templateForClaude = templateForClaude.replace(/\{\{\s*TITLE\s*\}\}/g, titleOverride);
    }
    if (subHeadOverride) {
      templateForClaude = templateForClaude.replace(/\{\{\s*HERO_SUBHEADLINE\s*\}\}/g, subHeadOverride);
      templateForClaude = templateForClaude.replace(/\{\{\s*SUBTITLE\s*\}\}/g, subHeadOverride);
      templateForClaude = templateForClaude.replace(/\{\{\s*DECK\s*\}\}/g, subHeadOverride);
    }
    // Hero image block — templates wrap their image markup with comment
    // markers so we can either keep + populate, or strip the block entirely
    // when no image is set. Avoids leaving an empty <img src="{{HERO_IMAGE}}">
    // in the output when the user doesn't pick a featured image.
    if (featuredImageUrl) {
      // Keep the block; substitute placeholders.
      templateForClaude = templateForClaude.replace(/<!--\s*\{\{\s*HERO_IMG_BLOCK_START\s*\}\}\s*-->/g, '');
      templateForClaude = templateForClaude.replace(/<!--\s*\{\{\s*HERO_IMG_BLOCK_END\s*\}\}\s*-->/g, '');
      templateForClaude = templateForClaude.replace(/\{\{\s*HERO_IMAGE_URL\s*\}\}/g, featuredImageUrl);
      templateForClaude = templateForClaude.replace(/\{\{\s*HERO_IMAGE\s*\}\}/g, featuredImageUrl);
      templateForClaude = templateForClaude.replace(/\{\{\s*IMAGE_URL\s*\}\}/g, featuredImageUrl);
      // Credit caption — Unsplash TOS requires attribution. When the image is
      // user-uploaded, featuredImageCredit is empty and the caption renders as
      // an empty <p> (visually invisible, no layout impact).
      if (featuredImageCredit && featuredImageCredit.photographer) {
        const safeName = String(featuredImageCredit.photographer).replace(/[<>]/g, '');
        const safeUrl = String(featuredImageCredit.photographer_url || 'https://unsplash.com').replace(/[<>"]/g, '');
        const credit = `Photo by <a href="${safeUrl}?utm_source=grogoliath&utm_medium=referral" target="_blank" rel="noopener">${safeName}</a> on <a href="https://unsplash.com/?utm_source=grogoliath&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a>`;
        templateForClaude = templateForClaude.replace(/\{\{\s*HERO_IMG_CREDIT\s*\}\}/g, credit);
      } else {
        templateForClaude = templateForClaude.replace(/\{\{\s*HERO_IMG_CREDIT\s*\}\}/g, '');
      }
    } else {
      // No image — strip the entire HERO_IMG_BLOCK block including its markers
      // so the rendered hero looks the same as it did pre-feature.
      templateForClaude = templateForClaude.replace(
        /<!--\s*\{\{\s*HERO_IMG_BLOCK_START\s*\}\}\s*-->[\s\S]*?<!--\s*\{\{\s*HERO_IMG_BLOCK_END\s*\}\}\s*-->/g,
        ''
      );
      // Also clear any straggling placeholders if the template had them
      // outside the block (unlikely, but defensive).
      templateForClaude = templateForClaude.replace(/\{\{\s*HERO_IMAGE_URL\s*\}\}/g, '');
      templateForClaude = templateForClaude.replace(/\{\{\s*HERO_IMAGE\s*\}\}/g, '');
      templateForClaude = templateForClaude.replace(/\{\{\s*IMAGE_URL\s*\}\}/g, '');
      templateForClaude = templateForClaude.replace(/\{\{\s*HERO_IMG_CREDIT\s*\}\}/g, '');
    }

    console.log(
      `Template: ${template_html.length} chars total, ` +
      `${extractedStyles.length} style block(s) extracted, ` +
      `${templateForClaude.length} chars sent to Claude`
    );

    const businessName = service || keyword;

    const brandKitBlock = brandKit && typeof brandKit === 'object' ? `

BRAND KIT — apply consistently throughout the page:
- Brand name: ${brandKit.name || '(unnamed)'}
- Primary color: ${brandKit.primary_color || '(none)'}
${brandKit.logo_url ? `- Logo URL: ${brandKit.logo_url}` : ''}
${brandKit.voice ? `- Voice / tone (overrides the Tone field above for word choice): ${brandKit.voice}\n  Match this voice in every headline, button, and body copy.` : ''}
- Use the brand name in the navigation logo, headings, and footer copyright.
` : '';

    const isBlog = contentType === 'blog';

    // ── Credit gate: block before doing expensive AI work if the user is out. ──
    // We pre-check here (fail fast, no wasted API spend) and deduct only on
    // success below, so a failed generation never costs a credit.
    const _token = bearerToken(request);
    const _cost = isBlog ? CREDIT_COST.blog : CREDIT_COST.landing;
    const { available } = await getAvailableCredits(_token, auth.user.id);
    if (available < _cost) {
      return NextResponse.json(
        {
          error: 'INSUFFICIENT_CREDITS',
          message: `This ${isBlog ? 'article' : 'page'} costs ${_cost} credit${_cost > 1 ? 's' : ''}, but you have ${available} left. Upgrade your plan or add a top-up pack to keep generating.`,
        },
        { status: 402 }
      );
    }

    // Current calendar context — passed into the prompt so the model never
    // defaults to its training-data year (e.g. writes "in 2025" in 2026).
    const _now = new Date();
    const currentYear = _now.getFullYear();
    const currentMonthYear = _now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Length guidance differs for landing pages (per-section) vs blogs (total word count).
    const blogWordTarget = length === 'Short' ? '600–900' : length === 'Long' ? '2,000–3,000' : '1,200–1,800';
    const pageSentenceLen = length === 'Short' ? '1 sentence' : length === 'Long' ? '3–4 sentences' : '2 sentences';

    // Shared style rules injected into BOTH the landing-page and blog prompts.
    // Em dashes are an AI tell that the user wants gone; current-year
    // adherence prevents stale "in 2025" copy.
    const sharedStyleRules = `
CURRENT CONTEXT (use these, not your training-data defaults):
- Today is ${currentMonthYear}. The current year is ${currentYear}.
- Any reference to a current/recent year MUST use ${currentYear}. Never write "in 2024" or "in 2025" as if it were now.

FORBIDDEN PUNCTUATION:
- Do NOT use em dashes (—) anywhere in the copy. Em dashes are banned.
- Do NOT use en dashes (–) either, except inside numeric ranges like "$10-$20" — and even then, prefer a plain hyphen (-).
- Replace anywhere you'd reach for an em dash with: a comma, a period, a colon, parentheses, or two separate sentences. Read each sentence aloud and pick the punctuation that sounds most natural.
- Plain hyphens (-) are fine for compound words ("first-time", "long-form").
`;

    const goalLine = (() => {
      if (!blogBrief?.goal) return '';
      const map = {
        rank: 'rank for the target keyword (lean into search-intent signals; cover what people actually search for)',
        leads: 'capture leads (every section should drive toward a soft conversion; end with a clear lead-capture CTA)',
        signups: 'drive newsletter signups (build curiosity and end with a teaser about more deep dives via email)',
        authority: 'establish authority and expertise (cite data, use precise terminology, defend strong opinions)',
      };
      return map[blogBrief.goal] || '';
    })();

    const blogTypeLine = (() => {
      if (!blogBrief?.type) return '';
      const map = {
        'how-to': 'how-to article — practical, step-by-step structure with numbered or clearly-marked steps',
        listicle: 'listicle — a numbered list with each item as a short standalone mini-section',
        comparison: 'comparison — analyse multiple options against shared criteria; use a balanced verdict',
        guide: 'deep guide — comprehensive coverage with sub-sections, examples, and "common mistakes" callouts',
        opinion: 'opinion / POV piece — argue a clear thesis, back it with evidence, anticipate counterarguments',
      };
      return map[blogBrief.type] || '';
    })();

    // ── Landing-page prompt ──
    const pagePrompt = `You are filling in an HTML landing page template. Replace every {{PLACEHOLDER}} with unique, compelling copy. Keep ALL HTML tags, attributes, and inline styles exactly as-is.

BUSINESS INFO:
- Business: ${businessName}
- Primary keyword: ${keyword}
${hasModifier ? `- ${mod.valueLabel}: ${location}  (modifier type: "${modifierType}")` : '- No additional modifier (single-keyword page).'}
- Tone: ${tone || 'Professional'}
${businessDescription ? `- About the business: ${businessDescription}` : ''}
${services ? `- Services offered: ${services}` : ''}
${usps ? `- What makes them different (USPs): ${usps}` : ''}
${targetCustomer ? `- Target customer: ${targetCustomer}` : ''}
${yearsInBusiness ? `- Years in business: ${yearsInBusiness}` : ''}
${phone ? `- Phone number: ${phone}` : ''}
${brandKitBlock}

PROGRAMMATIC ANGLE — critical, read before writing anything:
- This is a "${modifierType}" page${hasModifier ? `, where the modifier is "${location}"` : ''}.
${hasModifier ? `- Natural phrasing: "${keyword} ${mod.preposition} ${location}"  (e.g. "${mod.example}").
- Use that phrasing for the hero, the meta description, CTAs, and anywhere it reads naturally.` : `- This page is about the keyword alone — do NOT invent a location, audience, or comparison if one wasn't provided.`}

DUPLICATION RULES (very important):
${hasModifier ? `- The user may have already included "${location}" in the keyword (e.g. keyword "chat line in Houston" with modifier "Houston"). If "${location}" already appears in the keyword (case-insensitive), DO NOT add it again. Treat the keyword as the complete phrase.
- NEVER write "${location}" twice in the same sentence (e.g. "chat lines in Houston in Houston" is FORBIDDEN).
- If a placeholder substitution would produce a duplicate (because {{LOCATION}} is replaced literally with "${location}"), restructure the surrounding sentence so it still reads naturally and the modifier appears once.` : '- Do not invent a fake city/audience/comparison just to fill a placeholder. If the template asks for one and there is none, generalise the copy instead.'}

FIXED REPLACEMENTS (use these exact values):
- {{KEYWORD}} → ${keyword}
- {{LOCATION}} → ${hasModifier ? location : ''}  ${hasModifier ? `(this represents the ${mod.valueLabel.toLowerCase()}, not a city)` : '(no modifier — leave any {{LOCATION}} usage out of natural phrasing)'}
- {{SERVICE}} → ${businessName}
${phone ? `- {{PHONE}} → ${phone}` : '- {{PHONE}} → Call us today'}

CONTENT PLACEHOLDERS — write unique copy for each one:
- {{HERO_HEADLINE}} → A punchy, specific main headline using the natural phrasing above${hasModifier ? ` (e.g. "${mod.example}" pattern, adapted)` : ''}.
- {{HERO_SUBHEADLINE}} → 1–2 sentences expanding on the headline, mentioning ${hasModifier ? 'the modifier and service' : 'the service'} naturally
- {{META_DESCRIPTION}} → 150-char SEO meta description for this page
- {{SERVICES_HEADLINE}} → Heading for the services/features section
- {{SERVICES_INTRO}} → Intro paragraph for the services section
- {{FEATURE_1_TITLE}}, {{FEATURE_2_TITLE}}, {{FEATURE_3_TITLE}} → Three distinct service names${services ? ` — draw from: ${services}` : ''}
- {{FEATURE_1_TEXT}}, {{FEATURE_2_TEXT}}, {{FEATURE_3_TEXT}} → Description for each service (${pageSentenceLen})
- {{WHY_HEADLINE}} → Heading for the "why choose us" section
- {{WHY_INTRO}} → Intro for the why section
- {{WHY_1_TITLE}}, {{WHY_2_TITLE}}, {{WHY_3_TITLE}} → Three trust/differentiator points${usps ? ` — draw from: ${usps}` : ''}
- {{WHY_1_TEXT}}, {{WHY_2_TEXT}}, {{WHY_3_TEXT}} → Explanation for each point${yearsInBusiness ? ` — mention ${yearsInBusiness} years of experience where relevant` : ''}
- {{TESTIMONIAL_1_QUOTE}}, {{TESTIMONIAL_2_QUOTE}} → Realistic customer review quotes that fit the ${modifierType} context naturally
- {{TESTIMONIAL_1_NAME}}, {{TESTIMONIAL_2_NAME}} → Realistic customer names${modifierType === 'location' ? ' (use local-sounding names)' : ''}
- {{CTA_HEADLINE}} → Call-to-action section headline
- {{CTA_SUBTEXT}} → Supporting sentence under the CTA headline
- {{PROCESS_HEADLINE}} → Heading for the "how it works" section
- {{PROCESS_INTRO}} → 1–2 sentences introducing the process
- {{STEP_1_TITLE}}, {{STEP_2_TITLE}}, {{STEP_3_TITLE}} → Three sequential steps in the service process
- {{STEP_1_TEXT}}, {{STEP_2_TEXT}}, {{STEP_3_TEXT}} → Brief description for each step
- {{FAQ_HEADLINE}} → Heading for the FAQ section
- {{FAQ_1_Q}}, {{FAQ_2_Q}}, {{FAQ_3_Q}}, {{FAQ_4_Q}} → Four realistic customer questions about this service in the ${modifierType} context
- {{FAQ_1_A}}, {{FAQ_2_A}}, {{FAQ_3_A}}, {{FAQ_4_A}} → Helpful, specific answers to each FAQ question
- {{AREA_1}} through {{AREA_6}} → ${mod.areaLine}
- {{TRUST_1}}, {{TRUST_2}}, {{TRUST_3}}, {{TRUST_4}} → Short trust signals
- {{STAT_1_NUMBER}}, {{STAT_2_NUMBER}}, {{STAT_3_NUMBER}} → Impressive stats
- {{STAT_1_LABEL}}, {{STAT_2_LABEL}}, {{STAT_3_LABEL}} → Labels for each stat
- Any other {{PLACEHOLDER}} → Write appropriate content for its context in the page

${sharedStyleRules}
RULES:
- Every placeholder must produce DIFFERENT copy. Do NOT repeat the same text in multiple sections.
- Do NOT use generic filler. Make copy specific to this business, service, and location.
- Do NOT touch <!-- STYLE_BLOCK_N --> markers. Leave them exactly as written.
- Do NOT modify any HTML tags, class names, or style attributes.
- Return ONLY the complete filled HTML, no markdown, no commentary.

TEMPLATE:
${templateForClaude}`;

    // ── Blog-post prompt ──
    const blogPrompt = `You are writing a long-form blog article inside an HTML template. Replace every {{PLACEHOLDER}} in the template with substantive editorial content. Keep ALL HTML tags, attributes, and inline styles exactly as-is.

VOICE & STRUCTURE:
- This is a BLOG / EDITORIAL article, NOT a sales page. Write like a human journalist or domain expert, not a marketer.
- Substantive paragraphs, concrete examples, specific data points. NO sales-pitch language, NO generic filler.
- Tone: ${tone || 'Professional'}
${blogTypeLine ? `- Article type: ${blogTypeLine}` : ''}
${goalLine ? `- The article should: ${goalLine}` : ''}
- Target length: roughly ${blogWordTarget} words across the body sections.

EDITORIAL STANDARDS (these determine whether the article ranks — non-negotiable):
- UNIQUE POINT OF VIEW: Write from a specific stance or perspective, not a neutral summary of what's already on the web. Make a claim and back it up. AI systems compare across many sources — a clear viewpoint stands out; a rehash does not.
- NON-COMMODITY ANGLE: Avoid generic, common-knowledge framings ("7 Tips for First-Time Homebuyers", "Everything You Need to Know About X"). Pick a specific, experience-anchored angle ("Why We Waived the Inspection & Saved Money: A Look Inside the Sewer Line"). The more the headline + thesis could only have been written by someone with skin in the game, the better.
- FIRST-HAND PERSPECTIVE & PRIMARY SOURCES: Anchor claims in named experts, primary research, original data, or direct observation. Prefer "according to the 2025 BLS report…" or "in our internal testing of 14 tools across 6 weeks…" over "many experts say…" or "studies show…". If you cite a stat, name the source year and the publishing body.
- PEOPLE-FIRST, NOT KEYWORD-FIRST: Write for a human reader trying to solve a specific problem. Do not stuff keywords or write paragraphs that exist only to capture variations of a search query.
- SCANNABLE STRUCTURE: Short paragraphs (2–4 sentences). Clear H2 sections with descriptive headings (not "Conclusion" or "Background"). TL;DR or key takeaways near the top so readers get the answer fast.
- NO FILLER, NO HEDGING: Cut throat-clearing intros ("In today's fast-paced world…"), obvious filler ("It's important to note that…"), and AI-style hedges ("Many people believe…"). Every paragraph must earn its place.
- WRITE LIKE AN EXPERT WHO'S DONE THE WORK: Use specific numbers, named tools, real examples, dates, and counterintuitive findings. Generic = invisible.

THE BRIEF:
- Publication / brand: ${businessName}
- Target keyword: ${keyword}
${blogBrief?.title ? `- USER-SUPPLIED TITLE (use VERBATIM for the headline, no edits): "${blogBrief.title}"` : ''}
${blogBrief?.angle ? `- Angle / thesis: ${blogBrief.angle}` : ''}
${blogBrief?.reader ? `- Reader: ${blogBrief.reader}` : ''}
${blogBrief?.keyPoints ? `- Key points to cover:\n${blogBrief.keyPoints.split('\n').map(l => '  • ' + l.trim()).join('\n')}` : ''}
${blogBrief?.references ? `- Sources / references to weave in:\n${blogBrief.references.split('\n').map(l => '  • ' + l.trim()).join('\n')}` : ''}
${businessDescription ? `- Background on the publication: ${businessDescription}` : ''}
${brandKitBlock}

COUNT ADHERENCE (critical):
- If the title, angle, or brief mentions a specific COUNT ("5 best", "7 tips", "top 10", "3 ways"), produce EXACTLY that many distinct, fully-developed items. Do not pivot to a comparison of 2, do not summarize, do not skip items because the template feels short — invent or repurpose placeholders so every promised item gets its own named entity + body.
- If the template has fewer slots than the promised count, condense bodies but still name and describe ALL of them. If the template has more slots than the promised count, fill the extras with sub-points of the existing items, not new ones.

FIXED REPLACEMENTS (use these exact values):
- {{KEYWORD}} → ${keyword}
${location ? `- {{LOCATION}} → ${location}` : ''}
- {{SERVICE}} → ${businessName}

CONTENT PLACEHOLDERS — write unique copy for each:
- {{HERO_HEADLINE}} / {{TITLE}} → ${blogBrief?.title ? `Use the USER-SUPPLIED TITLE above EXACTLY, character-for-character. Do not rewrite, expand, shorten, add a subtitle, or change punctuation.` : 'The article headline. Clear, specific, ideally containing the target keyword. NOT clickbait.'}
- {{HERO_SUBHEADLINE}} / {{SUBTITLE}} / {{DECK}} → A 1–2 sentence deck/standfirst that previews the article's point of view.
- {{META_DESCRIPTION}} → 150-char SEO meta description for the article.
- {{INTRO}} / {{LEAD}} / {{OPENING_PARAGRAPH}} → A strong 80–120 word opening that hooks the reader, states the article's thesis, and tells them what they'll get out of reading.
- {{SECTION_*_HEADLINE}} / {{H2_*}} → Section headings. Use sub-keywords where natural; never write generic ones like "Conclusion" or "Introduction".
- {{SECTION_*_BODY}} / {{P_*}} / {{PARAGRAPH_*}} / {{BODY_*}} → 1–3 substantive paragraphs each, with specific examples, comparisons, numbers, or quotes. NEVER use placeholder/lorem text. Cite a source where claimed as fact.
- {{LISTICLE_*_TITLE}} / {{ITEM_*_TITLE}} → If the template has list items, each must be a distinct, named entity (not "Item 1").
- {{LISTICLE_*_BODY}} / {{ITEM_*_BODY}} → 2–4 sentences explaining each list item with real specifics.
- {{PROS_*}} / {{CONS_*}} → If a pros/cons block exists, list 3–4 of each with concrete reasoning, not vague claims.
- {{QUOTE}} / {{PULLQUOTE}} → A meaningful sentence-length quote from the article itself, or an attributed quote if a source supports one.
- {{KEY_TAKEAWAYS}} / {{TLDR}} → 3–5 bullet-point takeaways.
- {{FAQ_*_Q}} / {{FAQ_*_A}} → Real, on-topic questions a reader of this article would type into Google, with thorough answers.
- {{CTA_HEADLINE}} / {{CTA_SUBTEXT}} → ${blogBrief?.goal === 'leads' ? 'A lead-capture pitch that directly relates to the article topic.' : blogBrief?.goal === 'signups' ? 'A newsletter pitch that teases more analysis like this.' : 'A soft closing that points to the next logical read or action.'}
- {{AUTHOR_NAME}} / {{AUTHOR_BIO}} → A realistic byline (use the publication name plus a plausible editorial role) and a 1-sentence bio.
- {{PUBLISH_DATE}} → Output EXACTLY this element (do NOT write a literal date): <span data-auto-date></span>
  This placeholder is replaced with the current date at view time so the article never goes stale.
- {{READING_TIME}} → Realistic estimate (e.g. "8 min read") based on the actual word count.
- Any landing-page-specific placeholders ({{SERVICES_*}}, {{FEATURE_*}}, {{TESTIMONIAL_*}}, {{STAT_*}}, {{AREA_*}}, {{TRUST_*}}) → ADAPT them to article context. e.g. {{FEATURE_1_TITLE}} can become a sub-topic heading. {{TESTIMONIAL_*}} can become an expert quote. {{STAT_*}} can become a real datapoint from the topic area.
- Any other {{PLACEHOLDER}} → Write appropriate content for its context.

${sharedStyleRules}
RULES:
- This is editorial content. Never write sales copy ("our service", "contact us today") unless the CTA section explicitly calls for it.
- Specific beats generic. "47% of US bookkeepers say..." beats "many bookkeepers say...".
- Vary sentence length. Read aloud, and if it sounds like AI, rewrite.
- Do NOT touch <!-- STYLE_BLOCK_N --> markers. Leave them exactly as written.
- Do NOT modify any HTML tags, class names, or style attributes.
- Return ONLY the complete filled HTML, no markdown, no commentary.

TEMPLATE:
${templateForClaude}`;

    const prompt = isBlog ? blogPrompt : pagePrompt;

    console.log(`Prompt length: ${prompt.length} chars. Calling Claude...`);

    const messagePromise = anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      messages: [{ role: 'user', content: prompt }],
    });

    // Blogs are longer and need more time. Page generation is faster.
    // Keep these BELOW the client's abort timeout so we surface a real
    // error message instead of the client giving up first.
    const claudeTimeoutMs = isBlog ? 160000 : 100000;
    console.log(`[generate-page] calling Claude (${isBlog ? 'blog' : 'page'}, ${claudeTimeoutMs / 1000}s timeout)…`);
    const startTime = Date.now();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Claude API timeout after ${claudeTimeoutMs / 1000}s`)), claudeTimeoutMs)
    );

    const message = await Promise.race([messagePromise, timeoutPromise]);
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[generate-page] Claude responded in ${elapsedSec}s, stop_reason: ${message.stop_reason}`);

    if (message.stop_reason === 'max_tokens') {
      console.warn('WARNING: Claude output was truncated — template may be too large');
    }

    let filledHtml = message.content[0]?.text?.trim();
    if (!filledHtml) throw new Error('Claude returned empty response');

    // Strip any markdown fences Claude might add
    if (filledHtml.startsWith('```html')) {
      filledHtml = filledHtml.replace(/^```html\n?/, '').replace(/\n?```$/, '');
    } else if (filledHtml.startsWith('```')) {
      filledHtml = filledHtml.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    // Restore style blocks from marker comments Claude preserved
    let finalHtml = filledHtml;
    extractedStyles.forEach((styleBlock, i) => {
      finalHtml = finalHtml.replace(`<!-- STYLE_BLOCK_${i} -->`, styleBlock);
    });

    // If any markers weren't restored (Claude dropped them), inject all styles into <head>
    const remainingMarkers = finalHtml.match(/<!-- STYLE_BLOCK_\d+ -->/g);
    if (remainingMarkers && extractedStyles.length > 0) {
      const stylesBlock = extractedStyles.join('\n');
      if (/<\/head>/i.test(finalHtml)) {
        finalHtml = finalHtml.replace(/<\/head>/i, `${stylesBlock}\n</head>`);
      } else {
        finalHtml = stylesBlock + '\n' + finalHtml;
      }
      // Clean up any leftover markers
      finalHtml = finalHtml.replace(/<!-- STYLE_BLOCK_\d+ -->/g, '');
    }

    // Safety net for em/en dashes — the model often disobeys the prompt rule
    // and slips in "—" or "–" anyway. Strip them from VISIBLE text only,
    // never from inside HTML attributes (would corrupt the markup). The
    // regex matches " — ", "—", " – ", "–" outside of < > tags. We do this
    // by splitting on tag boundaries and only operating on text segments.
    finalHtml = finalHtml.split(/(<[^>]*>)/g).map((segment, i) => {
      if (i % 2 === 1) return segment; // odd indices = tag content, leave alone
      return segment
        .replace(/\s+—\s+/g, ', ')   // " — " between words → ", "
        .replace(/—/g, ', ')          // bare em dash → ", "
        .replace(/\s+–\s+/g, ', ')   // " – " between words → ", "
        .replace(/(\D)–(\D)/g, '$1, $2'); // en dash between non-digits → ", "
    }).join('');

    // For blog posts, bake in a tiny script that fills <span data-auto-date>
    // with the current date on every view, so the publish date never goes
    // stale. The AI is instructed to emit empty <span data-auto-date></span>
    // for {{PUBLISH_DATE}}. If it slipped a literal date in anyway, this
    // simply doesn't find anything to replace.
    if (isBlog) {
      const autoDateScript = `<script>(function(){try{var d=new Date(),f=d.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});document.querySelectorAll('[data-auto-date]').forEach(function(e){e.textContent=f});}catch(e){}})();</script>`;
      if (/<\/body>/i.test(finalHtml)) {
        finalHtml = finalHtml.replace(/<\/body>/i, autoDateScript + '</body>');
      } else {
        finalHtml = finalHtml + autoDateScript;
      }
    }

    console.log(`Final HTML: ${finalHtml.length} chars`);

    // Deduct credits now that generation succeeded (never on failure).
    await spendCredits(_token, _cost);

    const slug = keyword.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

    return NextResponse.json({
      html: finalHtml,
      content: finalHtml,
      keyword,
      location,
      service,
      slug,
      title: `${keyword} | ${service || keyword}`,
      projectId,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    return safeError('generate-page', error);
  }
}
