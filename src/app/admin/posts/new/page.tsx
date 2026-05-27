import PostForm from '@/components/admin/PostForm'

export default function NewPostPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Novo post</h1>
        <p className="text-gray-500 mt-1">Publique conteúdo de inglês para seus alunos</p>
      </div>
      <PostForm />
    </div>
  )
}
