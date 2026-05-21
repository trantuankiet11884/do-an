import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/supabaseServer";

export async function POST(request: NextRequest) {
  try {
    const { chatLogId, rating } = await request.json();

    if (!chatLogId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Invalid rating (1-5 required)" },
        { status: 400 },
      );
    }

    const supabase = await createAdminClient();

    const { error } = await supabase
      .from("ai_chat_logs")
      .update({ user_rating: rating })
      .eq("id", chatLogId);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("Chat rate error:", error);
    return NextResponse.json(
      { error: "Failed to save rating" },
      { status: 500 },
    );
  }
}
