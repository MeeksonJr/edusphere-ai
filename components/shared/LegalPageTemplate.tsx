"use client";

import { ReactNode } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface LegalPageTemplateProps {
  title: string;
  icon: LucideIcon;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalPageTemplate({
  title,
  icon: Icon,
  lastUpdated,
  children,
}: LegalPageTemplateProps) {
  return (
    <PublicLayout>
      <div className="min-h-screen relative overflow-hidden">
        {/* Ambient Background */}
        <AmbientBackground variant="subtle" />

        {/* Hero */}
        <section className="pt-32 lg:pt-40 pb-16 relative text-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal direction="up">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-pink-500 mb-8 shadow-lg shadow-cyan-500/20"
                >
                  <Icon className="h-10 w-10 text-white" />
                </motion.div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                  <span className="text-foreground">{title}</span>
                </h1>
                <p className="text-foreground/60 text-sm font-medium uppercase tracking-wider">
                  Last updated: {lastUpdated}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Content */}
        <section className="py-8 pb-32 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal direction="up" delay={0.2}>
                <GlassSurface className="p-8 md:p-12 lg:p-16">
                  <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-li:text-foreground/80">
                    {children}
                  </article>
                </GlassSurface>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
