
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={logout}
      className="text-gray-600 hover:text-gray-900"
    >
      <LogOut size={18} className="mr-1" />
      <span>Logout</span>
    </Button>
  );
};

export default LogoutButton;
