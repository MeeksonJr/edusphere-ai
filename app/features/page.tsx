"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { FeatureShowcase } from "@/components/sections/FeatureShowcase";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Code, Image } from "lucide-react";
import Link from "next/link";

const useCases = [
  {
    title: "For Educators",
    description:
      "Create engaging supplementary materials, flipped classroom content, and comprehensive course packages.",
    icon: Play,
    gradient: "from-purple-500 to-purple-600",
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
      <div className="min-h-screen">
        {/* Hero */}
        <section className="pt-20 lg:pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal direction="up">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  <span className="text-white">Powerful Features for</span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Modern Learning
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-white/70 mb-8">
                  Discover how EduSphere AI transforms your course creation process 
                  with cutting-edge AI technology and intuitive design.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8"
                    >
                      Start Creating
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/#demo">
                    <Button
                      size="lg"
                      variant="outline"
                      className="glass-surface border-white/20 hover:border-purple-500/50 text-white px-8"
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
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="text-white">Perfect for</span>{" "}
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Every Use Case
                  </span>
                </h2>
                <p className="text-xl text-white/70 max-w-2xl mx-auto">
                  Whether you're teaching, training, or creating content, we've got you covered
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {useCases.map((useCase, index) => {
                const Icon = useCase.icon;
                return (
                  <ScrollReveal
                    key={useCase.title}
                    direction="up"
                    delay={0.1 * index}
                  >
                    <GlassSurface className="p-8 text-center">
                      <div
                        className={`w-16 h-16 rounded-xl bg-gradient-to-br ${useCase.gradient} p-4 mx-auto mb-6`}
                      >
                        <Icon className="h-full w-full text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        {useCase.title}
                      </h3>
                      <p className="text-white/70 leading-relaxed">
                        {useCase.description}
                      </p>
                    </GlassSurface>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <GlassSurface className="p-8 md:p-12 text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-white/70 mb-8">
                  Join thousands of creators already using EduSphere AI to create amazing courses.
                </p>
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-10"
                  >
                    Start Creating Free
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
