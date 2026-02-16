"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { Star, Quote, Verified, Users, BookOpen, ThumbsUp, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Educational Content Creator",
    company: "TechEd Academy",
    avatar: "SC",
    content:
      "EduSphere AI transformed how I create courses. What used to take weeks now takes minutes. The quality is incredible, and my students love the professional narration and animations.",
    rating: 5,
    verified: true,
    image: null,
  },
  {
    name: "Michael Rodriguez",
    role: "University Professor",
    company: "State University",
    avatar: "MR",
    content:
      "As someone who's not tech-savvy, I was amazed at how easy it is to create professional video courses. The AI narration is outstanding, and the ability to customize everything makes it perfect for my needs.",
    rating: 5,
    verified: true,
    image: null,
  },
  {
    name: "Emily Watson",
    role: "Corporate Trainer",
    company: "Global Corp",
    avatar: "EW",
    content:
      "The ability to customize styles and export to different formats saved me so much time. My team loves the results, and I've created 20+ courses in just a few months!",
    rating: 5,
    verified: true,
    image: null,
  },
  {
    name: "David Kim",
    role: "Online Course Creator",
    company: "LearnWithDavid",
    avatar: "DK",
    content:
      "I've tried many course creation tools, but EduSphere AI is by far the best. The AI understands context perfectly and creates engaging content that keeps students hooked.",
    rating: 5,
    verified: true,
    image: null,
  },
  {
    name: "Lisa Anderson",
    role: "Marketing Educator",
    company: "Marketing Pro",
    avatar: "LA",
    content:
      "The real-time preview feature is a game-changer. I can see exactly how my course will look before finalizing, and the editing process is so intuitive.",
    rating: 5,
    verified: true,
    image: null,
  },
  {
    name: "James Wilson",
    role: "Independent Educator",
    company: "Self-Employed",
    avatar: "JW",
    content:
      "As a solo creator, I needed something that could help me scale without hiring a team. EduSphere AI does exactly that. I can now create courses faster than ever.",
    rating: 5,
    verified: true,
    image: null,
  },
];

const stats = [
  { label: "Total Courses Created", value: "12,847", icon: BookOpen },
  { label: "Active Users", value: "5,234", icon: Users },
  { label: "Average Rating", value: "4.9/5", icon: Star },
  { label: "Success Rate", value: "99%", icon: CheckCircle },
];

export default function TestimonialsPage() {
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
                  <ThumbsUp className="h-10 w-10 text-white" />
                </motion.div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
                  <span className="text-foreground">What Our Users</span>{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    Are Saying
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-foreground/70 mb-10 leading-relaxed max-w-3xl mx-auto">
                  Join thousands of creators who are transforming education with AI-powered course creation
                </p>
              </div>
            </ScrollReveal>

            {/* Stats */}
            <ScrollReveal direction="up" delay={0.2}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 max-w-5xl mx-auto">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <GlassSurface className="p-6 text-center h-full flex flex-col items-center justify-center border-t-4 border-cyan-500/50">
                        <div className="p-3 rounded-full bg-cyan-500/10 mb-4">
                          <Icon className="h-8 w-8 text-cyan-500" />
                        </div>
                        <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                          {stat.value}
                        </div>
                        <div className="text-sm font-medium text-foreground/60 uppercase tracking-wider">{stat.label}</div>
                      </GlassSurface>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollReveal>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20 relative z-10">
              {testimonials.map((testimonial, index) => (
                <ScrollReveal
                  key={testimonial.name}
                  direction="up"
                  delay={0.1 * index}
                >
                  <AnimatedCard variant="glow" delay={0.1 * index} className="h-full">
                    <div className="p-8 h-full flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Quote className="h-24 w-24 text-foreground rotate-180" />
                      </div>

                      {/* Rating */}
                      <div className="flex items-center space-x-1 mb-6">
                        {Array.from({ length: testimonial.rating }).map(
                          (_, i) => (
                            <Star
                              key={i}
                              className="h-5 w-5 fill-yellow-400 text-yellow-400"
                            />
                          )
                        )}
                      </div>

                      {/* Content */}
                      <p className="text-foreground/80 mb-8 flex-grow italic leading-relaxed text-lg relative z-10">
                        "{testimonial.content}"
                      </p>

                      {/* Author */}
                      <div className="flex items-center space-x-4 pt-6 border-t border-foreground/10 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {testimonial.avatar}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center space-x-2">
                            <p className="text-foreground font-bold truncate text-base">
                              {testimonial.name}
                            </p>
                            {testimonial.verified && (
                              <Verified className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-foreground/70 text-sm truncate font-medium">
                            {testimonial.role}
                          </p>
                          <p className="text-foreground/50 text-xs truncate">
                            {testimonial.company}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                </ScrollReveal>
              ))}
            </div>

            {/* CTA Section */}
            <ScrollReveal direction="up" delay={0.5}>
              <GlassSurface className="p-12 md:p-20 text-center max-w-4xl mx-auto relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/10 to-pink-500/10 rounded-full blur-[100px]" />

                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                    Ready to Join Them?
                  </h2>
                  <p className="text-xl text-foreground/70 mb-10 max-w-2xl mx-auto">
                    Start creating amazing courses today. No credit card required.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/signup">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-10 py-6 text-lg shadow-lg shadow-cyan-500/20"
                      >
                        Get Started Free
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button
                        size="lg"
                        variant="outline"
                        className="glass-surface border-foreground/20 hover:border-cyan-500/50 text-foreground px-10 py-6 text-lg hover:bg-foreground/5"
                      >
                        View Pricing
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
