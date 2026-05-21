"use client";

import { useEffect } from "react";
import { trackBehavior } from "@/lib/tracking/behavior";

interface ProductViewTrackerProps {
  slug: string;
  title: string;
}

export default function ProductViewTracker({
  slug,
  title,
}: ProductViewTrackerProps) {
  useEffect(() => {
    trackBehavior("VIEW_PRODUCT", { slug, title });
  }, [slug, title]);

  return null;
}
