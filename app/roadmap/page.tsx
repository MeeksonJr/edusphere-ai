"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
      <div className="min-h-screen">
        {/* Hero */}
        <section className="pt-20 lg:pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-background to-background" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal direction="up">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 mb-6">
                  <Sparkles className="h-8 w-8 text-foreground" />
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  <span className="text-foreground">Product</span>{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    Roadmap
                  </span>
                </h1>
                <p className="text-xl text-foreground/70">
                  Explore our vision for the future of EduSphere AI and see what
                  exciting features are coming next
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Roadmap Timeline */}
        <section className="py-12 pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-12">
              {roadmapItems.map((quarter, quarterIndex) => (
                <ScrollReveal
                  key={quarter.quarter}
                  direction="up"
                  delay={0.1 * quarterIndex}
                >
                  <div>
                    {/* Quarter Header */}
                    <div className="flex items-center mb-6">
                      <Badge
                        className={`${
                          quarter.status === "completed"
                            ? "bg-green-500 text-foreground"
                            : quarter.status === "in-progress"
                            ? "bg-blue-500 text-foreground"
                            : "bg-gray-500 text-foreground"
                        }`}
                      >
                        {quarter.status === "completed" && (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {quarter.status === "in-progress" && (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {quarter.quarter}
                      </Badge>
                    </div>

                    {/* Items */}
                    <div className="space-y-4">
                      {quarter.items.map((item, itemIndex) => (
                        <GlassSurface
                          key={itemIndex}
                          className="p-6 border-l-4 border-cyan-500/30"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-xl font-bold text-foreground">
                                  {item.title}
                                </h3>
                                {item.status === "completed" && (
                                  <CheckCircle className="h-5 w-5 text-green-400" />
                                )}
                                {item.status === "in-progress" && (
                                  <Clock className="h-5 w-5 text-blue-400" />
                                )}
                              </div>
                              <p className="text-foreground/70">{item.description}</p>
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
        </section>

        {/* Feedback CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <GlassSurface className="p-8 md:p-12 text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Have Suggestions?
                </h2>
                <p className="text-xl text-foreground/70 mb-8">
                  We'd love to hear your ideas! Your feedback helps shape the future of EduSphere AI.
                </p>
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-8"
                  >
                    Share Your Ideas
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
