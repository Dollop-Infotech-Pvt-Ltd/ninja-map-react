import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

export function useEnhancedToast() {
  const showToast = (type: ToastType, options: ToastOptions) => {
    const icons = {
      success: CheckCircle,
      error: XCircle,
      warning: AlertTriangle,
      info: Info,
    };

    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'default',
      info: 'default',
    } as const;

    const Icon = icons[type];

    toast({
      title: (
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${
            type === 'success' ? 'text-green-500' :
            type === 'error' ? 'text-red-500' :
            type === 'warning' ? 'text-yellow-500' :
            'text-blue-500'
          }`} />
          {options.title}
        </div>
      ),
      description: options.description,
      variant: variants[type],
      duration: options.duration || 4000,
    });
  };

  const success = (title: string, description?: string, duration?: number) => {
    showToast('success', { title, description, duration });
  };

  const error = (title: string, description?: string, duration?: number) => {
    showToast('error', { title, description, duration });
  };

  const warning = (title: string, description?: string, duration?: number) => {
    showToast('warning', { title, description, duration });
  };

  const info = (title: string, description?: string, duration?: number) => {
    showToast('info', { title, description, duration });
  };

  // Form validation specific toasts
  const validationError = (errors: Record<string, string>) => {
    const errorCount = Object.keys(errors).length;
    const firstError = Object.values(errors)[0];
    
    error(
      `Form Validation Failed`,
      errorCount === 1 ? firstError : `${errorCount} fields need attention`,
      5000
    );
  };

  const networkError = (action?: string) => {
    error(
      "Network Error",
      action ? `Failed to ${action}. Please check your connection and try again.` : "Please check your connection and try again.",
      6000
    );
  };

  const authError = (message?: string) => {
    error(
      "Authentication Failed",
      message || "Please check your credentials and try again.",
      5000
    );
  };

  return {
    success,
    error,
    warning,
    info,
    validationError,
    networkError,
    authError,
  };
}
