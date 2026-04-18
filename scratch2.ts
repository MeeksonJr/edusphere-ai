import { generateEdgeTTS } from "./lib/edge-tts"

async function test() {
    try {
        console.log("Testing ChristopherNeural...")
        const res = await generateEdgeTTS({ text: "Hello world, this is Christopher.", voice: "en-US-ChristopherNeural" })
        console.log("Christopher length:", res.buffer.length)
    } catch (e) {
        console.error("Christopher failed:", e)
    }
}
test()
