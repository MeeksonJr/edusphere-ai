"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/components/supabase-provider"
import { Mail, CheckCircle, Loader2, RefreshCw, ArrowRight } from "lucide-react"
import Link from "next/link"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()
  const [email, setEmail] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    // Get email from URL params if available
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }

    // Check if user is already verified
    const checkVerification = async () => {
      if (!supabase) return

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setEmail(user.email || "")
          if (user.email_confirmed_at) {
            setVerified(true)
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push("/dashboard")
            }, 2000)
          }
        }
      } catch (error) {
        console.error("Error checking verification:", error)
      }
    }

    checkVerification()

    // Poll for email verification status (only if not verified)
    if (!verified) {
      const interval = setInterval(() => {
        checkVerification()
      }, 3000) // Check every 3 seconds

      return () => clearInterval(interval)
    }
  }, [supabase, router, searchParams, verified])

  const handleResendEmail = async () => {
    if (!supabase || !email) {
      setError("Email address is required")
      return
    }

    setResending(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      })

      if (error) throw error

      setMessage("Verification email sent! Please check your inbox.")
    } catch (error: any) {
      setError(error.message || "Failed to resend verification email")
    } finally {
      setResending(false)
    }
  }

  const handleCheckVerification = async () => {
    if (!supabase) return

    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.email_confirmed_at) {
        setVerified(true)
        router.push("/dashboard")
      } else {
        setError("Email not yet verified. Please check your inbox and click the verification link.")
      }
    } catch (error: any) {
      setError(error.message || "Failed to check verification status")
    } finally {
      setLoading(false)
    }
  }

  if (verified) {
    return (
      <PublicLayout navbarVariant="default">
        <div className="min-h-screen flex items-center justify-center py-20 px-4">
          <div className="max-w-md w-full">
            <ScrollReveal direction="up">
              <GlassSurface className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2 text-white">Email Verified!</h1>
                <p className="text-white/70 mb-6">Your email has been successfully verified.</p>
                <p className="text-white/60 text-sm mb-6">Redirecting to your dashboard...</p>
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </GlassSurface>
            </ScrollReveal>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout navbarVariant="default">
      <div className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full">
          <ScrollReveal direction="up">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-white">Verify Your</span>{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                  Email
                </span>
              </h1>
              <p className="text-white/70">We've sent a verification link to your email</p>
            </div>

            {/* Verification Form */}
            <GlassSurface className="p-8">
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {message && (
                <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <p className="text-green-400 text-sm">{message}</p>
                </div>
              )}

              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-white/80 mb-2">
                    We've sent a verification email to:
                  </p>
                  <p className="text-cyan-400 font-semibold">{email || "your email"}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-white/70 text-sm mb-2">📧 Check your inbox</p>
                  <p className="text-white/60 text-xs">
                    Click the verification link in the email we sent to activate your account.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleCheckVerification}
                    disabled={loading || !supabase}
                    className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        I've Verified My Email
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleResendEmail}
                    disabled={resending || !email || !supabase}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-center text-white/60 text-sm">
                    Didn't receive the email? Check your spam folder or{" "}
                    <button
                      onClick={handleResendEmail}
                      disabled={resending || !email}
                      className="text-cyan-400 hover:text-cyan-300 underline"
                    >
                      resend it
                    </button>
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Link href="/login" className="block text-center text-white/70 hover:text-white text-sm">
                    Back to Login
                  </Link>
                </div>
              </div>
            </GlassSurface>
          </ScrollReveal>
        </div>
      </div>
    </PublicLayout>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <PublicLayout navbarVariant="default">
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </PublicLayout>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
