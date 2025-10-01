import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Route, Users, Shield, Zap } from "lucide-react";

interface LoaderProps {
  type?: "intro" | "page";
  isVisible: boolean;
  onComplete?: () => void;
}

export function IntroLoader({ isVisible, onComplete }: { isVisible: boolean; onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    { icon: MapPin, text: "Loading Maps", color: "from-blue-500 to-purple-600" },
    { icon: Navigation, text: "Initializing GPS", color: "from-purple-500 to-pink-600" },
    { icon: Route, text: "Optimizing Routes", color: "from-pink-500 to-red-600" },
    { icon: Users, text: "Connecting Community", color: "from-orange-500 to-yellow-600" },
    { icon: Shield, text: "Securing Data", color: "from-green-500 to-blue-600" },
    { icon: Zap, text: "Ready to Navigate", color: "from-brand to-gradient-to" }
  ];

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setTimeout(() => onComplete?.(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-background flex items-center justify-center overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="hero-pattern w-full h-full" />
          </div>

          {/* Overlay to ensure full coverage */}
          <div className="absolute inset-0 bg-background" />

          {/* Main Content */}
          <div className="relative z-10 text-center max-w-md mx-auto px-6">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, type: "spring", bounce: 0.3 }}
              className="mb-8"
            >
              <div className="w-24 h-24 mx-auto bg-gradient-brand rounded-2xl shadow-2xl flex items-center justify-center relative">
                <MapPin className="h-12 w-12 text-white" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-transparent border-t-white/30 rounded-2xl"
                />
              </div>
            </motion.div>

            {/* Brand Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-auto-3xl font-bold font-display text-shimmer mb-2"
            >
              NINja Map
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-auto-base text-muted-foreground mb-12"
            >
              Nigeria's Premier Navigation Platform
            </motion.p>

            {/* Loading Steps */}
            <div className="space-y-4 mb-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: index <= currentStep ? 1 : 0.3,
                    x: 0,
                    scale: index === currentStep ? 1.05 : 1
                  }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                    index <= currentStep ? 'glass-strong' : 'bg-muted/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                    <step.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className={`text-auto-sm font-medium transition-colors ${
                    index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.text}
                  </span>
                  {index <= currentStep && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <motion.svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4 text-white"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.path
                          d="M5 13l4 4L19 7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </motion.svg>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-brand rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <div className="text-center mt-3">
                <span className="text-auto-sm font-medium text-brand">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-brand/30 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PageLoader({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9998] bg-background flex items-center justify-center overflow-hidden"
        >
          {/* Overlay to ensure full coverage */}
          <div className="absolute inset-0 bg-background" />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 bg-card p-8 rounded-2xl shadow-2xl border border-border/40 text-center glass-strong"
          >
            {/* Spinning Logo */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-brand rounded-xl flex items-center justify-center shadow-lg"
            >
              <MapPin className="h-8 w-8 text-white" />
            </motion.div>

            <h3 className="text-auto-base font-semibold text-brand mb-2">Loading...</h3>
            <p className="text-auto-sm text-muted-foreground">Please wait a moment</p>

            {/* Pulse Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-brand rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Loader({ type = "page", isVisible, onComplete }: LoaderProps) {
  return <PageLoader isVisible={isVisible} />;
}
