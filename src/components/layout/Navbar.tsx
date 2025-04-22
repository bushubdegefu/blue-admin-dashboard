
import { UserProfileMenu } from "./UserProfileMenu";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface NavbarProps {
  onMenuToggle: () => void;
}

const Navbar = ({ onMenuToggle }: NavbarProps) => {
  return (
    <header className="bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between px-4 h-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        
        <div className="flex-1" />
        
        <div className="flex items-center space-x-4">
          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
