import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Target, Clock, ChevronRight, Sparkles } from "lucide-react";

const bancas = [
  { id: "CESPE", nome: "CESPE/CEBRASPE" },
  { id: "FCC", nome: "FCC" },
  { id: "FGV", nome: "FGV" },
  { id: "VUNESP", nome: "VUNESP" },
  { id: "IBFC", nome: "IBFC" },
];

const concursos = [
  "Polícia Federal", "Polícia Rodoviária Federal", "Receita Federal",
  "Tribunais (TJ/TRT/TRF)", "INSS", "Banco do Brasil",
  "Caixa Econômica", "Correios", "Câmara dos Deputados",
  "Senado Federal", "Ministério Público", "Defensoria Pública",
  "Outro",
];

export default function ProfileSetupModal() {
  const { profile, updateProfile, needsSetup } = useProfile();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [banca, setBanca] = useState(profile?.banca_preferida || "");
  const [concurso, setConcurso] = useState(profile?.concurso_alvo || "");
  const [concursoCustom, setConcursoCustom] = useState("");
  const [horas, setHoras] = useState(profile?.horas_estudo_semanal || 20);
  const [dismissed, setDismissed] = useState(false);

  if (!needsSetup || dismissed) return null;

  const steps = [
    {
      icon: GraduationCap,
      title: "Qual banca você vai enfrentar?",
      subtitle: "Personalizamos tudo com base no estilo da banca",
    },
    {
      icon: Target,
      title: "Qual concurso é o seu alvo?",
      subtitle: "Direcionamos o conteúdo para o seu objetivo",
    },
    {
      icon: Clock,
      title: "Quantas horas por semana?",
      subtitle: "Criamos um plano que cabe na sua rotina",
    },
  ];

  const handleSave = async () => {
    const finalConcurso = concurso === "Outro" ? concursoCustom : concurso;
    try {
      await updateProfile.mutateAsync({
        banca_preferida: banca || null,
        concurso_alvo: finalConcurso || null,
        horas_estudo_semanal: horas,
      });
      toast({ title: "Perfil configurado! 🎯", description: "Seu sistema agora é personalizado para você." });
      setDismissed(true);
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const canAdvance = step === 0 ? !!banca : step === 1 ? (concurso === "Outro" ? !!concursoCustom : !!concurso) : true;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-8 max-w-md w-full space-y-6 border border-primary/20"
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? "bg-primary" : i < step ? "bg-primary/50" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="space-y-5"
          >
            <div className="text-center">
              {(() => {
                const Icon = steps[step].icon;
                return <Icon className="w-10 h-10 text-primary mx-auto mb-2" />;
              })()}
              <h2 className="font-display text-xl font-bold">{steps[step].title}</h2>
              <p className="text-sm text-muted-foreground">{steps[step].subtitle}</p>
            </div>

            {step === 0 && (
              <div className="grid grid-cols-2 gap-2">
                {bancas.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBanca(b.id)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      banca === b.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {b.nome}
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <Select value={concurso} onValueChange={setConcurso}>
                  <SelectTrigger><SelectValue placeholder="Selecione o concurso" /></SelectTrigger>
                  <SelectContent>
                    {concursos.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {concurso === "Outro" && (
                  <Input
                    placeholder="Digite o nome do concurso"
                    value={concursoCustom}
                    onChange={(e) => setConcursoCustom(e.target.value)}
                  />
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" size="sm" onClick={() => setHoras(Math.max(5, horas - 5))}>-5h</Button>
                  <div className="text-center">
                    <span className="text-4xl font-display font-bold text-primary">{horas}</span>
                    <p className="text-xs text-muted-foreground">horas/semana</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setHoras(Math.min(60, horas + 5))}>+5h</Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {horas <= 10 ? "Estudo focado e eficiente" : horas <= 25 ? "Ritmo ideal para aprovação" : "Dedicação intensa — rumo ao topo!"}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)} className="flex-1">
              Voltar
            </Button>
          )}
          {step === 0 && (
            <Button variant="ghost" onClick={() => setDismissed(true)} className="flex-1 text-muted-foreground">
              Pular
            </Button>
          )}
          {step < 2 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canAdvance} className="flex-1 gradient-primary font-semibold">
              Próximo <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={updateProfile.isPending} className="flex-1 gradient-primary font-semibold">
              <Sparkles className="w-4 h-4 mr-1" /> Personalizar Meu Sistema
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
