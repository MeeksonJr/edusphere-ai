"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, CreditCard, Zap } from "lucide-react";
import Link from "next/link";

export function CTASection() {
    return (
        <section className="relative py-24 lg:py-32 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-b from-black via-cyan-950/20 to-black" />
                <div className="absolute inset-0 mesh-gradient-bg opacity-60" />
                <div className="absolute inset-0 grid-pattern opacity-20" />
            </div>

            {/* Glow Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[150px]" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    className="max-w-3xl mx-auto text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-6 leading-tight">
                        <span className="text-white">Start Creating</span>
                        <br />
                        <span className="text-gradient-brand">Today</span>
                    </h2>
                    <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto leading-relaxed">
                        Join thousands of educators and creators already using AI to build
                        professional courses in minutes, not weeks.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                        <Link href="/signup">
                            <Button
                                size="lg"
                                className="glow-button group bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white border-0 shadow-lg shadow-cyan-500/25 px-10 py-7 text-lg rounded-xl"
                            >
                                Get Started Free
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button
                                size="lg"
                                variant="outline"
                                className="glass-surface border-white/15 hover:border-white/30 text-white px-10 py-7 text-lg rounded-xl"
                            >
                                View Pricing
                            </Button>
                        </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/35">
                        <span className="flex items-center gap-1.5">
                            <Shield className="h-4 w-4 text-emerald-400/60" />
                            Secure & encrypted
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CreditCard className="h-4 w-4 text-emerald-400/60" />
                            No credit card required
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Zap className="h-4 w-4 text-emerald-400/60" />
                            2-minute setup
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
