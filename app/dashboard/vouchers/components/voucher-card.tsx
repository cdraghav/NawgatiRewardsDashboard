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
    <div 
      className="relative w-[280px] mt-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {voucher.discount_percentage && (
        <div className="absolute -top-3 left-3 z-20">
          <div className="relative">
            <div className="p-[3px] bg-[#36A4FF] rounded-br-2xl shadow-lg">
              <div className="relative w-16 h-[68px] p-2 rounded-br-2xl border-2 border-t-0 border-slate-500 border-dashed flex flex-col items-center justify-center gap-1 bg-[#36A4FF]">
                <div className="text-[20px] font-extrabold leading-none text-[#142E57]">
                  {voucher.discount_percentage}%
                </div>
                <div className="w-6 h-[9px] flex items-center justify-center text-[#142E57] mt-0.5 text-[20px] font-extrabold leading-none tracking-normal">
                  OFF
                </div>
              </div>
            </div>
            
            <div 
              className="absolute top-0 right-0 w-0 h-0 translate-x-full"
              style={{ 
                borderBottom: '12px solid #36A4FF',
                borderRight: '12px solid transparent'
              }}
            />
          </div>
        </div>
      )}

      {(hasOnline || hasOffline) && (
        <div className="absolute top-2 right-2 z-20 flex gap-2.5">
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
        className="relative rounded-b-3xl overflow-visible shadow-xl"
        style={{ backgroundColor: voucher.color_code || "#ff5252" }}
      >
        <div 
          className={`absolute top-0 left-0 right-0 rounded-b-3xl backdrop-blur-md z-30 flex items-center justify-center gap-3 transition-all duration-300 ease-in-out ${
            isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
          style={{ 
            height: '358px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }}
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

        <div className="relative h-[190px]">
          <div className="absolute inset-0 flex items-center justify-center top-[65%] -translate-y-1/2">
            {voucher.logo_url ? (
              <div className="relative w-[180px] h-16 flex items-center justify-center">
                <Image
                  src={voucher.logo_url}
                  alt={voucher.brand_name}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <h2 className="text-3xl font-black text-white">{voucher.brand_name}</h2>
            )}
          </div>
        </div>

        <div className="relative h-2 mx-6">
          {/* <div className="absolute inset-x-0 top-0 bg-white justify-between items-center">
            <svg width="100%" height="1" className="absolute inset-0">
              <line 
                x1="20" 
                y1="0" 
                x2="calc(100% - 20px)" 
                y2="0" 
                stroke="white" 
                strokeWidth="1" 
                strokeDasharray="6 4"
                opacity="0.4"
              />
            </svg>
          </div>
           */}

  <svg
    className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 opacity-50"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line
      x1="0"
      y1="1"
      x2="100%"
      y2="1"
      stroke="white"
      strokeWidth="2"
      strokeDasharray="10 6"  // <-- 10px dash, 6px gap
    />
  </svg>
          <div className="absolute -left-6 top-1/2 w-3 h-5 -translate-y-1/2 rounded-r-full bg-white" />
          
          <div className="absolute -right-6 top-1/2 w-3 h-5 -translate-y-1/2 rounded-l-full bg-white" />
        </div>

        <div className="relative px-6 p-0 pt-4 overflow-hidden h-[160px]">
          <div className="relative w-full h-full translate-y-4">
            {voucher.cover_image_url ? (
              <Image
                src={voucher.cover_image_url}
                alt={`${voucher.brand_name} cover`}
                fill
                className="object-contain"
              />
            ) : (
              <div className="w-full h-full bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-white/50 text-xs">No cover image</span>
              </div>
            )}
          </div>
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
  )
}
