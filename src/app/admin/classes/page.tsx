import { createClient } from '@/lib/supabase/server'
import { GraduationCap, Copy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import NewClassButton from '@/components/admin/NewClassButton'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function AdminClassesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', user!.id)
    .order('created_at', { ascending: false })

  // Count students per class
  const classIds = classes?.map(c => c.id) ?? []
  const { data: enrollments } = classIds.length > 0
    ? await supabase
        .from('student_classes')
        .select('class_id')
        .in('class_id', classIds)
    : { data: [] }

  const countMap = new Map<string, number>()
  enrollments?.forEach(e => {
    countMap.set(e.class_id, (countMap.get(e.class_id) ?? 0) + 1)
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turmas</h1>
          <p className="text-gray-500 mt-1">Gerencie suas turmas e códigos de matrícula</p>
        </div>
        <NewClassButton />
      </div>

      {classes && classes.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {classes.map(cls => (
            <Card key={cls.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                    {cls.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{cls.description}</p>
                    )}
                  </div>
                  <Badge variant={cls.active ? 'default' : 'secondary'} className="text-xs">
                    {cls.active ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Código de matrícula</p>
                    <p className="font-mono font-bold text-lg text-gray-900 tracking-widest">
                      {cls.enrollment_code}
                    </p>
                  </div>
                  <CopyButton code={cls.enrollment_code} />
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{countMap.get(cls.id) ?? 0} aluno(s)</span>
                  <span>{format(new Date(cls.created_at), "d MMM yyyy", { locale: ptBR })}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma turma criada</h3>
          <p className="text-gray-500 mb-4">Crie sua primeira turma e compartilhe o código com os alunos.</p>
          <NewClassButton />
        </div>
      )}
    </div>
  )
}

function CopyButton({ code }: { code: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={() => {}}
      data-code={code}
      id={`copy-${code}`}
    >
      <Copy className="h-4 w-4 text-gray-400" />
    </Button>
  )
}
