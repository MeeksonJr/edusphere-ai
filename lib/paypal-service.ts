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
    throw new Error(`Failed to get PayPal access token: ${error.error_description}`)
  }

  const data = await response.json()
  return data.access_token
}

// Get all plans
export async function getPlans(): Promise<PayPalPlan[]> {
  try {
    const accessToken = await getAccessToken()

    const response = await fetch("https://api-m.sandbox.paypal.com/v1/billing/plans", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to get PayPal plans: ${error.error_description}`)
    }

    const data = await response.json()
    return data.plans
  } catch (error) {
    console.error("Error fetching PayPal plans:", error)
    throw error
  }
}

// Create a subscription
export async function createSubscription(planId: string, userId: string): Promise<PayPalSubscription> {
  try {
    const accessToken = await getAccessToken()

    const response = await fetch("https://api-m.sandbox.paypal.com/v1/billing/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        subscriber: {
          name: {
            given_name: "John",
            surname: "Doe",
          },
          email_address: "customer@example.com",
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
          return_url: `${window.location.origin}/dashboard/subscription/success?user_id=${userId}`,
          cancel_url: `${window.location.origin}/dashboard/subscription/cancel`,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to create PayPal subscription: ${error.error_description}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error creating PayPal subscription:", error)
    throw error
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
      throw new Error(`Failed to get PayPal subscription: ${error.error_description}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
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
      throw new Error(`Failed to cancel PayPal subscription: ${error.error_description}`)
    }
  } catch (error) {
    console.error("Error canceling PayPal subscription:", error)
    throw error
  }
}

// Suspend subscription
export async function suspendSubscription(subscriptionId: string, reason: string): Promise<void> {
  try {
    const accessToken = await getAccessToken()

    const response = await fetch(
      `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}/suspend`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          reason,
        }),
      },
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to suspend PayPal subscription: ${error.error_description}`)
    }
  } catch (error) {
    console.error("Error suspending PayPal subscription:", error)
    throw error
  }
}

// Activate subscription
export async function activateSubscription(subscriptionId: string, reason: string): Promise<void> {
  try {
    const accessToken = await getAccessToken()

    const response = await fetch(
      `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}/activate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          reason,
        }),
      },
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to activate PayPal subscription: ${error.error_description}`)
    }
  } catch (error) {
    console.error("Error activating PayPal subscription:", error)
    throw error
  }
}
