"use client"

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"
import { TrendingUp } from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"

interface ActivityChartProps {
    data: {
        name: string
        studyMinutes: number
        sessions: number
        xpEarned: number
    }[]
}

export default function ActivityChart({ data }: ActivityChartProps) {
    return (
        <GlassSurface className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-cyan-400" />
                    Activity Trends
                </h3>
            </div>
            <div className="h-[300px] w-full">
                {data.some(d => d.studyMinutes > 0 || d.xpEarned > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorXP" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="rgba(255,255,255,0.4)"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                interval={data.length > 14 ? Math.floor(data.length / 7) : 0}
                            />
                            <YAxis
                                yAxisId="left"
                                stroke="rgba(255,255,255,0.4)"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}m`}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="rgba(255,255,255,0.4)"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}xp`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(0,0,0,0.85)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "8px",
                                    color: "#fff",
                                    fontSize: 12,
                                }}
                                itemStyle={{ color: "#fff" }}
                            />
                            <Legend
                                verticalAlign="top"
                                height={30}
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}
                            />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="studyMinutes"
                                stroke="#06b6d4"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorMinutes)"
                                name="Study Minutes"
                            />
                            <Area
                                yAxisId="right"
                                type="monotone"
                                dataKey="xpEarned"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorXP)"
                                name="XP Earned"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-foreground/30 text-sm">
                        No activity data yet — start studying to see your trends!
                    </div>
                )}
            </div>
        </GlassSurface>
    )
}
