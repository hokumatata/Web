import { EconomicCalendar } from "@/components/site/EconomicCalendar";
import { fetchEconCalendar } from "@/lib/econ-calendar";

export const metadata = { title: "Economic Calendar" };
// Must be a literal for Next's static analysis; keep in sync with REVALIDATE_SECONDS.
export const revalidate = 3600;

export default async function EconomicCalendarPage() {
  const calendar = await fetchEconCalendar();

  return (
    <div className="container-tw py-8">
      <EconomicCalendar calendar={calendar} />
    </div>
  );
}
