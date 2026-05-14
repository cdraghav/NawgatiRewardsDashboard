// Hubble brand payload is dynamic and provided by an external API.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HubbleBrand = Record<string, any>;

type ImageInputs = {
  logo: File | null;
  cover: File | null;
  banner: File | null;
  useExistingLogo?: boolean;
};

type OverridableFields = {
  discountPercentage?: number;
  brandColor?: string;
  categoryIds?: number[];
  brandDesc?: string;
};

export function buildVoucherFormData(
  voucher: HubbleBrand,
  fields: OverridableFields,
  images: ImageInputs,
): FormData {
  const fd = new FormData();

  fd.append("vendorid", voucher.id);
  fd.append("status", voucher.status?.toLowerCase() || "active");
  fd.append("brandname", voucher.title || "");

  const brandDesc = fields.brandDesc ?? voucher.brandDescription;
  if (brandDesc) fd.append("branddesc", brandDesc);

  if (voucher.denominationType) {
    fd.append("denominationtype", String(voucher.denominationType).toLowerCase());
  }
  if (voucher.amountRestrictions?.minAmount) {
    fd.append("minamountp", voucher.amountRestrictions.minAmount.toString());
  }
  if (voucher.amountRestrictions?.maxAmount) {
    fd.append("maxamountp", voucher.amountRestrictions.maxAmount.toString());
  }

  const denominations =
    voucher.amountRestrictions?.denominations || voucher.denominations || [];
  if (Array.isArray(denominations) && denominations.length > 0) {
    denominations.forEach((d: number) => fd.append("denominations[]", d.toString()));
  }

  if (Array.isArray(voucher.termsAndConditions) && voucher.termsAndConditions.length > 0) {
    voucher.termsAndConditions.forEach((t: string) => fd.append("tnc[]", t));
  }
  if (voucher.termsAndConditionsUrl || voucher.tncUrl) {
    fd.append("tncurl", voucher.termsAndConditionsUrl || voucher.tncUrl);
  }

  // Read from Hubble's `howToUseInstructions` (array of {retailMode,
  // retailModeName, instructions}). Classify by `retailMode` — the only
  // field that reliably contains the ONLINE/OFFLINE channel — into the
  // ONLINE/OFFLINE buckets the backend sanitizer expects. Fall back to the
  // older flat `usageInstructions` shape when the newer field is absent.
  const onlineSteps: string[] = [];
  const offlineSteps: string[] = [];
  if (Array.isArray(voucher.howToUseInstructions)) {
    for (const item of voucher.howToUseInstructions) {
      if (!item || typeof item !== "object") continue;
      const mode = String(item.retailMode || item.mode || "")
        .trim()
        .toUpperCase();
      const steps: unknown = Array.isArray(item.instructions)
        ? item.instructions
        : Array.isArray(item.steps)
          ? item.steps
          : [];
      const list = (steps as unknown[]).map((s) => String(s));
      if (mode === "ONLINE") onlineSteps.push(...list);
      else if (mode === "OFFLINE") offlineSteps.push(...list);
    }
  } else if (voucher.usageInstructions && typeof voucher.usageInstructions === "object") {
    const u = voucher.usageInstructions as { ONLINE?: unknown; OFFLINE?: unknown };
    if (Array.isArray(u.ONLINE)) onlineSteps.push(...(u.ONLINE as unknown[]).map(String));
    if (Array.isArray(u.OFFLINE)) offlineSteps.push(...(u.OFFLINE as unknown[]).map(String));
  }
  onlineSteps.forEach((s) => fd.append("usageinstructionsONLINE[]", s));
  offlineSteps.forEach((s) => fd.append("usageinstructionsOFFLINE[]", s));

  if (voucher.voucherExpiryInMonths) {
    fd.append("voucherexpiryinmonths", voucher.voucherExpiryInMonths.toString());
  }

  if (typeof fields.discountPercentage === "number" && fields.discountPercentage > 0) {
    fd.append("discountpercentage", fields.discountPercentage.toString());
  }

  if (Array.isArray(voucher.redemptionTypes)) {
    voucher.redemptionTypes.forEach((t: string) => fd.append("redemptiontypes[]", t.toLowerCase()));
  } else if (voucher.redemptionType) {
    fd.append("redemptiontypes[]", String(voucher.redemptionType).toLowerCase());
  }

  if (voucher.cardType) fd.append("cardtype", String(voucher.cardType).toLowerCase());

  if (Array.isArray(voucher.category)) {
    voucher.category.forEach((c: string) => fd.append("hubblecategories[]", c));
  }
  if (Array.isArray(voucher.tags)) {
    voucher.tags.forEach((t: string) => fd.append("tags[]", t));
  }

  const r = voucher.amountRestrictions;
  if (r) {
    if (r.minOrderAmount) fd.append("minorderamount", r.minOrderAmount.toString());
    if (r.maxOrderAmount) fd.append("maxorderamount", r.maxOrderAmount.toString());
    if (r.minVoucherAmount) fd.append("minvoucheramount", r.minVoucherAmount.toString());
    if (r.maxVoucherAmount) fd.append("maxvoucheramount", r.maxVoucherAmount.toString());
    if (r.maxVouchersPerOrder)
      fd.append("maxvouchersperorder", r.maxVouchersPerOrder.toString());
    if (r.maxVouchersPerDenomination)
      fd.append("maxvouchersperdenomination", r.maxVouchersPerDenomination.toString());
    if (r.maxDenominationsPerOrder)
      fd.append("maxdenominationsperorder", r.maxDenominationsPerOrder.toString());
  }

  if (voucher.iconImageUrl) fd.append("iconimageurlhubble", voucher.iconImageUrl);
  if (voucher.thumbnailUrl) fd.append("thumbnailurlhubble", voucher.thumbnailUrl);

  fd.append("colorcode", fields.brandColor || "#000000");

  (fields.categoryIds || []).forEach((id) => fd.append("categoryids[]", id.toString()));

  if (images.logo) {
    fd.append("logo", images.logo);
  } else if (images.useExistingLogo && voucher.logoUrl) {
    fd.append("logourl", voucher.logoUrl);
  }
  if (images.cover) fd.append("cover", images.cover);
  if (images.banner) fd.append("banner", images.banner);

  return fd;
}
