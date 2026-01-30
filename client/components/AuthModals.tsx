import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/action-button";
import { UnifiedInput, useFormValidation } from "@/components/ui/unified-input";
import { CustomCheckbox } from "@/components/ui/custom-checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSmartToast } from "@/hooks/use-smart-toast";
import { post, setAuthToken, fetchCsrf, getStoredAuthToken } from "@/lib/http";
import { useNavigate } from "react-router-dom";
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  ArrowLeft,
  Shield,
  Check,
  Smartphone,
  MapPin,
  Sparkles,
  Crown,
  AlertTriangle,
  Loader,
  CheckCircle
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup" | "forgot" | "otp" | "reset" | "success";
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  otp?: string;
  general?: string;
}

export default function AuthModals({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpOrigin, setOtpOrigin] = useState<"login" | "signup" | "forgot" | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const toast = useSmartToast();
  const validation = useFormValidation();
  const navigate = useNavigate();

  // Reset mode when modal opens with new initial mode
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    otp: "",
    rememberMe: false,
    acceptTerms: false
  });

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        newPassword: "",
        confirmNewPassword: "",
        firstName: "",
        lastName: "",
        phone: "",
        otp: "",
        rememberMe: false,
        acceptTerms: false
      });
      setErrors({});
      setIsLoading(false);
      setOtpTimer(0);
      // Preserve otpOrigin while the modal stays open so we can route correctly after verification
    }
  }, [isOpen]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const firstInput = modalRef.current.querySelector('input') as HTMLInputElement;
      firstInput?.focus();
    }
  }, [isOpen, mode]);

  // OTP timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === "otp" && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, otpTimer]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing/changing values
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Clear general error when acceptTerms checkbox is checked
    if (field === 'acceptTerms' && value === true && errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (mode === "login") {
      newErrors.email = validation.validateEmail(formData.email);
      if (!formData.password) newErrors.password = "Password is required";
    } else if (mode === "signup") {
      newErrors.email = validation.validateEmail(formData.email);
      newErrors.password = validation.validatePassword(formData.password);
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
      newErrors.phone = validation.validatePhone(formData.phone);
      if (!formData.acceptTerms) {
        // Show toast for checkbox error since it's not prominently displayed
        toast.checkboxError("Terms and Conditions", "Please accept the terms and conditions to continue");
        newErrors.general = "Please accept the terms and conditions to continue";
      }
    } else if (mode === "forgot") {
      newErrors.email = validation.validateEmail(formData.email);
    } else if (mode === "otp") {
      newErrors.otp = validation.validateOTP(formData.otp);
    } else if (mode === "reset") {
      newErrors.newPassword = validation.validatePassword(formData.newPassword);
      if (formData.newPassword !== formData.confirmNewPassword) {
        newErrors.confirmNewPassword = "Passwords do not match";
      }
    }

    // Only update errors that have actually changed to prevent UI glitches
    const hasErrorChanges = Object.keys(newErrors).some(key =>
      newErrors[key as keyof FormErrors] !== errors[key as keyof FormErrors]
    ) || Object.keys(errors).some(key =>
      !newErrors[key as keyof FormErrors] && errors[key as keyof FormErrors]
    );

    if (hasErrorChanges) {
      setErrors(newErrors);
    }

    return Object.keys(newErrors).filter(key => newErrors[key as keyof FormErrors]).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Don't show toast for validation errors since they're displayed in form
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Handle API interactions per mode
      if (mode === "login") {
        // Call server login endpoint which may return otp and authToken
        try {
          const payload = { username: formData.email, password: formData.password } as any;
          // Ensure CSRF token/header is fetched and set before making auth requests
          await fetchCsrf().catch(() => {});
          const res = await post<any>('/api/auth/login', payload);

          let otpCode: string | undefined;
          let authTokenFromRes: string | undefined;

          if (res) {
            const anyRes: any = res;
            if (typeof anyRes === 'string') otpCode = anyRes;

            if (anyRes.otp) otpCode = anyRes.otp;
            if (anyRes.code) otpCode = anyRes.code;
            if (anyRes.verificationCode) otpCode = anyRes.verificationCode;

            if (anyRes.data) {
              if (typeof anyRes.data === 'string') otpCode = otpCode ?? anyRes.data;
              else {
                if (anyRes.data.otp) otpCode = anyRes.data.otp;
                if (anyRes.data.authToken) authTokenFromRes = anyRes.data.authToken;
                if (anyRes.data.token) authTokenFromRes = authTokenFromRes ?? anyRes.data.token;
              }
            }

            if (!authTokenFromRes) {
              if (anyRes.authToken) authTokenFromRes = anyRes.authToken;
              if (anyRes.token) authTokenFromRes = authTokenFromRes ?? anyRes.token;
              if (anyRes.accessToken) authTokenFromRes = authTokenFromRes ?? anyRes.accessToken;
            }
          }

          if (authTokenFromRes) {
            setAuthToken(authTokenFromRes, Boolean(formData.rememberMe));
          }

          // go to OTP and remember origin
          setOtpOrigin('login');
          setMode('otp');
          setOtpTimer(30);

          if (otpCode) {
            toast.success('Verification code sent', `OTP: ${otpCode}`);
          } else {
            toast.success('Verification code sent', `We've sent a 6-digit code to ${formData.email}`);
          }
        } catch (err: any) {
          const msg = err?.message || err?.data?.message || 'Failed to login';
          toast.serverError('Login failed', String(msg));
          setErrors({ general: String(msg) });
        }
      } else if (mode === "signup") {
        // Call server register endpoint
        try {
          const payload = {
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            mobileNumber: formData.phone
          } as any;

          // Ensure CSRF token/header is fetched and set before making auth requests
          await fetchCsrf().catch(() => {});
          const res = await post<any>('/api/auth/register', payload);

          // Expect server to return OTP and/or auth token in a few possible shapes
          let otpCode: string | undefined;
          let authTokenFromRes: string | undefined;

          if (res) {
            if (typeof res === 'string') otpCode = res;
            else {
              // common response shapes: { data: { otp, authToken } } or { data: { otp }, authToken }
              const anyRes: any = res;
              if (anyRes.otp) otpCode = anyRes.otp;
              if (anyRes.code) otpCode = anyRes.code;
              if (anyRes.verificationCode) otpCode = anyRes.verificationCode;

              if (anyRes.data) {
                if (typeof anyRes.data === 'string') otpCode = otpCode ?? anyRes.data;
                else if (anyRes.data.otp) otpCode = anyRes.data.otp;
                if (anyRes.data.authToken) authTokenFromRes = anyRes.data.authToken;
              }

              if (!authTokenFromRes) {
                if (anyRes.authToken) authTokenFromRes = anyRes.authToken;
                if (anyRes.data?.token) authTokenFromRes = authTokenFromRes ?? anyRes.data.token;
                if (anyRes.token) authTokenFromRes = authTokenFromRes ?? anyRes.token;
                if (anyRes.accessToken) authTokenFromRes = authTokenFromRes ?? anyRes.accessToken;
              }
            }
          }

          // Save auth token if provided so subsequent verify request includes it
          if (authTokenFromRes) {
            try {
              setAuthToken(authTokenFromRes, Boolean(formData.rememberMe));
            } catch (e) {
              /* ignore */
            }
          }

          // go to OTP and remember origin
          setOtpOrigin('signup');
          setMode("otp");
          setOtpTimer(30);

          if (otpCode) {
            toast.success("Verification code sent", `OTP: ${otpCode}`);
          } else {
            toast.success("Verification code sent", `We've sent a 6-digit code to ${formData.phone}`);
          }
        } catch (err: any) {
          // Surface server error message when possible
          const msg = err?.message || err?.data?.message || 'Failed to create account';
          toast.serverError('Signup failed', String(msg));
          setErrors({ general: String(msg) });
        }
      } else if (mode === "forgot") {
        try {
          await fetchCsrf().catch(() => {});
          const res = await post<any>('/api/auth/forget-password', { username: formData.email });

          let otpCode: string | undefined;
          let authTokenFromRes: string | undefined;
          if (res) {
            const anyRes: any = res;
            if (typeof anyRes === 'string') otpCode = anyRes;
            if (anyRes.otp) otpCode = anyRes.otp;
            if (anyRes.code) otpCode = anyRes.code;
            if (anyRes.verificationCode) otpCode = anyRes.verificationCode;

            if (anyRes.data) {
              if (typeof anyRes.data === 'string') otpCode = otpCode ?? anyRes.data;
              else {
                if (anyRes.data.otp) otpCode = anyRes.data.otp;
                if (anyRes.data.code) otpCode = otpCode ?? anyRes.data.code;
                if (anyRes.data.authToken) authTokenFromRes = anyRes.data.authToken;
                if (anyRes.data.token) authTokenFromRes = authTokenFromRes ?? anyRes.data.token;
                if (anyRes.data.accessToken) authTokenFromRes = authTokenFromRes ?? anyRes.data.accessToken;
              }
            }

            if (!authTokenFromRes) {
              if (anyRes.authToken) authTokenFromRes = anyRes.authToken;
              if (anyRes.token) authTokenFromRes = authTokenFromRes ?? anyRes.token;
              if (anyRes.accessToken) authTokenFromRes = authTokenFromRes ?? anyRes.accessToken;
            }
          }

          if (authTokenFromRes) {
            setAuthToken(authTokenFromRes, Boolean(formData.rememberMe));
          }

          setOtpOrigin('forgot');
          setMode('otp');
          setOtpTimer(30);

          if (otpCode) {
            toast.success('Verification code sent', `OTP: ${otpCode}`);
          } else {
            toast.success('Verification code sent', `We've sent a 6-digit code to ${formData.email}`);
          }
        } catch (err: any) {
          const msg = err?.message || err?.data?.message || 'Failed to send reset code';
          toast.serverError('Request failed', String(msg));
          setErrors({ general: String(msg) });
        }
      } else if (mode === "otp") {
        if (formData.otp.length === 6) {
          // Call verify OTP endpoint
          try {
            // Ensure CSRF token/header is fetched and set before making auth requests
            await fetchCsrf().catch(() => {});
            const tokenHeader = getStoredAuthToken();
            const res = await post<any>(
              '/api/auth/verify-otp',
              { otp: formData.otp },
              tokenHeader ? { headers: { Authorization: `Bearer ${tokenHeader}` } } : undefined
            );

            // Attempt to extract token or success message
            let token: string | undefined;
            const anyRes: any = res;
            if (anyRes) {
              if (typeof anyRes === 'string') {
                // no token in plain string
              } else {
                token = anyRes.token
                  ?? anyRes.authToken
                  ?? anyRes.accessToken
                  ?? (anyRes.data && (typeof anyRes.data === 'string' ? anyRes.data : (anyRes.data.token ?? anyRes.data.authToken ?? anyRes.data.accessToken)));
              }
            }

            if (token) {
              setAuthToken(token, Boolean(formData.rememberMe));
            }

            // Additionally, if server returned accessToken/refreshToken in the response body,
            // store them as cookies for server-compatible flows (note: httpOnly cookies must be set server-side).
            try {
              const accessToken = anyRes?.data?.accessToken ?? anyRes?.accessToken ?? token;
              const refreshToken = anyRes?.data?.refreshToken ?? anyRes?.refreshToken;

              const setCookie = (name: string, value: string | undefined, maxAgeSeconds: number) => {
                if (!value) return;
                const secure = typeof window !== 'undefined' && window.location.protocol === 'https:';
                document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax; ${secure ? 'Secure;' : ''}`;
              };

              setCookie('accessToken', accessToken, 60 * 60);
              setCookie('refreshToken', refreshToken, 30 * 24 * 60 * 60);
            } catch (e) {
              // ignore cookie errors
            }
            try {
              const ev = new CustomEvent('authChange', { detail: { token } });
              window.dispatchEvent(ev);
            } catch {}

            const message = (res && ((res as any).message || (res as any).msg)) || '';
            if (otpOrigin === 'signup' || initialMode === 'signup') {
              try { localStorage.setItem('isLoggedIn', 'true'); } catch {}
              setMode('success');
              toast.success('Account verified', message || 'Your account has been verified.');
              try { navigate('/'); onClose(); } catch (e) {}
            } else if (otpOrigin === 'forgot') {
              // Do NOT mark logged-in; only move to reset password
              try { localStorage.removeItem('isLoggedIn'); } catch {}
              setMode('reset');
              toast.success('Code verified', message || 'Please create a new password');
            } else {
              // Login flow
              try { localStorage.setItem('isLoggedIn', 'true'); } catch {}
              toast.success('Verified', message || 'Verification successful.');
              try { navigate('/'); onClose(); } catch (e) {}
            }
          } catch (err: any) {
            const msg = err?.message || err?.data?.message || 'Failed to verify code';
            toast.error('Verification failed', String(msg));
            setErrors({ otp: String(msg) });
          }
        } else {
          // Show toast for OTP error since it's not prominently displayed
          toast.error('Invalid code', 'Please enter a valid 6-digit verification code');
          setErrors({ otp: 'Please enter a valid 6-digit verification code' });
        }
      } else if (mode === "reset") {
        try {
          await fetchCsrf().catch(() => {});
          const body = { newPassword: formData.newPassword } as any;
          const res = await post<any>('/api/auth/reset-password', body);
          const msg = (res && ((res as any).message || (res as any).msg)) || 'Password updated!';

          // After a successful password reset, clear client-side auth to require fresh login
          try {
            setAuthToken(null);
          } catch {}
          try {
            document.cookie = 'accessToken=; Path=/; Max-Age=0;';
            document.cookie = 'refreshToken=; Path=/; Max-Age=0;';
          } catch {}
          try { localStorage.removeItem('isLoggedIn'); } catch {}

          toast.success(msg, 'Your password has been successfully updated');
          setMode('success');
        } catch (err: any) {
          const msg = err?.message || err?.data?.message || 'Failed to update password';
          toast.serverError('Update failed', String(msg));
          setErrors({ general: String(msg) });
        }
      }
    } catch (error) {
      toast.serverError("Authentication failed", "Please check your connection and try again.");
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (otpTimer > 0) return;

    setIsLoading(true);
    try {
      // Ensure CSRF token/header is fetched
      await fetchCsrf().catch(() => {});

      // Send identifying info so server can decide where to resend (email or phone)
      const payload: any = {};
      if (formData.email) payload.email = formData.email;
      if (formData.phone) payload.phone = formData.phone;

      const tokenHeader = getStoredAuthToken();
      const res = await post<any>(
        '/api/auth/resend-otp',
        payload,
        tokenHeader ? { headers: { Authorization: `Bearer ${tokenHeader}` } } : undefined
      );

      // Extract possible otp and authToken
      let otpCode: string | undefined;
      let authTokenFromRes: string | undefined;
      if (res) {
        const anyRes: any = res;
        if (typeof anyRes === 'string') otpCode = anyRes;
        if (anyRes.otp) otpCode = anyRes.otp;
        if (anyRes.code) otpCode = anyRes.code;
        if (anyRes.data) {
          if (typeof anyRes.data === 'string') otpCode = otpCode ?? anyRes.data;
          else {
            if (anyRes.data.otp) otpCode = anyRes.data.otp;
            if (anyRes.data.authToken) authTokenFromRes = anyRes.data.authToken;
            if (anyRes.data.token) authTokenFromRes = authTokenFromRes ?? anyRes.data.token;
            if (anyRes.data.accessToken) authTokenFromRes = authTokenFromRes ?? anyRes.data.accessToken;
          }
        }

        if (!authTokenFromRes) {
          if (anyRes.authToken) authTokenFromRes = anyRes.authToken;
          if (anyRes.token) authTokenFromRes = authTokenFromRes ?? anyRes.token;
          if (anyRes.accessToken) authTokenFromRes = authTokenFromRes ?? anyRes.accessToken;
        }
      }

      if (authTokenFromRes) setAuthToken(authTokenFromRes, Boolean(formData.rememberMe));

      setOtpTimer(30);

      if (otpCode) {
        toast.success('Code resent', `OTP: ${otpCode}`);
      } else {
        toast.success('Code resent', 'A new verification code has been sent.');
      }
    } catch (error: any) {
      const msg = error?.message || error?.data?.message || 'Failed to resend';
      toast.error('Failed to resend', String(msg));
    } finally {
      setIsLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 5 }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -5 }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
        {/* Backdrop */}
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
        />

        {/* Modal */}
        <motion.div
          ref={modalRef}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2, type: "spring", damping: 25, stiffness: 500 }}
          className="relative bg-background/95 backdrop-blur-sm rounded-xl shadow-2xl border border-border w-full max-w-md max-h-[90vh] overflow-hidden z-10"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <img
                src="/logo/logo2.png"
                alt="NINja Map"
                className="h-8 object-contain"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)] scrollbar-thin authmodal-scroll">
            <div className="p-6">
              <AnimatePresence mode="wait">
                {mode === "login" && (
                  <motion.div
                    key="login"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-[#036A38] border-thin-green rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Shield className="h-8 w-8 text-white" />
                      </div>
                      <h2 id="modal-title" className="text-2xl font-bold font-display text-[#036A38] mb-2">
                        Welcome Back
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Sign in to continue your navigation journey
                      </p>
                    </div>

                    {errors.general && (
                      <Alert className="mb-6 border-destructive/50 bg-destructive/10">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <AlertDescription className="text-destructive">
                          {errors.general}
                        </AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <UnifiedInput
                          label="Email"
                          type="email"
                          value={formData.email}
                          onChange={(value) => handleInputChange("email", value)}
                          icon={Mail}
                          placeholder="your.email@example.com"
                          required
                          error={errors.email}
                          disabled={isLoading}
                        />

                        <UnifiedInput
                          label="Password"
                          variant="password"
                          value={formData.password}
                          onChange={(value) => handleInputChange("password", value)}
                          icon={Lock}
                          placeholder="Enter your password"
                          required
                          error={errors.password}
                          disabled={isLoading}
                        />

                        <div className="flex items-center justify-between">
                          <CustomCheckbox
                            checked={formData.rememberMe}
                            onChange={(checked) => handleInputChange("rememberMe", checked)}
                            label="Remember me"
                            size="sm"
                          />
                          <button
                            type="button"
                            onClick={() => setMode("forgot")}
                            className="text-sm text-[#036A38] hover:text-brand/80 transition-colors font-medium"
                          >
                            Forgot password?
                          </button>
                        </div>

                        <ActionButton
                          type="submit"
                          loading={isLoading}
                          fullWidth
                          className="bg-none bg-[#036A38] hover:opacity-90 focus:ring-[#036A38]/30"
                        >
                          {isLoading ? "Signing in..." : (
                            <>
                              Sign In
                              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                            </>
                          )}
                        </ActionButton>
                      </div>

                      <div className="text-center">
                        <span className="text-sm text-muted-foreground">
                          Don't have an account?{" "}
                          <button 
                            type="button"
                            onClick={() => setMode("signup")} 
                            className="text-[#036A38] hover:text-brand/80 transition-colors font-medium"
                          >
                            Sign up
                          </button>
                        </span>
                      </div>
                    </form>
                  </motion.div>
                )}

                {mode === "signup" && (
                  <motion.div
                    key="signup"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-[#036A38] border-thin-green  rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <h2 id="modal-title" className="text-2xl font-bold  font-display text-[#036A38] mb-2">
                        Create Account
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Join millions of Nigerian drivers using NINja Map
                      </p>
                    </div>

                    {errors.general && (
                      <Alert className="mb-6 border-destructive/50 bg-destructive/10">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <AlertDescription className="text-destructive">
                          {errors.general}
                        </AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <UnifiedInput
                            label="First Name"
                            value={formData.firstName}
                            onChange={(value) => handleInputChange("firstName", value)}
                            icon={User}
                            placeholder="First name"
                            required
                            error={errors.firstName}
                            disabled={isLoading}
                          />
                          <UnifiedInput
                            label="Last Name"
                            value={formData.lastName}
                            onChange={(value) => handleInputChange("lastName", value)}
                            icon={User}
                            placeholder="Last name"
                            required
                            error={errors.lastName}
                            disabled={isLoading}
                          />
                        </div>

                        <UnifiedInput
                          label="Email"
                          type="email"
                          value={formData.email}
                          onChange={(value) => handleInputChange("email", value)}
                          icon={Mail}
                          placeholder="your.email@example.com"
                          required
                          error={errors.email}
                          disabled={isLoading}
                        />

                        <UnifiedInput
                          label="Phone Number"
                          type="tel"
                          value={formData.phone}
                          onChange={(value) => handleInputChange("phone", value)}
                          icon={Phone}
                          placeholder="+234 801 234 5678"
                          required
                          error={errors.phone}
                          disabled={isLoading}
                        />

                        <UnifiedInput
                          label="Password"
                          variant="password"
                          value={formData.password}
                          onChange={(value) => handleInputChange("password", value)}
                          icon={Lock}
                          placeholder="Create a strong password"
                          required
                          error={errors.password}
                          disabled={isLoading}
                        />

                        <UnifiedInput
                          label="Confirm Password"
                          variant="password"
                          value={formData.confirmPassword}
                          onChange={(value) => handleInputChange("confirmPassword", value)}
                          icon={Lock}
                          placeholder="Confirm your password"
                          required
                          error={errors.confirmPassword}
                          disabled={isLoading}
                        />

                        <div className="space-y-3">
                          <CustomCheckbox
                            checked={formData.acceptTerms}
                            onChange={(checked) => handleInputChange("acceptTerms", checked)}
                            size="sm"
                            className="items-start"
                            label={
                              <span className="text-muted-foreground leading-relaxed">
                                I agree to the{" "}
                                <a href="/terms" className="text-[#036A38] hover:text-brand/80 transition-colors" target="_blank" rel="noopener noreferrer">
                                  Terms of Service
                                </a>{" "}
                                and{" "}
                                <a href="/privacy" className="text-[#036A38] hover:text-brand/80 transition-colors" target="_blank" rel="noopener noreferrer">
                                  Privacy Policy
                                </a>
                              </span>
                            }
                          />
                        </div>

                        <ActionButton
                          type="submit"
                          loading={isLoading}
                          icon={Crown}
                          iconPosition="right"
                          fullWidth
                          className="bg-none bg-[#036A38] hover:opacity-90 focus:ring-[#036A38]/30"
                        >
                          {isLoading ? "Creating account..." : "Create Account"}
                        </ActionButton>
                      </div>

                      <div className="text-center">
                        <span className="text-sm text-muted-foreground">
                          Already have an account?{" "}
                          <button 
                            type="button"
                            onClick={() => setMode("login")} 
                            className="text-[#036A38] hover:text-brand/80 transition-colors font-medium"
                          >
                            Sign in
                          </button>
                        </span>
                      </div>
                    </form>
                  </motion.div>
                )}

                {mode === "forgot" && (
                  <motion.div
                    key="forgot"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#036A38] to-[#FFB81C] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Mail className="h-8 w-8 text-white" />
                      </div>
                      <h2 id="modal-title" className="text-2xl font-bold font-display text-brand mb-2">
                        Reset Password
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Enter your email and we'll send you a verification code
                      </p>
                    </div>

                    {errors.general && (
                      <Alert className="mb-6 border-destructive/50 bg-destructive/10">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <AlertDescription className="text-destructive">
                          {errors.general}
                        </AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <UnifiedInput
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(value) => handleInputChange("email", value)}
                        icon={Mail}
                        placeholder="your.email@example.com"
                        required
                        error={errors.email}
                        disabled={isLoading}
                      />

                      <ActionButton
                        type="submit"
                        loading={isLoading}
                        icon={Mail}
                        iconPosition="right"
                        fullWidth
                        className="bg-none bg-[#036A38] hover:opacity-90 focus:ring-[#036A38]/30"
                      >
                        {isLoading ? "Sending..." : "Send Verification Code"}
                      </ActionButton>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setMode("login")}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand transition-colors mx-auto"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to sign in
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {mode === "otp" && (
                  <motion.div
                    key="otp"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#036A38] to-[#FFB81C] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Smartphone className="h-8 w-8 text-white" />
                      </div>
                      <h2 id="modal-title" className="text-2xl font-bold font-display text-brand mb-2">
                        Verify Code
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        We've sent a 6-digit code to {formData.email || formData.phone}
                      </p>
                    </div>

                    {errors.general && (
                      <Alert className="mb-6 border-destructive/50 bg-destructive/10">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <AlertDescription className="text-destructive">
                          {errors.general}
                        </AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <UnifiedInput
                        label="Enter Verification Code"
                        value={formData.otp}
                        onChange={(value) => handleInputChange("otp", value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        required
                        error={errors.otp}
                        disabled={isLoading}
                        helpText="Enter the 6-digit code sent to your email/phone"
                        className="text-center text-xl font-bold tracking-widest"
                      />

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                          Didn't receive the code?
                        </p>
                        <button 
                          type="button"
                          onClick={resendOtp}
                          disabled={otpTimer > 0 || isLoading}
                          className="text-sm text-brand hover:text-brand/80 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {otpTimer > 0 ? `Resend code in ${otpTimer}s` : "Resend code"}
                        </button>
                      </div>

                      <ActionButton
                        type="submit"
                        loading={isLoading}
                        disabled={formData.otp.length !== 6}
                        icon={Check}
                        fullWidth
                        className="bg-none bg-[#036A38] hover:opacity-90 focus:ring-[#036A38]/30"
                      >
                        {isLoading ? "Verifying..." : "Verify & Continue"}
                      </ActionButton>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setMode(otpOrigin ?? initialMode ?? 'login')}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand transition-colors mx-auto"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {mode === "reset" && (
                  <motion.div
                    key="reset"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#036A38] to-[#FFB81C] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Lock className="h-8 w-8 text-white" />
                      </div>
                      <h2 id="modal-title" className="text-2xl font-bold font-display text-brand mb-2">
                        Create New Password
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Choose a strong password for your account
                      </p>
                    </div>

                    {errors.general && (
                      <Alert className="mb-6 border-destructive/50 bg-destructive/10">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <AlertDescription className="text-destructive">
                          {errors.general}
                        </AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <UnifiedInput
                          label="New Password"
                          variant="password"
                          value={formData.newPassword}
                          onChange={(value) => handleInputChange("newPassword", value)}
                          icon={Lock}
                          placeholder="Enter new password"
                          required
                          error={errors.newPassword}
                          disabled={isLoading}
                        />

                        <UnifiedInput
                          label="Confirm New Password"
                          variant="password"
                          value={formData.confirmNewPassword}
                          onChange={(value) => handleInputChange("confirmNewPassword", value)}
                          icon={Lock}
                          placeholder="Confirm new password"
                          required
                          error={errors.confirmNewPassword}
                          disabled={isLoading}
                        />
                      </div>

                      <ActionButton
                        type="submit"
                        loading={isLoading}
                        icon={Check}
                        iconPosition="right"
                        fullWidth
                        className="bg-none bg-[#036A38] hover:opacity-90 focus:ring-[#036A38]/30"
                      >
                        {isLoading ? "Updating..." : "Update Password"}
                      </ActionButton>
                    </form>
                  </motion.div>
                )}

                {mode === "success" && (
                  <motion.div
                    key="success"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <div className="text-center">
                      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-[#036A38] dark:text-[#036A38]" />
                      </div>
                      <h2 id="modal-title" className="text-2xl font-bold font-display text-brand mb-4">
                        {initialMode === "signup" ? "Welcome to NINja Map!" : "Password Updated!"}
                      </h2>
                      <p className="text-muted-foreground mb-8 leading-relaxed">
                        {initialMode === "signup" 
                          ? "Your account has been created successfully. You can now start navigating Nigeria like a local!"
                          : "Your password has been updated successfully. You can now sign in with your new password."
                        }
                      </p>

                      <div className="space-y-4">
                        <ActionButton
                          onClick={onClose}
                          fullWidth
                          className="bg-none bg-[#036A38] hover:opacity-90 focus:ring-[#036A38]/30"
                        >
                          {initialMode === "signup" ? "Start Navigating" : "Sign In Now"}
                          <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                        </ActionButton>

                        {initialMode !== "signup" && (
                          <Button 
                            variant="outline"
                            onClick={() => setMode("login")}
                            className="w-full"
                          >
                            Back to Sign In
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-4 border-t border-border bg-muted/30">
              <div className="text-center text-xs text-muted-foreground space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-3 w-3 text-[#036A38]" />
                  <span>Secured by 256-bit SSL encryption</span>
                </div>
                <p>
                  Protected by Nigerian Data Protection Regulation (NDPR)
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
