
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ErrorBoundary } from "./ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { UserProfileMenu } from "./UserProfileMenu";

const MainLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      <Sidebar
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
      />
      <div className="flex flex-col flex-1">
        <header className="border-b h-14 flex items-center justify-end px-6 bg-white">
          <div className="flex items-center gap-4">
            <UserProfileMenu />
          </div>
        </header>
        <main className="flex-1 p-6 bg-gray-50">
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default MainLayout;
