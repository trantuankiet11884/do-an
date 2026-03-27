import Link from "next/link";
import { ArrowUpRight, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  title: string;
  price: number;
  average_rating: number;
  images: string[];
  created_at: string;
}

interface RecentProductsProps {
  products: Product[];
}

export default function RecentProducts({ products }: RecentProductsProps) {
  // Sort products by creation date (newest first) and take first 5
  const recentProducts = [...products]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays === 0) {
      return "Hôm nay";
    } else if (diffInDays === 1) {
      return "Hôm qua";
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else {
      return date.toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Sản phẩm mới thêm gần đây
            </h3>
          </div>
          <Link href="/admin/products">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800"
            >
              Xem tất cả
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {recentProducts.map((product) => (
          <div key={product.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center">
              <div className="shrink-0 h-16 w-16 bg-gray-200 rounded-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                    <div className="text-gray-400 text-xs">Không có hình ảnh</div>
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {product.title}
                  </h4>
                  <Badge variant="outline" className="ml-2">
                    {parseFloat(product.price.toString()).toLocaleString(
                      "vi-VN",
                    )}
                    {" "}₫
                  </Badge>
                </div>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Đã thêm {formatDate(product.created_at)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">Đánh giá:</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-sm ${
                            star <= Math.round(product.average_rating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="ml-1 text-xs text-gray-600">
                      ({product.average_rating.toFixed(1)})
                    </span>
                  </div>
                  <Link
                    href={`/admin/products/edit/${product.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Sửa →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
        {recentProducts.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <div className="text-gray-400">Chưa có sản phẩm nào được thêm</div>
            <p className="mt-1 text-sm text-gray-500">
              Thêm sản phẩm đầu tiên của bạn để bắt đầu
            </p>
            <Link href="/admin/products/new">
              <Button className="mt-3" size="sm">
                Thêm sản phẩm
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {recentProducts.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>
                {recentProducts.length} sản phẩm
                đã thêm
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Mới nhất: {formatDate(recentProducts[0]?.created_at)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
