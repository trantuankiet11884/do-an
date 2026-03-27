import { Metadata } from "next";
import FavoritesClient from "./favorites-client";

export const metadata: Metadata = {
  title: "My Favorites | KDS",
  description: "View and manage your favorite items",
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
