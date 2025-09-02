import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import { Loader } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, status } = useAppSelector((state) => state.user);
  const location = useLocation();

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  return <Navigate to="/signin" state={{ from: location }} replace />;
};

export default ProtectedRoute;