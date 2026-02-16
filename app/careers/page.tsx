"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Users,
  Globe,
  TrendingUp,
  Heart,
  Sparkles,
  ArrowRight,
  CheckCircle,
  MapPin,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const cultureValues = [
  {
    icon: Sparkles,
    title: "Innovation First",
    description:
      "We're constantly pushing the boundaries of what's possible in EdTech.",
    gradient: "from-cyan-500 to-cyan-600",
  },
  {
    icon: Globe,
    title: "Remote-Friendly",
    description:
      "Work from anywhere in the world with our distributed team.",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: TrendingUp,
    title: "Growth Mindset",
    description:
      "We invest in your professional development and learning.",
    gradient: "from-green-500 to-green-600",
  },
];

const benefits = [
  { title: "Competitive Salary", description: "Top-of-market compensation packages" },
  { title: "Health Insurance", description: "Comprehensive health, dental, and vision coverage" },
  { title: "Flexible PTO", description: "Take time off when you need it" },
  { title: "Learning Budget", description: "$2,000/year for courses, conferences, and books" },
  { title: "Remote Work", description: "Work from anywhere in the world" },
  { title: "401(k) Matching", description: "Company matching up to 4%" },
];

const openPositions = [
  {
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "AI/ML Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "Remote",
    type: "Full-time",
  },
];

export default function CareersPage() {
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
                  <Briefcase className="h-10 w-10 text-white" />
                </motion.div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
                  <span className="text-foreground">Join Our</span>{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    Team
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-foreground/70 mb-10 leading-relaxed max-w-3xl mx-auto">
                  Help us build the future of education technology and empower creators worldwide
                </p>
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={() => document.getElementById('open-positions')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-10 py-6 text-lg shadow-lg shadow-cyan-500/20"
                  >
                    View Open Roles
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Culture */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
                Our Culture
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {cultureValues.map((value, index) => {
                const Icon = value.icon;
                return (
                  <ScrollReveal
                    key={value.title}
                    direction="up"
                    delay={0.1 * index}
                  >
                    <AnimatedCard variant="3d" delay={0.1 * index} className="h-full">
                      <div className="p-8 text-center h-full flex flex-col items-center">
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.gradient} p-4 mb-6 shadow-lg`}
                        >
                          <Icon className="h-full w-full text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">
                          {value.title}
                        </h3>
                        <p className="text-foreground/70 leading-relaxed">{value.description}</p>
                      </div>
                    </AnimatedCard>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-foreground/5 relative z-10">
          <div className="absolute inset-0 bg-background/50 backdrop-blur-3xl -z-10" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
                Benefits & Perks
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <ScrollReveal
                  key={benefit.title}
                  direction="up"
                  delay={0.05 * index}
                >
                  <GlassSurface className="p-6 h-full hover:border-cyan-500/30 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className="mt-1 bg-green-500/10 p-2 rounded-full">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-foreground/70 text-sm leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </GlassSurface>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section id="open-positions" className="py-24 pb-32 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Open Positions
                </h2>
                <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                  Come do the best work of your career with us.
                </p>
              </div>
            </ScrollReveal>

            <div className="max-w-4xl mx-auto space-y-4">
              {openPositions.map((position, index) => (
                <ScrollReveal
                  key={position.title}
                  direction="up"
                  delay={0.1 * index}
                >
                  <Link href={`/careers/${position.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <GlassSurface className="p-6 md:p-8 hover:border-cyan-500/50 transition-all duration-300 group cursor-pointer hover:bg-cyan-500/5 hover:transform hover:scale-[1.01]">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 group-hover:text-cyan-400 transition-colors">
                            {position.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60">
                            <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1.5" /> {position.department}</span>
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> {position.location}</span>
                            <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> {position.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-cyan-500 font-semibold group-hover:translate-x-2 transition-transform">
                          Apply Now <ArrowRight className="ml-2 h-5 w-5" />
                        </div>
                      </div>
                    </GlassSurface>
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            {openPositions.length === 0 && (
              <ScrollReveal direction="up">
                <GlassSurface className="p-12 text-center max-w-2xl mx-auto">
                  <p className="text-foreground/70 text-lg mb-6">
                    We don't have any open positions at the moment, but we're always looking
                    for talented people to join our team.
                  </p>
                  <Link href="/contact">
                    <Button
                      variant="outline"
                      className="glass-surface border-foreground/20 hover:border-cyan-500/50 text-foreground px-8 py-6"
                    >
                      Get in Touch
                    </Button>
                  </Link>
                </GlassSurface>
              </ScrollReveal>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <GlassSurface className="p-12 md:p-20 text-center max-w-3xl mx-auto relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/10 to-pink-500/10 rounded-full blur-[100px]" />

                <div className="relative z-10">
                  <Heart className="h-16 w-16 text-cyan-400 mx-auto mb-6" />
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                    Don't See a Role That Fits?
                  </h2>
                  <p className="text-xl text-foreground/70 mb-10 max-w-2xl mx-auto">
                    We're always looking for exceptional talent. Send us your resume and we'll
                    keep you in mind for future opportunities.
                  </p>
                  <Link href="/contact">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-10 py-6 text-lg shadow-lg shadow-cyan-500/20"
                    >
                      Send Your Resume
                      <ArrowRight className="ml-2 h-5 w-5" />
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
