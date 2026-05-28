'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'

interface Props {
  exerciseId: string
  exerciseTitle: string
  attachmentPath?: string | null
}

export default function DeleteExerciseButton({ exerciseId, exerciseTitle, attachmentPath }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setDeleting(true)
    try {
      if (attachmentPath) {
        await supabase.storage.from('exercise-files').remove([attachmentPath])
      }
      const { error } = await supabase.from('exercises').delete().eq('id', exerciseId)
      if (error) throw error
      toast.success('Exercício excluído.')
      router.refresh()
    } catch {
      toast.error('Erro ao excluir exercício.')
      setDeleting(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
        <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
        <span className="text-xs text-red-700 font-medium">Excluir &ldquo;{exerciseTitle}&rdquo;?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="ml-1 px-2.5 py-1 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-60"
        >
          {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirmar'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={deleting}
          className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
      title="Excluir exercício"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
