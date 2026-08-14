import { renderSiteIcon } from "@/lib/site-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  // Full-bleed mark — iOS applies its own rounded mask.
  return renderSiteIcon(180, false);
}
