import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <Skeleton className="h-10 w-48 bg-gray-800" />
        <Skeleton className="h-5 w-64 mt-2 bg-gray-800" />
      </div>

      <Skeleton className="h-10 w-96 mb-6 bg-gray-800" />

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="h-[400px] mb-4 flex items-center justify-center">
            <Skeleton className="h-20 w-20 rounded-full bg-gray-800" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-20 flex-1 bg-gray-800" />
            <Skeleton className="h-10 w-10 self-end bg-gray-800" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
