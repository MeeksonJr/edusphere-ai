"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function SubscriptionCancelPage() {
  const router = useRouter()

  return (
    <div className="p-6 md:p-8 flex items-center justify-center min-h-[80vh]">
      <Card className="glass-card w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Subscription Cancelled</CardTitle>
          <CardDescription className="text-center">Your subscription process was cancelled</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-6 p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-yellow-100 p-3">
              <XCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-center">You have cancelled the subscription process.</p>
            <Button onClick={() => router.push("/dashboard/subscription")}>Return to Subscription Page</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
