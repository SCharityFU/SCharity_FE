"use client";

import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { FeaturedCampaignsSection } from "@/components/home/FeaturedCampaignsSection";
import { CTABanner } from "@/components/home/CTABanner";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      {/* <HowItWorksSection /> */}
      <FeaturedCampaignsSection />
      <CTABanner />
    </div>
  );
}
