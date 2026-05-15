"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bot, RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIForecast() {
  const [forecast, setForecast] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchForecast = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/forecast");
      const data = await res.json();
      setForecast(data.forecast || "Không thể tạo báo cáo lúc này.");
    } catch (e) {
      console.error(e);
      setForecast("Lỗi khi phân tích dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  // Simple Markdown Parser for ### and **
  const parseMarkdown = (text: string) => {
    const html = text
      .replace(
        /### (.*)/g,
        '<h3 class="text-lg font-bold text-gray-800 mt-4 mb-2 flex items-center gap-2"><span class="text-primary">•</span> $1</h3>',
      )
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n\n/g, "<br/><br/>")
      .replace(/\n/g, "<br/>");
    return { __html: html };
  };

  return (
    <Card className="col-span-full bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-indigo-100">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-indigo-100/50">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Bot className="w-5 h-5 text-indigo-700" />
          </div>
          <CardTitle className="text-xl font-bold text-indigo-900">
            KDS - Phân Tích & Dự Báo Kinh Doanh
          </CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchForecast}
          disabled={isLoading}
          className="text-indigo-600 border-indigo-200 hover:bg-indigo-100">
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Tải lại
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-indigo-200/50 rounded w-3/4"></div>
            <div className="h-4 bg-indigo-200/50 rounded w-full"></div>
            <div className="h-4 bg-indigo-200/50 rounded w-5/6"></div>
            <div className="h-4 bg-indigo-200/50 rounded w-2/3 mt-6"></div>
            <div className="h-4 bg-indigo-200/50 rounded w-4/5"></div>
          </div>
        ) : (
          <div
            className="text-gray-700 leading-relaxed max-w-none text-sm md:text-base space-y-1"
            dangerouslySetInnerHTML={parseMarkdown(forecast)}
          />
        )}
      </CardContent>
    </Card>
  );
}
