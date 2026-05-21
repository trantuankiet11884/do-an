import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/supabaseServer";

export async function POST(request: NextRequest) {
  try {
    const { code, orderTotal } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Vui lòng nhập mã giảm giá" },
        { status: 400 },
      );
    }

    const supabase = await createAdminClient();

    const { data: voucher, error } = await supabase
      .from("vouchers")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (error || !voucher) {
      return NextResponse.json(
        { error: "Mã giảm giá không hợp lệ" },
        { status: 404 },
      );
    }

    const now = new Date();
    if (new Date(voucher.start_date) > now) {
      return NextResponse.json(
        { error: "Mã giảm giá chưa đến thời gian sử dụng" },
        { status: 400 },
      );
    }

    if (new Date(voucher.end_date) < now) {
      return NextResponse.json(
        { error: "Mã giảm giá đã hết hạn" },
        { status: 400 },
      );
    }

    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
      return NextResponse.json(
        { error: "Mã giảm giá đã hết lượt sử dụng" },
        { status: 400 },
      );
    }

    if (
      voucher.min_order_value &&
      orderTotal &&
      orderTotal < parseFloat(voucher.min_order_value)
    ) {
      return NextResponse.json(
        {
          error: `Đơn hàng tối thiểu ${parseFloat(voucher.min_order_value).toLocaleString("vi-VN")}₫`,
        },
        { status: 400 },
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (voucher.discount_type === "PERCENT") {
      discountAmount = (orderTotal * parseFloat(voucher.discount_value)) / 100;
      if (voucher.max_discount) {
        discountAmount = Math.min(
          discountAmount,
          parseFloat(voucher.max_discount),
        );
      }
    } else {
      discountAmount = parseFloat(voucher.discount_value);
    }

    discountAmount = Math.min(discountAmount, orderTotal || Infinity);

    return NextResponse.json({
      valid: true,
      voucher: {
        code: voucher.code,
        discountType: voucher.discount_type,
        discountValue: parseFloat(voucher.discount_value),
        discountAmount,
      },
    });
  } catch (error: unknown) {
    console.error("Voucher validate error:", error);
    return NextResponse.json(
      { error: "Lỗi kiểm tra mã giảm giá" },
      { status: 500 },
    );
  }
}
