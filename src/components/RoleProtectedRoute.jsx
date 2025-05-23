import React from "react";
import { Navigate } from "react-router-dom";

const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const role = localStorage.getItem("userRole");

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
