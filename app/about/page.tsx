"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
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
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="pt-20 lg:pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-black to-black" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal direction="up">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 mb-6">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  <span className="text-white">About</span>{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    EduSphere AI
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-white/70 leading-relaxed">
                  We're on a mission to transform education by making it easier than ever 
                  to create professional, engaging courses using the power of AI.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal direction="up">
                <GlassSurface className="p-8 md:p-12">
                  <div className="text-center mb-8">
                    <GraduationCap className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      Our Mission
                    </h2>
                  </div>
                  <p className="text-xl text-white/80 text-center leading-relaxed mb-6">
                    At EduSphere AI, we believe that education should be accessible, engaging, 
                    and efficient. We're building the future of course creation by combining 
                    artificial intelligence with intuitive design.
                  </p>
                  <p className="text-lg text-white/70 text-center leading-relaxed">
                    Whether you're a teacher looking to create supplementary materials, a 
                    corporate trainer developing onboarding programs, or an entrepreneur building 
                    an online course business, we're here to make your journey easier.
                  </p>
                </GlassSurface>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="text-white">Our</span>{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    Values
                  </span>
                </h2>
                <p className="text-xl text-white/70 max-w-2xl mx-auto">
                  The principles that guide everything we do
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <ScrollReveal
                    key={value.title}
                    direction="up"
                    delay={0.1 * index}
                  >
                    <AnimatedCard variant="3d" delay={0.1 * index}>
                      <div className="p-6">
                        <div
                          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.gradient} p-3 mb-4`}
                        >
                          <Icon className="h-full w-full text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">
                          {value.title}
                        </h3>
                        <p className="text-white/70 leading-relaxed">
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
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="text-white">Our</span>{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    Journey
                  </span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="max-w-3xl mx-auto">
              {milestones.map((milestone, index) => (
                <ScrollReveal
                  key={milestone.year}
                  direction={index % 2 === 0 ? "left" : "right"}
                  delay={0.1 * index}
                >
                  <GlassSurface className="p-6 mb-6 relative">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {milestone.year}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {milestone.title}
                        </h3>
                        <p className="text-white/70">{milestone.description}</p>
                      </div>
                    </div>
                  </GlassSurface>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <GlassSurface className="p-8 md:p-12 text-center max-w-3xl mx-auto">
                <Award className="h-16 w-16 text-cyan-400 mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Join Us on This Journey
                </h2>
                <p className="text-xl text-white/70 mb-8">
                  Ready to transform the way you create educational content? 
                  Join thousands of creators already using EduSphere AI.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-8"
                    >
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      size="lg"
                      variant="outline"
                      className="glass-surface border-white/20 hover:border-cyan-500/50 text-white px-8"
                    >
                      Contact Us
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
