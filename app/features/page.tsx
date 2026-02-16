"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { FeatureShowcase } from "@/components/sections/FeatureShowcase";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Code, Image, Sparkles, Zap, Globe } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const useCases = [
  {
    title: "For Educators",
    description:
      "Create engaging supplementary materials, flipped classroom content, and comprehensive course packages.",
    icon: Play,
    gradient: "from-cyan-500 to-cyan-600",
  },
  {
    title: "For Corporate Trainers",
    description:
      "Develop onboarding programs, training modules, and internal knowledge bases efficiently.",
    icon: Code,
    gradient: "from-blue-500 to-blue-600",
  },
  {
    title: "For Content Creators",
    description:
      "Build online course businesses, educational YouTube channels, and monetized learning content.",
    icon: Image,
    gradient: "from-pink-500 to-pink-600",
  },
];

export default function FeaturesPage() {
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
                  <Zap className="h-10 w-10 text-white" />
                </motion.div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
                  <span className="text-foreground">Powerful Features for</span>
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    Modern Learning
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-foreground/70 mb-10 leading-relaxed max-w-3xl mx-auto">
                  Discover how EduSphere AI transforms your course creation process
                  with cutting-edge AI technology and intuitive design.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-10 py-6 text-lg shadow-lg shadow-cyan-500/25"
                    >
                      Start Creating
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/#demo">
                    <Button
                      size="lg"
                      variant="outline"
                      className="glass-surface border-foreground/20 hover:border-cyan-500/50 text-foreground px-10 py-6 text-lg hover:bg-foreground/5"
                    >
                      Watch Demo
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Feature Showcase */}
        <FeatureShowcase />

        {/* Use Cases */}
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="text-foreground">Perfect for</span>{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    Every Use Case
                  </span>
                </h2>
                <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                  Whether you're teaching, training, or creating content, we've got you covered
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {useCases.map((useCase, index) => {
                const Icon = useCase.icon;
                return (
                  <ScrollReveal
                    key={useCase.title}
                    direction="up"
                    delay={0.1 * index}
                  >
                    <AnimatedCard variant="3d" delay={0.1 * index} className="h-full">
                      <div className="p-8 h-full flex flex-col text-center items-center">
                        <div
                          className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${useCase.gradient} p-5 mb-6 shadow-lg`}
                        >
                          <Icon className="h-full w-full text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">
                          {useCase.title}
                        </h3>
                        <p className="text-foreground/70 leading-relaxed text-lg">
                          {useCase.description}
                        </p>
                      </div>
                    </AnimatedCard>
                  </ScrollReveal>
                );
              })}
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
                    <Sparkles className="h-10 w-10 text-cyan-400" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                    Ready to Get Started?
                  </h2>
                  <p className="text-xl text-foreground/70 mb-10 max-w-2xl mx-auto">
                    Join thousands of creators already using EduSphere AI to create amazing courses.
                  </p>
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-10 py-6 text-lg shadow-lg shadow-cyan-500/25"
                    >
                      Start Creating Free
                      <ArrowRight className="ml-2 h-5 w-5" />
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
