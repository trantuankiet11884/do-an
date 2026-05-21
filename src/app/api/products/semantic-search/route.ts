import { NextRequest, NextResponse } from "next/server";
import { findSimilarProducts } from "@/lib/ai/embeddings";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "8");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ products: [] });
    }

    const results = await findSimilarProducts(query.trim(), limit);

    return NextResponse.json({
      products: results,
      source: "semantic",
    });
  } catch (error: unknown) {
    console.error("Semantic search error:", error);
    return NextResponse.json({ products: [], source: "error" });
  }
}
