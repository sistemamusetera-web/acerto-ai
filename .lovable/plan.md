

# Plano: 4 Features - Caderno de Erros, Cronômetro, Simulado Adaptativo, Plano Dinâmico com IA

---

## 1. Caderno de Erros Inteligente

**Banco de dados:** Nova tabela `caderno_erros` com colunas: `id`, `user_id`, `questao_data` (jsonb com enunciado, alternativas, explicação), `materia`, `assunto`, `resposta_usuario`, `resposta_correta`, `proxima_revisao` (timestamp para repetição espaçada), `vezes_revisada` (int), `acertou_revisao` (bool), `created_at`. RLS para cada usuário ver apenas seus erros.

**Lógica de salvamento:** Ao finalizar um simulado (`handleFinish` em `Simulado.tsx`), salvar automaticamente cada questão errada na tabela `caderno_erros` com `proxima_revisao` = agora + 1 dia.

**Nova página `/caderno`:**
- Lista questões erradas agrupadas por matéria/assunto
- Indicador visual de "revisar agora" (quando `proxima_revisao <= now()`)
- Botão "Refazer" que apresenta a questão novamente; ao acertar, atualiza `proxima_revisao` com intervalos crescentes (1d → 3d → 7d → 15d → 30d); ao errar, reseta para 1d
- Filtros por matéria e status de revisão
- Contadores de pendências no sidebar

**Sidebar:** Adicionar link "Caderno de Erros" com ícone `BookX`.

---

## 2. Cronômetro por Questão

**Banco de dados:** Adicionar coluna `tempos_por_questao` (jsonb) na tabela `simulado_history` para armazenar `{ questionId: seconds }`. Atualizar coluna `tempo_medio_segundos` em `desempenho_stats`.

**SimuladoQuestion:** Adicionar timer visível no canto superior direito, contando segundos desde que a questão foi exibida. State `questionTimers: Record<number, number>` no `Simulado.tsx`, com `useEffect` + `setInterval` que incrementa a cada segundo.

**BancaSelector:** Adicionar toggle "Modo Prova Real" com timer global (ex: 3min por questão × total). Quando ativo, exibe barra de tempo total e bloqueia navegação para questões já respondidas.

**SimuladoResult:** Nova seção "Análise de Tempo" mostrando:
- Tempo médio por questão
- Questões onde demorou mais que o dobro da média (alerta)
- Gráfico de barras simples com tempo por questão

**Salvar:** Em `handleFinish`, incluir `tempos_por_questao` no insert do `simulado_history` e atualizar `tempo_medio_segundos` em `desempenho_stats`.

---

## 3. Simulado Adaptativo

**Lógica no BancaSelector:** Adicionar opção "Simulado Adaptativo" como novo modo. Quando selecionado, buscar `desempenho_stats` do usuário e `caderno_erros` para identificar matérias/assuntos fracos.

**Edge function `generate-simulado`:** Adicionar suporte a campo `adaptativo: true` com dados de `weakTopics` no body. O prompt da IA será ajustado para:
- 60% questões nos tópicos fracos
- 30% questões em tópicos médios
- 10% questões em tópicos fortes
- Dificuldade progressiva: começa no nível do aluno e ajusta conforme acertos

**Fluxo:** O front-end busca os stats, calcula os tópicos fracos, e envia junto com a config para a edge function.

---

## 4. Plano de Estudos Dinâmico com IA

**Banco de dados:** Nova tabela `plano_estudos` com: `id`, `user_id`, `semana` (date), `plano_data` (jsonb com o plano gerado), `created_at`. Tabela `plano_tarefas` com: `id`, `plano_id`, `dia`, `materia`, `topico`, `tempo_minutos`, `done` (bool), `user_id`. RLS em ambas.

**Nova edge function `generate-plano`:** Recebe dados de desempenho do usuário (matérias fracas, horas disponíveis, data da prova, caderno de erros pendentes) e gera um plano semanal personalizado via IA.

**Página PlanoEstudos atualizada:**
- Botão "Gerar Plano com IA" que coleta perfil (horas/semana, data da prova do `profiles`) e stats do banco
- Exibe o plano gerado com tarefas por dia da semana
- Checkbox interativo para marcar tarefas como concluídas (update na tabela)
- Botão "Regenerar" para nova semana
- Progresso semanal real baseado em tarefas concluídas

---

## Resumo Técnico

| Item | Migrations | Edge Functions | Páginas/Componentes |
|------|-----------|----------------|---------------------|
| Caderno de Erros | `caderno_erros` | — | Nova página + sidebar |
| Cronômetro | Alterar `simulado_history` | — | Editar 3 componentes |
| Adaptativo | — | Editar `generate-simulado` | Editar BancaSelector + Simulado |
| Plano Dinâmico | `plano_estudos` + `plano_tarefas` | Nova `generate-plano` | Reescrever PlanoEstudos |

**Total:** 2 migrations, 1 nova edge function, 1 edge function editada, 1 nova página, ~8 arquivos editados.

