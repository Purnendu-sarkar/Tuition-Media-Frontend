import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "primary" | "secondary" | "ghost" | "outline" |"destructive";
type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-primary text-primary-foreground shadow-[0_20px_45px_-24px_rgba(15,118,110,0.8)] hover:bg-primary-strong focus-visible:ring-primary/30",
  primary:
    "bg-primary text-primary-foreground shadow-[0_20px_45px_-24px_rgba(15,118,110,0.8)] hover:bg-primary-strong focus-visible:ring-primary/30",
  secondary:
    "bg-secondary-soft text-foreground hover:bg-secondary-soft/80 focus-visible:ring-secondary/30",
  ghost: "bg-transparent text-foreground hover:bg-foreground/5 focus-visible:ring-primary/20",
  outline:
    "border border-border bg-background/80 text-foreground shadow-[0_12px_30px_-24px_rgba(15,23,42,0.6)] hover:bg-background focus-visible:ring-primary/20",
   destructive:
    "bg-red-500 text-white shadow-[0_20px_45px_-24px_rgba(220,38,38,0.8)] hover:bg-red-600 focus-visible:ring-red-300",  
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-11 w-11 p-0",
  "icon-sm": "h-9 w-9 p-0",
};

interface SharedButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type NativeButtonProps = SharedButtonProps & ButtonHTMLAttributes<HTMLButtonElement>;
type LinkButtonProps = SharedButtonProps &
  ComponentPropsWithoutRef<typeof Link> & {
    href: string;
  };

function getButtonClasses({
  variant = "primary",
  size = "md",
  className,
}: Pick<SharedButtonProps, "variant" | "size" | "className">) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: NativeButtonProps | LinkButtonProps) {
  const classes = getButtonClasses({ className, variant, size });

  if ("href" in props) {
    return (
      <Link className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
