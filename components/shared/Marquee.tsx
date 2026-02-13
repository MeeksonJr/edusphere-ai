"use client";

import { useRef, useState } from "react";

interface MarqueeProps {
    children: React.ReactNode;
    speed?: number;
    direction?: "left" | "right";
    pauseOnHover?: boolean;
    className?: string;
}

export function Marquee({
    children,
    speed = 30,
    direction = "left",
    pauseOnHover = true,
    className = "",
}: MarqueeProps) {
    const [isPaused, setIsPaused] = useState(false);

    return (
        <div
            className={`overflow-hidden relative ${className}`}
            onMouseEnter={() => pauseOnHover && setIsPaused(true)}
            onMouseLeave={() => pauseOnHover && setIsPaused(false)}
        >
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

            <div
                className={`flex gap-6 ${direction === "left" ? "animate-marquee" : "animate-marquee-reverse"
                    }`}
                style={{
                    "--marquee-duration": `${speed}s`,
                    animationPlayState: isPaused ? "paused" : "running",
                } as React.CSSProperties}
            >
                {/* Duplicate children for seamless loop */}
                <div className="flex gap-6 shrink-0">{children}</div>
                <div className="flex gap-6 shrink-0" aria-hidden="true">{children}</div>
            </div>
        </div>
    );
}
