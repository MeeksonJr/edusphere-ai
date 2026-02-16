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
    data: any[]
}

export default function MasteryChart({ data }: MasteryChartProps) {
    return (
        <GlassSurface className="p-6 h-full">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                <Zap className="mr-2 h-5 w-5 text-yellow-400" />
                Subject Mastery
            </h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                        <Radar
                            name="Skill Level"
                            dataKey="A"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            fill="#8b5cf6"
                            fillOpacity={0.5}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(0,0,0,0.8)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                                color: "#fff"
                            }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </GlassSurface>
    )
}
