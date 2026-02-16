"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface VisualSelectOption {
    value: string
    label: string
    description?: string
    icon?: React.ElementType
    color?: string // For gradient or accent color
}

interface VisualSelectProps {
    options: VisualSelectOption[]
    value: string
    onChange: (value: string) => void
    label?: string
    className?: string
}

export function VisualSelect({ options, value, onChange, label, className }: VisualSelectProps) {
    return (
        <div className={cn("space-y-3", className)}>
            {label && <label className="text-sm font-medium text-foreground">{label}</label>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((option) => {
                    const isSelected = value === option.value
                    const Icon = option.icon

                    return (
                        <div
                            key={option.value}
                            onClick={() => onChange(option.value)}
                            className={cn(
                                "relative group cursor-pointer rounded-xl border p-4 transition-all duration-200",
                                isSelected
                                    ? "bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] scale-[1.02]"
                                    : "bg-background/40 border-foreground/10 hover:border-foreground/30 hover:bg-foreground/5",
                            )}
                        >
                            <div className="flex items-start gap-4">
                                {Icon && (
                                    <div
                                        className={cn(
                                            "p-2.5 rounded-lg transition-colors flex-shrink-0",
                                            isSelected
                                                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                                                : "bg-foreground/5 text-foreground/60 group-hover:text-foreground",
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3
                                        className={cn(
                                            "font-semibold transition-colors",
                                            isSelected ? "text-cyan-400" : "text-foreground",
                                        )}
                                    >
                                        {option.label}
                                    </h3>
                                    {option.description && (
                                        <p className="text-xs text-foreground/60 mt-1 line-clamp-2">
                                            {option.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Selection Checkmark */}
                            {isSelected && (
                                <div className="absolute top-3 right-3 text-cyan-500">
                                    <div className="h-5 w-5 bg-cyan-500 rounded-full flex items-center justify-center">
                                        <Check className="h-3 w-3 text-white" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
