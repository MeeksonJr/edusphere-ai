"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Users,
  Globe,
  TrendingUp,
  Heart,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

const cultureValues = [
  {
    icon: Sparkles,
    title: "Innovation First",
    description:
      "We're constantly pushing the boundaries of what's possible in EdTech.",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: Globe,
    title: "Remote-Friendly",
    description:
      "Work from anywhere in the world with our distributed team.",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: TrendingUp,
    title: "Growth Mindset",
    description:
      "We invest in your professional development and learning.",
    gradient: "from-green-500 to-green-600",
  },
];

const benefits = [
  { title: "Competitive Salary", description: "Top-of-market compensation packages" },
  { title: "Health Insurance", description: "Comprehensive health, dental, and vision coverage" },
  { title: "Flexible PTO", description: "Take time off when you need it" },
  { title: "Learning Budget", description: "$2,000/year for courses, conferences, and books" },
  { title: "Remote Work", description: "Work from anywhere in the world" },
  { title: "401(k) Matching", description: "Company matching up to 4%" },
];

const openPositions = [
  {
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "AI/ML Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "Remote",
    type: "Full-time",
  },
];

export default function CareersPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="pt-20 lg:pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal direction="up">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-6">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  <span className="text-white">Join Our</span>{" "}
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Team
                  </span>
                </h1>
                <p className="text-xl text-white/70 mb-8">
                  Help us build the future of education technology
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Culture */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                Our Culture
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {cultureValues.map((value, index) => {
                const Icon = value.icon;
                return (
                  <ScrollReveal
                    key={value.title}
                    direction="up"
                    delay={0.1 * index}
                  >
                    <AnimatedCard variant="3d" delay={0.1 * index}>
                      <div className="p-6 text-center">
                        <div
                          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.gradient} p-3 mx-auto mb-4`}
                        >
                          <Icon className="h-full w-full text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {value.title}
                        </h3>
                        <p className="text-white/70">{value.description}</p>
                      </div>
                    </AnimatedCard>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                Benefits & Perks
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <ScrollReveal
                  key={benefit.title}
                  direction="up"
                  delay={0.05 * index}
                >
                  <GlassSurface className="p-6">
                    <div className="flex items-start space-x-4">
                      <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {benefit.title}
                        </h3>
                        <p className="text-white/70 text-sm">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </GlassSurface>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="py-12 pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                Open Positions
              </h2>
            </ScrollReveal>
            <div className="max-w-4xl mx-auto space-y-4">
              {openPositions.map((position, index) => (
                <ScrollReveal
                  key={position.title}
                  direction="up"
                  delay={0.1 * index}
                >
                  <GlassSurface className="p-6 hover:border-purple-500/30 transition-colors group cursor-pointer">
                    <Link href={`/careers/${position.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                            {position.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-white/60">
                            <span>{position.department}</span>
                            <span>•</span>
                            <span>{position.location}</span>
                            <span>•</span>
                            <span>{position.type}</span>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-white/40 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  </GlassSurface>
                </ScrollReveal>
              ))}
            </div>
            {openPositions.length === 0 && (
              <ScrollReveal direction="up">
                <GlassSurface className="p-12 text-center max-w-2xl mx-auto">
                  <p className="text-white/70 text-lg mb-4">
                    We don't have any open positions at the moment, but we're always looking 
                    for talented people to join our team.
                  </p>
                  <Link href="/contact">
                    <Button
                      variant="outline"
                      className="glass-surface border-white/20 hover:border-purple-500/50 text-white"
                    >
                      Get in Touch
                    </Button>
                  </Link>
                </GlassSurface>
              </ScrollReveal>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <GlassSurface className="p-8 md:p-12 text-center max-w-3xl mx-auto">
                <Heart className="h-16 w-16 text-purple-400 mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Don't See a Role That Fits?
                </h2>
                <p className="text-xl text-white/70 mb-8">
                  We're always looking for exceptional talent. Send us your resume and we'll 
                  keep you in mind for future opportunities.
                </p>
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8"
                  >
                    Send Your Resume
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </GlassSurface>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
