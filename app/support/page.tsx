"use client";

import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { GlassSurface } from "@/components/shared/GlassSurface";
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
      <div className="min-h-screen">
        {/* Hero */}
        <section className="pt-20 lg:pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-background to-background" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal direction="up">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 mb-6">
                  <HelpCircle className="h-8 w-8 text-foreground" />
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  <span className="text-foreground">How Can We</span>
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    Help You?
                  </span>
                </h1>
                <p className="text-xl text-foreground/70 mb-8">
                  Find answers to your questions and get the support you need
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
                    placeholder="Search for help articles, FAQs, and guides..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 glass-surface border-foreground/20 text-white placeholder:text-foreground/40 text-lg"
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Help Categories */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
                Browse by Category
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        <div className="p-6 text-center h-full flex flex-col">
                          <div
                            className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.gradient} p-4 mx-auto mb-4 group-hover:scale-110 transition-transform`}
                          >
                            <Icon className="h-full w-full text-foreground" />
                          </div>
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            {category.title}
                          </h3>
                          <p className="text-foreground/60 text-sm mb-4 flex-grow">
                            {category.description}
                          </p>
                          <div className="text-foreground/40 text-xs">
                            {category.articles} articles
                          </div>
                          <ArrowRight className="h-5 w-5 text-cyan-400 mx-auto mt-4 group-hover:translate-x-1 transition-transform" />
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
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal direction="up">
                <h2 className="text-3xl font-bold text-foreground mb-8">
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
                    <GlassSurface className="p-6 hover:border-cyan-500/30 transition-colors group cursor-pointer">
                      <Link href="/faq" className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-cyan-400 transition-colors">
                            {article.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-foreground/50">
                            <span>{article.category}</span>
                            <span>•</span>
                            <span>{article.views} views</span>
                          </div>
                        </div>
                        <ExternalLink className="h-5 w-5 text-foreground/40 group-hover:text-cyan-400 transition-colors ml-4" />
                      </Link>
                    </GlassSurface>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <GlassSurface className="p-8 md:p-12 text-center max-w-3xl mx-auto">
                <MessageCircle className="h-16 w-16 text-cyan-400 mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Still Need Help?
                </h2>
                <p className="text-xl text-foreground/70 mb-8">
                  Can't find what you're looking for? Our support team is here to help you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-8"
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      Contact Support
                    </Button>
                  </Link>
                  <Link href="/faq">
                    <Button
                      size="lg"
                      variant="outline"
                      className="glass-surface border-foreground/20 hover:border-cyan-500/50 text-white px-8"
                    >
                      View FAQ
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
