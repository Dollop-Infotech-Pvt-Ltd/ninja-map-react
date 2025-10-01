import { useState } from 'react';

export type AuthMode = 'login' | 'signup' | 'forgot' | 'otp';

export function useAuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');

  const openModal = (initialMode: AuthMode = 'login') => {
    setMode(initialMode);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // Reset to login mode when closing for better UX
    setTimeout(() => setMode('login'), 200);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
  };

  // Quick mode switches
  const openLogin = () => {
    if (isOpen) {
      switchMode('login');
    } else {
      openModal('login');
    }
  };

  const openSignup = () => {
    if (isOpen) {
      switchMode('signup');
    } else {
      openModal('signup');
    }
  };

  return {
    isOpen,
    mode,
    openModal,
    closeModal,
    switchMode,
    openLogin,
    openSignup,
    openForgot: () => openModal('forgot'),
    openOtp: () => openModal('otp'),
  };
}
