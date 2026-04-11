import { CheckCircle, XCircle, Lightbulb, AlertTriangle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Question {
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
}

export default function SimuladoResult({ questions, answers, analise, estrategias, pegadinhasComuns, onRestart }: Props) {
  const score = questions.filter((q) => answers[q.id] === q.correta).length;
  const pct = Math.round((score / questions.length) * 100);

  return (
    <div className="space-y-6">
      {/* Score */}
      <div className="text-center glass-card p-6">
        <h1 className="font-display text-2xl font-bold">Resultado do Simulado</h1>
        <p className="text-5xl font-display font-bold text-primary mt-4">{score}/{questions.length}</p>
        <p className="text-muted-foreground mt-1">{pct}% de acerto</p>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div><span className="text-primary font-bold">{score}</span> <span className="text-muted-foreground">corretas</span></div>
          <div><span className="text-destructive font-bold">{questions.length - score}</span> <span className="text-muted-foreground">erradas</span></div>
        </div>
      </div>

      {/* Análise da Banca */}
      {analise && (
        <div className="glass-card p-5 space-y-3">
          <h2 className="font-display font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Análise da Banca {analise.nome}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Características</p>
              <ul className="text-xs space-y-1">
                {analise.caracteristicas.map((c, i) => <li key={i} className="text-foreground/80">• {c}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Padrão de Gabarito</p>
              <p className="text-xs text-foreground/80">{analise.padrao_gabarito}</p>
            </div>
          </div>
        </div>
      )}

      {/* Estratégias */}
      {estrategias && estrategias.length > 0 && (
        <div className="glass-card p-5 space-y-2">
          <h2 className="font-display font-semibold flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-accent" /> Estratégias para esta Banca
          </h2>
          <ul className="text-sm space-y-1.5">
            {estrategias.map((e, i) => <li key={i} className="text-foreground/80">🎯 {e}</li>)}
          </ul>
        </div>
      )}

      {/* Pegadinhas comuns */}
      {pegadinhasComuns && pegadinhasComuns.length > 0 && (
        <div className="glass-card p-5 space-y-2">
          <h2 className="font-display font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" /> Pegadinhas Comuns da Banca
          </h2>
          <ul className="text-sm space-y-1.5">
            {pegadinhasComuns.map((p, i) => <li key={i} className="text-foreground/80">⚠️ {p}</li>)}
          </ul>
        </div>
      )}

      {/* Questions Review */}
      <h2 className="font-display font-semibold">Revisão das Questões</h2>
      <div className="space-y-4">
        {questions.map((q) => {
          const userAnswer = answers[q.id];
          const correct = userAnswer === q.correta;
          return (
            <div key={q.id} className={`glass-card p-5 border-l-4 ${correct ? "border-l-primary" : "border-l-destructive"}`}>
              <div className="flex items-center gap-2 mb-1">
                {correct ? <CheckCircle className="w-4 h-4 text-primary" /> : <XCircle className="w-4 h-4 text-destructive" />}
                <span className="text-xs text-muted-foreground">{q.materia} • {q.assunto}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{q.dificuldade}</span>
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
                    {a.letra !== q.correta && a.letra === userAnswer && q.alternativas_erradas?.[a.letra] && (
                      <p className="text-xs mt-1 opacity-70">❌ {q.alternativas_erradas[a.letra]}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">📖 {q.explicacao}</p>
                {q.insight && (
                  <p className="text-xs text-accent bg-accent/10 p-2 rounded">💡 Insight: {q.insight}</p>
                )}
                {q.pegadinha && (
                  <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">⚠️ Pegadinha: {q.pegadinha}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Button onClick={onRestart} variant="outline" className="w-full">
        Novo Simulado
      </Button>
    </div>
  );
}
