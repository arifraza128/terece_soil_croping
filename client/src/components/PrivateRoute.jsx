import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute() {
  const { token, loading } = useAuth();
  if (loading) {
    return <div className="flex items-center justify-center h-screen text-green-700">Loading...</div>;
  }
  return token ? <Outlet /> : <Navigate to="/login" />;
}
