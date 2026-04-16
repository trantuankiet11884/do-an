import { NextResponse } from 'next/server';
import { findSimilarProducts } from '@/lib/ai/embeddings';
import { createAdminClient } from '@/lib/supabase/supabaseServer';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (!sessionId && !userId) {
      return NextResponse.json({ recommendations: [] });
    }

    // Use Supabase Client (HTTP) instead of Prisma to avoid Port 6543 blocking
    const supabase = await createAdminClient();

    // 1. Get visitor tracking to understand behavior
    const { data: tracking, error: trackingError } = await supabase
      .from('visitor_tracking')
      .select('product_clicks, searches')
      .or(userId ? `user_id.eq.${userId}` : `session_id.eq.${sessionId}`)
      .order('visited_at', { ascending: false })
      .limit(1)
      .single();

    if (trackingError && trackingError.code !== 'PGRST116') {
      console.error('Error fetching tracking:', trackingError);
    }

    let searchContext = "Thịnh hành, phổ biến, mới nhất";

    if (tracking) {
      const recentProducts = (tracking as any).product_clicks || [];
      const recentSearches = (tracking as any).searches || [];

      // 2. Query database to get the titles of clicked products for better context
      if (recentProducts.length > 0) {
        const { data: products } = await supabase
          .from('products')
          .select('title, categories(title)')
          .in('id', recentProducts.slice(0, 3));
        
        if (products && products.length > 0) {
          searchContext = products.map((p: any) => `${p.title} (${p.categories?.title})`).join(', ');
        }
      }
      
      if (recentSearches.length > 0) {
        searchContext += ` Khách hàng cũng tìm kiếm: ${recentSearches.join(', ')}`;
      }
    }

    // 3. Use vector search via RPC (HTTP)
    const recommendations = await findSimilarProducts(searchContext, 4);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error generating recommendations via HTTP:', error);
    return NextResponse.json({ recommendations: [] });
  }
}
