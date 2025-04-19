
import { useState, Suspense } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";

const MainLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
      />
      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-8 px-4 md:px-6">
          <ErrorBoundary>
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
};

export default MainLayout;
