"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { Star, Quote, Verified } from "lucide-react";
import { motion } from "framer-motion";

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
  { label: "Total Courses Created", value: "12,847", icon: "📚" },
  { label: "Active Users", value: "5,234", icon: "👥" },
  { label: "Average Rating", value: "4.9/5", icon: "⭐" },
  { label: "Success Rate", value: "99%", icon: "✅" },
];

export default function TestimonialsPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <ScrollReveal direction="up">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="text-foreground">What Our Users</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                  Are Saying
                </span>
              </h1>
              <p className="text-xl text-foreground/70">
                Join thousands of creators who are transforming education with AI-powered course creation
              </p>
            </div>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal direction="up" delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <GlassSurface className="p-6 text-center">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-foreground/60">{stat.label}</div>
                  </GlassSurface>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal
                key={testimonial.name}
                direction="up"
                delay={0.1 * index}
              >
                <AnimatedCard variant="glow" delay={0.1 * index}>
                  <div className="p-6 h-full flex flex-col">
                    {/* Quote Icon */}
                    <Quote className="h-8 w-8 text-cyan-400/30 mb-4" />

                    {/* Rating */}
                    <div className="flex items-center space-x-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map(
                        (_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          />
                        )
                      )}
                    </div>

                    {/* Content */}
                    <p className="text-foreground/80 mb-6 flex-grow italic leading-relaxed">
                      "{testimonial.content}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center space-x-3 pt-4 border-t border-foreground/10">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {testimonial.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-white font-semibold truncate">
                            {testimonial.name}
                          </p>
                          {testimonial.verified && (
                            <Verified className="h-4 w-4 text-blue-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-foreground/60 text-sm truncate">
                          {testimonial.role}
                        </p>
                        <p className="text-foreground/40 text-xs truncate">
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
            <GlassSurface className="p-8 md:p-12 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Join Them?
              </h2>
              <p className="text-xl text-foreground/70 mb-8">
                Start creating amazing courses today. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-lg transition-all font-semibold"
                >
                  Get Started Free
                </a>
                <a
                  href="/pricing"
                  className="inline-flex items-center justify-center px-8 py-4 glass-surface border-foreground/20 hover:border-cyan-500/50 text-white rounded-lg transition-all font-semibold"
                >
                  View Pricing
                </a>
              </div>
            </GlassSurface>
          </ScrollReveal>
        </div>
      </div>
    </PublicLayout>
  );
}

