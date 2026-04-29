"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
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
import Image from "next/image";
import { LoadingSpinner } from "@/components/loading";
import { toast } from "sonner";
import { EditVoucherDialog } from "./edit-voucher";
import { VoucherCard } from "./voucher-card";

const INITIAL_DISPLAY_COUNT = 8;

async function fetchUploadedVouchers() {
  const response = await api.get("/api/voucher");
  return response.data.data;
}

async function deleteVoucher(id: number) {
  const response = await api.delete(`/api/voucher/${id}`);
  return response.data;
}

export function UploadedVouchersGrid() {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [voucherToDelete, setVoucherToDelete] = useState<any>(null);
  const [voucherToEdit, setVoucherToEdit] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ["uploaded-vouchers"],
    queryFn: fetchUploadedVouchers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploaded-vouchers"] });
      toast.success("Voucher deleted successfully");
      setVoucherToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete voucher");
    },
  });

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const handleDelete = () => {
    if (voucherToDelete) {
      deleteMutation.mutate(voucherToDelete.id);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading Uploaded Vouchers" />;
  }

  if (!categoriesData || Object.keys(categoriesData).length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        No categories found. Please add categories first.
      </div>
    );
  }

  const totalVouchers = Object.values(categoriesData).reduce(
    (total: number, category: any) => total + category.vouchers.length,
    0
  );

  return (
    <>
      <div id="uploaded" className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold">Uploaded Vouchers</h2>
          <p className="text-sm text-muted-foreground">
            {totalVouchers} vouchers across {Object.keys(categoriesData).length} categories
          </p>
        </div>

        {Object.entries(categoriesData).map(([categoryName, categoryData]: [string, any]) => {
          const isExpanded = expandedCategories[categoryName];
          const displayedVouchers = isExpanded
            ? categoryData.vouchers
            : categoryData.vouchers.slice(0, INITIAL_DISPLAY_COUNT);
          const hasMore = categoryData.vouchers.length > INITIAL_DISPLAY_COUNT;

          return (
            <div key={categoryName} className="space-y-4">
              <div className="flex items-center gap-4">
                {categoryData.image_url && (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={categoryData.image_url}
                      alt={categoryName}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold capitalize">{categoryName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {categoryData.vouchers.length === 0
                      ? "No vouchers yet"
                      : `${categoryData.vouchers.length} ${
                          categoryData.vouchers.length === 1 ? "voucher" : "vouchers"
                        }`}
                  </p>
                </div>
              </div>

              {categoryData.vouchers.length === 0 ? (
                <div className="rounded-lg border bg-muted/30 p-8 text-center">
                  <p className="text-muted-foreground">No vouchers in this category yet</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {displayedVouchers.map((voucher: any) => (
                      <VoucherCard
                        key={voucher.id}
                        voucher={voucher}
                        onEdit={() => setVoucherToEdit(voucher)}
                        onDelete={() => setVoucherToDelete(voucher)}
                      />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        onClick={() => toggleCategory(categoryName)}
                        className="gap-2"
                      >
                        {isExpanded ? (
                          <>
                            Show Less <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Show All ({categoryData.vouchers.length - INITIAL_DISPLAY_COUNT} more){" "}
                            <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <AlertDialog open={!!voucherToDelete} onOpenChange={(open) => !open && setVoucherToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Voucher</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{voucherToDelete?.brand_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {voucherToEdit && (
        <EditVoucherDialog
          voucher={voucherToEdit}
          open={!!voucherToEdit}
          onOpenChange={(open) => !open && setVoucherToEdit(null)}
        />
      )}
    </>
  );
}
