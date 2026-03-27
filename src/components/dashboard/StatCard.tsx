import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  variant: "primary" | "secondary" | "tertiary" | "error";
}

export default function StatCard({ label, value, icon: Icon, variant }: StatCardProps) {
  const iconColor = {
    primary: "text-primary",
    secondary: "text-secondary",
    tertiary: "text-tertiary",
    error: "text-error",
  }[variant];

  const bgColor = {
    primary: "bg-primary/5",
    secondary: "bg-secondary/5",
    tertiary: "bg-tertiary/5",
    error: "bg-error/5",
  }[variant];

  return (
    <div className="bg-surface-container-low rounded-xl p-4 flex items-center gap-4 border border-outline-variant/10">
      <div className={`p-2 rounded-lg ${bgColor}`}>
        <Icon className={`${iconColor} w-4 h-4`} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">
          {label}
        </p>
        <p className="text-lg font-headline font-bold text-on-surface">{value}</p>
      </div>
    </div>
  );
}
