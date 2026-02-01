
-- SCRIPT DE ATUALIZAÇÃO EDUBOOST
-- Execute este script no SQL Editor do Supabase

-- Garante que a coluna subjects existe e é do tipo array de texto
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='subjects') THEN
        ALTER TABLE public.students ADD COLUMN subjects TEXT[] DEFAULT '{}';
    ELSE
        ALTER TABLE public.students ALTER COLUMN subjects SET DEFAULT '{}';
    END IF;
END $$;

-- Opcional: Criar uma tabela de disciplinas pré-definidas para sugestões no futuro
CREATE TABLE IF NOT EXISTS public.available_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category TEXT
);

-- Inserir algumas disciplinas básicas de exemplo
INSERT INTO public.available_subjects (name, category) VALUES 
('Matemática', 'Exatas'),
('Português', 'Humanas'),
('Física', 'Exatas'),
('Química', 'Exatas'),
('Biologia', 'Exatas'),
('História', 'Humanas'),
('Geografia', 'Humanas'),
('Inglês', 'Línguas'),
('Redação', 'Humanas')
ON CONFLICT (name) DO NOTHING;
