import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 120; // Vercel: allow up to 120s (requires Pro plan for >10s)

export async function POST(request) {
  console.log('=== API ROUTE STARTED (Claude) ===');

  try {
    const body = await request.json();
    const { keyword, location, service, template_html, projectId, businessDescription, tone, length } = body;

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

    const prompt = `You are filling in an HTML landing page template for a local business. Your job is to replace placeholder text with real, compelling copy — keeping ALL HTML structure, tags, attributes, and inline styles exactly as they are.

Business: ${service || keyword}
${businessDescription ? `About the business: ${businessDescription}` : ''}
Location: ${location}
Keyword: ${keyword}
Tone: ${tone || 'Professional'}

TEMPLATE:
${templateForClaude}

INSTRUCTIONS:
- Replace {{KEYWORD}} with: ${keyword}
- Replace {{LOCATION}} with: ${location}
- Replace {{SERVICE}} with: ${service || keyword}
- Replace ALL other {{PLACEHOLDER}} tokens with relevant, professional copy for this specific business
- Do NOT remove, modify, or rewrite any HTML tags, attributes, class names, or inline style attributes
- Do NOT remove or alter <!-- STYLE_BLOCK_N --> comment markers — leave them exactly as-is
- Write compelling, location-specific copy in a ${tone || 'professional'} tone
- Content length: ${length === 'Short' ? '1–2 sentences per section' : length === 'Long' ? '4–6 sentences per section' : '2–3 sentences per section'}
- Use the business description to write accurate content — do NOT use generic unrelated industry content
- Return ONLY the complete HTML — no explanations, no markdown fences`;

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
    console.error('=== API ROUTE ERROR ===', error.message);
    return NextResponse.json({ error: error.message || 'Failed to generate page' }, { status: 500 });
  }
}
