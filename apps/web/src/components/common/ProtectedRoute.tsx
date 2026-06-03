import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Route guard for account pages. Renders the protected content only when a
 * user is authenticated; otherwise redirects to /login, remembering where the
 * user was headed so login can send them back.
 *
 * Note: this is a UX-level guard. Real enforcement is server-side — every
 * protected API call carries the JWT and is verified by the middleware authGuard.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
