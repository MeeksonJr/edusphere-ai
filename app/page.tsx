"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { LogosBar } from "@/components/sections/LogosBar";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FeatureShowcase } from "@/components/sections/FeatureShowcase";
import { InteractiveDemo } from "@/components/sections/InteractiveDemo";
import { SocialProof } from "@/components/sections/SocialProof";
import { ComparisonSection } from "@/components/sections/ComparisonSection";
import { CTASection } from "@/components/sections/CTASection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <LogosBar />
        <HowItWorks />
        <FeatureShowcase />
        <InteractiveDemo />
        <SocialProof />
        <ComparisonSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
