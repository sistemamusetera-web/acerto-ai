import { Target, BookOpen, Clock, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["desempenho_stats", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("desempenho_stats")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: simulados, isLoading: loadingSimulados } = useQuery({
    queryKey: ["simulado_history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("simulado_history")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const totalAcertos = stats?.reduce((s, r) => s + r.acertos, 0) ?? 0;
  const totalErros = stats?.reduce((s, r) => s + r.erros, 0) ?? 0;
  const totalQuestoes = totalAcertos + totalErros;
  const taxaAcerto = totalQuestoes > 0 ? Math.round((totalAcertos / totalQuestoes) * 100) : 0;
  const totalSimulados = simulados?.length ?? 0;

  const materias = (stats ?? [])
    .map((s) => {
      const total = s.acertos + s.erros;
      return {
        name: s.materia,
        percent: total > 0 ? Math.round((s.acertos / total) * 100) : 0,
        total,
      };
    })
    .sort((a, b) => b.total - a.total);

  const weakSubjects = materias.filter((m) => m.percent < 60 && m.total >= 3);

  const isLoading = loadingStats || loadingSimulados;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do seu progresso</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Taxa de Acerto" value={`${taxaAcerto}%`} subtitle="Geral" />
        <StatCard icon={BookOpen} label="Questões Resolvidas" value={totalQuestoes.toLocaleString("pt-BR")} subtitle="Total acumulado" />
        <StatCard icon={TrendingUp} label="Simulados Feitos" value={String(totalSimulados)} subtitle="Total" />
        <StatCard icon={Clock} label="Matérias Estudadas" value={String(materias.length)} subtitle="Com questões respondidas" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Desempenho por matéria */}
        <div className="lg:col-span-2 glass-card p-5">
          <h2 className="font-display font-semibold mb-4">Desempenho por Matéria</h2>
          {materias.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum dado ainda. Faça um simulado para começar!</p>
          ) : (
            <div className="space-y-4">
              {materias.map((m) => (
                <div key={m.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span>{m.name}</span>
                    <span className="text-muted-foreground">{m.percent}% ({m.total} questões)</span>
                  </div>
                  <Progress value={m.percent} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Atividade recente */}
        <div className="glass-card p-5">
          <h2 className="font-display font-semibold mb-4">Simulados Recentes</h2>
          {!simulados || simulados.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum simulado realizado ainda.</p>
          ) : (
            <div className="space-y-3">
              {simulados.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-start gap-3 p-2.5 rounded-md bg-muted/30">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm truncate">{s.banca} — {s.materia}</p>
                    <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="text-primary font-medium">{Math.round(Number(s.percentage))}%</span>
                      <span>{formatDistanceToNow(new Date(s.created_at), { addSuffix: true, locale: ptBR })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alertas dinâmicos */}
      {weakSubjects.length > 0 && (
        <div className="glass-card p-5 border-accent/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-accent" />
            <h2 className="font-display font-semibold text-accent">Atenção</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            {weakSubjects.map((m) => (
              <div key={m.name} className="bg-muted/30 rounded-md p-3">
                <p className="font-medium">{m.name}</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Acerto de {m.percent}% em {m.total} questões. Reforce os estudos nessa matéria.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
