import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { stripe } from "@/lib/stripe"

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: profile } = await (supabase as any)
            .from("profiles")
            .select("stripe_customer_id")
            .eq("id", user.id)
            .single()

        if (!profile?.stripe_customer_id) {
            return NextResponse.json(
                { error: "No active subscription found" },
                { status: 400 }
            )
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: `${req.nextUrl.origin}/dashboard/subscription`,
        })

        return NextResponse.json({ url: session.url })
    } catch (error: any) {
        console.error("Stripe portal error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to create portal session" },
            { status: 500 }
        )
    }
}
