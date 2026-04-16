import { embed } from 'ai';
import { getEmbeddingModel } from './gemini';
import { createAdminClient } from '../supabase/supabaseServer';

export async function generateEmbedding(text: string): Promise<number[]> {
  console.log(`[AI] Generating embedding for: "${text.substring(0, 50)}..."`);
  const { embedding } = await embed({
    model: getEmbeddingModel(),
    value: text,
  });
  return embedding;
}

/**
 * Searches for similar products using Supabase RPC (HTTP) instead of Prisma (Direct DB).
 * This bypasses networking issues on port 5432/6543.
 */
export async function findSimilarProducts(query: string, limit = 5) {
  try {
    console.time('findSimilarProducts');
    const embedding = await generateEmbedding(query);
    
    console.log('[DB] Executing vector similarity search via Supabase RPC (HTTP)...');
    
    // Use the Supabase Admin Client to bypass RLS and perform the RPC call
    const supabase = await createAdminClient();
    
    // Call the PostgreSQL function directly via HTTPS
    const { data, error } = await supabase.rpc('match_products', {
      query_embedding: embedding,
      match_threshold: 0.3, // Minimum similarity threshold (cosine distance based)
      match_count: limit,
    });

    if (error) {
      throw error;
    }

    console.timeEnd('findSimilarProducts');
    console.log(`[DB] Found ${data?.length || 0} similar products.`);
    
    return data || [];
  } catch (error) {
    console.error('Error finding similar products via RPC:', error);
    console.timeEnd('findSimilarProducts');
    return [];
  }
}

/**
 * Updates a product's embedding using Supabase Client (HTTP).
 */
export async function updateProductEmbedding(productId: string) {
  try {
    const supabase = await createAdminClient();
    
    // 1. Fetch product data via HTTP
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('title, description, price, categories(title)')
      .eq('id', productId)
      .single();

    if (fetchError || !product) return false;

    // 2. Generate embedding
    const contentToEmbed = `
      Product: ${product.title}
      Category: ${(product as any).categories?.title || 'Uncategorized'}
      Price: ${product.price}
      Description: ${product.description}
    `.trim();

    const embedding = await generateEmbedding(contentToEmbed);

    // 3. Update vector field via HTTP
    const { error: updateError } = await supabase
      .from('products')
      .update({ embedding } as any)
      .eq('id', productId);

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error('Error updating product embedding via HTTP:', error);
    return false;
  }
}
