import { useState, useEffect } from "react";
import { LoggedInUser } from "@shared/api";
import { getLoggedInUser } from "../lib/userApi";
import { getStoredAuthToken } from "../lib/http";

interface UseLoggedInUserReturn {
  user: LoggedInUser | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage logged-in user state
 * Automatically fetches user data when auth token is available
 */
export function useLoggedInUser(): UseLoggedInUserReturn {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    const token = getStoredAuthToken();
    if (!token) {
      setUser(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userData = await getLoggedInUser();
      setUser(userData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch user data");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    // Listen for auth changes
    const handleAuthChange = () => {
      fetchUser();
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  return {
    user,
    loading,
    error,
    refetch: fetchUser
  };
}