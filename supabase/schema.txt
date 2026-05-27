-- =============================================
-- REBECA LEARNING - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

create extension if not exists "pgcrypto";

-- =============================================
-- PROFILES
-- =============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null,
  role text not null check (role in ('teacher', 'student')) default 'student',
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- EXERCISES (aulas são individuais — cada exercício é de um aluno)
-- =============================================
create table if not exists public.exercises (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  content text not null,
  type text not null check (type in ('text', 'multiple_choice', 'file_upload', 'audio')) default 'text',
  student_id uuid references public.profiles(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  due_date timestamptz,
  published boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists exercises_student_id_idx on public.exercises(student_id);
create index if not exists exercises_teacher_id_idx on public.exercises(teacher_id);

-- =============================================
-- SUBMISSIONS
-- =============================================
create table if not exists public.submissions (
  id uuid default gen_random_uuid() primary key,
  exercise_id uuid references public.exercises(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  file_url text,
  status text not null check (status in ('pending', 'submitted', 'reviewed')) default 'pending',
  submitted_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (exercise_id, student_id)
);

-- =============================================
-- FEEDBACK
-- =============================================
create table if not exists public.feedback (
  id uuid default gen_random_uuid() primary key,
  submission_id uuid references public.submissions(id) on delete cascade not null,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  grade text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- POSTS (blog / área de conteúdo)
-- =============================================
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  category text check (category in ('grammar', 'vocabulary', 'tips', 'culture', 'pronunciation', 'other')) default 'other',
  cover_url text,
  published boolean default false,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.submissions enable row level security;
alter table public.feedback enable row level security;
alter table public.posts enable row level security;

-- PROFILES
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Teacher can view all student profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
  );

-- EXERCISES
create policy "Teacher can manage own exercises" on public.exercises
  for all using (teacher_id = auth.uid());

create policy "Students can view own published exercises" on public.exercises
  for select using (
    published = true and student_id = auth.uid()
  );

-- SUBMISSIONS
create policy "Students can manage own submissions" on public.submissions
  for all using (student_id = auth.uid());

create policy "Teacher can view all submissions" on public.submissions
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
  );

create policy "Teacher can update submission status" on public.submissions
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
  );

-- FEEDBACK
create policy "Teacher can manage own feedback" on public.feedback
  for all using (teacher_id = auth.uid());

create policy "Students can view feedback on own submissions" on public.feedback
  for select using (
    exists (
      select 1 from public.submissions s
      where s.id = submission_id and s.student_id = auth.uid()
    )
  );

-- POSTS
create policy "Teacher can manage own posts" on public.posts
  for all using (teacher_id = auth.uid());

create policy "Anyone can view published posts" on public.posts
  for select using (published = true);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();
create trigger set_exercises_updated_at before update on public.exercises
  for each row execute procedure public.handle_updated_at();
create trigger set_submissions_updated_at before update on public.submissions
  for each row execute procedure public.handle_updated_at();
create trigger set_feedback_updated_at before update on public.feedback
  for each row execute procedure public.handle_updated_at();
create trigger set_posts_updated_at before update on public.posts
  for each row execute procedure public.handle_updated_at();
