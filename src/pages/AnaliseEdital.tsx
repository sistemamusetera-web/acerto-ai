import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Search, TrendingUp, Target, AlertTriangle, BookOpen, Loader2, ArrowLeft, Sparkles, Upload, FileText, Play, Zap, Brain, BookCheck, RotateCcw, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const bancas = [
  { id: "CESPE", nome: "CESPE/CEBRASPE", desc: "Certo/Errado • Pegadinhas sutis", cor: "from-blue-500 to-blue-700" },
  { id: "FCC", nome: "FCC", desc: "Letra de lei • Objetiva", cor: "from-emerald-500 to-emerald-700" },
  { id: "FGV", nome: "FGV", desc: "Interpretativa • Alto nível", cor: "from-purple-500 to-purple-700" },
  { id: "VUNESP", nome: "VUNESP", desc: "Nível médio • Equilibrada", cor: "from-amber-500 to-amber-700" },
  { id: "IBFC", nome: "IBFC", desc: "Direta • Objetiva", cor: "from-rose-500 to-rose-700" },
  { id: "IDECAN", nome: "IDECAN", desc: "Objetiva • Variada", cor: "from-cyan-500 to-cyan-700" },
  { id: "QUADRIX", nome: "QUADRIX", desc: "Conselhos • Nível médio", cor: "from-orange-500 to-orange-700" },
  { id: "CONSULPLAN", nome: "CONSULPLAN", desc: "Tribunais • Objetiva", cor: "from-teal-500 to-teal-700" },
];

type Analise = {
  banca: string;
  resumo: string;
  disciplinas_edital?: { disciplina: string; topicos: string[]; peso_estimado: string; dificuldade: string; questoes_estimadas: number }[];
  topicos_frequentes: { materia: string; topico: string; frequencia: string; observacao: string }[];
  tendencias_recentes: { tendencia: string; detalhes: string; impacto: string }[];
  estrategias: { titulo: string; descricao: string; prioridade: string }[];
  pontos_criticos: { ponto: string; motivo: string; como_evitar: string }[];
  metodo_estudo: {
    fases: { fase: string; duracao: string; atividades: string[]; foco: string }[];
    cronograma_semanal: { dia: string; atividades: string[] }[];
    dicas_extras: string[];
  };
  simulado_config?: {
    disciplinas_disponiveis: string[];
    topicos_por_disciplina: Record<string, string[]>;
    total_questoes_sugerido: number;
  };
};

const freqColor = (f: string) => f === "Alta" ? "bg-red-500/20 text-red-400" : f === "Média" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400";
const impColor = (i: string) => i === "Alto" ? "bg-red-500/20 text-red-400" : i === "Médio" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400";
const prioColor = (p: string) => p === "Essencial" ? "bg-red-500/20 text-red-400" : p === "Importante" ? "bg-yellow-500/20 text-yellow-400" : "bg-blue-500/20 text-blue-400";
const difColor = (d: string) => d === "Alta" ? "bg-red-500/20 text-red-400" : d === "Média" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400";

export default function AnaliseEdital() {
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [analise, setAnalise] = useState<Analise | null>(null);
  const [bancaSelecionada, setBancaSelecionada] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text || "");
      };
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"));

      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        reader.readAsText(file);
      } else if (file.type === "application/pdf") {
        // For PDFs, upload to storage and use text extraction on backend
        reader.readAsText(file); // Fallback: read as text (works for text-based PDFs)
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({ title: "Arquivo muito grande", description: "O tamanho máximo é 10MB.", variant: "destructive" });
      return;
    }

    setUploadedFile(file);

    try {
      const text = await extractTextFromFile(file);
      setExtractedText(text);
      toast({ title: "Arquivo carregado!", description: `"${file.name}" pronto para análise.` });
    } catch {
      toast({ title: "Erro ao ler arquivo", description: "Tente outro formato.", variant: "destructive" });
    }
  };

  const handleAnalise = async (bancaId: string) => {
    setBancaSelecionada(bancaId);
    setLoading(true);
    setLoadingMsg(extractedText ? "Analisando o edital enviado com IA especialista..." : `Analisando padrões da banca ${bancaId}...`);
    setAnalise(null);

    try {
      const body: any = { banca: bancaId };
      if (extractedText && extractedText.length > 50) {
        body.editalText = extractedText;
      }

      const { data, error } = await supabase.functions.invoke("analyze-edital", { body });
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

  const handleGenerateSimulado = (tipo: string, disciplina?: string, topico?: string) => {
    if (!analise) return;
    const params = new URLSearchParams({
      banca: bancaSelecionada,
      materia: disciplina || (analise.simulado_config?.disciplinas_disponiveis?.[0] || "Conhecimentos Gerais"),
      tipo,
    });
    if (topico) params.set("topico", topico);
    navigate(`/simulado?${params.toString()}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-lg font-medium">{loadingMsg}</p>
        <p className="text-sm text-muted-foreground">Isso pode levar até 30 segundos...</p>
      </div>
    );
  }

  // Step 1: Upload + select banca
  if (!analise) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">📋 Análise de Edital</h1>
          <p className="text-muted-foreground text-sm mt-1">Faça upload do edital ou selecione uma banca para análise inteligente</p>
        </div>

        {/* Upload Section */}
        <Card className="p-6 bg-card/50 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg">Upload do Edital</h2>
              <p className="text-xs text-muted-foreground">PDF ou documento de texto (opcional, mas recomendado)</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />

          {!uploadedFile ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors group"
            >
              <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="font-medium">Clique para selecionar o edital</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, TXT, DOC • Máx. 10MB</p>
            </button>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
              <FileText className="w-8 h-8 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-sm">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(0)} KB • {extractedText.length > 50 ? "Conteúdo extraído ✓" : "Aguardando análise"}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setUploadedFile(null); setExtractedText(""); }}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          )}
        </Card>

        {/* Banca Selection */}
        <div>
          <h2 className="font-display font-bold text-lg mb-3">
            {uploadedFile ? "Selecione a banca do edital:" : "Ou selecione uma banca para análise geral:"}
          </h2>
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
        </div>
      </motion.div>
    );
  }

  // Step 2: Analysis result + simulado options
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

      <Tabs defaultValue={analise.disciplinas_edital ? "edital" : "topicos"} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 h-auto">
          {analise.disciplinas_edital && (
            <TabsTrigger value="edital" className="gap-1.5 text-xs"><GraduationCap className="w-3.5 h-3.5" />Edital</TabsTrigger>
          )}
          <TabsTrigger value="topicos" className="gap-1.5 text-xs"><Search className="w-3.5 h-3.5" />Tópicos</TabsTrigger>
          <TabsTrigger value="tendencias" className="gap-1.5 text-xs"><TrendingUp className="w-3.5 h-3.5" />Tendências</TabsTrigger>
          <TabsTrigger value="estrategias" className="gap-1.5 text-xs"><Target className="w-3.5 h-3.5" />Estratégias</TabsTrigger>
          <TabsTrigger value="criticos" className="gap-1.5 text-xs"><AlertTriangle className="w-3.5 h-3.5" />Críticos</TabsTrigger>
          <TabsTrigger value="metodo" className="gap-1.5 text-xs"><BookOpen className="w-3.5 h-3.5" />Método</TabsTrigger>
          <TabsTrigger value="simulados" className="gap-1.5 text-xs"><Play className="w-3.5 h-3.5" />Simulados</TabsTrigger>
        </TabsList>

        {/* Disciplinas do Edital */}
        {analise.disciplinas_edital && (
          <TabsContent value="edital">
            <div className="grid gap-3">
              {analise.disciplinas_edital.map((d, i) => (
                <Card key={i} className="p-4 bg-card/50">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="font-semibold text-lg">{d.disciplina}</span>
                        <Badge className={`text-xs ${difColor(d.dificuldade)}`}>Dif: {d.dificuldade}</Badge>
                        <Badge className={`text-xs ${freqColor(d.peso_estimado)}`}>Peso: {d.peso_estimado}</Badge>
                        <Badge variant="outline" className="text-xs">~{d.questoes_estimadas} questões</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {d.topicos.map((t, j) => (
                          <Badge key={j} variant="secondary" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleGenerateSimulado("disciplina", d.disciplina)}>
                      <Play className="w-3 h-3 mr-1" /> Simulado
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}

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

        {/* Simulados Premium */}
        <TabsContent value="simulados" className="space-y-6">
          <div>
            <h3 className="font-display font-bold text-lg mb-1">🎯 Simulados Premium</h3>
            <p className="text-sm text-muted-foreground mb-4">Questões alinhadas ao perfil da banca {analise.banca} e ao edital analisado</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Simulado Completo */}
            <Card className="p-5 bg-card/50 border-primary/30 hover:border-primary/60 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-display font-bold">Simulado Completo</p>
                  <p className="text-xs text-muted-foreground">Modelo prova real • {analise.simulado_config?.total_questoes_sugerido || 60} questões</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Simula a prova real com todas as disciplinas, tempo limitado e dificuldade fiel à banca.</p>
              <Button className="w-full" onClick={() => handleGenerateSimulado("completo")}>
                <Play className="w-4 h-4 mr-2" /> Iniciar Simulado Completo
              </Button>
            </Card>

            {/* Simulado Adaptativo */}
            <Card className="p-5 bg-card/50 border-purple-500/30 hover:border-purple-500/60 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-display font-bold">Simulado Adaptativo</p>
                  <p className="text-xs text-muted-foreground">IA ajusta ao seu nível</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Foca nos seus pontos fracos com dificuldade progressiva baseada no seu desempenho.</p>
              <Button variant="outline" className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10" onClick={() => handleGenerateSimulado("adaptativo")}>
                <Brain className="w-4 h-4 mr-2" /> Iniciar Adaptativo
              </Button>
            </Card>

            {/* Revisão Rápida */}
            <Card className="p-5 bg-card/50 border-amber-500/30 hover:border-amber-500/60 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-display font-bold">Revisão Rápida</p>
                  <p className="text-xs text-muted-foreground">10 questões • Foco nos pontos-chave</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Simulado curto focando nos tópicos mais cobrados pela banca.</p>
              <Button variant="outline" className="w-full border-amber-500/50 text-amber-400 hover:bg-amber-500/10" onClick={() => handleGenerateSimulado("revisao")}>
                <Zap className="w-4 h-4 mr-2" /> Revisão Rápida
              </Button>
            </Card>

            {/* Por Disciplina */}
            <Card className="p-5 bg-card/50 border-emerald-500/30 hover:border-emerald-500/60 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                  <BookCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-display font-bold">Por Disciplina</p>
                  <p className="text-xs text-muted-foreground">Escolha a matéria</p>
                </div>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {(analise.simulado_config?.disciplinas_disponiveis || analise.topicos_frequentes.map(t => t.materia).filter((v, i, a) => a.indexOf(v) === i)).slice(0, 8).map((disc, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-8"
                    onClick={() => handleGenerateSimulado("disciplina", disc)}
                  >
                    <Play className="w-3 h-3 mr-2" /> {disc}
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Por Tópico (if edital was uploaded) */}
          {analise.disciplinas_edital && analise.simulado_config?.topicos_por_disciplina && (
            <div>
              <h3 className="font-display font-bold text-lg mb-3">📌 Simulado por Tópico Específico</h3>
              <div className="grid gap-3">
                {Object.entries(analise.simulado_config.topicos_por_disciplina).slice(0, 5).map(([disc, topicos]) => (
                  <Card key={disc} className="p-4 bg-card/50">
                    <p className="font-semibold mb-2">{disc}</p>
                    <div className="flex flex-wrap gap-2">
                      {topicos.slice(0, 6).map((top, j) => (
                        <Button
                          key={j}
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => handleGenerateSimulado("topico", disc, top)}
                        >
                          {top}
                        </Button>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
