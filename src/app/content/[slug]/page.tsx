import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const categoryLabels: Record<string, string> = {
  grammar: 'Gramática',
  vocabulary: 'Vocabulário',
  tips: 'Dicas',
  culture: 'Cultura',
  pronunciation: 'Pronúncia',
  other: 'Geral',
}

const categoryColors: Record<string, string> = {
  grammar: 'bg-blue-100 text-blue-700',
  vocabulary: 'bg-green-100 text-green-700',
  tips: 'bg-yellow-100 text-yellow-700',
  culture: 'bg-purple-100 text-purple-700',
  pronunciation: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-700',
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href="/content"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para conteúdos
      </Link>

      {post.cover_url && (
        <div className="aspect-video overflow-hidden rounded-xl mb-8">
          <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="mb-2">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[post.category] ?? categoryColors.other}`}>
          {categoryLabels[post.category] ?? 'Geral'}
        </span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-3">{post.title}</h1>

      <p className="text-sm text-gray-400 mb-8">
        Publicado em {format(new Date(post.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
      </p>

      {post.excerpt && (
        <p className="text-lg text-gray-600 mb-8 font-medium border-l-4 border-blue-200 pl-4">
          {post.excerpt}
        </p>
      )}

      <div
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  )
}
