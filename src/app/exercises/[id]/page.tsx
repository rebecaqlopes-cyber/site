'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Clock, CheckCircle, Loader2, Send, Download, Paperclip, X, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import type { Exercise, Submission, Feedback } from '@/types'
import Link from 'next/link'

interface MCData { question: string; options: string[]; correct: number }
function parseMC(content: string): MCData | null {
  try { const d = JSON.parse(content); if (d.options && Array.isArray(d.options)) return d as MCData } catch {}
  return null
}

export default function ExerciseDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [answer, setAnswer] = useState('')
  const [mcChoice, setMcChoice] = useState<number | null>(null)
  const [responseFile, setResponseFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [downloadingAttachment, setDownloadingAttachment] = useState(false)
  const [downloadingResponse, setDownloadingResponse] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deletingSubmission, setDeletingSubmission] = useState(false)

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
        const mc = ex ? parseMC(ex.content) : null
        if (mc && sub.content) {
          const idx = parseInt(sub.content, 10)
          if (!isNaN(idx)) setMcChoice(idx)
        } else {
          setAnswer(sub.content ?? '')
        }

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

  const downloadFile = async (path: string, label: 'attachment' | 'response') => {
    if (label === 'attachment') setDownloadingAttachment(true)
    else setDownloadingResponse(true)
    try {
      const { data, error } = await supabase.storage
        .from('exercise-files')
        .createSignedUrl(path, 3600)
      if (error || !data) throw error
      window.open(data.signedUrl, '_blank')
    } catch {
      toast.error('Erro ao baixar arquivo.')
    } finally {
      if (label === 'attachment') setDownloadingAttachment(false)
      else setDownloadingResponse(false)
    }
  }

  const handleDeleteSubmission = async () => {
    if (!submission) return
    setDeletingSubmission(true)
    try {
      if (submission.file_url) {
        await supabase.storage.from('exercise-files').remove([submission.file_url])
      }
      const { error } = await supabase.from('submissions').delete().eq('id', submission.id)
      if (error) throw error
      setSubmission(null)
      setAnswer('')
      setResponseFile(null)
      setConfirmDelete(false)
      toast.success('Resposta excluída. Você pode enviar novamente.')
    } catch {
      toast.error('Erro ao excluir resposta.')
    } finally {
      setDeletingSubmission(false)
    }
  }

  const handleSubmit = async () => {
    const mc = exercise ? parseMC(exercise.content) : null
    if (mc && mcChoice === null) {
      toast.error('Selecione uma alternativa antes de enviar.')
      return
    }
    if (!mc && !answer.trim() && !responseFile) {
      toast.error('Escreva sua resposta ou anexe um arquivo antes de enviar.')
      return
    }

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let fileUrl = submission?.file_url ?? null

      if (responseFile) {
        const ext = responseFile.name.split('.').pop()
        const fileId = crypto.randomUUID()
        const path = `submissions/${fileId}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('exercise-files')
          .upload(path, responseFile)
        if (uploadError) throw uploadError
        fileUrl = path
      }

      const mc = parseMC(exercise!.content)
      const payload = {
        content: mc ? String(mcChoice) : (answer || null),
        file_url: fileUrl,
        status: 'submitted' as const,
        submitted_at: new Date().toISOString(),
      }

      let submissionId: string | undefined = submission?.id

      if (submission) {
        const { error } = await supabase.from('submissions').update(payload).eq('id', submission.id)
        if (error) throw error
        setSubmission({ ...submission, ...payload })
      } else {
        const { data, error } = await supabase
          .from('submissions')
          .insert({ exercise_id: id as string, student_id: user.id, ...payload })
          .select()
          .single()
        if (error) throw error
        setSubmission(data)
        submissionId = data?.id
      }

      setResponseFile(null)
      toast.success('Resposta enviada com sucesso!')

      // Notify teacher
      if (exercise?.teacher_id) {
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'submission_received',
            recipientId: exercise.teacher_id,
            title: 'Aluno enviou uma resposta',
            body: `Uma resposta foi enviada para o exercício "${exercise.title}"`,
            link: `/admin/feedback/${submissionId}`,
          }),
        }).catch(() => {})
      }
    } catch {
      toast.error('Erro ao enviar resposta. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">Exercício não encontrado.</p>
        <Link href="/exercises" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">Voltar</Link>
      </div>
    )
  }

  const isSubmitted = submission?.status === 'submitted' || submission?.status === 'reviewed'
  const isReviewed = submission?.status === 'reviewed'
  const mc = parseMC(exercise.content)
  const attachmentName = exercise.attachment_url
    ? decodeURIComponent(exercise.attachment_url.split('/').pop() ?? 'arquivo')
    : null
  const responseName = submission?.file_url
    ? decodeURIComponent(submission.file_url.split('/').pop() ?? 'resposta')
    : null

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-2xl font-bold text-slate-900">{exercise.title}</h1>
          {isReviewed ? (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 shrink-0">Revisado</Badge>
          ) : isSubmitted ? (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 shrink-0">Entregue</Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 shrink-0">Pendente</Badge>
          )}
        </div>
        {exercise.due_date && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="h-4 w-4" />
            Prazo: {format(new Date(exercise.due_date), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </div>
        )}
      </div>

      {/* Exercise content */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm p-6 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Enunciado</h2>
        {exercise.description && (
          <p className="text-sm text-slate-500 mb-4">{exercise.description}</p>
        )}
        {mc ? (
          <p className="text-sm text-slate-800 leading-relaxed">{mc.question}</p>
        ) : (
          <div className="prose prose-sm max-w-none text-slate-800">
            <ReactMarkdown>{exercise.content}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Teacher attachment download */}
      {attachmentName && (
        <div className="bg-indigo-50 rounded-2xl ring-1 ring-indigo-100 p-4 mb-4 flex items-center gap-3">
          <FileText className="h-5 w-5 text-indigo-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-indigo-800">Arquivo da professora</p>
            <p className="text-xs text-indigo-500 truncate">{attachmentName}</p>
          </div>
          <button
            onClick={() => downloadFile(exercise.attachment_url!, 'attachment')}
            disabled={downloadingAttachment}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-white hover:bg-indigo-100 rounded-lg ring-1 ring-indigo-200 transition-colors disabled:opacity-60"
          >
            {downloadingAttachment ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Baixar
          </button>
        </div>
      )}

      {/* Answer area */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm p-6 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Sua resposta</h2>

        {isReviewed ? (
          <>
            {mc ? (
              <div className="space-y-2">
                {mc.options.map((opt, i) => {
                  const chosen = submission?.content === String(i)
                  const correct = i === mc.correct
                  return (
                    <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
                      chosen && correct ? 'border-emerald-300 bg-emerald-50 text-emerald-800' :
                      chosen && !correct ? 'border-red-300 bg-red-50 text-red-800' :
                      correct ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700' :
                      'border-slate-100 text-slate-500'
                    }`}>
                      <span className="font-semibold w-5">{String.fromCharCode(65 + i)})</span>
                      <span className="flex-1">{opt}</span>
                      {chosen && correct && <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
                      {chosen && !correct && <X className="h-4 w-4 text-red-500 flex-shrink-0" />}
                    </div>
                  )
                })}
              </div>
            ) : (
              <>
                {submission?.content && (
                  <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap mb-3">
                    {submission.content}
                  </div>
                )}
                {responseName && (
                  <button
                    onClick={() => downloadFile(submission!.file_url!, 'response')}
                    disabled={downloadingResponse}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl ring-1 ring-slate-200 transition-colors"
                  >
                    {downloadingResponse ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {responseName}
                  </button>
                )}
              </>
            )}
          </>
        ) : mc ? (
          <>
            <div className="space-y-2 mb-4">
              {mc.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => setMcChoice(i)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-colors disabled:cursor-default ${
                    mcChoice === i
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-900 font-medium'
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors ${
                    mcChoice === i ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 text-slate-400'
                  }`}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {!isSubmitted && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || mcChoice === null}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60 shadow-sm shadow-indigo-200"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Enviar resposta
                </button>
              )}
              {isSubmitted && (
                <>
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <CheckCircle className="h-4 w-4" />
                    Enviado em {submission?.submitted_at ? format(new Date(submission.submitted_at), "d/MM/yyyy 'às' HH:mm") : '—'}
                  </div>
                  {confirmDelete ? (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                      <span className="text-xs text-red-700 font-medium">Excluir resposta?</span>
                      <button onClick={handleDeleteSubmission} disabled={deletingSubmission} className="px-2.5 py-1 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-60">
                        {deletingSubmission ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirmar'}
                      </button>
                      <button onClick={() => setConfirmDelete(false)} className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(true)} className="text-xs text-slate-400 hover:text-red-500 transition-colors underline underline-offset-2">
                      Excluir resposta
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Digite sua resposta aqui... (opcional se for enviar um arquivo)"
              rows={7}
              disabled={isSubmitted}
              className="w-full px-3.5 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400 resize-none transition disabled:bg-slate-50 disabled:text-slate-500"
            />

            {/* File attachment for response */}
            {!isSubmitted && (
              <div className="mt-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".doc,.docx,.pdf,.txt,.odt,.ppt,.pptx,.xls,.xlsx"
                  className="hidden"
                  onChange={e => setResponseFile(e.target.files?.[0] ?? null)}
                />
                {responseFile ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl ring-1 ring-slate-200 text-sm">
                    <Paperclip className="h-4 w-4 text-slate-400" />
                    <span className="flex-1 truncate text-slate-600">{responseFile.name}</span>
                    <button type="button" onClick={() => { setResponseFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}>
                      <X className="h-4 w-4 text-slate-400 hover:text-red-500" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl ring-1 ring-slate-200 transition-colors"
                  >
                    <Paperclip className="h-4 w-4" />
                    Anexar arquivo preenchido
                  </button>
                )}
              </div>
            )}

            {/* Submitted file (read-only) */}
            {isSubmitted && responseName && (
              <button
                onClick={() => downloadFile(submission!.file_url!, 'response')}
                disabled={downloadingResponse}
                className="mt-3 inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl ring-1 ring-slate-200 transition-colors"
              >
                {downloadingResponse ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {responseName}
              </button>
            )}

            <div className="flex items-center gap-3 mt-4 flex-wrap">
              {!isSubmitted && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || (!answer.trim() && !responseFile)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60 shadow-sm shadow-indigo-200"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Enviar resposta
                </button>
              )}
              {isSubmitted && !isReviewed && (
                <>
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <CheckCircle className="h-4 w-4" />
                    Enviado em {submission?.submitted_at ? format(new Date(submission.submitted_at), "d/MM/yyyy 'às' HH:mm") : '—'}
                  </div>
                  {confirmDelete ? (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                      <span className="text-xs text-red-700 font-medium">Excluir resposta?</span>
                      <button
                        onClick={handleDeleteSubmission}
                        disabled={deletingSubmission}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-60"
                      >
                        {deletingSubmission ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirmar'}
                      </button>
                      <button onClick={() => setConfirmDelete(false)} className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-lg">
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors underline underline-offset-2"
                    >
                      Excluir resposta
                    </button>
                  )}
                </>
              )}
              {isReviewed && (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  Enviado em {submission?.submitted_at ? format(new Date(submission.submitted_at), "d/MM/yyyy 'às' HH:mm") : '—'}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Feedback */}
      {feedback.length > 0 && (
        <div className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Feedback da professora</h2>
          <div className="space-y-4">
            {feedback.map((fb, i) => (
              <div key={fb.id}>
                {i > 0 && <Separator className="my-4" />}
                <div className="bg-indigo-50 rounded-xl p-4">
                  {fb.grade && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-slate-700">Nota:</span>
                      <Badge className="bg-indigo-600 text-white">{fb.grade}</Badge>
                    </div>
                  )}
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{fb.content}</p>
                  <p className="text-xs text-slate-400 mt-3">
                    {format(new Date(fb.created_at), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
