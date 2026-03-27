import { Metadata } from "next";
import VerifyOtpForm from "@/components/auth/verify-otp";

export const metadata: Metadata = {
  title: "Xác thực OTP",
  description: "Nhập mã xác thực đã gửi đến email của bạn",
};

export default function VerifyOtpPage() {
  return <VerifyOtpForm />;
}
