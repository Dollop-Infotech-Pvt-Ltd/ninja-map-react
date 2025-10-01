import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { MapPin, Sun, Moon, Navigation, User } from "lucide-react";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import AuthModals from "./AuthModals";
import { refreshAuthToken, setAuthToken, hasAuthCookies } from "@/lib/http";
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  showBackButton?: boolean;
}

export default function Header({ showBackButton = true }: HeaderProps) {
  const { isOpen, mode, openLogin, openSignup, closeModal } = useAuthModal();
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(() => {
    try {
      return hasAuthCookies();
    } catch {
      return false;
    }
  });

  useEffect(() => {
    setMounted(true);
    const theme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    setIsDark(true);
    document.documentElement.classList.add("dark");

    const checkAuth = async () => {
      // Show profile only when both accessToken and refreshToken cookies exist
      if (hasAuthCookies()) {
        setUserLoggedIn(true);
      }
      try {
        const refreshed = await refreshAuthToken();
        if (refreshed?.ok) {
          // After refresh, re-check cookies as the source of truth
          setUserLoggedIn(hasAuthCookies());
          return;
        }
      } catch (e) {
        /* ignore */
      }
      // Ensure logged out if cookies are not present
      if (!hasAuthCookies()) {
        setUserLoggedIn(false);
      }
    };

    checkAuth();

    const handler = () => {
      try {
        setUserLoggedIn(hasAuthCookies());
      } catch {
        setUserLoggedIn(false);
      }
    };
    window.addEventListener('storage', handler);
    window.addEventListener('authChange', handler as EventListener);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('authChange', handler as EventListener);
    };
  }, []);

  const navigate = useNavigate();

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };




  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="container py-3">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-white shadow-sm">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="text-auto-lg font-bold font-display text-brand">
              NINja Map
            </span>
          </Link>

          {/* Navigation and Controls */}
          <div className="flex items-center gap-4">
            {/* Map Link - Primary CTA */}
            <Link
              to="/map"
              className="flex items-center gap-2 text-auto-sm font-medium bg-gradient-brand text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all shadow-md"
            >
              <Navigation className="h-4 w-4" />
              Open Map
            </Link>

            {/* Auth Buttons - Compact / Profile */}
            <div className="hidden md:flex items-center gap-2">
              {userLoggedIn ? (
                <div className="flex items-center gap-2">
                  <Link to="/dashboard" className="flex items-center gap-2 text-auto-sm font-medium text-foreground px-3 py-2 rounded-lg hover:bg-muted/50">
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      // logout
                      try {
                        setAuthToken(null);
                        // remove cookies
                        document.cookie = 'accessToken=; Path=/; Max-Age=0;';
                        document.cookie = 'refreshToken=; Path=/; Max-Age=0;';
                        setUserLoggedIn(false);
                        // navigate to home without reloading
                        navigate('/');
                      } catch (e) {
                        /* ignore */
                      }
                    }}
                    className="text-auto-sm font-medium border border-border text-foreground px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                    type="button"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openLogin();
                    }}
                    className="text-auto-sm font-medium text-muted-foreground hover:text-brand transition-colors px-3 py-2 rounded-lg hover:bg-muted/50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                  >
                    Sign In
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openSignup();
                    }}
                    className="text-auto-sm font-medium border border-border text-foreground px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                  >
                    Sign Up
                  </motion.button>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 hover:bg-brand/10 transition-all duration-200 theme-transition"
            >
              <motion.div
                initial={false}
                animate={{ rotate: isDark ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {isDark ? (
                  <Sun className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                )}
              </motion.div>
            </Button>
          </div>
        </div>
      </div>

      {/* Auth Modals */}
      <AuthModals
        isOpen={isOpen}
        onClose={closeModal}
        initialMode={mode}
      />
    </header>
  );
}
