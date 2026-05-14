"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  type FilterFn,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search, Inbox, Filter } from "lucide-react";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PendingImportRow } from "./pending-import-row";
import { type CategoryOption } from "./category-multiselect";
import type { HubbleBrand } from "../../lib/build-voucher-formdata";
import { cn } from "@/lib/utils";

async function fetchPendingVouchers(): Promise<HubbleBrand[]> {
  const res = await api.get("/api/voucher/hubble-brands");
  return res.data.data.data;
}

async function fetchCategories(): Promise<CategoryOption[]> {
  const res = await api.get("/api/voucher/categories");
  return res.data.data;
}

const brandFilter: FilterFn<HubbleBrand> = (row, _id, value: string) => {
  const q = (value || "").trim().toLowerCase();
  if (!q) return true;
  const v = row.original;
  return (
    ((v.title as string | undefined)?.toLowerCase().includes(q) ?? false) ||
    ((v.brandDescription as string | undefined)?.toLowerCase().includes(q) ?? false)
  );
};

interface PendingImportTableProps {
  externalSearch?: string;
  onSearchChange?: (value: string) => void;
  registerCommandTargets?: (targets: { brands: HubbleBrand[] }) => void;
}

export function PendingImportTable({
  externalSearch,
  onSearchChange,
  registerCommandTargets,
}: PendingImportTableProps) {
  const [internalSearch, setInternalSearch] = React.useState("");
  const search = externalSearch ?? internalSearch;
  const setSearch = onSearchChange ?? setInternalSearch;
  const deferredSearch = React.useDeferredValue(search);
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);

  const pending = useQuery({
    queryKey: ["pending-vouchers"],
    queryFn: fetchPendingVouchers,
  });
  const cats = useQuery({
    queryKey: ["voucher-categories"],
    queryFn: fetchCategories,
  });

  const columns = React.useMemo<ColumnDef<HubbleBrand>[]>(
    () => [{ id: "brand", accessorKey: "title", filterFn: brandFilter }],
    [],
  );

  const data = React.useMemo(() => pending.data ?? [], [pending.data]);
  const categoryOptions = React.useMemo(() => cats.data ?? [], [cats.data]);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter: deferredSearch },
    onGlobalFilterChange: setSearch,
    globalFilterFn: brandFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const filteredRows = table.getRowModel().rows;
  const filteredBrands = React.useMemo(
    () => filteredRows.map((r) => r.original),
    [filteredRows],
  );

  React.useEffect(() => {
    if (registerCommandTargets) registerCommandTargets({ brands: filteredBrands });
  }, [filteredBrands, registerCommandTargets]);

  const moveFocus = React.useCallback(
    (dir: 1 | -1) => {
      if (filteredBrands.length === 0) return;
      const idx = filteredBrands.findIndex((v) => v.id === focusedId);
      const next = (idx + dir + filteredBrands.length) % filteredBrands.length;
      const id = filteredBrands[Math.max(0, next)].id;
      setFocusedId(id as string);
      const el = listRef.current?.querySelector<HTMLDivElement>(
        `[data-voucher-id="${id}"]`,
      );
      el?.focus();
      el?.scrollIntoView({ block: "nearest" });
    },
    [filteredBrands, focusedId],
  );

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      const editing = tag === "input" || tag === "textarea";
      if (editing) return;
      if (e.key === "j") {
        e.preventDefault();
        moveFocus(1);
      } else if (e.key === "k") {
        e.preventDefault();
        moveFocus(-1);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [moveFocus]);

  if (pending.isLoading || cats.isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <TableHeader />
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="size-7 rounded-md" />
              <Skeleton className="h-3.5 w-32" />
              <div className="ml-auto flex items-center gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter brands…"
            className="h-7 rounded-md border-input pl-7 text-[12.5px] shadow-none"
          />
        </div>
        <div className="ml-auto flex items-center gap-3 text-[11.5px] text-muted-foreground">
          <span>
            <span className="font-medium text-foreground tabular-nums">{filteredBrands.length}</span>
            {" of "}
            <span className="tabular-nums">{pending.data?.length ?? 0}</span> brands
          </span>
          <span className="hidden items-center gap-1 sm:inline-flex">
            <span className="kbd">J</span>
            <span className="kbd">K</span>
            <span>to navigate</span>
          </span>
        </div>
      </div>

      <TableHeader />

      <div ref={listRef} className="relative">
        {filteredBrands.length === 0 ? (
          <EmptyState hasQuery={search.length > 0} />
        ) : (
          filteredRows.map((row) => (
            <MemoRow
              key={row.id}
              voucher={row.original}
              categories={categoryOptions}
              focused={focusedId === row.original.id}
              setFocusedId={setFocusedId}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface MemoRowProps {
  voucher: HubbleBrand;
  categories: CategoryOption[];
  focused: boolean;
  setFocusedId: (id: string) => void;
}

const MemoRow = React.memo(function MemoRow({
  voucher,
  categories,
  focused,
  setFocusedId,
}: MemoRowProps) {
  const onFocus = React.useCallback(
    () => setFocusedId(voucher.id as string),
    [setFocusedId, voucher.id],
  );
  return (
    <PendingImportRow
      voucher={voucher}
      categories={categories}
      focused={focused}
      onFocus={onFocus}
    />
  );
});

function TableHeader() {
  return (
    <div
      className={cn(
        "hidden border-b border-border bg-muted/30 px-3 py-1.5 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground",
        "sm:grid sm:grid-cols-[minmax(140px,1.4fr)_auto_auto_auto_auto_56px_minmax(120px,1fr)_auto_24px] sm:items-center sm:gap-2",
      )}
    >
      <div>Brand</div>
      <div>Logo</div>
      <div>Banner</div>
      <div>Cover</div>
      <div>Color</div>
      <div className="text-right">%</div>
      <div>
        <span className="inline-flex items-center gap-1">
          <Filter className="size-3" />
          Category
        </span>
      </div>
      <div className="text-right">Action</div>
      <div />
    </div>
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Inbox className="size-4" />
      </div>
      <div className="text-[13px] font-medium text-foreground">
        {hasQuery ? "No brands match your search" : "Nothing to import"}
      </div>
      <div className="text-[12px] text-muted-foreground">
        {hasQuery
          ? "Try a different keyword or clear the filter."
          : "All Hubble brands are already imported."}
      </div>
    </div>
  );
}
