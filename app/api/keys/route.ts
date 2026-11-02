import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { verifyJWT, extractToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = extractToken(req.headers);
  let userId = token || "";
  if (!userId || userId.length < 5) {
    try { const payload = verifyJWT(token || ""); userId = payload.sub; } catch {}
  }
  const apiKey = userId || "";
  if (!apiKey) return NextResponse.json({ error: "Missing x-api-key" }, { status: 401 });
  try {
    const svc = getServiceClient();
    const { data } = await svc
      .from("user_keys")
      .select("provider, created_at")
      .eq("user_api_key", apiKey);
    return NextResponse.json({ data: data || [], count: data?.length || 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = extractToken(req.headers);
    let userId = token || body.user_api_key || "";
    if (!userId || userId.length < 5) { try { const payload = verifyJWT(token || ""); userId = payload.sub; } catch {} }
    const apiKey = userId || "";
    if (!apiKey) return NextResponse.json({ error: "Need user_api_key" }, { status: 400 });
    const svc = getServiceClient();
    const { error } = await svc.from("user_keys").upsert({
      user_api_key: apiKey,
      provider: body.provider,
      key_value: body.key_value,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_api_key,provider" });
    if (error) throw error;
    return NextResponse.json({ ok: true, message: "Key saved. Never share this endpoint publicly." });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const token = extractToken(req.headers);
    let userId = token || body.user_api_key || "";
    if (!userId || userId.length < 5) { try { const payload = verifyJWT(token || ""); userId = payload.sub; } catch {} }
    const apiKey = userId || "";
    if (!apiKey) return NextResponse.json({ error: "Need user_api_key" }, { status: 400 });
    const svc = getServiceClient();
    await svc.from("user_keys").delete().eq("user_api_key", apiKey).eq("provider", body.provider);
    return NextResponse.json({ ok: true, deleted: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
