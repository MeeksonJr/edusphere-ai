import { generateEdgeTTS } from "./lib/edge-tts"

async function test() {
    try {
        console.log("Testing ChristopherNeural...")
        const res = await generateEdgeTTS({ text: "Hello world, this is Christopher.", voice: "en-US-ChristopherNeural" })
        console.log("Christopher length:", res.buffer.length)
    } catch (e) {
        console.error("Christopher failed:", e)
    }

    try {
        console.log("Testing GuyNeural...")
        const res2 = await generateEdgeTTS({ text: "Hello world, this is Guy.", voice: "en-US-GuyNeural" })
        console.log("Guy length:", res2.buffer.length)
    } catch (e) {
        console.error("Guy failed:", e)
    }
}
test()
