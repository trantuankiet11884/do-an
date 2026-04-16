import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { getChatModel } from '@/lib/ai/gemini';
import { createAdminClient } from '@/lib/supabase/supabaseServer';

export async function GET() {
  try {
    const supabase = await createAdminClient();

    // 1. Fetch some summary data for AI to analyze via HTTP
    // Total users
    const userCountRes = await supabase.from('users').select('*', { count: 'exact', head: true });
    const totalUsers = userCountRes.count || 0;
    
    // Total products
    const productCountRes = await supabase.from('products').select('*', { count: 'exact', head: true }).is('deleted_at', null);
    const totalProducts = productCountRes.count || 0;

    // Recent orders to analyze sales trend (e.g. last 30 orders)
    const { data: recentOrders, error: orderError } = await supabase
      .from('orders')
      .select('total_price, status, created_at, order_items(quantity, products(title))')
      .order('created_at', { ascending: false })
      .limit(30);

    if (orderError) throw orderError;

    const completedOrders = (recentOrders || []).filter(o => o.status === 'COMPLETED');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
    
    // Extract recent purchased product names
    const recentProductNames = completedOrders.flatMap(o => 
      (o.order_items as any[]).map(i => i.products?.title)
    );
    const topProducts = [...new Set(recentProductNames)].slice(0, 5).join(', ');

    const dataContext = `
      Tổng số User: ${totalUsers}
      Tổng số Sản phẩm: ${totalProducts}
      Doanh thu từ 30 đơn hàng gần đây (đã hoàn thành): ${totalRevenue.toLocaleString('vi-VN')} VNĐ.
      Sản phẩm bán chạy gần đây: ${topProducts || 'Chưa có dữ liệu'}.
      Tổng thể trạng thái các đơn hàng: ${(recentOrders || []).map(o => o.status).join(', ')}
    `;

    // 2. Generate forecasting text
    const { text } = await generateText({
      model: getChatModel(),
      system: `
        Bạn là Chuyên gia Phân tích Dữ liệu Kinh doanh (Business Analyst AI) dành riêng cho chức năng Admin của hệ thống E-commerce.
        Dựa vào số liệu được cung cấp, hãy viết một báo cáo ngắn gọn (khoảng 3-4 đoạn, viết dưới dạng Markdown):
        1. Phân tích doanh thu và tình hình bán hàng gần đây.
        2. Nhận định xu hướng mua sắm (sản phẩm nào đang hot).
        3. Đưa ra 1-2 lời khuyên (gợi ý nhập hàng, chiến dịch marketing) cho người quản trị cửa hàng.
        Sử dụng ngôn từ chuyên nghiệp, dễ hiểu. Format markdown đẹp mắt với các tiêu đề nhỏ (h3) kiểu ### Nhận định.
      `,
      prompt: `Dữ liệu hiện tại: ${dataContext}`,
    });

    return NextResponse.json({ forecast: text });
  } catch (error: any) {
    console.error('Error generating AI forecast via HTTP:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI Forecast.' },
      { status: 500 }
    );
  }
}
