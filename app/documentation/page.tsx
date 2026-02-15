"use client";

import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { Input } from "@/components/ui/input";
import {
  Book,
  Code,
  FileText,
  Search,
  ArrowRight,
  Video,
  Settings,
  Zap,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const docSections = [
  {
    icon: Zap,
    title: "Getting Started",
    description: "Learn the basics and create your first course",
    articles: [
      { title: "Quick Start Guide", slug: "getting-started/quick-start" },
      { title: "Creating Your First Course", slug: "getting-started/first-course" },
      { title: "Understanding the Interface", slug: "getting-started/interface" },
    ],
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Video,
    title: "Course Creation",
    description: "Master the art of creating engaging courses",
    articles: [
      { title: "Slide Design Best Practices", slug: "course-creation/slide-design" },
      { title: "Adding Narration", slug: "course-creation/narration" },
      { title: "Using Animations", slug: "course-creation/animations" },
    ],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Code,
    title: "API Reference",
    description: "Integrate EduSphere AI with your applications",
    articles: [
      { title: "Authentication", slug: "api/authentication" },
      { title: "Course Generation API", slug: "api/course-generation" },
      { title: "Webhooks", slug: "api/webhooks" },
    ],
    gradient: "from-cyan-500 to-pink-500",
  },
  {
    icon: Settings,
    title: "Advanced Features",
    description: "Explore advanced features and customization",
    articles: [
      { title: "Custom Branding", slug: "advanced/branding" },
      { title: "Export Options", slug: "advanced/export" },
      { title: "Team Collaboration", slug: "advanced/collaboration" },
    ],
    gradient: "from-green-500 to-emerald-500",
  },
];

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");

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
                  <Book className="h-8 w-8 text-foreground" />
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  <span className="text-foreground">Documentation</span>
                </h1>
                <p className="text-xl text-foreground/70 mb-8">
                  Learn how to get the most out of EduSphere AI with our comprehensive guides and API reference
                </p>
              </div>
            </ScrollReveal>

            {/* Search */}
            <ScrollReveal direction="up" delay={0.2}>
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40" />
                  <Input
                    type="text"
                    placeholder="Search documentation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 glass-surface border-foreground/20 text-white placeholder:text-foreground/40"
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Documentation Sections */}
        <section className="py-12 pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {docSections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <ScrollReveal
                    key={section.title}
                    direction="up"
                    delay={0.1 * index}
                  >
                    <AnimatedCard variant="3d" delay={0.1 * index} className="h-full">
                      <div className="p-6 lg:p-8 h-full flex flex-col">
                        <div
                          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${section.gradient} p-3 mb-4`}
                        >
                          <Icon className="h-full w-full text-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                          {section.title}
                        </h2>
                        <p className="text-foreground/60 mb-6 flex-grow">
                          {section.description}
                        </p>
                        <ul className="space-y-3">
                          {section.articles.map((article) => (
                            <li key={article.slug}>
                              <Link
                                href={`/documentation/${article.slug}`}
                                className="flex items-center justify-between text-foreground/70 hover:text-foreground group transition-colors"
                              >
                                <span>{article.title}</span>
                                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </AnimatedCard>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <GlassSurface className="p-8 md:p-12 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Need Help?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Link
                    href="/faq"
                    className="p-4 glass-surface rounded-lg border border-foreground/10 hover:border-cyan-500/30 transition-colors group"
                  >
                    <FileText className="h-6 w-6 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-foreground mb-1">FAQ</h3>
                    <p className="text-foreground/60 text-sm">
                      Find answers to common questions
                    </p>
                  </Link>
                  <Link
                    href="/support"
                    className="p-4 glass-surface rounded-lg border border-foreground/10 hover:border-cyan-500/30 transition-colors group"
                  >
                    <Sparkles className="h-6 w-6 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-foreground mb-1">Support</h3>
                    <p className="text-foreground/60 text-sm">
                      Get help from our support team
                    </p>
                  </Link>
                  <Link
                    href="/contact"
                    className="p-4 glass-surface rounded-lg border border-foreground/10 hover:border-cyan-500/30 transition-colors group"
                  >
                    <Code className="h-6 w-6 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-foreground mb-1">Contact</h3>
                    <p className="text-foreground/60 text-sm">
                      Reach out directly
                    </p>
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
