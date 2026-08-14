import { ImageResponse } from "next/og";

/** Light-theme accent from `globals.css` — same FR square as the site header. */
export const SITE_ACCENT = "#e65100";
export const SITE_ACCENT_SOFT = "#ff8f00";

export function renderSiteIcon(size: number, rounded = true): ImageResponse {
  const radius = rounded ? Math.round(size * 0.22) : 0;
  const fontSize = Math.round(size * 0.42);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(180deg, ${SITE_ACCENT_SOFT}, ${SITE_ACCENT})`,
          borderRadius: radius,
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#ffffff",
            fontSize,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          FR
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
