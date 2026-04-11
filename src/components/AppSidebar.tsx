import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, BarChart3, Calendar, Brain, Target, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/simulado", icon: FileText, label: "Simulado" },
  { to: "/desempenho", icon: BarChart3, label: "Desempenho" },
  { to: "/plano", icon: Calendar, label: "Plano de Estudos" },
  { to: "/estrategia", icon: Target, label: "Estratégias" },
  { to: "/ia", icon: Brain, label: "IA Concurseira" },
];

export default function AppSidebar() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="font-display text-xl font-bold gradient-text">ConcursIA</h1>
        <p className="text-xs text-muted-foreground mt-1">IA para aprovação</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {user && (
          <div className="text-xs text-muted-foreground truncate px-1">
            {user.email}
          </div>
        )}
        <button
          onClick={signOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
