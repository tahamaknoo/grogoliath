import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

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

    // --- CSS extraction: strip styles before sending to Claude, re-inject after ---
    // This cuts token usage by ~60% and eliminates truncation risk on large templates.
    const extractedStyles = [];
    const templateWithoutStyles = template_html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // strip scripts
      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (match) => {
        extractedStyles.push(match);
        return ''; // remove from what Claude sees
      });

    console.log(
      `Template: ${template_html.length} chars total, ` +
      `${extractedStyles.length} style block(s) extracted (${extractedStyles.reduce((n, s) => n + s.length, 0)} chars), ` +
      `${templateWithoutStyles.length} chars sent to Claude`
    );

    const prompt = `You are filling in an HTML landing page template for a local business.

Business: ${service || keyword}
${businessDescription ? `About the business: ${businessDescription}` : ''}
Location: ${location}
Keyword: ${keyword}
Tone: ${tone || 'Professional'}

TEMPLATE (CSS has been removed — output only the HTML, no <style> tags):
${templateWithoutStyles}

INSTRUCTIONS:
- Replace {{KEYWORD}} with: ${keyword}
- Replace {{LOCATION}} with: ${location}
- Replace {{SERVICE}} with: ${service || keyword}
- Replace ALL other {{PLACEHOLDERS}} with relevant, professional content for this specific business
- Fill in any placeholder text (e.g. "Your headline here", "Add description") with real copy tailored to this business
- Use the business description above to write accurate, context-specific content — do NOT use generic or unrelated industry content
- Write compelling, location-specific content for every section with a ${tone || 'professional'} tone
- Content length target: ${length === 'Short' ? 'keep copy concise, ~1-2 sentences per section' : length === 'Long' ? 'write detailed, thorough copy, ~4-6 sentences per section' : 'use moderate copy length, ~2-3 sentences per section'}
- Keep ALL existing HTML tags, classes, and attributes exactly as-is
- Return ONLY the filled HTML — no <style> tags, no explanations, no markdown`;

    console.log(`Prompt length: ${prompt.length} chars. Calling Claude...`);

    const messagePromise = anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
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

    // Re-inject the extracted CSS back into the document
    // Insert all style blocks into the <head>, or prepend if no <head>
    const stylesBlock = extractedStyles.join('\n');
    let finalHtml;
    if (/<\/head>/i.test(filledHtml)) {
      finalHtml = filledHtml.replace(/<\/head>/i, `${stylesBlock}\n</head>`);
    } else if (/<head>/i.test(filledHtml)) {
      finalHtml = filledHtml.replace(/<head>/i, `<head>\n${stylesBlock}`);
    } else {
      // No head tag — prepend styles
      finalHtml = stylesBlock + '\n' + filledHtml;
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
