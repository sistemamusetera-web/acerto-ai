import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ChevronLeft, ChevronRight, Clock, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Question {
  id: number;
  materia: string;
  assunto: string;
  dificuldade: string;
  enunciado: string;
  alternativas: { letra: string; texto: string }[];
  correta: string;
  pegadinha?: string | null;
}

interface Props {
  question: Question;
  currentIndex: number;
  total: number;
  answer: string | undefined;
  onAnswer: (letra: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
  answeredCount: number;
  allQuestions: Question[];
  answers: Record<number, string>;
  onGoTo: (i: number) => void;
  timer: number;
  globalTimer?: number;
  globalTimeLimit?: number;
  modoProva?: boolean;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SimuladoQuestion({
  question, currentIndex, total, answer, onAnswer,
  onPrev, onNext, onFinish, answeredCount,
  allQuestions, answers, onGoTo,
  timer, globalTimer, globalTimeLimit, modoProva,
}: Props) {
  const diffColors: Record<string, string> = {
    facil: "text-primary", medio: "text-accent", dificil: "text-destructive",
  };

  const globalProgress = globalTimeLimit && globalTimer !== undefined
    ? Math.min((globalTimer / globalTimeLimit) * 100, 100) : 0;
  const timeRunningOut = globalTimeLimit && globalTimer !== undefined && globalTimer > globalTimeLimit * 0.8;

  return (
    <div className="space-y-5">
      {/* Global timer bar for prova mode */}
      {modoProva && globalTimeLimit && globalTimer !== undefined && (
        <div className="glass-card p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium flex items-center gap-1">
              <Timer className="w-3.5 h-3.5" /> Modo Prova
            </span>
            <span className={`text-xs font-semibold ${timeRunningOut ? "text-destructive" : "text-muted-foreground"}`}>
              {formatTime(globalTimer)} / {formatTime(globalTimeLimit)}
            </span>
          </div>
          <Progress value={globalProgress} className="h-2" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{question.materia}</span>
            <span>•</span>
            <span>{question.assunto}</span>
            <span>•</span>
            <span className={diffColors[question.dificuldade] || ""}>{question.dificuldade}</span>
          </div>
          <h2 className="font-display font-semibold mt-1">Questão {currentIndex + 1} de {total}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-medium">{formatTime(timer)}</span>
          </div>
          <span className="text-sm text-muted-foreground">{answeredCount}/{total}</span>
        </div>
      </div>

      {question.pegadinha && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2 bg-accent/10 border border-accent/30 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-accent">⚠️ Pegadinha Detectada!</p>
            <p className="text-xs text-accent/80 mt-0.5">{question.pegadinha}</p>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={question.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-6">
          <p className="text-sm leading-relaxed mb-6">{question.enunciado}</p>
          <div className="space-y-2">
            {question.alternativas.map((a) => (
              <button
                key={a.letra}
                onClick={() => onAnswer(a.letra)}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                  answer === a.letra
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border hover:border-primary/50 hover:bg-muted/30 text-foreground/80"
                }`}
              >
                <span className="font-display font-semibold mr-3 text-primary">{a.letra})</span>
                {a.texto}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={currentIndex === 0 || (modoProva && answers[allQuestions[currentIndex - 1]?.id] !== undefined)}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
        </Button>
        {currentIndex < total - 1 ? (
          <Button size="sm" onClick={onNext} className="gradient-primary">
            Próxima <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button size="sm" onClick={onFinish} className="gradient-primary" disabled={answeredCount < total}>
            Finalizar Simulado
          </Button>
        )}
      </div>

      <div className="glass-card p-4">
        <p className="text-xs text-muted-foreground mb-2">Mapa de Questões</p>
        <div className="flex gap-1.5 flex-wrap">
          {allQuestions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => onGoTo(i)}
              className={`w-8 h-8 rounded text-xs font-semibold transition-colors ${
                i === currentIndex
                  ? "gradient-primary text-primary-foreground"
                  : answers[q.id]
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
