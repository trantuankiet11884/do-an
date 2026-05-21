import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getChatModel } from "@/lib/ai/gemini";
import { createAdminClient } from "@/lib/supabase/supabaseServer";

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    // Parallel fetch all data
    const [
      { data: recentEvents },
      { data: chatLogs },
      { data: eventCounts },
      { data: chatLogCount },
      { data: dailyEvents },
      { count: totalEvents },
      { count: totalChats },
    ] = await Promise.all([
      // Recent behavior events (30 days)
      supabase
        .from("user_behavior_events")
        .select("event_type, event_data, page_url, created_at, session_id")
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: false })
        .limit(500),

      // Recent chat logs
      supabase
        .from("ai_chat_logs")
        .select("question, intent, created_at, session_id, user_id")
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: false })
        .limit(200),

      // Event type breakdown
      supabase
        .from("user_behavior_events")
        .select("event_type")
        .gte("created_at", sevenDaysAgo),

      // Chat intent breakdown
      supabase
        .from("ai_chat_logs")
        .select("intent")
        .gte("created_at", sevenDaysAgo),

      // Daily events (7 days)
      supabase
        .from("user_behavior_events")
        .select("created_at, event_type")
        .gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: true }),

      // Total counts
      supabase
        .from("user_behavior_events")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("ai_chat_logs")
        .select("*", { count: "exact", head: true }),
    ]);

    // Aggregate event type counts
    const eventTypeMap: Record<string, number> = {};
    eventCounts?.forEach((e) => {
      eventTypeMap[e.event_type] = (eventTypeMap[e.event_type] || 0) + 1;
    });

    // Aggregate intent counts
    const intentMap: Record<string, number> = {};
    chatLogCount?.forEach((c) => {
      const intent = c.intent || "general";
      intentMap[intent] = (intentMap[intent] || 0) + 1;
    });

    // Aggregate daily events
    const dailyMap: Record<string, Record<string, number>> = {};
    dailyEvents?.forEach((e) => {
      const day = new Date(e.created_at).toISOString().split("T")[0];
      if (!dailyMap[day]) dailyMap[day] = {};
      dailyMap[day][e.event_type] = (dailyMap[day][e.event_type] || 0) + 1;
    });

    const dailyChartData = Object.entries(dailyMap)
      .map(([date, types]) => ({
        date,
        ...types,
        total: Object.values(types).reduce((a, b) => a + b, 0),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Extract top searches
    const searchEvents = (recentEvents || []).filter(
      (e) => e.event_type === "SEARCH",
    );
    const searchQueryMap: Record<string, number> = {};
    searchEvents.forEach((e) => {
      try {
        const data = JSON.parse(e.event_data);
        const query = data.query || data.search || "";
        if (query) searchQueryMap[query] = (searchQueryMap[query] || 0) + 1;
      } catch {}
    });
    const topSearches = Object.entries(searchQueryMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    // Extract top viewed products
    const viewEvents = (recentEvents || []).filter(
      (e) => e.event_type === "VIEW_PRODUCT",
    );
    const productViewMap: Record<string, number> = {};
    viewEvents.forEach((e) => {
      try {
        const data = JSON.parse(e.event_data);
        const title = data.title || data.slug || "Unknown";
        if (title)
          productViewMap[title] = (productViewMap[title] || 0) + 1;
      } catch {}
    });
    const topViewedProducts = Object.entries(productViewMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([product, views]) => ({ product, views }));

    // Calculate conversion rate
    const uniqueViewSessions = new Set(
      viewEvents.map((e) => e.session_id),
    ).size;
    const checkoutEvents = (recentEvents || []).filter(
      (e) => e.event_type === "CHECKOUT",
    );
    const uniqueCheckoutSessions = new Set(
      checkoutEvents.map((e) => e.session_id),
    ).size;
    const conversionRate =
      uniqueViewSessions > 0
        ? ((uniqueCheckoutSessions / uniqueViewSessions) * 100).toFixed(1)
        : "0";

    // Top chat questions
    const topQuestions = (chatLogs || []).slice(0, 20).map((c) => ({
      question: c.question,
      intent: c.intent,
      createdAt: c.created_at,
    }));

    // Generate AI analysis
    const dataContext = `
Thống kê hành vi 30 ngày qua:
- Tổng sự kiện: ${totalEvents || 0}
- Tổng câu hỏi AI: ${totalChats || 0}
- Tỷ lệ chuyển đổi (xem → mua): ${conversionRate}%
- Phân loại sự kiện: ${JSON.stringify(eventTypeMap)}
- Phân loại intent chat: ${JSON.stringify(intentMap)}
- Top tìm kiếm: ${topSearches.map((s) => `"${s.query}" (${s.count} lần)`).join(", ") || "Chưa có"}
- Top sản phẩm xem: ${topViewedProducts.map((p) => `"${p.product}" (${p.views} lượt)`).join(", ") || "Chưa có"}
- Top câu hỏi AI gần đây: ${topQuestions.slice(0, 5).map((q) => `"${q.question}"`).join(", ") || "Chưa có"}
    `;

    let aiAnalysis = "";
    try {
      const { text } = await generateText({
        model: getChatModel(),
        system: `Bạn là **KDS Behavior Analyst**, chuyên gia phân tích hành vi người dùng trên nền tảng KDS.
Nhiệm vụ: Dựa vào dữ liệu, viết báo cáo phân tích hành vi (Tiếng Việt, ~4-5 đoạn, Markdown):
1. **Xu hướng tìm kiếm**: Người dùng đang tìm gì? Từ khóa hot?
2. **Hành vi mua sắm**: Tỷ lệ chuyển đổi, sản phẩm được quan tâm nhất?
3. **Câu hỏi AI**: Người dùng thường hỏi gì? Vấn đề gì phổ biến?
4. **Đề xuất cho Admin**: Cải thiện gì để tăng doanh thu và trải nghiệm?
Dùng ### cho tiêu đề.`,
        prompt: `Dữ liệu hành vi: ${dataContext}`,
      });
      aiAnalysis = text;
    } catch (e) {
      console.error("AI analysis error:", e);
      aiAnalysis = "Không thể tạo phân tích AI lúc này.";
    }

    return NextResponse.json({
      stats: {
        totalEvents: totalEvents || 0,
        totalChats: totalChats || 0,
        conversionRate,
        topProduct:
          topViewedProducts[0]?.product || "Chưa có dữ liệu",
      },
      eventTypeBreakdown: eventTypeMap,
      intentBreakdown: intentMap,
      dailyChartData,
      topSearches,
      topViewedProducts,
      topQuestions,
      aiAnalysis,
    });
  } catch (error: unknown) {
    console.error("Behavior analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze behavior data." },
      { status: 500 },
    );
  }
}
