"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"
import { Mic } from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"

interface SessionStatsChartProps {
    data: {
        week: string
        sessions: number
        avgRating: number
        xpEarned: number
    }[]
    totalSessions: number
    avgRating: number
}

export default function SessionStatsChart({ data, totalSessions, avgRating }: SessionStatsChartProps) {
    return (
        <GlassSurface className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <Mic className="mr-2 h-5 w-5 text-violet-400" />
                    Session Performance
                </h3>
                <div className="flex items-center gap-3 text-xs text-foreground/50">
                    <span>{totalSessions} total</span>
                    <span>⭐ {avgRating}/5 avg</span>
                </div>
            </div>
            <div className="h-[280px] w-full">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} barCategoryGap="20%">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                            <XAxis
                                dataKey="week"
                                stroke="rgba(255,255,255,0.4)"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="rgba(255,255,255,0.4)"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(0,0,0,0.85)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "8px",
                                    color: "#fff",
                                    fontSize: 12,
                                }}
                            />
                            <Legend
                                verticalAlign="top"
                                height={30}
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}
                            />
                            <Bar dataKey="sessions" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Sessions" />
                            <Bar dataKey="xpEarned" fill="#06b6d4" radius={[4, 4, 0, 0]} name="XP Earned" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-foreground/30 text-sm">
                        No session data yet — start an AI Tutor session!
                    </div>
                )}
            </div>
        </GlassSurface>
    )
}
