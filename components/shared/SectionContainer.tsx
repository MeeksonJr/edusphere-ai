"use client";

interface SectionContainerProps {
    children: React.ReactNode;
    id?: string;
    className?: string;
    background?: "default" | "gradient" | "mesh" | "pattern" | "subtle";
    padding?: "default" | "small" | "none";
}

export function SectionContainer({
    children,
    id,
    className = "",
    background = "default",
    padding = "default",
}: SectionContainerProps) {
    const bgClasses = {
        default: "",
        gradient: "bg-gradient-to-b from-transparent via-cyan-500/[0.03] to-transparent",
        mesh: "mesh-gradient-bg",
        pattern: "grid-pattern",
        subtle: "bg-surface-1/30",
    };

    const paddingClasses = {
        default: "section-padding",
        small: "section-padding-sm",
        none: "",
    };

    return (
        <section
            id={id}
            className={`relative overflow-hidden ${bgClasses[background]} ${paddingClasses[padding]} ${className}`}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {children}
            </div>
        </section>
    );
}
