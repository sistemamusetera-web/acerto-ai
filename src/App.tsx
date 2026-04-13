import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppSidebar from "@/components/AppSidebar";
import ProfileSetupModal from "@/components/ProfileSetupModal";
import Dashboard from "./pages/Dashboard";
import Simulado from "./pages/Simulado";
import Desempenho from "./pages/Desempenho";
import CadernoErros from "./pages/CadernoErros";
import PlanoEstudos from "./pages/PlanoEstudos";
import Estrategias from "./pages/Estrategias";
import IAChat from "./pages/IAChat";
import AnaliseEdital from "./pages/AnaliseEdital";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 p-4 sm:p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/simulado" element={<Simulado />} />
          <Route path="/desempenho" element={<Desempenho />} />
          <Route path="/caderno" element={<CadernoErros />} />
          <Route path="/plano" element={<PlanoEstudos />} />
          <Route path="/estrategia" element={<Estrategias />} />
          <Route path="/ia" element={<IAChat />} />
          <Route path="/analise-edital" element={<AnaliseEdital />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Auth />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthRoute />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
