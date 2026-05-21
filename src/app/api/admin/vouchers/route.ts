import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/supabaseServer";

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("vouchers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ vouchers: data || [] });
  } catch (error: unknown) {
    console.error("Vouchers fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vouchers" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("vouchers")
      .insert({
        code: body.code.toUpperCase().trim(),
        discount_type: body.discountType,
        discount_value: body.discountValue,
        min_order_value: body.minOrderValue || null,
        max_discount: body.maxDiscount || null,
        usage_limit: body.usageLimit || null,
        start_date: body.startDate,
        end_date: body.endDate,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ voucher: data }, { status: 201 });
  } catch (error: unknown) {
    console.error("Voucher create error:", error);
    return NextResponse.json(
      { error: "Failed to create voucher" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const supabase = await createAdminClient();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.code) updateData.code = updates.code.toUpperCase().trim();
    if (updates.discountType) updateData.discount_type = updates.discountType;
    if (updates.discountValue !== undefined)
      updateData.discount_value = updates.discountValue;
    if (updates.minOrderValue !== undefined)
      updateData.min_order_value = updates.minOrderValue;
    if (updates.maxDiscount !== undefined)
      updateData.max_discount = updates.maxDiscount;
    if (updates.usageLimit !== undefined)
      updateData.usage_limit = updates.usageLimit;
    if (updates.startDate) updateData.start_date = updates.startDate;
    if (updates.endDate) updateData.end_date = updates.endDate;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabase
      .from("vouchers")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ voucher: data });
  } catch (error: unknown) {
    console.error("Voucher update error:", error);
    return NextResponse.json(
      { error: "Failed to update voucher" },
      { status: 500 },
    );
  }
}
