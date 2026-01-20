"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassSurfaceProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "subtle";
  onClick?: () => void;
}

export function GlassSurface({
  children,
  className,
  variant = "default",
  onClick,
}: GlassSurfaceProps) {
  const variants = {
    default: "glass-surface",
    elevated: "glass-surface shadow-lg shadow-purple-500/10",
    subtle: "glass-surface bg-black/20 backdrop-blur-sm",
  };

  return (
    <div
      className={cn(variants[variant], className)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      aria-label={onClick ? "Clickable surface" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

