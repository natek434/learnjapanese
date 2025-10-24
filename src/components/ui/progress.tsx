interface ProgressProps {
  value: number;
  label?: string;
}

export function Progress({ value, label }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full space-y-2" role="group" aria-label={label ?? "Progress"}>
      {label ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          <span className="font-medium text-foreground">{clamped.toFixed(0)}%</span>
        </div>
      ) : null}
      <div className="h-2 rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuenow={clamped}
          aria-valuemax={100}
          aria-label={label ?? "Progress"}
        />
      </div>
    </div>
  );
}
