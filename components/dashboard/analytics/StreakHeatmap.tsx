"use client"

import { GlassSurface } from "@/components/shared/GlassSurface"
import { Flame } from "lucide-react"

interface StreakHeatmapProps {
    data: { date: string; count: number }[]
    currentStreak: number
    longestStreak: number
}

export default function StreakHeatmap({ data, currentStreak, longestStreak }: StreakHeatmapProps) {
    const maxCount = Math.max(...data.map(d => d.count), 1)

    function getColor(count: number): string {
        if (count === 0) return 'rgba(255,255,255,0.03)'
        const intensity = count / maxCount
        if (intensity <= 0.25) return 'rgba(16,185,129,0.2)'
        if (intensity <= 0.5) return 'rgba(16,185,129,0.4)'
        if (intensity <= 0.75) return 'rgba(16,185,129,0.65)'
        return 'rgba(16,185,129,0.9)'
    }

    // Group by weeks (columns) for the grid
    const weeks: { date: string; count: number }[][] = []
    let currentWeek: { date: string; count: number }[] = []

    // Pad start to align to Sunday
    if (data.length > 0) {
        const firstDay = new Date(data[0].date).getDay()
        for (let i = 0; i < firstDay; i++) {
            currentWeek.push({ date: '', count: -1 }) // placeholder
        }
    }

    data.forEach((d) => {
        currentWeek.push(d)
        if (currentWeek.length === 7) {
            weeks.push(currentWeek)
            currentWeek = []
        }
    })
    if (currentWeek.length > 0) weeks.push(currentWeek)

    const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', '']

    // Month labels
    const monthLabels: { label: string; col: number }[] = []
    let lastMonth = ''
    data.forEach((d, i) => {
        if (!d.date) return
        const m = new Date(d.date).toLocaleDateString('en-US', { month: 'short' })
        if (m !== lastMonth) {
            const weekIdx = Math.floor((i + (data.length > 0 ? new Date(data[0].date).getDay() : 0)) / 7)
            monthLabels.push({ label: m, col: weekIdx })
            lastMonth = m
        }
    })

    return (
        <GlassSurface className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <Flame className="mr-2 h-5 w-5 text-orange-400" />
                    Activity Heatmap
                </h3>
                <div className="flex items-center gap-4 text-xs text-foreground/50">
                    <span>🔥 Current: <strong className="text-orange-400">{currentStreak} days</strong></span>
                    <span>🏆 Best: <strong className="text-yellow-400">{longestStreak} days</strong></span>
                </div>
            </div>

            {/* Month Labels */}
            <div className="flex mb-1 ml-8" style={{ gap: 0 }}>
                {monthLabels.map((m, i) => (
                    <div
                        key={i}
                        className="text-[10px] text-foreground/40 absolute"
                        style={{
                            position: 'relative',
                            left: `${m.col * 14}px`,
                            width: 0,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {/* We'll use simpler inline positioning */}
                    </div>
                ))}
            </div>

            <div className="flex gap-0.5 overflow-x-auto pb-2">
                {/* Day labels */}
                <div className="flex flex-col gap-0.5 mr-1 shrink-0">
                    {dayLabels.map((label, i) => (
                        <div key={i} className="h-[13px] w-6 text-[9px] text-foreground/40 flex items-center justify-end pr-1">
                            {label}
                        </div>
                    ))}
                </div>

                {/* Weeks grid */}
                {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-0.5">
                        {week.map((day, di) => (
                            <div
                                key={di}
                                className="h-[13px] w-[13px] rounded-[2px] transition-colors relative group"
                                style={{ backgroundColor: day.count < 0 ? 'transparent' : getColor(day.count) }}
                            >
                                {day.count >= 0 && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-black/90 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        {day.count} {day.count === 1 ? 'activity' : 'activities'} on {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-[10px] text-foreground/40">Less</span>
                {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
                    <div
                        key={i}
                        className="h-[11px] w-[11px] rounded-[2px]"
                        style={{ backgroundColor: getColor(intensity * maxCount) }}
                    />
                ))}
                <span className="text-[10px] text-foreground/40">More</span>
            </div>
        </GlassSurface>
    )
}
