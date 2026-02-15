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
    elevated: "glass-surface shadow-lg shadow-cyan-500/10",
    subtle: "glass-surface bg-background/20 backdrop-blur-sm",
  };

  if (onClick) {
    return (
      <button
        type="button"
        className={cn(variants[variant], className)}
        onClick={onClick}
        aria-label="Clickable surface"
      >
        {children}
      </button>
    );
  }

  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  );
}

