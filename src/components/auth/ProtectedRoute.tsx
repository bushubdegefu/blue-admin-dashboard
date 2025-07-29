
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-t-admin-500 border-r-admin-300 border-b-admin-200 border-l-admin-400 animate-spin"></div>
          <h2 className="mt-4 text-lg font-semibold text-gray-700">Authenticating...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
