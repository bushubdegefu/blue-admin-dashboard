
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FilterCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  onApply?: () => void;
  onReset?: () => void;
}

export function FilterCard({
  title = "Filters",
  description = "Filter results by various criteria",
  children,
  isOpen = false,
  onToggle,
  onApply,
  onReset
}: FilterCardProps) {
  const [open, setOpen] = useState(isOpen);

  const handleToggle = (newState: boolean) => {
    setOpen(newState);
    if (onToggle) onToggle(newState);
  };

  return (
    <Card className="mb-4 border-gray-200 shadow-sm bg-white">
      <Collapsible open={open} onOpenChange={handleToggle}>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 bg-gray-50/50">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {description}
            </CardDescription>
          </div>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-gray-100"
            >
              {open ? <X size={18} /> : <Filter size={18} />}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="py-4 space-y-4">
            {children}
          </CardContent>
          
          {(onApply || onReset) && (
            <CardFooter className="flex justify-end space-x-2 pt-2 pb-4 border-t bg-gray-50">
              {onReset && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={onReset}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Reset
                </Button>
              )}
              {onApply && (
                <Button 
                  type="button"
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                  onClick={onApply}
                >
                  Apply Filters
                </Button>
              )}
            </CardFooter>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
