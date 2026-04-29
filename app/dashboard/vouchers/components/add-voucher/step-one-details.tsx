import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Lock, AlertCircle } from "lucide-react";
import { VoucherFormData } from "../../types/add-voucher-types";

interface StepOneDetailsProps {
  register: any;
  errors: any;
  formData: VoucherFormData;
  setValue: any;
  voucher: any;
}

export function StepOneDetails({
  register,
  errors,
  formData,
  setValue,
  voucher,
}: StepOneDetailsProps) {
  return (
    <div className="space-y-8">
      <div className="relative rounded-lg p-6 space-y-6 border-2 bg-muted/30">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            Brand Information
          </h3>
          <Badge variant="secondary" className="text-xs">
            Read Only - From Hubble
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pointer-events-none select-none">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Brand Name</Label>
            <div className="p-3 bg-background rounded-md border border-muted">
              <p className="font-medium">{voucher?.title || "N/A"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Status</Label>
            <div className="p-3 bg-background rounded-md border border-muted">
              <Badge variant={voucher?.status === "ACTIVE" ? "default" : "secondary"}>
                {voucher?.status || "N/A"}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Denomination Type</Label>
            <div className="p-3 bg-background rounded-md border border-muted">
              <p className="font-medium">{voucher?.denominationType || "N/A"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Card Type</Label>
            <div className="p-3 bg-background rounded-md border border-muted">
              <p className="font-medium">{voucher?.cardType?.replace(/_/g, " ") || "N/A"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Min Amount</Label>
            <div className="p-3 bg-background rounded-md border border-muted">
              <p className="font-medium">₹{voucher?.amountRestrictions?.minAmount?.toLocaleString() || 0}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Max Amount</Label>
            <div className="p-3 bg-background rounded-md border border-muted">
              <p className="font-medium">₹{voucher?.amountRestrictions?.maxAmount?.toLocaleString() || 0}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Redemption Type</Label>
            <div className="p-3 bg-background rounded-md border border-muted">
              <p className="font-medium">{voucher?.redemptionType || "N/A"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Voucher Expiry</Label>
            <div className="p-3 bg-background rounded-md border border-muted">
              <p className="font-medium">{voucher?.voucherExpiryInMonths || 12} months</p>
            </div>
          </div>
        </div>

        {voucher?.category && voucher.category.length > 0 && (
          <div className="space-y-2 pointer-events-none select-none">
            <Label className="text-sm text-muted-foreground">Hubble Categories</Label>
            <div className="flex flex-wrap gap-2 p-3 bg-background rounded-md border border-muted">
              {voucher.category.map((cat: string, idx: number) => (
                <Badge key={idx} variant="secondary">
                  {cat.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {voucher?.tags && voucher.tags.length > 0 && (
          <div className="space-y-2 pointer-events-none select-none">
            <Label className="text-sm text-muted-foreground">Tags</Label>
            <div className="flex flex-wrap gap-1.5 p-3 bg-background rounded-md border border-muted max-h-32 overflow-y-auto">
              {voucher.tags.map((tag: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {voucher?.denominationType && (voucher.amountRestrictions?.denominations || voucher.denominations) && (
          <div className="space-y-2 pointer-events-none select-none">
            <Label className="text-sm text-muted-foreground">
              {voucher.denominationType === "FIXED" ? "Fixed Denominations" : "Available Denominations"}
            </Label>
            <div className="flex flex-wrap gap-2 p-3 bg-background rounded-md border border-muted">
              {(voucher.amountRestrictions?.denominations || voucher.denominations || []).map((denom: number, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-sm font-semibold">
                  ₹{denom.toLocaleString()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {voucher?.amountRestrictions && (
          <div className="space-y-2 pointer-events-none select-none">
            <Label className="text-sm text-muted-foreground">Amount Restrictions</Label>
            <div className="grid grid-cols-2 gap-3 p-3 bg-background rounded-md border border-muted text-sm">
              {voucher.amountRestrictions.minOrderAmount && (
                <div>
                  <span className="text-muted-foreground">Min Order:</span>
                  <span className="ml-2 font-medium">₹{voucher.amountRestrictions.minOrderAmount.toLocaleString()}</span>
                </div>
              )}
              {voucher.amountRestrictions.maxOrderAmount && (
                <div>
                  <span className="text-muted-foreground">Max Order:</span>
                  <span className="ml-2 font-medium">₹{voucher.amountRestrictions.maxOrderAmount.toLocaleString()}</span>
                </div>
              )}
              {voucher.amountRestrictions.minVoucherAmount && (
                <div>
                  <span className="text-muted-foreground">Min Voucher:</span>
                  <span className="ml-2 font-medium">₹{voucher.amountRestrictions.minVoucherAmount.toLocaleString()}</span>
                </div>
              )}
              {voucher.amountRestrictions.maxVoucherAmount && (
                <div>
                  <span className="text-muted-foreground">Max Voucher:</span>
                  <span className="ml-2 font-medium">₹{voucher.amountRestrictions.maxVoucherAmount.toLocaleString()}</span>
                </div>
              )}
              {voucher.amountRestrictions.maxVouchersPerOrder && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Max Vouchers/Order:</span>
                  <span className="ml-2 font-medium">{voucher.amountRestrictions.maxVouchersPerOrder}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {voucher?.usageInstructions && (
          <div className="space-y-3 pointer-events-none select-none">
            <Label className="text-sm text-muted-foreground">Usage Instructions</Label>
            {voucher.usageInstructions.ONLINE && voucher.usageInstructions.ONLINE.length > 0 && (
              <div className="p-3 bg-background rounded-md border border-muted">
                <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  Online
                </p>
                <ol className="list-decimal list-inside text-sm space-y-1.5 ml-4 text-muted-foreground">
                  {voucher.usageInstructions.ONLINE.map((inst: string, i: number) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ol>
              </div>
            )}
            {voucher.usageInstructions.OFFLINE && voucher.usageInstructions.OFFLINE.length > 0 && (
              <div className="p-3 bg-background rounded-md border border-muted">
                <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Offline
                </p>
                <ol className="list-decimal list-inside text-sm space-y-1.5 ml-4 text-muted-foreground">
                  {voucher.usageInstructions.OFFLINE.map((inst: string, i: number) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {voucher?.termsAndConditions && voucher.termsAndConditions.length > 0 && (
          <div className="space-y-2 pointer-events-none select-none">
            <Label className="text-sm text-muted-foreground">Terms & Conditions</Label>
            <div className="p-3 bg-background rounded-md border border-muted">
              <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
                {voucher.termsAndConditions.map((term: string, idx: number) => (
                  <li key={idx}>{term}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6 border-2 border-primary/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Customizable Information</h3>
          <Badge variant="default" className="text-xs">
            Edit These Fields
          </Badge>
        </div>

        <div className="space-y-3">
          <Label htmlFor="discountPercentage" className="text-base flex items-center gap-2">
            Discount Percentage <span className="text-red-500">*</span>
          </Label>
          <Input
            id="discountPercentage"
            type="number"
            min={0}
            max={100}
            step={0.01}
            placeholder="Enter discount percentage (e.g., 5.5)"
            className="h-12 text-base"
            {...register("discountPercentage", { valueAsNumber: true, required: true, min: 0.01 })}
          />
          {!formData.discountPercentage || formData.discountPercentage <= 0 ? (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <p>Discount percentage is required to proceed</p>
            </div>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Required: Add a discount percentage for this voucher
          </p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="brandDesc" className="text-base">
            Brand Description <span className="text-muted-foreground text-sm">(Optional)</span>
          </Label>
          <Textarea
            id="brandDesc"
            placeholder="Add or modify the brand description..."
            rows={4}
            className="text-base resize-none"
            {...register("brandDesc")}
          />
          <p className="text-xs text-muted-foreground">
            Customize the description for your users
          </p>
        </div>
      </div>
    </div>
  );
}
