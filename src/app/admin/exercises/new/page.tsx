import ExerciseForm from '@/components/admin/ExerciseForm'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewExercisePage() {
  const supabase = await createClient()

  const { data: students } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'student')
    .order('full_name')

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <Link href="/admin/exercises" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">Novo exercício</h1>
        <p className="text-slate-500 mt-1 text-sm">Crie e atribua um exercício para um aluno</p>
      </div>
      <ExerciseForm students={students ?? []} />
    </div>
  )
}
