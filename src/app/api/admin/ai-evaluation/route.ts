import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/supabaseServer";

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const [{ data: chatLogs }, { count: totalChats }] = await Promise.all([
      supabase
        .from("ai_chat_logs")
        .select(
          "response_time_ms, user_rating, intent, created_at",
        )
        .gte("created_at", thirtyDaysAgo),

      supabase
        .from("ai_chat_logs")
        .select("*", { count: "exact", head: true }),
    ]);

    const logs = chatLogs || [];

    const withRating = logs.filter((l) => l.user_rating !== null);
    const withResponseTime = logs.filter((l) => l.response_time_ms !== null);

    const avgRating =
      withRating.length > 0
        ? withRating.reduce((sum, l) => sum + l.user_rating!, 0) /
          withRating.length
        : 0;

    const avgResponseTime =
      withResponseTime.length > 0
        ? withResponseTime.reduce((sum, l) => sum + l.response_time_ms!, 0) /
          withResponseTime.length
        : 0;

    const satisfactionRate =
      withRating.length > 0
        ? (withRating.filter((l) => l.user_rating! >= 4).length /
            withRating.length) *
          100
        : 0;

    // Intent distribution
    const intentMap: Record<string, number> = {};
    logs.forEach((l) => {
      const intent = l.intent || "general";
      intentMap[intent] = (intentMap[intent] || 0) + 1;
    });

    // Daily response times (7 days)
    const dailyMap: Record<string, { total: number; count: number }> = {};
    withResponseTime.forEach((l) => {
      const day = new Date(l.created_at).toISOString().split("T")[0];
      if (!dailyMap[day]) dailyMap[day] = { total: 0, count: 0 };
      dailyMap[day].total += l.response_time_ms!;
      dailyMap[day].count += 1;
    });

    const dailyResponseTimes = Object.entries(dailyMap)
      .map(([date, { total, count }]) => ({
        date,
        avgMs: Math.round(total / count),
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    return NextResponse.json({
      totalChats: totalChats || 0,
      totalRated: withRating.length,
      avgRating: Math.round(avgRating * 10) / 10,
      avgResponseTimeMs: Math.round(avgResponseTime),
      satisfactionRate: Math.round(satisfactionRate * 10) / 10,
      intentDistribution: intentMap,
      dailyResponseTimes,
    });
  } catch (error: unknown) {
    console.error("AI evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI evaluation data" },
      { status: 500 },
    );
  }
}
