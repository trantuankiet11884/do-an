// components/user/footer.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  Send,
  ShoppingBag,
  X,
} from "lucide-react";
import Image from "next/image";

interface FooterProps {
  categories: { id: string; title: string }[];
}

export default function Footer({ categories }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  // Compute category links from the passed categories
  const findCategoryId = (keyword: string) => {
    const cat = categories.find((c) => c.title.toLowerCase().includes(keyword));
    return cat ? `/products?category=${cat.id}` : "/products";
  };

  const categoryHrefs = {
    men: findCategoryId("men"),
    women: findCategoryId("women"),
    electronics: findCategoryId("electronics"),
  };

  // Dialog states
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showCookieDialog, setShowCookieDialog] = useState(false);
  const [showShippingRefundDialog, setShowShippingRefundDialog] =
    useState(false); // combined

  // Hide footer on auth pages and admin routes
  if (
    [
      "/login",
      "/register",
      "/forgot-password",
      "/verify-otp",
      "/reset-password",
      "/change-password",
    ].includes(pathname) ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <>
      <footer className="bg-[#ffe9ad] text-slate-900 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-16">
            {/* Brand - 3 columns */}
            <div className="lg:col-span-3">
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={100}
                  height={100}
                  className="w-20 h-20 object-contain"
                />
              </Link>
              <p className="text-slate-800 leading-relaxed mb-6">
                Định nghĩa lại thời trang cao cấp với các bộ sưu tập tuyển chọn
                dành cho giới chuyên nghiệp hiện đại. Chất lượng, tay nghề thủ
                công và phong cách vượt thời gian.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="h-10 w-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-[#f73a00]/10 transition-all hover:scale-110"
                  aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="h-10 w-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-[#f73a00]/10 transition-all hover:scale-110"
                  aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="h-10 w-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-[#f73a00]/10 transition-all hover:scale-110"
                  aria-label="Twitter">
                  <Send className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Shop - 3 columns (was 2) */}
            <div className="lg:col-span-3">
              <h6 className="font-bold text-lg mb-6 relative inline-block">
                Cửa hàng
                <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-[#f73a00]"></span>
              </h6>
              <ul className="space-y-3 text-slate-800">
                <li>
                  <Link
                    href="/products?new=true"
                    className="hover:text-slate-900 transition-colors inline-flex items-center gap-2 group">
                    <span className="w-0 h-0.5 bg-[#f73a00] group-hover:w-2 transition-all"></span>
                    Hàng mới về
                  </Link>
                </li>
                <li>
                  <Link
                    href={categoryHrefs.men}
                    className="hover:text-slate-900 transition-colors inline-flex items-center gap-2 group">
                    <span className="w-0 h-0.5 bg-[#f73a00] group-hover:w-2 transition-all"></span>
                    Bộ sưu tập Nam
                  </Link>
                </li>
                <li>
                  <Link
                    href={categoryHrefs.women}
                    className="hover:text-slate-900 transition-colors inline-flex items-center gap-2 group">
                    <span className="w-0 h-0.5 bg-[#f73a00] group-hover:w-2 transition-all"></span>
                    Bộ sưu tập Nữ
                  </Link>
                </li>
                <li>
                  <Link
                    href={categoryHrefs.electronics}
                    className="hover:text-slate-900 transition-colors inline-flex items-center gap-2 group">
                    <span className="w-0 h-0.5 bg-[#f73a00] group-hover:w-2 transition-all"></span>
                    Điện tử
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?featured=true"
                    className="hover:text-slate-900 transition-colors inline-flex items-center gap-2 group">
                    <span className="w-0 h-0.5 bg-[#f73a00] group-hover:w-2 transition-all"></span>
                    Sản phẩm bán chạy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal - 3 columns (was 2) */}
            <div className="lg:col-span-3">
              <h6 className="font-bold text-lg mb-6 relative inline-block">
                Pháp lý
                <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-[#f73a00]"></span>
              </h6>
              <ul className="space-y-3 text-slate-800">
                <li>
                  <button
                    onClick={() => setShowTermsDialog(true)}
                    className="hover:text-slate-900 transition-colors inline-flex items-center gap-2 group text-left w-full">
                    <span className="w-0 h-0.5 bg-[#f73a00] group-hover:w-2 transition-all"></span>
                    Điều khoản dịch vụ
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowShippingRefundDialog(true)}
                    className="hover:text-slate-900 transition-colors inline-flex items-center gap-2 group text-left w-full">
                    <span className="w-0 h-0.5 bg-[#f73a00] group-hover:w-2 transition-all"></span>
                    Vận chuyển & Hoàn tiền
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact & Newsletter - 3 columns (was 5) */}
            <div className="lg:col-span-3">
              {/* Contact Info */}
              <div className="mb-4">
                <h6 className="font-bold text-lg mb-6 relative inline-block">
                  Hỗ trợ
                  <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-[#f73a00]"></span>
                </h6>
                <ul className="space-y-4 text-slate-800">
                  <li className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-[#f73a00] mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-slate-900">
                        Hỗ trợ khách hàng
                      </div>
                      <div className="text-sm">+251912345678</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-[#f73a00] mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-slate-900">Email</div>
                      <div className="text-sm">support@kds.com</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-800 text-sm order-2 md:order-1">
                © {currentYear} KDS Inc. All rights reserved.
              </p>
              <div className="flex gap-6 order-1 md:order-2">
                <button
                  onClick={() => setShowPrivacyDialog(true)}
                  className="text-slate-800 hover:text-slate-900 transition-colors text-sm">
                  Chính sách bảo mật
                </button>
                <button
                  onClick={() => setShowTermsDialog(true)}
                  className="text-slate-800 hover:text-slate-900 transition-colors text-sm">
                  Điều khoản dịch vụ
                </button>
                <button
                  onClick={() => setShowCookieDialog(true)}
                  className="text-slate-800 hover:text-slate-900 transition-colors text-sm">
                  Chính sách Cookie
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Dialog */}
      {showPrivacyDialog && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowPrivacyDialog(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden animate-scale-in border border-gray-600"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-400 bg-[#ffe9ad]">
              <h2 className="text-2xl font-bold text-slate-900">
                Chính sách bảo mật
              </h2>
              <button
                onClick={() => setShowPrivacyDialog(false)}
                className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] bg-[#ffe9ad]">
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-6">
                  Ngày có hiệu lực: 22/02/2026
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin chúng tôi thu thập
                </h3>
                <p className="text-gray-700 mb-4">
                  Chúng tôi thu thập thông tin bạn cung cấp trực tiếp cho chúng
                  tôi, chẳng hạn như khi bạn tạo tài khoản, mua hàng hoặc liên
                  hệ với chúng tôi. Thông tin này có thể bao gồm tên, địa chỉ
                  email, số điện thoại, địa chỉ giao hàng và thông tin thanh
                  toán của bạn.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Cách chúng tôi sử dụng thông tin của bạn
                </h3>
                <p className="text-gray-700 mb-3">
                  Chúng tôi sử dụng thông tin thu thập được để:
                </p>
                <ul className="text-gray-600 mb-4 list-disc pl-6">
                  <li>Xử lý đơn hàng và thanh toán của bạn</li>
                  <li>Liên lạc với bạn về đơn hàng và tài khoản của bạn</li>
                  <li>
                    Gửi cho bạn các ưu đãi khuyến mãi và bản tin (với sự đồng ý
                    của bạn)
                  </li>
                  <li>Cải thiện trang web và dịch vụ của chúng tôi</li>
                  <li>Tuân thủ các nghĩa vụ pháp lý</li>
                </ul>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Chia sẻ thông tin
                </h3>
                <p className="text-gray-700 mb-4">
                  Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn
                  cho bên thứ ba. Chúng tôi có thể chia sẻ thông tin của bạn với
                  các nhà cung cấp dịch vụ đáng tin cậy, những người hỗ trợ
                  chúng tôi vận hành trang web, tiến hành kinh doanh hoặc phục
                  vụ bạn, miễn là các bên đó đồng ý giữ kín thông tin này.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Bảo mật dữ liệu
                </h3>
                <p className="text-gray-700 mb-4">
                  Chúng tôi triển khai các biện pháp bảo mật thích hợp để bảo vệ
                  thông tin cá nhân của bạn chống lại việc truy cập, thay đổi,
                  tiết lộ hoặc tiêu hủy trái phép.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quyền của bạn
                </h3>
                <p className="text-gray-700 mb-4">
                  Bạn có quyền truy cập, cập nhật hoặc xóa thông tin cá nhân của
                  mình. Để thực hiện các quyền này, vui lòng liên hệ với chúng
                  tôi tại support@kds.com.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thay đổi đối với Chính sách này
                </h3>
                <p className="text-gray-700">
                  Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời
                  gian. Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào
                  bằng cách đăng chính sách mới trên trang này.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Dialog */}
      {showTermsDialog && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowTermsDialog(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden animate-scale-in border border-slate-400"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-400 bg-[#ffe9ad]">
              <h2 className="text-2xl font-bold text-slate-900">
                Điều khoản dịch vụ
              </h2>
              <button
                onClick={() => setShowTermsDialog(false)}
                className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] bg-[#ffe9ad]">
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-6">
                  Ngày có hiệu lực: 22/02/2026
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Chấp nhận các điều khoản
                </h3>
                <p className="text-gray-700 mb-4">
                  Bằng cách truy cập và sử dụng các dịch vụ của KDS, bạn chấp
                  nhận và đồng ý bị ràng buộc bởi các Điều khoản dịch vụ này.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sử dụng dịch vụ của chúng tôi
                </h3>
                <p className="text-gray-700 mb-4">
                  Bạn chỉ có thể sử dụng các dịch vụ của chúng tôi cho các mục
                  đích hợp pháp và phù hợp với các Điều khoản này. Bạn đồng ý
                  không sử dụng các dịch vụ của chúng tôi theo bất kỳ cách nào
                  có thể gây tổn hại, vô hiệu hóa, làm quá tải hoặc làm suy yếu
                  trang web của chúng tôi.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Trách nhiệm tài khoản
                </h3>
                <p className="text-gray-700 mb-4">
                  Nếu bạn tạo một tài khoản, bạn chịu trách nhiệm bảo mật tài
                  khoản của mình và cho tất cả các hoạt động xảy ra dưới tài
                  khoản đó. Bạn phải thông báo cho chúng tôi ngay lập tức về bất
                  kỳ việc sử dụng trái phép nào.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Đơn hàng và Thanh toán
                </h3>
                <p className="text-gray-700 mb-4">
                  Bằng cách đặt hàng, bạn đồng ý trả mức giá đã chỉ định cho các
                  sản phẩm. Chúng tôi có quyền từ chối hoặc hủy bất kỳ đơn hàng
                  nào vì bất kỳ lý do gì, bao gồm nhưng không giới hạn ở tình
                  trạng còn hàng, lỗi về giá hoặc nghi ngờ gian lận.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vận chuyển và Trả hàng
                </h3>
                <p className="text-gray-700 mb-4">
                  Các chính sách vận chuyển và trả hàng của chúng tôi được nêu
                  riêng và được đưa vào các Điều khoản này bằng cách tham chiếu.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sở hữu trí tuệ
                </h3>
                <p className="text-gray-700 mb-4">
                  Tất cả nội dung trên trang web này, bao gồm văn bản, đồ họa,
                  logo và hình ảnh, là tài sản của KDS và được bảo vệ bởi luật
                  bản quyền.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Giới hạn trách nhiệm
                </h3>
                <p className="text-gray-700 mb-4">
                  Trong phạm vi tối đa được pháp luật cho phép, KDS sẽ không
                  chịu trách nhiệm về bất kỳ thiệt hại gián tiếp, ngẫu nhiên,
                  đặc biệt hoặc do hệ quả nào phát sinh từ hoặc liên quan đến
                  việc bạn sử dụng dịch vụ của chúng tôi.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Luật điều chỉnh
                </h3>
                <p className="text-gray-700">
                  Các Điều khoản này sẽ được điều chỉnh bởi luật pháp của Cộng
                  hòa Xã hội Chủ nghĩa Việt Nam.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Policy Dialog */}
      {showCookieDialog && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowCookieDialog(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden animate-scale-in border border-gray-600"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-[#ffe9ad]">
              <h2 className="text-2xl font-bold text-slate-900">
                Chính sách Cookie
              </h2>
              <button
                onClick={() => setShowCookieDialog(false)}
                className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 bg-[#ffe9ad] overflow-y-auto max-h-[60vh]">
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-6">
                  Ngày có hiệu lực: 22/02/2026
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Cookie là gì
                </h3>
                <p className="text-gray-700 mb-4">
                  Cookie là các tệp văn bản nhỏ được đặt trên máy tính hoặc
                  thiết bị di động của bạn khi bạn truy cập một trang web. Chúng
                  được sử dụng rộng rãi để làm cho trang web hoạt động hiệu quả
                  hơn và cung cấp thông tin cho chủ sở hữu trang web.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Cách chúng tôi sử dụng Cookie
                </h3>
                <p className="text-gray-700 mb-4">
                  Chúng tôi sử dụng cookie cho các mục đích sau:
                </p>
                <ul className="text-gray-600 mb-4 list-disc pl-6">
                  <li>
                    Cookie thiết yếu: Cần thiết để trang web hoạt động bình
                    thường
                  </li>
                  <li>
                    Cookie hiệu suất: Giúp chúng tôi hiểu cách khách truy cập
                    tương tác với trang web của chúng tôi
                  </li>
                  <li>
                    Cookie chức năng: Ghi nhớ các tùy chọn và cài đặt của bạn
                  </li>
                  <li>
                    Cookie tiếp thị: Được sử dụng để cung cấp các quảng cáo có
                    liên quan
                  </li>
                </ul>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quản lý Cookie
                </h3>
                <p className="text-gray-700 mb-4">
                  Hầu hết các trình duyệt web cho phép bạn kiểm soát cookie
                  thông qua cài đặt của chúng. Bạn có thể chọn chặn hoặc xóa
                  cookie, nhưng điều này có thể ảnh hưởng đến trải nghiệm của
                  bạn trên trang web của chúng tôi.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thay đổi đối với Chính sách này
                </h3>
                <p className="text-gray-700">
                  Chúng tôi có thể cập nhật Chính sách Cookie này theo thời
                  gian. Mọi thay đổi sẽ được đăng trên trang này.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Liên hệ với chúng tôi
                </h3>
                <p className="text-gray-700">
                  Nếu bạn có bất kỳ câu hỏi nào về việc chúng tôi sử dụng
                  cookie, vui lòng liên hệ với chúng tôi tại support@kds.com.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Combined Shipping & Refund Dialog */}
      {showShippingRefundDialog && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowShippingRefundDialog(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden animate-scale-in border border-gray-600"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-400 bg-[#ffe9ad]">
              <h2 className="text-2xl font-bold text-slate-900">
                Vận chuyển & Hoàn tiền
              </h2>
              <button
                onClick={() => setShowShippingRefundDialog(false)}
                className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] bg-[#ffe9ad]">
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-6">
                  Ngày có hiệu lực: 22/02/2026
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin vận chuyển
                </h3>
                <p className="text-gray-700 mb-4">
                  Chúng tôi cung cấp dịch vụ vận chuyển nội địa tại Việt Nam và
                  quốc tế. Đơn hàng được xử lý trong vòng 1-2 ngày làm việc sau
                  khi xác nhận thanh toán. Thời gian giao hàng thay đổi tùy
                  thuộc vào vị trí của bạn.
                </p>
                <ul className="text-gray-400 mb-4 list-disc pl-6">
                  <li>
                    <span className="font-medium text-gray-300">
                      Hồ Chí Minh:
                    </span>{" "}
                    15-21 ngày (Miễn phí)
                  </li>
                  <li>
                    <span className="font-medium text-gray-300">
                      Các tỉnh thành khác ở Việt Nam:
                    </span>{" "}
                    21-25 ngày (Phí cố định)
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Chính sách trả hàng
                </h3>
                <p className="text-gray-700 mb-4">
                  Chúng tôi muốn bạn hoàn toàn hài lòng với giao dịch mua hàng
                  của mình. Nếu vì bất kỳ lý do gì bạn không hài lòng, bạn có
                  thể trả lại các mặt hàng chưa qua sử dụng, chưa giặt trong
                  vòng 30 ngày kể từ ngày giao hàng để được hoàn tiền đầy đủ
                  hoặc trao đổi.
                </p>
                <p className="text-gray-700 mb-4">
                  Để bắt đầu trả hàng, vui lòng liên hệ với bộ phận hỗ trợ khách
                  hàng của chúng tôi với số đơn hàng và lý do trả hàng. Chi phí
                  vận chuyển trả hàng là trách nhiệm của khách hàng trừ khi mặt
                  hàng bị lỗi hoặc chúng tôi mắc lỗi.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quy trình hoàn tiền
                </h3>
                <p className="text-gray-700 mb-4">
                  Sau khi chúng tôi nhận được và kiểm tra hàng trả lại của bạn,
                  chúng tôi sẽ thông báo cho bạn về việc chấp thuận hoặc từ chối
                  hoàn tiền. Các khoản hoàn trả được chấp thuận sẽ được xử lý
                  trong vòng 5-7 ngày làm việc về phương thức thanh toán ban đầu
                  của bạn.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Trao đổi
                </h3>
                <p className="text-gray-700 mb-4">
                  Nếu bạn cần đổi một mặt hàng lấy kích thước hoặc màu sắc khác,
                  vui lòng trả lại mặt hàng ban đầu và đặt một đơn hàng mới.
                  Điều này đảm bảo quá trình xử lý nhanh nhất.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Điều kiện hoàn tiền
                </h3>
                <p className="text-gray-700 mb-4">
                  Để đủ điều kiện được hoàn tiền, các mặt hàng phải được trả lại
                  trong vòng 30 ngày kể từ ngày giao hàng, trong tình trạng ban
                  đầu (chưa qua sử dụng, chưa giặt, còn nguyên tem mác). Các mặt
                  hàng được đánh dấu là xả kho không đủ điều kiện được hoàn
                  tiền.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Hoàn tiền một phần
                </h3>
                <p className="text-gray-700 mb-4">
                  Trong một số trường hợp, chỉ hoàn tiền một phần được thực hiện
                  (nếu có):
                </p>
                <ul className="text-gray-400 mb-4 list-disc pl-6">
                  <li>Các mặt hàng có dấu hiệu sử dụng rõ ràng</li>
                  <li>Bất kỳ mặt hàng nào không ở tình trạng ban đầu</li>
                  <li>
                    Bất kỳ mặt hàng nào được trả lại hơn 30 ngày sau khi giao
                    hàng
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Hàng giảm giá
                </h3>
                <p className="text-gray-700 mb-4">
                  Chỉ các mặt hàng có giá thông thường mới có thể được hoàn
                  tiền. Các mặt hàng giảm giá không được hoàn tiền trừ khi có
                  quy định khác.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Chi phí vận chuyển
                </h3>
                <p className="text-gray-700">
                  Chi phí vận chuyển trả hàng là trách nhiệm của khách hàng trừ
                  khi việc trả hàng là do lỗi của chúng tôi (ví dụ: giao sai mặt
                  hàng) hoặc mặt hàng bị lỗi.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
