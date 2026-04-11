import { Target, BookOpen, Clock, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Progress } from "@/components/ui/progress";

const materias = [
  { name: "Direito Constitucional", acertos: 78, total: 100 },
  { name: "Português", acertos: 65, total: 100 },
  { name: "Raciocínio Lógico", acertos: 52, total: 100 },
  { name: "Direito Administrativo", acertos: 71, total: 100 },
  { name: "Informática", acertos: 88, total: 100 },
];

const recentActivity = [
  { type: "simulado", text: "Simulado CESPE - Direito Constitucional", score: "82%", time: "2h atrás" },
  { type: "estudo", text: "Revisão de Português - Concordância", score: "", time: "5h atrás" },
  { type: "simulado", text: "Simulado FCC - Raciocínio Lógico", score: "64%", time: "1 dia" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do seu progresso</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Taxa de Acerto" value="72%" subtitle="Últimos 30 dias" trend="↑ 5% vs mês anterior" />
        <StatCard icon={BookOpen} label="Questões Resolvidas" value="1.847" subtitle="Total acumulado" />
        <StatCard icon={Clock} label="Horas de Estudo" value="142h" subtitle="Este mês" trend="↑ 12h vs meta" />
        <StatCard icon={TrendingUp} label="Ranking Simulados" value="Top 8%" subtitle="Entre 12.430 usuários" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Desempenho por matéria */}
        <div className="lg:col-span-2 glass-card p-5">
          <h2 className="font-display font-semibold mb-4">Desempenho por Matéria</h2>
          <div className="space-y-4">
            {materias.map((m) => (
              <div key={m.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span>{m.name}</span>
                  <span className="text-muted-foreground">{m.acertos}%</span>
                </div>
                <Progress value={m.acertos} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Atividade recente */}
        <div className="glass-card p-5">
          <h2 className="font-display font-semibold mb-4">Atividade Recente</h2>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-md bg-muted/30">
                {a.type === "simulado" ? (
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                ) : (
                  <BookOpen className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm truncate">{a.text}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                    {a.score && <span className="text-primary font-medium">{a.score}</span>}
                    <span>{a.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertas */}
      <div className="glass-card p-5 border-accent/30">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-accent" />
          <h2 className="font-display font-semibold text-accent">Atenção</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="bg-muted/30 rounded-md p-3">
            <p className="font-medium">Raciocínio Lógico</p>
            <p className="text-muted-foreground text-xs mt-1">Desempenho abaixo da meta. Reforce exercícios de lógica proposicional.</p>
          </div>
          <div className="bg-muted/30 rounded-md p-3">
            <p className="font-medium">Revisão Pendente</p>
            <p className="text-muted-foreground text-xs mt-1">3 matérias precisam de revisão espaçada esta semana.</p>
          </div>
          <div className="bg-muted/30 rounded-md p-3">
            <p className="font-medium">Simulado Semanal</p>
            <p className="text-muted-foreground text-xs mt-1">Você ainda não fez o simulado desta semana. Complete até domingo.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
