"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Filter,
  LayoutGrid,
  ListFilter,
  Search,
  Sparkles,
  Ticket,
} from "lucide-react";

export type PaletteBrand = { id: string; title: string };

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brands: PaletteBrand[];
  onJumpToBrand: (brandId: string) => void;
  onSetTab: (tab: "all" | "uploaded" | "pending") => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  brands,
  onJumpToBrand,
  onSetTab,
}: CommandPaletteProps) {
  const router = useRouter();

  function run(fn: () => void) {
    onOpenChange(false);
    setTimeout(fn, 0);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Workspace command palette"
      description="Search brands, change tabs, and jump around."
    >
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>

        <CommandGroup heading="Vouchers">
          <CommandItem onSelect={() => run(() => onSetTab("pending"))}>
            <ListFilter />
            <span>View pending imports</span>
            <CommandShortcut>P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => onSetTab("uploaded"))}>
            <Sparkles />
            <span>View imported vouchers</span>
            <CommandShortcut>U</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => onSetTab("all"))}>
            <Filter />
            <span>View all coupons</span>
            <CommandShortcut>A</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => run(() => router.push("/dashboard/vouchers"))}>
            <Ticket />
            <span>Go to Vouchers</span>
            <CommandShortcut>G V</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/dashboard/categories"))}>
            <LayoutGrid />
            <span>Go to Categories</span>
            <CommandShortcut>G C</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        {brands.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Jump to brand">
              {brands.slice(0, 50).map((b) => (
                <CommandItem
                  key={b.id}
                  value={`brand ${b.title}`}
                  onSelect={() => run(() => onJumpToBrand(b.id))}
                >
                  <Search />
                  <span className="truncate">{b.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPaletteHotkey(setOpen: (v: boolean) => void) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [setOpen]);
}
