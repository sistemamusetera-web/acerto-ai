import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle?: string;
  trend?: string;
}

export default function StatCard({ icon: Icon, label, value, subtitle, trend }: StatCardProps) {
  return (
    <div className="glass-card p-5 stat-glow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <p className="font-display text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      {trend && <p className="text-xs text-primary mt-1">{trend}</p>}
    </div>
  );
}
