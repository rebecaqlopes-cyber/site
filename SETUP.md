# Rebeca Learning — Como configurar

## 1. Criar projeto no Supabase

1. Acesse supabase.com e crie um novo projeto
2. Guarde a **Project URL** e as chaves **anon key** e **service_role key**

## 2. Configurar variáveis de ambiente

Edite o arquivo `.env.local` na raiz do projeto:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. Criar o banco de dados

No painel do Supabase:
1. Vá em **SQL Editor**
2. Abra o arquivo `supabase/schema.sql` deste projeto
3. Cole todo o conteúdo no SQL Editor
4. Clique em **Run**

## 4. Criar a conta da professora

Após rodar o schema, crie a conta da professora:

1. No Supabase → Authentication → Users → **Add user**
2. Coloque o e-mail e senha da professora
3. Clique em **Create user**
4. Vá em **Table Editor** → tabela `profiles`
5. Encontre o registro da professora e mude `role` de `student` para `teacher`

## 5. Rodar localmente

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

## 6. Deploy na Vercel

```bash
npm install -g vercel
vercel
```

Adicione as variáveis de ambiente no painel da Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Estrutura das páginas

| URL | Quem acessa |
|-----|------------|
| `/` | Público (landing page) |
| `/login` | Todos |
| `/signup` | Alunos novos |
| `/dashboard` | Aluno logado |
| `/exercises` | Aluno logado |
| `/exercises/[id]` | Aluno logado |
| `/content` | Público |
| `/content/[slug]` | Público |
| `/admin` | Professora |
| `/admin/exercises` | Professora |
| `/admin/feedback` | Professora |
| `/admin/students` | Professora |
| `/admin/classes` | Professora |
| `/admin/posts` | Professora |
