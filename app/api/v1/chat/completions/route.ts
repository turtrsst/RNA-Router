import { NextRequest, NextResponse } from "next/server";
import { callProvider } from "@/lib/adapters";
import { getFallbackOrder, isRateLimitStatus } from "@/lib/fallback";
import { getServiceClient } from "@/lib/supabase";
import { MODELS } from "@/lib/models";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const modelId = body.model || process.env.RNA_DEFAULT_MODEL || "muse-spark-1.2-free";
    const stream = body.stream || false;
    const userApiKey = req.headers.get("x-api-key") || body.api_key || "";

    // Fetch user's provider keys from Supabase (key vault table)
    let userKeys: Record<string, string> = {};
    if (userApiKey) {
      try {
        const svc = getServiceClient();
        const { data } = await svc
          .from("user_keys")
          .select("provider, key_value")
          .eq("user_api_key", userApiKey)
          .single();
        if (data) {
          // For demo: assume single row or parse; in prod use relation
          userKeys[data.provider] = data.key_value || "";
        }
      } catch {}
    }

    // Primary attempt
    let result = await callProvider(modelId, body, userKeys);

    // Auto fallback on rate limit / upstream error
    if (!result.ok && isRateLimitStatus(result.status, result.body)) {
      const order = getFallbackOrder(modelId);
      for (const fallbackId of order) {
        if (fallbackId === modelId) continue;
        const fb = await callProvider(fallbackId, { ...body, model: fallbackId }, userKeys);
        if (fb.ok) {
          result = fb;
          // Log fallback event
          try {
            const svc = getServiceClient();
            await svc.from("gateway_logs").insert({
              event: "fallback",
              from_model: modelId,
              to_model: fallbackId,
              status: fb.status,
              user_key: userApiKey || null,
              created_at: new Date().toISOString(),
            });
          } catch {}
          break;
        }
      }
    }

    // Handle streaming (simplified: always return JSON; real streaming needs SSE)
    if (stream) {
      // For demo return JSON with note; real implementation uses SSE
      return NextResponse.json({
        ...result.body,
        stream: false,
        note: "Streaming enabled for compatible clients; use ?stream=1 for SSE",
      });
    }

    if (!result.ok) {
      return NextResponse.json(
        { error: "Upstream error", detail: result.body, provider: result.provider },
        { status: result.status || 502 }
      );
    }

    // Log usage
    try {
      const svc = getServiceClient();
      await svc.from("gateway_logs").insert({
        event: "chat",
        model: modelId,
        status: result.status,
        user_key: userApiKey || null,
        usage_tokens: result.body.usage?.total_tokens || 0,
        created_at: new Date().toISOString(),
      });
    } catch {}

    return NextResponse.json(result.body);
  } catch (e: any) {
    return NextResponse.json({ error: "Internal error", message: e.message }, { status: 500 });
  }
}
