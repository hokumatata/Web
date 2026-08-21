import type { Metadata } from "next";
import { EconomicCalendar } from "@/components/site/EconomicCalendar";
import { loadCalendarTimeline } from "@/lib/econ-calendar-store";
import { absUrl, SITE_NAME } from "@/lib/seo";

const TITLE = "Forex Economic Calendar Today";
const DESCRIPTION =
  "Forex economic calendar today with upcoming high-impact prints, times, and consensus for FX and macro.";
/** Live URL is www, no trailing slash (a slash 308s to this path). */
const CANONICAL = absUrl("/economic-calendar");

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: CANONICAL,
  },
};
// Must be a literal for Next's static analysis; keep in sync with REVALIDATE_SECONDS.
export const revalidate = 3600;

export default async function EconomicCalendarPage() {
  const calendar = await loadCalendarTimeline();

  return (
    <div className="container-tw py-8">
      <EconomicCalendar calendar={calendar} />
    </div>
  );
}
