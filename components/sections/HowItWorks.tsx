"use client";

import { motion } from "framer-motion";
import { PiMagnifyingGlassBold, PiBrainBold, PiRocketLaunchBold } from "react-icons/pi";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeader } from "@/components/shared/SectionHeader";

const steps = [
    {
        number: "01",
        icon: PiMagnifyingGlassBold,
        title: "Enter Your Topic",
        description:
            "Type any subject, from quantum physics to creative writing. Our AI understands context and scope to plan the perfect course structure.",
        gradient: "from-purple-500 to-purple-600",
        visual: (
            <div className="glass-surface p-4 rounded-lg mt-4">
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-10 rounded-lg bg-white/[0.04] border border-white/10 px-3 flex items-center">
                        <span className="text-sm text-white/30">Introduction to Machine Learning...</span>
                        <span className="ml-1 w-0.5 h-5 bg-purple-400 animate-pulse" />
                    </div>
                    <div className="h-10 px-4 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center">
                        <span className="text-xs text-purple-300 font-medium">Generate</span>
                    </div>
                </div>
            </div>
        ),
    },
    {
        number: "02",
        icon: PiBrainBold,
        title: "AI Generates Content",
        description:
            "Our AI engine creates structured lessons, scripts, slides, narration, and quizzes — all tailored to your topic and audience level.",
        gradient: "from-cyan-500 to-blue-500",
        visual: (
            <div className="glass-surface p-4 rounded-lg mt-4 space-y-2">
                {["Generating outline...", "Creating slides...", "Writing scripts...", "Adding narration..."].map(
                    (step, i) => (
                        <div key={step} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${i < 3 ? 'bg-emerald-500/20' : 'bg-cyan-500/20 animate-pulse'}`}>
                                {i < 3 ? (
                                    <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                )}
                            </div>
                            <span className={`text-xs ${i < 3 ? 'text-white/50' : 'text-cyan-300/80'}`}>{step}</span>
                        </div>
                    )
                )}
            </div>
        ),
    },
    {
        number: "03",
        icon: PiRocketLaunchBold,
        title: "Publish Everywhere",
        description:
            "Export your course as video (MP4), embed in your LMS, share a link, or publish to YouTube, TikTok, and Instagram — all formats included.",
        gradient: "from-amber-500 to-orange-500",
        visual: (
            <div className="glass-surface p-4 rounded-lg mt-4">
                <div className="flex items-center justify-between gap-3">
                    {["16:9", "9:16", "1:1"].map((format, i) => (
                        <div
                            key={format}
                            className={`flex-1 rounded-lg border flex items-center justify-center py-3 text-xs font-mono transition-all ${i === 0
                                ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                                : "border-white/5 bg-white/[0.02] text-white/30 hover:border-white/10"
                                }`}
                        >
                            {format}
                        </div>
                    ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-white/40">Ready to export</span>
                </div>
            </div>
        ),
    },
];

export function HowItWorks() {
    return (
        <SectionContainer background="gradient">
            <SectionHeader
                badge="Simple & Powerful"
                title="How It"
                titleGradient="Works"
                subtitle="Three simple steps to create professional courses that engage and educate"
            />

            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
                    {/* Connecting line (desktop only) */}
                    <div className="hidden md:block absolute top-[72px] left-[16.5%] right-[16.5%] h-[2px]">
                        <div className="h-full bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-amber-500/40 rounded-full" />
                    </div>

                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <ScrollReveal
                                key={step.number}
                                direction="up"
                                delay={index * 0.15}
                            >
                                <div className="relative">
                                    {/* Step Number + Icon */}
                                    <div className="flex flex-col items-center mb-6">
                                        <motion.div
                                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} p-[1px] mb-4 relative z-10`}
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center">
                                                <Icon className="h-7 w-7 text-white" />
                                            </div>
                                        </motion.div>
                                        <span className="text-xs font-mono text-white/20 uppercase tracking-widest">
                                            Step {step.number}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold font-display text-white mb-3">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-white/50 leading-relaxed mb-2">
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Visual */}
                                    {step.visual}
                                </div>
                            </ScrollReveal>
                        );
                    })}
                </div>
            </div>
        </SectionContainer>
    );
}
