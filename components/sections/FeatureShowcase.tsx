"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  Video,
  Sparkles,
  Zap,
  Layers,
  Shield,
  Palette,
  Clock,
} from "lucide-react";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

const features = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Generation",
    description:
      "Transform any topic into a comprehensive course structure with AI. Our system understands context and creates engaging content automatically.",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: Video,
    title: "Video Course Creation",
    description:
      "Create professional video courses with animated slides, voiceovers, and captions. All generated automatically from your topic.",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: Sparkles,
    title: "Instant Narration",
    description:
      "High-quality text-to-speech narration in multiple voices. Choose from professional, friendly, or authoritative tones.",
    gradient: "from-pink-500 to-pink-600",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Generate complete courses in minutes, not days. Our optimized pipeline delivers results faster than traditional methods.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Layers,
    title: "Multiple Formats",
    description:
      "Export to YouTube (16:9), TikTok (9:16), or Instagram (1:1). Automatic reformatting ensures perfect sizing for every platform.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your content is encrypted and stored securely. Full control over sharing and privacy settings for all your courses.",
    gradient: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Palette,
    title: "Customizable Styles",
    description:
      "Choose from professional, creative, cinematic, or minimalist styles. Match your brand with custom colors and fonts.",
    gradient: "from-rose-500 to-rose-600",
  },
  {
    icon: Clock,
    title: "Real-Time Preview",
    description:
      "Edit and preview your course in real-time with our browser-based player. See changes instantly without waiting for rendering.",
    gradient: "from-cyan-500 to-teal-500",
  },
];

export function FeatureShowcase() {
  return (
    <section id="features" className="py-20 lg:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Everything You Need to</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Create Amazing Courses
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Powerful features designed to make course creation effortless and enjoyable
            </p>
          </div>
        </ScrollReveal>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal
                key={feature.title}
                direction="up"
                delay={index * 0.1}
              >
                <AnimatedCard
                  variant="3d"
                  delay={index * 0.1}
                  className="h-full cursor-pointer group"
                >
                  <div className="p-6 h-full flex flex-col">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-3 mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-full w-full text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed flex-grow">
                      {feature.description}
                    </p>

                    {/* Hover Indicator */}
                    <div className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </div>
                </AnimatedCard>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

