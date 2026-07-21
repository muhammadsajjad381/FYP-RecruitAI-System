import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// फर्ज करें aapka user data localStorage ya state mein hai
export default function ProtectedRoute({ isAdminRoute }) {
  const user = JSON.parse(localStorage.getItem("user")); // User info
  const token = localStorage.getItem("token"); // Auth token

  // Agar user logged in nahi hai
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // AGAR ADMIN ROUTE HAI: Aur user admin nahi hai, to 404 dikhao
  if (isAdminRoute && user?.role !== "admin") {
    return <Navigate to="/404" replace />;
  }

  return <Outlet />;
}