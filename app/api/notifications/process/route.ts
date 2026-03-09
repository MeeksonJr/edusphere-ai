import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const newNotifications = []

    // 1. Check for Study Decay (Low Mastery)
    const { data: analytics } = await supabase
      .from("learning_analytics")
      .select("topic, mastery_score, last_studied")
      .eq("user_id", user.id)
      .lt("mastery_score", 50) // Less than 50% mastery

    if (analytics && analytics.length > 0) {
      for (const item of analytics) {
        // Prevent spam: Check if we already notified them about this topic recently
        const { data: existingNotif } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", user.id)
          .eq("type", "study_decay")
          .ilike("title", `%${item.topic}%`)
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Within last 24h
          .maybeSingle()

        if (!existingNotif) {
          newNotifications.push({
            user_id: user.id,
            type: "study_decay",
            title: `Low Mastery in ${item.topic}`,
            message: `Your mastery for ${item.topic} has dropped to ${item.mastery_score}%. Time for a quick review!`,
            icon: "📉",
            action_url: `/dashboard/analytics`,
            read: false,
          })
        }
      }
    }

    // 2. Check for upcoming deadlines (due in next 2 days)
    const twoDaysFromNow = new Date()
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)

    const { data: assignments } = await supabase
      .from("assignments")
      .select("id, title")
      .eq("user_id", user.id)
      .eq("status", "ongoing")
      .lte("due_date", twoDaysFromNow.toISOString())
      .gt("due_date", new Date().toISOString()) // Still in the future

    if (assignments && assignments.length > 0) {
        for (const item of assignments) {
            const { data: existingNotif } = await supabase
              .from("notifications")
              .select("id")
              .eq("user_id", user.id)
              .eq("type", "deadline")
              .ilike("title", `%${item.title}%`)
              .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Within last 24h
              .maybeSingle()

            if (!existingNotif) {
                newNotifications.push({
                  user_id: user.id,
                  type: "deadline",
                  title: `Upcoming Deadline: ${item.title}`,
                  message: `You have an assignment due soon. Don't forget to submit it!`,
                  icon: "⏳",
                  action_url: `/dashboard/assignments`,
                  read: false,
                })
            }
        }
    }

    // Insert new notifications if we found any
    if (newNotifications.length > 0) {
      await supabase.from("notifications").insert(newNotifications)
    }

    return NextResponse.json({ 
        success: true, 
        processed: newNotifications.length,
        message: `Generated ${newNotifications.length} smart notifications.`
    })

  } catch (error: any) {
    console.error("Error processing notifications:", error)
    return NextResponse.json({ error: error.message || "Failed to process notifications" }, { status: 500 })
  }
}
