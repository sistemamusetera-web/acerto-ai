import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, BarChart3, Calendar, Brain, Target, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

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
  const [open, setOpen] = useState(false);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* Mobile header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-sidebar border-b border-sidebar-border flex items-center px-4 z-50 lg:hidden">
        <button onClick={() => setOpen(true)} className="p-2 -ml-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-md">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-display text-lg font-bold gradient-text ml-3">ConcursIA</h1>
      </header>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold gradient-text">ConcursIA</h1>
            <p className="text-xs text-muted-foreground mt-1">IA para aprovação</p>
          </div>
          <button onClick={() => setOpen(false)} className="p-1 text-muted-foreground hover:text-foreground lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
    </>
  );
}
