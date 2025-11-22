import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  if (!allowedRoles.includes(user.role)) {
    switch (user.role) {
      case "farmer": return <Navigate to="/farmer-dashboard" replace />;
      case "agent": return <Navigate to="/agent-dashboard" replace />;
      case "lab": return <Navigate to="/lab-dashboard" replace />;
      case "manufacturer": return <Navigate to="/manufacturer-dashboard" replace />;
      case "admin": return <Navigate to="/admin-dashboard" replace />;
      default: return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
