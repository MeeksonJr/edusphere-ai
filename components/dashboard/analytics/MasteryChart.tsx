"use client"

import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { Zap } from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"

interface MasteryChartProps {
    data: {
        subject: string
        score: number
        fullMark: number
    }[]
}

export default function MasteryChart({ data }: MasteryChartProps) {
    return (
        <GlassSurface className="p-6 h-full">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                <Zap className="mr-2 h-5 w-5 text-yellow-400" />
                Skill Radar
            </h3>
            <div className="h-[300px] w-full">
                {data.length > 0 && data.some(d => d.score > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                            <PolarGrid stroke="rgba(255,255,255,0.08)" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 11 }}
                            />
                            <PolarRadiusAxis
                                angle={30}
                                domain={[0, 100]}
                                tick={false}
                                axisLine={false}
                            />
                            <Radar
                                name="Mastery"
                                dataKey="score"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                fill="#8b5cf6"
                                fillOpacity={0.35}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(0,0,0,0.85)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "8px",
                                    color: "#fff",
                                    fontSize: 12,
                                }}
                                formatter={(value: any) => [`${value}/100`, 'Mastery']}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-foreground/30 text-sm">
                        Study more topics to build your skill radar!
                    </div>
                )}
            </div>
        </GlassSurface>
    )
}
