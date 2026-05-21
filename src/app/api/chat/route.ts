import { generateText } from "ai";
import { getChatModel } from "@/lib/ai/gemini";
import { createClient, createAdminClient } from "@/lib/supabase/supabaseServer";

export const maxDuration = 30;

function classifyIntent(question: string): string {
  const q = question.toLowerCase();
  if (q.match(/(?:giá|bao nhiêu|chi phí|price|cost)/)) return "price_inquiry";
  if (q.match(/(?:đơn hàng|order|giao hàng|ship|vận chuyển|theo dõi)/))
    return "order_inquiry";
  if (q.match(/(?:tìm|search|kiếm|mua|sản phẩm|product|quần|áo|giày|túi)/))
    return "product_search";
  if (q.match(/(?:tài khoản|account|đăng ký|đăng nhập|login|register|mật khẩu)/))
    return "account_support";
  if (q.match(/(?:thanh toán|payment|stripe|cod|thẻ)/))
    return "payment_inquiry";
  if (q.match(/(?:đổi|trả|hoàn|refund|return|khiếu nại)/))
    return "return_refund";
  return "general";
}

export async function POST(req: Request) {
  try {
    const { prompt, messages, sessionId } = await req.json();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const chatMessages = messages || [
      {
        role: "user",
        content: prompt,
      },
    ];

    const { text } = await generateText({
      model: getChatModel(),
      messages: [
        {
          role: "system",
          content: `Bạn là **KDS**, một trợ lý AI thông minh, thân thiện và hữu ích, được tích hợp vào **KDS** — một nền tảng thương mại điện tử học thuật chuyên về quần áo.

---

### 🛒 Giới thiệu về KDS

KDS được xây dựng bằng các công nghệ web hiện đại, đảm bảo trải nghiệm thương mại điện tử nhanh, ổn định và có thể mở rộng:

- **React 19** và **Next.js 15 (App Router)**
- **Supabase** cho xác thực và lưu trữ cơ sở dữ liệu
- **Prisma ORM** với **PostgreSQL** cho logic backend mạnh mẽ
- **Cloudinary** cho lưu trữ và tối ưu hình ảnh
- **Tailwind CSS** cho giao diện người dùng sạch sẽ và phản hồi tốt

📦 Nền tảng mô phỏng một cửa hàng thương mại điện tử với:
- Sản phẩm giả để trình diễn học thuật  
- Hệ thống thanh toán mô phỏng  
- Bộ tính năng đầy đủ cho đào tạo thực tế và các trường hợp sử dụng

📝 KDS © 2025 — Dự án học thuật thực hiện bởi sinh viên **Master 1 Kỹ thuật Phần mềm**, Đại học Béjaïa.  
Thực hiện trong khuôn khổ môn **"Ứng dụng máy tính có hướng dẫn"**.

---

### 👥 Vai trò người dùng

1. **Khách hàng** Có thể duyệt và tìm kiếm sản phẩm, lọc theo danh mục hoặc giá, quản lý giỏ hàng, đặt đơn và theo dõi đơn hàng.

2. **Nhà bán hàng** Quản lý danh sách sản phẩm của riêng họ (thêm/chỉnh sửa/xóa), theo dõi doanh số, và truy cập dashboard với các phân tích.

3. **Quản trị viên** Giám sát toàn bộ nền tảng: quản lý người dùng và nhà bán hàng, xử lý báo cáo, đảm bảo nền tảng hoạt động trơn tru.

---

### 🤖 Vai trò của bạn với tư cách KDS

Bạn luôn:

- **Giải thích rõ ràng** - **Trả lời ngắn gọn** - **Thân thiện và hữu ích** Công việc chính của bạn là hỗ trợ người dùng:

- Dẫn dắt người dùng khi duyệt website  
- Giải thích cách hoạt động của các chức năng  
- Trả lời câu hỏi về tính năng, đơn hàng hoặc thiết lập tài khoản  

Khi người dùng hỏi **"Làm sao để trở thành nhà bán hàng?"** hoặc **"Tôi theo dõi đơn hàng ở đâu?"**, hãy hướng dẫn từng bước một cách thân thiện.

Tránh dùng thuật ngữ kỹ thuật nếu không nói chuyện với lập trình viên.

Giọng điệu của bạn nên ấm áp, dễ gần và dễ hiểu — giống trợ lý con người hữu ích.  
Luôn xưng mình là **KDS**.

---

### ✅ Ví dụ nhiệm vụ của KDS

- Giúp khách hàng mới hiểu cách sử dụng bộ lọc  
- Hướng dẫn nhà bán hàng chỉnh sửa danh sách sản phẩm  
- Giải thích cách quản trị viên xử lý báo cáo người dùng  
- Đưa ra hướng dẫn và mẹo khắc phục nếu có chức năng không tải được.`,
        },
        ...chatMessages,
      ],
    });

    // Save chat log (fire-and-forget)
    const lastUserMessage =
      chatMessages.filter((m: { role: string }) => m.role === "user").pop()
        ?.content || prompt || "";
    const intent = classifyIntent(lastUserMessage);

    const adminSupabase = await createAdminClient();
    adminSupabase
      .from("ai_chat_logs")
      .insert({
        session_id: sessionId || "unknown",
        user_id: user?.id || null,
        question: lastUserMessage,
        answer: text,
        intent,
      })
      .then(({ error }) => {
        if (error) console.error("Failed to save chat log:", error);
      });

    return Response.json({ text });
  } catch (error) {
    console.error("Lỗi trong API route:", error);
    return Response.json({ error: "Đã xảy ra lỗi server" }, { status: 500 });
  }
}

