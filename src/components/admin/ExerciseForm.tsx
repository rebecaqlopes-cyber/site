'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Trash2, Eye, EyeOff, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Exercise } from '@/types'

const schema = z.object({
  title: z.string().min(3, 'Título muito curto'),
  description: z.string().optional(),
  content: z.string().min(10, 'Conteúdo muito curto'),
  type: z.enum(['text', 'multiple_choice', 'file_upload', 'audio']),
  student_id: z.string().optional(),
  due_date: z.string().optional(),
  published: z.boolean(),
})
type FormData = z.infer<typeof schema>

interface Props {
  students: { id: string; full_name: string }[]
  exercise?: Exercise
}

export default function ExerciseForm({ students, exercise }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: exercise?.title ?? '',
      description: exercise?.description ?? '',
      content: exercise?.content ?? '',
      type: exercise?.type ?? 'text',
      student_id: (exercise?.student_id as string | undefined) ?? '',
      due_date: exercise?.due_date ? new Date(exercise.due_date).toISOString().slice(0, 16) : '',
      published: exercise?.published ?? false,
    },
  })

  const save = async (published: boolean) => {
    setValue('published', published)
    await handleSubmit(async (data) => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const payload = {
          title: data.title,
          description: data.description || null,
          content: data.content,
          type: data.type,
          student_id: data.student_id || null,
          due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
          published,
          teacher_id: user!.id,
        }

        if (exercise) {
          const { error } = await supabase.from('exercises').update(payload).eq('id', exercise.id)
          if (error) throw error
          toast.success('Exercício atualizado!')
        } else {
          const { error } = await supabase.from('exercises').insert(payload)
          if (error) throw error
          toast.success(published ? 'Exercício publicado!' : 'Rascunho salvo!')
        }

        router.push('/admin/exercises')
        router.refresh()
      } catch {
        toast.error('Erro ao salvar exercício.')
      } finally {
        setLoading(false)
      }
    })()
  }

  const handleDelete = async () => {
    if (!exercise) return
    if (!confirm('Excluir este exercício permanentemente?')) return
    setDeleting(true)
    try {
      const { error } = await supabase.from('exercises').delete().eq('id', exercise.id)
      if (error) throw error
      toast.success('Exercício excluído.')
      router.push('/admin/exercises')
      router.refresh()
    } catch {
      toast.error('Erro ao excluir.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Basic info */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Informações básicas</h3>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Título *</label>
          <input
            placeholder="Ex: Present Simple – Practice"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400 transition"
            {...register('title')}
          />
          {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Descrição breve</label>
          <input
            placeholder="Resumo opcional para o aluno"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400 transition"
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Aluno *</label>
            <select
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition"
              {...register('student_id')}
            >
              <option value="">Selecionar aluno</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
            {students.length === 0 && (
              <p className="text-xs text-amber-600">Nenhum aluno cadastrado ainda.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Tipo</label>
            <select
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition"
              {...register('type')}
            >
              <option value="text">Texto livre</option>
              <option value="multiple_choice">Múltipla escolha</option>
              <option value="file_upload">Envio de arquivo</option>
              <option value="audio">Áudio</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Prazo de entrega</label>
          <input
            type="datetime-local"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            {...register('due_date')}
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm p-6 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Conteúdo do exercício *</h3>
          <p className="text-xs text-slate-400 mt-0.5">Suporta Markdown: **negrito**, *itálico*, ## título, - lista</p>
        </div>
        <textarea
          rows={12}
          placeholder="Escreva o enunciado e as questões do exercício aqui..."
          className="w-full px-3.5 py-3 text-sm font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400 resize-none transition leading-relaxed"
          {...register('content')}
        />
        {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => save(false)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white ring-1 ring-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            Salvar rascunho
          </button>
          <button
            type="button"
            onClick={() => save(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60 shadow-sm shadow-indigo-200"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            Publicar
          </button>
        </div>

        {exercise && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-60"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Excluir
          </button>
        )}
      </div>
    </div>
  )
}
