import { type NextRequest, NextResponse } from "next/server"
import { createSubscription } from "@/app/actions/paypal-actions"

export async function POST(request: NextRequest) {
  try {
    const { planId, userId, userEmail, tier, returnUrl, cancelUrl } = await request.json()

    if (!planId || !userId || !returnUrl || !cancelUrl) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const result = await createSubscription(
      planId,
      userId,
      userEmail || "customer@example.com",
      returnUrl.replace("{id}", "SUBSCRIPTION_ID"),
      cancelUrl,
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error creating subscription:", error)
    return NextResponse.json({ error: error.message || "Failed to create subscription" }, { status: 500 })
  }
}
