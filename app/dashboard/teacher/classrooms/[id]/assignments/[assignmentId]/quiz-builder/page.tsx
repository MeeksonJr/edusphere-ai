"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft, Plus, Trash2, Loader2, GripVertical, CheckCircle2,
  CircleDot, ToggleLeft, Save
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface Question {
  id: string
  question_text: string
  question_type: string
  options: string[]
  correct_answer: string
  points: number
  order_num: number
}

const DEFAULT_OPTIONS = ["", "", "", ""]

export default function QuizBuilderPage({ params }: { params: Promise<{ id: string; assignmentId: string }> }) {
  const { id: classroomId, assignmentId } = use(params)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [questions, setQuestions] = useState<Question[]>([])
  const [assignment, setAssignment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    question_text: "",
    question_type: "multiple_choice",
    options: [...DEFAULT_OPTIONS],
    correct_answer: "",
    points: 10,
  })

  useEffect(() => { loadData() }, [supabase, assignmentId])

  const loadData = async () => {
    if (!supabase) return
    try {
      setLoading(true)
      const { data: asn } = await supabase.from("classroom_assignments").select("*").eq("id", assignmentId).single()
      setAssignment(asn)
      const { data: qs } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("assignment_id", assignmentId)
        .order("order_num", { ascending: true })
        
      setQuestions((qs || []).map(q => ({
        ...q,
        question_type: q.question_type || "multiple_choice",
        points: q.points || 0,
        order_num: q.order_num || 0,
        options: (q.options as string[]) || []
      })))
    } catch (err: any) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleAdd = async () => {
    if (!supabase || !form.question_text.trim() || !form.correct_answer) return
    setSaving(true)
    try {
      const options = form.question_type === "true_false"
        ? ["True", "False"]
        : form.options.filter(o => o.trim())

      if (options.length < 2) {
        toast({ title: "Add at least 2 options", variant: "destructive" })
        setSaving(false)
        return
      }

      const { error } = await supabase.from("quiz_questions").insert({
        assignment_id: assignmentId,
        question_text: form.question_text.trim(),
        question_type: form.question_type,
        options,
        correct_answer: form.correct_answer,
        points: form.points,
        order_num: questions.length,
      })
      if (error) throw error
      toast({ title: "Question added!" })
      setForm({ question_text: "", question_type: "multiple_choice", options: [...DEFAULT_OPTIONS], correct_answer: "", points: 10 })
      setDialogOpen(false)
      loadData()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!supabase) return
    await supabase.from("quiz_questions").delete().eq("id", id)
    toast({ title: "Question removed" })
    loadData()
  }

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

  if (loading) return <div className="p-8 flex justify-center min-h-[60vh]"><LoadingSpinner /></div>

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
      <ScrollReveal direction="up">
        <Link href={`/dashboard/teacher/classrooms/${classroomId}/assignments`} className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground mb-6 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Assignments
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 text-transparent bg-clip-text">Quiz Builder</span>
            </h1>
            <p className="text-foreground/60">{assignment?.title}</p>
            <div className="flex gap-3 mt-2">
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                {questions.length} question{questions.length !== 1 ? "s" : ""}
              </Badge>
              <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
                {totalPoints} total points
              </Badge>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                <Plus className="mr-2 h-4 w-4" /> Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Question</DialogTitle>
                <DialogDescription>Create a multiple-choice or true/false question.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Question Type</Label>
                  <Select value={form.question_type} onValueChange={v => {
                    setForm(p => ({
                      ...p, question_type: v,
                      options: v === "true_false" ? ["True", "False"] : [...DEFAULT_OPTIONS],
                      correct_answer: "",
                    }))
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="true_false">True / False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Question</Label>
                  <Textarea placeholder="Enter question text…" value={form.question_text} onChange={e => setForm(p => ({ ...p, question_text: e.target.value }))} rows={3} />
                </div>
                <div>
                  <Label>Points</Label>
                  <Input type="number" min={1} value={form.points} onChange={e => setForm(p => ({ ...p, points: parseInt(e.target.value) || 1 }))} />
                </div>

                {form.question_type === "multiple_choice" ? (
                  <div className="space-y-2">
                    <Label>Options (mark correct)</Label>
                    {form.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setForm(p => ({ ...p, correct_answer: String.fromCharCode(65 + i) }))}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-all flex-shrink-0",
                            form.correct_answer === String.fromCharCode(65 + i)
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : "border-foreground/20 text-foreground/50 hover:border-emerald-400"
                          )}
                        >
                          {String.fromCharCode(65 + i)}
                        </button>
                        <Input
                          placeholder={`Option ${String.fromCharCode(65 + i)}`}
                          value={opt}
                          onChange={e => {
                            const newOpts = [...form.options]
                            newOpts[i] = e.target.value
                            setForm(p => ({ ...p, options: newOpts }))
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <div className="flex gap-3">
                      {["True", "False"].map(v => (
                        <Button key={v} variant={form.correct_answer === v ? "default" : "outline"} onClick={() => setForm(p => ({ ...p, correct_answer: v }))}
                          className={form.correct_answer === v ? "bg-emerald-500 text-white" : ""}>
                          {v}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleAdd} disabled={saving || !form.question_text.trim() || !form.correct_answer}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Question
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </ScrollReveal>

      {questions.length === 0 ? (
        <GlassSurface className="p-12 text-center">
          <CircleDot className="h-14 w-14 text-foreground/20 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">No questions yet</h2>
          <p className="text-foreground/50">Add your first question to this quiz.</p>
        </GlassSurface>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <ScrollReveal key={q.id} direction="up" delay={idx * 0.03}>
              <GlassSurface className="p-4 group">
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                    <GripVertical className="h-4 w-4 text-foreground/20" />
                    <span className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-sm font-bold text-emerald-400">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground mb-2">{q.question_text}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {q.options.map((opt: string, oi: number) => (
                        <Badge key={oi} variant="outline" className={cn(
                          "text-xs",
                          (q.question_type === "multiple_choice" && q.correct_answer === String.fromCharCode(65 + oi))
                          || (q.question_type === "true_false" && q.correct_answer === opt)
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "text-foreground/60"
                        )}>
                          {q.question_type === "multiple_choice" ? `${String.fromCharCode(65 + oi)}) ` : ""}{opt}
                          {((q.question_type === "multiple_choice" && q.correct_answer === String.fromCharCode(65 + oi))
                          || (q.question_type === "true_false" && q.correct_answer === opt)) && (
                            <CheckCircle2 className="h-3 w-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-foreground/50">
                      <Badge variant="outline" className="text-xs">
                        {q.question_type === "multiple_choice" ? "MC" : "T/F"}
                      </Badge>
                      <span>{q.points} pts</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(q.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 hover:bg-red-500/10 flex-shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </GlassSurface>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  )
}
