"use client";

import { BookOpen, UsersRound } from "lucide-react";

import { cn } from "@/lib/utils";

interface RoleOption {
  value: "TUTOR" | "GUARDIAN";
  title: string;
  description: string;
  icon: typeof BookOpen;
}

const options: RoleOption[] = [
  {
    value: "TUTOR",
    title: "Tutor",
    description: "I want to discover tuition opportunities.",
    icon: BookOpen,
  },
  {
    value: "GUARDIAN",
    title: "Guardian",
    description: "I want to hire and manage tutor applications.",
    icon: UsersRound,
  },
];

interface RoleSelectorProps {
  value: "TUTOR" | "GUARDIAN";
  onChange: (value: "TUTOR" | "GUARDIAN") => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-[1.5rem] border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring",
            value === option.value
              ? "border-primary bg-primary/5 shadow-[0_18px_44px_-32px_rgba(15,118,110,0.7)]"
              : "border-border bg-background/70 hover:border-primary/40 hover:bg-background",
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl",
                value === option.value ? "bg-primary text-primary-foreground" : "bg-secondary-soft text-primary",
              )}
            >
              <option.icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-foreground">{option.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{option.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
