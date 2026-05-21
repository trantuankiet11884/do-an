import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/supabaseServer";

const VALID_EVENT_TYPES = [
  "SEARCH",
  "VIEW_PRODUCT",
  "ADD_CART",
  "CHECKOUT",
  "AI_CHAT",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, eventType, eventData, pageUrl } = body;

    if (!sessionId || !eventType || !VALID_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const supabase = await createAdminClient();

    await supabase.from("user_behavior_events").insert({
      session_id: sessionId,
      event_type: eventType,
      event_data: eventData || "{}",
      page_url: pageUrl || null,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Behavior tracking error:", error);
    return NextResponse.json({ ok: true }); // Always 200 — don't break client
  }
}
