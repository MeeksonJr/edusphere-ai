"use client";

import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
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
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
      <div className="min-h-screen relative overflow-hidden">
        {/* Ambient Background */}
        <AmbientBackground />

        {/* Hero */}
        <section className="pt-32 lg:pt-48 pb-20 relative text-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal direction="up">
              <div className="text-center mb-16 max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-pink-500 mb-8 shadow-lg shadow-cyan-500/20"
                >
                  <Book className="h-10 w-10 text-white" />
                </motion.div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
                  <span className="text-foreground">Documentation</span>
                </h1>
                <p className="text-xl md:text-2xl text-foreground/70 mb-10 leading-relaxed max-w-3xl mx-auto">
                  Learn how to get the most out of EduSphere AI with our comprehensive guides and API reference
                </p>

                {/* Search */}
                <div className="max-w-2xl mx-auto relative z-20">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40" />
                    <Input
                      type="text"
                      placeholder="Search documentation..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-14 glass-surface border-foreground/20 text-foreground placeholder:text-foreground/40 text-lg shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Documentation Sections */}
        <section className="py-12 pb-24 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {docSections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <ScrollReveal
                    key={section.title}
                    direction="up"
                    delay={0.1 * index}
                  >
                    <AnimatedCard variant="3d" delay={0.1 * index} className="h-full group">
                      <div className="p-8 h-full flex flex-col">
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${section.gradient} p-4 mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="h-full w-full text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-cyan-400 transition-colors">
                          {section.title}
                        </h2>
                        <p className="text-foreground/70 mb-8 flex-grow leading-relaxed">
                          {section.description}
                        </p>
                        <ul className="space-y-4">
                          {section.articles.map((article) => (
                            <li key={article.slug}>
                              <Link
                                href={`/documentation/${article.slug}`}
                                className="flex items-center justify-between p-3 rounded-lg bg-foreground/5 hover:bg-cyan-500/10 text-foreground/80 hover:text-cyan-500 transition-all duration-300 group/link"
                              >
                                <span className="font-medium">{article.title}</span>
                                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
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
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <GlassSurface className="p-12 md:p-16 max-w-5xl mx-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32" />

                <div className="relative z-10">
                  <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
                    Need More Help?
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link
                      href="/faq"
                      className="p-6 glass-surface rounded-xl border border-foreground/10 hover:border-cyan-500/30 transition-colors group text-center hover:bg-cyan-500/5"
                    >
                      <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
                        <FileText className="h-6 w-6 text-cyan-500 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">FAQ</h3>
                      <p className="text-foreground/60 text-sm">
                        Find answers to common questions
                      </p>
                    </Link>
                    <Link
                      href="/support"
                      className="p-6 glass-surface rounded-xl border border-foreground/10 hover:border-cyan-500/30 transition-colors group text-center hover:bg-cyan-500/5"
                    >
                      <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
                        <Sparkles className="h-6 w-6 text-cyan-500 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">Support</h3>
                      <p className="text-foreground/60 text-sm">
                        Get help from our support team
                      </p>
                    </Link>
                    <Link
                      href="/contact"
                      className="p-6 glass-surface rounded-xl border border-foreground/10 hover:border-cyan-500/30 transition-colors group text-center hover:bg-cyan-500/5"
                    >
                      <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
                        <Code className="h-6 w-6 text-cyan-500 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">Contact</h3>
                      <p className="text-foreground/60 text-sm">
                        Reach out directly
                      </p>
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
