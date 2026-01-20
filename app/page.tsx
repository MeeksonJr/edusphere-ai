"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { HeroSection } from "@/components/sections/HeroSection";
import { InteractiveDemo } from "@/components/sections/InteractiveDemo";
import { FeatureShowcase } from "@/components/sections/FeatureShowcase";
import { SocialProof } from "@/components/sections/SocialProof";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <PublicLayout navbarVariant="transparent">
      {/* Hero Section */}
      <HeroSection />

      {/* Interactive Demo Section */}
      <InteractiveDemo />

      {/* Features Section */}
      <FeatureShowcase />

      {/* Social Proof Section */}
      <SocialProof />

      {/* CTA Section */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-black" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal direction="up">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-white">Ready to Create</span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Your First Course?
                </span>
              </h2>
              <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                Join thousands of creators already using EduSphere AI to create amazing educational content. 
                Start for free, no credit card required.
              </p>

              {/* Feature List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
                {[
                  "No credit card required",
                  "Free tier available",
                  "Cancel anytime",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center justify-center space-x-2 text-white/80"
                  >
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="group bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-purple-500/25 px-10 py-7 text-lg"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="glass-surface border-white/20 hover:border-white/40 text-white px-10 py-7 text-lg backdrop-blur-md"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <p className="text-white/50 text-sm">
                  Trusted by educators, creators, and professionals worldwide
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PublicLayout>
  );
}
