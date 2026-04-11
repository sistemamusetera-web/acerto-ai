import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Target, Clock, Brain, Loader2 } from "lucide-react";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const COLORS = [
  "hsl(160, 84%, 39%)",
  "hsl(45, 93%, 58%)",
  "hsl(0, 72%, 51%)",
  "hsl(200, 70%, 50%)",
  "hsl(280, 60%, 55%)",
  "hsl(30, 80%, 55%)",
  "hsl(120, 60%, 45%)",
  "hsl(340, 70%, 55%)",
];

export default function Desempenho() {
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
    queryKey: ["simulado_history_desempenho", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("simulado_history")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const totalAcertos = stats?.reduce((s, r) => s + r.acertos, 0) ?? 0;
  const totalErros = stats?.reduce((s, r) => s + r.erros, 0) ?? 0;
  const totalQuestoes = totalAcertos + totalErros;
  const mediaGeral = totalQuestoes > 0 ? Math.round((totalAcertos / totalQuestoes) * 100) : 0;
  const totalSimulados = simulados?.length ?? 0;

  // Per-subject data for pie chart
  const materiaData = (stats ?? [])
    .map((s, i) => {
      const total = s.acertos + s.erros;
      return {
        name: s.materia,
        value: total > 0 ? Math.round((s.acertos / total) * 100) : 0,
        total,
        color: COLORS[i % COLORS.length],
      };
    })
    .sort((a, b) => b.total - a.total);

  // Simulado evolution data (last 10)
  const evolutionData = (simulados ?? []).slice(-10).map((s, i) => ({
    label: `#${i + 1}`,
    acertos: s.score,
    erros: s.total - s.score,
  }));

  // Average percentage across simulados
  const avgSimulado = totalSimulados > 0
    ? Math.round(simulados!.reduce((s, r) => s + Number(r.percentage), 0) / totalSimulados)
    : 0;

  if (loadingStats || loadingSimulados) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Desempenho</h1>
        <p className="text-sm text-muted-foreground mt-1">Análise detalhada do seu progresso</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Média Geral" value={`${mediaGeral}%`} subtitle={`${totalQuestoes} questões`} />
        <StatCard icon={TrendingUp} label="Simulados" value={String(totalSimulados)} subtitle={`Média: ${avgSimulado}%`} />
        <StatCard icon={Brain} label="Matérias" value={String(materiaData.length)} subtitle="Com dados registrados" />
        <StatCard icon={Clock} label="Total Acertos" value={totalAcertos.toLocaleString("pt-BR")} subtitle={`de ${totalQuestoes.toLocaleString("pt-BR")}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h2 className="font-display font-semibold mb-4">Evolução nos Simulados</h2>
          {evolutionData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Faça simulados para ver sua evolução aqui.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,25%,16%)" />
                <XAxis dataKey="label" tick={{ fill: "hsl(215,20%,55%)", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(215,20%,55%)", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "hsl(222,44%,9%)", border: "1px solid hsl(222,25%,16%)", borderRadius: 8 }} />
                <Bar dataKey="acertos" fill="hsl(160,84%,39%)" radius={[4, 4, 0, 0]} name="Acertos" />
                <Bar dataKey="erros" fill="hsl(0,72%,51%)" radius={[4, 4, 0, 0]} name="Erros" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-card p-5">
          <h2 className="font-display font-semibold mb-4">Desempenho por Matéria</h2>
          {materiaData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum dado de matéria ainda.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={materiaData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ value }) => `${value}%`}>
                    {materiaData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(222,44%,9%)", border: "1px solid hsl(222,25%,16%)", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {materiaData.map((m) => (
                  <div key={m.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                    <span className="text-muted-foreground">{m.name} ({m.total}q)</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detalhamento por matéria */}
      {materiaData.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="font-display font-semibold mb-4">📊 Detalhamento por Matéria</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {materiaData.map((m) => (
              <div key={m.name} className="bg-muted/30 rounded-lg p-4">
                <p className="font-medium text-sm">{m.name}</p>
                <p className="font-display text-2xl font-bold mt-1" style={{ color: m.color }}>{m.value}%</p>
                <p className="text-xs text-muted-foreground mt-1">{m.total} questões respondidas</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
