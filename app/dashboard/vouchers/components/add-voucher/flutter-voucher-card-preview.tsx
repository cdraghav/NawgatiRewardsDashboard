"use client";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "900"] });

interface FlutterVoucherCardPreviewProps {
  brandName: string;
  brandColor: string;
  logoUrl: string | null;
  coverUrl: string | null;
  bannerUrl: string | null;
  discountPercentage: number;
  redemptionTypes: string[];
  defaultAmount: number;
}

const NOTCH_BORDER = "rgba(9, 13, 1, 0.035)";

export function FlutterVoucherCardPreview({
  brandName,
  brandColor,
  logoUrl,
  coverUrl,
  bannerUrl,
  discountPercentage,
  redemptionTypes,
  defaultAmount,
}: FlutterVoucherCardPreviewProps) {
  const discounted = Math.round(defaultAmount * (1 - discountPercentage / 100));
  const coins = Math.round((defaultAmount * discountPercentage) / 100);

  const sortedTypes = [...redemptionTypes].sort((a, b) => b.localeCompare(a));

  return (
    <div
      className={inter.className}
      style={{ width: "100%", maxWidth: 290, margin: "0 auto", paddingTop: 16 }}
    >
      <div style={{ position: "relative" }}>
        {/* Voucher body — colored frame, edge-to-edge of card */}
        <div
          style={{
            position: "relative",
            borderRadius: 16,
            overflow: "hidden",
            background: brandColor,
          }}
        >
          {/* Pattern overlay — multiplied against brand color so both show */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url(/voucher_pattern.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              mixBlendMode: "multiply",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          {/* Upper section (logo) — Figma spec: aspect 1.5:1; image fills full container (logo already has its own padding baked in) */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              aspectRatio: "1.5 / 1",
              background: "transparent",
              overflow: "hidden",
            }}
          >
            {logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={logoUrl}
                alt={brandName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            ) : null}
          </div>

          {/* Dotted divider */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <DottedDivider bgColor={brandColor} />
          </div>

          {/* Feature image — Figma spec: aspect 1.7:1, full-bleed (no internal padding) */}
          {coverUrl ? (
            <div
              style={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                aspectRatio: "1.7 / 1",
                overflow: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverUrl}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          ) : null}
        </div>

        {/* Discount tag (popping out top-left, -8px) */}
        {discountPercentage > 0 ? (
          <div
            style={{
              position: "absolute",
              top: -10,
              left: 20,
              zIndex: 30,
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                boxShadow: "-1.954px 5.863px 7.817px rgba(0,0,0,0.24)",
                borderRadius: "0 0 8px 8px",
              }}
            >
              <div
                style={{
                  padding: 3,
                  background: "linear-gradient(to bottom, #6dbdff, #1093ff)",
                  borderRadius: "0 0 8px 8px",
                }}
              >
                {/* Dashed-border layer (left/right/bottom only) */}
                <div
                  style={{
                    padding: "0 3px 3px 3px",
                    borderLeft: "1.5px dashed rgba(255,255,255,0.6)",
                    borderRight: "1.5px dashed rgba(255,255,255,0.6)",
                    borderBottom: "1.5px dashed rgba(255,255,255,0.6)",
                    borderRadius: "0 0 8px 8px",
                  }}
                >
                  <div
                    style={{
                      paddingTop: 12,
                      background: "linear-gradient(to bottom, #6dbdff, #1093ff)",
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
                        color: "#ffffff",
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
                width: 9,
                height: 10,
                background: "#1093ff",
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
              zIndex: 25,
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

      {/* Banner — horizontal black card with image centered at its natural size */}
      {bannerUrl ? (
        <div style={{ marginTop: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#6E7781",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 6,
            }}
          >
            Banner (detail view)
          </div>
          <div
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              borderRadius: 8,
              overflow: "hidden",
              background: "#000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 12,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bannerUrl}
              alt="Banner"
              style={{
                display: "block",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DottedDivider({ bgColor: _bgColor }: { bgColor: string }) {
  const NOTCH = 8;
  const DASH_HEIGHT = 2;
  return (
    // Strip is intentionally transparent so the parent's pattern overlay
    // shows through this 8px region — otherwise you get a band of solid
    // brand colour right below the dashed line.
    <div
      style={{
        position: "relative",
        width: "100%",
        height: NOTCH,
        background: "transparent",
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
