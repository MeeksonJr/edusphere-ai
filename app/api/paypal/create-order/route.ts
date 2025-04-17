import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId, tier, amount, description } = await request.json()

    if (!userId || !tier || !amount || !description) {
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

    // Create order
    const orderResponse = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount,
            },
            description: description,
            custom_id: `${userId}:${tier}`,
          },
        ],
        application_context: {
          brand_name: "EduSphere AI",
          landing_page: "BILLING",
          user_action: "PAY_NOW",
          return_url: `${request.nextUrl.origin}/dashboard/subscription/success`,
          cancel_url: `${request.nextUrl.origin}/dashboard/subscription/cancel`,
        },
      }),
    })

    if (!orderResponse.ok) {
      const orderError = await orderResponse.json()
      console.error("PayPal order error:", orderError)
      return NextResponse.json(
        { error: `Failed to create PayPal order: ${JSON.stringify(orderError)}` },
        { status: 500 },
      )
    }

    const orderData = await orderResponse.json()
    return NextResponse.json(orderData)
  } catch (error: any) {
    console.error("Error creating PayPal order:", error)
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 })
  }
}
