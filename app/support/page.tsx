"use client";

import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  BookOpen,
  MessageCircle,
  Mail,
  FileText,
  Video,
  HelpCircle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const helpCategories = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "New to EduSphere AI? Start here.",
    articles: 12,
    gradient: "from-cyan-500 to-cyan-600",
    href: "/faq",
  },
  {
    icon: Video,
    title: "Course Creation",
    description: "Learn how to create amazing courses.",
    articles: 18,
    gradient: "from-blue-500 to-blue-600",
    href: "/faq",
  },
  {
    icon: FileText,
    title: "Account & Billing",
    description: "Manage your subscription and billing.",
    articles: 8,
    gradient: "from-green-500 to-green-600",
    href: "/faq",
  },
  {
    icon: MessageCircle,
    title: "Technical Support",
    description: "Troubleshooting and technical issues.",
    articles: 15,
    gradient: "from-pink-500 to-pink-600",
    href: "/contact",
  },
];

const popularArticles = [
  {
    title: "How to create your first course",
    category: "Getting Started",
    views: "12.5K",
  },
  {
    title: "Exporting videos to different formats",
    category: "Course Creation",
    views: "8.2K",
  },
  {
    title: "Managing your subscription",
    category: "Account & Billing",
    views: "5.7K",
  },
  {
    title: "Troubleshooting video generation issues",
    category: "Technical Support",
    views: "4.9K",
  },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");

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
                  <HelpCircle className="h-10 w-10 text-white" />
                </motion.div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
                  <span className="text-foreground">How Can We</span>{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    Help You?
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-foreground/70 mb-10 leading-relaxed max-w-3xl mx-auto">
                  Find answers to your questions and get the support you need
                </p>

                {/* Search */}
                <div className="max-w-2xl mx-auto relative z-20">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40" />
                    <Input
                      type="text"
                      placeholder="Search for help articles, FAQs, and guides..."
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

        {/* Help Categories */}
        <section className="py-12 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
                Browse by Category
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {helpCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <ScrollReveal
                    key={category.title}
                    direction="up"
                    delay={0.1 * index}
                  >
                    <Link href={category.href}>
                      <AnimatedCard
                        variant="3d"
                        delay={0.1 * index}
                        className="h-full cursor-pointer group"
                      >
                        <div className="p-8 text-center h-full flex flex-col items-center">
                          <div
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.gradient} p-4 mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                          >
                            <Icon className="h-full w-full text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-foreground mb-3">
                            {category.title}
                          </h3>
                          <p className="text-foreground/70 text-sm mb-6 flex-grow leading-relaxed">
                            {category.description}
                          </p>
                          <div className="text-foreground/40 text-xs font-medium mb-4">
                            {category.articles} articles
                          </div>
                          <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
                            <ArrowRight className="h-4 w-4 text-cyan-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </AnimatedCard>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Popular Articles */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal direction="up">
                <h2 className="text-3xl font-bold text-foreground mb-10 text-center md:text-left">
                  Popular Articles
                </h2>
              </ScrollReveal>

              <div className="space-y-4">
                {popularArticles.map((article, index) => (
                  <ScrollReveal
                    key={article.title}
                    direction="up"
                    delay={0.1 * index}
                  >
                    <Link href="/faq">
                      <GlassSurface className="p-6 hover:border-cyan-500/30 transition-all duration-300 group cursor-pointer hover:bg-cyan-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 pr-4">
                            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-cyan-400 transition-colors">
                              {article.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-foreground/50">
                              <span className="font-medium text-foreground/60">{article.category}</span>
                              <span>•</span>
                              <span>{article.views} views</span>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 flex-shrink-0">
                            <ExternalLink className="h-5 w-5 text-cyan-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </GlassSurface>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <GlassSurface className="p-12 md:p-20 text-center max-w-4xl mx-auto relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/10 to-pink-500/10 rounded-full blur-[100px]" />

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/10 mb-8">
                    <MessageCircle className="h-10 w-10 text-cyan-400" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                    Still Need Help?
                  </h2>
                  <p className="text-xl text-foreground/70 mb-10 max-w-2xl mx-auto">
                    Can't find what you're looking for? Our support team is here to help you.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/contact">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-10 py-6 text-lg shadow-lg shadow-cyan-500/25"
                      >
                        <Mail className="mr-2 h-5 w-5" />
                        Contact Support
                      </Button>
                    </Link>
                    <Link href="/faq">
                      <Button
                        size="lg"
                        variant="outline"
                        className="glass-surface border-foreground/20 hover:border-cyan-500/50 text-foreground px-10 py-6 text-lg hover:bg-foreground/5"
                      >
                        View FAQ
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
