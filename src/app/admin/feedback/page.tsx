import { createClient } from '@/lib/supabase/server'
import { MessageSquare, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function AdminFeedbackPage() {
  const supabase = await createClient()

  const [{ data: pending }, { data: reviewed }] = await Promise.all([
    supabase
      .from('submissions')
      .select('*, profiles(full_name), exercises(title)')
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: true }),
    supabase
      .from('submissions')
      .select('*, profiles(full_name), exercises(title)')
      .eq('status', 'reviewed')
      .order('updated_at', { ascending: false })
      .limit(8),
  ])

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Feedback</h1>
        <p className="text-slate-500 mt-1 text-sm">Revise as respostas e dê feedback aos alunos</p>
      </div>

      {/* Pending */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 bg-amber-400 rounded-full" />
          <h2 className="text-sm font-semibold text-slate-900">Aguardando feedback ({pending?.length ?? 0})</h2>
        </div>

        {pending && pending.length > 0 ? (
          <div className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
            {pending.map(sub => (
              <Link key={sub.id} href={`/admin/feedback/${sub.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
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
                    {sub.submitted_at ? format(new Date(sub.submitted_at), "d MMM, HH:mm", { locale: ptBR }) : '—'}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">Pendente</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-12 text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="font-medium text-slate-900 text-sm">Tudo em dia!</p>
            <p className="text-xs text-slate-400 mt-1">Nenhuma resposta pendente.</p>
          </div>
        )}
      </section>

      {/* Reviewed */}
      {reviewed && reviewed.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
            <h2 className="text-sm font-semibold text-slate-900">Revisados recentemente</h2>
          </div>
          <div className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
            {reviewed.map(sub => (
              <Link key={sub.id} href={`/admin/feedback/${sub.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors opacity-80">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {(sub.profiles as { full_name: string } | null)?.full_name}
                  </p>
                  <p className="text-xs text-slate-400 truncate max-w-xs">
                    {(sub.exercises as { title: string } | null)?.title}
                  </p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 ml-4">Revisado</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
