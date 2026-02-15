"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GlassSurface } from "./GlassSurface";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "3d" | "glow";
  delay?: number;
  onClick?: () => void;
}

export function AnimatedCard({
  children,
  className,
  variant = "default",
  delay = 0,
  onClick,
}: AnimatedCardProps) {
  const baseAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1], // Custom easing
      },
    },
  };

  const variants = {
    default: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          delay,
          ease: [0.22, 1, 0.36, 1],
        },
      },
    },
    "3d": {
      hidden: { opacity: 0, y: 20, rotateX: -15 },
      visible: {
        opacity: 1,
        y: 0,
        rotateX: 0,
        transition: {
          duration: 0.6,
          delay,
          ease: [0.22, 1, 0.36, 1],
        },
      },
    },
    glow: {
      hidden: { opacity: 0, y: 20, scale: 0.95 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.5,
          delay,
          ease: [0.22, 1, 0.36, 1],
        },
      },
    },
  };

  const hoverEffects = {
    default: {},
    "3d": {
      scale: 1.02,
      rotateY: 5,
      rotateX: -5,
      transition: { duration: 0.3 },
    },
    glow: {
      scale: 1.03,
      boxShadow: "0 0 30px rgba(6, 182, 212, 0.3)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants[variant]}
      whileHover={hoverEffects[variant]}
      className={cn("transform-3d", className)}
      onClick={onClick}
    >
      <GlassSurface className="h-full w-full" onClick={onClick}>
        {children}
      </GlassSurface>
    </motion.div>
  );
}

