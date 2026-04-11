import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { banca, materia, quantidade, nivel } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é uma inteligência artificial especialista em concursos públicos brasileiros.

Sua função é gerar simulados realistas baseados no estilo da banca ${banca}.

Características da banca ${banca}:
${getBancaProfile(banca)}

INSTRUÇÕES:
1. Gere exatamente ${quantidade} questões no estilo da banca ${banca}
2. Matéria: ${materia}
3. Nível de dificuldade: ${nivel}
4. Cada questão DEVE ter: enunciado, 5 alternativas (A-E), resposta correta, explicação detalhada
5. Inclua pegadinhas típicas da banca quando aplicável
6. Identifique o insight de prova de cada questão
7. Siga a distribuição de dificuldade real da banca

IMPORTANTE: Responda APENAS com o JSON válido, sem markdown, sem code blocks.

Formato JSON obrigatório:
{
  "analise_banca": {
    "nome": "${banca}",
    "caracteristicas": ["..."],
    "dicas_gerais": ["..."],
    "padrao_gabarito": "descrição do padrão típico"
  },
  "questoes": [
    {
      "id": 1,
      "materia": "${materia}",
      "assunto": "tópico específico",
      "dificuldade": "facil|medio|dificil",
      "enunciado": "texto da questão",
      "alternativas": [
        {"letra": "A", "texto": "..."},
        {"letra": "B", "texto": "..."},
        {"letra": "C", "texto": "..."},
        {"letra": "D", "texto": "..."},
        {"letra": "E", "texto": "..."}
      ],
      "correta": "A",
      "pegadinha": "descrição da pegadinha ou null",
      "explicacao": "explicação detalhada",
      "insight": "insight estratégico para o concurseiro",
      "alternativas_erradas": {
        "A": "motivo de estar errada",
        "B": "motivo de estar errada"
      }
    }
  ],
  "estrategias": ["dica 1", "dica 2"],
  "pegadinhas_comuns": ["pegadinha 1", "pegadinha 2"]
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
          { role: "user", content: `Gere ${quantidade} questões de ${materia} no estilo da banca ${banca}, nível ${nivel}. Responda apenas com JSON válido.` },
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
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos em Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "Erro ao gerar simulado" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Clean markdown code blocks if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    try {
      const parsed = JSON.parse(content);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      return new Response(JSON.stringify({ error: "Erro ao processar resposta da IA", raw: content.substring(0, 1000) }), {
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

function getBancaProfile(banca: string): string {
  const profiles: Record<string, string> = {
    CESPE: `- Estilo CERTO/ERRADO e múltipla escolha
- Questões com pegadinhas sutis em palavras como "sempre", "nunca", "exclusivamente"
- Alta cobrança de jurisprudência
- Questões longas e interpretativas
- Penaliza chute (pontuação negativa em CERTO/ERRADO)
- Alternativas com redação próxima ao texto legal, com pequenas alterações`,
    FCC: `- Questões objetivas e diretas, "letra de lei"
- Foco em memorização de texto legal
- Alternativas bem definidas
- Raramente cobra jurisprudência
- Questões de português são bastante cobradas
- Padrão previsível de gabarito`,
    FGV: `- Questões mais elaboradas e interpretativas
- Cobrança de doutrina e jurisprudência
- Alternativas longas e bem fundamentadas
- Nível de dificuldade elevado
- Questões que exigem raciocínio, não só memorização
- Temas atuais e transversais`,
    VUNESP: `- Questões de nível médio
- Foco em legislação estadual (SP)
- Questões de português com textos literários
- Alternativas claras e bem diferenciadas
- Cobrança equilibrada entre teoria e prática`,
    IBFC: `- Questões diretas e objetivas
- Nível de dificuldade médio
- Foco em legislação básica
- Alternativas curtas
- Pouca cobrança de jurisprudência`,
    CEBRASPE: `- Mesmo padrão do CESPE (nova denominação)
- Estilo CERTO/ERRADO predominante
- Questões interpretativas e com pegadinhas
- Alta exigência de conhecimento jurisprudencial`,
  };
  return profiles[banca] || `Banca ${banca} - gere questões no padrão típico de concursos públicos brasileiros.`;
}
