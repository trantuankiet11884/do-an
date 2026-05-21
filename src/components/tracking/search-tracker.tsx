"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trackBehavior } from "@/lib/tracking/behavior";

export default function SearchTracker() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");

  useEffect(() => {
    if (search) {
      trackBehavior("SEARCH", { query: search });
    }
  }, [search]);

  return null;
}
