import ExerciseForm from '@/components/admin/ExerciseForm'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function EditExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: exercise }, { data: students }] = await Promise.all([
    supabase.from('exercises').select('*').eq('id', id).eq('teacher_id', user!.id).single(),
    supabase.from('profiles').select('id, full_name').eq('role', 'student').order('full_name'),
  ])

  if (!exercise) notFound()

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <Link href="/admin/exercises" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">Editar exercício</h1>
        <p className="text-slate-500 mt-1 text-sm">{exercise.title}</p>
      </div>
      <ExerciseForm students={students ?? []} exercise={exercise} />
    </div>
  )
}
