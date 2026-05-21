"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useCart } from "@/lib/cart/context";
import {
  MapPin,
  CheckCircle,
  ArrowLeft,
  Package,
  Truck,
  Shield,
  CreditCard,
  Clock,
  User,
  Phone,
  Home,
  Loader2,
  X,
  ChevronRight,
  ShoppingBag,
  PhoneCall,
  MapPinned,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trackBehavior } from "@/lib/tracking/behavior";

// Force dynamic rendering to avoid prerender issues
export const dynamic = "force-dynamic";

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="text-center px-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#f73a00] mx-auto mb-4" />
        <p className="text-gray-600 text-sm sm:text-base">
          Đang tải trang thanh toán...
        </p>
      </div>
    </div>
  );
}

// Main checkout content component
function CheckoutContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, total, clearCart, loading: cartLoading } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const isLoading = authLoading || cartLoading;

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "STRIPE">("COD");

  // Handle mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user && mounted) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      }));
    }
  }, [user, mounted]);

  // Handle redirect for non-authenticated users
  useEffect(() => {
    if (mounted && !isLoading && !user) {
      toast.error("Vui lòng đăng nhập để thanh toán");
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?redirectTo=${returnUrl}`);
    }

    // Handle Stripe cancellation
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("canceled")) {
      toast.error("Thanh toán đã bị hủy. Vui lòng thử lại.");
    }
  }, [user, isLoading, router, mounted]);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted || isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 sm:py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-100 mb-4 sm:mb-6">
            <Package className="h-8 w-8 sm:h-10 sm:w-10 text-[#f73a00]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Giỏ hàng của bạn đang trống
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            Thêm một số sản phẩm vào giỏ hàng trước khi thanh toán.
          </p>
          <Button
            onClick={() => router.push("/products")}
            className="bg-[#f73a00] hover:bg-[#f73a00]/90 text-white rounded-xl px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg w-full sm:w-auto">
            Xem sản phẩm
          </Button>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!formData.fullName || !formData.phone || !formData.address) {
        toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc");
        setSubmitting(false);
        return;
      }

      const shippingInfo = `Họ và tên: ${formData.fullName}
Số điện thoại: ${formData.phone}
Địa chỉ: ${formData.address}`;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingInfo,
          totalPrice: total,
          updateUserAddress: true,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể đặt hàng");

      setOrderId(data.order.id);
      setOrderNumber(data.order.order_number || "Đang xử lý");
      setOrderTotal(data.order.total_price);
      setOrderTotal(data.order.total_price);
      console.log(data);
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setOrderPlaced(true);
      await clearCart();
      trackBehavior("CHECKOUT", {
        orderId: data.order.id,
        orderNumber: data.order.order_number,
        total: data.order.total_price,
        paymentMethod,
        itemCount: items.length,
      });
      toast.success("Đặt hàng thành công!");
    } catch (error: any) {
      toast.error(error.message || "Không thể đặt hàng");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderPlaced) {
    const halfAmount = orderTotal / 2;

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-3">
        <div className="max-w-lg mx-auto">
          {/* Success Card - smaller, tighter */}
          <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-white">
            {/* Header with check - smaller */}
            <CardHeader className="bg-[#087f00] text-white rounded-t-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-5 -mb-5" />

              <div className="relative">
                <div className="flex items-center justify-center mb-2">
                  <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-center mb-1">
                  Đã nhận đơn hàng!
                </CardTitle>
                <CardDescription className="text-green-50 text-center text-sm">
                  Cảm ơn bạn đã mua sắm tại cửa hàng
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3 bg-white">
              {/* Status Banner - compact */}
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-[#f73a00]" />
                    <span className="font-medium text-gray-900 text-xs">
                      Trạng thái đơn hàng
                    </span>
                  </div>
                  <Badge className="bg-yellow-100 text-[#f73a00] px-2 py-0.5 text-xs font-medium">
                    CHỜ XỬ LÝ
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Chúng tôi sẽ sớm liên hệ với bạn qua điện thoại để xác nhận.
                </p>
              </div>

              {/* Order Details - two compact cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Receipt className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                      Mã tham chiếu
                    </span>
                  </div>
                  <p className="font-mono text-xs text-gray-900 break-all">
                    {orderId.substring(0, 10)}...
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ShoppingBag className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                      Tổng cộng
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {orderTotal.toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              {/* Payment & Delivery Info - NEW */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 space-y-1.5">
                <div className="flex items-start gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">
                      Thanh toán một nửa ngay
                    </p>
                    <p className="text-[11px] text-blue-800">
                      {halfAmount.toLocaleString("vi-VN")} khi nhận hàng (50%)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Truck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">
                      Giao hàng
                    </p>
                    <p className="text-[11px] text-blue-800">
                      Miễn phí trong khu vực • Có phí EMS cho các tỉnh thành
                      khác
                    </p>
                  </div>
                </div>
              </div>

              {/* What happens next - compact */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-2 text-xs">
                  Các bước tiếp theo
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 bg-white p-2 rounded border border-gray-100">
                    <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <PhoneCall className="h-3 w-3 text-[#f73a00]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900">
                        Xác nhận qua điện thoại
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Trong vòng 24 giờ
                      </p>
                    </div>
                    <ChevronRight className="h-3 w-3 text-gray-400 shrink-0" />
                  </div>
                  <div className="flex items-start gap-2 bg-white p-2 rounded border border-gray-100">
                    <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <Receipt className="h-3 w-3 text-[#f73a00]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900">
                        Mã số đơn hàng
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Bạn sẽ nhận được ORD-XXXX-XXXX
                      </p>
                    </div>
                    <ChevronRight className="h-3 w-3 text-gray-400 shrink-0" />
                  </div>
                  <div className="flex items-start gap-2 bg-white p-2 rounded border border-gray-100">
                    <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <MapPinned className="h-3 w-3 text-[#f73a00]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900">
                        Sắp xếp giao hàng
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Dựa trên vị trí của bạn
                      </p>
                    </div>
                    <ChevronRight className="h-3 w-3 text-gray-400 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Action Buttons - stacked on mobile, inline on larger screens */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Button
                  onClick={() => router.push("/orders")}
                  className="bg-[#f73a00] hover:bg-[#f73a00]/90 text-white rounded-lg py-2.5 text-sm w-full sm:w-1/2">
                  Theo dõi đơn hàng
                </Button>
                <Button
                  onClick={() => router.push("/products")}
                  variant="outline"
                  className="rounded-lg border-orange-200 text-gray-900 hover:bg-orange-50 py-2.5 text-sm w-full sm:w-1/2">
                  Tiếp tục mua hàng
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  const half = total / 2;
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-4 sm:py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <Button
            variant="ghost"
            onClick={() => router.push("/cart")}
            className="mb-4 sm:mb-6 text-gray-600 hover:text-gray-900 text-sm sm:text-base -ml-2">
            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
            Quay lại giỏ hàng
          </Button>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-8 bg-gradient-to-r from-[#f73a00] to-amber-600 bg-clip-text text-transparent">
            Thanh toán
          </h1>

          {/* Mobile Order Summary Toggle could go here if needed */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Shipping Form */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <Card className="border-0 shadow-lg sm:shadow-xl rounded-xl sm:rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-[#f73a00] text-white p-4 sm:p-6 rounded-t-lg">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shrink-0">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-xl">
                        Thông tin giao hàng
                      </CardTitle>
                      <CardDescription className="text-orange-50 text-xs sm:text-sm">
                        Nhập chi tiết nhận hàng của bạn
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 bg-white">
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label
                          htmlFor="fullName"
                          className="text-gray-700 text-sm sm:text-base">
                          Họ và tên <span className="text-[#f73a00]">*</span>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            placeholder="Nhập họ và tên đầy đủ"
                            className="pl-9 sm:pl-10 rounded-xl border-gray-200 text-gray-700 focus:ring-[#f73a00] focus:border-[#f73a00] bg-white text-sm sm:text-base h-10 sm:h-12"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <Label
                          htmlFor="phone"
                          className="text-gray-700 text-sm sm:text-base">
                          Số điện thoại{" "}
                          <span className="text-[#f73a00]">*</span>
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            type="tel"
                            required
                            placeholder="Nhập số điện thoại"
                            className="pl-9 sm:pl-10 rounded-xl border-gray-200 text-gray-700 focus:ring-[#f73a00] focus:border-[#f73a00] bg-white text-sm sm:text-base h-10 sm:h-12"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label
                        htmlFor="address"
                        className="text-gray-700 text-sm sm:text-base">
                        Địa chỉ giao hàng{" "}
                        <span className="text-[#f73a00]">*</span>
                      </Label>
                      <div className="relative">
                        <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows={3}
                          required
                          placeholder="Địa chỉ nhà, số phòng, căn hộ, v.v."
                          className="pl-9 sm:pl-10 rounded-xl border-gray-200 text-gray-700 focus:ring-[#f73a00] focus:border-[#f73a00] bg-white text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-3 sm:p-4 border border-orange-100">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-[#f73a00] mt-0.5 shrink-0" />
                        <div className="text-xs sm:text-sm text-[#f73a00]">
                          <p className="font-medium mb-1">
                            Thông tin giao hàng:
                          </p>
                          <ul className="list-disc list-inside space-y-0.5 sm:space-y-1">
                            <li>Giao hàng miễn phí trong khu vực</li>
                            <li>
                              Có tính phí EMS khi giao đến các tỉnh thành khác
                            </li>
                            <li>Thời gian nhận hàng: 2-3 tuần</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 sm:pt-4 border-t border-gray-200">
                      <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                        <Shield className="h-4 w-4 text-[#f73a00] shrink-0 mt-0.5" />
                        <p>
                          Bằng cách đặt hàng, bạn đồng ý với các{" "}
                          <button
                            type="button"
                            onClick={() => setShowTermsDialog(true)}
                            className="underline cursor-pointer hover:text-[#f73a00] focus:outline-none">
                            điều khoản
                          </button>{" "}
                          và{" "}
                          <button
                            type="button"
                            onClick={() => setShowTermsDialog(true)}
                            className="underline cursor-pointer hover:text-[#f73a00] focus:outline-none">
                            điều kiện
                          </button>{" "}
                          của chúng tôi.
                        </p>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary - Sticky on desktop */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <Card className="border-0 shadow-lg sm:shadow-xl rounded-xl sm:rounded-2xl overflow-hidden sticky top-4 lg:top-24 bg-white">
                <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 sm:p-6 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                    <CardTitle className="text-base sm:text-xl">
                      Tóm tắt đơn hàng
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white">
                  {/* Items List - Scrollable on mobile if many items */}
                  <div className="space-y-3 max-h-60 sm:max-h-96 overflow-y-auto pr-1 sm:pr-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-2 sm:gap-3">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {item.product.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-xs sm:text-sm line-clamp-1">
                            {item.product.title}
                          </h4>
                          {item.variant && (
                            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                              {[
                                item.variant.color,
                                item.variant.size,
                                item.variant.unit,
                              ]
                                .filter(Boolean)
                                .join(" • ")}
                            </div>
                          )}
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] sm:text-xs text-gray-500">
                              Số lượng: {item.quantity}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-gray-900">
                              {(item.price * item.quantity).toLocaleString(
                                "vi-VN",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-gray-200" />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Tạm tính</span>
                      <span className="font-medium text-gray-900">
                        {total.toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Giao hàng</span>
                      <div className="text-right">
                        <span className="font-medium text-green-600">
                          Miễn phí
                        </span>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          Trong khu vực
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 sm:pt-3">
                      <span className="text-sm sm:text-base font-semibold text-gray-900">
                        Tổng cộng
                      </span>
                      <span className="text-lg sm:text-2xl font-bold text-[#f73a00]">
                        {total.toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm text-right">
                      Bạn thanh toán: {half.toLocaleString("vi-VN")} (50%)
                    </p>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <Label className="text-gray-700 text-sm font-semibold">
                      Phương thức thanh toán{" "}
                      <span className="text-[#f73a00]">*</span>
                    </Label>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("COD")}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                          paymentMethod === "COD"
                            ? "border-[#f73a00] bg-orange-50 ring-1 ring-[#f73a00]"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}>
                        <div
                          className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                            paymentMethod === "COD"
                              ? "border-[#f73a00]"
                              : "border-gray-300"
                          }`}>
                          {paymentMethod === "COD" && (
                            <div className="h-2 w-2 rounded-full bg-[#f73a00]" />
                          )}
                        </div>
                        <div className="text-left">
                          <p
                            className={`text-sm font-medium ${paymentMethod === "COD" ? "text-gray-900" : "text-gray-700"}`}>
                            Thanh toán khi nhận hàng (COD)
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            Bạn sẽ thanh toán một nửa trước khi nhận hàng.
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("STRIPE")}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                          paymentMethod === "STRIPE"
                            ? "border-[#f73a00] bg-orange-50 ring-1 ring-[#f73a00]"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}>
                        <div
                          className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                            paymentMethod === "STRIPE"
                              ? "border-[#f73a00]"
                              : "border-gray-300"
                          }`}>
                          {paymentMethod === "STRIPE" && (
                            <div className="h-2 w-2 rounded-full bg-[#f73a00]" />
                          )}
                        </div>
                        <div className="text-left flex-1">
                          <div className="flex justify-between items-center w-full">
                            <p
                              className={`text-sm font-medium ${paymentMethod === "STRIPE" ? "text-gray-900" : "text-gray-700"}`}>
                              Thẻ tín dụng / Ghi nợ
                            </p>
                            <div className="flex gap-1">
                              <img
                                src="https://img.icons8.com/color/48/visa.png"
                                className="h-4"
                                alt="visa"
                              />
                              <img
                                src="https://img.icons8.com/color/48/mastercard.png"
                                className="h-4"
                                alt="mastercard"
                              />
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            Thanh toán an toàn qua Stripe.
                          </p>
                        </div>
                      </button>

                      {/* Stripe Test Helper - NEW */}
                      {paymentMethod === "STRIPE" && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-start gap-2">
                            <Shield className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-blue-900">
                                Chế độ thử nghiệm (Test Mode)
                              </p>
                              <p className="text-[10px] text-blue-700 leading-relaxed mt-0.5">
                                Bạn có thể sử dụng thẻ test của Stripe để hoàn
                                tất đơn hàng:
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <code className="bg-white px-2 py-1 rounded border border-blue-200 text-blue-700 font-mono text-xs">
                                  4242 4242 4242 4242
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(
                                      "4242 4242 4242 4242",
                                    );
                                    toast.success("Đã copy số thẻ test!");
                                  }}>
                                  Copy
                                </Button>
                              </div>
                              <p className="text-[9px] text-blue-500 mt-1 italic">
                                * Thông tin ngày hết hạn và CVC có thể nhập bất
                                kỳ.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-[#f73a00] to-[#f73a00] hover:from-[#f73a00] hover:to-orange-700 text-white rounded-xl py-4 sm:py-6 text-sm sm:text-lg"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={submitting || items.length === 0}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        Đang đặt hàng...
                      </>
                    ) : (
                      "Đặt hàng ngay"
                    )}
                  </Button>

                  {/* Note */}
                  <p className="text-[10px] sm:text-xs text-center text-gray-500">
                    Bạn chỉ thanh toán một nửa trước khi nhận hàng.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Dialog - Mobile Optimized */}
      {showTermsDialog && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => setShowTermsDialog(false)}>
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden animate-slide-up sm:animate-scale-in border border-gray-200"
            onClick={(e) => e.stopPropagation()}>
            {/* Dialog Header - Mobile Optimized */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50 sticky top-0">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                Điều khoản và Điều kiện
              </h2>
              <button
                onClick={() => setShowTermsDialog(false)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
              </button>
            </div>

            {/* Dialog Content - Scrollable */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)] sm:max-h-[60vh] bg-white">
              <div className="prose max-w-none">
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                  Ngày có hiệu lực: 22/2/2026
                </p>

                <div className="space-y-4 sm:space-y-6">
                  <section>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">
                      Chấp thuận điều khoản
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Bằng việc sử dụng dịch vụ của KDS, bạn đồng ý tuân thủ các
                      Điều khoản Dịch vụ này.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">
                      Sử dụng dịch vụ
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Bạn cam kết sử dụng dịch vụ cho các mục đích hợp pháp và
                      theo đúng quy định. Bạn đồng ý không gây hại, làm gián
                      đoạn hoặc quá tải hệ thống của chúng tôi.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">
                      Trách nhiệm tài khoản
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Nếu bạn tạo tài khoản, bạn có trách nhiệm bảo mật tài
                      khoản và chịu trách nhiệm cho mọi hoạt động diễn ra dưới
                      tài khoản đó.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">
                      Đơn hàng và Thanh toán
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Khi đặt hàng, bạn đồng ý thanh toán đúng giá niêm yết.
                      Chúng tôi có quyền từ chối hoặc hủy đơn hàng nếu có sai
                      sót về giá hoặc nghi ngờ gian lận.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">
                      Vận chuyển và Đổi trả
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Chính sách vận chuyển và đổi trả được quy định riêng và là
                      một phần của Điều khoản này.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">
                      Sở hữu trí tuệ
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Mọi nội dung trên website bao gồm văn bản, đồ họa, logo và
                      hình ảnh là tài sản của KDS và được bảo vệ bởi luật bản
                      quyền.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">
                      Giới hạn trách nhiệm
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      KDS không chịu trách nhiệm cho các thiệt hại gián tiếp,
                      ngẫu nhiên hoặc hậu quả phát sinh từ việc bạn sử dụng dịch
                      vụ của chúng tôi.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">
                      Luật áp dụng
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Các Điều khoản này được điều chỉnh bởi pháp luật hiện
                      hành.
                    </p>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Main export with Suspense boundary
export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CheckoutContent />
    </Suspense>
  );
}
