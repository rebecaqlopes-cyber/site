import { createClient } from '@/lib/supabase/server'
import { Users, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function whatsappHref(number: string): string {
  const digits = number.replace(/\D/g, '')
  const withCountry = digits.startsWith('55') && digits.length >= 12 ? digits : `55${digits}`
  return `https://wa.me/${withCountry}`
}

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
                <div key={student.id} className="relative flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <Link href={`/admin/students/${student.id}`} className="absolute inset-0" aria-label={student.full_name} />
                  <Avatar className="h-10 w-10 flex-shrink-0 relative">
                    <AvatarFallback className="bg-indigo-50 text-indigo-700 text-sm font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 relative">
                    <p className="font-medium text-slate-900 text-sm">{student.full_name}</p>
                    <p className="text-xs text-slate-400">{student.email}</p>
                  </div>
                  <div className="text-right hidden sm:block relative">
                    <p className="text-sm font-medium text-slate-700">{exerciseCount} exercício{exerciseCount !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-slate-400">
                      Desde {format(new Date(student.created_at), "MMM yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  {student.whatsapp ? (
                    <a
                      href={whatsappHref(student.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir WhatsApp"
                      className="relative z-10 flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white transition-colors shadow-sm"
                    >
                      <WhatsAppIcon />
                    </a>
                  ) : null}
                  <ChevronRight className="relative h-4 w-4 text-slate-300 flex-shrink-0" />
                </div>
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
