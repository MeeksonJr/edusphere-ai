"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import {
    Calendar,
    Clock,
    MapPin,
    Sparkles,
    Trash2,
    BookOpen,
    FileText,
    ExternalLink,
    Tag,
    Loader2,
} from "lucide-react"

interface EventDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    event: any
    onDelete?: (eventId: string) => void
    onOpenAI?: (event: any) => void
}

export function EventDetailDialog({
    open,
    onOpenChange,
    event,
    onDelete,
    onOpenAI,
}: EventDetailDialogProps) {
    const { supabase } = useSupabase()
    const { toast } = useToast()
    const [deleting, setDeleting] = useState(false)

    if (!event) return null

    const isAssignment = event.type === "assignment"
    const startDate = event.start ? new Date(event.start) : null
    const endDate = event.end ? new Date(event.end) : null

    const formatDate = (date: Date | null) => {
        if (!date) return "No date"
        return date.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const formatTime = (date: Date | null) => {
        if (!date) return ""
        return date.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const handleDelete = async () => {
        if (!event.id || !supabase) return

        setDeleting(true)
        try {
            const table = isAssignment ? "assignments" : "calendar_events"
            const { error } = await supabase.from(table).delete().eq("id", event.id)

            if (error) throw error

            toast({
                title: "Event deleted",
                description: `"${event.title}" has been removed from your calendar.`,
            })

            onDelete?.(event.id)
            onOpenChange(false)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete event",
                variant: "destructive",
            })
        } finally {
            setDeleting(false)
        }
    }

    const handleOpenAI = () => {
        onOpenChange(false)
        // slight delay so the detail dialog closes before AI dialog opens
        setTimeout(() => {
            onOpenAI?.(event)
        }, 150)
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-500/20 text-red-400 border-red-500/30"
            case "medium":
                return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            case "low":
                return "bg-green-500/20 text-green-400 border-green-500/30"
            default:
                return "bg-gray-500/20 text-gray-400 border-gray-500/30"
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-500/20 text-green-400 border-green-500/30"
            case "ongoing":
                return "bg-blue-500/20 text-blue-400 border-blue-500/30"
            default:
                return "bg-gray-500/20 text-gray-400 border-gray-500/30"
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] bg-gray-900 border-gray-800 max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-xl leading-tight">{event.title}</DialogTitle>
                            <DialogDescription className="mt-1.5 text-gray-400">
                                {isAssignment ? "Assignment" : "Calendar Event"} Details
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 mt-1">
                            {isAssignment && event.priority && (
                                <Badge className={`text-xs ${getPriorityColor(event.priority)}`}>
                                    {event.priority}
                                </Badge>
                            )}
                            {isAssignment && event.status && (
                                <Badge className={`text-xs ${getStatusColor(event.status)}`}>
                                    {event.status}
                                </Badge>
                            )}
                            {!isAssignment && (
                                <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                                    Event
                                </Badge>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                {/* Event Details */}
                <div className="space-y-4 mt-4">
                    {/* Date & Time */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                        <Calendar className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-white">{formatDate(startDate)}</p>
                            {startDate && (
                                <p className="text-sm text-gray-400 mt-0.5">
                                    <Clock className="h-3.5 w-3.5 inline mr-1" />
                                    {formatTime(startDate)}
                                    {endDate && startDate.getTime() !== endDate.getTime() && (
                                        <> — {formatTime(endDate)}</>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Location */}
                    {event.location && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                            <MapPin className="h-5 w-5 text-pink-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-white">Location</p>
                                <p className="text-sm text-gray-400">{event.location}</p>
                            </div>
                        </div>
                    )}

                    {/* Subject */}
                    {event.subject && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                            <Tag className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-white">Subject</p>
                                <p className="text-sm text-gray-400">{event.subject}</p>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {event.description && (
                        <div className="p-3 rounded-lg bg-gray-800/50">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-cyan-400" />
                                <p className="text-sm font-medium text-white">Description</p>
                            </div>
                            <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">
                                {event.description}
                            </p>
                        </div>
                    )}

                    {/* Source badge for imported events */}
                    {event.source && (
                        <div className="flex items-center gap-2">
                            <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
                            <span className="text-xs text-gray-500">
                                Source: {event.source.startsWith("url:") ? "Imported from URL" : event.source.startsWith("file:") ? "Imported from file" : event.source}
                            </span>
                        </div>
                    )}
                </div>

                {/* AI Action Buttons */}
                <div className="mt-6 space-y-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                        AI Actions
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="outline"
                            className="border-gray-700 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:to-purple-500/20 text-cyan-400 border-cyan-500/30"
                            onClick={handleOpenAI}
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Study Resources
                        </Button>
                        <Button
                            variant="outline"
                            className="border-gray-700 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 text-purple-400 border-purple-500/30"
                            onClick={handleOpenAI}
                        >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Generate Notes
                        </Button>
                    </div>
                </div>

                <DialogFooter className="mt-6 flex items-center justify-between gap-2 sm:justify-between">
                    <Button
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        {deleting ? "Deleting..." : "Delete"}
                    </Button>
                    <Button
                        variant="outline"
                        className="border-gray-700"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
