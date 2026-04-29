"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Category } from "../../types/add-voucher-types";

interface StepThreeCategorySelectionProps {
  selectedCategories: number[];
  onCategoryChange: (categoryIds: number[]) => void;
}

async function fetchCategories() {
  const response = await api.get("/api/voucher/categories");
  return response.data.data;
}

export function StepThreeCategorySelection({
  selectedCategories,
  onCategoryChange,
}: StepThreeCategorySelectionProps) {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["voucher-categories"],
    queryFn: fetchCategories,
  });

  const toggleCategory = (categoryId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          No categories available. Please create categories first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Select Categories</h3>
        <p className="text-muted-foreground">
          Choose one or more categories for this voucher brand. You can select multiple categories.
        </p>
        {selectedCategories.length > 0 && (
          <Badge variant="secondary" className="mt-2">
            {selectedCategories.length} {selectedCategories.length === 1 ? "category" : "categories"} selected
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.id);

          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? "ring-2 ring-primary shadow-lg" : ""
              }`}
              onClick={(e) => toggleCategory(category.id, e)}
            >
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    {category.image_url && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base truncate capitalize">{category.name}</h4>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleCategory(category.id)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedCategories.length === 0 && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-center">
          <p className="text-sm text-yellow-800">
            Please select at least one category to continue
          </p>
        </div>
      )}
    </div>
  );
}
