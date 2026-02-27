import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { stripe, PRODUCT_TO_TIER } from "@/lib/stripe"

export async function GET(req: NextRequest) {
    const sessionId = req.nextUrl.searchParams.get("session_id")

    if (!sessionId) {
        return NextResponse.json({ error: "Missing session_id" }, { status: 400 })
    }

    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        // Retrieve the checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["subscription", "subscription.items.data.price.product"],
        })

        if (session.payment_status !== "paid") {
            return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
        }

        // Get the tier from session metadata or product mapping
        let tier = session.metadata?.tier || "free"

        // If no tier in metadata, try to determine from subscription product
        if (tier === "free" && session.subscription) {
            const subscription = session.subscription as any
            const productId = subscription?.items?.data?.[0]?.price?.product?.id ||
                subscription?.items?.data?.[0]?.price?.product
            if (productId && PRODUCT_TO_TIER[productId]) {
                tier = PRODUCT_TO_TIER[productId]
            }
        }

        // Update the user's profile
        const { error: updateError } = await (supabase as any)
            .from("profiles")
            .update({
                subscription_tier: tier,
                subscription_id: typeof session.subscription === "string"
                    ? session.subscription
                    : (session.subscription as any)?.id,
                subscription_status: "active",
                stripe_customer_id: typeof session.customer === "string"
                    ? session.customer
                    : (session.customer as any)?.id,
                subscription_last_updated: new Date().toISOString(),
            })
            .eq("id", user.id)

        if (updateError) {
            console.error("Failed to update profile:", updateError)
            return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            tier,
            status: "active",
        })
    } catch (error: any) {
        console.error("Session verification error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to verify session" },
            { status: 500 }
        )
    }
}
