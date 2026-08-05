import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { requireUser, safeError } from '../../../lib/apiAuth';

// Refining a long blog (40k+ chars) means Claude echoes most of the HTML
// back with small edits — that takes about as long as a fresh blog gen,
// not the 90s the old code assumed. 300s = Vercel Pro ceiling; comfortably
// above realistic Claude streaming time.
export const maxDuration = 300;

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

    // Streaming with stall detection — same approach as /api/generate-page.
    // Refines often output 40k+ chars (most of the input HTML echoed back
    // with small edits), so total time can be 60-200s. An overall timeout
    // is the wrong tool here; what we want is "is Claude still streaming?"
    // and that's exactly what stall detection gives us.
    const STALL_MS = 45000;
    const startTime = Date.now();
    console.log(`[refine-page] streaming Claude (stall threshold ${STALL_MS / 1000}s)…`);

    const messageStream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      messages: [{ role: 'user', content: prompt }],
    });

    let lastEventAt = Date.now();
    let tokenCount = 0;
    let stallAborted = false;
    const stallTimer = setInterval(() => {
      const sinceLast = Date.now() - lastEventAt;
      if (sinceLast > STALL_MS && !stallAborted) {
        stallAborted = true;
        console.warn(`[refine-page] Claude stream stalled (${sinceLast}ms since last token, ${tokenCount} tokens so far). Aborting.`);
        try { messageStream.controller.abort(); } catch { /* ignore */ }
      }
    }, 5000);

    let message;
    try {
      for await (const event of messageStream) {
        lastEventAt = Date.now();
        if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
          tokenCount += 1;
          if (tokenCount % 500 === 0) {
            const sec = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`[refine-page] streaming… ${tokenCount} tokens, ${sec}s elapsed`);
          }
        }
      }
      message = await messageStream.finalMessage();
    } catch (e) {
      if (stallAborted) {
        throw new Error(`Claude stream stalled for >${STALL_MS / 1000}s. Try again — usually transient on Anthropic's side.`);
      }
      throw new Error(`Claude streaming failed: ${e?.message || e}`);
    } finally {
      clearInterval(stallTimer);
    }
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[refine-page] Claude finished streaming in ${elapsedSec}s (${tokenCount} tokens). stop_reason: ${message.stop_reason}`);

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
