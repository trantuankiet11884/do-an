"use client";

import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Mail,
  User,
  Shield,
  Ban,
  CheckCircle,
  Clock,
  Save,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/supabaseClient";
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

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  role: "SUPERADMIN" | "ADMIN" | "CUSTOMER";
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  created_at: string;
}

interface UsersTableProps {
  users: User[];
}

export default function UsersTable({ users: initialUsers }: UsersTableProps) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    role: "SUPERADMIN" | "ADMIN" | "CUSTOMER";
    status: "ACTIVE" | "INACTIVE" | "BANNED";
  } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const supabase = createClient();

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Lấy danh sách người dùng thất bại");
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("users-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        fetchUsers,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isSuperAdmin = currentUser?.role === "SUPERADMIN";
  const isAdmin = currentUser?.role === "ADMIN" || isSuperAdmin;

  // Filter users based on current user's role
  const visibleUsers = users.filter((user) => {
    if (isSuperAdmin) return true; // SUPERADMIN sees all
    // ADMIN sees only ADMIN and CUSTOMER
    return user.role !== "SUPERADMIN";
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return <Shield className="h-4 w-4 text-purple-600" />;
      case "ADMIN":
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-green-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return "bg-purple-100 text-purple-800";
      case "ADMIN":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "INACTIVE":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "BANNED":
        return <Ban className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-yellow-100 text-yellow-800";
      case "BANNED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredUsers = visibleUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.address?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditClick = (user: User) => {
    if (!isSuperAdmin) return;
    setEditingUser(user.id);
    setEditData({
      role: user.role,
      status: user.status,
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditData(null);
  };

  const handleSaveEdit = async (userId: string) => {
    if (!editData || !isSuperAdmin) return;

    setLoading(`save-${userId}`);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: editData.role,
          status: editData.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Cập nhật người dùng thất bại");
      }

      toast.success("Cập nhật người dùng thành công");
      setEditingUser(null);
      setEditData(null);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Cập nhật người dùng thất bại");
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    setDeleteDialog({ id: userId, name: userName });
  };

  const confirmDelete = async () => {
    if (!deleteDialog || !isSuperAdmin) return;

    setLoading(`delete-${deleteDialog.id}`);

    try {
      const res = await fetch(`/api/admin/users/${deleteDialog.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Xóa người dùng thất bại");
      }

      toast.success("Xóa người dùng thành công");
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Xóa người dùng thất bại");
    } finally {
      setLoading(null);
      setDeleteDialog(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 max-w-lg">
              <input
                type="search"
                placeholder="Tìm kiếm người dùng theo tên, email, số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm text-gray-900 ring-2 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm text-gray-900 ring ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="CUSTOMER">Khách hàng</option>
                {isAdmin && <option value="ADMIN">Quản trị viên</option>}
                {isSuperAdmin && (
                  <option value="SUPERADMIN">Quản trị viên cấp cao</option>
                )}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm text-gray-900 ring ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Không hoạt động</option>
                <option value="BANNED">Đã khóa</option>
              </select>
            </div>
          </div>
          {isSuperAdmin && (
            <div className="mt-2 flex items-center text-xs text-blue-600">
              <Shield className="h-3 w-3 mr-1" />
              <span>Đã bật quyền Quản trị viên cấp cao</span>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                {isSuperAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                          {currentUser?.id === user.id && (
                            <span className="ml-2 text-xs text-blue-600">
                              (Bạn)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-sm text-gray-500 mt-1">
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingUser === user.id && isSuperAdmin ? (
                      <select
                        value={editData?.role || user.role}
                        onChange={(e) =>
                          setEditData((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  role: e.target.value as
                                    | "SUPERADMIN"
                                    | "ADMIN"
                                    | "CUSTOMER",
                                }
                              : null,
                          )
                        }
                        className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={loading === `save-${user.id}`}
                      >
                        <option value="CUSTOMER">Khách hàng</option>
                        {isAdmin && <option value="ADMIN">Quản trị viên</option>}
                        {isSuperAdmin && (
                          <option value="SUPERADMIN">Quản trị viên cấp cao</option>
                        )}
                      </select>
                    ) : (
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span
                          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}
                        >
                          {user.role === "SUPERADMIN"
                            ? "Quản trị viên cấp cao"
                            : user.role === "ADMIN"
                              ? "Quản trị viên"
                              : "Khách hàng"}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingUser === user.id && isSuperAdmin ? (
                      <select
                        value={editData?.status || user.status}
                        onChange={(e) =>
                          setEditData((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  status: e.target.value as
                                    | "ACTIVE"
                                    | "INACTIVE"
                                    | "BANNED",
                                }
                              : null,
                          )
                        }
                        className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={loading === `save-${user.id}`}
                      >
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Không hoạt động</option>
                        <option value="BANNED">Đã khóa</option>
                      </select>
                    ) : (
                      <div className="flex items-center">
                        {getStatusIcon(user.status)}
                        <span
                          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}
                        >
                          {user.status === "ACTIVE"
                            ? "Hoạt động"
                            : user.status === "INACTIVE"
                              ? "Không hoạt động"
                              : "Đã khóa"}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  {isSuperAdmin && (
                    <td className="px-6 py-4 text-sm font-medium">
                      {editingUser === user.id ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleSaveEdit(user.id)}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            disabled={loading === `save-${user.id}`}
                          >
                            {loading === `save-${user.id}` ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></span>
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          {currentUser?.id !== user.id && (
                            <>
                              <button
                                onClick={() => handleEditClick(user)}
                                className="text-blue-600 hover:text-blue-900"
                                disabled={!!loading}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteClick(user.id, user.name)
                                }
                                className="text-red-600 hover:text-red-900"
                                disabled={loading === `delete-${user.id}`}
                              >
                                {loading === `delete-${user.id}` ? (
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></span>
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">Không tìm thấy người dùng</div>
              <p className="text-sm text-gray-500">
                {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                  ? "Thử thay đổi bộ lọc của bạn"
                  : "Chưa có người dùng nào trong hệ thống"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteDialog}
        onOpenChange={() => setDeleteDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa "{deleteDialog?.name}"? Hành động
              này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={loading === `delete-${deleteDialog?.id}`}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={loading === `delete-${deleteDialog?.id}`}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {loading === `delete-${deleteDialog?.id}`
                ? "Đang xóa..."
                : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
