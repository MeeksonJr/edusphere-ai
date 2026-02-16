"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

// PayPal API integration
// Documentation: https://developer.paypal.com/docs/api/subscriptions/v1/

export interface PayPalPlan {
  id: string
  name: string
  description: string
  status: string
  billing_cycles: {
    frequency: {
      interval_unit: string
      interval_count: number
    }
    tenure_type: string
    sequence: number
    total_cycles: number
    pricing_scheme: {
      fixed_price: {
        value: string
        currency_code: string
      }
    }
  }[]
  payment_preferences: {
    auto_bill_outstanding: boolean
    setup_fee: {
      value: string
      currency_code: string
    }
    setup_fee_failure_action: string
    payment_failure_threshold: number
  }
  taxes: {
    percentage: string
    inclusive: boolean
  }
}

export interface PayPalSubscription {
  id: string
  status: string
  plan_id: string
  start_time: string
  quantity: string
  subscriber: {
    email_address: string
    name: {
      given_name: string
      surname: string
    }
    shipping_address: {
      address: {
        address_line_1: string
        address_line_2: string
        admin_area_2: string
        admin_area_1: string
        postal_code: string
        country_code: string
      }
    }
  }
  billing_info: {
    outstanding_balance: {
      value: string
      currency_code: string
    }
    cycle_executions: {
      tenure_type: string
      sequence: number
      cycles_completed: number
      cycles_remaining: number
      current_pricing_scheme_version: number
      total_cycles: number
    }[]
    last_payment: {
      amount: {
        value: string
        currency_code: string
      }
      time: string
    }
    next_billing_time: string
    failed_payments_count: number
  }
  create_time: string
  update_time: string
  links: {
    href: string
    rel: string
    method: string
  }[]
}

// Get PayPal access token
async function getAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured")
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const response = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to get PayPal access token: ${error.error_description || JSON.stringify(error)}`)
  }

  const data = await response.json()
  return data.access_token
}

// Create a subscription
export async function createSubscription(
  planId: string,
  userId: string,
  userEmail: string,
  returnUrl: string,
  cancelUrl: string,
): Promise<{ id: string; approvalUrl: string }> {
  try {
    const accessToken = await getAccessToken()

    // Use the email passed from the client
    const email = userEmail || "customer@example.com"

    const response = await fetch("https://api-m.sandbox.paypal.com/v1/billing/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        plan_id: planId,
        subscriber: {
          name: {
            given_name: "EduSphere",
            surname: "User",
          },
          email_address: email,
        },
        application_context: {
          brand_name: "EduSphere AI",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          payment_method: {
            payer_selected: "PAYPAL",
            payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
          },
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("PayPal API error response:", error)
      throw new Error(
        `Failed to create PayPal subscription: ${error.message || error.error_description || JSON.stringify(error)}`,
      )
    }

    const data = await response.json()

    // Find the approval URL
    const approvalLink = data.links.find((link: any) => link.rel === "approve")
    if (!approvalLink) {
      throw new Error("No approval URL found in PayPal response")
    }

    return {
      id: data.id,
      approvalUrl: approvalLink.href,
    }
  } catch (error: any) {
    console.error("Error creating PayPal subscription:", error)
    throw new Error(`Error creating PayPal subscription: ${error.message}`)
  }
}

// Update subscription in database
export async function updateSubscription(subscriptionId: string, tier: string, userId: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_tier: tier,
        subscription_id: subscriptionId,
        subscription_status: "ACTIVE",
        subscription_last_updated: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) throw error

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/subscription")

    return { success: true }
  } catch (error: any) {
    console.error("Error updating subscription in database:", error)
    throw new Error(`Failed to update subscription: ${error.message}`)
  }
}

// Get subscription details
export async function getSubscription(subscriptionId: string): Promise<PayPalSubscription> {
  try {
    const accessToken = await getAccessToken()

    const response = await fetch(`https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to get PayPal subscription: ${error.error_description || JSON.stringify(error)}`)
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error("Error fetching PayPal subscription:", error)
    throw error
  }
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string, reason: string): Promise<void> {
  try {
    const accessToken = await getAccessToken()

    const response = await fetch(`https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        reason,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to cancel PayPal subscription: ${error.error_description || JSON.stringify(error)}`)
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/subscription")
  } catch (error: any) {
    console.error("Error canceling PayPal subscription:", error)
    throw error
  }
}
