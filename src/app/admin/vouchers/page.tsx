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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, RefreshCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENT",
    discountValue: "",
    minOrderValue: "",
    maxDiscount: "",
    usageLimit: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/vouchers");
      const data = await res.json();
      setVouchers(data.vouchers || []);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          discountValue: parseFloat(formData.discountValue),
          minOrderValue: formData.minOrderValue
            ? parseFloat(formData.minOrderValue)
            : null,
          maxDiscount: formData.maxDiscount
            ? parseFloat(formData.maxDiscount)
            : null,
          usageLimit: formData.usageLimit
            ? parseInt(formData.usageLimit)
            : null,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create voucher");
      }

      toast.success("Tạo mã giảm giá thành công");
      setIsOpen(false);
      fetchVouchers();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/vouchers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      if (res.ok) {
        setVouchers((prev) =>
          prev.map((v) =>
            v.id === id ? { ...v, is_active: !currentStatus } : v,
          ),
        );
        toast.success("Cập nhật trạng thái thành công");
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Mã giảm giá</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchVouchers} disabled={loading}>
            <RefreshCcw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tạo mã mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tạo mã giảm giá mới</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Mã giảm giá (Code)</Label>
                  <Input
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="VD: SUMMER2026"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Loại giảm giá</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(val) =>
                        setFormData({ ...formData, discountType: val })
                      }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENT">Phần trăm (%)</SelectItem>
                        <SelectItem value="FIXED">Số tiền cố định</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Mức giảm</Label>
                    <Input
                      required
                      type="number"
                      min="0"
                      step={formData.discountType === "PERCENT" ? "1" : "1000"}
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountValue: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Đơn tối thiểu</Label>
                    <Input
                      type="number"
                      placeholder="Không yêu cầu"
                      value={formData.minOrderValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minOrderValue: e.target.value,
                        })
                      }
                    />
                  </div>
                  {formData.discountType === "PERCENT" && (
                    <div className="space-y-2">
                      <Label>Giảm tối đa</Label>
                      <Input
                        type="number"
                        placeholder="Không giới hạn"
                        value={formData.maxDiscount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxDiscount: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    Giới hạn số lượt dùng (Để trống nếu không giới hạn)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ngày bắt đầu</Label>
                    <Input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày kết thúc</Label>
                    <Input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Tạo mã
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Mức giảm</TableHead>
              <TableHead>Điều kiện</TableHead>
              <TableHead>Đã dùng</TableHead>
              <TableHead>Hạn sử dụng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : vouchers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center h-32 text-muted-foreground">
                  Chưa có mã giảm giá nào.
                </TableCell>
              </TableRow>
            ) : (
              vouchers.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-bold text-primary">
                    {v.code}
                  </TableCell>
                  <TableCell>
                    {v.discount_type === "PERCENT"
                      ? `${v.discount_value}%`
                      : `${Number(v.discount_value).toLocaleString("vi-VN")}₫`}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {v.min_order_value && (
                      <p>
                        Đơn tối thiểu:{" "}
                        {Number(v.min_order_value).toLocaleString("vi-VN")}₫
                      </p>
                    )}
                    {v.max_discount && (
                      <p>
                        Giảm tối đa:{" "}
                        {Number(v.max_discount).toLocaleString("vi-VN")}₫
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {v.used_count} {v.usage_limit ? `/ ${v.usage_limit}` : ""}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(v.start_date), "dd/MM/yyyy")} -{" "}
                    {format(new Date(v.end_date), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    {v.is_active ? (
                      new Date(v.end_date) < new Date() ? (
                        <Badge variant="destructive">Đã hết hạn</Badge>
                      ) : (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          Đang hoạt động
                        </Badge>
                      )
                    ) : (
                      <Badge variant="secondary">Đã tắt</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={v.is_active ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleActive(v.id, v.is_active)}>
                      {v.is_active ? "Tắt" : "Bật"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
