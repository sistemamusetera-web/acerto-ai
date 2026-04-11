import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { banca, concursoAlvo } = await req.json();
    if (!banca || typeof banca !== "string") {
      return new Response(JSON.stringify({ error: "Banca é obrigatória" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é um analista especialista em concursos públicos brasileiros com décadas de experiência.

Sua tarefa é gerar uma análise APROFUNDADA e DETALHADA sobre a banca examinadora "${banca}"${concursoAlvo ? ` para o concurso "${concursoAlvo}"` : ""}.

Baseie-se em todo o seu conhecimento sobre editais anteriores e atuais desta banca.

Responda APENAS com JSON válido no formato:
{
  "banca": "${banca}",
  "resumo": "Parágrafo resumindo o perfil da banca",
  "topicos_frequentes": [
    {"materia": "...", "topico": "...", "frequencia": "Alta|Média|Baixa", "observacao": "..."}
  ],
  "tendencias_recentes": [
    {"tendencia": "...", "detalhes": "...", "impacto": "Alto|Médio|Baixo"}
  ],
  "estrategias": [
    {"titulo": "...", "descricao": "...", "prioridade": "Essencial|Importante|Complementar"}
  ],
  "pontos_criticos": [
    {"ponto": "...", "motivo": "...", "como_evitar": "..."}
  ],
  "metodo_estudo": {
    "fases": [
      {"fase": "...", "duracao": "...", "atividades": ["..."], "foco": "..."}
    ],
    "cronograma_semanal": [
      {"dia": "Segunda", "atividades": ["..."]}
    ],
    "dicas_extras": ["..."]
  }
}

IMPORTANTE:
- Inclua pelo menos 8 tópicos frequentes
- Inclua pelo menos 5 tendências recentes
- Inclua pelo menos 6 estratégias
- Inclua pelo menos 5 pontos críticos
- O método de estudo deve ter pelo menos 3 fases
- Seja específico e prático, evite generalidades`;

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
          { role: "user", content: `Gere a análise completa da banca ${banca}. Responda apenas com JSON válido.` },
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
      return new Response(JSON.stringify({ error: "Erro ao gerar análise" }), {
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
