import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/supabaseServer";

export async function GET() {
  const supabase = await createAdminClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(
      `
      *,
      categories(id, title),
      product_variants(*)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform to match Product interface
  const transformed = products?.map((product) => ({
    ...product,
  }));

  return NextResponse.json({ products: transformed || [] });
}