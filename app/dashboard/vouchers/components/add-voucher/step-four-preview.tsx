"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  Tag,
  Coins,
  CheckCircle2,
  Info,
} from "lucide-react";
import { VoucherFormData, Category } from "../../types/add-voucher-types";

interface StepFourPreviewProps {
  formData: VoucherFormData;
  logoPreview: string | null;
  coverPreview: string | null;
  voucher?: any;
}

async function fetchCategories() {
  const response = await api.get("/api/voucher/categories");
  return response.data.data;
}

export function StepFourPreview({
  formData,
  logoPreview,
  coverPreview,
  voucher,
}: StepFourPreviewProps) {
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["voucher-categories"],
    queryFn: fetchCategories,
  });

  const selectedCategories = categories?.filter((cat) =>
    formData.categoryIds.includes(cat.id)
  );
  const allTerms = formData.termsAndConditions || [];
  const denominations =
    voucher?.amountRestrictions?.denominations ||
    voucher?.denominations ||
    [];

  let redemptionTypes: string[] = [];
  if (Array.isArray(formData.redemptionTypes)) {
    redemptionTypes = formData.redemptionTypes;
  }
  const hasOnline = redemptionTypes.includes("online");
  const hasOffline = redemptionTypes.includes("offline");

  return (
    <ScrollArea className="h-full max-h-[600px] pr-4">
      <div className="space-y-6">
        <div className="relative w-[280px] mx-auto mt-8">
          {formData.discountPercentage && (
            <div className="absolute -top-3 left-3 z-20">
              <div className="relative">
                <div className="p-[3px] bg-[#36A4FF] rounded-br-2xl shadow-lg">
                  <div className="relative w-16 h-[68px] p-2 rounded-br-2xl border-2 border-t-0 border-slate-500 border-dashed flex flex-col items-center justify-center bg-[#36A4FF]">
                    <div className="text-[20px] font-extrabold leading-none text-[#142E57]">
                      {formData.discountPercentage}%
                    </div>
                    <div className="w-6 h-[9px] flex items-center justify-center text-[#142E57] mt-0.5 text-xs font-extrabold leading-none tracking-normal">
                      OFF
                    </div>
                  </div>
                </div>

                <div
                  className="absolute top-0 right-0 w-0 h-0 translate-x-full"
                  style={{
                    borderBottom: "12px solid #36A4FF",
                    borderRight: "12px solid transparent",
                  }}
                />
              </div>
            </div>
          )}

          {(hasOnline || hasOffline) && (
            <div className="absolute top-2 right-2 z-20 flex gap-2.5">
              {hasOffline && (
                <div className="w-16 h-5 rounded-sm p-2 flex items-center justify-center bg-gray-700/20 border border-white/30 backdrop-blur-sm">
                  <span className="text-sm font-medium text-white leading-none">
                    Offline
                  </span>
                </div>
              )}
              {hasOnline && (
                <div className="w-16 h-5 rounded-sm p-2 flex items-center justify-center bg-gray-700/20 border border-white/30 backdrop-blur-sm">
                  <span className="text-sm font-medium text-white leading-none">
                    Online
                  </span>
                </div>
              )}
            </div>
          )}

          <div
            className="relative rounded-b-3xl overflow-visible shadow-xl"
            style={{ backgroundColor: formData.brandColor || "#ff5252" }}
          >
            <div className="relative h-[190px]">
              <div className="absolute inset-0 flex items-center justify-center top-[65%] -translate-y-1/2">
                {logoPreview ? (
                  <div className="relative w-[180px] h-16 flex items-center justify-center">
                    <Image
                      src={logoPreview}
                      alt={formData.brandName}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <h2 className="text-3xl font-black text-white">
                    {formData.brandName}
                  </h2>
                )}
              </div>
            </div>

            <div className="relative h-px mx-6">
              <div className="absolute inset-x-0 top-0 flex justify-between items-center">
                <svg width="100%" height="1" className="absolute inset-0">
                  <line
                    x1="20"
                    y1="0"
                    x2="calc(100% - 20px)"
                    y2="0"
                    stroke="white"
                    strokeWidth="1"
                    strokeDasharray="6 4"
                    opacity="0.4"
                  />
                </svg>
              </div>

              <div className="absolute -left-6 top-1/2 w-3 h-5 -translate-y-1/2 rounded-r-full bg-white" />

              <div className="absolute -right-6 top-1/2 w-3 h-5 -translate-y-1/2 rounded-l-full bg-white" />
            </div>

            <div className="relative px-6 p-0 pt-4 overflow-hidden h-[160px]">
              <div className="relative w-full h-full translate-y-4">
                {coverPreview ? (
                  <Image
                    src={coverPreview}
                    alt="Cover"
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-white/10 rounded-lg flex items-center justify-center">
                    <span className="text-white/50 text-xs">
                      No cover image
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute -bottom-px left-0 w-4 h-4 bg-white rounded-tr-full z-10" />
            <div className="absolute -bottom-px right-0 w-4 h-4 bg-white rounded-tl-full z-10" />
          </div>

          <div className="relative bg-white rounded-b-3xl pt-4 pb-3 px-4 shadow-lg space-y-3 z-20">
            <div>
              <h3 className="font-bold text-base mb-1.5 text-gray-900">
                {formData.brandName} Voucher
              </h3>

              {formData.minAmount && formData.maxAmount && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>₹{formData.minAmount}</span>
                  <span>-</span>
                  <span>₹{formData.maxAmount}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              {selectedCategories && selectedCategories.length > 0 && (
                <div className="flex items-start gap-2">
                  <Tag className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {selectedCategories.slice(0, 3).map((category: Category) => (
                      <Badge
                        key={category.id}
                        variant="secondary"
                        className="text-[10px] h-5 px-2"
                      >
                        {category.name}
                      </Badge>
                    ))}
                    {selectedCategories.length > 3 && (
                      <Badge variant="secondary" className="text-[10px] h-5 px-2">
                        +{selectedCategories.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {formData.denominationType && (
                <div className="flex items-center gap-2">
                  <Coins className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-gray-600 capitalize">
                      {formData.denominationType}:
                    </span>
                    {denominations && denominations.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {denominations.slice(0, 4).map((denom: number, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-[10px] h-5 px-2 font-semibold"
                          >
                            ₹{denom}
                          </Badge>
                        ))}
                        {denominations.length > 4 && (
                          <Badge variant="outline" className="text-[10px] h-5 px-2">
                            +{denominations.length - 4}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">
                        ₹{formData.minAmount} - ₹{formData.maxAmount}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {formData.voucherExpiryMonths && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-600">
                    Valid for{" "}
                    <span className="font-semibold">
                      {formData.voucherExpiryMonths} months
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {formData.brandDesc && (
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-gray-400" />
                <p className="text-sm font-semibold uppercase tracking-wide">
                  About
                </p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {formData.brandDesc}
              </p>
            </div>
          )}

          {formData.usageInstructions &&
            (formData.usageInstructions.ONLINE?.length > 0 ||
              formData.usageInstructions.OFFLINE?.length > 0) && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-semibold uppercase tracking-wide">
                    How to Use
                  </p>
                </div>
                <div className="space-y-4">
                  {formData.usageInstructions.ONLINE?.length > 0 && (
                    <div>
                      <p className="font-semibold text-sm flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        Online
                      </p>
                      <ol className="list-decimal list-inside text-sm space-y-1.5 ml-4 text-muted-foreground">
                        {formData.usageInstructions.ONLINE.map((inst, i) => (
                          <li key={i}>{inst}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {formData.usageInstructions.OFFLINE?.length > 0 && (
                    <div>
                      <p className="font-semibold text-sm flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Offline
                      </p>
                      <ol className="list-decimal list-inside text-sm space-y-1.5 ml-4 text-muted-foreground">
                        {formData.usageInstructions.OFFLINE.map((inst, i) => (
                          <li key={i}>{inst}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            )}

          {allTerms.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <p className="text-sm font-semibold uppercase tracking-wide mb-3">
                Terms & Conditions
              </p>
              <ul className="list-disc list-inside text-sm space-y-2 text-muted-foreground">
                {allTerms.map((term: string, idx: number) => (
                  <li key={idx}>{term}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-6 rounded-xl bg-primary/10 border-2 border-primary/30 max-w-2xl mx-auto">
          <p className="text-base text-center font-medium">
            Everything looks perfect! Click{" "}
            <span className="font-bold">Create Voucher</span> to add this
            voucher to Nawgati App.
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}
