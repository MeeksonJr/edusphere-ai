"use client";

import { motion } from "framer-motion";
import { Check, X, Clock, DollarSign, BarChart3, Users } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeader } from "@/components/shared/SectionHeader";

const comparisons = [
    {
        label: "Time to Create",
        icon: Clock,
        traditional: "2-4 weeks",
        ai: "Under 5 minutes",
    },
    {
        label: "Cost",
        icon: DollarSign,
        traditional: "$5,000+ per course",
        ai: "Free to start",
    },
    {
        label: "Quality",
        icon: BarChart3,
        traditional: "Varies by skill",
        ai: "Consistently professional",
    },
    {
        label: "Scalability",
        icon: Users,
        traditional: "One course at a time",
        ai: "Unlimited courses",
    },
];

export function ComparisonSection() {
    return (
        <SectionContainer background="default">
            <SectionHeader
                title="Traditional vs"
                titleGradient="AI-Powered Creation"
                subtitle="See why thousands of educators are switching to AI-powered course creation"
            />

            <div className="max-w-3xl mx-auto">
                <ScrollReveal direction="up" delay={0.1}>
                    <div className="glass-surface rounded-xl overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                            <div className="text-sm text-white/40 font-medium" />
                            <div className="text-center">
                                <span className="text-sm font-semibold text-white/40">Traditional</span>
                            </div>
                            <div className="text-center">
                                <span className="text-sm font-semibold text-gradient-purple">EduSphere AI</span>
                            </div>
                        </div>

                        {/* Table Rows */}
                        {comparisons.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={item.label}
                                    className="grid grid-cols-3 gap-4 px-6 py-5 border-b border-white/5 last:border-0 group hover:bg-white/[0.02] transition-colors"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    {/* Label */}
                                    <div className="flex items-center gap-3">
                                        <Icon className="h-4 w-4 text-white/30 shrink-0" />
                                        <span className="text-sm text-white/70 font-medium">{item.label}</span>
                                    </div>

                                    {/* Traditional */}
                                    <div className="flex items-center justify-center gap-2">
                                        <X className="h-4 w-4 text-red-400/60 shrink-0" />
                                        <span className="text-sm text-white/40 text-center">{item.traditional}</span>
                                    </div>

                                    {/* AI */}
                                    <div className="flex items-center justify-center gap-2">
                                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                                        <span className="text-sm text-emerald-300/90 font-medium text-center">{item.ai}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </ScrollReveal>
            </div>
        </SectionContainer>
    );
}
