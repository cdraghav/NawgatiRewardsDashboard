"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Plus, Search } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { AddVoucherDialog } from "./add-voucher-dialog";
import { LoadingSpinner } from "@/components/loading";

interface PendingVouchersCarouselProps {
  expanded?: boolean;
}

async function fetchHubbleProducts() {
  const response = await api.get("/api/voucher/hubble-brands");
  return response.data.data.data;
}

export function PendingVouchersCarousel({
  expanded = false,
}: PendingVouchersCarouselProps) {
  const [isOpen, setIsOpen] = useState(expanded);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: pendingVouchers, isLoading } = useQuery({
    queryKey: ["pending-vouchers"],
    queryFn: fetchHubbleProducts,
  });

  const filteredVouchers = useMemo(() => {
    if (!pendingVouchers) return [];
    const q = search.trim().toLowerCase();
    if (!q) return pendingVouchers;
    return pendingVouchers.filter((v: any) =>
      v.title?.toLowerCase().includes(q) ||
      v.brandDescription?.toLowerCase().includes(q)
    );
  }, [pendingVouchers, search]);

  const handleImportClick = (voucher: any) => {
    setSelectedVoucher(voucher);
    setDialogOpen(true);
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading Hubble Brands" />;
  }

  if (!pendingVouchers?.length) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        No pending vouchers from Hubble
      </div>
    );
  }

  return (
    <>
      <div id="pending" className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Pending Vouchers</h2>
            <p className="text-sm text-muted-foreground">
              {filteredVouchers.length} of {pendingVouchers.length} vouchers
            </p>
          </div>

          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vouchers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          {!isOpen && (
            <div className="w-full max-w-284 px-4 mx-auto overflow-hidden relative">
              <Carousel
                opts={{ align: "start", loop: true }}
                plugins={[
                  Autoplay({
                    active: !dialogOpen,
                    delay: 3000,
                    stopOnInteraction: false,
                    stopOnMouseEnter: true,
                  }),
                ]}
                className="w-full px-10"
              >
                <CarouselContent className="scroll-px-10">
                  {filteredVouchers.map((voucher: any) => (
                    <CarouselItem
                      key={voucher.id}
                      className="pl-4 md:basis-1/2 lg:basis-1/3"
                    >
                      <VoucherCard
                        voucher={voucher}
                        onImport={handleImportClick}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full" />
                <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full" />
              </Carousel>
            </div>
          )}

          <CollapsibleContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredVouchers.map((voucher: any) => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  onImport={handleImportClick}
                />
              ))}
            </div>
          </CollapsibleContent>

          <div className="flex justify-center mt-4">
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {isOpen ? (
                  <>
                    Show Less <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show All ({filteredVouchers.length}){" "}
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </Collapsible>
      </div>

      {selectedVoucher && (
        <AddVoucherDialog
          voucher={selectedVoucher}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </>
  );
}

function VoucherCard({
  voucher,
  onImport,
}: {
  voucher: any;
  onImport: (voucher: any) => void;
}) {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <img
            src={voucher.logoUrl}
            alt={voucher.title}
            className="h-12 w-12 rounded object-contain"
          />
          <div className="flex flex-col gap-1 items-end">
            <Badge
              variant={
                voucher.status.toLowerCase() === "active"
                  ? "default"
                  : "secondary"
              }
            >
              {voucher.status}
            </Badge>
            {voucher.discountPercentage > 0 && (
              <Badge variant="destructive" className="text-xs">
                {voucher.discountPercentage}% OFF
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="line-clamp-2 text-base mt-2">
          {voucher.title}
        </CardTitle>
        {voucher.brandDescription && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {voucher.brandDescription}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex flex-col justify-between flex-grow space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Type:</span>
            <Badge variant="outline" className="text-xs">
              {voucher.denominationType}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Range:</span>
            <span className="font-medium text-xs">
              ₹{voucher.amountRestrictions.minAmount.toLocaleString()} - ₹
              {voucher.amountRestrictions.maxAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expiry:</span>
            <span className="font-medium text-xs">
              {voucher.voucherExpiryInMonths} months
            </span>
          </div>
          {voucher.redemptionType && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Redeem:</span>
              <Badge variant="secondary" className="text-xs">
                {voucher.redemptionType}
              </Badge>
            </div>
          )}
          {voucher.category && voucher.category.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-1">Categories:</p>
              <div className="flex flex-wrap gap-1">
                {voucher.category.slice(0, 2).map((cat: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {cat.replace(/_/g, " ")}
                  </Badge>
                ))}
                {voucher.category.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{voucher.category.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <Button className="w-full" size="sm" onClick={() => onImport(voucher)}>
          <Plus className="h-4 w-4 mr-1" />
          Import
        </Button>
      </CardContent>
    </Card>
  );
}
