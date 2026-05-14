"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FlutterVoucherCardPreview } from "../add-voucher/flutter-voucher-card-preview";
import type { HubbleBrand } from "../../lib/build-voucher-formdata";

interface ExpandedPanelProps {
  voucher: HubbleBrand;
  previews: { logo: string | null; cover: string | null; banner: string | null };
  discountPercentage: number;
  brandColor: string;
  categoryNames: string[];
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-[11.5px] font-medium text-muted-foreground">
        {label}
      </span>
      <span className="truncate text-right text-[12.5px] font-medium text-foreground">
        {value || "—"}
      </span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem value={title} className="border-b border-border last:border-b-0">
      <AccordionTrigger className="py-2 text-[12.5px] font-medium text-foreground hover:no-underline">
        {title}
      </AccordionTrigger>
      <AccordionContent className="pb-3">{children}</AccordionContent>
    </AccordionItem>
  );
}

export function ExpandedPanel({
  voucher,
  previews,
  discountPercentage,
  brandColor,
  categoryNames,
}: ExpandedPanelProps) {
  const r = voucher.amountRestrictions;
  const denominations =
    voucher.amountRestrictions?.denominations || voucher.denominations || [];
  const redemptionTypes = Array.isArray(voucher.redemptionTypes)
    ? (voucher.redemptionTypes as string[])
    : voucher.redemptionType
      ? [String(voucher.redemptionType)]
      : [];
  const usage = voucher.usageInstructions || {};
  const onlineUsage = (usage.ONLINE || []) as string[];
  const offlineUsage = (usage.OFFLINE || []) as string[];
  const tnc = Array.isArray(voucher.termsAndConditions)
    ? (voucher.termsAndConditions as string[])
    : [];

  const defaultAmount =
    (Array.isArray(denominations) && denominations.length > 0 && Number(denominations[0])) ||
    Number(r?.minAmount) ||
    100;

  return (
    <div className="grid gap-4 border-t border-border bg-muted/30 px-4 py-4 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        {voucher.brandDescription ? (
          <p className="mb-2 text-[12.5px] leading-relaxed text-foreground">
            {voucher.brandDescription}
          </p>
        ) : (
          <p className="mb-2 text-[12.5px] italic text-muted-foreground">
            No description from Hubble.
          </p>
        )}

        <Accordion
          type="multiple"
          defaultValue={["Amounts", "Redemption"]}
          className="w-full"
        >
          <Section title="Amounts">
            <div className="grid grid-cols-2 gap-x-6">
              <div className="divide-y divide-border">
                <InfoRow label="Type" value={voucher.denominationType} />
                <InfoRow
                  label="Min"
                  value={r?.minAmount ? `₹${Number(r.minAmount).toLocaleString()}` : undefined}
                />
                <InfoRow
                  label="Max"
                  value={r?.maxAmount ? `₹${Number(r.maxAmount).toLocaleString()}` : undefined}
                />
                <InfoRow
                  label="Min order"
                  value={r?.minOrderAmount ? `₹${Number(r.minOrderAmount).toLocaleString()}` : undefined}
                />
                <InfoRow
                  label="Max order"
                  value={r?.maxOrderAmount ? `₹${Number(r.maxOrderAmount).toLocaleString()}` : undefined}
                />
              </div>
              <div className="divide-y divide-border">
                <InfoRow
                  label="Min voucher"
                  value={r?.minVoucherAmount ? `₹${Number(r.minVoucherAmount).toLocaleString()}` : undefined}
                />
                <InfoRow
                  label="Max voucher"
                  value={r?.maxVoucherAmount ? `₹${Number(r.maxVoucherAmount).toLocaleString()}` : undefined}
                />
                <InfoRow label="Max / order" value={r?.maxVouchersPerOrder} />
                <InfoRow label="Max / denom" value={r?.maxVouchersPerDenomination} />
                <InfoRow label="Max denoms / order" value={r?.maxDenominationsPerOrder} />
              </div>
            </div>
            {Array.isArray(denominations) && denominations.length > 0 && (
              <div className="mt-2">
                <div className="mb-1 text-[11.5px] font-medium text-muted-foreground">
                  Denominations
                </div>
                <div className="flex flex-wrap gap-1">
                  {denominations.map((d: number) => (
                    <Badge
                      key={d}
                      variant="secondary"
                      className="h-5 rounded-md px-1.5 text-[11px] font-normal tabular-nums"
                    >
                      ₹{d}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Section>

          <Section title="Redemption">
            <div className="grid grid-cols-2 gap-x-6">
              <div className="divide-y divide-border">
                <InfoRow label="Card type" value={voucher.cardType} />
                <InfoRow
                  label="Expiry"
                  value={voucher.voucherExpiryInMonths ? `${voucher.voucherExpiryInMonths} months` : undefined}
                />
              </div>
              <div className="divide-y divide-border">
                <InfoRow
                  label="Channels"
                  value={redemptionTypes.length > 0 ? redemptionTypes.join(", ") : undefined}
                />
                <InfoRow label="ID" value={voucher.id} />
              </div>
            </div>
            {(onlineUsage.length > 0 || offlineUsage.length > 0) && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {Object.entries(usage as Record<string, string[]>).map(
                  ([key, steps]) =>
                    Array.isArray(steps) && steps.length > 0 ? (
                      <div key={key}>
                        <div className="mb-1 text-[11.5px] font-medium text-muted-foreground">
                          {key}
                        </div>
                        <ol className="list-decimal space-y-1 pl-4 text-[12px] text-foreground">
                          {steps.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ol>
                      </div>
                    ) : null,
                )}
              </div>
            )}
          </Section>

          {(Array.isArray(voucher.category) && voucher.category.length > 0) ||
          (Array.isArray(voucher.tags) && voucher.tags.length > 0) ? (
            <Section title="Tags & Hubble categories">
              {Array.isArray(voucher.category) && voucher.category.length > 0 && (
                <div className="mb-2">
                  <div className="mb-1 text-[11.5px] font-medium text-muted-foreground">
                    Hubble categories
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {voucher.category.map((c: string) => (
                      <Badge
                        key={c}
                        variant="secondary"
                        className="h-5 rounded-md px-1.5 text-[11px] font-normal"
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {Array.isArray(voucher.tags) && voucher.tags.length > 0 && (
                <div>
                  <div className="mb-1 text-[11.5px] font-medium text-muted-foreground">
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {voucher.tags.map((t: string) => (
                      <Badge
                        key={t}
                        variant="outline"
                        className="h-5 rounded-md px-1.5 text-[11px] font-normal"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          ) : null}

          {tnc.length > 0 || voucher.termsAndConditionsUrl || voucher.tncUrl ? (
            <Section title="Terms & Conditions">
              {tnc.length > 0 && (
                <ul className="list-disc space-y-1 pl-4 text-[12px] text-foreground">
                  {tnc.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              )}
              {(voucher.termsAndConditionsUrl || voucher.tncUrl) && (
                <a
                  href={voucher.termsAndConditionsUrl || voucher.tncUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-[12px] text-primary underline-offset-2 hover:underline"
                >
                  View full terms ↗
                </a>
              )}
            </Section>
          ) : null}
        </Accordion>
      </div>

      {/* Live preview using the production voucher UI */}
      <div className="min-w-0">
        <div className="mb-2 text-[11.5px] font-medium text-muted-foreground">
          Preview
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <FlutterVoucherCardPreview
            brandName={voucher.title || ""}
            brandColor={brandColor}
            logoUrl={previews.logo || voucher.logoUrl || null}
            coverUrl={previews.cover}
            bannerUrl={previews.banner}
            discountPercentage={discountPercentage}
            redemptionTypes={redemptionTypes.map((t) => t.toLowerCase())}
            defaultAmount={defaultAmount}
          />
        </div>
        {categoryNames.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {categoryNames.map((n) => (
              <Badge
                key={n}
                variant="outline"
                className="h-5 rounded-md px-1.5 text-[11px] font-normal"
              >
                {n}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
