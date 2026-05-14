"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { DashboardHeader } from "../components/header";
import { UploadedVouchersGrid } from "./components/uploaded-vouchers-grid";
import type { HubbleBrand } from "./lib/build-voucher-formdata";
import { PendingImportTable } from "./components/pending-import-row/pending-import-table";
import {
  CommandPalette,
  useCommandPaletteHotkey,
  type PaletteBrand,
} from "./components/pending-import-row/command-palette";
import { cn } from "@/lib/utils";

type Tab = "all" | "uploaded" | "pending";

export default function VouchersPage() {
  const [tab, setTab] = React.useState<Tab>("pending");
  const [, startTabTransition] = React.useTransition();
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [paletteBrands, setPaletteBrands] = React.useState<PaletteBrand[]>([]);
  const [search, setSearch] = React.useState("");

  // Lazy-mount: each component mounts on its first activation, stays alive.
  const [pendingMounted, setPendingMounted] = React.useState(true);
  const [uploadedMounted, setUploadedMounted] = React.useState(false);

  const changeTab = React.useCallback((next: Tab) => {
    if (next === "uploaded" || next === "all") setUploadedMounted(true);
    if (next === "pending" || next === "all") setPendingMounted(true);
    startTabTransition(() => setTab(next));
  }, []);

  useCommandPaletteHotkey(setPaletteOpen);

  React.useEffect(() => {
    function handler() {
      setPaletteOpen(true);
    }
    window.addEventListener("open-command-palette", handler);
    return () => window.removeEventListener("open-command-palette", handler);
  }, []);

  // Stable handler — skip setState when the brand id list hasn't changed.
  const lastBrandIdsRef = React.useRef<string>("");
  const handleRegister = React.useCallback(
    ({ brands }: { brands: HubbleBrand[] }) => {
      const ids = brands.map((b) => b.id as string).join(",");
      if (ids === lastBrandIdsRef.current) return;
      lastBrandIdsRef.current = ids;
      setPaletteBrands(
        brands.map((b) => ({ id: b.id as string, title: b.title as string })),
      );
    },
    [],
  );

  const handleJumpToBrand = React.useCallback((brandId: string) => {
    startTabTransition(() => setTab("pending"));
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(`[data-voucher-id="${brandId}"]`);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      el?.focus();
    });
  }, []);

  const showPending = tab === "pending" || tab === "all";
  const showUploaded = tab === "uploaded" || tab === "all";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Vouchers" },
        ]}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPaletteOpen(true)}
            className="h-7 cursor-pointer gap-1.5 px-2 text-[12px] text-muted-foreground hover:text-foreground"
          >
            <Search className="size-3.5" />
            <span className="hidden sm:inline">Search</span>
            <span className="kbd ml-1">⌘K</span>
          </Button>
        }
      />

      {/* Uber Base layout grid: margin scales by breakpoint (16 / 16 / 36 / 64) */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-3 px-4 py-4 md:px-9 xl:px-16">
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-0.5">
            <h1 className="text-[20px] font-semibold tracking-tight text-foreground">
              Vouchers
            </h1>
            <p className="text-[12.5px] text-muted-foreground">
              Import and manage voucher brands from Hubble.
            </p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => changeTab(v as Tab)} className="w-full">
          <TabsList className="h-8 rounded-md bg-muted p-0.5">
            <TabsTrigger
              value="pending"
              className="h-7 cursor-pointer rounded-[5px] px-2.5 text-[12.5px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="uploaded"
              className="h-7 cursor-pointer rounded-[5px] px-2.5 text-[12.5px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Imported
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="h-7 cursor-pointer rounded-[5px] px-2.5 text-[12.5px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              All
            </TabsTrigger>
          </TabsList>

          {/* Each heavy component mounts ONCE — tab change just toggles visibility */}
          <div className="mt-3 flex flex-col gap-4">
            <div className={cn(!showPending && "hidden")}>
              {pendingMounted && (
                <PendingImportTable
                  externalSearch={search}
                  onSearchChange={setSearch}
                  registerCommandTargets={handleRegister}
                />
              )}
            </div>
            <div className={cn(!showUploaded && "hidden")}>
              {uploadedMounted && <UploadedVouchersGrid />}
            </div>
          </div>
        </Tabs>
      </main>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        brands={paletteBrands}
        onJumpToBrand={handleJumpToBrand}
        onSetTab={setTab}
      />
    </div>
  );
}
