import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const bancas = [
  { id: "CESPE", nome: "CESPE/CEBRASPE", desc: "Certo/Errado • Pegadinhas sutis • Jurisprudência" },
  { id: "FCC", nome: "FCC", desc: "Letra de lei • Objetiva • Memorização" },
  { id: "FGV", nome: "FGV", desc: "Interpretativa • Doutrina • Alto nível" },
  { id: "VUNESP", nome: "VUNESP", desc: "Nível médio • Legislação SP • Equilibrada" },
  { id: "IBFC", nome: "IBFC", desc: "Direta • Objetiva • Legislação básica" },
];

const materias = [
  "Direito Constitucional", "Direito Administrativo", "Português",
  "Raciocínio Lógico", "Direito Penal", "Direito Civil",
  "Informática", "Legislação Específica", "Administração Pública",
];

const niveis = [
  { id: "facil", nome: "Fácil", desc: "Questões básicas para fixação" },
  { id: "medio", nome: "Médio", desc: "Nível padrão de concurso" },
  { id: "dificil", nome: "Difícil", desc: "Questões avançadas e pegadinhas" },
  { id: "misto", nome: "Misto", desc: "Distribuição realista da banca" },
];

interface Props {
  onStart: (config: { banca: string; materia: string; quantidade: number; nivel: string; modoProva?: boolean; adaptativo?: boolean }) => void;
  loading: boolean;
}

export default function BancaSelector({ onStart, loading }: Props) {
  const [banca, setBanca] = useState("");
  const [materia, setMateria] = useState("");
  const [quantidade, setQuantidade] = useState(5);
  const [nivel, setNivel] = useState("misto");
  const [modoProva, setModoProva] = useState(false);
  const [adaptativo, setAdaptativo] = useState(false);

  return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="glass-card p-8 max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-1">Simulado Inteligente</h1>
          <p className="text-sm text-muted-foreground">Gerado por IA baseado no estilo real da banca</p>
        </div>

        {/* Banca */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Banca Examinadora</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {bancas.map((b) => (
              <button
                key={b.id}
                onClick={() => setBanca(b.id)}
                className={`text-left p-3 rounded-lg border text-sm transition-all ${
                  banca === b.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                }`}
              >
                <p className="font-semibold font-display">{b.nome}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Matéria */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Matéria</label>
          <Select value={materia} onValueChange={setMateria}>
            <SelectTrigger><SelectValue placeholder="Selecione a matéria" /></SelectTrigger>
            <SelectContent>
              {materias.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Quantidade e Nível */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Questões</label>
            <Select value={String(quantidade)} onValueChange={(v) => setQuantidade(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[3, 5, 10, 15, 20].map((n) => <SelectItem key={n} value={String(n)}>{n} questões</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Dificuldade</label>
            <Select value={nivel} onValueChange={setNivel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {niveis.map((n) => <SelectItem key={n.id} value={n.id}>{n.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 bg-muted/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="modo-prova" className="text-sm font-medium">🕐 Modo Prova Real</Label>
              <p className="text-xs text-muted-foreground">Timer global de 3min/questão, sem voltar</p>
            </div>
            <Switch id="modo-prova" checked={modoProva} onCheckedChange={setModoProva} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="adaptativo" className="text-sm font-medium">🧠 Simulado Adaptativo</Label>
              <p className="text-xs text-muted-foreground">Foca nos seus pontos fracos automaticamente</p>
            </div>
            <Switch id="adaptativo" checked={adaptativo} onCheckedChange={setAdaptativo} />
          </div>
        </div>

        <Button
          onClick={() => onStart({ banca, materia, quantidade, nivel, modoProva, adaptativo })}
          disabled={!banca || !materia || loading}
          className="w-full gradient-primary font-semibold"
        >
          {loading ? "Gerando simulado com IA..." : adaptativo ? "🧠 Gerar Simulado Adaptativo" : "🎯 Gerar Simulado Inteligente"}
        </Button>
      </div>
    </motion.div>
  );
}
