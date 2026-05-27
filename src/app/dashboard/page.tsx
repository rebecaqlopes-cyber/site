import { createClient } from '@/lib/supabase/server'
import { BookOpen, CheckCircle, Clock, MessageSquare, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user!.id).single()

  // Exercises assigned specifically to this student
  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .eq('student_id', user!.id)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, exercises(title), feedback(*)')
    .eq('student_id', user!.id)
    .order('updated_at', { ascending: false })
    .limit(5)

  const totalExercises = exercises?.length ?? 0
  const submittedIds = new Set(submissions?.filter(s => s.status !== 'pending').map(s => s.exercise_id))
  const pendingCount = exercises?.filter(e => !submittedIds.has(e.id)).length ?? 0
  const reviewedCount = submissions?.filter(s => s.status === 'reviewed').length ?? 0

  const firstName = profile?.full_name?.split(' ')[0] ?? 'aluno'

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Olá, {firstName} 👋</h1>
        <p className="text-slate-500 mt-1 text-sm">Bem-vinda de volta à sua área de estudos.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard icon={BookOpen} label="Exercícios" value={totalExercises} color="indigo" />
        <StatCard icon={Clock} label="Pendentes" value={pendingCount} color="amber" />
        <StatCard icon={CheckCircle} label="Entregues" value={submissions?.filter(s => s.status !== 'pending').length ?? 0} color="emerald" />
        <StatCard icon={MessageSquare} label="Com feedback" value={reviewedCount} color="violet" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent exercises */}
        <div className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h2 className="font-semibold text-slate-900 text-sm">Exercícios recentes</h2>
            <Link href="/exercises" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-0.5">
              Ver todos <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {exercises && exercises.length > 0 ? (
              exercises.slice(0, 4).map(exercise => {
                const submission = submissions?.find(s => s.exercise_id === exercise.id)
                return (
                  <Link
                    key={exercise.id}
                    href={`/exercises/${exercise.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-sm font-medium text-slate-900 truncate">{exercise.title}</p>
                      {exercise.due_date && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          Prazo: {format(new Date(exercise.due_date), "d MMM", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                    <StatusPill status={submission?.status} />
                  </Link>
                )
              })
            ) : (
              <div className="px-5 py-10 text-center">
                <BookOpen className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Nenhum exercício ainda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent feedback */}
        <div className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50">
            <h2 className="font-semibold text-slate-900 text-sm">Feedbacks recentes</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {(submissions?.filter(s => s.feedback && (s.feedback as unknown[]).length > 0).length ?? 0) > 0 ? (
              submissions
                ?.filter(s => s.feedback && (s.feedback as unknown[]).length > 0)
                .map(submission => (
                  <Link
                    key={submission.id}
                    href={`/exercises/${submission.exercise_id}`}
                    className="block px-5 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {(submission.exercises as { title: string } | null)?.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {((submission.feedback as { content: string }[] | null) ?? [])[0]?.content}
                    </p>
                  </Link>
                ))
            ) : (
              <div className="px-5 py-10 text-center">
                <MessageSquare className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Nenhum feedback ainda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
  }
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm p-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

function StatusPill({ status }: { status?: string }) {
  if (status === 'reviewed') return <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">Revisado</span>
  if (status === 'submitted') return <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">Entregue</span>
  return <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">Pendente</span>
}
