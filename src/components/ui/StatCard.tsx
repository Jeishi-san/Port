"use client";

interface StatCardProps {
  value: number | string;
  label: string;
  icon?: React.ElementType;
}

export function StatCard({ value, label, icon: Icon }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{value}</span>
        {Icon && <Icon className="size-6 text-primary/20" />}
      </div>
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
    </div>
  );
}
