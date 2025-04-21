
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/auth/LoginPage";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";

// Users
import UsersPage from "./pages/users/UsersPage";
import UserDetailsPage from "./pages/users/UserDetailsPage";
import NewUserPage from "./pages/users/NewUserPage";

// Groups
import GroupsPage from "./pages/groups/GroupsPage";
import GroupDetailsPage from "./pages/groups/GroupDetailsPage";
import NewGroupPage from "./pages/groups/NewGroupPage";

// Scopes
import ScopesPage from "./pages/scopes/ScopesPage";
import ScopeDetailsPage from "./pages/scopes/ScopeDetailsPage";
import NewScopePage from "./pages/scopes/NewScopePage";

// Resources
import ResourcesPage from "./pages/resources/ResourcesPage";
import NewResourcePage from "./pages/resources/NewResourcePage";

// Apps
import AppsPage from "./pages/apps/AppsPage";
import NewAppPage from "./pages/apps/NewAppPage";

// Create a new client with updated default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Users Routes */}
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/:id" element={<UserDetailsPage />} />
                <Route path="/users/new" element={<NewUserPage />} />
                
                {/* Groups Routes */}
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/groups/:id" element={<GroupDetailsPage />} />
                <Route path="/groups/new" element={<NewGroupPage />} />
                
                {/* Scopes Routes */}
                <Route path="/scopes" element={<ScopesPage />} />
                <Route path="/scopes/:id" element={<ScopeDetailsPage />} />
                <Route path="/scopes/new" element={<NewScopePage />} />
                
                {/* Resources Routes */}
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/resources/new" element={<NewResourcePage />} />
                
                {/* Apps Routes */}
                <Route path="/apps" element={<AppsPage />} />
                <Route path="/apps/new" element={<NewAppPage />} />
              </Route>
            </Route>
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
