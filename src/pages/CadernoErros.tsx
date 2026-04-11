import { useState } from "react";
import { BookX, RotateCcw, Filter, CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const INTERVALS = [1, 3, 7, 15, 30]; // days for spaced repetition

export default function CadernoErros() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterMateria, setFilterMateria] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewAnswer, setReviewAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const { data: erros, isLoading } = useQuery({
    queryKey: ["caderno_erros", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("caderno_erros")
        .select("*")
        .eq("user_id", user!.id)
        .order("proxima_revisao", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, acertou, vezes }: { id: string; acertou: boolean; vezes: number }) => {
      const nextInterval = acertou ? INTERVALS[Math.min(vezes, INTERVALS.length - 1)] : 1;
      const proxima = new Date();
      proxima.setDate(proxima.getDate() + nextInterval);

      const { error } = await supabase
        .from("caderno_erros")
        .update({
          vezes_revisada: vezes + 1,
          acertou_revisao: acertou,
          proxima_revisao: proxima.toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caderno_erros"] });
      toast({ title: showExplanation && reviewAnswer ? "Revisão registrada!" : "Atualizado" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("caderno_erros").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["caderno_erros"] }),
  });

  const materias = [...new Set((erros ?? []).map((e) => e.materia))];
  const now = new Date();

  const filtered = (erros ?? []).filter((e) => {
    if (filterMateria !== "all" && e.materia !== filterMateria) return false;
    if (filterStatus === "pendente" && new Date(e.proxima_revisao) > now) return false;
    if (filterStatus === "revisado" && new Date(e.proxima_revisao) <= now) return false;
    return true;
  });

  const pendentes = (erros ?? []).filter((e) => new Date(e.proxima_revisao) <= now).length;

  const handleReview = (id: string) => {
    setReviewingId(id);
    setReviewAnswer(null);
    setShowExplanation(false);
  };

  const handleReviewAnswer = (id: string, letra: string, correta: string, vezes: number) => {
    setReviewAnswer(letra);
    setShowExplanation(true);
    const acertou = letra === correta;
    updateMutation.mutate({ id, acertou, vezes });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <BookX className="w-6 h-6 text-destructive" /> Caderno de Erros
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {erros?.length ?? 0} questões • {pendentes} para revisar agora
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterMateria} onValueChange={setFilterMateria}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Matéria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as matérias</SelectItem>
            {materias.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Para revisar</SelectItem>
            <SelectItem value="revisado">Agendados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <BookX className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma questão encontrada.</p>
          <p className="text-xs text-muted-foreground mt-1">Faça simulados e as questões erradas aparecerão aqui automaticamente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((erro) => {
              const isPendente = new Date(erro.proxima_revisao) <= now;
              const isReviewing = reviewingId === erro.id;
              const questao = erro.questao_data as any;

              return (
                <motion.div
                  key={erro.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{erro.materia}</span>
                      <span>•</span>
                      <span>{erro.assunto}</span>
                      <span>•</span>
                      <span>Revisado {erro.vezes_revisada}x</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isPendente ? (
                        <span className="flex items-center gap-1 text-xs text-accent font-medium">
                          <AlertCircle className="w-3.5 h-3.5" /> Revisar agora
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(erro.proxima_revisao).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>

                  {!isReviewing ? (
                    <>
                      <p className="text-sm leading-relaxed line-clamp-3">{questao?.enunciado}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs text-muted-foreground">
                          Sua resposta: <span className="text-destructive font-semibold">{erro.resposta_usuario}</span>
                          {" | "}Correta: <span className="text-primary font-semibold">{erro.resposta_correta}</span>
                        </span>
                        <div className="flex-1" />
                        <Button variant="outline" size="sm" onClick={() => handleReview(erro.id)}>
                          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Refazer
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(erro.id)}>
                          Remover
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm leading-relaxed">{questao?.enunciado}</p>
                      <div className="space-y-2">
                        {(questao?.alternativas ?? []).map((a: any) => {
                          const isSelected = reviewAnswer === a.letra;
                          const isCorrect = a.letra === erro.resposta_correta;
                          const showColors = showExplanation;

                          return (
                            <button
                              key={a.letra}
                              disabled={showExplanation}
                              onClick={() => handleReviewAnswer(erro.id, a.letra, erro.resposta_correta, erro.vezes_revisada)}
                              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                                showColors && isCorrect
                                  ? "border-primary bg-primary/10 text-foreground"
                                  : showColors && isSelected && !isCorrect
                                  ? "border-destructive bg-destructive/10 text-foreground"
                                  : isSelected
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <span className="font-display font-semibold mr-3 text-primary">{a.letra})</span>
                              {a.texto}
                              {showColors && isCorrect && <CheckCircle className="inline w-4 h-4 text-primary ml-2" />}
                            </button>
                          );
                        })}
                      </div>
                      {showExplanation && questao?.explicacao && (
                        <div className="bg-muted/30 rounded-lg p-4 text-sm">
                          <p className="font-semibold mb-1">Explicação:</p>
                          <p className="text-muted-foreground">{questao.explicacao}</p>
                        </div>
                      )}
                      {showExplanation && (
                        <Button variant="outline" size="sm" onClick={() => setReviewingId(null)}>
                          Fechar revisão
                        </Button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
