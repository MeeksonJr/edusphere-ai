"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Bell,
    CheckCheck,
    Trash2,
    Filter,
    Trophy,
    Zap,
    Flame,
    ExternalLink,
} from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    icon: string | null
    read: boolean
    action_url: string | null
    data: any
    created_at: string
}

const FILTERS = [
    { key: "all", label: "All", icon: Bell },
    { key: "unread", label: "Unread", icon: Filter },
    { key: "achievement", label: "Achievements", icon: Trophy },
    { key: "level_up", label: "Level Ups", icon: Zap },
    { key: "streak", label: "Streaks", icon: Flame },
]

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [filter, setFilter] = useState("all")
    const [loading, setLoading] = useState(true)
    const [hasMore, setHasMore] = useState(false)
    const [offset, setOffset] = useState(0)
    const limit = 20

    const fetchNotifications = useCallback(async (currentFilter: string, currentOffset: number, append = false) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/notifications?limit=${limit}&offset=${currentOffset}&filter=${currentFilter}`)
            if (res.ok) {
                const data = await res.json()
                setNotifications(prev => append ? [...prev, ...data.notifications] : data.notifications)
                setUnreadCount(data.unreadCount)
                setHasMore(data.hasMore)
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err)
        }
        setLoading(false)
    }, [])

    // Fetch on mount and filter change
    useEffect(() => {
        setOffset(0)
        fetchNotifications(filter, 0)
    }, [filter, fetchNotifications])

    // Load more
    const loadMore = () => {
        const newOffset = offset + limit
        setOffset(newOffset)
        fetchNotifications(filter, newOffset, true)
    }

    // Mark single as read
    const markAsRead = async (id: string) => {
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        })
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    // Mark all as read
    const markAllAsRead = async () => {
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ all: true }),
        })
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
    }

    // Delete single notification
    const deleteNotification = async (id: string) => {
        await fetch("/api/notifications", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        })
        const deleted = notifications.find(n => n.id === id)
        setNotifications(prev => prev.filter(n => n.id !== id))
        if (deleted && !deleted.read) setUnreadCount(prev => Math.max(0, prev - 1))
    }

    // Click → mark as read + navigate
    const handleClick = (n: Notification) => {
        if (!n.read) markAsRead(n.id)
        if (n.action_url) window.location.href = n.action_url
    }

    // Time ago
    function timeAgo(dateStr: string): string {
        const diff = Date.now() - new Date(dateStr).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return "Just now"
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        const days = Math.floor(hrs / 24)
        if (days < 7) return `${days}d ago`
        if (days < 30) return `${Math.floor(days / 7)}w ago`
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }

    // Icon mapping
    function getIcon(n: Notification): string {
        if (n.icon) return n.icon
        switch (n.type) {
            case "achievement": return "🏆"
            case "level_up": return "⬆️"
            case "streak": return "🔥"
            case "xp": return "⚡"
            default: return "🔔"
        }
    }

    return (
        <div className="relative min-h-screen p-6 md:p-8 lg:p-12 pb-32">
            <AmbientBackground />

            {/* Header */}
            <ScrollReveal direction="up">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            <span className="text-foreground">Noti</span>
                            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                fications
                            </span>
                        </h1>
                        <p className="text-foreground/60">
                            {unreadCount > 0
                                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                                : "You're all caught up!"}
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            onClick={markAllAsRead}
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 gap-2"
                        >
                            <CheckCheck className="h-4 w-4" />
                            Mark all as read
                        </Button>
                    )}
                </div>
            </ScrollReveal>

            {/* Filter Tabs */}
            <ScrollReveal direction="up" delay={0.05}>
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                    {FILTERS.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={cn(
                                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                                filter === f.key
                                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                    : "bg-white/[0.03] text-foreground/50 border border-transparent hover:bg-white/[0.06] hover:text-foreground/70"
                            )}
                        >
                            <f.icon className="h-3.5 w-3.5" />
                            {f.label}
                        </button>
                    ))}
                </div>
            </ScrollReveal>

            {/* Notifications List */}
            <ScrollReveal direction="up" delay={0.1}>
                <GlassSurface className="overflow-hidden">
                    {loading && notifications.length === 0 ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent" />
                        </div>
                    ) : notifications.length > 0 ? (
                        <div>
                            {notifications.map((n, i) => (
                                <div
                                    key={n.id}
                                    className={cn(
                                        "flex items-start gap-4 px-5 py-4 border-b border-white/[0.04] cursor-pointer transition-colors group",
                                        n.read
                                            ? "hover:bg-white/[0.02]"
                                            : "bg-cyan-500/[0.02] hover:bg-cyan-500/[0.05]"
                                    )}
                                    onClick={() => handleClick(n)}
                                >
                                    {/* Icon */}
                                    <div className="text-2xl shrink-0 mt-0.5">{getIcon(n)}</div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-foreground">{n.title}</span>
                                            {!n.read && (
                                                <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-sm text-foreground/50 mt-0.5 line-clamp-2">{n.message}</p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-[11px] text-foreground/30">{timeAgo(n.created_at)}</span>
                                            <span className="text-[11px] text-foreground/20 capitalize">{n.type.replace("_", " ")}</span>
                                            {n.action_url && (
                                                <span className="text-[11px] text-cyan-400/50 flex items-center gap-0.5">
                                                    <ExternalLink className="h-2.5 w-2.5" />
                                                    View
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        {!n.read && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); markAsRead(n.id) }}
                                                className="p-1.5 rounded-md hover:bg-white/[0.05] text-foreground/40 hover:text-cyan-400 transition-colors"
                                                title="Mark as read"
                                            >
                                                <CheckCheck className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteNotification(n.id) }}
                                            className="p-1.5 rounded-md hover:bg-red-500/10 text-foreground/40 hover:text-red-400 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Load More */}
                            {hasMore && (
                                <div className="flex justify-center py-4">
                                    <Button
                                        variant="ghost"
                                        onClick={loadMore}
                                        disabled={loading}
                                        className="text-sm text-foreground/50 hover:text-foreground/70"
                                    >
                                        {loading ? "Loading…" : "Load more notifications"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-foreground/30">
                            <Bell className="h-12 w-12 mb-3 opacity-20" />
                            <p className="text-lg font-medium mb-1">
                                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                            </p>
                            <p className="text-sm text-foreground/20">
                                {filter === "unread"
                                    ? "You're all caught up!"
                                    : "Complete activities to earn achievements and level up!"}
                            </p>
                        </div>
                    )}
                </GlassSurface>
            </ScrollReveal>
        </div>
    )
}
