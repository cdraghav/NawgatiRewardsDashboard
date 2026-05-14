"use client";

import * as React from "react";
import { Ticket, LayoutGrid, LogOut, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import nawgati_icon from "@/public/nawgati_icon.png";

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
};

const navMain: NavItem[] = [
  { title: "Vouchers", url: "/dashboard/vouchers", icon: Ticket, shortcut: "G V" },
  { title: "Categories", url: "/dashboard/categories", icon: LayoutGrid, shortcut: "G C" },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const onOpenCommand = React.useCallback(() => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  }, []);

  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/login") },
    });
  }

  return (
    <Sidebar {...props} className="border-r border-sidebar-border">
      <SidebarHeader className="px-2 pt-2.5 pb-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="default"
              className="h-9 gap-2 hover:bg-sidebar-accent"
            >
              <Link href="/dashboard">
                <div className="flex aspect-square size-6 items-center justify-center overflow-hidden rounded-md bg-primary/10">
                  <Image
                    src={nawgati_icon}
                    alt="Nawgati"
                    height={32}
                    width={32}
                    className="rounded-md object-contain"
                  />
                </div>
                <div className="flex min-w-0 flex-col leading-none">
                  <span className="truncate text-[13px] font-semibold tracking-tight text-sidebar-foreground">
                    Nawgati Rewards
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <button
          type="button"
          onClick={onOpenCommand}
          className="mt-1.5 flex h-8 w-full items-center gap-2 rounded-md border border-sidebar-border bg-sidebar/40 px-2 text-[12.5px] text-muted-foreground transition-colors hover:bg-sidebar-accent"
        >
          <Search className="size-3.5 opacity-70" />
          <span className="flex-1 text-left">Search…</span>
          <span className="kbd">⌘K</span>
        </button>

      </SidebarHeader>

      <SidebarContent className="px-1.5">
        <SidebarGroup className="py-1">
          <SidebarGroupLabel className="px-2 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
            Workspace
          </SidebarGroupLabel>
          <SidebarMenu>
            {navMain.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    size="sm"
                    className="h-7 gap-2 text-[13px] data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground"
                  >
                    <Link href={item.url}>
                      <Icon className="size-3.5 opacity-80" />
                      <span className="truncate">{item.title}</span>
                      {item.shortcut && (
                        <span className="ml-auto text-[10.5px] tracking-wide text-muted-foreground/70">
                          {item.shortcut}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-1.5 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              size="sm"
              className="h-7 gap-2 text-[13px] text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-3.5" />
              Sign out
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
