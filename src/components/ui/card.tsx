import { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background/80 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn("mb-4 space-y-1", className)}>{children}</div>;
}

export function CardTitle({ children, className }: CardProps) {
  return <h3 className={cn("text-lg font-semibold", className)}>{children}</h3>;
}

export function CardDescription({ children, className }: CardProps) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}
