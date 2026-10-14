import { ImageResponse } from "next/og";
import { MARK, brand } from "@/config/brand";
import { site } from "@/config/site";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

interface Card {
  /** Large line. */
  title: string;
  /** Smaller line under it. */
  subtitle: string;
  /** Bottom-left detail, e.g. a status. */
  detail: string;
}

/**
 * The shared social preview: brand colours, the dot lattice as a motif, large type.
 * Uses the renderer's built-in sans so the image never depends on a font download.
 */
export function ogCard({ title, subtitle, detail }: Card) {
  const dots = Array.from({ length: 12 * 9 }, (_, i) => i);
  const lit = new Set([16, 39, 44, 67, 82]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ece7dd",
          color: "#1c1b22",
          padding: 72,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 72, right: 72, width: 384, height: 288, display: "flex", flexWrap: "wrap", opacity: 0.9 }}>
          {dots.map((dot) => (
            <div key={dot} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div
                style={{
                  width: lit.has(dot) ? 10 : 4,
                  height: lit.has(dot) ? 10 : 4,
                  borderRadius: 999,
                  background: lit.has(dot) ? "#9f4a34" : "rgba(28,27,34,0.4)",
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", fontSize: 28, letterSpacing: -0.5 }}>
          <svg width={40} height={40} viewBox={MARK.viewBox} style={{ marginRight: 18 }}>
            {MARK.stems.map((stem) => (
              <rect key={stem.x} x={stem.x} y={stem.y} width={stem.width} height={stem.height} fill="#1c1b22" />
            ))}
            {MARK.steps.map((step) => (
              <rect key={step.x} x={step.x} y={step.y} width={step.width} height={step.height} fill={step.fill} />
            ))}
          </svg>
          {brand.name}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: title.length > 22 ? 84 : 112, fontWeight: 800, letterSpacing: -5, lineHeight: 0.92, color: "#2c3b63", maxWidth: 940 }}>
            {title}
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 32, color: "#1c1b22", maxWidth: 880, lineHeight: 1.25 }}>{subtitle}</div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "3px solid #1c1b22",
            paddingTop: 28,
            fontSize: 24,
            color: "#1c1b22",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 12, height: 12, borderRadius: 999, background: "#9f4a34", marginRight: 16 }} />
            {detail}
          </div>
          <div style={{ display: "flex" }}>{site.location}</div>
        </div>
      </div>
    ),
    ogSize,
  );
}
