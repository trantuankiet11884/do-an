"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Edit,
  Trash2,
  Folder,
  FolderOpen,
  Image as ImageIcon,
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
import { toast } from "sonner";

interface Category {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  parent_id: string | null;
  created_at: string;
}

interface CategoryNode extends Category {
  children: CategoryNode[];
}

interface CategoriesTableProps {
  categories: Category[];
}

export default function CategoriesTable({ categories }: CategoriesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryNode | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const categoryTree = useMemo(() => {
    const map = new Map<string, CategoryNode>();
    categories.forEach((cat) => map.set(cat.id, { ...cat, children: [] }));
    const roots: CategoryNode[] = [];
    categories.forEach((cat) => {
      const node = map.get(cat.id)!;
      if (cat.parent_id && map.has(cat.parent_id)) {
        map.get(cat.parent_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }, [categories]);

  const matchesSearch = (category: CategoryNode): boolean => {
    const query = searchQuery.toLowerCase();
    return (
      category.title.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query) ||
      category.children.some(matchesSearch)
    );
  };

  const handleDeleteClick = (category: CategoryNode) => {
    setCategoryToDelete(category);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Xóa danh mục thành công");
        window.location.reload();
      } else {
        const data = await res.json();
        toast.error(data.error || "Xóa danh mục thất bại");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Xóa danh mục thất bại");
    } finally {
      setIsDeleting(false);
      setCategoryToDelete(null);
    }
  };

  // Use React.ReactElement[] instead of JSX.Element[]
  const renderTree = (
    nodes: CategoryNode[],
    level = 0,
  ): React.ReactElement[] => {
    return nodes.flatMap((cat) => {
      if (searchQuery && !matchesSearch(cat)) return [];

      const isMainCategory = !cat.parent_id;

      return [
        <tr key={cat.id} className="hover:bg-gray-50">
          <td className="px-6 py-4">
            <div
              className="flex items-center gap-3"
              style={{ paddingLeft: `${level * 24}px` }}
            >
              {cat.children.length > 0 ? (
                <FolderOpen className="h-4 w-4 text-blue-500 shrink-0" />
              ) : (
                <Folder className="h-4 w-4 text-gray-400 shrink-0" />
              )}

              {isMainCategory && cat.image ? (
                <div className="h-10 w-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (
                        e.target as HTMLImageElement
                      ).nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                  <ImageIcon className="h-4 w-4 text-gray-400 hidden" />
                </div>
              ) : isMainCategory ? (
                <div className="h-10 w-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                  <ImageIcon className="h-4 w-4 text-gray-400" />
                </div>
              ) : (
                <div className="h-10 w-10 shrink-0"></div>
              )}

              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {cat.title}
                  {!isMainCategory && (
                    <span className="ml-2 text-xs text-gray-500">
                      (Danh mục con)
                    </span>
                  )}
                </div>
                {cat.description && (
                  <div className="text-xs text-gray-500 truncate mt-1">
                    {cat.description}
                  </div>
                )}
              </div>
            </div>
          </td>

          <td className="px-6 py-4 text-sm">
            {isMainCategory ? (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                Danh mục chính
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                Danh mục con
              </span>
            )}
          </td>

          <td className="px-6 py-4 text-sm text-gray-500">
            {new Date(cat.created_at).toLocaleDateString("vi-VN")}
          </td>

          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/categories/edit/${cat.id}`}
                className="text-blue-600 hover:text-blue-900 transition-colors"
                title="Sửa"
              >
                <Edit className="h-4 w-4" />
              </Link>
              <button
                onClick={() => handleDeleteClick(cat)}
                className="text-red-600 hover:text-red-900 transition-colors"
                title="Xóa"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>,

        ...renderTree(cat.children, level + 1),
      ];
    });
  };

  return (
    <>
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        {/* Search */}
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 max-w-lg">
              <input
                type="search"
                placeholder="Tìm kiếm danh mục theo tên hoặc mô tả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-500">
              {categoryTree.length} danh mục chính • {categories.length} tổng cộng
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {renderTree(categoryTree)}
            </tbody>
          </table>
        </div>

        {categories.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-2">Không tìm thấy danh mục</div>
            <p className="text-sm text-gray-500">
              Tạo danh mục đầu tiên của bạn để bắt đầu
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={() => setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục "{categoryToDelete?.title}"?
              {categoryToDelete?.children &&
                categoryToDelete.children.length > 0 && (
                  <span className="block mt-2 font-semibold text-amber-600">
                    Danh mục này có {categoryToDelete.children.length}{" "}
                    danh mục con cũng sẽ bị xóa.
                  </span>
                )}
              <span className="block mt-2">
                Sản phẩm trong danh mục này sẽ trở thành chưa phân loại.
              </span>
              <span className="block mt-2 text-red-600">
                Hành động này không thể hoàn tác.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
