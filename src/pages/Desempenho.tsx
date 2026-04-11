import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Target, Clock, Brain } from "lucide-react";
import StatCard from "@/components/StatCard";

const weeklyData = [
  { dia: "Seg", acertos: 18, erros: 7 },
  { dia: "Ter", acertos: 22, erros: 5 },
  { dia: "Qua", acertos: 15, erros: 10 },
  { dia: "Qui", acertos: 25, erros: 3 },
  { dia: "Sex", acertos: 20, erros: 8 },
  { dia: "Sáb", acertos: 30, erros: 5 },
  { dia: "Dom", acertos: 12, erros: 4 },
];

const materiaData = [
  { name: "Dir. Constitucional", value: 78, color: "hsl(160, 84%, 39%)" },
  { name: "Português", value: 65, color: "hsl(45, 93%, 58%)" },
  { name: "Rac. Lógico", value: 52, color: "hsl(0, 72%, 51%)" },
  { name: "Dir. Administrativo", value: 71, color: "hsl(200, 70%, 50%)" },
  { name: "Informática", value: 88, color: "hsl(280, 60%, 55%)" },
];

export default function Desempenho() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Desempenho</h1>
        <p className="text-sm text-muted-foreground mt-1">Análise detalhada do seu progresso</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Média Geral" value="72%" trend="↑ 3% esta semana" />
        <StatCard icon={TrendingUp} label="Questões/Dia" value="28" subtitle="Média semanal" />
        <StatCard icon={Clock} label="Tempo/Questão" value="1:42" subtitle="Média" trend="↓ 8s vs semana anterior" />
        <StatCard icon={Brain} label="Pegadinhas Evitadas" value="84%" subtitle="Últimos simulados" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h2 className="font-display font-semibold mb-4">Evolução Semanal</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,25%,16%)" />
              <XAxis dataKey="dia" tick={{ fill: "hsl(215,20%,55%)", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(215,20%,55%)", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "hsl(222,44%,9%)", border: "1px solid hsl(222,25%,16%)", borderRadius: 8 }} />
              <Bar dataKey="acertos" fill="hsl(160,84%,39%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="erros" fill="hsl(0,72%,51%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h2 className="font-display font-semibold mb-4">Desempenho por Matéria</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={materiaData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${value}%`}>
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
                <span className="text-muted-foreground">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pattern analysis */}
      <div className="glass-card p-5">
        <h2 className="font-display font-semibold mb-4">📊 Análise de Padrão de Gabarito</h2>
        <div className="grid grid-cols-5 gap-3">
          {[
            { letra: "A", pct: 18, freq: "Baixa" },
            { letra: "B", pct: 22, freq: "Média" },
            { letra: "C", pct: 24, freq: "Alta" },
            { letra: "D", pct: 20, freq: "Média" },
            { letra: "E", pct: 16, freq: "Baixa" },
          ].map((item) => (
            <div key={item.letra} className="text-center bg-muted/30 rounded-lg p-4">
              <p className="font-display text-2xl font-bold text-primary">{item.letra}</p>
              <p className="text-lg font-semibold mt-1">{item.pct}%</p>
              <p className="text-xs text-muted-foreground">{item.freq}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">* Baseado na análise de 500+ questões anteriores da banca selecionada.</p>
      </div>
    </div>
  );
}
