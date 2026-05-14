"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Check, ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateOrToast, type ValidateOptions } from "../../lib/validate-image";

export type ImageSlotKind = "logo" | "cover" | "banner";

interface ImageDropButtonProps {
  label: string;
  kind: ImageSlotKind;
  file: File | null;
  previewUrl: string | null;
  onChange: (file: File | null) => void;
  ariaLabel: string;
  requireTransparency?: boolean;
}

const VALIDATE_BY_KIND: Record<ImageSlotKind, ValidateOptions> = {
  logo: { requireTransparency: true },
  cover: {},
  banner: {},
};

export function ImageDropButton({
  label,
  kind,
  file,
  previewUrl,
  onChange,
  ariaLabel,
  requireTransparency,
}: ImageDropButtonProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);

  const opts = React.useMemo<ValidateOptions>(
    () => ({
      ...VALIDATE_BY_KIND[kind],
      ...(requireTransparency != null ? { requireTransparency } : {}),
    }),
    [kind, requireTransparency],
  );

  async function handleFile(f: File | undefined) {
    if (!f) return;
    setBusy(true);
    const ok = await validateOrToast(f, opts);
    setBusy(false);
    if (ok) onChange(f);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    void handleFile(e.target.files?.[0]);
    e.target.value = "";
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!dragging) setDragging(true);
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    void handleFile(e.dataTransfer.files?.[0]);
  }

  const hasFile = !!file;

  return (
    <div
      className={cn(
        "group/img relative flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-1.5 transition-all duration-100",
        dragging && "border-primary ring-2 ring-primary/30 bg-primary/5",
        hasFile && "border-foreground/15 bg-muted/40",
      )}
      onDragOver={onDragOver}
      onDragEnter={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={ariaLabel}
        className="flex items-center gap-1.5 outline-none"
        disabled={busy}
      >
        <span
          className={cn(
            "flex size-5 items-center justify-center overflow-hidden rounded-[3px]",
            hasFile ? "bg-background" : "bg-muted",
          )}
        >
          {busy ? (
            <Loader2 className="size-3 animate-spin text-muted-foreground" />
          ) : previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt=""
              className="size-full object-contain"
            />
          ) : (
            <ImagePlus className="size-3 text-muted-foreground/70" />
          )}
        </span>
        <span
          className={cn(
            "hidden text-[11.5px] font-medium tracking-tight sm:inline-flex",
            hasFile ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {label}
        </span>
        {hasFile && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="ml-0.5 flex size-3.5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600"
          >
            <Check className="size-2.5" />
          </motion.span>
        )}
      </button>
      {hasFile && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(null);
          }}
          className="ml-0.5 flex size-4 items-center justify-center rounded-sm text-muted-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Remove ${label}`}
        >
          <X className="size-3" />
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/svg+xml"
        className="hidden"
        onChange={onPick}
      />
    </div>
  );
}
