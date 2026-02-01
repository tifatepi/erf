
-- SCRIPT DE AUTOMAÇÃO FINANCEIRA EDUBOOST
-- Descrição: Gera 6 parcelas mensais para novos alunos em turmas.
-- Vencimento: A primeira parcela vence 30 dias após o ingresso.

CREATE OR REPLACE FUNCTION public.fn_handle_enrollment_finance()
RETURNS TRIGGER AS $$
DECLARE
    new_student_id UUID;
    student_monthly_fee DECIMAL;
    i INT;
    newly_added_students UUID[];
BEGIN
    -- 1. Identificar alunos adicionados
    IF TG_OP = 'INSERT' THEN
        newly_added_students := NEW.student_ids;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Comparar o array novo com o antigo para pegar apenas os que entraram agora
        SELECT ARRAY_AGG(elem) INTO newly_added_students
        FROM UNNEST(NEW.student_ids) elem
        WHERE elem NOT IN (SELECT UNNEST(COALESCE(OLD.student_ids, '{}')));
    END IF;

    -- 2. Se houver novos alunos, gerar o financeiro
    IF newly_added_students IS NOT NULL AND array_length(newly_added_students, 1) > 0 THEN
        FOREACH new_student_id IN ARRAY newly_added_students LOOP
            
            -- Buscar o valor da mensalidade do aluno
            SELECT monthly_fee INTO student_monthly_fee 
            FROM public.students 
            WHERE id = new_student_id;

            -- Só gera se o aluno tiver um valor de mensalidade definido > 0
            IF student_monthly_fee > 0 THEN
                FOR i IN 1..6 LOOP
                    INSERT INTO public.payments (
                        student_id, 
                        amount, 
                        due_date, 
                        status, 
                        description
                    )
                    VALUES (
                        new_student_id, 
                        student_monthly_fee, 
                        (CURRENT_DATE + (i * INTERVAL '30 days'))::DATE, 
                        'PENDING', 
                        'Mensalidade - Parcela ' || i || '/6 (Turma: ' || NEW.name || ')'
                    );
                END LOOP;
            END IF;
            
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar a Trigger na tabela de turmas
DROP TRIGGER IF EXISTS tr_generate_finance_on_enrollment ON public.turmas;
CREATE TRIGGER tr_generate_finance_on_enrollment
AFTER INSERT OR UPDATE ON public.turmas
FOR EACH ROW
EXECUTE FUNCTION public.fn_handle_enrollment_finance();
