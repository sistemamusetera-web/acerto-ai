import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppSidebar from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Simulado from "./pages/Simulado";
import Desempenho from "./pages/Desempenho";
import PlanoEstudos from "./pages/PlanoEstudos";
import Estrategias from "./pages/Estrategias";
import IAChat from "./pages/IAChat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex min-h-screen">
          <AppSidebar />
          <main className="flex-1 ml-64 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/simulado" element={<Simulado />} />
              <Route path="/desempenho" element={<Desempenho />} />
              <Route path="/plano" element={<PlanoEstudos />} />
              <Route path="/estrategia" element={<Estrategias />} />
              <Route path="/ia" element={<IAChat />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
