import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { motion } from "framer-motion";

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: React.ReactNode;
}

export function useCustomToast() {
  const showToast = (type: ToastType, options: ToastOptions) => {
    const icons = {
      success: CheckCircle,
      error: XCircle,
      warning: AlertTriangle,
      info: Info,
    };

    const colors = {
      success: { bg: 'bg-green-50 dark:bg-green-950/50', border: 'border-green-200 dark:border-green-800', icon: 'text-green-500', text: 'text-green-800 dark:text-green-200' },
      error: { bg: 'bg-red-50 dark:bg-red-950/50', border: 'border-red-200 dark:border-red-800', icon: 'text-red-500', text: 'text-red-800 dark:text-red-200' },
      warning: { bg: 'bg-yellow-50 dark:bg-yellow-950/50', border: 'border-yellow-200 dark:border-yellow-800', icon: 'text-yellow-500', text: 'text-yellow-800 dark:text-yellow-200' },
      info: { bg: 'bg-blue-50 dark:bg-blue-950/50', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-500', text: 'text-blue-800 dark:text-blue-200' },
    };

    const Icon = icons[type];
    const colorScheme = colors[type];

    toast({
      duration: options.duration || 5000,
      className: `${colorScheme.bg} ${colorScheme.border} border-2 shadow-xl backdrop-blur-sm rounded-xl z-[9999]`,
      title: (
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className={`h-5 w-5 ${colorScheme.icon}`} />
          <span className={`font-semibold ${colorScheme.text}`}>
            {options.title}
          </span>
        </motion.div>
      ),
      description: options.description && (
        <motion.p 
          className={`${colorScheme.text} text-sm mt-1`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {options.description}
        </motion.p>
      ),
      action: options.action,
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
      errorCount === 1 ? firstError : `${errorCount} fields need attention`
    );
  };

  const networkError = (action?: string) => {
    error(
      "Network Error",
      action ? `Failed to ${action}. Please check your connection and try again.` : "Please check your connection and try again."
    );
  };

  const authError = (message?: string) => {
    error(
      "Authentication Failed",
      message || "Please check your credentials and try again."
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
