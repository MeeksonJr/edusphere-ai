"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  className = "",
  text 
}: LoadingSpinnerProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <Loader2 className={`${sizes[size]} text-purple-400`} aria-hidden="true" />
      </motion.div>
      {text && (
        <p className="mt-4 text-white/70 text-sm" role="status" aria-live="polite">
          {text}
        </p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

