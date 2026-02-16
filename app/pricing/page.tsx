"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { PricingSection } from "@/components/sections/PricingSection";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Award, Zap, CreditCard } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/shared/AnimatedCard";

const benefits = [
  {
    icon: CheckCircle,
    title: "30-Day Money Back",
    description: "Not satisfied? Get a full refund, no questions asked.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Users,
    title: "Cancel Anytime",
    description: "No long-term contracts. Cancel your subscription whenever you want.",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Award,
    title: "Free Trial",
    description: "Try all premium features free for 14 days. No credit card required.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Zap,
    title: "Priority Support",
    description: "Get faster response times and dedicated support with paid plans.",
    gradient: "from-purple-500 to-pink-500",
  },
];

export default function PricingPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen relative overflow-hidden">
        {/* Ambient Background */}
        <AmbientBackground />

        {/* Hero */}
        <section className="pt-32 lg:pt-48 pb-20 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal direction="up">
              <div className="max-w-4xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-pink-500 mb-8 shadow-lg shadow-cyan-500/20"
                >
                  <CreditCard className="h-10 w-10 text-white" />
                </motion.div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
                  <span className="text-foreground">Simple, Transparent</span>
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    Pricing
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-foreground/70 mb-10 leading-relaxed max-w-3xl mx-auto">
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
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <div className="max-w-4xl mx-auto mb-16 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="text-foreground">Why Choose</span>{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    EduSphere AI?
                  </span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <ScrollReveal
                    key={benefit.title}
                    direction="up"
                    delay={0.1 * index}
                  >
                    <AnimatedCard variant="glow" delay={0.1 * index} className="h-full">
                      <div className="p-8 h-full flex items-start space-x-6">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} p-4 flex-shrink-0 shadow-lg`}>
                          <Icon className="h-full w-full text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-3">
                            {benefit.title}
                          </h3>
                          <p className="text-foreground/70 leading-relaxed text-lg">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </AnimatedCard>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ CTA */}
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <GlassSurface className="p-12 md:p-20 text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Still have questions?
                </h2>
                <p className="text-xl text-foreground/70 mb-10">
                  Check out our FAQ or contact our support team for help choosing the right plan.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/faq">
                    <Button
                      size="lg"
                      variant="outline"
                      className="glass-surface border-foreground/20 hover:border-cyan-500/50 text-foreground px-10 py-6 text-lg hover:bg-foreground/5"
                    >
                      View FAQ
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-10 py-6 text-lg shadow-lg shadow-cyan-500/25"
                    >
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </GlassSurface>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
