
-- 1. Caderno de Erros table
CREATE TABLE public.caderno_erros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  questao_data JSONB NOT NULL,
  materia TEXT NOT NULL,
  assunto TEXT NOT NULL,
  resposta_usuario TEXT NOT NULL,
  resposta_correta TEXT NOT NULL,
  proxima_revisao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 day'),
  vezes_revisada INTEGER NOT NULL DEFAULT 0,
  acertou_revisao BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.caderno_erros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own errors" ON public.caderno_erros FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own errors" ON public.caderno_erros FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own errors" ON public.caderno_erros FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own errors" ON public.caderno_erros FOR DELETE USING (auth.uid() = user_id);

-- 2. Plano de Estudos table
CREATE TABLE public.plano_estudos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  semana DATE NOT NULL,
  plano_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.plano_estudos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plans" ON public.plano_estudos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plans" ON public.plano_estudos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plans" ON public.plano_estudos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plans" ON public.plano_estudos FOR DELETE USING (auth.uid() = user_id);

-- 3. Plano Tarefas table
CREATE TABLE public.plano_tarefas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plano_id UUID NOT NULL REFERENCES public.plano_estudos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  dia TEXT NOT NULL,
  materia TEXT NOT NULL,
  topico TEXT NOT NULL,
  tempo_minutos INTEGER NOT NULL DEFAULT 60,
  done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.plano_tarefas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON public.plano_tarefas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.plano_tarefas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.plano_tarefas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.plano_tarefas FOR DELETE USING (auth.uid() = user_id);

-- 4. Add tempos_por_questao to simulado_history
ALTER TABLE public.simulado_history ADD COLUMN tempos_por_questao JSONB DEFAULT NULL;
