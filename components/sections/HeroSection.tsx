"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 lg:pt-32 pb-20">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black" />
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => {
          const randomX = typeof window !== "undefined" ? Math.random() * window.innerWidth : Math.random() * 1920;
          const randomY = typeof window !== "undefined" ? Math.random() * window.innerHeight : Math.random() * 1080;
          return (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-500/30 rounded-full blur-sm"
              initial={{
                x: randomX,
                y: randomY,
                opacity: 0,
              }}
              animate={{
                y: [null, -100, -200],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          );
        })}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <ScrollReveal direction="down" delay={0.1}>
            <motion.div
              className="inline-flex items-center space-x-2 glass-surface px-4 py-2 rounded-full mb-8"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-white/80">
                AI-Powered Course Generation
              </span>
              <Zap className="h-4 w-4 text-yellow-400" />
            </motion.div>
          </ScrollReveal>

          {/* Main Heading */}
          <ScrollReveal direction="up" delay={0.2}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent animate-pulse">
                Create Stunning
              </span>
              <br />
              <span className="text-white">Educational Courses</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                With AI Magic
              </span>
            </h1>
          </ScrollReveal>

          {/* Subheading */}
          <ScrollReveal direction="up" delay={0.3}>
            <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform any topic into a professional, narrated video course in minutes. 
              Powered by AI, perfected by design. 
              <span className="text-purple-400 font-semibold"> Zero coding required.</span>
            </p>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal direction="up" delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="group bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-purple-500/25 px-8 py-6 text-lg"
                >
                  Start Creating Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="glass-surface border-white/20 hover:border-white/40 text-white px-8 py-6 text-lg backdrop-blur-md"
                >
                  Watch Demo
                </Button>
              </Link>
            </div>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal direction="up" delay={0.5}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { label: "Courses Created", value: "10K+", icon: TrendingUp },
                { label: "Active Users", value: "5K+", icon: Sparkles },
                { label: "Success Rate", value: "99%", icon: Zap },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    className="glass-surface p-6 rounded-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Icon className="h-8 w-8 text-purple-400 mb-3 mx-auto" />
                    <div className="text-3xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

