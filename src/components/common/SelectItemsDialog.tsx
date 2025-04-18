
import { useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface SelectableItem {
  id: string;
  name: string;
  description?: string;
  selected?: boolean;
}

interface SelectItemsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  items: SelectableItem[];
  onSelect: (items: string[]) => void;
  isLoading?: boolean;
}

export function SelectItemsDialog({
  isOpen,
  onClose,
  title,
  description,
  items,
  onSelect,
  isLoading = false,
}: SelectItemsDialogProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleItem = (id: string) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(id)) {
      newSelectedItems.delete(id);
    } else {
      newSelectedItems.add(id);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleConfirm = () => {
    onSelect(Array.from(selectedItems));
    onClose();
  };

  const handleCancel = () => {
    setSelectedItems(new Set());
    setSearchTerm('');
    onClose();
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <ScrollArea className="h-72 rounded-md border">
            {filteredItems.length > 0 ? (
              <div className="space-y-1 p-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center space-x-2 rounded-md p-2 cursor-pointer",
                      selectedItems.has(item.id)
                        ? "bg-admin-50 border-admin-200 border"
                        : "hover:bg-gray-100"
                    )}
                    onClick={() => handleToggleItem(item.id)}
                  >
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-md border",
                        selectedItems.has(item.id)
                          ? "border-admin-500 bg-admin-500 text-white"
                          : "border-gray-300"
                      )}
                    >
                      {selectedItems.has(item.id) && <Check className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500 truncate">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                No items match your search
              </div>
            )}
          </ScrollArea>
          <div className="text-sm text-gray-500">
            Selected {selectedItems.size} of {items.length} items
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            <Check className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
