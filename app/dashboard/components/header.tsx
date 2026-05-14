"use client";

import * as React from "react";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";

interface DashboardHeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export function DashboardHeader({ breadcrumbs, actions }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-10 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-md">
      <SidebarTrigger className="size-6" />
      <Separator orientation="vertical" className="mx-1 h-3.5" />
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-[12.5px] text-muted-foreground">
        {breadcrumbs?.map((crumb, idx) => (
          <React.Fragment key={`${crumb.label}-${idx}`}>
            {idx > 0 && <ChevronRight className="size-3 opacity-50" />}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="rounded px-1 transition-colors hover:text-foreground"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="px-1 font-medium text-foreground">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-1.5">{actions}</div>
    </header>
  );
}
