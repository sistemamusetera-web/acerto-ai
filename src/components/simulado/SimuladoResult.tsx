import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, AlertTriangle, Lightbulb, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Question {
  id: number;
  materia: string;
  assunto: string;
  dificuldade: string;
  enunciado: string;
  alternativas: { letra: string; texto: string }[];
  correta: string;
  explicacao: string;
  insight?: string;
  alternativas_erradas?: Record<string, string>;
  pegadinha?: string | null;
}

interface AnaliseBanca {
  nome: string;
  caracteristicas: string[];
  dicas_gerais: string[];
  padrao_gabarito: string;
}

interface Props {
  questions: Question[];
  answers: Record<number, string>;
  analise?: AnaliseBanca;
  estrategias?: string[];
  pegadinhasComuns?: string[];
  onRestart: () => void;
  questionTimers?: Record<number, number>;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SimuladoResult({ questions, answers, analise, estrategias, pegadinhasComuns, onRestart, questionTimers }: Props) {
  const score = questions.filter((q) => answers[q.id] === q.correta).length;
  const pct = Math.round((score / questions.length) * 100);

  const hasTimers = questionTimers && Object.keys(questionTimers).length > 0;
  const timeData = hasTimers
    ? questions.map((q, i) => ({ label: `Q${i + 1}`, tempo: questionTimers![q.id] || 0 }))
    : [];
  const avgTime = hasTimers
    ? Math.round(Object.values(questionTimers!).reduce((s, t) => s + t, 0) / questions.length)
    : 0;
  const slowQuestions = hasTimers ? timeData.filter((t) => t.tempo > avgTime * 2) : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Score */}
      <div className="text-center glass-card p-6">
        <h1 className="font-display text-2xl font-bold">Resultado do Simulado</h1>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div>
            <p className="text-5xl font-display font-bold text-primary">{score}/{questions.length}</p>
            <p className="text-sm text-muted-foreground">Acertos</p>
          </div>
          <div>
            <p className={`text-4xl font-display font-bold ${pct >= 70 ? "text-primary" : pct >= 50 ? "text-accent" : "text-destructive"}`}>{pct}%</p>
            <p className="text-sm text-muted-foreground">Aproveitamento</p>
          </div>
          {hasTimers && (
            <div>
              <p className="text-4xl font-display font-bold text-muted-foreground">{formatTime(avgTime)}</p>
              <p className="text-sm text-muted-foreground">Tempo médio</p>
            </div>
          )}
        </div>
      </div>

      {/* Time Analysis */}
      {hasTimers && (
        <div className="glass-card p-5">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Análise de Tempo
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,25%,16%)" />
              <XAxis dataKey="label" tick={{ fill: "hsl(215,20%,55%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(215,20%,55%)", fontSize: 11 }} tickFormatter={(v) => `${v}s`} />
              <Tooltip
                contentStyle={{ background: "hsl(222,44%,9%)", border: "1px solid hsl(222,25%,16%)", borderRadius: 8 }}
                formatter={(value: number) => [formatTime(value), "Tempo"]}
              />
              <Bar dataKey="tempo" fill="hsl(160,84%,39%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {slowQuestions.length > 0 && (
            <div className="mt-3 flex items-start gap-2 bg-accent/10 border border-accent/30 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-accent">Questões lentas (acima de {formatTime(avgTime * 2)})</p>
                <p className="text-xs text-accent/80 mt-0.5">{slowQuestions.map((q) => q.label).join(", ")}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Análise da Banca */}
      {analise && (
        <div className="glass-card p-5 space-y-3">
          <h2 className="font-display font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Análise da Banca {analise.nome}
          </h2>
          <ul className="text-sm space-y-1">
            {analise.dicas_gerais?.map((d, i) => <li key={i} className="text-foreground/80">• {d}</li>)}
          </ul>
        </div>
      )}

      {estrategias && estrategias.length > 0 && (
        <div className="glass-card p-5 space-y-2">
          <h2 className="font-display font-semibold flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-accent" /> Estratégias
          </h2>
          <ul className="text-sm space-y-1.5">
            {estrategias.map((e, i) => <li key={i} className="text-foreground/80">🎯 {e}</li>)}
          </ul>
        </div>
      )}

      {pegadinhasComuns && pegadinhasComuns.length > 0 && (
        <div className="glass-card p-5 space-y-2">
          <h2 className="font-display font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" /> Pegadinhas Comuns
          </h2>
          <ul className="text-sm space-y-1.5">
            {pegadinhasComuns.map((p, i) => <li key={i} className="text-foreground/80">⚠️ {p}</li>)}
          </ul>
        </div>
      )}

      {/* Questions Review */}
      <h2 className="font-display font-semibold">📝 Revisão das Questões</h2>
      <div className="space-y-4">
        {questions.map((q, i) => {
          const userAnswer = answers[q.id];
          const correct = userAnswer === q.correta;
          const timeSpent = questionTimers?.[q.id];
          return (
            <div key={q.id} className={`glass-card p-5 border-l-4 ${correct ? "border-l-primary" : "border-l-destructive"}`}>
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  {correct ? <CheckCircle className="w-4 h-4 text-primary" /> : <XCircle className="w-4 h-4 text-destructive" />}
                  <span className="font-display font-semibold text-sm">Questão {i + 1}</span>
                  <span className="text-xs text-muted-foreground">{q.materia} • {q.assunto}</span>
                </div>
                {timeSpent !== undefined && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatTime(timeSpent)}
                  </span>
                )}
              </div>
              <p className="text-sm mb-3">{q.enunciado}</p>
              <div className="space-y-1.5">
                {q.alternativas.map((a) => (
                  <div
                    key={a.letra}
                    className={`text-sm px-3 py-1.5 rounded ${
                      a.letra === q.correta
                        ? "bg-primary/20 text-primary"
                        : a.letra === userAnswer
                        ? "bg-destructive/20 text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span className="font-semibold mr-2">{a.letra})</span>{a.texto}
                    {a.letra === q.correta && <span className="ml-2 text-xs">✓ Correta</span>}
                    {a.letra === userAnswer && a.letra !== q.correta && <span className="ml-2 text-xs">✗ Sua resposta</span>}
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">📖 {q.explicacao}</p>
                {q.insight && <p className="text-xs text-accent bg-accent/10 p-2 rounded">💡 {q.insight}</p>}
                {q.pegadinha && <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">⚠️ Pegadinha: {q.pegadinha}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <Button onClick={onRestart} className="gradient-primary font-semibold">🎯 Novo Simulado</Button>
      </div>
    </motion.div>
  );
}