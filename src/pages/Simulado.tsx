import { useState, useEffect, useRef } from "react";
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
  const [config, setConfig] = useState<{ banca: string; materia: string; quantidade: number; nivel: string; modoProva?: boolean; adaptativo?: boolean } | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Timer state
  const [questionTimers, setQuestionTimers] = useState<Record<number, number>>({});
  const [globalTimer, setGlobalTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const globalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Per-question timer
  useEffect(() => {
    if (!simuladoData || showResult) return;
    const qId = simuladoData.questoes[currentQ]?.id;
    if (!qId) return;

    timerRef.current = setInterval(() => {
      setQuestionTimers((prev) => ({ ...prev, [qId]: (prev[qId] || 0) + 1 }));
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentQ, simuladoData, showResult]);

  // Global timer (modo prova)
  useEffect(() => {
    if (!config?.modoProva || !simuladoData || showResult) return;
    globalTimerRef.current = setInterval(() => {
      setGlobalTimer((prev) => prev + 1);
    }, 1000);
    return () => { if (globalTimerRef.current) clearInterval(globalTimerRef.current); };
  }, [config?.modoProva, simuladoData, showResult]);

  const handleStart = async (cfg: { banca: string; materia: string; quantidade: number; nivel: string; modoProva?: boolean; adaptativo?: boolean }) => {
    setLoading(true);
    setConfig(cfg);
    try {
      let body: any = { banca: cfg.banca, materia: cfg.materia, quantidade: cfg.quantidade, nivel: cfg.nivel };

      // Adaptive mode: fetch weak topics
      if (cfg.adaptativo && user) {
        const { data: stats } = await supabase.from("desempenho_stats").select("*").eq("user_id", user.id);
        const { data: erros } = await supabase.from("caderno_erros").select("materia, assunto").eq("user_id", user.id);

        const weakTopics = (stats ?? [])
          .map((s) => ({ materia: s.materia, taxa: s.acertos + s.erros > 0 ? s.acertos / (s.acertos + s.erros) : 0.5, total: s.acertos + s.erros }))
          .sort((a, b) => a.taxa - b.taxa);

        const erroAssuntos = [...new Set((erros ?? []).map((e) => `${e.materia}: ${e.assunto}`))];

        body.adaptativo = true;
        body.weakTopics = weakTopics;
        body.erroAssuntos = erroAssuntos;
      }

      const { data, error } = await supabase.functions.invoke("generate-simulado", { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSimuladoData(data);
      setCurrentQ(0);
      setAnswers({});
      setQuestionTimers({});
      setGlobalTimer(0);
      setShowResult(false);
    } catch (err: any) {
      toast({ title: "Erro ao gerar simulado", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setShowResult(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (globalTimerRef.current) clearInterval(globalTimerRef.current);

    if (!simuladoData || !config || !user) return;

    const questions = simuladoData.questoes;
    const score = questions.filter((q) => answers[q.id] === q.correta).length;
    const percentage = Math.round((score / questions.length) * 100);

    try {
      // Save simulado history with timers
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
        tempos_por_questao: questionTimers as any,
      });

      // Save wrong answers to caderno_erros
      const wrongQuestions = questions.filter((q) => answers[q.id] !== q.correta);
      if (wrongQuestions.length > 0) {
        const errosToInsert = wrongQuestions.map((q) => ({
          user_id: user.id,
          questao_data: {
            enunciado: q.enunciado,
            alternativas: q.alternativas,
            explicacao: q.explicacao,
            insight: q.insight,
            alternativas_erradas: q.alternativas_erradas,
          },
          materia: q.materia,
          assunto: q.assunto,
          resposta_usuario: answers[q.id] || "N/A",
          resposta_correta: q.correta,
        }));
        await supabase.from("caderno_erros").insert(errosToInsert);
      }

      // Upsert desempenho stats
      const { data: existing } = await supabase
        .from("desempenho_stats")
        .select("*")
        .eq("user_id", user.id)
        .eq("materia", config.materia)
        .maybeSingle();

      const acertos = score;
      const erros = questions.length - acertos;

      // Calculate average time
      const totalTime = Object.values(questionTimers).reduce((s, t) => s + t, 0);
      const avgTime = questions.length > 0 ? Math.round(totalTime / questions.length) : 0;

      if (existing) {
        const newTotal = existing.acertos + existing.erros + acertos + erros;
        const prevTotalTime = (existing.tempo_medio_segundos || 0) * (existing.acertos + existing.erros);
        const newAvg = newTotal > 0 ? Math.round((prevTotalTime + totalTime) / newTotal) : 0;

        await supabase.from("desempenho_stats").update({
          acertos: existing.acertos + acertos,
          erros: existing.erros + erros,
          tempo_medio_segundos: newAvg,
        }).eq("id", existing.id);
      } else {
        await supabase.from("desempenho_stats").insert({
          user_id: user.id,
          materia: config.materia,
          acertos,
          erros,
          tempo_medio_segundos: avgTime,
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
    setQuestionTimers({});
    setGlobalTimer(0);
  };

  if (!simuladoData) {
    return <BancaSelector onStart={handleStart} loading={loading} />;
  }

  const questions = simuladoData.questoes;
  const totalTimeLimit = config?.modoProva ? config.quantidade * 180 : undefined; // 3min per question

  if (showResult) {
    return (
      <SimuladoResult
        questions={questions}
        answers={answers}
        analise={simuladoData.analise_banca}
        estrategias={simuladoData.estrategias}
        pegadinhasComuns={simuladoData.pegadinhas_comuns}
        onRestart={handleRestart}
        questionTimers={questionTimers}
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
      timer={questionTimers[questions[currentQ].id] || 0}
      globalTimer={config?.modoProva ? globalTimer : undefined}
      globalTimeLimit={totalTimeLimit}
      modoProva={config?.modoProva}
    />
  );
}
