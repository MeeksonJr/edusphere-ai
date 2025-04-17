"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

declare global {
  interface Window {
    paypal: any
  }
}

interface PayPalButtonProps {
  planId: string
  tier: "pro" | "ultimate"
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function PayPalButton({ planId, tier, onSuccess, onError }: PayPalButtonProps) {
  const paypalButtonRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  // Load PayPal script
  useEffect(() => {
    const loadPayPalScript = () => {
      // Remove any existing PayPal script to avoid duplicates
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]')
      if (existingScript) {
        document.body.removeChild(existingScript)
      }

      const script = document.createElement("script")
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD&intent=capture`
      script.async = true
      script.onload = () => setScriptLoaded(true)
      script.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to load PayPal script. Please try again later.",
          variant: "destructive",
        })
        if (onError) onError(new Error("Failed to load PayPal script"))
      }
      document.body.appendChild(script)
    }

    loadPayPalScript()

    return () => {
      // Clean up script if component unmounts
      const script = document.querySelector('script[src*="paypal.com/sdk/js"]')
      if (script) {
        document.body.removeChild(script)
      }
    }
  }, [toast, onError])

  // Initialize PayPal button
  useEffect(() => {
    if (!scriptLoaded || !paypalButtonRef.current) return

    const initializePayPalButton = async () => {
      try {
        setLoading(true)

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          throw new Error("User not authenticated")
        }

        // Get plan details based on tier
        const planDetails = {
          pro: {
            price: "6.99",
            description: "EduSphere Pro Plan - Monthly Subscription",
          },
          ultimate: {
            price: "12.99",
            description: "EduSphere Ultimate Plan - Monthly Subscription",
          },
        }[tier]

        // Render PayPal button
        window.paypal
          .Buttons({
            style: {
              shape: "rect",
              color: "blue",
              layout: "vertical",
              label: "pay",
            },
            createOrder: async () => {
              try {
                // Create order on server
                const response = await fetch("/api/paypal/create-order", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    userId: user.id,
                    tier,
                    amount: planDetails.price,
                    description: planDetails.description,
                  }),
                })

                if (!response.ok) {
                  const errorData = await response.json()
                  throw new Error(errorData.error || "Failed to create order")
                }

                const data = await response.json()
                return data.id
              } catch (error: any) {
                toast({
                  title: "Error",
                  description: error.message || "Failed to create order",
                  variant: "destructive",
                })
                if (onError) onError(error)
                throw error
              }
            },
            onApprove: async (data: any, actions: any) => {
              try {
                // Capture the order
                const response = await fetch("/api/paypal/capture-order", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    orderId: data.orderID,
                    userId: user.id,
                    tier,
                  }),
                })

                if (!response.ok) {
                  const errorData = await response.json()
                  throw new Error(errorData.error || "Failed to capture order")
                }

                toast({
                  title: "Subscription Successful",
                  description: `You have successfully subscribed to the ${
                    tier.charAt(0).toUpperCase() + tier.slice(1)
                  } plan.`,
                })

                if (onSuccess) onSuccess()

                // Redirect to dashboard
                router.push("/dashboard")
                router.refresh()
              } catch (error: any) {
                toast({
                  title: "Error",
                  description: error.message || "Failed to process payment",
                  variant: "destructive",
                })
                if (onError) onError(error)
              }
            },
            onError: (error: any) => {
              toast({
                title: "Error",
                description: error.message || "An error occurred with PayPal",
                variant: "destructive",
              })
              if (onError) onError(error)
            },
            onCancel: () => {
              toast({
                title: "Payment Cancelled",
                description: "You have cancelled the payment process.",
              })
            },
          })
          .render(paypalButtonRef.current)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to initialize PayPal",
          variant: "destructive",
        })
        if (onError) onError(error)
      } finally {
        setLoading(false)
      }
    }

    initializePayPalButton()
  }, [scriptLoaded, paypalButtonRef, supabase, toast, router, tier, onSuccess, onError])

  return (
    <div className="w-full">
      {loading && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Loading PayPal...</span>
        </div>
      )}
      <div ref={paypalButtonRef} className={loading ? "hidden" : ""}></div>
    </div>
  )
}
