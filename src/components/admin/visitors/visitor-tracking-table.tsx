"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ExpandableVisitorRow } from "./expandable-visitor-row";

interface Visitor {
  id: string;
  session_id: string;
  user_id: string | null;
  users?: { email: string; name: string } | null;
  device_info: string | null;
  visited_at: string;
  updated_at: string;
  country: string | null;
  city: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  product_clicks: any | null;
  duration: number | null;
}

export function VisitorTrackingTable() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "registered" | "anonymous">(
    "all",
  );

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVisitors = useCallback(
    async (pageNum = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: "15",
        });

        if (searchTerm) {
          params.set("search", searchTerm);
        }

        if (filter !== "all") {
          params.set("filter", filter);
        }

        const response = await fetch(
          `/api/admin/visitors?${params.toString()}`,
        );
        const data = await response.json();

        setVisitors(data.visitors || []);
        setTotalPages(data.pages || 1);
      } catch (error) {
        console.error("Error fetching visitors:", error);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, filter],
  );

  useEffect(() => {
    fetchVisitors(page);
  }, [page, filter, searchTerm, fetchVisitors]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVisitors(1);
  };

  const handleRefresh = () => {
    fetchVisitors(page);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/visitors/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVisitors((prev) => prev.filter((v) => v.id !== deleteId));
        setDeleteId(null);
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = () => {
    const csvContent = visitors.map((v) => ({
      "Phiên ID": v.session_id,
      "Người dùng": v.users ? v.users.email : "Vô danh",
      "Tên": v.users ? v.users.name : "Khách",
      "Quốc gia": v.country || "Không xác định",
      "Thành phố": v.city || "Không xác định",
      "Thiết bị": v.device_info || "Không xác định",
      "Thời gian truy cập": new Date(v.visited_at).toLocaleString("vi-VN"),
      "Thời lượng": v.duration
        ? `${Math.floor(v.duration / 60)}p ${v.duration % 60}s`
        : "0s",
    }));

    const csv = [
      Object.keys(csvContent[0] || {}).join(","),
      ...csvContent.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitors-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Tìm kiếm theo email, phiên hoặc thiết bị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80"
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex gap-2 flex-wrap">
          {/* Filter Buttons */}
          <div className="flex border rounded-lg">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className="rounded-r-none"
            >
              Tất cả
            </Button>
            <Button
              variant={filter === "registered" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("registered")}
              className="rounded-none"
            >
              Đã đăng ký
            </Button>
            <Button
              variant={filter === "anonymous" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("anonymous")}
              className="rounded-l-none"
            >
              Vô danh
            </Button>
          </div>

          {/* Action Buttons */}
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Xuất file
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Phiên</TableHead>
              <TableHead className="w-[200px]">Người dùng</TableHead>
              <TableHead className="w-[150px]">Vị trí</TableHead>
              <TableHead className="w-[150px]">Thiết bị</TableHead>
              <TableHead className="w-[150px]">Thời gian truy cập</TableHead>
              <TableHead className="w-[80px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                </td>
              </TableRow>
            ) : visitors.length === 0 ? (
              <TableRow>
                <td colSpan={6} className="text-center py-8">
                  <div className="text-gray-500">Không tìm thấy dữ liệu khách truy cập</div>
                </td>
              </TableRow>
            ) : (
              visitors.map((visitor) => (
                <ExpandableVisitorRow
                  key={visitor.id}
                  visitor={visitor}
                  onDelete={() => setDeleteId(visitor.id)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && visitors.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Hiển thị {visitors.length} trên tổng số {totalPages * 15} lượt truy cập
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>
            <div className="flex items-center px-3">
              <span className="text-sm">
                Trang {page} trên {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Phiên truy cập này sẽ bị xóa
              vĩnh viễn khỏi cơ sở dữ liệu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
