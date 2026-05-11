import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { requireUser, safeError } from '../../../lib/apiAuth';

export const maxDuration = 120; // Vercel: allow up to 120s (requires Pro plan for >10s)

export async function POST(request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;

  console.log('=== API ROUTE STARTED (Claude) ===');

  try {
    const body = await request.json();
    const { keyword, location, service, template_html, projectId, businessDescription, services, usps, targetCustomer, phone, yearsInBusiness, tone, length, brandKit, contentType } = body;

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
    const templateForClaude = template_html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (match) => {
        extractedStyles.push(match);
        return `<!-- STYLE_BLOCK_${extractedStyles.length - 1} -->`; // placeholder marker
      });

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
    const prompt = `You are filling in an HTML ${isBlog ? 'long-form blog post' : 'landing page'} template${isBlog ? '' : ' for a local service business'}. Replace every {{PLACEHOLDER}} with unique, compelling copy. Keep ALL HTML tags, attributes, and inline styles exactly as-is.${isBlog ? '\n\nThis is a BLOG POST — write substantive, well-researched paragraphs. Use specific examples, comparisons, and concrete details. Avoid sales-pitch language. Voice should feel like an editorial article, not a product page.' : ''}

BUSINESS INFO:
- Business: ${businessName}
- Location: ${location}
- Primary keyword: ${keyword}
- Tone: ${tone || 'Professional'}
${businessDescription ? `- About the business: ${businessDescription}` : ''}
${services ? `- Services offered: ${services}` : ''}
${usps ? `- What makes them different (USPs): ${usps}` : ''}
${targetCustomer ? `- Target customer: ${targetCustomer}` : ''}
${yearsInBusiness ? `- Years in business: ${yearsInBusiness}` : ''}
${phone ? `- Phone number: ${phone}` : ''}
${brandKitBlock}

FIXED REPLACEMENTS (use these exact values):
- {{KEYWORD}} → ${keyword}
- {{LOCATION}} → ${location}
- {{SERVICE}} → ${businessName}
${phone ? `- {{PHONE}} → ${phone}` : '- {{PHONE}} → Call us today'}

CONTENT PLACEHOLDERS — write unique copy for each one:
- {{HERO_HEADLINE}} → A punchy, specific main headline (e.g. "Chicago's Most Trusted Drain Cleaning Experts")
- {{HERO_SUBHEADLINE}} → 1–2 sentences expanding on the headline, mentioning the location and service
- {{META_DESCRIPTION}} → 150-char SEO meta description for this page
- {{SERVICES_HEADLINE}} → Heading for the services/features section
- {{SERVICES_INTRO}} → Intro paragraph for the services section
- {{FEATURE_1_TITLE}}, {{FEATURE_2_TITLE}}, {{FEATURE_3_TITLE}} → Three distinct service names${services ? ` — draw from: ${services}` : ''}
- {{FEATURE_1_TEXT}}, {{FEATURE_2_TEXT}}, {{FEATURE_3_TEXT}} → Description for each service (${length === 'Short' ? '1 sentence' : length === 'Long' ? '3–4 sentences' : '2 sentences'})
- {{WHY_HEADLINE}} → Heading for the "why choose us" section
- {{WHY_INTRO}} → Intro for the why section
- {{WHY_1_TITLE}}, {{WHY_2_TITLE}}, {{WHY_3_TITLE}} → Three trust/differentiator points${usps ? ` — draw from: ${usps}` : ''}
- {{WHY_1_TEXT}}, {{WHY_2_TEXT}}, {{WHY_3_TEXT}} → Explanation for each point${yearsInBusiness ? ` — mention ${yearsInBusiness} years of experience where relevant` : ''}
- {{TESTIMONIAL_1_QUOTE}}, {{TESTIMONIAL_2_QUOTE}} → Realistic customer review quotes mentioning the service and location
- {{TESTIMONIAL_1_NAME}}, {{TESTIMONIAL_2_NAME}} → Realistic local customer names
- {{CTA_HEADLINE}} → Call-to-action section headline
- {{CTA_SUBTEXT}} → Supporting sentence under the CTA headline
- {{PROCESS_HEADLINE}} → Heading for the "how it works" section (e.g. "Simple, Hassle-Free Service From Start to Finish")
- {{PROCESS_INTRO}} → 1–2 sentences introducing the process
- {{STEP_1_TITLE}}, {{STEP_2_TITLE}}, {{STEP_3_TITLE}} → Three sequential steps in the service process (e.g. "Schedule a Call", "We Assess the Job", "Work Completed")
- {{STEP_1_TEXT}}, {{STEP_2_TEXT}}, {{STEP_3_TEXT}} → Brief description for each step
- {{FAQ_HEADLINE}} → Heading for the FAQ section (e.g. "Common Questions About Our Chicago Plumbing Services")
- {{FAQ_1_Q}}, {{FAQ_2_Q}}, {{FAQ_3_Q}}, {{FAQ_4_Q}} → Four realistic customer questions about this service in this location
- {{FAQ_1_A}}, {{FAQ_2_A}}, {{FAQ_3_A}}, {{FAQ_4_A}} → Helpful, specific answers to each FAQ question
- {{AREA_1}} through {{AREA_6}} → Six real neighborhood, suburb, or district names near {{LOCATION}} (e.g. "Lincoln Park", "Wicker Park")
- {{TRUST_1}}, {{TRUST_2}}, {{TRUST_3}}, {{TRUST_4}} → Short trust signals (e.g. "Licensed & Insured", "5-Star Rated", "Same-Day Service")
- {{STAT_1_NUMBER}}, {{STAT_2_NUMBER}}, {{STAT_3_NUMBER}} → Impressive stats (e.g. "500+", "15 Years", "4.9★")
- {{STAT_1_LABEL}}, {{STAT_2_LABEL}}, {{STAT_3_LABEL}} → Labels for each stat
- Any other {{PLACEHOLDER}} → Write appropriate content for its context in the page

RULES:
- Every placeholder must produce DIFFERENT copy — do NOT repeat the same text in multiple sections
- Do NOT use generic filler — make copy specific to this business, service, and location
- Do NOT touch <!-- STYLE_BLOCK_N --> markers — leave them exactly as written
- Do NOT modify any HTML tags, class names, or style attributes
- Return ONLY the complete filled HTML — no markdown, no commentary

TEMPLATE:
${templateForClaude}`;

    console.log(`Prompt length: ${prompt.length} chars. Calling Claude...`);

    const messagePromise = anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      messages: [{ role: 'user', content: prompt }],
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Claude API timeout after 90s')), 90000)
    );

    const message = await Promise.race([messagePromise, timeoutPromise]);
    console.log('Claude stop_reason:', message.stop_reason);

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

    console.log(`Final HTML: ${finalHtml.length} chars`);

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
