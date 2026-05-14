"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Search, FolderTree } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { DashboardHeader } from "../components/header";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
  image_url: string;
  created_at: string;
}

async function fetchCategories(): Promise<Category[]> {
  const response = await api.get("/api/voucher/categories");
  return response.data.data;
}

export default function CategoriesPage() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = React.useState<Category | null>(null);
  const [formData, setFormData] = React.useState({ name: "", image_url: "" });
  const [search, setSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(search);
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const resetForm = () => setFormData({ name: "", image_url: "" });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; image_url: string }) =>
      api.post("/api/voucher/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsCreateOpen(false);
      resetForm();
      toast.success("Category created");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to create category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; name: string; image_url: string }) =>
      api.put(`/api/voucher/categories/${data.id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
      resetForm();
      toast.success(`"${variables.name}" updated`);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to update category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/voucher/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeletingCategory(null);
      toast.success("Category deleted");
    },
    onError: (error: {
      response?: { data?: { message?: string; affectedVouchers?: unknown[] } };
    }) => {
      const data = error.response?.data;
      if (data?.affectedVouchers && data.affectedVouchers.length > 0) {
        toast.error(
          `${data.affectedVouchers.length} voucher(s) linked only to this category. Delete or reassign them first.`,
        );
      } else {
        toast.error(data?.message || "Failed to delete category");
      }
    },
  });

  const handleEdit = React.useCallback((category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, image_url: category.image_url });
  }, []);

  const columns = React.useMemo<ColumnDef<Category>[]>(
    () => [
      {
        id: "image",
        header: "",
        size: 56,
        cell: ({ row }) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.original.image_url}
            alt={row.original.name}
            className="size-7 rounded-md border border-border bg-card object-cover"
          />
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created",
        size: 160,
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">
            {new Date(row.original.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        size: 88,
        meta: { align: "right" },
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row.original);
              }}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setDeletingCategory(row.original);
              }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [handleEdit],
  );

  const table = useReactTable({
    data: categories,
    columns,
    state: { globalFilter: deferredSearch },
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, _id, value: string) => {
      const q = value.trim().toLowerCase();
      if (!q) return true;
      return row.original.name.toLowerCase().includes(q);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Name required");
    if (!formData.image_url.trim()) return toast.error("Image URL required");
    if (editingCategory) {
      updateMutation.mutate({ ...formData, id: editingCategory.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const dialogOpen = isCreateOpen || !!editingCategory;
  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Categories" },
        ]}
      />

      <main className="mx-auto flex w-full max-w-[1440px] min-w-0 flex-1 flex-col gap-3 px-4 py-4 md:px-9 lg:px-16">
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-0.5">
            <h1 className="text-[20px] font-semibold tracking-tight text-foreground">
              Categories
            </h1>
            <p className="text-[12.5px] text-muted-foreground">
              Organize voucher brands by category.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-7 gap-1.5 px-2.5 text-[12.5px]"
          >
            <Plus className="size-3.5" />
            New category
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter categories…"
                className="h-7 rounded-md border-input pl-7 text-[12.5px] shadow-none"
              />
            </div>
            <span className="ml-auto text-[11.5px] text-muted-foreground">
              <span className="font-medium text-foreground tabular-nums">
                {table.getFilteredRowModel().rows.length}
              </span>
              {" of "}
              <span className="tabular-nums">{categories.length}</span>
            </span>
          </div>

          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <Skeleton className="size-7 rounded-md" />
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="ml-auto h-3.5 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <DataTable
              table={table}
              empty={
                <div className="flex flex-col items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <FolderTree className="size-4" />
                  </div>
                  <div className="text-[13px] font-medium text-foreground">
                    {search ? "No categories match" : "No categories yet"}
                  </div>
                  <div className="text-[12px] text-muted-foreground">
                    {search ? "Try a different keyword." : "Create one to get started."}
                  </div>
                </div>
              }
            />
          )}
        </div>
      </main>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingCategory(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">
              {editingCategory ? "Edit category" : "New category"}
            </DialogTitle>
            <DialogDescription className="text-[12.5px]">
              {editingCategory
                ? "Update category details."
                : "Create a category to group vouchers."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[12px]">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Food & Dining"
                className="h-8 text-[13px]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="image_url" className="text-[12px]">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.png"
                className="h-8 text-[13px]"
                required
              />
            </div>
            <DialogFooter className="gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-[12.5px]"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingCategory(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-7 text-[12.5px]"
                disabled={submitting}
              >
                {submitting ? "Saving…" : editingCategory ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[15px]">Delete category?</AlertDialogTitle>
            <AlertDialogDescription className="text-[12.5px]">
              Remove “{deletingCategory?.name}”. Vouchers linked only to this category will block deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-7 text-[12.5px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="h-7 bg-destructive text-[12.5px] text-white hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => deletingCategory && deleteMutation.mutate(deletingCategory.id)}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
