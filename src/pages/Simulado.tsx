import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();

  const handleStart = async (config: { banca: string; materia: string; quantidade: number; nivel: string }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-simulado", {
        body: config,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSimuladoData(data);
      setCurrentQ(0);
      setAnswers({});
      setShowResult(false);
    } catch (err: any) {
      toast({
        title: "Erro ao gerar simulado",
        description: err.message || "Tente novamente em alguns segundos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setSimuladoData(null);
    setCurrentQ(0);
    setAnswers({});
    setShowResult(false);
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
      onFinish={() => setShowResult(true)}
      answeredCount={Object.keys(answers).length}
      allQuestions={questions}
      answers={answers}
      onGoTo={setCurrentQ}
    />
  );
}
