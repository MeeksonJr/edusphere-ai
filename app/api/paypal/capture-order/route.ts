import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { orderId, userId, tier } = await request.json()

    if (!orderId || !userId || !tier) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "PayPal credentials not configured" }, { status: 500 })
    }

    // Get access token
    const tokenResponse = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    })

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.json()
      console.error("PayPal token error:", tokenError)
      return NextResponse.json(
        { error: `Failed to get PayPal access token: ${JSON.stringify(tokenError)}` },
        { status: 500 },
      )
    }

    const { access_token } = await tokenResponse.json()

    // Capture order
    const captureResponse = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!captureResponse.ok) {
      const captureError = await captureResponse.json()
      console.error("PayPal capture error:", captureError)
      return NextResponse.json(
        { error: `Failed to capture PayPal order: ${JSON.stringify(captureError)}` },
        { status: 500 },
      )
    }

    const captureData = await captureResponse.json()

    // Update user's subscription in database
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_tier: tier,
        subscription_id: orderId,
        subscription_status: "ACTIVE",
        subscription_updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Database update error:", updateError)
      return NextResponse.json(
        { error: `Failed to update subscription in database: ${updateError.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Payment captured successfully",
      data: captureData,
    })
  } catch (error: any) {
    console.error("Error capturing PayPal order:", error)
    return NextResponse.json({ error: error.message || "Failed to capture order" }, { status: 500 })
  }
}
