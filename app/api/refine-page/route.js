import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { requireUser, safeError } from '../../../lib/apiAuth';

export const maxDuration = 120;

export async function POST(request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  try {
    const body = await request.json();
    const { current_html, instruction } = body;

    if (!current_html) return NextResponse.json({ error: 'current_html is required' }, { status: 400 });
    if (!instruction) return NextResponse.json({ error: 'instruction is required' }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Claude API key not configured' }, { status: 500 });

    const anthropic = new Anthropic({ apiKey });

    // Extract style blocks so they don't get modified
    const extractedStyles = [];
    const htmlForClaude = current_html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (match) => {
      extractedStyles.push(match);
      return `<!-- STYLE_BLOCK_${extractedStyles.length - 1} -->`;
    });

    const _now = new Date();
    const currentYear = _now.getFullYear();

    const prompt = `You are editing a finished HTML page. Make ONLY the change described below. Do not rewrite or modify anything else.

INSTRUCTION:
${instruction}

RULES:
- Make only the minimal change needed to fulfil the instruction.
- Do NOT rewrite sections that weren't mentioned.
- Do NOT remove any HTML tags, class names, or inline styles.
- Do NOT remove or alter <!-- STYLE_BLOCK_N --> comment markers.
- Return the COMPLETE HTML with ONLY the requested change applied.
- No markdown, no explanations. Just the HTML.

STYLE RULES (apply to any new copy you write, not just the requested change):
- FORBIDDEN PUNCTUATION: do NOT use em dashes (—) or en dashes (–) anywhere. Use commas, periods, colons, or parentheses instead.
- Current year is ${currentYear}. Any year reference MUST use ${currentYear}, never an older year as if it were now.

CURRENT PAGE HTML:
${htmlForClaude}`;

    const messagePromise = anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      messages: [{ role: 'user', content: prompt }],
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Claude API timeout after 90s')), 90000)
    );

    const message = await Promise.race([messagePromise, timeoutPromise]);

    let refinedHtml = message.content[0]?.text?.trim();
    if (!refinedHtml) throw new Error('Claude returned empty response');

    if (refinedHtml.startsWith('```html')) {
      refinedHtml = refinedHtml.replace(/^```html\n?/, '').replace(/\n?```$/, '');
    } else if (refinedHtml.startsWith('```')) {
      refinedHtml = refinedHtml.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    // Restore style blocks
    extractedStyles.forEach((styleBlock, i) => {
      refinedHtml = refinedHtml.replace(`<!-- STYLE_BLOCK_${i} -->`, styleBlock);
    });
    // Fallback: if any markers remain, inject all styles into head
    if (/<!-- STYLE_BLOCK_\d+ -->/.test(refinedHtml) && extractedStyles.length > 0) {
      const stylesBlock = extractedStyles.join('\n');
      if (/<\/head>/i.test(refinedHtml)) {
        refinedHtml = refinedHtml.replace(/<\/head>/i, `${stylesBlock}\n</head>`);
      } else {
        refinedHtml = stylesBlock + '\n' + refinedHtml;
      }
      refinedHtml = refinedHtml.replace(/<!-- STYLE_BLOCK_\d+ -->/g, '');
    }

    // Safety net for em/en dashes — strip from text nodes only (never tag attrs).
    refinedHtml = refinedHtml.split(/(<[^>]*>)/g).map((segment, i) => {
      if (i % 2 === 1) return segment;
      return segment
        .replace(/\s+—\s+/g, ', ')
        .replace(/—/g, ', ')
        .replace(/\s+–\s+/g, ', ')
        .replace(/(\D)–(\D)/g, '$1, $2');
    }).join('');

    return NextResponse.json({ html: refinedHtml });

  } catch (error) {
    return safeError('refine-page', error);
  }
}
