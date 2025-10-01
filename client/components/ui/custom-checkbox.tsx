import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string | React.ReactNode;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function CustomCheckbox({
  checked,
  onChange,
  label,
  className,
  disabled = false,
  size = "md"
}: CustomCheckboxProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  };

  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-4 w-4"
  };

  return (
    <div className={cn("flex items-start gap-3", disabled && "opacity-50", className)}>
      <div className="relative flex-shrink-0 mt-0.5">
        <motion.button
          type="button"
          className={cn(
            "border-2 rounded-md flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2",
            sizeClasses[size],
            checked 
              ? "bg-brand border-brand shadow-sm" 
              : "border-border hover:border-brand/60 bg-background",
            disabled && "cursor-not-allowed"
          )}
          whileHover={!disabled ? { scale: 1.02 } : {}}
          whileTap={!disabled ? { scale: 0.98 } : {}}
          onClick={() => !disabled && onChange(!checked)}
          disabled={disabled}
          aria-checked={checked}
          role="checkbox"
        >
          <motion.div
            initial={false}
            animate={{
              scale: checked ? 1 : 0,
              opacity: checked ? 1 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 600,
              damping: 30,
              duration: 0.15
            }}
          >
            <Check className={cn("text-white", iconSizes[size])} />
          </motion.div>
        </motion.button>
      </div>
      
      {label && (
        <div className="flex-1 min-w-0">
          {typeof label === 'string' ? (
            <span className="text-sm font-medium text-foreground select-none leading-relaxed">
              {label}
            </span>
          ) : (
            <div className="text-sm font-medium leading-relaxed">
              {label}
            </div>
          )}
        </div>
      )}
      
      {/* Hidden native checkbox for form compatibility */}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        className="sr-only"
        disabled={disabled}
        tabIndex={-1}
      />
    </div>
  );
}
