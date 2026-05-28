import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, CheckCircle, Clock, Download, FileText, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import StudentFileDownload from '@/components/admin/StudentFileDownload'

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: student } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'student')
    .single()

  if (!student) notFound()

  const { data: exercises } = await supabase
    .from('exercises')
    .select('*, submissions(*,feedback(*))')
    .eq('student_id', id)
    .order('created_at', { ascending: false })

  const totalExercises = exercises?.length ?? 0
  const submitted = exercises?.filter(e => e.submissions?.length > 0 && e.submissions[0].status !== 'pending').length ?? 0
  const reviewed = exercises?.filter(e => e.submissions?.length > 0 && e.submissions[0].status === 'reviewed').length ?? 0

  const initials = student.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <Link href="/admin/students" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 text-sm">
        <ArrowLeft className="h-4 w-4" />
        Alunos
      </Link>

      {/* Student header */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm p-6 mb-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-indigo-700">{initials}</span>
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">{student.full_name}</h1>
          <p className="text-sm text-slate-400">{student.email}</p>
          <p className="text-xs text-slate-400 mt-1">
            Aluno desde {format(new Date(student.created_at), "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="hidden sm:grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-slate-900">{totalExercises}</p>
            <p className="text-xs text-slate-400">exercícios</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{submitted}</p>
            <p className="text-xs text-slate-400">entregues</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600">{reviewed}</p>
            <p className="text-xs text-slate-400">revisados</p>
          </div>
        </div>
      </div>

      {/* Exercise history */}
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Histórico de exercícios</h2>

      {exercises && exercises.length > 0 ? (
        <div className="space-y-3">
          {exercises.map(exercise => {
            const sub = exercise.submissions?.[0]
            const feedbacks = sub?.feedback ?? []
            const status = !sub || sub.status === 'pending' ? 'pending'
              : sub.status === 'reviewed' ? 'reviewed' : 'submitted'

            return (
              <div key={exercise.id} className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm overflow-hidden">
                {/* Exercise header */}
                <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      status === 'reviewed' ? 'bg-emerald-50' : status === 'submitted' ? 'bg-blue-50' : 'bg-amber-50'
                    }`}>
                      {status === 'reviewed'
                        ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                        : status === 'submitted'
                          ? <MessageSquare className="h-4 w-4 text-blue-500" />
                          : <Clock className="h-4 w-4 text-amber-500" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{exercise.title}</p>
                      <p className="text-xs text-slate-400">
                        Criado em {format(new Date(exercise.created_at), "d MMM yyyy", { locale: ptBR })}
                        {exercise.due_date && ` · Prazo: ${format(new Date(exercise.due_date), "d MMM", { locale: ptBR })}`}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                    status === 'reviewed' ? 'bg-emerald-50 text-emerald-700'
                      : status === 'submitted' ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                  }`}>
                    {status === 'reviewed' ? 'Revisado' : status === 'submitted' ? 'Entregue' : 'Pendente'}
                  </span>
                </div>

                {/* Files */}
                {(exercise.attachment_url || sub?.file_url) && (
                  <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-2">
                    {exercise.attachment_url && (
                      <StudentFileDownload
                        path={exercise.attachment_url}
                        label={`Arquivo da professora: ${decodeURIComponent(exercise.attachment_url.split('/').pop() ?? 'arquivo')}`}
                        icon="teacher"
                      />
                    )}
                    {sub?.file_url && (
                      <StudentFileDownload
                        path={sub.file_url}
                        label={`Resposta do aluno: ${decodeURIComponent(sub.file_url.split('/').pop() ?? 'resposta')}`}
                        icon="student"
                      />
                    )}
                  </div>
                )}

                {/* Student answer */}
                {sub?.content && (
                  <div className="px-6 py-4 border-b border-slate-50">
                    <p className="text-xs font-medium text-slate-400 mb-2">Resposta em texto</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-4">{sub.content}</p>
                  </div>
                )}

                {/* Feedback */}
                {feedbacks.length > 0 && (
                  <div className="px-6 py-4">
                    {feedbacks.map((fb: Record<string, unknown>) => (
                      <div key={String(fb.id)} className="bg-emerald-50 rounded-xl p-3">
                        {fb.grade ? (
                          <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mb-2">
                            Nota: {String(fb.grade)}
                          </span>
                        ) : null}
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{String(fb.content)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Link to feedback page if submitted but not reviewed */}
                {sub && status === 'submitted' && (
                  <div className="px-6 py-3 border-t border-slate-50">
                    <Link
                      href={`/admin/feedback/${sub.id}`}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Dar feedback →
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-12 text-center">
          <BookOpen className="h-8 w-8 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Nenhum exercício atribuído ainda.</p>
          <Link href="/admin/exercises/new" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
            Criar exercício para este aluno
          </Link>
        </div>
      )}
    </div>
  )
}
