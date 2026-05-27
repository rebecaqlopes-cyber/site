'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Send, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'

export default function FeedbackDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [submission, setSubmission] = useState<Record<string, unknown> | null>(null)
  const [exercise, setExercise] = useState<Record<string, unknown> | null>(null)
  const [student, setStudent] = useState<Record<string, unknown> | null>(null)
  const [existingFeedback, setExistingFeedback] = useState<Record<string, unknown>[]>([])
  const [feedbackText, setFeedbackText] = useState('')
  const [grade, setGrade] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: sub } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', id)
        .single()

      if (!sub) return
      setSubmission(sub)

      const [{ data: ex }, { data: st }, { data: fb }] = await Promise.all([
        supabase.from('exercises').select('*').eq('id', sub.exercise_id).single(),
        supabase.from('profiles').select('*').eq('id', sub.student_id).single(),
        supabase.from('feedback').select('*').eq('submission_id', id).order('created_at'),
      ])

      setExercise(ex)
      setStudent(st)
      setExistingFeedback(fb ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      toast.error('Escreva o feedback antes de enviar.')
      return
    }

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase.from('feedback').insert({
        submission_id: id,
        teacher_id: user!.id,
        content: feedbackText,
        grade: grade || null,
      })

      if (error) throw error

      await supabase
        .from('submissions')
        .update({ status: 'reviewed' })
        .eq('id', id)

      toast.success('Feedback enviado ao aluno!')
      router.push('/admin/feedback')
      router.refresh()
    } catch {
      toast.error('Erro ao enviar feedback.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {String(student?.full_name ?? '')}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {String(exercise?.title ?? '')}
            </p>
          </div>
          <Badge className={
            submission?.status === 'reviewed'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }>
            {submission?.status === 'reviewed' ? 'Revisado' : 'Pendente'}
          </Badge>
        </div>
        {submission?.submitted_at ? (
          <p className="text-xs text-gray-400 mt-2">
            Entregue em {format(new Date(String(submission.submitted_at)), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
          </p>
        ) : null}
      </div>

      {/* Exercise content */}
      <Card className="mb-5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500">Enunciado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>{String(exercise?.content ?? '')}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Student answer */}
      <Card className="mb-5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500">Resposta do aluno</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap min-h-[80px]">
            {String(submission?.content ?? 'Nenhuma resposta em texto.')}
          </div>
        </CardContent>
      </Card>

      {/* Existing feedback */}
      {existingFeedback.length > 0 && (
        <Card className="mb-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Feedback enviado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {existingFeedback.map(fb => (
              <div key={String(fb.id)} className="bg-blue-50 rounded-lg p-4">
                {fb.grade ? (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-600">Nota:</span>
                    <Badge className="bg-blue-600 text-white text-xs">{String(fb.grade)}</Badge>
                  </div>
                ) : null}
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{String(fb.content)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* New feedback form */}
      {submission?.status !== 'reviewed' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Dar feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Nota (opcional)</Label>
              <Input
                id="grade"
                placeholder="Ex: 8/10, Excelente, B+"
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-48"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback">Comentário *</Label>
              <Textarea
                id="feedback"
                rows={6}
                placeholder="Escreva seu feedback para o aluno..."
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                className="resize-none"
              />
            </div>
            <Button
              onClick={handleSubmitFeedback}
              disabled={submitting || !feedbackText.trim()}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Enviar feedback
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
