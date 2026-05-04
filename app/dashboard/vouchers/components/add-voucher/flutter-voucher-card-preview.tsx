"use client";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "900"] });

interface FlutterVoucherCardPreviewProps {
  brandName: string;
  brandColor: string;
  logoUrl: string | null;
  thumbnailUrl: string | null;
  discountPercentage: number;
  redemptionTypes: string[];
  defaultAmount: number;
}

const NOTCH_BORDER = "rgba(9, 13, 1, 0.035)";

export function FlutterVoucherCardPreview({
  brandName,
  brandColor,
  logoUrl,
  thumbnailUrl,
  discountPercentage,
  redemptionTypes,
  defaultAmount,
}: FlutterVoucherCardPreviewProps) {
  const discounted = Math.round(defaultAmount * (1 - discountPercentage / 100));
  const coins = Math.round((defaultAmount * discountPercentage) / 100);

  const sortedTypes = [...redemptionTypes].sort((a, b) => b.localeCompare(a));

  return (
    <div className={inter.className} style={{ width: 290, margin: "0 auto", paddingTop: 16 }}>
      <div style={{ position: "relative" }}>
        {/* Voucher body — colored frame, edge-to-edge of card */}
        <div
          style={{
            borderRadius: 8,
            overflow: "hidden",
            background: brandColor,
          }}
        >
          {/* Upper section (logo) — internal 1:5:1 (padding 1/7 each side) → logo fills 5/7 × 290 ≈ 207px */}
          <div style={{ width: "100%", background: brandColor }}>
            {logoUrl ? (
              <div
                style={{
                  paddingInline: "calc(100% / 7)",
                  paddingTop: 28,
                  paddingBottom: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt={brandName}
                  style={{
                    width: "100%",
                    maxHeight: 80,
                    objectFit: "contain",
                  }}
                />
              </div>
            ) : (
              <div style={{ height: 120 }} />
            )}
          </div>

          {/* Dotted divider */}
          <DottedDivider bgColor={brandColor} />

          {/* Thumbnail — internal 1:7:1 (padding 1/9 each side) → image fills 7/9 × 290 ≈ 226px */}
          {thumbnailUrl ? (
            <div
              style={{
                width: "100%",
                background: brandColor,
                paddingInline: "calc(100% / 9)",
                paddingTop: 6,
                paddingBottom: 10,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  position: "relative",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailUrl}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Discount tag (popping out top-left, -8px) */}
        {discountPercentage > 0 ? (
          <div
            style={{
              position: "absolute",
              top: -8,
              left: 8,
              zIndex: 30,
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                boxShadow: "-1px 3px 5px rgba(0,0,0,0.24)",
                borderRadius: "0 0 8px 8px",
              }}
            >
              <div
                style={{
                  padding: 2.5,
                  background: "#36A4FF",
                  borderRadius: "0 0 8px 8px",
                }}
              >
                {/* Dashed-border layer (left/right/bottom only) */}
                <div
                  style={{
                    padding: "0 2.5px 2.5px 2.5px",
                    borderLeft: "1.5px dashed rgba(40,40,40,0.5)",
                    borderRight: "1.5px dashed rgba(40,40,40,0.5)",
                    borderBottom: "1.5px dashed rgba(40,40,40,0.5)",
                    borderRadius: "0 0 8px 8px",
                  }}
                >
                  <div
                    style={{
                      paddingTop: 12,
                      background: "#36A4FF",
                      borderRadius: "0 0 8px 8px",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 40,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#142E57",
                        fontWeight: 900,
                        lineHeight: 1,
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 18 }}>{discountPercentage}%</div>
                      <div style={{ fontSize: 14, marginTop: 2 }}>OFF</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Triangle banner accent */}
            <div
              style={{
                width: 8,
                height: 8,
                background: "#36A4FF",
                clipPath: "polygon(0 0, 100% 100%, 0 100%)",
              }}
            />
          </div>
        ) : null}

        {/* Redemption badges (top-right, sorted desc) */}
        {sortedTypes.length > 0 ? (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            {sortedTypes.map((type) => (
              <div
                key={type}
                style={{
                  padding: "0 4px",
                  background: "rgba(40, 40, 40, 0.2)",
                  borderRadius: 2,
                  color: "#ffffff",
                  fontSize: 12,
                  fontWeight: 500,
                  lineHeight: "16px",
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Voucher details (below card) */}
      <div style={{ paddingTop: 8 }}>
        <div
          style={{
            color: "#0F0F0F",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {brandName}
        </div>
        <div style={{ height: 4 }} />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              color: "#8C959F",
              fontSize: 16,
              fontWeight: 600,
              textDecoration: "line-through",
              textDecorationColor: "#8C959F",
            }}
          >
            ₹{defaultAmount}
          </div>
          <div
            style={{
              padding: "2px 4px",
              background: "rgba(194, 79, 12, 0.10)",
              borderRadius: 22,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#0F0F0F", fontSize: 14, fontWeight: 600 }}>
              ₹{discounted}
            </span>
            <span style={{ width: 2, display: "inline-block" }} />
            <span style={{ color: "#0F0F0F", fontSize: 14, fontWeight: 600 }}>+</span>
            <span style={{ width: 2, display: "inline-block" }} />
            <span style={{ color: "#C24F0C", fontSize: 14, fontWeight: 600 }}>
              {coins}
            </span>
            <span style={{ width: 2, display: "inline-block" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/nawgati_coin.png"
              alt="coin"
              width={20}
              height={20}
              style={{ width: 20, height: 20, objectFit: "contain" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DottedDivider({ bgColor }: { bgColor: string }) {
  const NOTCH = 8;
  const DASH_HEIGHT = 2;
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: NOTCH,
        background: bgColor,
      }}
    >
      {/* Dashed white line, centered vertically */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: -DASH_HEIGHT / 2,
          height: DASH_HEIGHT,
          padding: `0 ${NOTCH + 8}px`,
          boxSizing: "border-box",
          pointerEvents: "none",
        }}
      >
        <svg width="100%" height={DASH_HEIGHT} preserveAspectRatio="none">
          <line
            x1="0"
            y1={DASH_HEIGHT / 2}
            x2="100%"
            y2={DASH_HEIGHT / 2}
            stroke="#ffffff"
            strokeWidth={DASH_HEIGHT}
            strokeDasharray="14 7"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Left notch */}
      <div
        style={{
          position: "absolute",
          left: -NOTCH,
          top: -NOTCH,
          width: NOTCH * 2,
          height: NOTCH * 2,
          borderRadius: "50%",
          background: "#ffffff",
          border: `1.5px solid ${NOTCH_BORDER}`,
          boxSizing: "border-box",
        }}
      />
      {/* Right notch */}
      <div
        style={{
          position: "absolute",
          right: -NOTCH,
          top: -NOTCH,
          width: NOTCH * 2,
          height: NOTCH * 2,
          borderRadius: "50%",
          background: "#ffffff",
          border: `1.5px solid ${NOTCH_BORDER}`,
          boxSizing: "border-box",
        }}
      />
      {/* Left vertical edge */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: -NOTCH,
          width: 1.5,
          height: NOTCH * 2,
          background: NOTCH_BORDER,
        }}
      />
      {/* Right vertical edge */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: -NOTCH,
          width: 1.5,
          height: NOTCH * 2,
          background: NOTCH_BORDER,
        }}
      />
    </div>
  );
}
