"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Search,
  ShoppingCart,
  MessageSquare,
  TrendingUp,
  RefreshCw,
  Eye,
  ArrowUpRight,
  Package,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";

interface BehaviorData {
  stats: {
    totalEvents: number;
    totalChats: number;
    conversionRate: string;
    topProduct: string;
  };
  eventTypeBreakdown: Record<string, number>;
  intentBreakdown: Record<string, number>;
  dailyChartData: Array<{
    date: string;
    total: number;
    SEARCH?: number;
    VIEW_PRODUCT?: number;
    ADD_CART?: number;
    CHECKOUT?: number;
    AI_CHAT?: number;
  }>;
  topSearches: Array<{ query: string; count: number }>;
  topViewedProducts: Array<{ product: string; views: number }>;
  topQuestions: Array<{
    question: string;
    intent: string;
    createdAt: string;
  }>;
  aiAnalysis: string;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  SEARCH: "Tìm kiếm",
  VIEW_PRODUCT: "Xem sản phẩm",
  ADD_CART: "Thêm giỏ hàng",
  CHECKOUT: "Đặt hàng",
  AI_CHAT: "Chat AI",
};

const INTENT_LABELS: Record<string, string> = {
  product_search: "Tìm sản phẩm",
  order_inquiry: "Hỏi đơn hàng",
  price_inquiry: "Hỏi giá",
  account_support: "Hỗ trợ tài khoản",
  payment_inquiry: "Hỏi thanh toán",
  return_refund: "Đổi/trả hàng",
  general: "Chung",
};

const PIE_COLORS = [
  "#f73a00",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

const AREA_COLORS: Record<string, string> = {
  SEARCH: "#0ea5e9",
  VIEW_PRODUCT: "#10b981",
  ADD_CART: "#f59e0b",
  CHECKOUT: "#f73a00",
  AI_CHAT: "#8b5cf6",
};

const ITEMS_PER_PAGE = 8;

export default function BehaviorAnalyticsDashboard() {
  const [data, setData] = useState<BehaviorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatPage, setChatPage] = useState(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/behavior-analysis");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Failed to fetch behavior data:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const parseMarkdown = (text: string) => {
    const html = text
      .replace(
        /### (.*)/g,
        '<h3 class="text-base font-bold text-gray-800 mt-4 mb-2 flex items-center gap-2"><span class="text-[#f73a00]">•</span> $1</h3>',
      )
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n\n/g, "<br/><br/>")
      .replace(/\n/g, "<br/>");
    return { __html: html };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#f73a00] mx-auto mb-4" />
          <p className="text-gray-500">Đang tải phân tích hành vi...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Không thể tải dữ liệu phân tích.</p>
        <Button onClick={fetchData} className="mt-4">
          Thử lại
        </Button>
      </div>
    );
  }

  const eventTypeChartData = Object.entries(data.eventTypeBreakdown).map(
    ([type, count]) => ({
      name: EVENT_TYPE_LABELS[type] || type,
      value: count,
    }),
  );

  const intentChartData = Object.entries(data.intentBreakdown).map(
    ([intent, count]) => ({
      name: INTENT_LABELS[intent] || intent,
      value: count,
    }),
  );

  const paginatedQuestions = data.topQuestions.slice(
    chatPage * ITEMS_PER_PAGE,
    (chatPage + 1) * ITEMS_PER_PAGE,
  );
  const totalChatPages = Math.ceil(data.topQuestions.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                  Tổng sự kiện
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {data.stats.totalEvents.toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="h-11 w-11 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
                  Câu hỏi AI
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {data.stats.totalChats.toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="h-11 w-11 bg-emerald-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#f73a00] uppercase tracking-wider">
                  Tỷ lệ chuyển đổi
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {data.stats.conversionRate}%
                </p>
              </div>
              <div className="h-11 w-11 bg-orange-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-[#f73a00]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">
                  SP được xem nhiều nhất
                </p>
                <p className="text-sm font-bold text-gray-900 mt-1 truncate max-w-[160px]">
                  {data.stats.topProduct}
                </p>
              </div>
              <div className="h-11 w-11 bg-amber-100 rounded-xl flex items-center justify-center">
                <Eye className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Events Area Chart */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#f73a00]" />
              Sự kiện theo ngày (7 ngày gần nhất)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.dailyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(d) => {
                      const date = new Date(d);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    labelFormatter={(d) => {
                      const date = new Date(d);
                      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                    }}
                    formatter={(value: unknown, name: unknown) => [
                      String(value),
                      EVENT_TYPE_LABELS[String(name)] || String(name),
                    ]}
                  />
                  <Legend
                    formatter={(value) => EVENT_TYPE_LABELS[value] || value}
                  />
                  {Object.keys(AREA_COLORS).map((key) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stackId="1"
                      stroke={AREA_COLORS[key]}
                      fill={AREA_COLORS[key]}
                      fillOpacity={0.3}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                Chưa có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Type Pie Chart */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Package className="h-4 w-4 text-[#f73a00]" />
              Phân loại sự kiện
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventTypeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={eventTypeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {eventTypeChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                Chưa có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis + Intent Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Analysis */}
        <Card className="lg:col-span-2 border-0 shadow-md bg-gradient-to-br from-orange-50/50 to-amber-50/30 border-orange-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-orange-100/50">
            <div className="flex items-center gap-2">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Brain className="w-5 h-5 text-[#f73a00]" />
              </div>
              <CardTitle className="text-base font-bold text-gray-800">
                AI Phân Tích Hành Vi Người Dùng
              </CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isLoading}
              className="text-[#f73a00] border-orange-200 hover:bg-orange-100"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Tải lại
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div
              className="text-gray-700 leading-relaxed text-sm space-y-1"
              dangerouslySetInnerHTML={parseMarkdown(data.aiAnalysis)}
            />
          </CardContent>
        </Card>

        {/* Intent Bar Chart */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              Phân loại câu hỏi AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            {intentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={intentChartData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    horizontal={false}
                  />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    fill="#10b981"
                    radius={[0, 6, 6, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                Chưa có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Searches + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Searches */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Search className="h-4 w-4 text-blue-600" />
              Top từ khóa tìm kiếm
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topSearches.length > 0 ? (
              <div className="space-y-2">
                {data.topSearches.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-5">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-gray-800 font-medium">
                        {item.query}
                      </span>
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                      {item.count} lần
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">
                Chưa có dữ liệu tìm kiếm
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Viewed Products */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Eye className="h-4 w-4 text-amber-600" />
              Top sản phẩm được xem
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topViewedProducts.length > 0 ? (
              <div className="space-y-2">
                {data.topViewedProducts.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-5">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-gray-800 font-medium truncate max-w-[200px]">
                        {item.product}
                      </span>
                    </div>
                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-medium">
                      {item.views} lượt
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">
                Chưa có dữ liệu xem sản phẩm
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent AI Chat Questions Table */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[#f73a00]" />
            Câu hỏi AI gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedQuestions.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Câu hỏi
                      </th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Phân loại
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedQuestions.map((q, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3 px-3 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(q.createdAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-3 text-gray-800 max-w-[400px] truncate">
                          {q.question}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            <ArrowUpRight className="h-3 w-3" />
                            {INTENT_LABELS[q.intent] || q.intent}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalChatPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Trang {chatPage + 1} / {totalChatPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={chatPage === 0}
                      onClick={() => setChatPage((p) => p - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={chatPage >= totalChatPages - 1}
                      onClick={() => setChatPage((p) => p + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">
              Chưa có câu hỏi AI nào được ghi nhận
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
