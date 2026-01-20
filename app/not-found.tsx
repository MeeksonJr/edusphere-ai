"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";

export default function NotFound() {
  return (
    <PublicLayout navbarVariant="default" showFooter={true}>
      <div className="min-h-[80vh] flex items-center justify-center py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Animated 404 */}
          <ScrollReveal direction="up">
            <motion.div
              className="mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent mb-4">
                404
              </h1>
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Sparkles className="h-6 w-6 text-purple-400 animate-pulse" />
                <p className="text-2xl md:text-3xl font-semibold text-white">
                  Page Not Found
                </p>
                <Sparkles className="h-6 w-6 text-purple-400 animate-pulse" />
              </div>
            </motion.div>
          </ScrollReveal>

          {/* Message */}
          <ScrollReveal direction="up" delay={0.2}>
            <GlassSurface className="p-8 mb-8">
              <p className="text-xl text-white/70 mb-6">
                Oops! The page you're looking for doesn't exist or has been moved.
              </p>
              <p className="text-white/50">
                Don't worry, let's get you back on track.
              </p>
            </GlassSurface>
          </ScrollReveal>

          {/* Quick Links */}
          <ScrollReveal direction="up" delay={0.3}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <Link href="/">
                <Button
                  size="lg"
                  className="w-full glass-surface border-white/20 hover:border-purple-500/50 text-white group"
                >
                  <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Go Home
                </Button>
              </Link>
              <Link href="/blog">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full glass-surface border-white/20 hover:border-purple-500/50 text-white group"
                >
                  <Search className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Browse Blog
                </Button>
              </Link>
            </div>
          </ScrollReveal>

          {/* Popular Links */}
          <ScrollReveal direction="up" delay={0.4}>
            <GlassSurface className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Popular Pages
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { href: "/features", label: "Features" },
                  { href: "/pricing", label: "Pricing" },
                  { href: "/about", label: "About" },
                  { href: "/contact", label: "Contact" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white hover:translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </GlassSurface>
          </ScrollReveal>

          {/* Back Button */}
          <ScrollReveal direction="up" delay={0.5}>
            <div className="mt-8">
              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="text-white/60 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </PublicLayout>
  );
}

