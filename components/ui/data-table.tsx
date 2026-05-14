"use client";

import * as React from "react";
import {
  flexRender,
  type Row,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
  table: TanstackTable<TData>;
  empty?: React.ReactNode;
  rowClassName?: (row: TData) => string;
  onRowClick?: (row: TData) => void;
  /**
   * When provided, each row is clickable to toggle its expanded state and the
   * returned node is rendered in a full-width row below.
   */
  renderExpanded?: (row: Row<TData>) => React.ReactNode;
  /**
   * Optional controlled expansion. If omitted, the table manages its own
   * single-row expanded state.
   */
  isExpanded?: (row: Row<TData>) => boolean;
  onExpandedChange?: (row: Row<TData>) => void;
}

export function DataTable<TData>({
  table,
  empty,
  rowClassName,
  onRowClick,
  renderExpanded,
  isExpanded: isExpandedExternal,
  onExpandedChange,
}: DataTableProps<TData>) {
  const rows = table.getRowModel().rows;
  const [internalExpanded, setInternalExpanded] = React.useState<string | null>(null);
  const isExpanded =
    isExpandedExternal ?? ((row: Row<TData>) => internalExpanded === row.id);
  const toggleExpanded = onExpandedChange
    ? onExpandedChange
    : (row: Row<TData>) =>
        setInternalExpanded((prev) => (prev === row.id ? null : row.id));

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative w-full overflow-x-auto">
        <table className="w-full border-collapse text-[12.5px]">
          <thead className="bg-muted/30">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    style={{ width: h.getSize() !== 150 ? h.getSize() : undefined }}
                    className={cn(
                      "h-8 px-3 text-left align-middle text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground",
                      h.column.columnDef.meta &&
                        (h.column.columnDef.meta as { align?: "right" | "center" }).align === "right" &&
                        "text-right",
                    )}
                  >
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getAllColumns().length}
                  className="px-3 py-12 text-center text-[12.5px] text-muted-foreground"
                >
                  {empty ?? "No results"}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const expanded = renderExpanded ? isExpanded(row) : false;
                const clickable = renderExpanded || onRowClick;
                return (
                  <React.Fragment key={row.id}>
                    <tr
                      onClick={() => {
                        if (renderExpanded) toggleExpanded(row);
                        if (onRowClick) onRowClick(row.original);
                      }}
                      aria-expanded={renderExpanded ? expanded : undefined}
                      className={cn(
                        "border-b border-border last:border-b-0 transition-colors duration-100 ease-out hover:bg-muted/40",
                        clickable && "cursor-pointer",
                        expanded && "bg-muted/30",
                        rowClassName?.(row.original),
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={cn(
                            "h-9 px-3 align-middle text-[12.5px] text-foreground",
                            cell.column.columnDef.meta &&
                              (cell.column.columnDef.meta as { align?: "right" | "center" }).align === "right" &&
                              "text-right",
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    {renderExpanded && expanded && (
                      <tr className="border-b border-border bg-muted/20">
                        <td
                          colSpan={row.getVisibleCells().length}
                          className="p-0"
                        >
                          {renderExpanded(row)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
