
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import LogoutButton from "@/components/auth/LogoutButton";
import { UserCircle } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      toast.success(`Welcome to Blue Admin SSO, ${user?.first_name || 'User'}`);
    }, 500);

    return () => clearTimeout(timer);
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-t-admin-500 border-r-admin-300 border-b-admin-200 border-l-admin-400 animate-spin"></div>
          <h2 className="mt-4 text-lg font-semibold text-gray-700">Loading Blue Admin...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-4 flex justify-end items-center border-b bg-white">
          <div className="flex items-center space-x-2">
            <div className="text-right mr-2">
              <div className="text-sm font-medium">{user?.first_name} {user?.last_name}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
            <div className="h-8 w-8 bg-admin-100 rounded-full flex items-center justify-center text-admin-600">
              <UserCircle size={24} />
            </div>
            <LogoutButton />
          </div>
        </div>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
