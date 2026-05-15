import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getChatModel } from "@/lib/ai/gemini";
import { createAdminClient } from "@/lib/supabase/supabaseServer";

export async function GET() {
  try {
    const supabase = await createAdminClient();

    // 1. Fetch summary data
    const userCountRes = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });
    const totalUsers = userCountRes.count || 0;

    const productCountRes = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);
    const totalProducts = productCountRes.count || 0;

    const { data: recentOrders, error: orderError } = await supabase
      .from("orders")
      .select(
        "total_price, status, created_at, order_items(quantity, products(title))",
      )
      .order("created_at", { ascending: false })
      .limit(30);

    if (orderError) throw orderError;

    const completedOrders = (recentOrders || []).filter(
      (o) => o.status === "COMPLETED",
    );
    const totalRevenue = completedOrders.reduce(
      (sum, o) => sum + Number(o.total_price),
      0,
    );

    const recentProductNames = completedOrders.flatMap((o) =>
      (o.order_items as any[]).map((i) => i.products?.title),
    );
    const topProducts = [...new Set(recentProductNames)].slice(0, 5).join(", ");

    const dataContext = `
      Tổng số User: ${totalUsers}
      Tổng số Sản phẩm: ${totalProducts}
      Doanh thu từ 30 đơn hàng gần đây (đã hoàn thành): ${totalRevenue.toLocaleString("vi-VN")} VNĐ.
      Sản phẩm bán chạy gần đây: ${topProducts || "Chưa có dữ liệu"}.
      Trạng thái các đơn hàng: ${(recentOrders || []).map((o) => o.status).join(", ")}
    `;

    // 2. Generate forecasting text
    const { text } = await generateText({
      model: getChatModel(),
      system: `
        Bạn là **KDS Analyst**, chuyên gia phân tích dữ liệu kinh doanh của hệ thống KDS.
        Nhiệm vụ của bạn là dựa vào số liệu được cung cấp để viết báo cáo phân tích và dự báo.
        Hãy viết báo cáo bằng Tiếng Việt, ngắn gọn (khoảng 3-4 đoạn), định dạng Markdown:
        1. Phân tích doanh thu và tình hình bán hàng.
        2. Nhận định xu hướng mua sắm.
        3. Đưa ra lời khuyên chiến lược cho Admin.
        Format markdown đẹp mắt với tiêu đề nhỏ ### kiếu: ### Nhận định.
      `,
      prompt: `Dữ liệu hiện tại: ${dataContext}`,
    });

    return NextResponse.json({ forecast: text });
  } catch (error: any) {
    console.error("Error generating AI forecast:", error);
    return NextResponse.json(
      { error: "Failed to generate AI Forecast." },
      { status: 500 },
    );
  }
}
