"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Info } from "lucide-react";
import { VoucherFormData, Category } from "../../types/add-voucher-types";
import { FlutterVoucherCardPreview } from "./flutter-voucher-card-preview";

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

  const allTerms = formData.termsAndConditions || [];
  const denominations: number[] =
    voucher?.amountRestrictions?.denominations ||
    voucher?.denominations ||
    formData.denominations ||
    [];

  const redemptionTypes: string[] = Array.isArray(formData.redemptionTypes)
    ? formData.redemptionTypes
    : [];

  const defaultAmount =
    denominations[0] ??
    formData.maxAmount ??
    formData.minAmount ??
    500;

  return (
    <ScrollArea className="h-full max-h-[600px] pr-4">
      <div className="space-y-6">
        <FlutterVoucherCardPreview
          brandName={formData.brandName}
          brandColor={formData.brandColor || "#ff5252"}
          logoUrl={logoPreview}
          thumbnailUrl={coverPreview}
          discountPercentage={Number(formData.discountPercentage) || 0}
          redemptionTypes={redemptionTypes}
          defaultAmount={defaultAmount}
        />

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
