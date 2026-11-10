"use client";

interface StatCardProps {
  value: number | string;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="flex flex-col">
      <span className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{value}</span>
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
    </div>
  );
}
