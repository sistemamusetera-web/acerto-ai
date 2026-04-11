import { Target, Zap, AlertTriangle, BarChart3, Lightbulb } from "lucide-react";

const strategies = [
  {
    icon: Target,
    title: "Chute Inteligente",
    description: "Quando não souber a resposta, elimine alternativas absurdas e use a estatística a seu favor.",
    tips: [
      "Alternativa 'C' é historicamente a mais frequente em bancas como CESPE (≈22%)",
      "Evite alternativas com palavras absolutas: 'sempre', 'nunca', 'todos'",
      "Se duas alternativas são muito parecidas, uma delas tende a ser a correta",
      "Alternativas com mais detalhes tendem a ser corretas",
    ],
  },
  {
    icon: Zap,
    title: "Eliminação de Alternativas",
    description: "Reduza de 5 para 2-3 opções usando técnicas de eliminação.",
    tips: [
      "Descarte alternativas com informações inventadas ou exageradas",
      "Palavras como 'exclusivamente' e 'somente' geralmente indicam alternativa errada",
      "Se a alternativa contradiz o enunciado, elimine imediatamente",
      "Respostas muito genéricas costumam ser armadilhas",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Detector de Pegadinhas",
    description: "Fique atento a padrões que indicam pegadinhas nas questões.",
    tips: [
      "EXCETO, INCORRETO, NÃO — leia 2x quando encontrar essas palavras",
      "Questões com dupla negação são armadilhas frequentes",
      "Enunciados longos demais tentam confundir — busque a pergunta real",
      "Dados numéricos em excesso podem ser distração",
    ],
  },
  {
    icon: BarChart3,
    title: "Gestão do Tempo",
    description: "Distribua seu tempo de forma inteligente durante a prova.",
    tips: [
      "Reserve 2-3 minutos por questão e marque as difíceis para voltar",
      "Comece pelas matérias que domina para garantir pontos",
      "Últimos 15 minutos: responda tudo que ficou em branco",
      "Não gaste mais de 4 minutos em uma única questão",
    ],
  },
];

export default function Estrategias() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Estratégias de Prova</h1>
        <p className="text-sm text-muted-foreground mt-1">Técnicas baseadas em dados para maximizar sua aprovação</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {strategies.map((s) => (
          <div key={s.title} className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{s.title}</h3>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              {s.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Lightbulb className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                  <span className="text-foreground/80">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick stat */}
      <div className="glass-card p-5 border-primary/20">
        <h3 className="font-display font-semibold mb-3">📊 Distribuição Histórica de Gabaritos (CESPE/Cebraspe)</h3>
        <div className="flex gap-4 items-end">
          {[
            { letra: "A", pct: 19.2 },
            { letra: "B", pct: 20.8 },
            { letra: "C", pct: 21.5 },
            { letra: "D", pct: 20.1 },
            { letra: "E", pct: 18.4 },
          ].map((item) => (
            <div key={item.letra} className="flex-1 text-center">
              <div className="gradient-primary rounded-t-md mx-auto w-full" style={{ height: `${item.pct * 5}px` }} />
              <p className="font-display font-bold text-sm mt-2">{item.letra}</p>
              <p className="text-xs text-muted-foreground">{item.pct}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
