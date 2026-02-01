
-- SCRIPT DE CONFIGURAÇÃO EDUBOOST - SUPABASE
-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. LIMPEZA DE TABELAS EXISTENTES (CUIDADO: APAGA DADOS)
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.turmas CASCADE;
DROP TABLE IF EXISTS public.teachers CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.institutions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. TABELA DE PERFIS (USUÁRIOS E NÍVEIS DE ACESSO)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Em produção, use Supabase Auth. Aqui mantemos para o mock de login solicitado.
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'PROFESSOR', 'RESPONSAVEL', 'ALUNO')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE INSTITUIÇÕES (ESCOLAS PARCEIRAS)
CREATE TABLE public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    contact_name TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE PROFESSORES
CREATE TABLE public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cpf TEXT UNIQUE,
    education TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE ALUNOS
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    birth_date DATE,
    grade TEXT,
    school TEXT,
    subjects TEXT[] DEFAULT '{}',
    monthly_fee DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA DE TURMAS
CREATE TABLE public.turmas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    student_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABELA DE FREQUÊNCIA (CHAMADA)
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    present_student_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(turma_id, date)
);

-- 8. TABELA DE PAGAMENTOS E FINANCEIRO
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    status TEXT NOT NULL CHECK (status IN ('PAID', 'PENDING', 'OVERDUE')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABELA DE AULAS (INDIVIDUAIS/AGENDA)
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    teacher_id TEXT, 
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. INSERIR USUÁRIO ADMINISTRADOR (ROOT)
INSERT INTO public.profiles (name, email, password, role)
VALUES ('Admin EduBoost', 'admin@eduboost.com.br', 'qwe123', 'ADMIN');

-- 11. SEGURANÇA (RLS - ROW LEVEL SECURITY)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACESSO (PERMISSIVO PARA FASE DE TESTE)
CREATE POLICY "Allow all for authenticated" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.institutions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.turmas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.classes FOR ALL USING (true) WITH CHECK (true);
