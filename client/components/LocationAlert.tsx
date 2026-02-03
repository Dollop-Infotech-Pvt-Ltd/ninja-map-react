import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe } from 'lucide-react';
import { checkUserLocationForNigeria, type LocationCheckResult } from '@/lib/locationUtils';

interface LocationAlertProps {
  onDismiss?: () => void;
  showOnlyOutsideNigeria?: boolean;
}

export default function LocationAlert({ 
  onDismiss, 
  showOnlyOutsideNigeria = true 
}: LocationAlertProps) {
  const [locationResult, setLocationResult] = useState<LocationCheckResult | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkLocation();
  }, []);

  const checkLocation = async () => {
    try {
      const result = await checkUserLocationForNigeria();
      setLocationResult(result);
      
      // Only show if user is outside Nigeria and we want to show the alert
      if (showOnlyOutsideNigeria && !result.isInNigeria) {
        setIsVisible(true);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onDismiss?.();
          }, 300); // Wait for animation to complete
        }, 5000);
      }
    } catch (err) {
      console.error('Location check failed:', err);
    }
  };

  // Don't render if we should only show outside Nigeria and user is in Nigeria
  if (showOnlyOutsideNigeria && locationResult?.isInNigeria) return null;

  // Don't render if not visible
  if (!isVisible || !locationResult) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-4 right-4 z-50 max-w-sm"
      >
        <div className="bg-amber-50/95 dark:bg-amber-950/95 border border-amber-200 dark:border-amber-800 rounded-lg shadow-lg backdrop-blur-sm p-4">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Outside Nigeria
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                You're currently outside Nigeria. Map optimized for Nigerian navigation.
              </p>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onDismiss?.(), 300);
              }}
              className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for using location check in components
export function useLocationCheck() {
  const [locationResult, setLocationResult] = useState<LocationCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkLocation = async () => {
    setIsLoading(true);
    try {
      const result = await checkUserLocationForNigeria();
      setLocationResult(result);
      return result;
    } catch (error) {
      console.error('Location check failed:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    locationResult,
    isLoading,
    checkLocation
  };
}