import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BookOpen } from 'lucide-react'

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

export default async function ContentPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Aprenda Inglês</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Dicas, gramática, vocabulário e muito mais para acelerar seu aprendizado.
        </p>
      </div>

      {posts && posts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <Link key={post.id} href={`/content/${post.slug}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                {post.cover_url && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={post.cover_url}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="mb-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[post.category] ?? categoryColors.other}`}>
                      {categoryLabels[post.category] ?? 'Geral'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                  {post.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-3">{post.excerpt}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-3">
                    {format(new Date(post.created_at), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Em breve!</h3>
          <p className="text-gray-500">A professora está preparando conteúdo especial para você.</p>
        </div>
      )}
    </div>
  )
}
