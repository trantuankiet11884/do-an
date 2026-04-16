"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { getOrCreateSessionId } from "@/lib/tracking/session";
import ProductCard from "@/components/products/product-card";
import { Bot, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const sessionId = getOrCreateSessionId();
        const url = new URL("/api/recommendations", window.location.origin);
        url.searchParams.append("sessionId", sessionId);
        if (user) {
          url.searchParams.append("userId", user.id);
        }

        const res = await fetch(url.toString());
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="w-8 h-8 rounded-md" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations.length) return null;

  return (
    <div className="my-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 mb-6 text-primary">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Sparkles className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          Đề xuất dành riêng cho bạn
        </h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
