import { NextRequest, NextResponse } from "next/server"
import { stripe, PRODUCT_TO_TIER } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"

// Use admin client for webhook (no user session)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
    const body = await req.text()
    const sig = req.headers.get("stripe-signature")

    if (!sig) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    let event
    try {
        // If STRIPE_WEBHOOK_SECRET is set, verify the signature
        if (process.env.STRIPE_WEBHOOK_SECRET) {
            event = stripe.webhooks.constructEvent(
                body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            )
        } else {
            // In development without webhook secret, parse directly
            event = JSON.parse(body)
        }
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message)
        return NextResponse.json(
            { error: "Webhook signature verification failed" },
            { status: 400 }
        )
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object
                const userId = session.metadata?.supabase_user_id
                const tier = session.metadata?.tier

                if (userId && tier) {
                    await supabaseAdmin
                        .from("profiles")
                        .update({
                            subscription_tier: tier,
                            subscription_id: session.subscription,
                            subscription_status: "active",
                            stripe_customer_id: session.customer,
                            subscription_last_updated: new Date().toISOString(),
                        })
                        .eq("id", userId)
                }
                break
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object
                const customerId = subscription.customer

                // Look up user by Stripe customer ID
                const { data: profile } = await supabaseAdmin
                    .from("profiles")
                    .select("id")
                    .eq("stripe_customer_id", customerId)
                    .single()

                if (profile) {
                    // Determine tier from the product
                    const productId = subscription.items?.data?.[0]?.price?.product
                    const tier = PRODUCT_TO_TIER[productId] || "free"

                    await supabaseAdmin
                        .from("profiles")
                        .update({
                            subscription_tier: subscription.status === "active" ? tier : "free",
                            subscription_status: subscription.status,
                            subscription_last_updated: new Date().toISOString(),
                        })
                        .eq("id", profile.id)
                }
                break
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object
                const customerId = subscription.customer

                const { data: profile } = await supabaseAdmin
                    .from("profiles")
                    .select("id")
                    .eq("stripe_customer_id", customerId)
                    .single()

                if (profile) {
                    await supabaseAdmin
                        .from("profiles")
                        .update({
                            subscription_tier: "free",
                            subscription_status: "canceled",
                            subscription_id: null,
                            subscription_last_updated: new Date().toISOString(),
                        })
                        .eq("id", profile.id)
                }
                break
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object
                const customerId = invoice.customer

                const { data: profile } = await supabaseAdmin
                    .from("profiles")
                    .select("id")
                    .eq("stripe_customer_id", customerId)
                    .single()

                if (profile) {
                    await supabaseAdmin
                        .from("profiles")
                        .update({
                            subscription_status: "past_due",
                            subscription_last_updated: new Date().toISOString(),
                        })
                        .eq("id", profile.id)
                }
                break
            }
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error("Webhook handler error:", error)
        return NextResponse.json(
            { error: "Webhook handler failed" },
            { status: 500 }
        )
    }
}
