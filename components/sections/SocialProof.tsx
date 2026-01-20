"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AnimatedCard } from "@/components/shared/AnimatedCard";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Educational Content Creator",
    avatar: "SC",
    content:
      "EduSphere AI transformed how I create courses. What used to take weeks now takes minutes. The quality is incredible!",
    rating: 5,
  },
  {
    name: "Michael Rodriguez",
    role: "University Professor",
    avatar: "MR",
    content:
      "As someone who's not tech-savvy, I was amazed at how easy it is to create professional video courses. The AI narration is outstanding.",
    rating: 5,
  },
  {
    name: "Emily Watson",
    role: "Corporate Trainer",
    avatar: "EW",
    content:
      "The ability to customize styles and export to different formats saved me so much time. My team loves the results!",
    rating: 5,
  },
];

const recentCourses = [
  { topic: "Machine Learning Basics", time: "2 min ago" },
  { topic: "Web Development Masterclass", time: "5 min ago" },
  { topic: "Digital Marketing Strategy", time: "8 min ago" },
  { topic: "Python for Beginners", time: "12 min ago" },
];

export function SocialProof() {
  return (
    <section id="testimonials" className="py-20 lg:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Trusted by</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Creators Worldwide
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Join thousands of educators, creators, and professionals creating amazing courses
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Testimonials */}
          <div className="space-y-6">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal
                key={testimonial.name}
                direction="left"
                delay={index * 0.15}
              >
                <AnimatedCard variant="glow" delay={index * 0.15}>
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {testimonial.avatar}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-1 mb-2">
                          {Array.from({ length: testimonial.rating }).map(
                            (_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 fill-yellow-400 text-yellow-400"
                              />
                            )
                          )}
                        </div>
                        <p className="text-white/80 mb-3 italic">
                          "{testimonial.content}"
                        </p>
                        <div>
                          <p className="text-white font-semibold">
                            {testimonial.name}
                          </p>
                          <p className="text-white/60 text-sm">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>

                      {/* Quote Icon */}
                      <Quote className="h-8 w-8 text-purple-400/30 flex-shrink-0" />
                    </div>
                  </div>
                </AnimatedCard>
              </ScrollReveal>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <ScrollReveal direction="right">
              <div className="glass-surface p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Recently Generated
                </h3>
                <div className="space-y-4">
                  {recentCourses.map((course, index) => (
                    <motion.div
                      key={course.topic}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                      className="flex items-center justify-between p-4 glass-surface rounded-lg border border-white/10 hover:border-purple-500/30 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {course.topic}
                        </p>
                        <p className="text-white/50 text-sm">
                          {course.time}
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-white/60 text-sm text-center">
                    <span className="text-purple-400 font-semibold">
                      10K+ courses
                    </span>{" "}
                    created this month
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Stats */}
            <ScrollReveal direction="right" delay={0.3}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Active Users", value: "5,234" },
                  { label: "Courses Created", value: "12,847" },
                  { label: "Total Views", value: "2.1M" },
                  { label: "Avg. Rating", value: "4.9/5" },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    className="glass-surface p-6 rounded-xl text-center"
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <div className="text-3xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

