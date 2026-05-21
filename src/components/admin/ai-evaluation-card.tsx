"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Bot, Clock, Star, ThumbsUp } from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function AiEvaluationCard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/ai-evaluation")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi tải đánh giá AI:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Đánh giá hiệu suất AI Chatbot</CardTitle>
          <CardDescription>Đang phân tích dữ liệu...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const chartData = {
    labels: data.dailyResponseTimes?.map((d: any) =>
      new Date(d.date).toLocaleDateString("vi-VN", { day: "numeric", month: "short" })
    ) || [],
    datasets: [
      {
        label: "Thời gian phản hồi (ms)",
        data: data.dailyResponseTimes?.map((d: any) => d.avgMs) || [],
        backgroundColor: "rgba(168, 85, 247, 0.8)", // Purple
        borderRadius: 4,
      },
    ],
  };

  return (
    <Card className="col-span-full border-purple-100 shadow-md">
      <CardHeader className="bg-purple-50/50 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Bot className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-lg text-purple-900">Đánh giá hiệu suất AI Chatbot</CardTitle>
            <CardDescription>Thống kê chất lượng phản hồi trong 30 ngày qua</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Bot className="w-4 h-4" />
              <span className="text-sm font-medium">Tổng số tương tác</span>
            </div>
            <p className="text-2xl font-bold">{data.totalChats}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Điểm đánh giá TB</span>
            </div>
            <p className="text-2xl font-bold">{data.avgRating} <span className="text-sm font-normal text-muted-foreground">/ 5.0</span></p>
            <p className="text-xs text-muted-foreground mt-1">Dựa trên {data.totalRated} đánh giá</p>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <ThumbsUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Tỷ lệ hài lòng</span>
            </div>
            <p className="text-2xl font-bold">{data.satisfactionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Đánh giá 4-5 sao</p>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Tốc độ phản hồi TB</span>
            </div>
            <p className="text-2xl font-bold">{data.avgResponseTimeMs} <span className="text-sm font-normal text-muted-foreground">ms</span></p>
          </div>
        </div>

        <div className="h-[250px] w-full">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                title: { display: true, text: 'Tốc độ phản hồi trung bình theo ngày (ms)' }
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
