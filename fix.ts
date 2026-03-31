import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"
import { config } from "dotenv"
config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function run() {
  const { data: courses } = await supabase.from("courses").select("id, layout").eq('status', 'completed')
  for (const course of courses || []) {
    const layout = course.layout as any
    if (!layout || !layout.chapters) continue
    
    // Convert to UUID if needed
    const slideRows = []
    let i = 0
    for (const chapter of layout.chapters) {
      if (!chapter.chapterId.match(/^[0-9a-f]{8}-/i)) chapter.chapterId = crypto.randomUUID()
      for (const slide of chapter.slides || []) {
        if (!slide.slideId.match(/^[0-9a-f]{8}-/i)) slide.slideId = crypto.randomUUID()
        slideRows.push({
          course_id: course.id,
          chapter_id: chapter.chapterId,
          slide_id: slide.slideId,
          slide_type: slide.type,
          content: slide.content,
          template_data: { type: slide.type, content: slide.content },
          order_index: i++
        })
      }
    }
    
    if (slideRows.length > 0) {
      // update layout since we mutated invalid ids
      await supabase.from("courses").update({ layout }).eq('id', course.id)
      const { error } = await supabase.from("course_slides").insert(slideRows)
      if (error && !error.message.includes("duplicate key")) {
        console.error("Failed to insert for", course.id, error)
      } else {
        console.log("Fixed course", course.id)
      }
    }
  }
}
run()
