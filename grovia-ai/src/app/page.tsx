import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { AiTeam } from "@/components/sections/AiTeam";
import { Industries } from "@/components/sections/Industries";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { CtaBand } from "@/components/sections/CtaBand";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <HowItWorks />
      <AiTeam />
      <Industries />
      <Testimonials />
      <Faq />
      <CtaBand />
    </>
  );
}
