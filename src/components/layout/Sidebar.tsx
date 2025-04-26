
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Users,
  UserCircle,
  Layers,
  FolderKey,
  Key,
  LayoutDashboard,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
  collapsed?: boolean;
}

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  href, 
  active = false,
  collapsed = false
}: SidebarItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center py-3 px-4 text-sm rounded-md group transition-colors",
        active 
          ? "bg-admin-600 text-white font-medium" 
          : "text-gray-600 hover:bg-admin-50"
      )}
    >
      <Icon className={cn("h-5 w-5", active ? "text-white" : "text-gray-500")} />
      {!collapsed && <span className="ml-3">{label}</span>}
      {active && !collapsed && (
        <ChevronRight className="ml-auto h-4 w-4 text-white" />
      )}
    </Link>
  );
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navigationItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: UserCircle, label: "Groups", href: "/admin/groups" },
    { icon: Key, label: "Scopes", href: "/admin/scopes" },
    { icon: FolderKey, label: "Resources", href: "/admin/resources" },
    { icon: Layers, label: "Apps", href: "/admin/apps" },
  ];

  return (
    <div
      className={cn(
        "border-r border-gray-200 bg-white transition-all duration-300 h-screen flex flex-col",
        collapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      <div className="flex items-center h-16 border-b border-gray-200 px-4">
        {!collapsed && (
          <div className="flex flex-1 items-center">
            <div className="h-8 w-8 rounded-full bg-admin-500 flex items-center justify-center">
              <span className="text-white font-bold">BA</span>
            </div>
            <span className="ml-3 font-semibold text-gray-800">Blue Admin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-gray-500"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-200">
        {!collapsed && (
          <div className="text-xs text-gray-500">
            <div>Blue Admin SSO</div>
            <div>v1.0.0</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
