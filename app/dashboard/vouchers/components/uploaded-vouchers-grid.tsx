"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pencil,
  Trash2,
  Search,
  Inbox,
  LayoutGrid,
  Rows3,
  RefreshCw,
  Wrench,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { FlutterVoucherCardPreview } from "./add-voucher/flutter-voucher-card-preview";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EditVoucherDialog } from "./edit-voucher";

type UploadedVoucher = {
  id: number;
  brand_name: string;
  logo_url?: string;
  banner_image_url?: string;
  cover_image_url?: string;
  discount_percentage?: number;
  category_names?: string[] | string;
  redemption_types?: string[] | string;
  color_code?: string;
  denominations?: number[];
  min_amount_p?: number;
};

type CategoryGroup = {
  image_url?: string;
  vouchers: UploadedVoucher[];
};

type CategoriesResponse = Record<string, CategoryGroup>;

type FlatRow = UploadedVoucher & {
  categoryName: string;
  categoryImage?: string;
};

async function fetchUploadedVouchers(): Promise<CategoriesResponse> {
  const response = await api.get("/api/voucher");
  return response.data.data;
}

async function deleteVoucher(id: number) {
  const response = await api.delete(`/api/voucher/${id}`);
  return response.data;
}

export type FieldDiff = {
  key: string;
  label: string;
  ours: unknown;
  hubble: unknown;
};

export type VoucherChange = {
  id: number;
  vendorId: string;
  brandName: string;
  diffs: FieldDiff[];
};

type SyncResponse = {
  summary: {
    checked: number;
    hubbleBrandsFetched: number;
    changedCount: number;
    missingFromHubbleCount: number;
  };
  changed: VoucherChange[];
  missingFromHubble: { id: number; vendorId: string; brandName: string }[];
  applied: {
    updated: number;
    updatedIds: number[];
    failed: { id: number; reason: string }[];
  } | null;
};

async function syncHubbleData(payload?: {
  apply?: boolean;
  ids?: number[];
  fields?: string[];
  overrides?: Record<string, unknown>;
}) {
  const res = await api.post<{ success: boolean; data: SyncResponse }>(
    "/api/voucher/hubble/sync-discounts",
    payload || {},
  );
  return res.data.data;
}

function parseRedemption(value: UploadedVoucher["redemption_types"]): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const match = value.match(/\{([^}]*)\}/);
    return match?.[1]?.split(",").filter(Boolean) ?? [];
  }
  return [];
}

export function UploadedVouchersGrid() {
  const queryClient = useQueryClient();
  const [voucherToDelete, setVoucherToDelete] = React.useState<FlatRow | null>(null);
  const [voucherToEdit, setVoucherToEdit] = React.useState<FlatRow | null>(null);
  const [search, setSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(search);
  const [view, setView] = React.useState<"table" | "preview">("table");
  const [changes, setChanges] = React.useState<VoucherChange[]>([]);
  const [lastSyncAt, setLastSyncAt] = React.useState<Date | null>(null);
  const [expandedId, setExpandedId] = React.useState<number | null>(null);

  const changeById = React.useMemo(() => {
    const m = new Map<number, VoucherChange>();
    for (const c of changes) m.set(c.id, c);
    return m;
  }, [changes]);

  const syncMutation = useMutation({
    mutationFn: () => syncHubbleData(),
    onSuccess: (data) => {
      setChanges(data.changed);
      setLastSyncAt(new Date());
      if (data.changed.length === 0) {
        toast.success("Everything is up to date");
      } else {
        toast.info(
          `${data.changed.length} voucher(s) have changes on Hubble`,
        );
      }
    },
    onError: () => toast.error("Sync failed"),
  });

  type ApplyArgs = {
    ids?: number[];
    fields?: string[];
    overrides?: Record<string, unknown>;
  };
  const applyMutation = useMutation({
    mutationFn: (args: ApplyArgs) =>
      syncHubbleData({
        apply: true,
        ids: args.ids,
        fields: args.fields,
        overrides: args.overrides,
      }),
    // Optimistically clear the targeted field/row from the diff state so the
    // UI updates instantly. We don't refresh from `data.changed` afterward
    // because some shapes (e.g. usage_instructions where Hubble uses
    // retailModeName keys) would otherwise re-flag right after Fix.
    onMutate: (args) => {
      const prev = changes;
      const idSet = args.ids ? new Set(args.ids) : null;
      const fieldSet = args.fields ? new Set(args.fields) : null;
      const next = changes
        .map((c) => {
          if (idSet && !idSet.has(c.id)) return c;
          if (!fieldSet) return null; // Fix-all-fields for this row
          const remaining = c.diffs.filter((d) => !fieldSet.has(d.key));
          if (remaining.length === 0) return null;
          return { ...c, diffs: remaining };
        })
        .filter((c): c is VoucherChange => c !== null);
      setChanges(next);
      return { prev };
    },
    onSuccess: (_data, args) => {
      queryClient.invalidateQueries({ queryKey: ["uploaded-vouchers"] });
      const single = args.ids?.length === 1 && args.fields?.length === 1;
      const updated = _data.applied?.updated ?? 0;
      toast.success(
        single ? "Field updated" : `Updated ${updated} voucher(s)`,
      );
    },
    onError: (_err, _args, ctx) => {
      if (ctx?.prev) setChanges(ctx.prev);
      toast.error("Update failed");
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["uploaded-vouchers"],
    queryFn: fetchUploadedVouchers,
  });

  const rows = React.useMemo<FlatRow[]>(() => {
    if (!data) return [];
    return Object.entries(data).flatMap(([categoryName, group]) =>
      group.vouchers.map((v) => ({
        ...v,
        categoryName,
        categoryImage: group.image_url,
      })),
    );
  }, [data]);

  const deleteMutation = useMutation({
    mutationFn: deleteVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploaded-vouchers"] });
      toast.success("Voucher deleted");
      setVoucherToDelete(null);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to delete voucher");
    },
  });

  const columns = React.useMemo<ColumnDef<FlatRow>[]>(
    () => [
      {
        accessorKey: "brand_name",
        header: "Brand",
        cell: ({ row }) => {
          const bg = row.original.color_code || "#0F0F0F";
          return (
            <div className="flex min-w-0 items-center gap-2.5">
              <div
                className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border p-0.5"
                style={{ background: bg }}
              >
                {row.original.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.original.logo_url}
                    alt=""
                    className="size-full object-contain"
                  />
                ) : null}
              </div>
              <span className="truncate font-medium tracking-tight text-foreground">
                {row.original.brand_name}
              </span>
            </div>
          );
        },
      },
      {
        id: "category",
        header: "Category",
        size: 200,
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[11.5px] text-muted-foreground">
            {row.original.categoryName}
          </span>
        ),
      },
      {
        accessorKey: "discount_percentage",
        header: "Discount",
        size: 180,
        meta: { align: "right" },
        cell: ({ row }) => {
          const current = row.original.discount_percentage;
          const change = changeById.get(row.original.id);
          const discountDiff = change?.diffs.find(
            (d) => d.key === "discount_percentage",
          );
          if (!discountDiff) {
            return current ? (
              <span className="tabular-nums font-medium text-foreground">
                {current}%
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            );
          }
          const pendingArgs = applyMutation.isPending
            ? applyMutation.variables
            : undefined;
          const isFixing =
            pendingArgs?.ids?.length === 1 &&
            pendingArgs.ids[0] === row.original.id &&
            pendingArgs.fields?.length === 1 &&
            pendingArgs.fields[0] === "discount_percentage";
          return (
            <span
              className="inline-flex items-center justify-end gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="tabular-nums text-muted-foreground line-through decoration-muted-foreground/50">
                {String(discountDiff.ours)}%
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="tabular-nums font-medium text-amber-700 dark:text-amber-400">
                {String(discountDiff.hubble)}%
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-6 cursor-pointer gap-1 border-amber-500/40 px-1.5 text-[11px] font-medium text-amber-700 hover:bg-amber-50 hover:text-amber-900 dark:text-amber-300 dark:hover:bg-amber-950/40"
                disabled={applyMutation.isPending}
                onClick={() =>
                  applyMutation.mutate({
                    ids: [row.original.id],
                    fields: ["discount_percentage"],
                  })
                }
              >
                {isFixing ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Wrench className="size-3" />
                )}
                Fix
              </Button>
            </span>
          );
        },
      },
      {
        id: "sync",
        header: "Sync",
        size: 120,
        cell: ({ row }) => {
          const change = changeById.get(row.original.id);
          if (!change) {
            return (
              <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500/70" />
                Up to date
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-50/60 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              <span className="size-1.5 rounded-full bg-amber-500" />
              {change.diffs.length} change{change.diffs.length === 1 ? "" : "s"}
            </span>
          );
        },
      },
      {
        id: "channels",
        header: "Channels",
        size: 240,
        cell: ({ row }) => {
          const types = parseRedemption(row.original.redemption_types);
          const change = changeById.get(row.original.id);
          const channelsDiff = change?.diffs.find(
            (d) => d.key === "redemption_types",
          );
          const renderChips = (list: string[], variant: "ours" | "hubble" | "current") => {
            if (list.length === 0) {
              return <span className="text-muted-foreground">—</span>;
            }
            return (
              <span className="inline-flex flex-wrap gap-1">
                {list.map((t) => (
                  <span
                    key={t}
                    className={cn(
                      "rounded border px-1.5 py-0.5 text-[10.5px]",
                      variant === "ours" &&
                        "border-border bg-muted/40 text-muted-foreground line-through decoration-muted-foreground/50",
                      variant === "hubble" &&
                        "border-amber-500/40 bg-amber-50/60 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
                      variant === "current" && "border-border bg-muted/40 text-muted-foreground",
                    )}
                  >
                    {t}
                  </span>
                ))}
              </span>
            );
          };
          if (!channelsDiff) return renderChips(types, "current");
          const ours = Array.isArray(channelsDiff.ours)
            ? (channelsDiff.ours as string[])
            : [];
          const theirs = Array.isArray(channelsDiff.hubble)
            ? (channelsDiff.hubble as string[])
            : [];
          const pendingArgs = applyMutation.isPending
            ? applyMutation.variables
            : undefined;
          const isFixing =
            pendingArgs?.ids?.length === 1 &&
            pendingArgs.ids[0] === row.original.id &&
            pendingArgs.fields?.length === 1 &&
            pendingArgs.fields[0] === "redemption_types";
          return (
            <span
              className="inline-flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              {renderChips(ours, "ours")}
              <span className="text-muted-foreground">→</span>
              {renderChips(theirs, "hubble")}
              <Button
                size="sm"
                variant="outline"
                className="h-6 cursor-pointer gap-1 border-amber-500/40 px-1.5 text-[11px] font-medium text-amber-700 hover:bg-amber-50 hover:text-amber-900 dark:text-amber-300 dark:hover:bg-amber-950/40"
                disabled={applyMutation.isPending}
                onClick={() =>
                  applyMutation.mutate({
                    ids: [row.original.id],
                    fields: ["redemption_types"],
                  })
                }
              >
                {isFixing ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Wrench className="size-3" />
                )}
                Fix
              </Button>
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        size: 88,
        meta: { align: "right" },
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                setVoucherToEdit(row.original);
              }}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setVoucherToDelete(row.original);
              }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [changeById, applyMutation],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { globalFilter: deferredSearch },
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, _id, value: string) => {
      const q = value.trim().toLowerCase();
      if (!q) return true;
      return (
        row.original.brand_name.toLowerCase().includes(q) ||
        row.original.categoryName.toLowerCase().includes(q)
      );
    },
  });

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter imported vouchers…"
              className="h-7 rounded-md border-input pl-7 text-[12.5px] shadow-none"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-[11.5px] text-muted-foreground">
              <span className="font-medium text-foreground tabular-nums">
                {table.getFilteredRowModel().rows.length}
              </span>
              {" of "}
              <span className="tabular-nums">{rows.length}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 cursor-pointer gap-1.5 px-2 text-[11.5px]"
              disabled={syncMutation.isPending}
              onClick={() => syncMutation.mutate()}
              title={
                lastSyncAt
                  ? `Last synced ${lastSyncAt.toLocaleTimeString()}`
                  : "Compare imported vouchers against Hubble"
              }
            >
              {syncMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              Sync
            </Button>
            <div className="flex items-center rounded-md border border-border bg-background p-0.5">
              <button
                type="button"
                onClick={() => setView("table")}
                aria-pressed={view === "table"}
                title="Table view"
                className={cn(
                  "linear-focus-ring inline-flex h-6 cursor-pointer items-center gap-1 rounded-[5px] px-1.5 text-[11.5px] transition-colors",
                  view === "table"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Rows3 className="size-3.5" />
                Table
              </button>
              <button
                type="button"
                onClick={() => setView("preview")}
                aria-pressed={view === "preview"}
                title="Preview view"
                className={cn(
                  "linear-focus-ring inline-flex h-6 cursor-pointer items-center gap-1 rounded-[5px] px-1.5 text-[11.5px] transition-colors",
                  view === "preview"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
  <LayoutGrid className="size-3.5" />
                Preview
              </button>
            </div>
          </div>
        </div>

        {changes.length > 0 && (
          <div className="flex items-center gap-2 border-b border-amber-500/30 bg-amber-50/60 px-3 py-2 text-[12px] text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span className="flex-1">
              <span className="font-medium tabular-nums">{changes.length}</span>{" "}
              voucher{changes.length === 1 ? "" : "s"} have updated discounts on Hubble.
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-6 cursor-pointer gap-1 border-amber-500/40 px-2 text-[11px] font-medium text-amber-700 hover:bg-amber-100 hover:text-amber-900 dark:text-amber-300 dark:hover:bg-amber-950/40"
              disabled={applyMutation.isPending}
              onClick={() => applyMutation.mutate({})}
            >
              {applyMutation.isPending && !applyMutation.variables?.ids ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Wrench className="size-3" />
              )}
              Fix all
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 cursor-pointer px-2 text-[11px] text-amber-700 hover:text-amber-900 dark:text-amber-300"
              onClick={() => setChanges([])}
            >
              Dismiss
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <Skeleton className="size-7 rounded-md" />
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="ml-auto h-3.5 w-28" />
              </div>
            ))}
          </div>
        ) : view === "table" ? (
          <DataTable
            table={table}
            empty={<EmptyState search={search} />}
            isExpanded={(row) => expandedId === row.original.id}
            onExpandedChange={(row) =>
              setExpandedId((prev) =>
                prev === row.original.id ? null : row.original.id,
              )
            }
            renderExpanded={(row) => (
              <VoucherDetailPanel
                voucher={row.original}
                change={changeById.get(row.original.id) || null}
                applyMutation={applyMutation}
              />
            )}
          />
        ) : (
          <PreviewGrid
            rows={table.getFilteredRowModel().rows.map((r) => r.original)}
            search={search}
            changeById={changeById}
            applyMutation={applyMutation}
            onEdit={setVoucherToEdit}
            onDelete={setVoucherToDelete}
          />
        )}
      </div>

      <AlertDialog
        open={!!voucherToDelete}
        onOpenChange={(open) => !open && setVoucherToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[15px]">Delete voucher?</AlertDialogTitle>
            <AlertDialogDescription className="text-[12.5px]">
              Remove “{voucherToDelete?.brand_name}”. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-7 text-[12.5px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="h-7 bg-destructive text-[12.5px] text-white hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => voucherToDelete && deleteMutation.mutate(voucherToDelete.id)}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {voucherToEdit && (
        <EditVoucherDialog
          voucher={voucherToEdit}
          open={!!voucherToEdit}
          onOpenChange={(open) => !open && setVoucherToEdit(null)}
        />
      )}
    </>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Inbox className="size-4" />
      </div>
      <div className="text-[13px] font-medium text-foreground">
        {search ? "No vouchers match" : "No imported vouchers"}
      </div>
      <div className="text-[12px] text-muted-foreground">
        {search ? "Try a different keyword." : "Import a brand from the Pending tab."}
      </div>
    </div>
  );
}

type ApplyMutationLike = {
  mutate: (args: {
    ids?: number[];
    fields?: string[];
    overrides?: Record<string, unknown>;
  }) => void;
  isPending: boolean;
  variables:
    | { ids?: number[]; fields?: string[]; overrides?: Record<string, unknown> }
    | undefined;
};

interface PreviewGridProps {
  rows: FlatRow[];
  search: string;
  changeById: Map<number, VoucherChange>;
  applyMutation: ApplyMutationLike;
  onEdit: (v: FlatRow) => void;
  onDelete: (v: FlatRow) => void;
}

function PreviewGrid({
  rows,
  search,
  changeById,
  applyMutation,
  onEdit,
  onDelete,
}: PreviewGridProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
        <EmptyState search={search} />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 p-4 sm:gap-5 sm:p-6">
      {rows.map((v) => {
        const redemption = (() => {
          const r = v.redemption_types;
          if (Array.isArray(r)) return r;
          if (typeof r === "string") {
            const m = r.match(/\{([^}]*)\}/);
            return m?.[1]?.split(",").filter(Boolean) ?? [];
          }
          return [];
        })();
        const defaultAmount =
          (Array.isArray(v.denominations) && v.denominations[0]) ||
          v.min_amount_p ||
          100;
        const change = changeById.get(v.id);
        const isFixing =
          applyMutation.isPending &&
          applyMutation.variables?.ids?.length === 1 &&
          applyMutation.variables.ids[0] === v.id;
        return (
          <div
            key={v.id}
            className={cn(
              "group/preview relative min-w-0 overflow-hidden rounded-md border bg-card p-3 transition-colors hover:bg-muted/30",
              change
                ? "border-amber-500/50 ring-1 ring-amber-500/20"
                : "border-border",
            )}
          >
            <div className="mx-auto flex w-full max-w-[290px] justify-center">
              <FlutterVoucherCardPreview
                brandName={v.brand_name}
                brandColor={v.color_code || "#0F0F0F"}
                logoUrl={v.logo_url ?? null}
                coverUrl={v.cover_image_url ?? null}
                bannerUrl={v.banner_image_url ?? null}
                discountPercentage={v.discount_percentage || 0}
                redemptionTypes={redemption.map((t) => t.toLowerCase())}
                defaultAmount={defaultAmount}
              />
            </div>
            {change && (
              <div className="mt-3 flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-50/60 px-2 py-1 text-[11px] text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                <AlertTriangle className="size-3 shrink-0" />
                <span className="flex-1">
                  {change.diffs.length} change{change.diffs.length === 1 ? "" : "s"} on Hubble
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-5 cursor-pointer gap-1 border-amber-500/40 px-1.5 text-[10.5px] font-medium text-amber-700 hover:bg-amber-100 hover:text-amber-900 dark:text-amber-300"
                  disabled={applyMutation.isPending}
                  onClick={() => applyMutation.mutate({ ids: [v.id] })}
                >
                  {isFixing ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Wrench className="size-3" />
                  )}
                  Fix all
                </Button>
              </div>
            )}
            <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 transition-opacity group-hover/preview:opacity-100">
              <Button
                variant="secondary"
                size="icon"
                className="size-7 cursor-pointer"
                onClick={() => onEdit(v)}
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="size-7 cursor-pointer hover:text-destructive"
                onClick={() => onDelete(v)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ----- Detail panel + diff rendering ---------------------------------------

interface VoucherDetailPanelProps {
  voucher: FlatRow;
  change: VoucherChange | null;
  applyMutation: ApplyMutationLike;
}

function VoucherDetailPanel({ voucher, change, applyMutation }: VoucherDetailPanelProps) {
  const diffs = change?.diffs ?? [];
  const pendingArgs = applyMutation.isPending ? applyMutation.variables : undefined;
  const isRowFixing =
    pendingArgs?.ids?.length === 1 &&
    pendingArgs.ids[0] === voucher.id &&
    !pendingArgs.fields;


  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="border-t border-border bg-muted/20 px-4 py-3"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
          Hubble sync
        </span>
        {change ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-50/60 px-1.5 py-0.5 text-[10.5px] font-medium text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            <AlertTriangle className="size-3" />
            {diffs.length} field{diffs.length === 1 ? "" : "s"} differ
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10.5px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500/70" />
            Matches Hubble — run Sync to refresh
          </span>
        )}
        {change && (
          <Button
            size="sm"
            variant="outline"
            className="ml-auto h-6 cursor-pointer gap-1 border-amber-500/40 px-2 text-[11px] font-medium text-amber-700 hover:bg-amber-50 hover:text-amber-900 dark:text-amber-300 dark:hover:bg-amber-950/40"
            disabled={applyMutation.isPending}
            onClick={() => applyMutation.mutate({ ids: [voucher.id] })}
          >
            {isRowFixing ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Wrench className="size-3" />
            )}
            Fix all fields
          </Button>
        )}
      </div>

      {change ? (
        <div className="overflow-hidden rounded-md border border-border bg-background">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="w-[180px] px-3 py-1.5 text-left text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
                  Field
                </th>
                <th className="px-3 py-1.5 text-left text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
                  Ours
                </th>
                <th className="px-3 py-1.5 text-left text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
                  Hubble
                </th>
                <th className="w-[88px] px-3 py-1.5 text-right text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {diffs.map((d) => {
                const isFieldFixing =
                  applyMutation.isPending &&
                  pendingArgs?.ids?.length === 1 &&
                  pendingArgs.ids[0] === voucher.id &&
                  pendingArgs.fields?.length === 1 &&
                  pendingArgs.fields[0] === d.key;
                return (
                  <tr
                    key={d.key}
                    className="border-b border-border last:border-b-0 hover:bg-muted/30"
                  >
                    <td className="px-3 py-2 align-top">
                      <div className="text-[12.5px] font-medium text-foreground">{d.label}</div>
                      <div className="font-mono text-[10.5px] text-muted-foreground">{d.key}</div>
                    </td>
                    <td className="max-w-[320px] px-3 py-2 align-top">
                      <DiffValue value={d.ours} tone="ours" fieldKey={d.key} />
                    </td>
                    <td className="max-w-[320px] px-3 py-2 align-top">
                      <DiffValue value={d.hubble} tone="hubble" fieldKey={d.key} />
                    </td>
                    <td className="px-3 py-2 text-right align-top">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 cursor-pointer gap-1 border-amber-500/40 px-1.5 text-[11px] font-medium text-amber-700 hover:bg-amber-50 hover:text-amber-900 dark:text-amber-300 dark:hover:bg-amber-950/40"
                        disabled={applyMutation.isPending}
                        onClick={() =>
                          applyMutation.mutate({
                            ids: [voucher.id],
                            fields: [d.key],
                          })
                        }
                      >
                        {isFieldFixing ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Wrench className="size-3" />
                        )}
                        Fix
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-md border border-border bg-background px-3 py-2 text-[12px] text-muted-foreground">
          No diff available. Hit <span className="kbd mx-0.5">Sync</span> in the toolbar to compare this voucher against Hubble.
        </div>
      )}
    </div>
  );
}

interface DiffValueProps {
  value: unknown;
  tone: "ours" | "hubble";
  fieldKey: string;
}

function DiffValue({ value, tone, fieldKey }: DiffValueProps) {
  const wrapper = cn(
    "block whitespace-pre-wrap wrap-break-word",
    tone === "ours" &&
      "text-muted-foreground line-through decoration-muted-foreground/50",
    tone === "hubble" && "font-medium text-amber-700 dark:text-amber-400",
  );

  if (value === null || value === undefined) {
    return <span className={wrapper}>—</span>;
  }

  // usage_instructions: render keyed sections, keys verbatim (OFFLINE / Offline / Website / App).
  if (
    fieldKey === "usage_instructions" &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return <span className={wrapper}>—</span>;
    return (
      <div className="space-y-2">
        {entries.map(([k, list]) => {
          const items = Array.isArray(list) ? list.map(String) : [String(list)];
          return (
            <div key={k}>
              <div className="font-mono text-[11px] text-muted-foreground">{k}</div>
              {items.length === 0 ? (
                <div className={cn(wrapper, "mt-0.5")}>—</div>
              ) : (
                <ol
                  className={cn(
                    "mt-0.5 list-decimal space-y-0.5 pl-4 text-[12px]",
                    tone === "ours" &&
                      "text-muted-foreground line-through decoration-muted-foreground/50",
                    tone === "hubble" &&
                      "font-medium text-amber-700 dark:text-amber-400",
                  )}
                >
                  {items.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className={wrapper}>—</span>;
    return <span className={wrapper}>{value.map(String).join(", ")}</span>;
  }
  if (typeof value === "object") {
    return (
      <pre className={cn(wrapper, "font-mono text-[11px]")}>
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  if (typeof value === "string" && value.trim() === "") {
    return <span className={wrapper}>—</span>;
  }
  return <span className={wrapper}>{String(value)}</span>;
}

