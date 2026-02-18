"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    icon: string | null
    read: boolean
    action_url: string | null
    created_at: string
}

export function NotificationCenter() {
    const { supabase } = useSupabase()
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Fetch unread count on mount
    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications?limit=1&offset=0")
            if (res.ok) {
                const data = await res.json()
                setUnreadCount(data.unreadCount)
            }
        } catch { /* silently fail */ }
    }, [])

    useEffect(() => {
        fetchUnreadCount()
        // Poll every 30s
        const interval = setInterval(fetchUnreadCount, 30000)
        return () => clearInterval(interval)
    }, [fetchUnreadCount])

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [open])

    // Fetch notifications when dropdown opens
    const fetchNotifications = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/notifications?limit=10&offset=0")
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.notifications)
                setUnreadCount(data.unreadCount)
            }
        } catch { /* silently fail */ }
        setLoading(false)
    }, [])

    const handleOpen = () => {
        setOpen(prev => !prev)
        if (!open) fetchNotifications()
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

    // Click notification → mark as read + navigate
    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) markAsRead(notification.id)
        if (notification.action_url) {
            setOpen(false)
            window.location.href = notification.action_url
        }
    }

    // Time ago helper
    function timeAgo(dateStr: string): string {
        const diff = Date.now() - new Date(dateStr).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'Just now'
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        const days = Math.floor(hrs / 24)
        if (days < 7) return `${days}d ago`
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={handleOpen}
                className="relative text-foreground/70 hover:text-cyan-500 hover:bg-cyan-500/10 rounded-full"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </Button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-[360px] max-h-[480px] rounded-xl border border-white/[0.08] bg-background/95 backdrop-blur-xl shadow-2xl shadow-black/20 z-50 overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Mark all read
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-500 border-t-transparent" />
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-white/[0.03] ${n.read
                                            ? 'hover:bg-white/[0.02]'
                                            : 'bg-cyan-500/[0.03] hover:bg-cyan-500/[0.06]'
                                        }`}
                                >
                                    {/* Icon */}
                                    <div className="text-lg shrink-0 mt-0.5">
                                        {n.icon || (
                                            n.type === 'achievement' ? '🏆' :
                                                n.type === 'level_up' ? '⬆️' :
                                                    n.type === 'streak' ? '🔥' :
                                                        '🔔'
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-foreground truncate">{n.title}</span>
                                            {!n.read && (
                                                <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-foreground/50 mt-0.5 line-clamp-2">{n.message}</p>
                                        <span className="text-[10px] text-foreground/30 mt-1 block">{timeAgo(n.created_at)}</span>
                                    </div>

                                    {/* Action indicator */}
                                    {n.action_url && (
                                        <ExternalLink className="h-3 w-3 text-foreground/20 shrink-0 mt-1" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-foreground/30">
                                <Bell className="h-8 w-8 mb-2 opacity-30" />
                                <p className="text-sm">No notifications yet</p>
                                <p className="text-xs mt-1">Complete activities to earn achievements!</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-white/[0.06] px-4 py-2">
                        <Link
                            href="/dashboard/notifications"
                            onClick={() => setOpen(false)}
                            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 py-1 transition-colors"
                        >
                            View all notifications
                            <ExternalLink className="h-3 w-3" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
