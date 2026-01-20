"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { PricingSection } from "@/components/sections/PricingSection";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { motion } from "framer-motion";
import { CheckCircle, Users, Award, Zap } from "lucide-react";

const benefits = [
  {
    icon: CheckCircle,
    title: "30-Day Money Back",
    description: "Not satisfied? Get a full refund, no questions asked.",
  },
  {
    icon: Users,
    title: "Cancel Anytime",
    description: "No long-term contracts. Cancel your subscription whenever you want.",
  },
  {
    icon: Award,
    title: "Free Trial",
    description: "Try all premium features free for 14 days. No credit card required.",
  },
  {
    icon: Zap,
    title: "Priority Support",
    description: "Get faster response times and dedicated support with paid plans.",
  },
];

export default function PricingPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="pt-20 lg:pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal direction="up">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  <span className="text-white">Simple, Transparent</span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Pricing
                  </span>
              </h1>
                <p className="text-xl text-white/70 mb-8">
                  Choose the plan that's right for you. All plans include a free trial, 
                  and you can upgrade or downgrade at any time.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Pricing Cards */}
        <PricingSection showHeader={false} />

        {/* Benefits */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                  <span className="text-white">Why Choose</span>{" "}
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    EduSphere AI?
                    </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {benefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <ScrollReveal
                        key={benefit.title}
                        direction="up"
                        delay={0.1 * index}
                      >
                        <GlassSurface className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 flex-shrink-0">
                              <Icon className="h-full w-full text-white" />
            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-white mb-2">
                                {benefit.title}
                              </h3>
                              <p className="text-white/70">{benefit.description}</p>
              </div>
            </div>
                        </GlassSurface>
                      </ScrollReveal>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* FAQ CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <GlassSurface className="p-8 md:p-12 text-center max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Still have questions?
              </h2>
                <p className="text-white/70 mb-6">
                  Check out our FAQ or contact our support team for help choosing the right plan.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/faq"
                    className="inline-flex items-center justify-center px-6 py-3 glass-surface border-white/20 hover:border-purple-500/50 text-white rounded-lg transition-all"
                  >
                    View FAQ
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all"
                  >
                    Contact Support
                  </a>
            </div>
              </GlassSurface>
            </ScrollReveal>
          </div>
        </section>
          </div>
    </PublicLayout>
  );
}
