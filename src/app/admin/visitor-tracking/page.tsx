import { Metadata } from "next";
import { VisitorTrackingTable } from "@/components/admin/visitors/visitor-tracking-table";
import { VisitorAnalyticsDashboard } from "@/components/admin/visitors/visitorAnalytics-dashboard";

export const metadata: Metadata = {
  title: "Theo dõi khách truy cập - KDS",
  description: "Theo dõi phiên truy cập và phân tích",
};

export default function VisitorsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Phân tích khách truy cập</h1>
        <p className="text-gray-600">Theo dõi tất cả các phiên và hoạt động của người dùng</p>
      </div>
      <VisitorAnalyticsDashboard />
      <VisitorTrackingTable />
    </div>
  );
}
