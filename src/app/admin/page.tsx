import { createClient } from '@/lib/supabase/server'
import { Users, BookOpen, FileText, MessageSquare, ChevronRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user!.id).single()

  const [
    { count: studentsCount },
    { count: exercisesCount },
    { count: pendingCount },
    { data: recentSubmissions },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('exercises').select('*', { count: 'exact', head: true }).eq('teacher_id', user!.id),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
    supabase
      .from('submissions')
      .select('*, profiles(full_name), exercises(title)')
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: true })
      .limit(6),
  ])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Professora'

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Olá, {firstName}! 👩‍🏫</h1>
        <p className="text-slate-500 mt-1 text-sm">Painel da professora · Rebeca Learning</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        <Link href="/admin/students">
          <StatCard icon={Users} label="Alunos" value={studentsCount ?? 0} color="indigo" hint="Ver alunos" />
        </Link>
        <Link href="/admin/exercises">
          <StatCard icon={FileText} label="Exercícios" value={exercisesCount ?? 0} color="violet" hint="Gerenciar" />
        </Link>
        <Link href="/admin/feedback">
          <StatCard icon={MessageSquare} label="Aguardando revisão" value={pendingCount ?? 0} color="amber" hint="Revisar agora" urgent={!!pendingCount && pendingCount > 0} />
        </Link>
      </div>

      {/* Pending submissions */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">Respostas aguardando feedback</h2>
            {pendingCount && pendingCount > 0 ? (
              <p className="text-xs text-amber-600 mt-0.5 font-medium">{pendingCount} aguardando</p>
            ) : null}
          </div>
          <Link href="/admin/feedback" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-0.5">
            Ver todas <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {recentSubmissions && recentSubmissions.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {recentSubmissions.map(sub => (
              <Link
                key={sub.id}
                href={`/admin/feedback/${sub.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {(sub.profiles as { full_name: string } | null)?.full_name}
                    </p>
                    <p className="text-xs text-slate-400 truncate max-w-xs">
                      {(sub.exercises as { title: string } | null)?.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-xs text-slate-400 hidden sm:block">
                    {sub.submitted_at ? format(new Date(sub.submitted_at), "d MMM", { locale: ptBR }) : '—'}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">Pendente</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="font-medium text-slate-900 text-sm">Tudo em dia!</p>
            <p className="text-xs text-slate-400 mt-1">Nenhuma resposta aguardando feedback.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, hint, urgent }: {
  icon: React.ElementType; label: string; value: number; color: string; hint: string; urgent?: boolean
}) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
  }
  return (
    <div className={`bg-white rounded-2xl ring-1 shadow-sm p-5 hover:shadow-md transition-all cursor-pointer ${urgent ? 'ring-amber-200' : 'ring-slate-100'}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}
