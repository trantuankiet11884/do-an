"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function PaymentTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTransactions = async (pageNum: number, currentStatus: string) => {
    try {
      setLoading(true);
      const url = new URL("/api/admin/payment-transactions", window.location.origin);
      url.searchParams.set("page", pageNum.toString());
      if (currentStatus !== "all") {
        url.searchParams.set("status", currentStatus);
      }

      const res = await fetch(url);
      const data = await res.json();
      setTransactions(data.transactions || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Lỗi khi tải giao dịch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(page, status);
  }, [page, status]);

  const getStatusBadge = (txStatus: string) => {
    switch (txStatus.toLowerCase()) {
      case "success":
      case "paid":
        return <Badge className="bg-green-500 hover:bg-green-600">Thành công</Badge>;
      case "failed":
        return <Badge variant="destructive">Thất bại</Badge>;
      case "refunded":
        return <Badge variant="outline" className="text-orange-500 border-orange-500">Hoàn tiền</Badge>;
      default:
        return <Badge variant="secondary">Đang chờ</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Giao dịch thanh toán</h1>
        <Select
          value={status}
          onValueChange={(val) => {
            setStatus(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lọc trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="success">Thành công</SelectItem>
            <SelectItem value="pending">Đang chờ</SelectItem>
            <SelectItem value="failed">Thất bại</SelectItem>
            <SelectItem value="refunded">Hoàn tiền</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn hàng</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Phương thức</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Mã giao dịch</TableHead>
              <TableHead>Thời gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                  Không tìm thấy giao dịch nào.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">
                    {tx.orders?.order_number || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{tx.users?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.users?.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {Number(tx.amount).toLocaleString("vi-VN")}₫
                  </TableCell>
                  <TableCell>
                    {tx.payment_method}
                  </TableCell>
                  <TableCell>{getStatusBadge(tx.payment_status)}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {tx.transaction_id || tx.stripe_session_id || "-"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(tx.created_at), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Trước
          </Button>
          <div className="text-sm font-medium">
            Trang {page} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Sau
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
