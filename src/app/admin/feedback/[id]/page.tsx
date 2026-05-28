'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Send, CheckCircle, Download, FileText } from 'lucide-react'
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
  const [downloadingFile, setDownloadingFile] = useState(false)
  const [downloadingAttachment, setDownloadingAttachment] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: sub } = await supabase.from('submissions').select('*').eq('id', id).single()
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

  const downloadFile = async (path: string, type: 'attachment' | 'response') => {
    if (type === 'attachment') setDownloadingAttachment(true)
    else setDownloadingFile(true)
    try {
      const { data, error } = await supabase.storage.from('exercise-files').createSignedUrl(path, 3600)
      if (error || !data) throw error
      window.open(data.signedUrl, '_blank')
    } catch {
      toast.error('Erro ao baixar arquivo.')
    } finally {
      if (type === 'attachment') setDownloadingAttachment(false)
      else setDownloadingFile(false)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) { toast.error('Escreva o feedback antes de enviar.'); return }
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
      await supabase.from('submissions').update({ status: 'reviewed' }).eq('id', id)
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
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
  }

  const attachmentPath = exercise?.attachment_url as string | null
  const filePath = submission?.file_url as string | null
  const attachmentName = attachmentPath ? decodeURIComponent(attachmentPath.split('/').pop() ?? 'arquivo') : null
  const fileName = filePath ? decodeURIComponent(filePath.split('/').pop() ?? 'resposta') : null

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 text-sm">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{String(student?.full_name ?? '')}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{String(exercise?.title ?? '')}</p>
          </div>
          <Badge className={submission?.status === 'reviewed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
            {String(submission?.status) === 'reviewed' ? 'Revisado' : 'Pendente'}
          </Badge>
        </div>
        {submission?.submitted_at ? (
          <p className="text-xs text-slate-400 mt-2">
            Entregue em {format(new Date(String(submission.submitted_at)), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
          </p>
        ) : null}
      </div>

      {/* Exercise content */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm p-6 mb-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Enunciado</h2>
        <div className="prose prose-sm max-w-none text-slate-700">
          <ReactMarkdown>{String(exercise?.content ?? '')}</ReactMarkdown>
        </div>
      </div>

      {/* Teacher's attachment (if any) */}
      {attachmentName && (
        <div className="bg-indigo-50 rounded-2xl ring-1 ring-indigo-100 p-4 mb-4 flex items-center gap-3">
          <FileText className="h-5 w-5 text-indigo-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Arquivo enviado pela professora</p>
            <p className="text-sm text-indigo-700 truncate">{attachmentName}</p>
          </div>
          <button
            onClick={() => downloadFile(attachmentPath!, 'attachment')}
            disabled={downloadingAttachment}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-white hover:bg-indigo-100 rounded-lg ring-1 ring-indigo-200 transition-colors disabled:opacity-60"
          >
            {downloadingAttachment ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Baixar
          </button>
        </div>
      )}

      {/* Student's answer */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm p-6 mb-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Resposta do aluno</h2>

        {submission?.content ? (
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap mb-3">
            {String(submission.content)}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic mb-3">Nenhuma resposta em texto.</p>
        )}

        {fileName && (
          <button
            onClick={() => downloadFile(filePath!, 'response')}
            disabled={downloadingFile}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl ring-1 ring-slate-200 transition-colors disabled:opacity-60"
          >
            {downloadingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {fileName}
          </button>
        )}
      </div>

      {/* Existing feedback */}
      {existingFeedback.length > 0 && (
        <div className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm p-6 mb-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            Feedback enviado
          </h2>
          <div className="space-y-3">
            {existingFeedback.map(fb => (
              <div key={String(fb.id)} className="bg-emerald-50 rounded-xl p-4">
                {fb.grade ? (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-slate-600">Nota:</span>
                    <Badge className="bg-emerald-600 text-white text-xs">{String(fb.grade)}</Badge>
                  </div>
                ) : null}
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{String(fb.content)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New feedback form */}
      {submission?.status !== 'reviewed' && (
        <div className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Dar feedback</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Nota (opcional)</label>
              <input
                placeholder="Ex: 8/10, Excelente, B+"
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-48 px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Comentário *</label>
              <textarea
                rows={6}
                placeholder="Escreva seu feedback para o aluno..."
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                className="w-full px-3.5 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400 resize-none transition"
              />
            </div>
            <button
              onClick={handleSubmitFeedback}
              disabled={submitting || !feedbackText.trim()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60 shadow-sm shadow-indigo-200"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar feedback
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
