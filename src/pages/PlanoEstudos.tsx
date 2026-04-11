import { useState } from "react";
import { Calendar, CheckCircle, Circle, Clock, Loader2, Sparkles, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function PlanoEstudos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  // Fetch latest plan
  const { data: plano, isLoading: loadingPlano } = useQuery({
    queryKey: ["plano_estudos", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plano_estudos")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch tasks for the plan
  const { data: tarefas, isLoading: loadingTarefas } = useQuery({
    queryKey: ["plano_tarefas", plano?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plano_tarefas")
        .select("*")
        .eq("plano_id", plano!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!plano?.id,
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const { error } = await supabase.from("plano_tarefas").update({ done }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plano_tarefas"] }),
  });

  const generatePlan = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      // Gather user data
      const [profileRes, statsRes, errosRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("desempenho_stats").select("*").eq("user_id", user.id),
        supabase.from("caderno_erros").select("id").eq("user_id", user.id),
      ]);

      const profile = profileRes.data;
      const stats = statsRes.data ?? [];
      const errosPendentes = errosRes.data?.length ?? 0;

      const desempenho = stats.map((s) => ({
        materia: s.materia,
        acertos: s.acertos,
        erros: s.erros,
        taxa: s.acertos + s.erros > 0 ? Math.round((s.acertos / (s.acertos + s.erros)) * 100) : 0,
      }));

      const { data, error } = await supabase.functions.invoke("generate-plano", {
        body: {
          desempenho,
          errosPendentes,
          horasSemanais: profile?.horas_estudo_semanal || 20,
          dataProva: null, // Could come from profile
          concursoAlvo: profile?.concurso_alvo,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Get start of current week (Monday)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
      const semana = monday.toISOString().split("T")[0];

      // Create plan
      const { data: newPlano, error: planoError } = await supabase
        .from("plano_estudos")
        .insert({ user_id: user.id, semana, plano_data: data as any })
        .select()
        .single();
      if (planoError) throw planoError;

      // Create tasks
      const tarefasToInsert = (data.tarefas ?? []).map((t: any) => ({
        plano_id: newPlano.id,
        user_id: user.id,
        dia: t.dia,
        materia: t.materia,
        topico: t.topico,
        tempo_minutos: t.tempo_minutos || 60,
        done: false,
      }));

      if (tarefasToInsert.length > 0) {
        const { error: tarefasError } = await supabase.from("plano_tarefas").insert(tarefasToInsert);
        if (tarefasError) throw tarefasError;
      }

      queryClient.invalidateQueries({ queryKey: ["plano_estudos"] });
      queryClient.invalidateQueries({ queryKey: ["plano_tarefas"] });
      toast({ title: "Plano gerado com sucesso!" });
    } catch (err: any) {
      toast({ title: "Erro ao gerar plano", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  if (loadingPlano || loadingTarefas) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const planoData = plano?.plano_data as any;
  const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const tasksByDay = dias.map((dia) => ({
    dia,
    tasks: (tarefas ?? []).filter((t) => t.dia === dia),
  })).filter((d) => d.tasks.length > 0);

  const totalTasks = tarefas?.length ?? 0;
  const doneTasks = tarefas?.filter((t) => t.done).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Plano de Estudos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {plano ? `Semana de ${new Date(plano.semana).toLocaleDateString("pt-BR")}` : "Gere seu plano personalizado com IA"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generatePlan} disabled={generating} className="gradient-primary font-semibold">
            {generating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</>
            ) : plano ? (
              <><RotateCcw className="w-4 h-4 mr-2" /> Regenerar Plano</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Gerar Plano com IA</>
            )}
          </Button>
        </div>
      </div>

      {!plano ? (
        <div className="glass-card p-8 text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-3" />
          <h2 className="font-display text-lg font-semibold mb-2">Plano Personalizado com IA</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            A IA vai analisar seu desempenho, identificar pontos fracos e criar um plano de estudos
            otimizado para a sua rotina.
          </p>
          <Button onClick={generatePlan} disabled={generating} className="gradient-primary font-semibold">
            {generating ? "Gerando..." : "🧠 Gerar Meu Plano"}
          </Button>
        </div>
      ) : (
        <>
          {/* Progress */}
          {totalTasks > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso Semanal</span>
                <span className="text-sm text-primary font-semibold">{doneTasks}/{totalTasks} tarefas</span>
              </div>
              <Progress value={totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0} className="h-3" />
            </div>
          )}

          {/* Focus & Tips */}
          {planoData?.foco_semana && (
            <div className="glass-card p-4 bg-primary/5 border-primary/20">
              <p className="text-sm"><strong className="text-primary">🎯 Foco da semana:</strong> {planoData.foco_semana}</p>
            </div>
          )}

          {planoData?.dicas && planoData.dicas.length > 0 && (
            <div className="glass-card p-4">
              <p className="text-sm font-semibold mb-2">💡 Dicas da IA</p>
              <ul className="space-y-1">
                {planoData.dicas.map((d: string, i: number) => (
                  <li key={i} className="text-xs text-muted-foreground">• {d}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Schedule */}
          <div className="space-y-4">
            {tasksByDay.map(({ dia, tasks }) => (
              <div key={dia} className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-semibold">{dia}</h3>
                  <span className="text-xs text-muted-foreground">
                    {tasks.filter((t) => t.done).length}/{tasks.length} concluídas
                  </span>
                </div>
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        task.done ? "bg-primary/5" : "bg-muted/20"
                      }`}
                    >
                      <Checkbox
                        checked={task.done}
                        onCheckedChange={(checked) => toggleTask.mutate({ id: task.id, done: !!checked })}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${task.done ? "line-through text-muted-foreground" : ""}`}>
                          {task.topico}
                        </p>
                        <p className="text-xs text-muted-foreground">{task.materia}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Clock className="w-3 h-3" />
                        {task.tempo_minutos}min
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
