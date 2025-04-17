"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CheckCircle2, Edit, Trash2 } from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"

export function AssignmentActions({ assignment }: { assignment: any }) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.from("assignments").delete().eq("id", assignment.id)

      if (error) throw error

      toast({
        title: "Assignment Deleted",
        description: "The assignment has been deleted successfully.",
      })

      router.push("/dashboard/assignments")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete assignment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async () => {
    setLoading(true)
    try {
      const newStatus = assignment.status === "completed" ? "ongoing" : "completed"

      const { error } = await supabase.from("assignments").update({ status: newStatus }).eq("id", assignment.id)

      if (error) throw error

      toast({
        title: `Assignment ${newStatus === "completed" ? "Completed" : "Marked as Ongoing"}`,
        description: `The assignment has been ${newStatus === "completed" ? "marked as completed" : "moved back to ongoing"}.`,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update assignment status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" className="border-gray-700" onClick={toggleStatus} disabled={loading}>
        <CheckCircle2 className="mr-2 h-4 w-4" />
        {assignment.status === "completed" ? "Mark as Ongoing" : "Mark as Completed"}
      </Button>

      <Link href={`/dashboard/assignments/${assignment.id}/edit`}>
        <Button variant="outline" size="icon" className="border-gray-700">
          <Edit className="h-4 w-4" />
        </Button>
      </Link>

      <Button
        variant="outline"
        size="icon"
        className="border-gray-700 hover:bg-red-900/20 hover:text-red-400 hover:border-red-800"
        onClick={() => setDeleteDialogOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will permanently delete the assignment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 hover:bg-gray-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-900 hover:bg-red-800 text-white"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
