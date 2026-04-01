import { createClient } from "@supabase/supabase-js"

const sup = createClient(
  "https://qyqbqgubsuxepnloduvd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5cWJxZ3Vic3V4ZXBubG9kdXZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODg4NjcwNiwiZXhwIjoyMDg0NDYyNzA2fQ.op9KYPARWKpAFECI64MTV6JUuVcD0rQwQqMkJuPBca8"
)

async function run() {
  const { data } = await sup.from("courses").select("id, status, audio_status").eq("id", "7f726a84-9855-40d9-ab5d-e5ad60e865bb")
  console.log("courses:", data)
  
  const { data: slides } = await sup.from("course_slides").select("id, slide_id, audio_url").eq("course_id", "7f726a84-9855-40d9-ab5d-e5ad60e865bb")
  console.log("course_slides counts:", slides?.length)
  console.log("slides with audio_url:", slides?.filter(s => s.audio_url).length)
  console.dir(slides, { depth: null })
}
run()
