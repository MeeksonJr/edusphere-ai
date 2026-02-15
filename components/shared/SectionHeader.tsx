"use client";

import { ScrollReveal } from "@/components/shared/ScrollReveal";

interface SectionHeaderProps {
    badge?: string;
    title: string;
    titleGradient?: string;
    subtitle?: string;
    align?: "center" | "left";
    className?: string;
}

export function SectionHeader({
    badge,
    title,
    titleGradient,
    subtitle,
    align = "center",
    className = "",
}: SectionHeaderProps) {
    const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

    return (
        <ScrollReveal direction="up">
            <div className={`max-w-3xl mb-16 ${alignClass} ${className}`}>
                {badge && (
                    <div className="inline-flex items-center glass-surface px-4 py-1.5 rounded-full mb-6">
                        <span className="text-sm font-medium text-white/70">{badge}</span>
                    </div>
                )}
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display mb-4 leading-tight">
                    {titleGradient ? (
                        <>
                            <span className="text-white">{title}</span>
                            <br className="hidden sm:block" />
                            <span className="text-gradient-brand"> {titleGradient}</span>
                        </>
                    ) : (
                        <span className="text-white">{title}</span>
                    )}
                </h2>
                {subtitle && (
                    <p className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed mx-auto">
                        {subtitle}
                    </p>
                )}
            </div>
        </ScrollReveal>
    );
}
