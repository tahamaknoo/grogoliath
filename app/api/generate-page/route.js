import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  console.log('=== API ROUTE STARTED (Claude) ===');

  try {
    const body = await request.json();
    console.log('Request body received:', {
      keyword: body.keyword,
      location: body.location,
      hasTemplate: !!body.template_html,
      templateLength: body.template_html?.length,
    });

    const { keyword, location, service, template_html, projectId } = body;

    if (!template_html) {
      console.error('No template HTML provided');
      return NextResponse.json({ error: 'Template HTML is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not found in environment');
      return NextResponse.json({ error: 'Claude API key not configured' }, { status: 500 });
    }

    console.log('Claude API Key exists:', !!apiKey, 'length:', apiKey.length);

    const anthropic = new Anthropic({ apiKey });

    // Sanitize template — strip script tags
    let templateHtml = template_html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    console.log('Template sanitized, length:', templateHtml.length);

    const prompt = `Generate a complete, professional HTML landing page for "${keyword}" in ${location}.

BASE TEMPLATE:
${templateHtml}

TASK: Replace ALL placeholder tags with real, relevant content:
- {{KEYWORD}} → ${keyword}
- {{LOCATION}} → ${location}
- {{SERVICE}} → ${service || keyword}
- All other {{PLACEHOLDERS}} → relevant, professional content

REQUIREMENTS:
1. Keep the EXACT HTML structure and all CSS styling
2. Replace EVERY {{PLACEHOLDER}} with contextually appropriate content
3. Make headlines compelling and specific to ${keyword} in ${location}
4. Write natural, professional copy for all text sections
5. Ensure all content is relevant to the business type
6. Keep phone numbers, emails, and CTAs professional
7. Return ONLY the complete HTML - no explanations, no markdown

BEGIN HTML OUTPUT:`;

    console.log('Prompt built, length:', prompt.length);
    console.log('Calling Claude API...');

    const messagePromise = anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Claude API timeout after 60s')), 60000)
    );

    console.log('Waiting for Claude response...');
    const message = await Promise.race([messagePromise, timeoutPromise]);
    console.log('Claude response received, stop_reason:', message.stop_reason);

    const generatedHtml = message.content[0]?.text;
    if (!generatedHtml || generatedHtml.trim().length === 0) {
      throw new Error('Claude returned empty response');
    }

    // Strip markdown code fences if present
    let cleanedHtml = generatedHtml.trim();
    if (cleanedHtml.startsWith('```html')) {
      cleanedHtml = cleanedHtml.replace(/^```html\n?/, '').replace(/\n?```$/, '');
    } else if (cleanedHtml.startsWith('```')) {
      cleanedHtml = cleanedHtml.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    console.log('Returning generated HTML, length:', cleanedHtml.length);

    const slug = keyword.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

    return NextResponse.json({
      html: cleanedHtml,
      content: cleanedHtml, // alias for backward compat
      keyword,
      location,
      service,
      slug,
      title: `${keyword} | ${service || keyword}`,
      projectId,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('=== API ROUTE ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ error: error.message || 'Failed to generate page' }, { status: 500 });
  }
}
