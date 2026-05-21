import BehaviorAnalyticsDashboard from "@/components/admin/behavior-analytics-dashboard";
import AiEvaluationCard from "@/components/admin/ai-evaluation-card";

export default function BehaviorAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Phân tích hành vi người dùng
        </h1>
        <p className="text-gray-600">
          Theo dõi hành vi tìm kiếm, mua sắm và câu hỏi AI chatbot của người
          dùng
        </p>
      </div>
      <AiEvaluationCard />
      <BehaviorAnalyticsDashboard />
    </div>
  );
}
