import { useState } from "react";
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  materia: string;
  enunciado: string;
  alternativas: { letra: string; texto: string }[];
  correta: string;
  pegadinha?: string;
  explicacao: string;
}

const mockQuestions: Question[] = [
  {
    id: 1,
    materia: "Direito Constitucional",
    enunciado: "De acordo com a Constituição Federal de 1988, são direitos sociais, EXCETO:",
    alternativas: [
      { letra: "A", texto: "A educação" },
      { letra: "B", texto: "A saúde" },
      { letra: "C", texto: "A propriedade" },
      { letra: "D", texto: "O trabalho" },
      { letra: "E", texto: "A moradia" },
    ],
    correta: "C",
    pegadinha: "Atenção à palavra EXCETO! A propriedade é direito individual, não social.",
    explicacao: "Art. 6º da CF/88 lista os direitos sociais. A propriedade é um direito individual previsto no art. 5º.",
  },
  {
    id: 2,
    materia: "Português",
    enunciado: "Assinale a alternativa em que a concordância verbal está INCORRETA:",
    alternativas: [
      { letra: "A", texto: "Fazem cinco anos que não o vejo." },
      { letra: "B", texto: "Houve muitos problemas na reunião." },
      { letra: "C", texto: "Deve haver soluções para isso." },
      { letra: "D", texto: "Existem várias possibilidades." },
      { letra: "E", texto: "Bastam dois exemplos." },
    ],
    correta: "A",
    pegadinha: "INCORRETA — busque o erro! 'Fazer' indicando tempo é impessoal: 'Faz cinco anos'.",
    explicacao: "O verbo 'fazer' indicando tempo decorrido é impessoal, devendo permanecer no singular: 'Faz cinco anos'.",
  },
  {
    id: 3,
    materia: "Raciocínio Lógico",
    enunciado: "Se todo professor é estudioso e alguns estudiosos são atletas, então é correto afirmar que:",
    alternativas: [
      { letra: "A", texto: "Todo professor é atleta." },
      { letra: "B", texto: "Alguns professores podem ser atletas." },
      { letra: "C", texto: "Nenhum professor é atleta." },
      { letra: "D", texto: "Todo atleta é professor." },
      { letra: "E", texto: "Todo atleta é estudioso." },
    ],
    correta: "B",
    explicacao: "Como todo professor é estudioso e alguns estudiosos são atletas, é possível que alguns professores estejam nessa interseção.",
  },
];

export default function Simulado() {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);

  const question = mockQuestions[currentQ];
  const totalQ = mockQuestions.length;
  const answered = Object.keys(answers).length;

  const handleAnswer = (letra: string) => {
    if (showResult) return;
    setAnswers((prev) => ({ ...prev, [question.id]: letra }));
  };

  const handleFinish = () => setShowResult(true);

  const score = mockQuestions.filter((q) => answers[q.id] === q.correta).length;

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-10 max-w-lg">
          <h1 className="font-display text-2xl font-bold mb-2">Simulado</h1>
          <p className="text-muted-foreground mb-6">
            {totalQ} questões • Múltiplas matérias • Detector de pegadinhas ativo
          </p>
          <div className="grid grid-cols-3 gap-3 mb-6 text-sm">
            <div className="bg-muted/30 rounded-md p-3">
              <p className="text-muted-foreground">Questões</p>
              <p className="font-display font-bold text-lg">{totalQ}</p>
            </div>
            <div className="bg-muted/30 rounded-md p-3">
              <p className="text-muted-foreground">Tempo</p>
              <p className="font-display font-bold text-lg">3min</p>
            </div>
            <div className="bg-muted/30 rounded-md p-3">
              <p className="text-muted-foreground">Matérias</p>
              <p className="font-display font-bold text-lg">3</p>
            </div>
          </div>
          <Button onClick={() => setStarted(true)} className="w-full gradient-primary font-semibold">
            Iniciar Simulado
          </Button>
        </motion.div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold">Resultado do Simulado</h1>
          <p className="text-4xl font-display font-bold text-primary mt-4">{score}/{totalQ}</p>
          <p className="text-muted-foreground mt-1">{Math.round((score / totalQ) * 100)}% de acerto</p>
        </div>

        <div className="space-y-4">
          {mockQuestions.map((q) => {
            const userAnswer = answers[q.id];
            const correct = userAnswer === q.correta;
            return (
              <div key={q.id} className={`glass-card p-5 border-l-4 ${correct ? "border-l-primary" : "border-l-destructive"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {correct ? <CheckCircle className="w-4 h-4 text-primary" /> : <XCircle className="w-4 h-4 text-destructive" />}
                  <span className="text-xs text-muted-foreground">{q.materia}</span>
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
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3 bg-muted/30 p-2 rounded">{q.explicacao}</p>
              </div>
            );
          })}
        </div>

        <Button onClick={() => { setStarted(false); setShowResult(false); setAnswers({}); setCurrentQ(0); }} variant="outline" className="w-full">
          Novo Simulado
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{question.materia}</p>
          <h2 className="font-display font-semibold">Questão {currentQ + 1} de {totalQ}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{answered}/{totalQ} respondidas</span>
          </div>
        </div>
      </div>

      {/* Pegadinha alert */}
      {question.pegadinha && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2 bg-accent/10 border border-accent/30 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-accent">⚠️ Pegadinha Detectada!</p>
            <p className="text-xs text-accent/80 mt-0.5">{question.pegadinha}</p>
          </div>
        </motion.div>
      )}

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={question.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-6">
          <p className="text-sm leading-relaxed mb-6">{question.enunciado}</p>
          <div className="space-y-2">
            {question.alternativas.map((a) => {
              const selected = answers[question.id] === a.letra;
              return (
                <button
                  key={a.letra}
                  onClick={() => handleAnswer(a.letra)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                    selected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border hover:border-primary/50 hover:bg-muted/30 text-foreground/80"
                  }`}
                >
                  <span className="font-display font-semibold mr-3 text-primary">{a.letra})</span>
                  {a.texto}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => setCurrentQ((p) => Math.max(0, p - 1))} disabled={currentQ === 0}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
        </Button>
        {currentQ < totalQ - 1 ? (
          <Button size="sm" onClick={() => setCurrentQ((p) => p + 1)} className="gradient-primary">
            Próxima <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleFinish} className="gradient-primary" disabled={answered < totalQ}>
            Finalizar Simulado
          </Button>
        )}
      </div>

      {/* Question map */}
      <div className="glass-card p-4">
        <p className="text-xs text-muted-foreground mb-2">Mapa de Questões</p>
        <div className="flex gap-1.5 flex-wrap">
          {mockQuestions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQ(i)}
              className={`w-8 h-8 rounded text-xs font-semibold transition-colors ${
                i === currentQ
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
