import { NextResponse } from "next/server";
import { requireUser, safeError } from "../../../lib/apiAuth";
import { safeFetchUrl } from "../../../lib/safeUrl";

const MAX_CHARS = 12000;

const sanitizeHtml = (html) => {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export async function POST(req) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required." }, { status: 400 });
    }

    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const guard = await safeFetchUrl(normalized);
    if (!guard.ok) {
      return NextResponse.json({ error: guard.reason }, { status: 400 });
    }

    const siteResponse = await fetch(guard.url, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!siteResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch site (${siteResponse.status}).` },
        { status: 400 }
      );
    }

    const html = await siteResponse.text();
    const cleaned = sanitizeHtml(html).slice(0, MAX_CHARS);

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API Key is missing on the server." },
        { status: 500 }
      );
    }

    const prompt = `
You are a UX analyst. Based on the website content below, infer a high-converting landing page structure.
Return ONLY a JSON array of blocks. Each block must include:
  - id (number)
  - type (string)
  - category (string)
  - content (string)

Allowed types:
header, text, hero, pain_point, solution, usp, pricing, cta, schema_service, faq_auto,
comparison, pros_cons, social_proof, process, case_study, contact_form, trust_badges,
schema_blog, stats, html, image, columns_n, columns_2, grid_2x2.

Allowed categories: basic, marketing, seo, premium.
Use placeholders like {{Service}}, {{City}}, {{Keyword}}, {{Brand}}, {{Company}} where appropriate.
Aim for 8-14 blocks, ordered from top to bottom.

WEBSITE CONTENT (trimmed):
${cleaned}
`.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || "OpenAI request failed.");
    }

    return NextResponse.json({ content: data.choices?.[0]?.message?.content || "" });
  } catch (error) {
    return safeError('analyze-site', error);
  }
}
