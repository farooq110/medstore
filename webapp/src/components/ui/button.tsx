import React from "react"
import { cn } from "../../lib/utils"
import { Loader2 } from "lucide-react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  isLoading?: boolean
}

export function Button({
  className,
  variant = "primary",
  size = "default",
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm",
    outline: "border border-border bg-background hover:bg-muted/5 text-foreground dark:text-gray-300",
    ghost: "hover:bg-muted/10 text-muted hover:text-foreground dark:hover:bg-gray-800",
    danger: "bg-danger text-white hover:bg-danger/90 shadow-sm",
    link: "text-primary underline-offset-4 hover:underline p-0 h-auto font-medium",
  }

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3 text-xs",
    lg: "h-11 rounded-md px-8 text-base",
    icon: "h-10 w-10 flex items-center justify-center p-0",
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  )
}
