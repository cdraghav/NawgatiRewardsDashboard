"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Calendar, Tag, Coins } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface VoucherCardProps {
  voucher: any
  onEdit: () => void
  onDelete: () => void
}

export function VoucherCard({ voucher, onEdit, onDelete }: VoucherCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const bannerUrl = voucher.banner_image_url || voucher.bannerImageUrl || null

  let redemptionTypes: string[] = []
  if (Array.isArray(voucher.redemption_types)) {
    redemptionTypes = voucher.redemption_types
  } else if (typeof voucher.redemption_types === 'string') {
    const match = voucher.redemption_types.match(/\{([^}]*)\}/)
    if (match && match[1]) {
      redemptionTypes = match[1].split(',').filter(Boolean)
    }
  }

  const hasOnline = redemptionTypes.includes('online')
  const hasOffline = redemptionTypes.includes('offline')

  return (
    <div className="w-[280px] mt-8">
    <div
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {voucher.discount_percentage && (
        <div className="absolute -top-2.5 left-5 z-30 flex flex-row items-start">
          <div
            className="rounded-b-lg"
            style={{ boxShadow: "-1.954px 5.863px 7.817px rgba(0,0,0,0.24)" }}
          >
            <div
              className="p-[3px] rounded-b-lg"
              style={{ background: "linear-gradient(to bottom, #6dbdff, #1093ff)" }}
            >
              <div
                className="px-[3px] pb-[3px] rounded-b-lg"
                style={{
                  borderLeft: "1.5px dashed rgba(255,255,255,0.6)",
                  borderRight: "1.5px dashed rgba(255,255,255,0.6)",
                  borderBottom: "1.5px dashed rgba(255,255,255,0.6)",
                }}
              >
                <div
                  className="pt-3 rounded-b-lg"
                  style={{ background: "linear-gradient(to bottom, #6dbdff, #1093ff)" }}
                >
                  <div className="w-11 h-10 flex flex-col items-center justify-center text-white font-black leading-none text-center">
                    <div className="text-[18px]">{voucher.discount_percentage}%</div>
                    <div className="text-[14px] mt-0.5">OFF</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="w-[9px] h-[10px]"
            style={{
              background: "#1093ff",
              clipPath: "polygon(0 0, 100% 100%, 0 100%)",
            }}
          />
        </div>
      )}

      {(hasOnline || hasOffline) && (
        <div className="absolute top-2 right-2 z-30 flex gap-2.5">
          {hasOffline && (
            <div className="w-16 h-5 rounded-sm p-2 flex items-center justify-center bg-gray-700/20 border border-white/30 backdrop-blur-sm">
              <span className="text-sm font-medium text-white leading-none">Offline</span>
            </div>
          )}
          {hasOnline && (
            <div className="w-16 h-5 rounded-sm p-2 flex items-center justify-center bg-gray-700/20 border border-white/30 backdrop-blur-sm">
              <span className="text-sm font-medium text-white leading-none">Online</span>
            </div>
          )}
        </div>
      )}

      <div
        className="relative rounded-t-2xl overflow-hidden shadow-xl"
        style={{ backgroundColor: voucher.color_code || "#ff5252" }}
      >
        {/* Pattern overlay — multiplied against brand color so both show */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: "url(/voucher_pattern.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            mixBlendMode: "multiply",
          }}
        />

        <div
          className={`absolute inset-0 rounded-t-2xl backdrop-blur-md z-40 flex items-center justify-center gap-3 transition-all duration-300 ease-in-out ${
            isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        >
          <Button
            onClick={onEdit}
            className="bg-white hover:bg-gray-100 text-gray-900 shadow-lg transition-transform duration-200 hover:scale-105"
            size="lg"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            onClick={onDelete}
            variant="destructive"
            className="shadow-lg transition-transform duration-200 hover:scale-105"
            size="lg"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>

        {/* Logo section — aspect 1.5:1; image fills full container (logo already has its own padding baked in) */}
        <div
          className="relative z-10 w-full overflow-hidden"
          style={{ aspectRatio: "1.5 / 1" }}
        >
          {voucher.logo_url ? (
            <Image
              src={voucher.logo_url}
              alt={voucher.brand_name}
              fill
              className="object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-3xl font-black text-white">{voucher.brand_name}</h2>
            </div>
          )}
        </div>

        {/* Dotted notch divider */}
        <div className="relative z-20 h-2 mx-0">
          <svg
            className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 opacity-60"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="14"
              y1="1"
              x2="calc(100% - 14px)"
              y2="1"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="10 6"
            />
          </svg>
          <div className="absolute -left-2 top-1/2 w-4 h-4 -translate-y-1/2 rounded-full bg-white" />
          <div className="absolute -right-2 top-1/2 w-4 h-4 -translate-y-1/2 rounded-full bg-white" />
        </div>

        {/* Feature image — aspect 1.7:1, full bleed */}
        <div
          className="relative z-10 w-full overflow-hidden"
          style={{ aspectRatio: "1.7 / 1" }}
        >
          {voucher.cover_image_url ? (
            <Image
              src={voucher.cover_image_url}
              alt={`${voucher.brand_name} cover`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-white/10 flex items-center justify-center">
              <span className="text-white/50 text-xs">No cover image</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative bg-white rounded-b-3xl pt-4 pb-3 px-4 shadow-lg space-y-3 z-20">
        <div>
          <h3 className="font-bold text-base mb-1.5 text-gray-900">{voucher.brand_name} Voucher</h3>
          
          {voucher.min_amount_p && voucher.max_amount_p && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>₹{voucher.min_amount_p}</span>
              <span>-</span>
              <span>₹{voucher.max_amount_p}</span>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-100">
          {voucher.category_names && voucher.category_names.length > 0 && (
            <div className="flex items-start gap-2">
              <Tag className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {voucher.category_names.slice(0, 3).map((category: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-[10px] h-5 px-2">
                    {category}
                  </Badge>
                ))}
                {voucher.category_names.length > 3 && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-2">
                    +{voucher.category_names.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {voucher.denomination_type && (
            <div className="flex items-center gap-2">
              <Coins className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-gray-600 capitalize">{voucher.denomination_type}:</span>
                {voucher.denominations && voucher.denominations.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {voucher.denominations.slice(0, 4).map((denom: number, index: number) => (
                      <Badge key={index} variant="outline" className="text-[10px] h-5 px-2 font-semibold">
                        ₹{denom}
                      </Badge>
                    ))}
                    {voucher.denominations.length > 4 && (
                      <Badge variant="outline" className="text-[10px] h-5 px-2">
                        +{voucher.denominations.length - 4}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">
                    ₹{voucher.min_amount_p} - ₹{voucher.max_amount_p}
                  </span>
                )}
              </div>
            </div>
          )}

          {voucher.voucher_expiry_in_months && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-600">
                Valid for <span className="font-semibold">{voucher.voucher_expiry_in_months} months</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>

      {bannerUrl && (
        <div className="mt-4 w-full aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerUrl}
            alt={`${voucher.brand_name} banner`}
            className="block max-w-full max-h-full"
          />
        </div>
      )}
    </div>
  )
}
