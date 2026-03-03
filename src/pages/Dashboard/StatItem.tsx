interface StatItemProps {
  label: string;
  value: string | number;
}

export function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-txt-muted">{label}</span>
      <span className="text-lg font-semibold text-txt-main">{value}</span>
    </div>
  );
}
