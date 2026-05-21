import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/supabaseServer";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const supabase = await createAdminClient();

    let query = supabase
      .from("orders")
      .select(
        `order_number, total_price, status, payment_method, payment_status, voucher_code, discount_amount, created_at, users!inner(name, email)`,
      )
      .order("created_at", { ascending: false });

    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);

    const { data: orders, error } = await query;
    if (error) throw error;

    if (format === "csv") {
      const header =
        "Mã đơn,Khách hàng,Email,Tổng tiền,Giảm giá,Trạng thái,Thanh toán,Phương thức,Voucher,Ngày tạo\n";
      const rows = (orders || [])
        .map((o: any) => {
          const user = o.users;
          return [
            o.order_number || "",
            user?.name || "",
            user?.email || "",
            o.total_price,
            o.discount_amount || 0,
            o.status,
            o.payment_status,
            o.payment_method,
            o.voucher_code || "",
            new Date(o.created_at).toLocaleDateString("vi-VN"),
          ].join(",");
        })
        .join("\n");

      return new NextResponse(header + rows, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="orders_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ orders });
  } catch (error: unknown) {
    console.error("Export orders error:", error);
    return NextResponse.json(
      { error: "Failed to export orders" },
      { status: 500 },
    );
  }
}
