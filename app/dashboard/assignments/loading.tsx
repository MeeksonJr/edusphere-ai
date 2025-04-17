import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <Skeleton className="h-10 w-48 bg-gray-800" />
          <Skeleton className="h-5 w-64 mt-2 bg-gray-800" />
        </div>
        <Skeleton className="h-10 w-40 mt-4 md:mt-0 bg-gray-800" />
      </div>

      {/* Filters Skeleton */}
      <Card className="glass-card mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 flex-1 bg-gray-800" />
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 bg-gray-800" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List Skeleton */}
      <div className="grid gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <Skeleton className="h-10 w-10 bg-gray-800" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-48 bg-gray-800" />
                    <Skeleton className="h-4 w-24 bg-gray-800" />
                  </div>
                  <Skeleton className="h-4 w-full bg-gray-800" />
                  <Skeleton className="h-4 w-3/4 bg-gray-800" />
                  <div className="flex items-center pt-1 gap-2">
                    <Skeleton className="h-5 w-16 bg-gray-800" />
                    <Skeleton className="h-5 w-16 bg-gray-800" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
