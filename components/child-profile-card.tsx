"use client"

import { User, BookOpen, Clock, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ChildProfile {
    id: string
    child_name: string
    grade_level?: string
    avatar_url?: string
    subjects?: string[]
    recent_progress?: any[]
    created_at: string
}

interface ChildProfileCardProps {
    child: ChildProfile
    onClick?: () => void
    className?: string
}

const avatarColors = [
    "from-pink-500 to-rose-500",
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-indigo-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-red-500 to-pink-500",
]

function getAvatarColor(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return avatarColors[Math.abs(hash) % avatarColors.length]
}

export function ChildProfileCard({ child, onClick, className = "" }: ChildProfileCardProps) {
    const progress = child.recent_progress || []
    const totalMinutes = progress.reduce((sum: number, p: any) => sum + (p.time_spent_minutes || 0), 0)
    const avgScore = progress.length > 0
        ? Math.round(progress.reduce((sum: number, p: any) => sum + (p.score || 0), 0) / progress.length)
        : null
    const initial = child.child_name.charAt(0).toUpperCase()
    const color = getAvatarColor(child.child_name)

    return (
        <div
            onClick={onClick}
            className={`group rounded-xl bg-white/5 border border-white/10 p-5 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/5 ${onClick ? "cursor-pointer" : ""} ${className}`}
        >
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg`}>
                    {initial}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground truncate group-hover:text-white transition-colors">
                        {child.child_name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {child.grade_level && (
                            <Badge className="bg-white/10 text-foreground/60 border-white/10 text-xs">
                                {child.grade_level}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5">
                <div className="text-center">
                    <BookOpen className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-foreground">{(child.subjects || []).length}</p>
                    <p className="text-xs text-foreground/40">Subjects</p>
                </div>
                <div className="text-center">
                    <Clock className="h-4 w-4 text-amber-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-foreground">{totalMinutes}m</p>
                    <p className="text-xs text-foreground/40">This week</p>
                </div>
                <div className="text-center">
                    <TrendingUp className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-foreground">{avgScore ?? "—"}</p>
                    <p className="text-xs text-foreground/40">Avg Score</p>
                </div>
            </div>
        </div>
    )
}

export default ChildProfileCard
