import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getStoredAuthToken } from '@/lib/http';

export default function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const token = getStoredAuthToken();
  const location = useLocation();

  if (!token) {
    // redirect to home / sign-in and preserve intended location
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
