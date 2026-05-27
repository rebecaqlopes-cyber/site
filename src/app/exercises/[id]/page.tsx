'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Clock, CheckCircle, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import type { Exercise, Submission, Feedback } from '@/types'
import Link from 'next/link'

export default function ExerciseDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: ex } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single()

      setExercise(ex)

      const { data: sub } = await supabase
        .from('submissions')
        .select('*')
        .eq('exercise_id', id)
        .eq('student_id', user.id)
        .single()

      if (sub) {
        setSubmission(sub)
        setAnswer(sub.content ?? '')

        const { data: fb } = await supabase
          .from('feedback')
          .select('*')
          .eq('submission_id', sub.id)
          .order('created_at', { ascending: true })

        setFeedback(fb ?? [])
      }

      setLoading(false)
    }
    load()
  }, [id])

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast.error('Escreva sua resposta antes de enviar.')
      return
    }

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (submission) {
        const { error } = await supabase
          .from('submissions')
          .update({ content: answer, status: 'submitted', submitted_at: new Date().toISOString() })
          .eq('id', submission.id)

        if (error) throw error
        setSubmission({ ...submission, content: answer, status: 'submitted' })
      } else {
        const { data, error } = await supabase
          .from('submissions')
          .insert({
            exercise_id: id,
            student_id: user.id,
            content: answer,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error
        setSubmission(data)
      }

      toast.success('Resposta enviada com sucesso!')
    } catch {
      toast.error('Erro ao enviar resposta. Tente novamente.')
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

  if (!exercise) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Exercício não encontrado.</p>
        <Link href="/exercises">
          <Button variant="outline" className="mt-4">Voltar</Button>
        </Link>
      </div>
    )
  }

  const isSubmitted = submission?.status === 'submitted' || submission?.status === 'reviewed'
  const isReviewed = submission?.status === 'reviewed'

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-2xl font-bold text-gray-900">{exercise.title}</h1>
          {isReviewed ? (
            <Badge className="bg-green-100 text-green-700 border-green-200">Revisado</Badge>
          ) : isSubmitted ? (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">Entregue</Badge>
          ) : (
            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pendente</Badge>
          )}
        </div>
        {exercise.due_date && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            Prazo: {format(new Date(exercise.due_date), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </div>
        )}
      </div>

      {/* Exercise content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Enunciado</CardTitle>
        </CardHeader>
        <CardContent>
          {exercise.description && (
            <p className="text-sm text-gray-600 mb-4">{exercise.description}</p>
          )}
          <div className="prose prose-sm max-w-none text-gray-800">
            <ReactMarkdown>{exercise.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Answer area */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Sua resposta</CardTitle>
        </CardHeader>
        <CardContent>
          {isReviewed ? (
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
              {submission?.content || 'Sem resposta registrada.'}
            </div>
          ) : (
            <>
              <Textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Digite sua resposta aqui..."
                rows={8}
                className="resize-none"
                disabled={isSubmitted && !isReviewed}
              />
              {!isSubmitted && (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !answer.trim()}
                  className="mt-3"
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Enviar resposta
                </Button>
              )}
              {isSubmitted && (
                <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                  <CheckCircle className="h-4 w-4" />
                  Resposta enviada em {submission?.submitted_at ? format(new Date(submission.submitted_at), "d/MM/yyyy 'às' HH:mm") : '—'}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Feedback */}
      {feedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquareIcon />
              Feedback da professora
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedback.map((fb, i) => (
              <div key={fb.id}>
                {i > 0 && <Separator className="my-4" />}
                <div className="bg-blue-50 rounded-lg p-4">
                  {fb.grade && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-gray-700">Nota:</span>
                      <Badge className="bg-blue-600 text-white">{fb.grade}</Badge>
                    </div>
                  )}
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{fb.content}</p>
                  <p className="text-xs text-gray-400 mt-3">
                    {format(new Date(fb.created_at), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function MessageSquareIcon() {
  return (
    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}
