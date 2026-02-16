import { createClient } from "@/utils/supabase/server"
import { Clock, BookOpen, CheckCircle, PlayCircle, Award } from "lucide-react"

async function getItemDetails(supabase: any, activity: any) {
    if (activity.course_id) {
        const { data } = await supabase.from("courses").select("title").eq("id", activity.course_id).single()
        return data?.title || "Unknown Course"
    }
    return "Unknown Item"
}

export async function RecentActivityList({ userId }: { userId: string }) {
    const supabase = createClient()

    const { data: activities } = await supabase
        .from("course_analytics")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(5)

    if (!activities || activities.length === 0) {
        return (
            <div className="text-center py-6">
                <p className="text-foreground/50 text-sm">No recent activity.</p>
            </div>
        )
    }

    // Enrich activities with course titles (mocking simple join for now as we loop)
    // In production, better to use a join query if possible or a separate lookup map
    const enrichedActivities = await Promise.all(activities.map(async (activity: any) => {
        let title = "Unknown Course"
        if (activity.course_id) {
            const { data } = await supabase.from("courses").select("title").eq("id", activity.course_id).single() as { data: any }
            title = data?.title || "Unknown Course"
        }
        return { ...activity, courseTitle: title }
    }))

    const getIcon = (type: string) => {
        switch (type) {
            case 'complete': return <CheckCircle className="h-4 w-4 text-green-400" />
            case 'view': return <BookOpen className="h-4 w-4 text-blue-400" />
            case 'quiz': return <Award className="h-4 w-4 text-purple-400" />
            case 'video': return <PlayCircle className="h-4 w-4 text-red-400" />
            default: return <Clock className="h-4 w-4 text-foreground/40" />
        }
    }

    const formatTime = (date: string) => {
        const d = new Date(date)
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="space-y-4">
            {enrichedActivities.map((activity) => (
                <div key={activity.id} className="relative pl-4 border-l-2 border-foreground/10 hover:border-cyan-500 transition-colors py-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="text-sm font-medium text-foreground line-clamp-1">
                                {activity.event_type === 'view' ? 'Viewed' :
                                    activity.event_type === 'complete' ? 'Completed' :
                                        activity.event_type === 'quiz' ? 'Took Quiz in' : 'Interacted with'} {activity.courseTitle}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                {getIcon(activity.event_type)}
                                <span className="text-xs text-foreground/50 capitalize">{activity.event_type.replace('_', ' ')}</span>
                            </div>
                        </div>
                        <span className="text-[10px] text-foreground/40 whitespace-nowrap ml-2">
                            {formatTime(activity.timestamp)}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}
