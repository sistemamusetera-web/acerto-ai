import { Calendar, CheckCircle, Circle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const weekPlan = [
  {
    dia: "Segunda",
    date: "14/04",
    tasks: [
      { materia: "Direito Constitucional", topico: "Direitos Fundamentais", tempo: "2h", done: true },
      { materia: "Português", topico: "Concordância Verbal", tempo: "1h30", done: true },
      { materia: "Questões", topico: "30 questões mistas", tempo: "1h", done: false },
    ],
  },
  {
    dia: "Terça",
    date: "15/04",
    tasks: [
      { materia: "Direito Administrativo", topico: "Atos Administrativos", tempo: "2h", done: false },
      { materia: "Raciocínio Lógico", topico: "Lógica Proposicional", tempo: "1h30", done: false },
      { materia: "Revisão", topico: "Flash cards - Dir. Constitucional", tempo: "30min", done: false },
    ],
  },
  {
    dia: "Quarta",
    date: "16/04",
    tasks: [
      { materia: "Informática", topico: "Segurança da Informação", tempo: "1h30", done: false },
      { materia: "Português", topico: "Interpretação de Textos", tempo: "2h", done: false },
      { materia: "Simulado", topico: "Simulado temático - Português", tempo: "1h30", done: false },
    ],
  },
];

export default function PlanoEstudos() {
  const totalTasks = weekPlan.flatMap((d) => d.tasks).length;
  const doneTasks = weekPlan.flatMap((d) => d.tasks).filter((t) => t.done).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Plano de Estudos</h1>
          <p className="text-sm text-muted-foreground mt-1">Semana 14-20 de Abril</p>
        </div>
        <div className="glass-card px-4 py-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Prova: 16/05/2026</span>
        </div>
      </div>

      {/* Progress */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progresso Semanal</span>
          <span className="text-sm text-primary font-semibold">{doneTasks}/{totalTasks} tarefas</span>
        </div>
        <Progress value={(doneTasks / totalTasks) * 100} className="h-3" />
      </div>

      {/* Schedule */}
      <div className="space-y-4">
        {weekPlan.map((day) => (
          <div key={day.dia} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-display font-semibold">{day.dia}</h3>
              <span className="text-xs text-muted-foreground">{day.date}</span>
            </div>
            <div className="space-y-2">
              {day.tasks.map((task, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${task.done ? "bg-primary/5" : "bg-muted/20"}`}>
                  {task.done ? (
                    <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.done ? "line-through text-muted-foreground" : ""}`}>{task.topico}</p>
                    <p className="text-xs text-muted-foreground">{task.materia}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="w-3 h-3" />
                    {task.tempo}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
