"use client";

import { motion } from "framer-motion";
import {
  RiMagicFill,
  RiVideoFill,
  RiFileTransferFill,
  RiEyeFill,
  RiVoiceprintFill,
  RiBrushFill,
  RiShieldCheckFill,
  RiFlashlightFill,
} from "react-icons/ri";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeader } from "@/components/shared/SectionHeader";

const features = [
  {
    icon: RiMagicFill,
    title: "AI Course Generation",
    description:
      "Transform any topic into a structured, multi-module course with outlines, scripts, slides, and quizzes — all generated in seconds.",
    gradient: "from-purple-500/20 to-purple-600/5",
    border: "hover:border-purple-500/30",
    iconColor: "text-purple-400",
    size: "bento-large",
  },
  {
    icon: RiVideoFill,
    title: "Video Creation",
    description:
      "Automatically produce narrated video lessons with smooth animations, transitions, and professional editing. Export in any format.",
    gradient: "from-cyan-500/20 to-blue-600/5",
    border: "hover:border-cyan-500/30",
    iconColor: "text-cyan-400",
    size: "bento-large",
  },
  {
    icon: RiFileTransferFill,
    title: "Multi-Format Export",
    description: "MP4, PDF, SCORM, and more. Publish anywhere.",
    gradient: "from-amber-500/15 to-amber-600/5",
    border: "hover:border-amber-500/30",
    iconColor: "text-amber-400",
    size: "",
  },
  {
    icon: RiEyeFill,
    title: "Real-time Preview",
    description: "See your course take shape as AI generates each section live.",
    gradient: "from-emerald-500/15 to-emerald-600/5",
    border: "hover:border-emerald-500/30",
    iconColor: "text-emerald-400",
    size: "",
  },
  {
    icon: RiVoiceprintFill,
    title: "AI Narration",
    description: "Natural-sounding voiceovers in 20+ languages and accents.",
    gradient: "from-pink-500/15 to-pink-600/5",
    border: "hover:border-pink-500/30",
    iconColor: "text-pink-400",
    size: "",
  },
  {
    icon: RiBrushFill,
    title: "Custom Styles",
    description: "Brand colors, fonts, logos — make every course uniquely yours.",
    gradient: "from-violet-500/15 to-violet-600/5",
    border: "hover:border-violet-500/30",
    iconColor: "text-violet-400",
    size: "",
  },
  {
    icon: RiShieldCheckFill,
    title: "Enterprise Security",
    description: "SOC 2 ready. GDPR compliant. Your data stays yours.",
    gradient: "from-blue-500/15 to-blue-600/5",
    border: "hover:border-blue-500/30",
    iconColor: "text-blue-400",
    size: "",
  },
  {
    icon: RiFlashlightFill,
    title: "Lightning Fast",
    description: "Generate a full course in under 60 seconds, not weeks.",
    gradient: "from-yellow-500/15 to-yellow-600/5",
    border: "hover:border-yellow-500/30",
    iconColor: "text-yellow-400",
    size: "",
  },
];

export function FeatureShowcase() {
  return (
    <SectionContainer background="pattern">
      <SectionHeader
        badge="Powerful Features"
        title="Everything You Need to"
        titleGradient="Create Amazing Courses"
        subtitle="A complete toolkit for educators, creators, and teams who want to build professional courses without the complexity"
      />

      <div className="bento-grid max-w-6xl mx-auto">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <ScrollReveal
              key={feature.title}
              direction="up"
              delay={index * 0.08}
            >
              <motion.div
                className={`h-full glass-card border-gradient card-hover-glow ${feature.size} ${feature.border} p-6 flex flex-col group cursor-default`}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Gradient background glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl`}
                />

                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4 group-hover:border-white/15 transition-colors`}>
                    <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>

                  <h3 className="text-lg font-bold font-display text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed flex-1">
                    {feature.description}
                  </p>

                  {/* Large cards get extra visual */}
                  {feature.size === "bento-large" && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-xs text-white/30">Included in all plans</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </ScrollReveal>
          );
        })}
      </div>
    </SectionContainer>
  );
}
