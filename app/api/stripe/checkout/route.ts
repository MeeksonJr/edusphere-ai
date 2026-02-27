import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { stripe, STRIPE_PRICES, type SubscriptionTier } from "@/lib/stripe"

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { tier } = (await req.json()) as { tier: SubscriptionTier }

        if (!tier || !STRIPE_PRICES[tier as keyof typeof STRIPE_PRICES]) {
            return NextResponse.json({ error: "Invalid tier" }, { status: 400 })
        }

        // Get or create Stripe customer
        const { data: profile } = await (supabase as any)
            .from("profiles")
            .select("stripe_customer_id, full_name")
            .eq("id", user.id)
            .single()

        let customerId = profile?.stripe_customer_id

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: profile?.full_name || undefined,
                metadata: { supabase_user_id: user.id },
            })
            customerId = customer.id

            await (supabase as any)
                .from("profiles")
                .update({ stripe_customer_id: customerId })
                .eq("id", user.id)
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: STRIPE_PRICES[tier as keyof typeof STRIPE_PRICES],
                    quantity: 1,
                },
            ],
            success_url: `${req.nextUrl.origin}/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.nextUrl.origin}/dashboard/subscription`,
            metadata: {
                supabase_user_id: user.id,
                tier,
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (error: any) {
        console.error("Stripe checkout error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to create checkout session" },
            { status: 500 }
        )
    }
}
