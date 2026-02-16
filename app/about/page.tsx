"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Users,
  Award,
  Lightbulb,
  GraduationCap,
  Target,
  Heart,
  Sparkles,
  ArrowRight,
  Globe,
  Zap,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";

const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We constantly push the boundaries of what's possible with AI, bringing cutting-edge technology to education.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Heart,
    title: "Empowerment",
    description:
      "We believe education should be accessible to everyone. Our tools empower educators and learners worldwide.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Target,
    title: "Excellence",
    description:
      "We strive for excellence in everything we do, from product design to customer support.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "We build strong communities of educators, creators, and learners who support and inspire each other.",
    gradient: "from-cyan-500 to-indigo-500",
  },
];

const milestones = [
  {
    year: "2024",
    title: "Launch",
    description: "EduSphere AI was founded with a vision to democratize education.",
  },
  {
    year: "2025",
    title: "10K Users",
    description: "Reached 10,000 active users creating amazing courses.",
  },
  {
    year: "2026",
    title: "AI Innovation",
    description: "Launched advanced AI course generation with Remotion integration.",
  },
];

const stats = [
  { label: "Active Users", value: 50000, suffix: "+", icon: Users },
  { label: "Courses Created", value: 120000, suffix: "+", icon: GraduationCap },
  { label: "Countries", value: 150, suffix: "+", icon: Globe },
  { label: "Hours Saved", value: 1000000, suffix: "+", icon: Zap },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen relative overflow-hidden">
        {/* Ambient Background for entire page */}
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
                  <Sparkles className="h-10 w-10 text-white" />
                </motion.div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
                  <span className="text-foreground">About</span>{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    EduSphere AI
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-foreground/70 leading-relaxed max-w-3xl mx-auto">
                  We're on a mission to transform education by making it easier than ever
                  to create professional, engaging courses using the power of AI.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-foreground/5 bg-muted/30 relative z-10 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <ScrollReveal key={stat.label} direction="up" delay={index * 0.1}>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500/10 mb-4">
                        <Icon className="h-6 w-6 text-cyan-500" />
                      </div>
                      <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        <AnimatedCounter target={stat.value} suffix={stat.suffix} duration={2.5} />
                      </div>
                      <div className="text-foreground/60 font-medium">{stat.label}</div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal direction="up">
                <GlassSurface className="p-8 md:p-16 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -ml-32 -mb-32" />

                  <div className="relative z-10 text-center">
                    <GraduationCap className="h-16 w-16 text-cyan-400 mx-auto mb-6" />
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                      Our Mission
                    </h2>
                    <p className="text-xl text-foreground/80 leading-relaxed mb-8">
                      At EduSphere AI, we believe that education should be accessible, engaging,
                      and efficient. We're building the future of course creation by combining
                      artificial intelligence with intuitive design.
                    </p>
                    <p className="text-lg text-foreground/70 leading-relaxed">
                      Whether you're a teacher looking to create supplementary materials, a
                      corporate trainer developing onboarding programs, or an entrepreneur building
                      an online course business, we're here to make your journey easier.
                    </p>
                  </div>
                </GlassSurface>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="text-foreground">Our</span>{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    Values
                  </span>
                </h2>
                <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                  The principles that guide everything we do
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <ScrollReveal
                    key={value.title}
                    direction="up"
                    delay={0.1 * index}
                  >
                    <AnimatedCard variant="glow" delay={0.1 * index} className="h-full">
                      <div className="p-8 h-full flex flex-col items-center text-center">
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.gradient} p-4 mb-6 shadow-lg`}
                        >
                          <Icon className="h-full w-full text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">
                          {value.title}
                        </h3>
                        <p className="text-foreground/70 leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </AnimatedCard>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="text-foreground">Our</span>{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    Journey
                  </span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="max-w-3xl mx-auto relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[39px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-cyan-500 via-pink-500 to-transparent opacity-30" />

              {milestones.map((milestone, index) => (
                <ScrollReveal
                  key={milestone.year}
                  direction="left"
                  delay={0.1 * index}
                >
                  <div className="relative pl-24 mb-12 last:mb-0">
                    <div className="absolute left-0 top-0 w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 p-[2px] shadow-lg shadow-cyan-500/20 z-10">
                      <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                        <span className="text-lg font-bold bg-gradient-to-br from-cyan-500 to-pink-500 bg-clip-text text-transparent">
                          {milestone.year}
                        </span>
                      </div>
                    </div>

                    <GlassSurface className="p-8 relative hover:border-cyan-500/30 transition-colors">
                      <h3 className="text-2xl font-bold text-foreground mb-3">
                        {milestone.title}
                      </h3>
                      <p className="text-foreground/70 text-lg leading-relaxed">
                        {milestone.description}
                      </p>
                    </GlassSurface>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <GlassSurface className="p-12 md:p-20 text-center max-w-4xl mx-auto relative overflow-hidden">
                {/* Ambient glow behind CTA */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/20 to-pink-500/20 rounded-full blur-[100px]" />

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/10 mb-8">
                    <Award className="h-10 w-10 text-cyan-400" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                    Join Us on This Journey
                  </h2>
                  <p className="text-xl text-foreground/70 mb-10 max-w-2xl mx-auto">
                    Ready to transform the way you create educational content?
                    Join thousands of creators already using EduSphere AI.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/signup">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-10 py-6 text-lg shadow-lg shadow-cyan-500/25"
                      >
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button
                        size="lg"
                        variant="outline"
                        className="glass-surface border-foreground/20 hover:border-cyan-500/50 text-foreground px-10 py-6 text-lg hover:bg-foreground/5"
                      >
                        Contact Us
                      </Button>
                    </Link>
                  </div>
                </div>
              </GlassSurface>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
