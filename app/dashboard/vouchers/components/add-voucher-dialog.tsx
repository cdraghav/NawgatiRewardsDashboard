"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Step, VoucherFormData } from "../types/add-voucher-types";
import { StepIndicator } from "./add-voucher/step-indicator";
import { StepOneDetails } from "./add-voucher/step-one-details";
import { StepTwoBranding } from "./add-voucher/step-two-branding";
import { StepThreeCategorySelection } from "./add-voucher/step-three-category-selection";
import { StepFourPreview } from "./add-voucher/step-four-preview";

interface AddVoucherDialogProps {
  voucher: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS: Step[] = [
  { id: 1, name: "Details", description: "Review" },
  { id: 2, name: "Branding", description: "Images" },
  { id: 3, name: "Categories", description: "Select" },
  { id: 4, name: "Preview", description: "Final" },
];

export function AddVoucherDialog({ voucher, open, onOpenChange }: AddVoucherDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [useExistingLogo, setUseExistingLogo] = useState(true);
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<VoucherFormData>({
    defaultValues: {
      brandName: "",
      brandDesc: "",
      denominationType: "RANGE",
      minAmount: 0,
      maxAmount: 0,
      discountPercentage: 0,
      voucherExpiryMonths: 12,
      termsAndConditions: [],
      usageInstructions: { ONLINE: [], OFFLINE: [] },
      brandColor: "#000000",
      logoFile: null,
      coverFile: null,
      categoryIds: [],
    },
  });

  const formData = watch();

  useEffect(() => {
    if (open && voucher) {
      const usageInstructions = voucher.usageInstructions || { ONLINE: [], OFFLINE: [] };
      const denominations = voucher.amountRestrictions?.denominations || voucher.denominations || [];
      
      reset({
        brandName: voucher.title || "",
        brandDesc: voucher.brandDescription || "",
        denominationType: voucher.denominationType || "RANGE",
        minAmount: voucher.amountRestrictions?.minAmount || 0,
        maxAmount: voucher.amountRestrictions?.maxAmount || 0,
        discountPercentage: voucher.discountPercentage || 0,
        voucherExpiryMonths: voucher.voucherExpiryInMonths || 12,
        termsAndConditions: voucher.termsAndConditions || [],
        usageInstructions: {
          ONLINE: usageInstructions.ONLINE || [],
          OFFLINE: usageInstructions.OFFLINE || [],
        },
        brandColor: "#000000",
        logoFile: null,
        coverFile: null,
        categoryIds: [],
        denominations: denominations,
      });
      setLogoPreview(voucher.logoUrl || null);
      setCoverPreview(null);
      setUseExistingLogo(true);
      setCurrentStep(1);
    }
  }, [open, voucher, reset]);

  const createVoucherMutation = useMutation({
    mutationFn: async (data: VoucherFormData) => {
      const formDataToSend = new FormData();
      formDataToSend.append("vendorid", voucher.id);
      formDataToSend.append("status", voucher.status?.toLowerCase() || "active");
      formDataToSend.append("brandname", voucher.title || data.brandName);

      if (data.brandDesc) {
        formDataToSend.append("branddesc", data.brandDesc);
      } else if (voucher.brandDescription) {
        formDataToSend.append("branddesc", voucher.brandDescription);
      }

      if (voucher.denominationType) {
        formDataToSend.append("denominationtype", voucher.denominationType.toLowerCase());
      }

      if (voucher.amountRestrictions?.minAmount) {
        formDataToSend.append("minamountp", voucher.amountRestrictions.minAmount.toString());
      }

      if (voucher.amountRestrictions?.maxAmount) {
        formDataToSend.append("maxamountp", voucher.amountRestrictions.maxAmount.toString());
      }

      const denominations = voucher.amountRestrictions?.denominations || voucher.denominations || [];
      if (denominations && Array.isArray(denominations) && denominations.length > 0) {
        denominations.forEach((denom: number) => {
          formDataToSend.append("denominations[]", denom.toString());
        });
      }

      if (voucher.termsAndConditions && Array.isArray(voucher.termsAndConditions) && voucher.termsAndConditions.length > 0) {
        voucher.termsAndConditions.forEach((term: string) => {
          formDataToSend.append("tnc[]", term);
        });
      }

      if (voucher.termsAndConditionsUrl || voucher.tncUrl) {
        formDataToSend.append("tncurl", voucher.termsAndConditionsUrl || voucher.tncUrl);
      }

      const usageInst = voucher.usageInstructions || { ONLINE: [], OFFLINE: [] };
      if (usageInst.ONLINE?.length) {
        usageInst.ONLINE.forEach((inst: string) => {
          formDataToSend.append("usageinstructionsONLINE[]", inst);
        });
      }
      if (usageInst.OFFLINE?.length) {
        usageInst.OFFLINE.forEach((inst: string) => {
          formDataToSend.append("usageinstructionsOFFLINE[]", inst);
        });
      }

      if (voucher.voucherExpiryInMonths) {
        formDataToSend.append("voucherexpiryinmonths", voucher.voucherExpiryInMonths.toString());
      }

      if (data.discountPercentage) {
        formDataToSend.append("discountpercentage", data.discountPercentage.toString());
      }

      if (voucher.redemptionTypes && Array.isArray(voucher.redemptionTypes)) {
        voucher.redemptionTypes.forEach((type: string) => {
          formDataToSend.append("redemptiontypes[]", type.toLowerCase());
        });
      } else if (voucher.redemptionType) {
        formDataToSend.append("redemptiontypes[]", voucher.redemptionType.toLowerCase());
      }

      if (voucher.cardType) {
        formDataToSend.append("cardtype", voucher.cardType.toLowerCase());
      }

      if (voucher.category && Array.isArray(voucher.category) && voucher.category.length > 0) {
        voucher.category.forEach((cat: string) => {
          formDataToSend.append("hubblecategories[]", cat);
        });
      }

      if (voucher.tags && Array.isArray(voucher.tags) && voucher.tags.length > 0) {
        voucher.tags.forEach((tag: string) => {
          formDataToSend.append("tags[]", tag);
        });
      }

      if (voucher.amountRestrictions) {
        const restrictions = voucher.amountRestrictions;
        
        if (restrictions.minOrderAmount) {
          formDataToSend.append("minorderamount", restrictions.minOrderAmount.toString());
        }
        if (restrictions.maxOrderAmount) {
          formDataToSend.append("maxorderamount", restrictions.maxOrderAmount.toString());
        }
        if (restrictions.minVoucherAmount) {
          formDataToSend.append("minvoucheramount", restrictions.minVoucherAmount.toString());
        }
        if (restrictions.maxVoucherAmount) {
          formDataToSend.append("maxvoucheramount", restrictions.maxVoucherAmount.toString());
        }
        if (restrictions.maxVouchersPerOrder) {
          formDataToSend.append("maxvouchersperorder", restrictions.maxVouchersPerOrder.toString());
        }
        if (restrictions.maxVouchersPerDenomination) {
          formDataToSend.append("maxvouchersperdenomination", restrictions.maxVouchersPerDenomination.toString());
        }
        if (restrictions.maxDenominationsPerOrder) {
          formDataToSend.append("maxdenominationsperorder", restrictions.maxDenominationsPerOrder.toString());
        }
      }

      if (voucher.iconImageUrl) {
        formDataToSend.append("iconimageurlhubble", voucher.iconImageUrl);
      }
      if (voucher.thumbnailUrl) {
        formDataToSend.append("thumbnailurlhubble", voucher.thumbnailUrl);
      }

      formDataToSend.append("colorcode", data.brandColor);

      if (data.categoryIds && data.categoryIds.length > 0) {
        data.categoryIds.forEach((id) => {
          formDataToSend.append("categoryids[]", id.toString());
        });
      }

      if (data.logoFile) {
        formDataToSend.append("logo", data.logoFile);
      } else if (useExistingLogo && voucher.logoUrl) {
        formDataToSend.append("logourl", voucher.logoUrl);
      }

      if (data.coverFile) {
        formDataToSend.append("cover", data.coverFile);
      }

      const response = await api.post("/api/voucher", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploaded-vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["pending-vouchers"] });
      toast.success(`${voucher.title} has been added to your vouchers.`);
      onOpenChange(false);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to create voucher";
      toast.error(errorMessage);
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("logoFile", file);
      setUseExistingLogo(false);
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
    setUseExistingLogo(false);
    const input = document.getElementById("logo-upload") as HTMLInputElement;
    if (input) input.value = "";
  };

  const removeCover = () => {
    setValue("coverFile", null);
    setCoverPreview(null);
    const input = document.getElementById("cover-upload") as HTMLInputElement;
    if (input) input.value = "";
  };

  const handleCategoryChange = (categoryIds: number[]) => {
    setValue("categoryIds", categoryIds);
  };

  const onSubmit = (data: VoucherFormData) => {
    createVoucherMutation.mutate(data);
  };

  const canProceedFromStep1 = () => {
    return formData.discountPercentage > 0;
  };

  const canProceedFromStep2 = () => {
    return (logoPreview !== null) && (coverPreview !== null) && (formData.brandColor !== "");
  };

  const canProceedFromStep3 = formData.categoryIds && formData.categoryIds.length > 0;

  const nextStep = () => {
    if (currentStep === 1 && !canProceedFromStep1()) {
      toast.warning("Discount percentage required", {
        description: "Please enter a discount percentage greater than 0 to proceed.",
      });
      return;
    }
    if (currentStep === 2 && !canProceedFromStep2()) {
      toast.warning("Complete branding requirements", {
        description: "Please upload both logo and cover image, and select a brand color.",
      });
      return;
    }
    if (currentStep === 3 && !canProceedFromStep3) {
      toast.warning("Category selection required", {
        description: "Please select at least one category to proceed.",
      });
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden flex flex-col p-0 w-full h-full sm:max-h-[95vh] sm:max-w-[85vw]">
        <DialogHeader className="px-6 pt-4 pb-3 border-b shrink-0">
          <DialogTitle className="text-lg font-bold leading-tight">Import from Hubble</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1 leading-tight">
            Customize <span className="font-medium text-foreground">{voucher?.title}</span>
          </DialogDescription>
        </DialogHeader>

        <StepIndicator steps={STEPS} currentStep={currentStep} />

        <div className="flex-1 overflow-hidden min-h-0">
          <ScrollArea className="h-full w-full">
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4">
              {currentStep === 1 && (
                <StepOneDetails
                  register={register}
                  errors={errors}
                  formData={formData}
                  setValue={setValue}
                  voucher={voucher}
                />
              )}

              {currentStep === 2 && (
                <StepTwoBranding
                  logoPreview={logoPreview}
                  coverPreview={coverPreview}
                  brandColor={formData.brandColor}
                  register={register}
                  setValue={setValue}
                  handleLogoChange={handleLogoChange}
                  handleCoverChange={handleCoverChange}
                  removeLogo={removeLogo}
                  removeCover={removeCover}
                />
              )}

              {currentStep === 3 && (
                <StepThreeCategorySelection
                  selectedCategories={formData.categoryIds}
                  onCategoryChange={handleCategoryChange}
                />
              )}

              {currentStep === 4 && (
                <StepFourPreview
                  formData={formData}
                  logoPreview={logoPreview}
                  coverPreview={coverPreview}
                  voucher={voucher}
                />
              )}
            </form>
          </ScrollArea>
        </div>

        <div className="flex justify-between px-6 py-3 border-t bg-muted/30 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            size="sm"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={nextStep}
              size="sm"
              disabled={
                (currentStep === 1 && !canProceedFromStep1()) ||
                (currentStep === 2 && !canProceedFromStep2()) ||
                (currentStep === 3 && !canProceedFromStep3)
              }
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={createVoucherMutation.isPending}
              size="sm"
            >
              {createVoucherMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
