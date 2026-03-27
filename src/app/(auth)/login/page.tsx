import { Metadata } from "next";
import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào tài khoản KDS của bạn",
};

export default function LoginPage() {
  return <LoginForm />;
}
