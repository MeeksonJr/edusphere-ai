"use client";

import { cn } from "@/lib/utils";

interface AmbientBackgroundProps {
    className?: string;
    variant?: "hero" | "subtle" | "glow";
}

export function AmbientBackground({ className, variant = "hero" }: AmbientBackgroundProps) {
    return (
        <div className={cn("absolute inset-0 overflow-hidden pointer-events-none select-none", className)}>
            {/* Base Gradient - Theme Aware */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/80 via-background to-background dark:from-cyan-900/20 dark:via-background dark:to-background" />

            {/* Mesh Grid Overlay */}
            <div className="absolute inset-0 mesh-gradient-bg opacity-40 dark:opacity-100 mix-blend-overlay dark:mix-blend-normal" />
            <div className="absolute inset-0 grid-pattern-dense opacity-20 dark:opacity-40" />

            {/* Animated Gradient Orbs */}
            <div className={cn(
                "absolute top-1/4 left-1/4 rounded-full bg-cyan-600/10 blur-[120px] animate-float-slow",
                variant === "hero" ? "w-[500px] h-[500px]" : "w-[300px] h-[300px]"
            )} />

            <div className={cn(
                "absolute bottom-1/4 right-1/4 rounded-full bg-cyan-500/8 blur-[100px] animate-float-gentle",
                variant === "hero" ? "w-[400px] h-[400px]" : "w-[250px] h-[250px]"
            )} />

            <div className={cn(
                "absolute top-1/2 right-1/3 rounded-full bg-pink-500/6 blur-[80px] animate-float-slow",
                variant === "hero" ? "w-[300px] h-[300px]" : "w-[200px] h-[200px]"
            )} style={{ animationDelay: "3s" }} />
        </div>
    );
}
