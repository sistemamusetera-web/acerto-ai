import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BancaSelector from "@/components/simulado/BancaSelector";
import SimuladoQuestion from "@/components/simulado/SimuladoQuestion";
import SimuladoResult from "@/components/simulado/SimuladoResult";

interface SimuladoData {
  analise_banca?: {
    nome: string;
    caracteristicas: string[];
    dicas_gerais: string[];
    padrao_gabarito: string;
  };
  questoes: {
    id: number;
    materia: string;
    assunto: string;
    dificuldade: string;
    enunciado: string;
    alternativas: { letra: string; texto: string }[];
    correta: string;
    pegadinha?: string | null;
    explicacao: string;
    insight?: string;
    alternativas_erradas?: Record<string, string>;
  }[];
  estrategias?: string[];
  pegadinhas_comuns?: string[];
}

export default function Simulado() {
  const [loading, setLoading] = useState(false);
  const [simuladoData, setSimuladoData] = useState<SimuladoData | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [config, setConfig] = useState<{ banca: string; materia: string; quantidade: number; nivel: string } | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleStart = async (cfg: { banca: string; materia: string; quantidade: number; nivel: string }) => {
    setLoading(true);
    setConfig(cfg);
    try {
      const { data, error } = await supabase.functions.invoke("generate-simulado", { body: cfg });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSimuladoData(data);
      setCurrentQ(0);
      setAnswers({});
      setShowResult(false);
    } catch (err: any) {
      toast({ title: "Erro ao gerar simulado", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setShowResult(true);
    if (!simuladoData || !config || !user) return;

    const questions = simuladoData.questoes;
    const score = questions.filter((q) => answers[q.id] === q.correta).length;
    const percentage = Math.round((score / questions.length) * 100);

    try {
      // Save simulado history
      await supabase.from("simulado_history").insert({
        user_id: user.id,
        banca: config.banca,
        materia: config.materia,
        nivel: config.nivel,
        score,
        total: questions.length,
        percentage,
        simulado_data: simuladoData as any,
        answers: answers as any,
      });

      // Upsert desempenho stats
      const { data: existing } = await supabase
        .from("desempenho_stats")
        .select("*")
        .eq("user_id", user.id)
        .eq("materia", config.materia)
        .maybeSingle();

      const acertos = questions.filter((q) => answers[q.id] === q.correta).length;
      const erros = questions.length - acertos;

      if (existing) {
        await supabase.from("desempenho_stats").update({
          acertos: existing.acertos + acertos,
          erros: existing.erros + erros,
        }).eq("id", existing.id);
      } else {
        await supabase.from("desempenho_stats").insert({
          user_id: user.id,
          materia: config.materia,
          acertos,
          erros,
        });
      }
    } catch (err) {
      console.error("Error saving results:", err);
    }
  };

  const handleRestart = () => {
    setSimuladoData(null);
    setCurrentQ(0);
    setAnswers({});
    setShowResult(false);
    setConfig(null);
  };

  if (!simuladoData) {
    return <BancaSelector onStart={handleStart} loading={loading} />;
  }

  const questions = simuladoData.questoes;

  if (showResult) {
    return (
      <SimuladoResult
        questions={questions}
        answers={answers}
        analise={simuladoData.analise_banca}
        estrategias={simuladoData.estrategias}
        pegadinhasComuns={simuladoData.pegadinhas_comuns}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <SimuladoQuestion
      question={questions[currentQ]}
      currentIndex={currentQ}
      total={questions.length}
      answer={answers[questions[currentQ].id]}
      onAnswer={(letra) => setAnswers((prev) => ({ ...prev, [questions[currentQ].id]: letra }))}
      onPrev={() => setCurrentQ((p) => Math.max(0, p - 1))}
      onNext={() => setCurrentQ((p) => p + 1)}
      onFinish={handleFinish}
      answeredCount={Object.keys(answers).length}
      allQuestions={questions}
      answers={answers}
      onGoTo={setCurrentQ}
    />
  );
}
