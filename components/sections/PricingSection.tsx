"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap } from "lucide-react";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    description: "Perfect for trying out EduSphere AI",
    features: [
      "3 courses per month",
      "Browser preview only",
      "Basic templates",
      "Community support",
      "Watermarked videos",
    ],
    limitations: [
      "No MP4 export",
      "Limited customization",
    ],
    cta: "Get Started",
    popular: false,
    gradient: "from-gray-500 to-gray-600",
  },
  {
    name: "Pro",
    price: { monthly: 29, annual: 290 },
    description: "For serious content creators",
    features: [
      "Unlimited courses",
      "MP4 export (1080p)",
      "All templates & styles",
      "Priority support",
      "No watermarks",
      "Custom branding",
      "Analytics dashboard",
      "Batch processing",
    ],
    limitations: [],
    cta: "Start Free Trial",
    popular: true,
    gradient: "from-cyan-500 to-cyan-600",
  },
  {
    name: "Enterprise",
    price: { monthly: 99, annual: 990 },
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Custom integrations",
      "Dedicated support",
      "Advanced analytics",
      "White-label options",
      "API access",
      "Custom SLA",
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false,
    gradient: "from-blue-500 to-blue-600",
  },
];

interface PricingSectionProps {
  showHeader?: boolean;
}

export function PricingSection({ showHeader = true }: PricingSectionProps) {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-20 lg:py-32 relative">
      {showHeader && (
        <ScrollReveal direction="up">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-foreground">Simple, Transparent</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                Pricing
              </span>
            </h2>
            <p className="text-xl text-foreground/70">
              Choose the plan that's right for you. All plans include a free trial.
            </p>
          </div>
        </ScrollReveal>
      )}

      {/* Billing Toggle */}
      <ScrollReveal direction="up" delay={0.2}>
        <div className="flex items-center justify-center mb-12">
          <GlassSurface className="p-1 inline-flex items-center gap-2">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !annual
                  ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-foreground"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                annual
                  ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-foreground"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Annual
              <Badge className="ml-2 bg-green-500 text-white text-xs">Save 17%</Badge>
            </button>
          </GlassSurface>
        </div>
      </ScrollReveal>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {plans.map((plan, index) => (
          <ScrollReveal
            key={plan.name}
            direction="up"
            delay={0.1 * index}
          >
            <AnimatedCard
              variant={plan.popular ? "glow" : "3d"}
              delay={0.1 * index}
              className={`h-full ${plan.popular ? "md:scale-105" : ""}`}
            >
              <div className="p-6 lg:p-8 h-full flex flex-col relative">
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white px-4 py-1">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} p-3 mb-4`}
                  >
                    <Zap className="h-full w-full text-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-foreground/60 text-sm">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-foreground">
                      ${plan.price[annual ? "annual" : "monthly"]}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-foreground/60 ml-2">
                        /{annual ? "year" : "month"}
                      </span>
                    )}
                  </div>
                  {annual && plan.price.monthly > 0 && (
                    <p className="text-foreground/40 text-sm mt-1">
                      ${plan.price.monthly}/month billed annually
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-grow mb-8">
                  {plan.features.map((feature, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * idx }}
                      className="flex items-start space-x-3"
                    >
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-foreground/80 text-sm">{feature}</span>
                    </motion.li>
                  ))}
                  {plan.limitations.map((limit, idx) => (
                    <li
                      key={`limit-${idx}`}
                      className="flex items-start space-x-3 opacity-50"
                    >
                      <span className="text-foreground/40 text-sm line-through">
                        {limit}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.name === "Enterprise" ? "/contact" : "/signup"}
                  className="block mt-auto"
                >
                  <Button
                    size="lg"
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-foreground"
                        : "glass-surface border-foreground/20 hover:border-cyan-500/50 text-foreground"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </AnimatedCard>
          </ScrollReveal>
        ))}
      </div>

      {/* FAQ Link */}
      <ScrollReveal direction="up" delay={0.5}>
        <div className="text-center mt-12">
          <p className="text-foreground/60 mb-4">
            Have questions about pricing?
          </p>
          <Link href="/faq">
            <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300">
              View FAQ
            </Button>
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}

