import { Metadata } from "next";
import FavoritesClient from "./favorites-client";

export const metadata: Metadata = {
  title: "Sản phẩm yêu thích | KDS",
  description: "Xem và quản lý các sản phẩm yêu thích của bạn",
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
