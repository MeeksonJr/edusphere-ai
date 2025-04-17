import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <Skeleton className="h-4 w-24 bg-gray-800 mb-4" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-10 w-64 bg-gray-800" />
          <div className="flex items-center mt-4 md:mt-0 space-x-2">
            <Skeleton className="h-9 w-40 bg-gray-800" />
            <Skeleton className="h-9 w-9 bg-gray-800" />
            <Skeleton className="h-9 w-9 bg-gray-800" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Skeleton className="h-6 w-20 bg-gray-800" />
          <Skeleton className="h-6 w-24 bg-gray-800" />
          <Skeleton className="h-6 w-20 bg-gray-800" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-gray-800" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full bg-gray-800 mb-2" />
              <Skeleton className="h-4 w-full bg-gray-800 mb-2" />
              <Skeleton className="h-4 w-3/4 bg-gray-800" />
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <Skeleton className="h-6 w-48 bg-gray-800" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full bg-gray-800 mb-2" />
              <Skeleton className="h-4 w-full bg-gray-800 mb-2" />
              <Skeleton className="h-4 w-full bg-gray-800 mb-2" />
              <Skeleton className="h-4 w-3/4 bg-gray-800" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <Skeleton className="h-6 w-24 bg-gray-800" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Skeleton className="h-4 w-20 bg-gray-800 mb-2" />
                <Skeleton className="h-5 w-40 bg-gray-800" />
              </div>

              <div>
                <Skeleton className="h-4 w-20 bg-gray-800 mb-2" />
                <Skeleton className="h-5 w-32 bg-gray-800" />
              </div>

              <div>
                <Skeleton className="h-4 w-20 bg-gray-800 mb-2" />
                <Skeleton className="h-5 w-40 bg-gray-800" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
