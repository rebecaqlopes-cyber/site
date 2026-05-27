import { createClient } from '@/lib/supabase/server'
import { BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function ExercisesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Only exercises assigned to this specific student
  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .eq('student_id', user!.id)
    .eq('published', true)
    .order('created_at', { ascending: false })

  const { data: submissions } = await supabase
    .from('submissions')
    .select('exercise_id, status')
    .eq('student_id', user!.id)

  const submissionMap = new Map(submissions?.map(s => [s.exercise_id, s.status]) ?? [])

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Meus exercícios</h1>
        <p className="text-slate-500 mt-1 text-sm">
          {exercises?.length ?? 0} exercício{exercises?.length !== 1 ? 's' : ''} disponível{exercises?.length !== 1 ? 'is' : ''}
        </p>
      </div>

      {exercises && exercises.length > 0 ? (
        <div className="space-y-3">
          {exercises.map(exercise => {
            const status = submissionMap.get(exercise.id)
            const isOverdue = exercise.due_date && new Date(exercise.due_date) < new Date() && !status

            return (
              <Link key={exercise.id} href={`/exercises/${exercise.id}`}>
                <div className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm p-5 hover:ring-indigo-200 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      status === 'reviewed' ? 'bg-emerald-50' :
                      status === 'submitted' ? 'bg-blue-50' :
                      isOverdue ? 'bg-red-50' : 'bg-amber-50'
                    }`}>
                      {status === 'reviewed' ? <CheckCircle className="h-5 w-5 text-emerald-600" /> :
                       status === 'submitted' ? <CheckCircle className="h-5 w-5 text-blue-600" /> :
                       isOverdue ? <AlertCircle className="h-5 w-5 text-red-500" /> :
                       <BookOpen className="h-5 w-5 text-amber-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-900 text-sm leading-snug">{exercise.title}</h3>
                          {exercise.description && (
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{exercise.description}</p>
                          )}
                        </div>
                        <StatusPill status={status} isOverdue={!!isOverdue} />
                      </div>
                      {exercise.due_date && (
                        <div className={`flex items-center gap-1.5 mt-2 text-xs ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                          <Clock className="h-3 w-3" />
                          {format(new Date(exercise.due_date), "d MMM, HH:mm", { locale: ptBR })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-16 text-center">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-7 w-7 text-slate-300" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Nenhum exercício ainda</h3>
          <p className="text-sm text-slate-400">Quando a professora criar exercícios para você, eles aparecerão aqui.</p>
        </div>
      )}
    </div>
  )
}

function StatusPill({ status, isOverdue }: { status?: string; isOverdue: boolean }) {
  if (status === 'reviewed') return <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 flex-shrink-0">Revisado</span>
  if (status === 'submitted') return <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 flex-shrink-0">Entregue</span>
  if (isOverdue) return <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-600 flex-shrink-0">Atrasado</span>
  return <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 flex-shrink-0">Pendente</span>
}
