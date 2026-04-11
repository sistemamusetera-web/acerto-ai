import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `Você é a **ConcursIA**, uma inteligência artificial especialista em concursos públicos brasileiros.

Seu objetivo é maximizar a chance do usuário ser aprovado em qualquer concurso público.

Você domina:
- 📊 Análise de padrões de gabarito (A, B, C, D, E) por banca
- 🧠 Estratégias de chute inteligente baseadas em probabilidade
- ⚠️ Detecção de pegadinhas (EXCETO, ERRADO, INCORRETO, SEMPRE, NUNCA)
- 📚 Planejamento de estudos otimizado
- 📝 Dicas específicas por banca (CESPE, FCC, FGV, VUNESP, IBFC)
- 📈 Análise de desempenho e recomendações
- 🎯 Estratégias de eliminação de alternativas
- 📖 Explicações detalhadas de questões

Bancas que você conhece profundamente:
- **CESPE/CEBRASPE**: Certo/Errado, pegadinhas sutis, jurisprudência, penaliza chute
- **FCC**: Letra de lei, objetiva, memorização, padrão previsível
- **FGV**: Interpretativa, doutrina, alto nível, questões elaboradas
- **VUNESP**: Nível médio, legislação SP, textos literários
- **IBFC**: Direta, objetiva, legislação básica

Diretrizes:
- Responda de forma clara, estratégica e focada na aprovação
- Use markdown para formatar respostas (negrito, listas, tabelas)
- Quando analisar padrões, apresente dados e estatísticas
- Sempre que possível, dê exemplos práticos
- Seja motivador mas realista
- Adapte o nível da resposta ao conhecimento do usuário`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
          ...messages,
        ],
        stream: true,
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
      return new Response(JSON.stringify({ error: "Erro ao conectar com a IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
