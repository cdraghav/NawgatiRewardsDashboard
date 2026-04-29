"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardHeader } from "../components/header";
import { LoadingSpinner } from "@/components/loading";
import { toast } from "sonner";

async function fetchCategories() {
  const response = await api.get("/api/voucher/categories");
  return response.data.data;
}

export default function CategoriesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", image_url: "" });
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/voucher/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsCreateOpen(false);
      setFormData({ name: "", image_url: "" });
      toast.success("Category created", {
        description: "New category has been added successfully.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to create category";
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      api.put(`/api/voucher/categories/${data.id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
      setFormData({ name: "", image_url: "" });
      toast.success("Category updated", {
        description: `"${variables.name}" has been updated successfully.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to update category";
          toast.error(errorMessage);

    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/voucher/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted", {
        description: "Category and all associated links have been deleted.",
      });
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      
      if (errorData?.affectedVouchers && errorData.affectedVouchers.length > 0) {
        toast.error(`${errorData.affectedVouchers.length} voucher(s) linked only to this category. Please delete or reassign them first.`);
      } else {
        const errorMessage = errorData?.message || "Failed to delete category";
        toast.error(errorMessage);

      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Category name required", {
        description: "Please enter a category name.",
      });
      return;
    }

    if (!formData.image_url.trim()) {
      toast.error("Image URL required", {
        description: "Please enter an image URL.",
      });
      return;
    }

    if (editingCategory) {
      updateMutation.mutate({ ...formData, id: editingCategory.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({ name: category.name, image_url: category.image_url });
  };

  const handleDelete = (category: any) => {
    toast.info("Deleting category", {
      description: `Removing "${category.name}"...`,
    });
    deleteMutation.mutate(category.id);
  };

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">
              Manage voucher categories for organizing brands
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        {isLoading ? (
          <LoadingSpinner text="Loading categories" />
        ) : !categories?.length ? (
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min flex items-center justify-center text-muted-foreground">
            No categories yet. Create one to get started.
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Categories</CardTitle>
              <CardDescription>
                {categories.length} categories in total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category: any) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium capitalize">
                        {category.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(category.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(category)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog
          open={isCreateOpen || !!editingCategory}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateOpen(false);
              setEditingCategory(null);
              setFormData({ name: "", image_url: "" });
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Create Category"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Update category information"
                  : "Add a new category for vouchers"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Food & Dining"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  placeholder="https://example.com/image.png"
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingCategory(null);
                    setFormData({ name: "", image_url: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Processing..."
                    : editingCategory
                    ? "Update"
                    : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
