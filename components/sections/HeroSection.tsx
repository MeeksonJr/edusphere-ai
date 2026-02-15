"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Shield, CreditCard, Clock } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-20 lg:pt-24 pb-16">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/40 via-background to-background dark:from-cyan-900/20 dark:via-background dark:to-background" />
        <div className="absolute inset-0 mesh-gradient-bg" />
        <div className="absolute inset-0 grid-pattern-dense opacity-40" />
      </div>

      {/* Animated Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px] animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/8 blur-[100px] animate-float-gentle" />
      <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full bg-pink-500/6 blur-[80px] animate-float-slow" style={{ animationDelay: "3s" }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 glass-surface px-5 py-2 rounded-full mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-foreground/70 font-medium">
              Trusted by 5,000+ educators worldwide
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[0.9] tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <span className="text-foreground block">Create Courses</span>
            <span className="text-gradient-brand block mt-2">
              10x Faster with AI
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="text-lg md:text-xl text-foreground/55 mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            Transform any topic into a professional, narrated video course in minutes.
            Powered by AI, perfected by design.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="glow-button group bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white border-0 shadow-lg shadow-cyan-500/20 px-8 py-7 text-lg rounded-xl"
              >
                Start Creating Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button
                size="lg"
                variant="outline"
                className="glass-surface border-foreground/15 hover:border-foreground/30 text-foreground px-8 py-7 text-lg rounded-xl backdrop-blur-md group"
              >
                <Play className="mr-2 h-5 w-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                Watch Demo
              </Button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-foreground/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-400/70" />
              Secure & private
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-emerald-400/70" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-400/70" />
              2-minute setup
            </span>
          </motion.div>

          {/* Hero Product Mockup */}
          <motion.div
            className="mt-16 mx-auto max-w-4xl"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="relative rounded-xl overflow-hidden border border-foreground/10 shadow-2xl shadow-cyan-500/10">
              {/* Browser Chrome */}
              <div className="bg-muted/50 dark:bg-foreground/[0.03] border-b border-foreground/10 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-foreground/10" />
                  <div className="w-3 h-3 rounded-full bg-foreground/10" />
                  <div className="w-3 h-3 rounded-full bg-foreground/10" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="glass-surface rounded-md h-7 max-w-md mx-auto flex items-center px-3">
                    <span className="text-xs text-foreground/30">app.edusphere.ai/courses/create</span>
                  </div>
                </div>
              </div>

              {/* Mockup Content */}
              <div className="bg-background/80 p-6 md:p-8 min-h-[300px] md:min-h-[400px]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {/* Left panel - Course outline */}
                  <div className="glass-surface p-4 rounded-lg">
                    <div className="text-xs text-foreground/40 mb-3 font-medium uppercase tracking-wider">Course Outline</div>
                    {["Introduction to AI", "Neural Networks Basics", "Deep Learning", "Practical Applications"].map((item, i) => (
                      <div key={item} className="flex items-center gap-2 py-2 border-b border-foreground/5 last:border-0">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-cyan-500 text-white' : 'bg-foreground/10 text-foreground/40'}`}>
                          {i + 1}
                        </div>
                        <span className={`text-sm ${i === 0 ? 'text-foreground font-semibold' : 'text-foreground/50'}`}>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Center panel - Preview */}
                  <div className="md:col-span-2 glass-surface p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xs text-foreground/40 font-medium uppercase tracking-wider">Slide Preview</div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs text-emerald-400/80">Generating...</span>
                      </div>
                    </div>
                    <div className="aspect-video rounded-lg bg-gradient-to-br from-cyan-600/20 via-background to-cyan-600/10 flex items-center justify-center border border-foreground/5">
                      <div className="text-center">
                        <div className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">Introduction to AI</div>
                        <div className="text-sm text-foreground/50">Module 1 of 4</div>
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <div className="h-1 w-16 rounded-full bg-cyan-500" />
                          <div className="h-1 w-16 rounded-full bg-foreground/10" />
                          <div className="h-1 w-16 rounded-full bg-foreground/10" />
                          <div className="h-1 w-16 rounded-full bg-foreground/10" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow effect under mockup */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-cyan-500/20 blur-[60px] rounded-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
