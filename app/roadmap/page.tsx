"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Sparkles, ArrowRight, CircleDashed } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const roadmapItems = [
  {
    quarter: "Q1 2026",
    status: "completed",
    items: [
      {
        title: "Remotion Player Integration",
        description: "Browser-based video preview and editing",
        status: "completed",
      },
      {
        title: "2026 Design System",
        description: "Modern glassmorphism and 3D effects",
        status: "completed",
      },
      {
        title: "AI Course Generation",
        description: "Initial AI-powered course layout generation",
        status: "completed",
      },
    ],
  },
  {
    quarter: "Q2 2026",
    status: "in-progress",
    items: [
      {
        title: "MP4 Export",
        description: "Server-side rendering for video export",
        status: "in-progress",
      },
      {
        title: "Advanced Animations",
        description: "Extended animation library and transitions",
        status: "in-progress",
      },
      {
        title: "Collaborative Editing",
        description: "Real-time collaboration on courses",
        status: "planned",
      },
    ],
  },
  {
    quarter: "Q3 2026",
    status: "planned",
    items: [
      {
        title: "AI Voice Cloning",
        description: "Personalized narration with user voice",
        status: "planned",
      },
      {
        title: "Multi-Language Support",
        description: "Automatic translation and dubbing",
        status: "planned",
      },
      {
        title: "Mobile App",
        description: "iOS and Android apps for course viewing",
        status: "planned",
      },
    ],
  },
  {
    quarter: "Q4 2026",
    status: "planned",
    items: [
      {
        title: "Analytics Dashboard",
        description: "Engagement metrics and course performance",
        status: "planned",
      },
      {
        title: "Marketplace",
        description: "Course marketplace and sharing platform",
        status: "planned",
      },
      {
        title: "LMS Integration",
        description: "Integration with popular learning management systems",
        status: "planned",
      },
    ],
  },
];

export default function RoadmapPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen relative overflow-hidden">
        {/* Ambient Background */}
        <AmbientBackground />

        {/* Hero */}
        <section className="pt-32 lg:pt-48 pb-20 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal direction="up">
              <div className="max-w-3xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-pink-500 mb-8 shadow-lg shadow-cyan-500/20"
                >
                  <Sparkles className="h-10 w-10 text-white" />
                </motion.div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
                  <span className="text-foreground">Product</span>{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    Roadmap
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-foreground/70 mb-10 leading-relaxed max-w-3xl mx-auto">
                  Explore our vision for the future of EduSphere AI and see what
                  exciting features are coming next
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Roadmap Timeline */}
        <section className="py-12 pb-24 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto relative">
              {/* Vertical Line */}
              <div className="absolute left-0 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-pink-500/50 to-transparent hidden md:block" />

              <div className="space-y-16">
                {roadmapItems.map((quarter, quarterIndex) => (
                  <ScrollReveal
                    key={quarter.quarter}
                    direction="up"
                    delay={0.1 * quarterIndex}
                  >
                    <div className="relative pl-0 md:pl-24">
                      {/* Timeline Dot */}
                      <div className="absolute left-6 top-0 w-4 h-4 rounded-full bg-cyan-500 border-4 border-background hidden md:block z-10 shadow-[0_0_10px_rgba(6,182,212,0.5)] transform -translate-x-1/2" />

                      {/* Quarter Header */}
                      <div className="flex items-center mb-8">
                        <Badge
                          className={`text-base px-4 py-1.5 ${quarter.status === "completed"
                              ? "bg-green-500/20 text-green-500 border-green-500/30 hover:bg-green-500/30"
                              : quarter.status === "in-progress"
                                ? "bg-cyan-500/20 text-cyan-500 border-cyan-500/30 hover:bg-cyan-500/30"
                                : "bg-foreground/10 text-foreground/70 border-foreground/20 hover:bg-foreground/20"
                            } backdrop-blur-md`}
                        >
                          {quarter.status === "completed" && (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          {quarter.status === "in-progress" && (
                            <Clock className="h-4 w-4 mr-2 animate-pulse" />
                          )}
                          {quarter.status === "planned" && (
                            <CircleDashed className="h-4 w-4 mr-2" />
                          )}
                          {quarter.quarter}
                        </Badge>
                      </div>

                      {/* Items */}
                      <div className="grid gap-6">
                        {quarter.items.map((item, itemIndex) => (
                          <GlassSurface
                            key={itemIndex}
                            className={`p-6 border-l-4 transition-all duration-300 hover:translate-x-2 ${item.status === "completed"
                                ? "border-green-500"
                                : item.status === "in-progress"
                                  ? "border-cyan-500"
                                  : "border-foreground/20"
                              }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-xl font-bold text-foreground">
                                    {item.title}
                                  </h3>
                                  {item.status === "completed" && (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  )}
                                  {item.status === "in-progress" && (
                                    <Clock className="h-5 w-5 text-cyan-500 animate-pulse" />
                                  )}
                                </div>
                                <p className="text-foreground/70 leading-relaxed text-lg">{item.description}</p>
                              </div>
                            </div>
                          </GlassSurface>
                        ))}
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feedback CTA */}
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <GlassSurface className="p-12 md:p-20 text-center max-w-3xl mx-auto relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/10 to-pink-500/10 rounded-full blur-[100px]" />

                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                    Have Suggestions?
                  </h2>
                  <p className="text-xl text-foreground/70 mb-10 max-w-2xl mx-auto">
                    We'd love to hear your ideas! Your feedback helps shape the future of EduSphere AI.
                  </p>
                  <Link href="/contact">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-10 py-6 text-lg shadow-lg shadow-cyan-500/20"
                    >
                      Share Your Ideas
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
