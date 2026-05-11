import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import { requireUser, safeError } from "../../../lib/apiAuth";

const STORAGE_BUCKET = "template-assets";

export async function POST(req) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  try {
    const { prompt, size } = await req.json();
    const cleanPrompt = (prompt || "").trim();
    if (!cleanPrompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is missing on the server." },
        { status: 500 }
      );
    }

    // Allowed DALL·E 3 sizes — clamp to a known good value
    const allowed = new Set(["1024x1024", "1792x1024", "1024x1792"]);
    const finalSize = allowed.has(size) ? size : "1024x1024";

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: cleanPrompt,
        n: 1,
        size: finalSize,
        response_format: "url"
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || "Image generation failed.");
    }

    const tempUrl = data?.data?.[0]?.url;
    if (!tempUrl) {
      return NextResponse.json(
        { error: "No image returned by the model." },
        { status: 502 }
      );
    }

    // The DALL·E URL expires in ~1 hour. Persist to Supabase Storage so the saved
    // template doesn't break the next day. If the upload fails (bucket missing,
    // RLS denied, etc.), gracefully fall back to the temporary URL.
    try {
      const imgRes = await fetch(tempUrl);
      if (imgRes.ok) {
        const arrayBuffer = await imgRes.arrayBuffer();
        const filename = `generated/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.png`;
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filename, arrayBuffer, {
            contentType: "image/png",
            cacheControl: "31536000",
            upsert: false
          });
        if (!uploadError) {
          const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
          if (pub?.publicUrl) {
            return NextResponse.json({ url: pub.publicUrl, persisted: true });
          }
        } else {
          console.warn("Image storage upload failed:", uploadError.message);
        }
      }
    } catch (storageErr) {
      console.warn("Image storage error:", storageErr?.message);
    }

    // Fallback: return the temporary URL with a flag so the client knows
    return NextResponse.json({ url: tempUrl, persisted: false, temporary: true });
  } catch (error) {
    return safeError('generate-image', error);
  }
}
