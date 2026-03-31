import fs from "fs"
const env = fs.readFileSync(".env.local", "utf8").split("\n").reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) acc[match[1]] = match[2]
  return acc
}, {})
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY

async function run() {
  const res = await fetch(`${supabaseUrl}/rest/v1/courses?select=id,layout&status=eq.completed`, { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } })
  const courses = await res.json()
  let crypto = (await import("crypto")).default
  
  const isValidUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  for (const course of courses) {
    if (!course.layout || !course.layout.chapters) continue
    const slideRows = []
    let order = 0
    let mutated = false
    for (const chapter of course.layout.chapters) {
      if (!isValidUUID(chapter.chapterId)) { chapter.chapterId = crypto.randomUUID(); mutated = true }
      for (const slide of chapter.slides || []) {
        if (!isValidUUID(slide.slideId)) { slide.slideId = crypto.randomUUID(); mutated = true }
        slideRows.push({
          course_id: course.id,
          chapter_id: chapter.chapterId,
          slide_id: slide.slideId,
          slide_type: slide.type,
          content: slide.content,
          template_data: { type: slide.type, content: slide.content },
          order_index: order++
        })
      }
    }
    if (slideRows.length > 0) {
      if (mutated) {
        await fetch(`${supabaseUrl}/rest/v1/courses?id=eq.${course.id}`, { method: "PATCH", headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ layout: course.layout }) })
      }
      const insRes = await fetch(`${supabaseUrl}/rest/v1/course_slides`, { method: "POST", headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", "Prefer": "resolution=ignore-duplicates" }, body: JSON.stringify(slideRows) })
      if (!insRes.ok) console.log("Failed to insert for", course.id, await insRes.text())
      else console.log("Fixed course slides:", course.id)
    }
  }
}
run()
