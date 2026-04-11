import { useState, useRef, useEffect } from "react";
import { Send, Brain, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Analise o padrão de gabarito da banca CESPE para Direito Constitucional",
  "Me dê estratégias de chute inteligente para provas do tipo CERTO/ERRADO",
  "Quais são as pegadinhas mais comuns em questões de Português?",
  "Monte um plano de estudos para concurso da Polícia Federal em 3 meses",
];

export default function IAChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou a **ConcursIA**, sua inteligência artificial especialista em concursos públicos. 🎯\n\nPosso ajudar com:\n- 📊 Análise de padrões de gabarito\n- 🧠 Estratégias de chute inteligente\n- ⚠️ Detecção de pegadinhas\n- 📚 Planejamento de estudos\n- 📝 Dicas específicas por banca\n\nComo posso ajudar na sua aprovação?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Simulated AI response (replace with real AI later)
    setTimeout(() => {
      const responses: Record<string, string> = {
        default:
          "Ótima pergunta! Para uma análise completa, preciso que você me informe:\n\n1. **Qual banca examinadora?** (CESPE, FCC, FGV, VUNESP, etc.)\n2. **Qual concurso/cargo?**\n3. **Quais matérias tem mais dificuldade?**\n\nCom essas informações, posso criar uma estratégia personalizada para maximizar suas chances de aprovação! 🎯",
      };

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: responses.default },
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          IA Concurseira
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Chat inteligente especializado em concursos públicos</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "glass-card"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-secondary-foreground" />
              </div>
            )}
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="glass-card px-4 py-3 rounded-xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" style={{ animationDelay: "0.3s" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" style={{ animationDelay: "0.6s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-4">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              className="text-left text-xs p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors text-muted-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Pergunte sobre concursos, estratégias, bancas..."
          className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <Button onClick={() => handleSend()} disabled={!input.trim() || loading} className="gradient-primary h-auto px-4 rounded-xl">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
