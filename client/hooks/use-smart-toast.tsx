import { useCustomToast } from "./use-custom-toast";

interface SmartToastOptions {
  showErrorsWithoutFieldLabels?: boolean;
  showSuccessAlways?: boolean;
  showValidationErrors?: boolean;
}

export function useSmartToast(options: SmartToastOptions = {}) {
  const toast = useCustomToast();
  
  const {
    showErrorsWithoutFieldLabels = true,
    showSuccessAlways = true,
    showValidationErrors = false
  } = options;

  // Success messages - always show these
  const success = (title: string, description?: string) => {
    if (showSuccessAlways) {
      toast.success(title, description);
    }
  };

  // Error messages - only show if they're not displayed prominently in form
  const error = (title: string, description?: string, hasFieldErrors = false) => {
    // Don't show toast if there are field-level errors visible
    if (hasFieldErrors && !showErrorsWithoutFieldLabels) {
      return;
    }
    toast.error(title, description);
  };

  // Info messages - show these for important non-error information
  const info = (title: string, description?: string) => {
    toast.info(title, description);
  };

  // Warning messages - show these for important warnings
  const warning = (title: string, description?: string) => {
    toast.warning?.(title, description);
  };

  // Validation error - only show if field-level validation isn't visible
  const validationError = (title: string, description?: string) => {
    if (showValidationErrors) {
      toast.error(title, description);
    }
  };

  // General checkbox/terms errors - show these since they're not prominent
  const checkboxError = (title: string, description?: string) => {
    toast.error(title, description);
  };

  // Network/server errors - show these since they're not field-specific
  const serverError = (title: string = "Something went wrong", description?: string) => {
    toast.error(title, description || "Please try again or contact support if the problem persists.");
  };

  return {
    success,
    error,
    info,
    warning,
    validationError,
    checkboxError,
    serverError,
    // Direct access to original toast for special cases
    raw: toast
  };
}
