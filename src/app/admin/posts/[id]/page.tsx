import PostForm from '@/components/admin/PostForm'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .eq('teacher_id', user!.id)
    .single()

  if (!post) notFound()

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Editar post</h1>
        <p className="text-gray-500 mt-1">{post.title}</p>
      </div>
      <PostForm post={post} />
    </div>
  )
}
