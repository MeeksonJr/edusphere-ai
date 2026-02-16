"use client"

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"
import { BookOpen } from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"

interface ProgressChartProps {
    data: any[]
}

export default function ProgressChart({ data }: ProgressChartProps) {
    return (
        <GlassSurface className="p-6 h-full">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-purple-400" />
                Course Status
            </h3>
            <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(0,0,0,0.8)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                                color: "#fff"
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </GlassSurface>
    )
}
