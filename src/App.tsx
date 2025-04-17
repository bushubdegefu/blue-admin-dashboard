
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
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
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
