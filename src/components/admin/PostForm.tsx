'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import type { Post } from '@/types'
import RichTextEditor from '@/components/admin/RichTextEditor'

const schema = z.object({
  title: z.string().min(3, 'Título muito curto'),
  slug: z.string().min(3, 'Slug inválido').regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens'),
  excerpt: z.string().optional(),
  content: z.string().min(10, 'Conteúdo muito curto'),
  category: z.enum(['grammar', 'vocabulary', 'tips', 'culture', 'pronunciation', 'other']),
  published: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface Props {
  post?: Post
}

function toSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function PostForm({ post }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post?.title ?? '',
      slug: post?.slug ?? '',
      excerpt: post?.excerpt ?? '',
      content: post?.content ?? '',
      category: post?.category ?? 'other',
      published: post?.published ?? false,
    },
  })

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!post) {
      setValue('slug', toSlug(e.target.value))
    }
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const payload = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: data.content,
        category: data.category,
        published: data.published,
        teacher_id: user!.id,
      }

      if (post) {
        const { error } = await supabase.from('posts').update(payload).eq('id', post.id)
        if (error) throw error
        toast.success('Post atualizado!')
      } else {
        const { error } = await supabase.from('posts').insert(payload)
        if (error) {
          if (error.code === '23505') {
            toast.error('Este slug já está em uso. Tente um diferente.')
            return
          }
          throw error
        }
        toast.success('Post criado!')
      }

      router.push('/admin/posts')
      router.refresh()
    } catch {
      toast.error('Erro ao salvar post.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!post) return
    if (!confirm('Excluir este post permanentemente?')) return

    setDeleting(true)
    try {
      const { error } = await supabase.from('posts').delete().eq('id', post.id)
      if (error) throw error
      toast.success('Post excluído.')
      router.push('/admin/posts')
      router.refresh()
    } catch {
      toast.error('Erro ao excluir.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: 10 dicas para melhorar seu vocabulário"
              {...register('title')}
              onChange={e => { register('title').onChange(e); handleTitleChange(e) }}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug (URL) *
              <span className="text-gray-400 font-normal ml-2 text-xs">gerado automaticamente</span>
            </Label>
            <Input id="slug" placeholder="minha-url-amigavel" {...register('slug')} />
            {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              defaultValue={watch('category')}
              onValueChange={v => setValue('category', v as FormData['category'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grammar">Gramática</SelectItem>
                <SelectItem value="vocabulary">Vocabulário</SelectItem>
                <SelectItem value="tips">Dicas</SelectItem>
                <SelectItem value="culture">Cultura</SelectItem>
                <SelectItem value="pronunciation">Pronúncia</SelectItem>
                <SelectItem value="other">Geral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Resumo (opcional)</Label>
            <Textarea id="excerpt" rows={2} placeholder="Breve descrição que aparece na listagem..." {...register('excerpt')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-2">
          <Label>Conteúdo *</Label>
          <RichTextEditor
            value={watch('content')}
            onChange={v => setValue('content', v, { shouldValidate: true })}
            placeholder="Escreva o conteúdo do post..."
          />
          {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => { setValue('published', false); handleSubmit(onSubmit)() }}
            disabled={loading}
          >
            Salvar rascunho
          </Button>
          <Button
            type="button"
            onClick={() => { setValue('published', true); handleSubmit(onSubmit)() }}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publicar
          </Button>
        </div>

        {post && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </form>
  )
}
