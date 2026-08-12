import privacy from "../../content/legal/privacy.md";
import terms from "../../content/legal/terms.md";
import cookies from "../../content/legal/cookies.md";
import disclaimer from "../../content/legal/disclaimer.md";

export type LegalSlug = "privacy" | "terms" | "cookies" | "disclaimer";

const LEGAL_MARKDOWN: Record<LegalSlug, string> = {
  privacy,
  terms,
  cookies,
  disclaimer,
};

export function loadLegalMarkdown(slug: LegalSlug): string {
  return LEGAL_MARKDOWN[slug];
}
