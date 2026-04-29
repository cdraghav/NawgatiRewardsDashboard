"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, Plus, Search, X, Filter } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import Autoplay from "embla-carousel-autoplay";
import { AddVoucherDialog } from "./add-voucher-dialog";
import { LoadingSpinner } from "@/components/loading";

interface PendingVouchersCarouselProps {
  expanded?: boolean;
}

interface Filters {
  search: string;
  status: string;
  type: string;
  minAmount: number;
  maxAmount: number;
  hasDiscount: string;
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
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "all",
    type: "all",
    minAmount: 0,
    maxAmount: 50000,
    hasDiscount: "all",
  });

  const { data: pendingVouchers, isLoading } = useQuery({
    queryKey: ["pending-vouchers"],
    queryFn: fetchHubbleProducts,
  });

  const filteredVouchers = useMemo(() => {
    if (!pendingVouchers) return [];

    return pendingVouchers.filter((voucher: any) => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        !filters.search ||
        voucher.title.toLowerCase().includes(searchLower) ||
        voucher.description?.toLowerCase().includes(searchLower);

      const matchesStatus =
        filters.status === "all" ||
        voucher.status.toLowerCase() === filters.status.toLowerCase();

      const matchesType =
        filters.type === "all" ||
        voucher.denominationType.toLowerCase() === filters.type.toLowerCase();

      const voucherMinAmount = voucher.amountRestrictions?.minAmount || 0;
      const voucherMaxAmount = voucher.amountRestrictions?.maxAmount || 0;
      
      const matchesAmount =
        voucherMinAmount >= filters.minAmount &&
        voucherMaxAmount <= filters.maxAmount;

      const matchesDiscount =
        filters.hasDiscount === "all" ||
        (filters.hasDiscount === "yes" && voucher.discountPercentage > 0) ||
        (filters.hasDiscount === "no" && !voucher.discountPercentage);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesAmount &&
        matchesDiscount
      );
    });
  }, [pendingVouchers, filters]);

  const handleImportClick = (voucher: any) => {
    setSelectedVoucher(voucher);
    setDialogOpen(true);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      type: "all",
      minAmount: 0,
      maxAmount: 50000,
      hasDiscount: "all",
    });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== "" ||
      filters.status !== "all" ||
      filters.type !== "all" ||
      filters.minAmount !== 0 ||
      filters.maxAmount !== 50000 ||
      filters.hasDiscount !== "all"
    );
  }, [filters]);

  if (isLoading) {
    return (
      <LoadingSpinner text="Loading Hubble Brands"/>
    );
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
              {hasActiveFilters && " (filtered)"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vouchers..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="pl-9"
              />
            </div>

            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Filter className="h-4 w-4" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Filters</h3>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="h-auto p-0 text-xs"
                      >
                        Reset all
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Denomination Type</Label>
                    <Select
                      value={filters.type}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="range">Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Has Discount</Label>
                    <Select
                      value={filters.hasDiscount}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, hasDiscount: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="yes">With Discount</SelectItem>
                        <SelectItem value="no">Without Discount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>
                      Amount Range: ₹{filters.minAmount} - ₹{filters.maxAmount}
                    </Label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Min Amount
                        </Label>
                        <Slider
                          value={[filters.minAmount]}
                          onValueChange={([value]) =>
                            setFilters((prev) => ({ ...prev, minAmount: value }))
                          }
                          min={0}
                          max={50000}
                          step={100}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Max Amount
                        </Label>
                        <Slider
                          value={[filters.maxAmount]}
                          onValueChange={([value]) =>
                            setFilters((prev) => ({ ...prev, maxAmount: value }))
                          }
                          min={0}
                          max={50000}
                          step={100}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.search && (
              <Badge 
                variant="secondary" 
                className="gap-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters((prev) => ({ ...prev, search: "" }));
                }}
              >
                Search: {filters.search}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.status !== "all" && (
              <Badge 
                variant="secondary" 
                className="gap-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters((prev) => ({ ...prev, status: "all" }));
                }}
              >
                Status: {filters.status}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.type !== "all" && (
              <Badge 
                variant="secondary" 
                className="gap-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters((prev) => ({ ...prev, type: "all" }));
                }}
              >
                Type: {filters.type}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.hasDiscount !== "all" && (
              <Badge 
                variant="secondary" 
                className="gap-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters((prev) => ({ ...prev, hasDiscount: "all" }));
                }}
              >
                Discount: {filters.hasDiscount === "yes" ? "Yes" : "No"}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {(filters.minAmount !== 0 || filters.maxAmount !== 50000) && (
              <Badge 
                variant="secondary" 
                className="gap-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters((prev) => ({
                    ...prev,
                    minAmount: 0,
                    maxAmount: 50000,
                  }));
                }}
              >
                Range: ₹{filters.minAmount} - ₹{filters.maxAmount}
                <X className="h-3 w-3" />
              </Badge>
            )}
          </div>
        )}

        {filteredVouchers.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed bg-muted/30 p-12 text-center">
            <p className="text-muted-foreground">
              No vouchers match your filters. Try adjusting your search criteria.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            {!isOpen && (
              <div className="w-full max-w-284 px-4 mx-auto overflow-hidden  relative">
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
                  <CarouselContent className="scroll-px-10 ">
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
        )}
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
                    {cat.replace(/_/g, ' ')}
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

