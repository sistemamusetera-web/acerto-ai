import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, TrendingUp, Target, AlertTriangle, BookOpen, Loader2, ArrowLeft, Sparkles } from "lucide-react";

const bancas = [
  { id: "CESPE", nome: "CESPE/CEBRASPE", desc: "Certo/Errado • Pegadinhas sutis • Jurisprudência", cor: "from-blue-500 to-blue-700" },
  { id: "FCC", nome: "FCC", desc: "Letra de lei • Objetiva • Memorização", cor: "from-emerald-500 to-emerald-700" },
  { id: "FGV", nome: "FGV", desc: "Interpretativa • Doutrina • Alto nível", cor: "from-purple-500 to-purple-700" },
  { id: "VUNESP", nome: "VUNESP", desc: "Nível médio • Legislação SP • Equilibrada", cor: "from-amber-500 to-amber-700" },
  { id: "IBFC", nome: "IBFC", desc: "Direta • Objetiva • Legislação básica", cor: "from-rose-500 to-rose-700" },
  { id: "IDECAN", nome: "IDECAN", desc: "Objetiva • Nível médio/superior • Variada", cor: "from-cyan-500 to-cyan-700" },
  { id: "QUADRIX", nome: "QUADRIX", desc: "Conselhos • Legislação • Nível médio", cor: "from-orange-500 to-orange-700" },
  { id: "CONSULPLAN", nome: "CONSULPLAN", desc: "Legislação • Tribunais • Objetiva", cor: "from-teal-500 to-teal-700" },
];

type Analise = {
  banca: string;
  resumo: string;
  topicos_frequentes: { materia: string; topico: string; frequencia: string; observacao: string }[];
  tendencias_recentes: { tendencia: string; detalhes: string; impacto: string }[];
  estrategias: { titulo: string; descricao: string; prioridade: string }[];
  pontos_criticos: { ponto: string; motivo: string; como_evitar: string }[];
  metodo_estudo: {
    fases: { fase: string; duracao: string; atividades: string[]; foco: string }[];
    cronograma_semanal: { dia: string; atividades: string[] }[];
    dicas_extras: string[];
  };
};

const freqColor = (f: string) => f === "Alta" ? "bg-red-500/20 text-red-400" : f === "Média" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400";
const impColor = (i: string) => i === "Alto" ? "bg-red-500/20 text-red-400" : i === "Médio" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400";
const prioColor = (p: string) => p === "Essencial" ? "bg-red-500/20 text-red-400" : p === "Importante" ? "bg-yellow-500/20 text-yellow-400" : "bg-blue-500/20 text-blue-400";

export default function AnaliseEdital() {
  const [loading, setLoading] = useState(false);
  const [analise, setAnalise] = useState<Analise | null>(null);
  const [bancaSelecionada, setBancaSelecionada] = useState("");
  const { toast } = useToast();

  const handleAnalise = async (bancaId: string) => {
    setBancaSelecionada(bancaId);
    setLoading(true);
    setAnalise(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-edital", {
        body: { banca: bancaId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAnalise(data);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Falha ao gerar análise", variant: "destructive" });
      setBancaSelecionada("");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-lg font-medium">Analisando a banca {bancaSelecionada}...</p>
        <p className="text-sm text-muted-foreground">A IA está processando editais e padrões históricos</p>
      </div>
    );
  }

  if (!analise) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">📋 Análise de Edital</h1>
          <p className="text-muted-foreground text-sm mt-1">Selecione uma banca para análise inteligente de padrões e estratégias</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bancas.map((b) => (
            <button
              key={b.id}
              onClick={() => handleAnalise(b.id)}
              className="glass-card p-5 text-left hover:scale-[1.02] transition-all group"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${b.cor} flex items-center justify-center mb-3`}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <p className="font-display font-bold text-lg">{b.nome}</p>
              <p className="text-xs text-muted-foreground mt-1">{b.desc}</p>
              <p className="text-xs text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity">Clique para analisar →</p>
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => { setAnalise(null); setBancaSelecionada(""); }}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Análise: {analise.banca}</h1>
          <p className="text-sm text-muted-foreground">{analise.resumo}</p>
        </div>
      </div>

      <Tabs defaultValue="topicos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
          <TabsTrigger value="topicos" className="gap-1.5 text-xs"><Search className="w-3.5 h-3.5" />Tópicos</TabsTrigger>
          <TabsTrigger value="tendencias" className="gap-1.5 text-xs"><TrendingUp className="w-3.5 h-3.5" />Tendências</TabsTrigger>
          <TabsTrigger value="estrategias" className="gap-1.5 text-xs"><Target className="w-3.5 h-3.5" />Estratégias</TabsTrigger>
          <TabsTrigger value="criticos" className="gap-1.5 text-xs"><AlertTriangle className="w-3.5 h-3.5" />Pontos Críticos</TabsTrigger>
          <TabsTrigger value="metodo" className="gap-1.5 text-xs"><BookOpen className="w-3.5 h-3.5" />Método</TabsTrigger>
        </TabsList>

        {/* Tópicos Frequentes */}
        <TabsContent value="topicos">
          <div className="grid gap-3">
            {analise.topicos_frequentes.map((t, i) => (
              <Card key={i} className="p-4 bg-card/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{t.topico}</span>
                      <Badge variant="outline" className="text-xs">{t.materia}</Badge>
                      <Badge className={`text-xs ${freqColor(t.frequencia)}`}>{t.frequencia}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{t.observacao}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tendências */}
        <TabsContent value="tendencias">
          <div className="grid gap-3">
            {analise.tendencias_recentes.map((t, i) => (
              <Card key={i} className="p-4 bg-card/50">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{t.tendencia}</span>
                  <Badge className={`text-xs ${impColor(t.impacto)}`}>Impacto {t.impacto}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{t.detalhes}</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Estratégias */}
        <TabsContent value="estrategias">
          <div className="grid gap-3">
            {analise.estrategias.map((e, i) => (
              <Card key={i} className="p-4 bg-card/50">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{e.titulo}</span>
                  <Badge className={`text-xs ${prioColor(e.prioridade)}`}>{e.prioridade}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{e.descricao}</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Pontos Críticos */}
        <TabsContent value="criticos">
          <div className="grid gap-3">
            {analise.pontos_criticos.map((p, i) => (
              <Card key={i} className="p-4 bg-card/50 border-destructive/20">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="font-semibold">{p.ponto}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2"><strong>Por quê:</strong> {p.motivo}</p>
                <p className="text-sm text-primary"><strong>Como evitar:</strong> {p.como_evitar}</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Método de Estudo */}
        <TabsContent value="metodo" className="space-y-6">
          <div>
            <h3 className="font-display font-bold text-lg mb-3">📚 Fases do Estudo</h3>
            <div className="grid gap-3">
              {analise.metodo_estudo.fases.map((f, i) => (
                <Card key={i} className="p-4 bg-card/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">{i + 1}</div>
                    <span className="font-semibold">{f.fase}</span>
                    <Badge variant="outline" className="text-xs">{f.duracao}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2"><strong>Foco:</strong> {f.foco}</p>
                  <ul className="text-sm space-y-1">
                    {f.atividades.map((a, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg mb-3">📅 Cronograma Semanal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {analise.metodo_estudo.cronograma_semanal.map((d, i) => (
                <Card key={i} className="p-4 bg-card/50">
                  <p className="font-semibold mb-2">{d.dia}</p>
                  <ul className="text-sm space-y-1">
                    {d.atividades.map((a, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>

          {analise.metodo_estudo.dicas_extras?.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-lg mb-3">💡 Dicas Extras</h3>
              <Card className="p-4 bg-card/50">
                <ul className="space-y-2">
                  {analise.metodo_estudo.dicas_extras.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5">✦</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
