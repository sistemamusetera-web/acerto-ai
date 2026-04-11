import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { desempenho, errosPendentes, horasSemanais, dataProva, concursoAlvo } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const today = new Date();
    const diasAteProva = dataProva
      ? Math.ceil((new Date(dataProva).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const systemPrompt = `Você é um coach especialista em concursos públicos brasileiros.

Gere um plano de estudos semanal personalizado baseado nos dados do aluno.

DADOS DO ALUNO:
- Horas disponíveis por semana: ${horasSemanais || 20}h
- Concurso alvo: ${concursoAlvo || "Não definido"}
${diasAteProva ? `- Dias até a prova: ${diasAteProva}` : "- Data da prova: não definida"}
- Desempenho por matéria: ${JSON.stringify(desempenho || [])}
- Questões pendentes no caderno de erros: ${errosPendentes || 0}

INSTRUÇÕES:
1. Distribua as horas ao longo de 6 dias (segunda a sábado)
2. Priorize matérias com menor desempenho
3. Inclua sessões de revisão para o caderno de erros
4. Inclua simulados práticos
5. Cada tarefa deve ter: dia, matéria, tópico específico, tempo em minutos

Responda APENAS com JSON válido no formato:
{
  "tarefas": [
    {"dia": "Segunda", "materia": "...", "topico": "...", "tempo_minutos": 60},
    {"dia": "Segunda", "materia": "...", "topico": "...", "tempo_minutos": 30}
  ],
  "dicas": ["dica 1", "dica 2"],
  "foco_semana": "descrição curta do foco principal"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Gere o plano de estudos semanal personalizado. Responda apenas com JSON válido." },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "Erro ao gerar plano" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    try {
      const parsed = JSON.parse(content);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      console.error("Failed to parse:", content.substring(0, 500));
      return new Response(JSON.stringify({ error: "Erro ao processar resposta da IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
