import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const PROMPT =
  "This is a university past exam paper. Transcribe each question, then provide a clear, correct worked solution for each. Use markdown. If a question is ambiguous or you are unsure, say so explicitly rather than guessing.";

type AnthropicResponse = {
  content?: Array<{ type: string; text?: string }>;
};

export async function POST(request: Request) {
  // This route is excluded from the proxy, so enforce auth here.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let paperId: string | undefined;
  try {
    const body = (await request.json()) as { paperId?: string };
    paperId = body.paperId;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!paperId) {
    return NextResponse.json({ error: "Missing paperId." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: paper } = await admin
    .from("papers")
    .select("id, file_path, file_mime")
    .eq("id", paperId)
    .maybeSingle();
  if (!paper) {
    return NextResponse.json({ error: "Paper not found." }, { status: 404 });
  }

  // Cache: return an existing solution rather than re-calling the model.
  const { data: existing } = await admin
    .from("solutions")
    .select("id, content, source, model, verified")
    .eq("paper_id", paperId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ solution: existing });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI solving is not configured." },
      { status: 500 },
    );
  }

  // Download the file from the private bucket and base64-encode it.
  const { data: fileBlob, error: dlErr } = await admin.storage
    .from("papers")
    .download(paper.file_path);
  if (dlErr || !fileBlob) {
    return NextResponse.json({ error: "Could not read the file." }, { status: 500 });
  }
  const base64 = Buffer.from(await fileBlob.arrayBuffer()).toString("base64");

  const isPdf = paper.file_mime === "application/pdf";
  const mediaType = paper.file_mime ?? (isPdf ? "application/pdf" : "image/jpeg");
  const source = isPdf
    ? {
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64 },
      }
    : {
        type: "image",
        source: { type: "base64", media_type: mediaType, data: base64 },
      };

  const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [source, { type: "text", text: PROMPT }],
        },
      ],
    }),
  });

  if (!aiRes.ok) {
    const detail = await aiRes.text().catch(() => "");
    console.error("Anthropic error", aiRes.status, detail);
    return NextResponse.json(
      { error: "The AI could not generate a solution right now." },
      { status: 502 },
    );
  }

  const data = (await aiRes.json()) as AnthropicResponse;
  const content = (data.content ?? [])
    .filter((b) => b.type === "text" && b.text)
    .map((b) => b.text)
    .join("\n\n")
    .trim();
  if (!content) {
    return NextResponse.json(
      { error: "The AI returned an empty solution." },
      { status: 502 },
    );
  }

  const { data: inserted, error: insErr } = await admin
    .from("solutions")
    .insert({
      paper_id: paperId,
      content,
      source: "ai",
      model: "claude-sonnet-4-6",
      verified: false,
    })
    .select("id, content, source, model, verified")
    .single();
  if (insErr || !inserted) {
    return NextResponse.json(
      { error: "Could not save the solution." },
      { status: 500 },
    );
  }

  return NextResponse.json({ solution: inserted });
}
