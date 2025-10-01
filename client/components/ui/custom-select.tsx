import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  icon?: React.ElementType;
  description?: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
  required?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  disabled = false,
  label,
  error,
  required = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <div ref={selectRef} className="relative">
        <motion.button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          whileHover={!disabled ? { scale: 1.01 } : {}}
          whileTap={!disabled ? { scale: 0.99 } : {}}
          className={cn(
            // Base styling matching UnifiedInput
            "w-full rounded-xl border bg-background/80 backdrop-blur-sm px-4 py-3 text-sm font-medium transition-all duration-200 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand hover:border-border/80 hover:bg-background/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
            // Layout
            "flex items-center justify-between text-left h-12",
            // States
            isOpen && "border-brand ring-2 ring-brand/20",
            error && "border-destructive focus:border-destructive focus:ring-destructive/20 bg-destructive/5",
            disabled && "cursor-not-allowed opacity-50",
            selectedOption ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {selectedOption?.icon && (
              <selectedOption.icon className="h-5 w-5 text-brand flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {selectedOption ? selectedOption.label : placeholder}
              </div>
              {selectedOption?.description && (
                <div className="text-xs text-muted-foreground truncate">
                  {selectedOption.description}
                </div>
              )}
            </div>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 ml-2"
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="max-h-64 overflow-y-auto py-1">
                {options.map((option, index) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 hover:bg-muted/50 focus:bg-muted/50 focus:outline-none",
                      value === option.value ? "bg-brand/10 text-brand" : "text-foreground"
                    )}
                  >
                    {option.icon && (
                      <option.icon className={cn(
                        "h-5 w-5 flex-shrink-0",
                        value === option.value ? "text-brand" : "text-muted-foreground"
                      )} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          {option.description}
                        </div>
                      )}
                    </div>
                    {value === option.value && (
                      <Check className="h-4 w-4 text-brand flex-shrink-0" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex items-center gap-2 text-sm text-destructive"
          role="alert"
        >
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
}
