import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <Skeleton className="h-10 w-64 bg-gray-800" />
        <Skeleton className="h-5 w-48 mt-2 bg-gray-800" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24 bg-gray-800" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 bg-gray-800" />
              <Skeleton className="h-4 w-32 mt-2 bg-gray-800" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-card md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48 bg-gray-800" />
              <Skeleton className="h-8 w-20 bg-gray-800" />
            </div>
            <Skeleton className="h-4 w-32 mt-2 bg-gray-800" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <Skeleton className="h-10 w-10 bg-gray-800" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-full bg-gray-800" />
                    <Skeleton className="h-4 w-full bg-gray-800" />
                    <div className="flex items-center pt-1 space-x-2">
                      <Skeleton className="h-4 w-16 bg-gray-800" />
                      <Skeleton className="h-4 w-16 bg-gray-800" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <Skeleton className="h-6 w-32 bg-gray-800" />
            <Skeleton className="h-4 w-48 mt-2 bg-gray-800" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-gray-800" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
