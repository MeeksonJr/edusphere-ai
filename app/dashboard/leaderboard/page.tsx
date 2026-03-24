"use client"

import { useState, useEffect } from "react"
import {
  Trophy, Flame, TrendingUp, Medal, Crown, Award, Star
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LeaderboardEntry {
  rank: number
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  total_xp: number
  current_streak: number
  level: number
  is_current_user: boolean
}

const podiumColors = [
  "from-yellow-400 to-amber-500",   // 1st - gold
  "from-slate-300 to-slate-400",     // 2nd - silver
  "from-amber-600 to-amber-700",    // 3rd - bronze
]

const podiumIcons = [Crown, Medal, Award]

export default function LeaderboardPage() {
  const { supabase } = useSupabase()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null)

  useEffect(() => { loadClassrooms() }, [supabase])
  useEffect(() => { loadLeaderboard() }, [selectedClassroom])

  const loadClassrooms = async () => {
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get classrooms where user is enrolled or is teacher
    const { data: enrolled } = await supabase.from("classroom_students").select("classroom_id").eq("student_id", user.id)
    const { data: teaching } = await supabase.from("classrooms").select("id, name").eq("teacher_id", user.id)

    const enrolledIds = (enrolled || []).map(e => e.classroom_id)
    let rooms: any[] = [...(teaching || [])]

    if (enrolledIds.length > 0) {
      const { data: enrolledRooms } = await supabase.from("classrooms").select("id, name").in("id", enrolledIds)
      rooms = [...rooms, ...(enrolledRooms || [])]
    }

    // Deduplicate
    const unique = rooms.filter((r, i, a) => a.findIndex(x => x.id === r.id) === i)
    setClassrooms(unique)
  }

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedClassroom) params.set("classroom_id", selectedClassroom)
      const res = await fetch(`/api/leaderboard?${params}`)
      const data = await res.json()
      setEntries(data.leaderboard || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 text-transparent bg-clip-text">
              Leaderboard
            </span>
          </h1>
          <p className="text-foreground/60">See who&apos;s leading the learning charge</p>
        </div>
      </ScrollReveal>

      {/* Filters */}
      <ScrollReveal direction="up" delay={0.05}>
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <Button
            variant={selectedClassroom === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedClassroom(null)}
            className={cn(
              selectedClassroom === null
                ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white"
                : "border-foreground/10"
            )}
          >
            <Trophy className="h-4 w-4 mr-1" /> Global
          </Button>
          {classrooms.map(c => (
            <Button
              key={c.id}
              variant={selectedClassroom === c.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedClassroom(c.id)}
              className={cn(
                selectedClassroom === c.id
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                  : "border-foreground/10"
              )}
            >
              {c.name}
            </Button>
          ))}
        </div>
      </ScrollReveal>

      {loading ? (
        <div className="flex justify-center min-h-[40vh]"><LoadingSpinner /></div>
      ) : entries.length === 0 ? (
        <GlassSurface className="p-12 text-center">
          <Trophy className="h-14 w-14 text-foreground/20 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">No rankings yet</h2>
          <p className="text-foreground/50">Start earning XP to appear on the leaderboard!</p>
        </GlassSurface>
      ) : (
        <>
          {/* Podium */}
          {top3.length > 0 && (
            <ScrollReveal direction="up" delay={0.1}>
              <div className="flex items-end justify-center gap-4 mb-10">
                {/* 2nd place */}
                {top3[1] && (
                  <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center w-28">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${podiumColors[1]} flex items-center justify-center text-white font-bold text-xl mb-2 shadow-lg`}>
                      {(top3[1].full_name || top3[1].username || "?")[0].toUpperCase()}
                    </div>
                    <p className="font-semibold text-foreground text-sm truncate">{top3[1].full_name || top3[1].username}</p>
                    <p className="text-xs text-foreground/50">{top3[1].total_xp.toLocaleString()} XP</p>
                    <div className="h-20 mt-2 rounded-t-xl bg-gradient-to-b from-slate-300/20 to-slate-400/10 flex items-center justify-center">
                      <Medal className="h-6 w-6 text-slate-400" />
                    </div>
                  </motion.div>
                )}

                {/* 1st place */}
                {top3[0] && (
                  <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center w-32">
                    <div className="relative">
                      <Crown className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
                      <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${podiumColors[0]} flex items-center justify-center text-white font-bold text-2xl mb-2 shadow-xl shadow-yellow-500/20 ring-4 ring-yellow-400/30`}>
                        {(top3[0].full_name || top3[0].username || "?")[0].toUpperCase()}
                      </div>
                    </div>
                    <p className="font-bold text-foreground truncate">{top3[0].full_name || top3[0].username}</p>
                    <p className="text-sm text-yellow-400 font-semibold">{top3[0].total_xp.toLocaleString()} XP</p>
                    <div className="h-28 mt-2 rounded-t-xl bg-gradient-to-b from-yellow-400/20 to-amber-500/10 flex items-center justify-center">
                      <Trophy className="h-8 w-8 text-yellow-400" />
                    </div>
                  </motion.div>
                )}

                {/* 3rd place */}
                {top3[2] && (
                  <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-center w-28">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${podiumColors[2]} flex items-center justify-center text-white font-bold text-xl mb-2 shadow-lg`}>
                      {(top3[2].full_name || top3[2].username || "?")[0].toUpperCase()}
                    </div>
                    <p className="font-semibold text-foreground text-sm truncate">{top3[2].full_name || top3[2].username}</p>
                    <p className="text-xs text-foreground/50">{top3[2].total_xp.toLocaleString()} XP</p>
                    <div className="h-14 mt-2 rounded-t-xl bg-gradient-to-b from-amber-600/20 to-amber-700/10 flex items-center justify-center">
                      <Award className="h-6 w-6 text-amber-600" />
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollReveal>
          )}

          {/* Rest of leaderboard */}
          <div className="space-y-2">
            {rest.map((entry, idx) => (
              <ScrollReveal key={entry.id} direction="up" delay={0.15 + idx * 0.02}>
                <GlassSurface className={cn(
                  "p-3 transition-all",
                  entry.is_current_user && "ring-2 ring-cyan-500/30 bg-cyan-500/5"
                )}>
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-center font-mono text-sm text-foreground/50 font-bold">
                      {entry.rank}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-foreground/20 to-foreground/10 flex items-center justify-center text-foreground font-bold text-sm flex-shrink-0">
                      {(entry.full_name || entry.username || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-medium text-sm truncate", entry.is_current_user ? "text-cyan-400" : "text-foreground")}>
                        {entry.full_name || entry.username}
                        {entry.is_current_user && <span className="text-xs text-cyan-500 ml-1">(You)</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1 text-foreground/60">
                        <Flame className="h-3.5 w-3.5 text-orange-400" />
                        <span>{entry.current_streak}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">Lv.{entry.level}</Badge>
                      <span className="font-mono font-bold text-foreground min-w-[60px] text-right">
                        {entry.total_xp.toLocaleString()}
                      </span>
                      <Star className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                    </div>
                  </div>
                </GlassSurface>
              </ScrollReveal>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
