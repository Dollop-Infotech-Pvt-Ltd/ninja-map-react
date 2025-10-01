import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export function ActionButton({
  children,
  loading = false,
  icon: Icon,
  iconPosition = "left",
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  disabled,
  ...props
}: ActionButtonProps) {
  const baseClasses = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  
  const variantClasses = {
    primary: "bg-gradient-brand text-white shadow-lg hover:shadow-xl hover:opacity-90 focus:ring-brand/20",
    secondary: "bg-muted text-foreground hover:bg-muted/80 focus:ring-brand/20",
    outline: "border-2 border-brand text-brand hover:bg-brand hover:text-white focus:ring-brand/20"
  };

  const sizeClasses = {
    sm: "h-10 px-4 py-2 text-sm",
    md: "h-12 px-6 py-3 text-base",
    lg: "h-14 px-8 py-4 text-lg"
  };

  const isDisabled = disabled || loading;

  const buttonContent = (
    <>
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
        />
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon className="w-4 h-4" />}
          {children}
          {Icon && iconPosition === "right" && <Icon className="w-4 h-4" />}
        </>
      )}
    </>
  );

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {buttonContent}
    </motion.button>
  );
}
