"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "../components/header";
import { PendingVouchersCarousel } from "./components/pending-vouchers-carousel";
import { UploadedVouchersGrid } from "./components/uploaded-vouchers-grid";

export default function VouchersPage() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <DashboardHeader/>
      <div className="flex flex-1 flex-col gap-4 p-4 max-w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vouchers</h1>
            <p className="text-muted-foreground">
              Manage your voucher brands from Hubble
            </p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4 w-full"
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="uploaded">Uploaded</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6 mt-0">
            <PendingVouchersCarousel />
            <UploadedVouchersGrid />
          </TabsContent>

          <TabsContent value="uploaded" className="space-y-4 mt-0">
            <UploadedVouchersGrid />
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-0">
            <PendingVouchersCarousel expanded />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
