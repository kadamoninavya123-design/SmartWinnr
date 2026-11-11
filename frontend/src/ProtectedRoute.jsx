
import { Navigate } from "react-router-dom";

function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    if (user.role === "owner") {
      return <Navigate to="/owner" replace />;
    }

    return <Navigate to="/customer" replace />;
  }

  return children;
}

export default ProtectedRoute;
