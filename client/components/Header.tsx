import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Sun, Moon, Navigation, User } from "lucide-react";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import AuthModals from "./AuthModals";
import { refreshAuthToken, setAuthToken, hasAuthCookies } from "@/lib/http";
import { useNavigate } from 'react-router-dom';
import { useLoggedInUser } from "@/hooks/use-logged-in-user";

interface HeaderProps {
  showBackButton?: boolean;
}

export default function Header({ showBackButton = true }: HeaderProps) {
  const { isOpen, mode, openLogin, openSignup, closeModal } = useAuthModal();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, isDark } = useTheme();
  const { user } = useLoggedInUser();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(() => {
    try {
      return hasAuthCookies();
    } catch {
      return false;
    }
  });

  useEffect(() => {
    setMounted(true);

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

  const handleLogout = () => {
    try {
      setAuthToken(null);
      // remove cookies
      document.cookie = 'accessToken=; Path=/; Max-Age=0;';
      document.cookie = 'refreshToken=; Path=/; Max-Age=0;';
      setUserLoggedIn(false);
      setShowLogoutModal(false);
      // navigate to home without reloading
      navigate('/');
    } catch (e) {
      /* ignore */
    }
  };

  const toggleTheme = () => {
    // Toggle between light and dark (keep it simple)
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="container py-3">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity overflow-visible h-8 relative" aria-label="NINja Map">
            <img
              src="/logo/logo2.png"
              alt="NINja Map"
              loading="eager"
              decoding="sync"
              className="w-[180px] h-[56px] object-contain -ml-[10px] md:w-[246px] md:h-[76px] md:-ml-[20px] relative"
              // style={{ top: '50%', transform: 'translateY(calc(-50% + 20px))' }}
            />
          </Link>

          {/* Navigation and Controls */}
          <div className="flex items-center gap-4">
            {/* Map Link - Primary CTA */}
            <Link
              to="/map"
              className="flex items-center gap-2 text-auto-sm font-medium bg-[#036A38] hover:bg-[#025C31] text-white px-6 py-2 rounded-lg transition-all shadow-md"
            >
              <Navigation className="h-4 w-4" />
              Open Map
            </Link>

            {/* Auth Buttons - Compact / Profile */}
            <div className="hidden md:flex items-center gap-2">
              {userLoggedIn ? (
                <div className="flex items-center gap-2">
                  <Link to="/profile" className="flex items-center gap-2 text-auto-sm font-medium text-foreground px-3 py-2 rounded-lg hover:bg-muted/50">
                    {user?.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt="Profile" 
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span>{user?.firstName || 'Profile'}</span>
                  </Link>
                  <button
                    onClick={() => setShowLogoutModal(true)}
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

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed top-60 inset-0 z-50 flex items-end mb-30  justify-end p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-card border border-border/40 rounded-2xl p-6 shadow-2xl"
          >
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Logout
            </h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#036A38] hover:bg-[#025C31] text-white"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </header>
  );
}
