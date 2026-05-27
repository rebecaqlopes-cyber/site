import { createClient } from '@/lib/supabase/server'
import { Plus, Pencil, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const typeLabels: Record<string, string> = {
  text: 'Texto',
  multiple_choice: 'Múltipla escolha',
  file_upload: 'Arquivo',
  audio: 'Áudio',
}

export default async function AdminExercisesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: exercises } = await supabase
    .from('exercises')
    .select('*, profiles(full_name)')
    .eq('teacher_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Exercícios</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {exercises?.length ?? 0} exercício{exercises?.length !== 1 ? 's' : ''} criado{exercises?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/exercises/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-200"
        >
          <Plus className="h-4 w-4" />
          Novo exercício
        </Link>
      </div>

      {exercises && exercises.length > 0 ? (
        <div className="space-y-2.5">
          {exercises.map(exercise => (
            <div key={exercise.id} className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm p-5 flex items-start justify-between gap-4 hover:ring-slate-200 transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-slate-900 text-sm">{exercise.title}</h3>
                  {!exercise.published && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">Rascunho</span>
                  )}
                </div>
                {exercise.description && (
                  <p className="text-xs text-slate-400 mb-2 line-clamp-1">{exercise.description}</p>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                    {typeLabels[exercise.type] ?? exercise.type}
                  </span>
                  {(exercise.profiles as { full_name: string } | null)?.full_name && (
                    <span className="text-xs text-slate-400">
                      → {(exercise.profiles as { full_name: string }).full_name}
                    </span>
                  )}
                  {exercise.due_date && (
                    <span className="text-xs text-slate-400">
                      Prazo: {format(new Date(exercise.due_date), "d MMM yyyy", { locale: ptBR })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {exercise.published
                  ? <Eye className="h-4 w-4 text-emerald-500" />
                  : <EyeOff className="h-4 w-4 text-slate-300" />
                }
                <Link href={`/admin/exercises/${exercise.id}`}>
                  <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                    <Pencil className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-16 text-center">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plus className="h-7 w-7 text-slate-300" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Nenhum exercício ainda</h3>
          <p className="text-sm text-slate-400 mb-5">Crie o primeiro exercício para seus alunos.</p>
          <Link href="/admin/exercises/new" className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors">
            <Plus className="h-4 w-4" />
            Criar exercício
          </Link>
        </div>
      )}
    </div>
  )
}
