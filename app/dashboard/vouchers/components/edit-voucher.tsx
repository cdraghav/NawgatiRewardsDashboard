"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { ImageUpload } from "./add-voucher/image-upload";
import { ColorPicker } from "./add-voucher/color-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EditVoucherDialogProps {
  voucher: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditFormData {
  discountpercentage: number;
  colorcode: string;
  logoFile: File | null;
  coverFile: File | null;
  categoryIds: number[];
}

async function fetchCategories() {
  const response = await api.get("/api/voucher/categories");
  return response.data.data;
}

export function EditVoucherDialog({ voucher, open, onOpenChange }: EditVoucherDialogProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [hasNewLogo, setHasNewLogo] = useState(false);
  const [hasNewCover, setHasNewCover] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [initialData, setInitialData] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["voucher-categories"],
    queryFn: fetchCategories,
  });

  const { register, handleSubmit, setValue, watch, reset } = useForm<EditFormData>({
    defaultValues: {
      discountpercentage: 0,
      colorcode: "#000000",
      logoFile: null,
      coverFile: null,
      categoryIds: [],
    },
  });

  const formData = watch();

  useEffect(() => {
    if (open && voucher) {
      const initialFormData = {
        discountpercentage: voucher.discount_percentage || 0,
        colorcode: voucher.color_code || "#000000",
        logoFile: null,
        coverFile: null,
        categoryIds: voucher.category_ids || [],
      };
      
      setInitialData(initialFormData);
      reset(initialFormData);
      setLogoPreview(voucher.logo_url || null);
      setCoverPreview(voucher.cover_image_url || null);
      setSelectedCategories(voucher.category_ids || []);
      setHasNewLogo(false);
      setHasNewCover(false);
    }
  }, [open, voucher, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: EditFormData) => {
      const formDataToSend = new FormData();

      if (data.discountpercentage !== initialData?.discountpercentage) {
        formDataToSend.append("discountpercentage", data.discountpercentage.toString());
      }

      if (data.colorcode !== initialData?.colorcode) {
        formDataToSend.append("colorcode", data.colorcode);
      }

      if (hasNewLogo && data.logoFile) {
        formDataToSend.append("logo", data.logoFile);
      } else if (!hasNewLogo && logoPreview === initialData?.logoPreview) {
      } else if (logoPreview && !hasNewLogo) {
        formDataToSend.append("logourl", logoPreview);
      }

      if (hasNewCover && data.coverFile) {
        formDataToSend.append("cover", data.coverFile);
      } else if (!hasNewCover && coverPreview === initialData?.coverPreview) {
      } else if (coverPreview && !hasNewCover) {
        formDataToSend.append("coverurl", coverPreview);
      }

      const categoriesChanged =
        selectedCategories.length !== (initialData?.categoryIds?.length || 0) ||
        !selectedCategories.every((id) => initialData?.categoryIds?.includes(id));

      if (categoriesChanged && selectedCategories.length > 0) {
        selectedCategories.forEach((id) => {
          formDataToSend.append("categoryids[]", id.toString());
        });
      }

      let hasChanges = false;
      for (const [key] of formDataToSend.entries()) {
        hasChanges = true;
        break;
      }

      if (!hasChanges) {
        throw new Error("No fields were changed");
      }

      const response = await api.put(`/api/voucher/${voucher.id}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploaded-vouchers"] });
      toast.success("Voucher updated successfully");
      onOpenChange(false);
    },
    onError: (error: any) => {
      if (error.message === "No fields were changed") {
        toast.info("No changes made", {
          description: "Please modify at least one field to update the voucher.",
        });
      } else {
        toast.error(error.response?.data?.message || "Failed to update voucher");
      }
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("logoFile", file);
      setHasNewLogo(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("coverFile", file);
      setHasNewCover(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setValue("logoFile", null);
    setLogoPreview(null);
    setHasNewLogo(false);
    const input = document.getElementById("edit-logo-upload") as HTMLInputElement;
    if (input) input.value = "";
  };

  const removeCover = () => {
    setValue("coverFile", null);
    setCoverPreview(null);
    setHasNewCover(false);
    const input = document.getElementById("edit-cover-upload") as HTMLInputElement;
    if (input) input.value = "";
  };

  const toggleCategory = (categoryId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const onSubmit = (data: EditFormData) => {
    if (!logoPreview) {
      toast.error("Logo is required");
      return;
    }
    if (!coverPreview) {
      toast.error("Cover image is required");
      return;
    }
    if (data.discountpercentage <= 0) {
      toast.error("Discount percentage must be greater than 0");
      return;
    }
    if (!data.colorcode || data.colorcode === "") {
      toast.error("Brand color is required");
      return;
    }
    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }
    updateMutation.mutate(data);
  };

  const allFieldsFilled =
    logoPreview !== null &&
    coverPreview !== null &&
    formData.colorcode !== "" &&
    formData.discountpercentage > 0 &&
    selectedCategories.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden flex flex-col md:p-4 w-[100%] h-[100%] sm:max-h-[95%] sm:max-w-[85%]">
        <DialogHeader className="px-8 pt-8 pb-6 border-b shrink-0">
          <DialogTitle className="text-2xl font-bold">Edit Voucher</DialogTitle>
          <DialogDescription className="text-base">
            Update discount, brand color, logo, cover image, and categories for{" "}
            <span className="font-medium">{voucher?.brand_name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-8">
              {!allFieldsFilled && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm">Required Fields</h4>
                    <p className="text-sm text-amber-800 mt-1">
                      All fields are required. Please ensure discount percentage is set, both logo and
                      cover image are uploaded, brand color is selected, and at least one category is
                      chosen.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3 p-6 border-2 border-primary/20 rounded-lg">
                <label htmlFor="discountpercentage" className="text-base font-semibold block">
                  Discount Percentage <span className="text-red-500">*</span>
                </label>
                <input
                  id="discountpercentage"
                  type="number"
                  min={0.01}
                  max={100}
                  step={0.01}
                  placeholder="Enter discount percentage (e.g., 5.5)"
                  className="h-12 text-base w-full px-3 border rounded-md"
                  {...register("discountpercentage", {
                    valueAsNumber: true,
                    required: true,
                    min: 0.01,
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Current discount: {voucher?.discount_percentage}%
                </p>
              </div>

              <ImageUpload
                id="edit-logo-upload"
                label="Brand Logo"
                preview={logoPreview}
                required
                requireTransparency={true}
                aspectRatio="square"
                guidelines={[
                  "Square image recommended (1:1 aspect ratio)",
                  "Maximum file size: 5MB",
                  "Supported formats: PNG, SVG, WebP",
                  "Transparent background required",
                  "Minimum resolution: 512×512 pixels",
                ]}
                onChange={handleLogoChange}
                onRemove={removeLogo}
              />

              <ImageUpload
                id="edit-cover-upload"
                label="Cover Image"
                preview={coverPreview}
                required
                aspectRatio="wide"
                guidelines={[
                  "Wide image recommended (16:9 or 2:1 aspect ratio)",
                  "Maximum file size: 5MB",
                  "Supported formats: SVG, PNG, WebP",
                  "Minimum resolution: 1920×1080 pixels",
                ]}
                onChange={handleCoverChange}
                onRemove={removeCover}
              />

              <ColorPicker
                value={formData.colorcode}
                onChange={(value) => setValue("colorcode", value)}
                register={register}
                required
                fieldName="colorcode"
                coverImagePreview={coverPreview}
              />

              <div className="space-y-4 mt-16 p-6 border-2 border-primary/20 rounded-lg">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Categories <span className="text-red-500">*</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select one or more categories for this voucher
                  </p>
                  {selectedCategories.length > 0 && (
                    <Badge variant="secondary">
                      {selectedCategories.length}{" "}
                      {selectedCategories.length === 1 ? "category" : "categories"} selected
                    </Badge>
                  )}
                </div>

                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">Loading categories...</p>
                  </div>
                ) : !categories || categories.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed p-8 text-center">
                    <p className="text-muted-foreground">No categories available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categories.map((category: any) => {
                      const isSelected = selectedCategories.includes(category.id);

                      return (
                        <Card
                          key={category.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            isSelected ? "ring-2 ring-primary shadow-lg" : ""
                          }`}
                          onClick={(e) => toggleCategory(category.id, e)}
                        >
                          <div className="p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                {category.image_url && (
                                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-muted">
                                    <img
                                      src={category.image_url}
                                      alt={category.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm truncate capitalize">
                                    {category.name}
                                  </h4>
                                </div>
                              </div>
                              <div onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleCategory(category.id)}
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {selectedCategories.length === 0 && (
                  <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-center">
                    <p className="text-sm text-yellow-800">
                      Please select at least one category
                    </p>
                  </div>
                )}
              </div>
            </form>
          </ScrollArea>
        </div>

        <div className="flex justify-end gap-3 px-8 py-6 border-t bg-muted/30 shrink-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} size="lg">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={updateMutation.isPending || !allFieldsFilled}
            size="lg"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Voucher"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
