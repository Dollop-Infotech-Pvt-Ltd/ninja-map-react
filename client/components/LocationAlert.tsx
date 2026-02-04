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
  // Always return null to hide the alert completely
  return null;
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