"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Loader2, Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { buildVoucherFormData, type HubbleBrand } from "../../lib/build-voucher-formdata";
import { ImageDropButton } from "./image-drop-button";
import { CategoryMultiselect, type CategoryOption } from "./category-multiselect";
import { ExpandedPanel } from "./expanded-panel";

interface PendingImportRowProps {
  voucher: HubbleBrand;
  categories: CategoryOption[];
  focused?: boolean;
  onFocus?: () => void;
}

type Files = {
  logo: File | null;
  cover: File | null;
  banner: File | null;
};

function useObjectUrl(file: File | null) {
  const [url, setUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}

const stop = (e: React.SyntheticEvent) => e.stopPropagation();

export const PendingImportRow = React.memo(function PendingImportRow({
  voucher,
  categories,
  focused,
  onFocus,
}: PendingImportRowProps) {
  const queryClient = useQueryClient();
  const [files, setFiles] = React.useState<Files>({ logo: null, cover: null, banner: null });
  const [discount, setDiscount] = React.useState<string>(
    voucher.discountPercentage > 0 ? String(voucher.discountPercentage) : "",
  );
  const [brandColor, setBrandColor] = React.useState<string>("#0F0F0F");
  const [categoryIds, setCategoryIds] = React.useState<number[]>([]);
  const [expanded, setExpanded] = React.useState<string>("");

  const logoUrl = useObjectUrl(files.logo);
  const coverUrl = useObjectUrl(files.cover);
  const bannerUrl = useObjectUrl(files.banner);

  const discountNumber = Number(discount) || 0;
  const isValid =
    discountNumber > 0 &&
    categoryIds.length > 0 &&
    (files.logo !== null || !!voucher.logoUrl);

  const mutation = useMutation({
    mutationFn: async () => {
      const fd = buildVoucherFormData(
        voucher,
        {
          discountPercentage: discountNumber,
          brandColor,
          categoryIds,
        },
        {
          logo: files.logo,
          cover: files.cover,
          banner: files.banner,
          useExistingLogo: files.logo === null && !!voucher.logoUrl,
        },
      );
      const res = await api.post("/api/voucher", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success(`${voucher.title} imported.`);
      queryClient.invalidateQueries({ queryKey: ["pending-vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["uploaded-vouchers"] });
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Import failed";
      toast.error(msg);
    },
  });

  const justImported = mutation.isSuccess;
  const isOpen = expanded === "row";

  const toggleExpanded = React.useCallback(() => {
    setExpanded((v) => (v === "row" ? "" : "row"));
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && isValid && !mutation.isPending) {
      e.preventDefault();
      mutation.mutate();
    } else if (e.key === "e" && !mutation.isPending) {
      const target = e.target as HTMLElement;
      if (target.tagName !== "INPUT") {
        e.preventDefault();
        toggleExpanded();
      }
    }
  }

  const categoryNames = React.useMemo(
    () =>
      categories.filter((c) => categoryIds.includes(c.id)).map((c) => c.name),
    [categories, categoryIds],
  );

  return (
    <Accordion
      type="single"
      collapsible
      value={expanded}
      onValueChange={setExpanded}
      className="border-b border-border last:border-b-0"
    >
      <AccordionItem value="row" className="border-b-0">
        <div
          tabIndex={0}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          onClick={toggleExpanded}
          role="button"
          aria-expanded={isOpen}
          data-voucher-id={voucher.id}
          className={cn(
            "group/row linear-focus-ring relative cursor-pointer outline-none",
            focused && "bg-muted/40",
            justImported && "opacity-60",
          )}
        >
          <div
            className={cn(
              "grid items-center gap-2 px-3 py-2 transition-colors duration-100 ease-out",
              "grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(140px,1.4fr)_auto_auto_auto_auto_56px_minmax(120px,1fr)_auto_24px]",
              "hover:bg-muted/40",
            )}
          >
            {/* Brand */}
            <div className="flex min-w-0 items-center gap-2.5">
              {voucher.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={voucher.logoUrl}
                  alt=""
                  className="size-7 shrink-0 rounded-md border border-border bg-card object-contain p-0.5"
                />
              ) : (
                <div className="size-7 shrink-0 rounded-md border border-border bg-muted" />
              )}
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium tracking-tight text-foreground">
                  {voucher.title}
                </div>
                {voucher.brandDescription && (
                  <div className="hidden truncate text-[11.5px] text-muted-foreground lg:block">
                    {voucher.brandDescription}
                  </div>
                )}
              </div>
            </div>

            {/* Image slots */}
            <div
              className="col-span-2 flex flex-wrap items-center gap-1.5 sm:col-span-1 sm:contents"
              onClick={stop}
            >
              <ImageDropButton
                label="Logo"
                kind="logo"
                file={files.logo}
                previewUrl={logoUrl || voucher.logoUrl || null}
                onChange={(f) => setFiles((p) => ({ ...p, logo: f }))}
                ariaLabel={`Upload base logo for ${voucher.title}`}
              />
              <ImageDropButton
                label="Banner"
                kind="banner"
                file={files.banner}
                previewUrl={bannerUrl}
                onChange={(f) => setFiles((p) => ({ ...p, banner: f }))}
                ariaLabel={`Upload container logo for ${voucher.title}`}
              />
              <ImageDropButton
                label="Cover"
                kind="cover"
                file={files.cover}
                previewUrl={coverUrl}
                onChange={(f) => setFiles((p) => ({ ...p, cover: f }))}
                ariaLabel={`Upload cover image for ${voucher.title}`}
              />
            </div>

            {/* Brand color */}
            <div className="col-span-2 sm:col-span-1" onClick={stop}>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Brand color for ${voucher.title}`}
                    className="linear-focus-ring inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-card px-1.5 text-[11.5px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <span
                      aria-hidden
                      className="block size-3.5 rounded-sm border border-border"
                      style={{ background: brandColor }}
                    />
                    <span className="font-mono tabular-nums">
                      {brandColor.toUpperCase()}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-56 space-y-2 p-2"
                  onClick={stop}
                >
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Brand color
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="size-8 shrink-0 cursor-pointer rounded-md border border-border bg-transparent"
                    />
                    <Input
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="h-7 font-mono text-[12px]"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Discount */}
            <div
              className="relative col-span-2 sm:col-span-1 sm:w-14"
              onClick={stop}
            >
              <Input
                inputMode="numeric"
                pattern="[0-9]*"
                value={discount}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  setDiscount(v);
                }}
                placeholder="%"
                className="h-7 rounded-md border-input pr-5 text-right text-[12.5px] tabular-nums shadow-none"
                aria-label={`Discount percentage for ${voucher.title}`}
              />
              <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                %
              </span>
            </div>

            {/* Category */}
            <div
              className="col-span-2 min-w-0 sm:col-span-1"
              onClick={stop}
            >
              <CategoryMultiselect
                options={categories}
                selected={categoryIds}
                onChange={setCategoryIds}
              />
            </div>

            {/* Import button */}
            <div className="col-span-2 sm:col-span-1" onClick={stop}>
              <Button
                type="button"
                size="sm"
                disabled={!isValid || mutation.isPending || justImported}
                onClick={() => mutation.mutate()}
                aria-busy={mutation.isPending}
                className="h-7 min-w-[88px] gap-1.5 rounded-md px-2.5 text-[12.5px] font-medium"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    Importing
                  </>
                ) : justImported ? (
                  <>
                    <Check className="size-3" />
                    Imported
                  </>
                ) : (
                  "Import"
                )}
              </Button>
            </div>

            {/* Expand chevron (visual only — row click expands) */}
            <ChevronDown
              aria-hidden
              className={cn(
                "col-start-2 row-start-1 size-3.5 text-muted-foreground transition-transform sm:col-start-auto sm:row-start-auto",
                isOpen && "rotate-180 text-foreground",
              )}
            />
          </div>
        </div>

        <AccordionContent className="pb-0">
          <ExpandedPanel
            voucher={voucher}
            previews={{
              logo: logoUrl,
              cover: coverUrl,
              banner: bannerUrl,
            }}
            discountPercentage={discountNumber}
            brandColor={brandColor}
            categoryNames={categoryNames}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
});
