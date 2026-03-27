import { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
  description: "Đặt lại mật khẩu KDS của bạn",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
