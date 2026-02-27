"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { useToast } from "@/hooks/use-toast"
import {
    Calendar,
    Link2,
    Unlink,
    RefreshCw,
    Loader2,
    CheckCircle,
    Download,
    ExternalLink,
    Clock,
} from "lucide-react"

interface CalendarIntegration {
    id: string
    provider: string
    sync_enabled: boolean
    last_synced_at: string | null
    created_at: string
}

export function CalendarSyncSettings() {
    const { toast } = useToast()
    const [integration, setIntegration] = useState<CalendarIntegration | null>(null)
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [disconnecting, setDisconnecting] = useState(false)
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        fetchIntegration()
    }, [])

    // Check URL params for connection result
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get("calendar_connected") === "true") {
            toast({
                title: "Google Calendar Connected!",
                description: "Your calendar is now syncing with EduSphere.",
            })
            // Clean URL
            window.history.replaceState({}, "", window.location.pathname)
            fetchIntegration()
        } else if (params.get("calendar_error")) {
            toast({
                title: "Connection Failed",
                description: "Failed to connect Google Calendar. Please try again.",
                variant: "destructive",
            })
            window.history.replaceState({}, "", window.location.pathname)
        }
    }, [])

    const fetchIntegration = async () => {
        try {
            const res = await fetch("/api/calendar/google/status")
            if (res.ok) {
                const data = await res.json()
                setIntegration(data.integration || null)
            }
        } catch {
            // Not connected
        } finally {
            setLoading(false)
        }
    }

    const handleConnect = () => {
        window.location.href = "/api/calendar/google/auth"
    }

    const handleSync = async () => {
        setSyncing(true)
        try {
            const res = await fetch("/api/calendar/google/sync", { method: "POST" })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Sync failed")
            }

            toast({
                title: "Sync Complete!",
                description: `Imported ${data.imported}, updated ${data.updated}, pushed ${data.pushed} events.`,
            })

            fetchIntegration()
        } catch (err: any) {
            toast({
                title: "Sync Failed",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setSyncing(false)
        }
    }

    const handleDisconnect = async () => {
        if (!confirm("Disconnect Google Calendar? Synced events will be removed.")) return

        setDisconnecting(true)
        try {
            const res = await fetch("/api/calendar/google/disconnect", { method: "POST" })
            if (!res.ok) throw new Error("Disconnect failed")

            setIntegration(null)
            toast({
                title: "Disconnected",
                description: "Google Calendar has been disconnected.",
            })
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setDisconnecting(false)
        }
    }

    const handleExport = async () => {
        setExporting(true)
        try {
            const res = await fetch("/api/calendar/export")
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Export failed")
            }

            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "edusphere-calendar.ics"
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            toast({
                title: "Export Complete",
                description: "Calendar file downloaded. Import it into any calendar app.",
            })
        } catch (err: any) {
            toast({
                title: "Export Failed",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setExporting(false)
        }
    }

    if (loading) {
        return (
            <GlassSurface className="p-6">
                <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-foreground/40" />
                    <span className="text-foreground/50 text-sm">Loading calendar settings…</span>
                </div>
            </GlassSurface>
        )
    }

    return (
        <GlassSurface className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-green-500/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-foreground">Calendar Integrations</h3>
                    <p className="text-sm text-foreground/50">Sync with external calendars</p>
                </div>
            </div>

            {/* Google Calendar Section */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Google Calendar Icon */}
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="4" width="18" height="18" rx="3" stroke="#4285F4" strokeWidth="2" />
                                <line x1="3" y1="10" x2="21" y2="10" stroke="#4285F4" strokeWidth="2" />
                                <line x1="9" y1="4" x2="9" y2="1" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
                                <line x1="15" y1="4" x2="15" y2="1" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="8" cy="15" r="1.5" fill="#EA4335" />
                                <circle cx="12" cy="15" r="1.5" fill="#FBBC05" />
                                <circle cx="16" cy="15" r="1.5" fill="#34A853" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-semibold text-foreground text-sm">Google Calendar</p>
                            {integration ? (
                                <div className="flex items-center gap-1.5 text-xs text-green-400">
                                    <CheckCircle className="h-3 w-3" />
                                    <span>Connected</span>
                                </div>
                            ) : (
                                <p className="text-xs text-foreground/40">Not connected</p>
                            )}
                        </div>
                    </div>

                    {integration ? (
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleSync}
                                disabled={syncing}
                                className="border-white/10 hover:bg-white/5 text-xs"
                            >
                                {syncing ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                ) : (
                                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                                )}
                                {syncing ? "Syncing…" : "Sync Now"}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleDisconnect}
                                disabled={disconnecting}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                            >
                                {disconnecting ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                ) : (
                                    <Unlink className="h-3.5 w-3.5 mr-1" />
                                )}
                                Disconnect
                            </Button>
                        </div>
                    ) : (
                        <Button
                            size="sm"
                            onClick={handleConnect}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
                        >
                            <Link2 className="h-3.5 w-3.5 mr-1" />
                            Connect
                        </Button>
                    )}
                </div>

                {integration?.last_synced_at && (
                    <div className="flex items-center gap-1.5 text-xs text-foreground/40 pl-11">
                        <Clock className="h-3 w-3" />
                        <span>
                            Last synced{" "}
                            {new Date(integration.last_synced_at).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>
                )}
            </div>

            {/* Export Section */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <Download className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground text-sm">Export Calendar</p>
                            <p className="text-xs text-foreground/40">Download as .ics for Apple, Outlook, etc.</p>
                        </div>
                    </div>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExport}
                        disabled={exporting}
                        className="border-white/10 hover:bg-white/5 text-xs"
                    >
                        {exporting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        ) : (
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        )}
                        {exporting ? "Exporting…" : "Export .ics"}
                    </Button>
                </div>
            </div>
        </GlassSurface>
    )
}

export default CalendarSyncSettings
