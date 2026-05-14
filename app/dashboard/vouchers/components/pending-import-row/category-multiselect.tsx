"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Tag } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export type CategoryOption = { id: number; name: string };

interface CategoryMultiselectProps {
  options: CategoryOption[];
  selected: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  triggerClassName?: string;
}

export function CategoryMultiselect({
  options,
  selected,
  onChange,
  placeholder = "Select category…",
  triggerClassName,
}: CategoryMultiselectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedNames = React.useMemo(
    () =>
      options
        .filter((o) => selected.includes(o.id))
        .map((o) => o.name.replace(/_/g, " ")),
    [options, selected],
  );

  function toggle(id: number) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="listbox"
          className={cn(
            "linear-focus-ring inline-flex h-7 w-full min-w-0 items-center gap-1.5 rounded-md border border-input bg-background px-2 text-[12.5px] text-foreground transition-colors hover:bg-muted/60",
            triggerClassName,
          )}
        >
          <Tag className="size-3 shrink-0 opacity-60" />
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-left",
              selectedNames.length === 0 && "text-muted-foreground",
            )}
          >
            {selectedNames.length === 0
              ? placeholder
              : selectedNames.length === 1
                ? selectedNames[0]
                : `${selectedNames[0]} +${selectedNames.length - 1}`}
          </span>
          <ChevronsUpDown className="size-3 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-56 p-0"
        sideOffset={4}
      >
        <Command>
          <CommandInput placeholder="Search categories…" className="h-9 text-[12.5px]" />
          <CommandList>
            <CommandEmpty>No categories.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.id);
                return (
                  <CommandItem
                    key={option.id}
                    value={option.name}
                    onSelect={() => toggle(option.id)}
                    className="capitalize"
                  >
                    <div
                      className={cn(
                        "flex size-3.5 items-center justify-center rounded-[3px] border",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input",
                      )}
                    >
                      {isSelected && <Check className="size-2.5" />}
                    </div>
                    <span className="truncate">{option.name.replace(/_/g, " ")}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
