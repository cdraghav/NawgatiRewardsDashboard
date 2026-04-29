export interface UsageInstructions {
  ONLINE: string[];
  OFFLINE: string[];
}

export interface VoucherFormData {
    id: string;
  brandName: string;
  brandDesc: string;
  denominationType: string;
  minAmount: number;
  maxAmount: number;
  discountPercentage: number;
  voucherExpiryMonths: number;
  termsAndConditions: string[];
  usageInstructions: UsageInstructions;
  logoFile: File | null;
  coverFile: File | null;
  brandColor: string;
  categoryIds: number[];
  status: string ;
  denominations?: number[];
  redemptionTypes?: string[];
}

export interface Step {
  id: number;
  name: string;
  description: string;
}

export interface Category {
  id: number;
  name: string;
  image_url: string;
}
