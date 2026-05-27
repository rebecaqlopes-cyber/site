import { createClient } from '@/lib/supabase/server'
import { BookOpen, Plus, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

export default async function AdminPostsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('teacher_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conteúdo</h1>
          <p className="text-gray-500 mt-1">Publique dicas, gramática e conteúdo de inglês</p>
        </div>
        <Link href="/admin/posts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo post
          </Button>
        </Link>
      </div>

      {posts && posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map(post => (
            <Card key={post.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{post.title}</h3>
                      {!post.published && (
                        <Badge variant="outline" className="text-gray-500 text-xs">Rascunho</Badge>
                      )}
                    </div>
                    {post.excerpt && (
                      <p className="text-sm text-gray-500 line-clamp-1 mb-2">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {categoryLabels[post.category] ?? post.category}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {format(new Date(post.created_at), "d MMM yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.published
                      ? <Eye className="h-4 w-4 text-green-500" />
                      : <EyeOff className="h-4 w-4 text-gray-400" />
                    }
                    <Link href={`/admin/posts/${post.id}`}>
                      <Button variant="outline" size="sm">Editar</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum conteúdo ainda</h3>
          <p className="text-gray-500 mb-4">Crie seu primeiro post de inglês.</p>
          <Link href="/admin/posts/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar post
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
