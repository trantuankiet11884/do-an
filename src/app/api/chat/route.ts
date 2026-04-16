import { streamText, tool } from "ai";
import { getChatModel } from "@/lib/ai/gemini";
import { findSimilarProducts } from "@/lib/ai/embeddings";
import { z } from "zod";
import prisma from "@/lib/db";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "GOOGLE_GENERATIVE_AI_API_KEY is not set in .env file.",
      }),
      { status: 500 },
    );
  }
  const { messages } = await req.json();

  // In some environments, streamText might return a Promise
  const result = await streamText({
    model: getChatModel(),
    messages,
    maxSteps: 5,
    system: `
      Bạn là KDSAI, trợ lý ảo bán hàng chuyên nghiệp của cửa hàng E-Commerce KDS. 
      Bạn luôn lịch sự, nhiệt tình, và trả lời bằng tiếng Việt.
      Nhiệm vụ của bạn là tư vấn sản phẩm, giúp khách hàng tìm kiếm hàng hóa, và giải đáp thắc mắc.
      Nếu khách hàng yêu cầu tìm kiếm sản phẩm hoặc có biểu hiện đang muốn mua một loại mặt hàng nào đó, 
      HÃY SỬ DỤNG chức năng (tool) "searchProducts" để tìm sản phẩm gần với yêu cầu nhất trong Database của chúng ta,
      sau đó tóm tắt kết quả lại cho khách hàng một cách thân thiện.
      Khi hiển thị thông tin sản phẩm, hãy luôn cung cấp giá và một đường link mô phỏng (VD: [Tên Sản Phẩm](/products/product-slug)).
      Bạn không tự bịa ra thông tin sản phẩm nào không có trong hệ thống.
    `,
    tools: {
      searchProducts: tool({
        description:
          "Tìm kiếm sản phẩm phù hợp với yêu cầu của người dùng từ Database bằng AI Vector Search.",
        parameters: z.object({
          query: z
            .string()
            .describe(
              'Câu mô tả loại sản phẩm mà người dùng đang tìm kiếm, ví dụ: "áo thun nam màu trắng" hoặc "đồ công nghệ rẻ".',
            ),
          limit: z
            .number()
            .optional()
            .describe("Số lượng sản phẩm muốn tìm. Mặc định là 5."),
        }),
        // @ts-ignore
        execute: async ({
          query,
          limit = 5,
        }: {
          query: string;
          limit?: number;
        }) => {
          console.log(`[Chat API] Tool searchProducts called with query: "${query}"`);
          const results = await findSimilarProducts(query, limit);
          return {
            results,
            message:
              results.length > 0
                ? "Tìm thấy các sản phẩm sau"
                : "Không tìm thấy sản phẩm nào phù hợp",
          };
        },
      }),
      checkOrderStatus: tool({
        description: "Kiểm tra trạng thái đơn hàng dựa trên mã đơn hàng.",
        parameters: z.object({
          orderNumber: z
            .string()
            .describe('Mã đơn hàng cần kiểm tra, ví dụ: "ORD-0226-0001".'),
        }),
        // @ts-ignore
        execute: async ({ orderNumber }: { orderNumber: string }) => {
          try {
            console.log(`[Chat API] Tool checkOrderStatus called for: ${orderNumber}`);
            const order = await prisma.order.findUnique({
              where: { orderNumber },
              select: { status: true, totalPrice: true, createdAt: true },
            });
            if (!order)
              return { error: `Không tìm thấy đơn hàng với mã ${orderNumber}` };
            return order;
          } catch (e: any) {
            return { error: e.message };
          }
        },
      }),
    },
  } as any);

  console.log('[Chat API] Streaming response started...');
  return (result as any).toDataStreamResponse();
}
