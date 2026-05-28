import { createClient } from '@/lib/supabase/server'
import { Users } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default async function AdminStudentsPage() {
  const supabase = await createClient()

  const { data: students } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('full_name')

  // Count exercises per student
  const { data: exerciseCounts } = await supabase
    .from('exercises')
    .select('student_id')

  const countMap = new Map<string, number>()
  exerciseCounts?.forEach(e => {
    if (e.student_id) countMap.set(e.student_id, (countMap.get(e.student_id) ?? 0) + 1)
  })

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Alunos</h1>
        <p className="text-slate-500 mt-1 text-sm">
          {students?.length ?? 0} aluno{students?.length !== 1 ? 's' : ''} cadastrado{students?.length !== 1 ? 's' : ''}
        </p>
      </div>

      {students && students.length > 0 ? (
        <div className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50">
            {students.map(student => {
              const initials = student.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
              const exerciseCount = countMap.get(student.id) ?? 0

              return (
                <Link key={student.id} href={`/admin/students/${student.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-indigo-50 text-indigo-700 text-sm font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm">{student.full_name}</p>
                    <p className="text-xs text-slate-400">{student.email}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-700">{exerciseCount} exercício{exerciseCount !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-slate-400">
                      Desde {format(new Date(student.created_at), "MMM yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-16 text-center">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="h-7 w-7 text-slate-300" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Nenhum aluno ainda</h3>
          <p className="text-sm text-slate-400">Compartilhe o link de cadastro com seus alunos.</p>
        </div>
      )}
    </div>
  )
}
