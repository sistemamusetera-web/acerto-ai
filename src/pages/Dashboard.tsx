import { Target, BookOpen, Clock, TrendingUp, AlertTriangle, CheckCircle, Loader2, Sparkles, ArrowRight } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();

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

  const { data: errosPendentes } = useQuery({
    queryKey: ["caderno_erros_count", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("caderno_erros")
        .select("id")
        .eq("user_id", user!.id)
        .lte("proxima_revisao", new Date().toISOString());
      if (error) throw error;
      return data?.length ?? 0;
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
  const strongSubjects = materias.filter((m) => m.percent >= 80 && m.total >= 3);

  const isLoading = loadingStats || loadingSimulados;
  const displayName = profile?.display_name?.split(" ")[0] || user?.email?.split("@")[0] || "Concurseiro";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personalized Header */}
      <div>
        <h1 className="font-display text-2xl font-bold">
          Olá, {displayName}! 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {profile?.concurso_alvo
            ? `Focado em: ${profile.concurso_alvo}${profile.banca_preferida ? ` • Banca: ${profile.banca_preferida}` : ""}`
            : "Visão geral do seu progresso"}
        </p>
      </div>

      {/* Quick Actions for new users */}
      {totalQuestoes === 0 && (
        <div className="glass-card p-6 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-4">
            <Sparkles className="w-8 h-8 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="font-display font-semibold text-lg">Comece sua jornada!</h2>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {profile?.banca_preferida
                  ? `Faça seu primeiro simulado no estilo ${profile.banca_preferida} e desbloqueie recomendações personalizadas.`
                  : "Faça seu primeiro simulado e a IA vai personalizar tudo para você."}
              </p>
              <div className="flex gap-2 flex-wrap">
                <Link to="/simulado">
                  <Button size="sm" className="gradient-primary font-semibold">
                    Fazer Simulado <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/plano">
                  <Button size="sm" variant="outline">
                    Gerar Plano de Estudos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Taxa de Acerto" value={`${taxaAcerto}%`} subtitle={profile?.banca_preferida ? `Banca ${profile.banca_preferida}` : "Geral"} />
        <StatCard icon={BookOpen} label="Questões Resolvidas" value={totalQuestoes.toLocaleString("pt-BR")} subtitle="Total acumulado" />
        <StatCard icon={TrendingUp} label="Simulados Feitos" value={String(totalSimulados)} subtitle="Total" />
        <StatCard icon={Clock} label="Matérias Estudadas" value={String(materias.length)} subtitle="Com questões respondidas" />
      </div>

      {/* Pending reviews alert */}
      {(errosPendentes ?? 0) > 0 && (
        <Link to="/caderno" className="block">
          <div className="glass-card p-4 border-accent/30 bg-accent/5 hover:bg-accent/10 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📝</span>
                <div>
                  <p className="text-sm font-semibold text-accent">
                    {errosPendentes} questão(ões) para revisar hoje
                  </p>
                  <p className="text-xs text-muted-foreground">Revisão espaçada — não perca o timing!</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-accent" />
            </div>
          </div>
        </Link>
      )}

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
                    <span className="flex items-center gap-1.5">
                      {m.percent >= 80 ? "🟢" : m.percent >= 60 ? "🟡" : "🔴"} {m.name}
                    </span>
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

      {/* Personalized recommendations */}
      {(weakSubjects.length > 0 || strongSubjects.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weak subjects */}
          {weakSubjects.length > 0 && (
            <div className="glass-card p-5 border-destructive/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <h2 className="font-display font-semibold text-sm">Reforçar Estudos</h2>
              </div>
              <div className="space-y-2">
                {weakSubjects.map((m) => (
                  <div key={m.name} className="bg-muted/30 rounded-md p-3">
                    <p className="font-medium text-sm">{m.name}</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {m.percent}% de acerto em {m.total} questões
                    </p>
                  </div>
                ))}
              </div>
              <Link to="/simulado">
                <Button size="sm" variant="outline" className="w-full mt-3 text-destructive border-destructive/30 hover:bg-destructive/10">
                  Praticar pontos fracos
                </Button>
              </Link>
            </div>
          )}

          {/* Strong subjects */}
          {strongSubjects.length > 0 && (
            <div className="glass-card p-5 border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-primary" />
                <h2 className="font-display font-semibold text-sm">Seus Pontos Fortes</h2>
              </div>
              <div className="space-y-2">
                {strongSubjects.map((m) => (
                  <div key={m.name} className="bg-primary/5 rounded-md p-3">
                    <p className="font-medium text-sm">{m.name}</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {m.percent}% de acerto em {m.total} questões 🎯
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
