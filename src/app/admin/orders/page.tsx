import { createAdminClient } from "@/lib/supabase/supabaseServer";
import OrdersTable from "@/components/admin/orders-table";

export default async function AdminOrdersPage() {
  const supabase = await createAdminClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      users(id, name, email, phone, address),
      order_items(
        *,
        products(*),
        product_variants(*)
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch orders:", error);
    return (
      <div className="p-8 text-center text-red-600">
        Lỗi khi tải đơn hàng: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Quản lý đơn hàng
        </h1>
        <p className="text-gray-600">
          Xem và quản lý tất cả đơn hàng của khách hàng
        </p>
      </div>

      <OrdersTable orders={orders || []} />
    </div>
  );
}
