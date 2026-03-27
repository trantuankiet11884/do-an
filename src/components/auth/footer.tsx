"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function AuthFooter() {
  const currentYear = new Date().getFullYear();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showCookie, setShowCookie] = useState(false);

  return (
    <>
      <footer className="bg-gray-100 border-t border-gray-200 py-5">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <div className="flex justify-center gap-6 mb-4">
            <button
              onClick={() => setShowPrivacy(true)}
              className="text-sm hover:text-gray-900 transition-colors">
              Chính sách bảo mật
            </button>
            <button
              onClick={() => setShowTerms(true)}
              className="text-sm hover:text-gray-900 transition-colors">
              Điều khoản dịch vụ
            </button>
            <button
              onClick={() => setShowCookie(true)}
              className="text-sm hover:text-gray-900 transition-colors">
              Chính sách Cookie
            </button>
          </div>
          <p className="text-sm">© {currentYear} KDS. Bảo lưu mọi quyền.</p>
        </div>
      </footer>

      {/* Dialogs */}
      {showPrivacy && (
        <Dialog title="Chính sách bảo mật" onClose={() => setShowPrivacy(false)}>
          <PrivacyContent />
        </Dialog>
      )}
      {showTerms && (
        <Dialog title="Điều khoản dịch vụ" onClose={() => setShowTerms(false)}>
          <TermsContent />
        </Dialog>
      )}
      {showCookie && (
        <Dialog title="Chính sách Cookie" onClose={() => setShowCookie(false)}>
          <CookieContent />
        </Dialog>
      )}
    </>
  );
}

// Reusable dialog component
function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden animate-scale-in border border-gray-200"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-colors border border-gray-200">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh] bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}

// Content components (copy from your user footer, adjust colors if needed)
function PrivacyContent() {
  return (
    <div className="prose max-w-none">
      <p className="text-gray-600 mb-6">Ngày có hiệu lực: 22/02/2026</p>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Thông tin chúng tôi thu thập
      </h3>
      <p className="text-gray-700 mb-4">
        Chúng tôi thu thập thông tin bạn cung cấp trực tiếp cho chúng tôi, ví dụ
        như khi bạn tạo tài khoản, thực hiện mua hàng hoặc liên hệ với chúng
        tôi. Thông tin này có thể bao gồm tên, địa chỉ email, số điện thoại, địa
        chỉ giao hàng và thông tin thanh toán của bạn.
      </p>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Cách chúng tôi sử dụng thông tin
      </h3>
      <p className="text-gray-700 mb-3">
        Chúng tôi sử dụng thông tin thu thập được để:
      </p>
      <ul className="text-gray-600 mb-4 list-disc pl-6">
        <li>Xử lý đơn hàng và thanh toán của bạn</li>
        <li>Liên lạc với bạn về đơn hàng và tài khoản</li>
        <li>Gửi các ưu đãi quảng cáo và bản tin (khi có sự đồng ý của bạn)</li>
        <li>Cải thiện trang web và dịch vụ của chúng tôi</li>
        <li>Tuân thủ các nghĩa vụ pháp lý</li>
      </ul>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Chia sẻ thông tin
      </h3>
      <p className="text-gray-700 mb-4">
        Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn cho bên thứ
        ba. Chúng tôi có thể chia sẻ thông tin của bạn với các nhà cung cấp dịch
        vụ tin cậy hỗ trợ chúng tôi vận hành trang web, kinh doanh hoặc phục vụ
        bạn, miễn là các bên đó đồng ý giữ kín thông tin này.
      </p>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        An toàn dữ liệu
      </h3>
      <p className="text-gray-700 mb-4">
        Chúng tôi thực hiện các biện pháp an ninh thích hợp để bảo vệ thông tin
        cá nhân của bạn khỏi việc truy cập, thay đổi, tiết lộ hoặc hủy hoại trái
        phép.
      </p>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quyền lợi của bạn</h3>
      <p className="text-gray-700 mb-4">
        Bạn có quyền truy cập, cập nhật hoặc xóa thông tin cá nhân của mình. Để
        thực hiện các quyền này, vui lòng liên hệ với chúng tôi tại
        support@kds.com.
      </p>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Thay đổi chính sách này
      </h3>
      <p className="text-gray-700">
        Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian. Chúng
        tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào bằng cách đăng chính
        sách mới trên trang này.
      </p>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="prose max-w-none">
      <p className="text-gray-600 mb-6">Ngày có hiệu lực: 22/02/2026</p>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Chấp nhận Điều khoản
      </h3>
      <p className="text-gray-700 mb-4">
        Bằng cách truy cập và sử dụng dịch vụ của KDS, bạn chấp nhận và đồng ý
        tuân theo các Điều khoản dịch vụ này.
      </p>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sử dụng Dịch vụ của chúng tôi
      </h3>
      <p className="text-gray-700 mb-4">
        Bạn chỉ được sử dụng dịch vụ của chúng tôi cho các mục đích hợp pháp và
        tuân theo các Điều khoản này. Bạn đồng ý không sử dụng dịch vụ theo bất
        kỳ cách nào có thể làm hỏng, vô hiệu hóa, gây quá tải hoặc làm suy yếu
        trang web của chúng tôi.
      </p>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Trách nhiệm Tài khoản
      </h3>
      <p className="text-gray-700 mb-4">
        Nếu bạn tạo tài khoản, bạn chịu trách nhiệm bảo mật tài khoản của mình
        và cho mọi hoạt động xảy ra dưới tài khoản đó. Bạn phải thông báo ngay
        cho chúng tôi về bất kỳ việc sử dụng trái phép nào.
      </p>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Đơn hàng và Thanh toán
      </h3>
      <p className="text-gray-700 mb-4">
        Bằng cách đặt hàng, bạn đồng ý thanh toán mức giá quy định cho sản phẩm.
        Chúng tôi có quyền từ chối hoặc hủy bất kỳ đơn hàng nào vì bất kỳ lý do
        nào, bao gồm nhưng không giới hạn ở tính trạng sẵn có của sản phẩm, lỗi
        giá cả hoặc nghi ngờ gian lận.
      </p>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Vận chuyển và Trả hàng
      </h3>
      <p className="text-gray-700 mb-4">
        Chính sách vận chuyển và trả hàng của chúng tôi được quy định riêng và
        được kết hợp vào các Điều khoản này bằng cách tham chiếu.
      </p>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sở hữu trí tuệ
      </h3>
      <p className="text-gray-700 mb-4">
        Tất cả nội dung trên trang web này, bao gồm văn bản, đồ họa, logo và
        hình ảnh, là tài sản của KDS và được bảo vệ bởi luật bản quyền.
      </p>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Giới hạn Trách nhiệm
      </h3>
      <p className="text-gray-700 mb-4">
        Trong phạm vi tối đa do luật pháp cho phép, KDS sẽ không chịu trách
        nhiệm về bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt hoặc hệ quả
        nào phát sinh từ hoặc liên quan đến việc bạn sử dụng dịch vụ của chúng
        tôi.
      </p>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Luật điều chỉnh</h3>
      <p className="text-gray-700">
        Các Điều khoản này sẽ được điều chỉnh bởi pháp luật của nước Cộng hòa
        Xã hội Chủ nghĩa Việt Nam.
      </p>
    </div>
  );
}

function CookieContent() {
  return (
    <div className="prose max-w-none">
      <p className="text-gray-600 mb-6">Ngày có hiệu lực: 22/02/2026</p>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Cookie là gì
      </h3>
      <p className="text-gray-700 mb-4">
        Cookie là các tệp văn bản nhỏ được lưu trên máy tính hoặc thiết bị di
        động của bạn khi bạn truy cập trang web. Chúng được sử dụng rộng rãi để
        làm cho các trang web hoạt động hiệu quả hơn và cung cấp thông tin cho
        chủ sở hữu trang web.
      </p>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Cách chúng tôi sử dụng Cookie
      </h3>
      <p className="text-gray-700 mb-4">
        Chúng tôi sử dụng cookie cho các mục đích sau:
      </p>
      <ul className="text-gray-600 mb-4 list-disc pl-6">
        <li>Essential cookies: Cần thiết để trang web hoạt động bình thường</li>
        <li>
          Performance cookies: Giúp chúng tôi hiểu cách khách truy cập tương tác
          với trang web
        </li>
        <li>Functional cookies: Ghi nhớ các sở thích và cài đặt của bạn</li>
        <li>Marketing cookies: Được sử dụng để phân phối quảng cáo liên quan</li>
      </ul>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Quản lý Cookie
      </h3>
      <p className="text-gray-700 mb-4">
        Hầu hết các trình duyệt web cho phép bạn kiểm soát cookie thông qua cài
        đặt. Bạn có thể chọn chặn hoặc xóa cookie, nhưng điều này có thể ảnh
        hưởng đến trải nghiệm của bạn trên trang web.
      </p>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Thay đổi chính sách này
      </h3>
      <p className="text-gray-700">
        Chúng tôi có thể cập nhật Chính sách Cookie này theo thời gian. Bất kỳ
        thay đổi nào sẽ được đăng trên trang này.
      </p>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Liên hệ</h3>
      <p className="text-gray-700">
        Nếu bạn có bất kỳ câu hỏi nào về việc chúng tôi sử dụng cookie, vui lòng
        liên hệ với chúng tôi tại support@kds.com.
      </p>
    </div>
  );
}
