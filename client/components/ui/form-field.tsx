import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  multiline?: boolean;
  rows?: number;
  icon?: React.ElementType;
  helpText?: string;
}

export function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  disabled = false,
  className,
  inputClassName,
  multiline = false,
  rows = 4,
  icon: Icon,
  helpText,
}: FormFieldProps) {
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className={cn("space-y-2", className)}>
      <Label 
        htmlFor={inputId} 
        className="text-sm font-medium text-foreground flex items-center gap-2"
      >
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        {label}
        {required && (
          <span className="text-destructive text-sm" aria-label="required">
            *
          </span>
        )}
      </Label>

      <div className="relative">
        <InputComponent
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            error && "border-destructive focus:border-destructive focus:ring-destructive/20",
            inputClassName
          )}
          aria-invalid={!!error}
          aria-describedby={cn(
            error && errorId,
            helpText && helpId
          )}
          rows={multiline ? rows : undefined}
          data-invalid={!!error}
        />
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            id={errorId}
            className="flex items-center gap-2 text-sm text-destructive"
            role="alert"
          >
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Text */}
      {helpText && !error && (
        <p 
          id={helpId}
          className="text-xs text-muted-foreground leading-relaxed"
        >
          {helpText}
        </p>
      )}
    </div>
  );
}

// Export a simple validation hook
export function useFormValidation() {
  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address";
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return "Password must contain uppercase, lowercase, and number";
    }
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone) return "Phone number is required";
    if (!/^\+?[\d\s-()]{10,}$/.test(phone)) return "Please enter a valid phone number";
    return undefined;
  };

  const validateRequired = (value: string, fieldName: string): string | undefined => {
    if (!value.trim()) return `${fieldName} is required`;
    return undefined;
  };

  const validateMinLength = (value: string, minLength: number, fieldName: string): string | undefined => {
    if (value.length < minLength) return `${fieldName} must be at least ${minLength} characters`;
    return undefined;
  };

  const validateMaxLength = (value: string, maxLength: number, fieldName: string): string | undefined => {
    if (value.length > maxLength) return `${fieldName} must not exceed ${maxLength} characters`;
    return undefined;
  };

  return {
    validateEmail,
    validatePassword,
    validatePhone,
    validateRequired,
    validateMinLength,
    validateMaxLength,
  };
}
