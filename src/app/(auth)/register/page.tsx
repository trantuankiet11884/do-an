import { Metadata } from "next";
import RegisterForm from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Tạo tài khoản",
  description: "Tham gia KDS để bắt đầu mua sắm",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
