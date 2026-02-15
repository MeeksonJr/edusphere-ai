"use client";

import { ReactNode } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { LucideIcon } from "lucide-react";

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
      <div className="min-h-screen">
        {/* Hero */}
        <section className="pt-20 lg:pt-32 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-background to-background" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal direction="up">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 mb-6">
                  <Icon className="h-8 w-8 text-foreground" />
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    {title}
                  </span>
                </h1>
                <p className="text-foreground/60 text-sm">
                  Last updated: {lastUpdated}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <GlassSurface className="p-8 md:p-12">
                <div className="prose prose-invert max-w-none">
                  {children}
                </div>
              </GlassSurface>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

