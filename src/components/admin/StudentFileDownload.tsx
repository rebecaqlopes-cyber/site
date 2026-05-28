'use client'

import { useState } from 'react'
import { Download, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Props {
  path: string
  label: string
  icon: 'teacher' | 'student'
}

export default function StudentFileDownload({ path, label, icon }: Props) {
  const [downloading, setDownloading] = useState(false)
  const supabase = createClient()

  const download = async () => {
    setDownloading(true)
    try {
      const { data, error } = await supabase.storage.from('exercise-files').createSignedUrl(path, 3600)
      if (error || !data) throw error
      window.open(data.signedUrl, '_blank')
    } catch {
      toast.error('Erro ao baixar arquivo.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <button
      onClick={download}
      disabled={downloading}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg ring-1 transition-colors disabled:opacity-60 ${
        icon === 'teacher'
          ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 ring-indigo-200'
          : 'text-slate-600 bg-white hover:bg-slate-50 ring-slate-200'
      }`}
    >
      {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon === 'teacher' ? <FileText className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
      <span className="max-w-[200px] truncate">{label}</span>
    </button>
  )
}
