import { NextResponse } from "next/server";
import { requireUser, safeError } from "../../../lib/apiAuth";
import { safeFetchUrl } from "../../../lib/safeUrl";

const MAX_CHARS = 12000;

const sanitizeHtml = (html) =>
  String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tryExtractJson = (raw) => {
  if (!raw) return null;
  // Strip ```json fences if present
  const fenced = raw.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  const body = fenced ? fenced[1] : raw;
  try {
    return JSON.parse(body);
  } catch {
    // Try to slice from first [ to last ]
    const first = body.indexOf("[");
    const last = body.lastIndexOf("]");
    if (first !== -1 && last !== -1 && last > first) {
      try {
        return JSON.parse(body.slice(first, last + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
};

export async function POST(req) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  try {
    const { url, library, brandKit } = await req.json();
    if (!url || !Array.isArray(library) || library.length === 0) {
      return NextResponse.json(
        { error: "URL and library are required." },
        { status: 400 }
      );
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is missing on the server." },
        { status: 500 }
      );
    }

    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const guard = await safeFetchUrl(normalized);
    if (!guard.ok) {
      return NextResponse.json({ error: guard.reason }, { status: 400 });
    }

    // 1. Fetch the page
    let cleaned = "";
    try {
      const siteResponse = await fetch(guard.url, {
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      if (siteResponse.ok) {
        const html = await siteResponse.text();
        cleaned = sanitizeHtml(html).slice(0, MAX_CHARS);
      }
    } catch {
      // If fetch fails, fall back to URL-only inference
    }

    // 2. Build a compact library descriptor for the prompt
    const libraryStr = library
      .map(
        (s) =>
          `• ${s.id} (${s.category} — ${s.name}): ${s.description || ""} | fields: ${s.fields
            .map((f) => f.key)
            .join(", ")}`
      )
      .join("\n");

    const brandKitFragment = brandKit && typeof brandKit === "object" ? `

BRAND KIT — apply consistently throughout the page:
- Brand name: ${brandKit.name || "(unnamed)"}
- Primary color: ${brandKit.primary_color || "(none)"}
${brandKit.logo_url ? `- Logo URL: ${brandKit.logo_url}` : ""}
${brandKit.voice ? `- Voice / tone: ${brandKit.voice}\n  Match this tone in every headline, button, and body copy.` : ""}
- Use the brand name in the navigation logo, headings, and footer copyright.
` : "";

    const prompt = `
You are a landing-page architect. Based on the website content (or URL alone if content is empty), pick a sequence of sections from the LIBRARY below to recreate a strong landing page for this business.

OUTPUT RULES — CRITICAL:
- Return ONLY a JSON array. No prose, no markdown fences, nothing else.
- Each item: { "sectionId": "<one of the library IDs>", "data": { "<FIELD_KEY>": "<value>", ... } }
- Only use field keys that exist on that section in the library.
- Use real, specific copy inferred from the site (taglines, services, value props). Avoid placeholder text.
- Aim for 6–10 sections. Always start with a navigation, end with a footer, include a hero and at least one CTA.
- Order matters: nav → hero → trust/stats → services/features → testimonials → CTA → footer.
- Keep field values short and punchy. URLs should be valid (use # anchors if unknown).

LIBRARY:
${libraryStr}
${brandKitFragment}
URL: ${normalized}

WEBSITE CONTENT (trimmed; may be empty):
${cleaned || "(content unavailable — infer from URL/domain)"}
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
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || "OpenAI request failed.");
    }

    const raw = data.choices?.[0]?.message?.content || "";
    // Model may wrap as { sections: [...] } or just an array as a string in JSON mode — handle both.
    let parsed = null;
    try {
      const obj = JSON.parse(raw);
      parsed = Array.isArray(obj) ? obj : obj.sections || obj.layout || obj.blocks || null;
    } catch {
      parsed = tryExtractJson(raw);
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return NextResponse.json(
        { error: "AI returned an unexpected format. Try again." },
        { status: 502 }
      );
    }

    // Validate against library
    const validIds = new Set(library.map((s) => s.id));
    const fieldsByid = Object.fromEntries(
      library.map((s) => [s.id, new Set(s.fields.map((f) => f.key))])
    );

    const sections = parsed
      .filter((b) => b && validIds.has(b.sectionId))
      .map((b) => {
        const allowed = fieldsByid[b.sectionId];
        const data = {};
        for (const [k, v] of Object.entries(b.data || {})) {
          if (allowed.has(k) && typeof v === "string") data[k] = v;
        }
        return { sectionId: b.sectionId, data };
      });

    return NextResponse.json({ sections });
  } catch (error) {
    return safeError('generate-template-layout', error);
  }
}
