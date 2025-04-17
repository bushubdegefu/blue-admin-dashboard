
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out successfully");
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleLogout}
      className="text-gray-600 hover:text-gray-900"
    >
      <LogOut size={18} className="mr-1" />
      <span>Logout</span>
    </Button>
  );
};

export default LogoutButton;
