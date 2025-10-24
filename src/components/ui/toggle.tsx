"use client";

import { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

interface ToggleProps {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  children: ReactNode;
  label: string;
}

export function Toggle({ pressed = false, onPressedChange, children, label }: ToggleProps) {
  return (
    <button
      type="button"
      className={cn(
        "focus-outline rounded-full border px-3 py-1 text-sm font-medium transition",
        pressed ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground"
      )}
      aria-pressed={pressed}
      onClick={() => onPressedChange?.(!pressed)}
    >
      <span className="sr-only">{label}</span>
      {children}
    </button>
  );
}
