import React, { forwardRef, ReactNode, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Eye, EyeOff, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Stable base classes that don't change - ALWAYS rounded-xl
const baseClasses = "w-full rounded-xl border bg-background text-foreground transition-all duration-200 font-medium text-sm placeholder:text-muted-foreground/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";

const focusClasses = "focus:ring-2 focus:ring-brand/20 focus:border-brand";

const hoverClasses = "hover:border-border/80 hover:bg-background/90";

const sizeClasses = {
  sm: "h-10 px-3 py-2 text-sm",
  md: "h-12 px-4 py-3 text-sm",
  lg: "h-14 px-5 py-4 text-base"
};

const errorClasses = "border-destructive focus:border-destructive focus:ring-destructive/20 bg-destructive/5";

const disabledClasses = "disabled:bg-muted/30 disabled:border-muted";

// Input Props Interface
interface UnifiedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ElementType;
  endIcon?: React.ElementType;
  onEndIconClick?: () => void;
  variant?: 'default' | 'password' | 'search';
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
  loading?: boolean;
  onChange?: (value: string) => void;
}

// Textarea Props Interface
interface UnifiedTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ElementType;
  required?: boolean;
  loading?: boolean;
  onChange?: (value: string) => void;
}

// Select Props Interface  
interface UnifiedSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ElementType;
  required?: boolean;
  loading?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  onChange?: (value: string) => void;
}

// Form Field Container Component
const FormFieldContainer = ({
  label,
  error,
  helpText,
  required,
  children,
  htmlFor,
}: {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
}) => (
  <div className="space-y-2">
    {label && (
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
    )}
    {children}
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex items-center gap-2 text-sm text-destructive"
          role="alert"
        >
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </AnimatePresence>
    {helpText && !error && (
      <p className="text-xs text-muted-foreground">{helpText}</p>
    )}
  </div>
);

// Unified Input Component
export const UnifiedInput = forwardRef<HTMLInputElement, UnifiedInputProps>(
  (
    {
      label,
      error,
      helpText,
      icon: Icon,
      endIcon: EndIcon,
      onEndIconClick,
      variant = 'default',
      size = 'md',
      required = false,
      loading = false,
      className,
      id,
      onChange,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const isPassword = variant === 'password';
    const actualType = isPassword ? (showPassword ? 'text' : 'password') : props.type;

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    }, [onChange]);

    const inputClasses = cn(
      baseClasses,
      sizeClasses[size],
      focusClasses,
      hoverClasses,
      disabledClasses,
      Icon && "pl-10",
      (EndIcon || isPassword) && "pr-10",
      error && errorClasses,
      loading && "cursor-wait opacity-70",
      className
    );

    return (
      <FormFieldContainer
        label={label}
        error={error}
        helpText={helpText}
        required={required}
        htmlFor={inputId}
      >
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/80 h-4 w-4 z-10" />
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={actualType}
            className={inputClasses}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            disabled={loading || props.disabled}
            onChange={handleChange}
            {...props}
          />

          {/* End Icon or Password Toggle */}
          {(EndIcon || isPassword) && (
            <button
              type="button"
              onClick={isPassword ? () => setShowPassword(!showPassword) : onEndIconClick}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/80 hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50"
              tabIndex={-1}
              aria-label={isPassword ? (showPassword ? "Hide password" : "Show password") : "Action"}
            >
              {isPassword ? (
                showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />
              ) : (
                EndIcon && <EndIcon className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand border-t-transparent" />
            </div>
          )}
        </div>
      </FormFieldContainer>
    );
  }
);

UnifiedInput.displayName = "UnifiedInput";

// Unified Textarea Component
export const UnifiedTextarea = forwardRef<HTMLTextAreaElement, UnifiedTextareaProps>(
  (
    {
      label,
      error,
      helpText,
      icon: Icon,
      required = false,
      loading = false,
      className,
      id,
      rows = 4,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value);
    }, [onChange]);

    const minHeightClass = rows === 1 ? "min-h-[40px]" : rows === 2 ? "min-h-[72px]" : "min-h-[96px]";

    const textareaClasses = cn(
      baseClasses,
      `${minHeightClass} px-4 py-2 resize-none overflow-auto`,
      focusClasses,
      hoverClasses,
      disabledClasses,
      Icon && "pl-10",
      error && errorClasses,
      loading && "cursor-wait opacity-70",
      className
    );

    return (
      <FormFieldContainer
        label={label}
        error={error}
        helpText={helpText}
        required={required}
        htmlFor={textareaId}
      >
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-4 text-muted-foreground/80 h-4 w-4 z-10" />
          )}
          
          <textarea
            ref={ref}
            id={textareaId}
            rows={rows}
            className={textareaClasses}
            aria-invalid={!!error}
            aria-describedby={error ? `${textareaId}-error` : undefined}
            disabled={loading || props.disabled}
            onChange={handleChange}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            {...props}
          />

          {/* Loading Spinner */}
          {loading && (
            <div className="absolute right-3 top-4">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand border-t-transparent" />
            </div>
          )}
        </div>
      </FormFieldContainer>
    );
  }
);

UnifiedTextarea.displayName = "UnifiedTextarea";

// Unified Select Component
export const UnifiedSelect = forwardRef<HTMLSelectElement, UnifiedSelectProps>(
  (
    {
      label,
      error,
      helpText,
      icon: Icon,
      required = false,
      loading = false,
      placeholder,
      options = [],
      className,
      id,
      children,
      onChange,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    }, [onChange]);

    const selectClasses = cn(
      baseClasses,
      sizeClasses.md,
      "cursor-pointer appearance-none pr-10",
      focusClasses,
      hoverClasses,
      disabledClasses,
      Icon && "pl-10",
      error && errorClasses,
      loading && "cursor-wait opacity-70",
      className
    );

    return (
      <FormFieldContainer
        label={label}
        error={error}
        helpText={helpText}
        required={required}
        htmlFor={selectId}
      >
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/80 h-4 w-4 z-10" />
          )}
          
          <select
            ref={ref}
            id={selectId}
            className={selectClasses}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : undefined}
            disabled={loading || props.disabled}
            onChange={handleChange}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
            {children}
          </select>

          {/* Dropdown Arrow */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand border-t-transparent" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground/80" />
            )}
          </div>
        </div>
      </FormFieldContainer>
    );
  }
);

UnifiedSelect.displayName = "UnifiedSelect";

// Export validation hooks
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

  const validateName = (name: string, fieldName: string = "Name"): string | undefined => {
    if (!name.trim()) return `${fieldName} is required`;
    if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
    if (!/^[a-zA-Z\s'-]+$/.test(name)) return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
    return undefined;
  };

  const validateMessage = (message: string): string | undefined => {
    if (!message.trim()) return "Message is required";
    if (message.trim().length < 10) return "Message must be at least 10 characters";
    if (message.trim().length > 1000) return "Message must not exceed 1000 characters";
    return undefined;
  };

  const validateSubject = (subject: string): string | undefined => {
    if (!subject.trim()) return "Subject is required";
    if (subject.trim().length < 5) return "Subject must be at least 5 characters";
    if (subject.trim().length > 100) return "Subject must not exceed 100 characters";
    return undefined;
  };

  const validateSelect = (value: string, fieldName: string): string | undefined => {
    if (!value || value === "") return `Please select a ${fieldName.toLowerCase()}`;
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

  const validateOTP = (otp: string): string | undefined => {
    if (!otp) return "Verification code is required";
    if (otp.length !== 6) return "Verification code must be 6 digits";
    if (!/^\d{6}$/.test(otp)) return "Verification code must contain only numbers";
    return undefined;
  };

  const validatePasswordMatch = (password: string, confirmPassword: string): string | undefined => {
    if (password !== confirmPassword) return "Passwords do not match";
    return undefined;
  };

  const validateForm = (formData: Record<string, any>, validationRules: Record<string, (value: any) => string | undefined>): Record<string, string> => {
    const errors: Record<string, string> = {};

    Object.keys(validationRules).forEach(field => {
      const error = validationRules[field](formData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    return errors;
  };

  return {
    validateEmail,
    validatePassword,
    validatePhone,
    validateRequired,
    validateName,
    validateMessage,
    validateSubject,
    validateSelect,
    validateMinLength,
    validateMaxLength,
    validateOTP,
    validatePasswordMatch,
    validateForm,
  };
}

export default UnifiedInput;
