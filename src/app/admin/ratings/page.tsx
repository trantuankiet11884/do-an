import { createAdminClient } from "@/lib/supabase/supabaseServer";
import { AdminRatingsClient } from "./AdminRatingsClient";

export const metadata = {
  title: "Kiểm duyệt Đánh giá | Bảng điều khiển Quản trị",
  description: "Kiểm duyệt và quản lý các đánh giá và nhận xét sản phẩm",
};

export default async function AdminRatingsPage() {
  const supabase = await createAdminClient();

  // Fetch initial ratings data
  const { data: ratings, error } = await supabase
    .from("ratings")
    .select(
      `
      *,
      product:products(id, title, images, slug),
      user:users(id, name, email)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching ratings:", error);
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Tải đánh giá thất bại</p>
      </div>
    );
  }

  return <AdminRatingsClient initialRatings={ratings || []} />;
}
