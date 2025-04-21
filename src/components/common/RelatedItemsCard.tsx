
import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, PlusCircle, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface RelatedItem {
  id: string;
  name: string;
  description?: string;
}

interface RelatedItemsCardProps {
  title: string;
  availableItems: RelatedItem[];
  attachedItems: RelatedItem[];
  entityType: string;
  emptyMessage?: string;
  onAddItems?: (id: string) => void;
  onRemoveItem?: (id: string) => void;
  canManage?: boolean;
}

export function RelatedItemsCard({
  title,
  availableItems,
  attachedItems,
  entityType,
  emptyMessage = "No items found",
  onAddItems,
  onRemoveItem,
  canManage = false,
}: RelatedItemsCardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);

  const filteredAttachedItems = attachedItems?.filter(item =>
    item?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (id: string) => {
    if (onAddItems) {
      onAddItems(id);
      setPopoverOpen(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">{title}</h3>
        {canManage && onAddItems && (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-xs"
              >
                <PlusCircle className="h-3 w-3" />
                Add {entityType}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-2">
              <Command>
                <CommandInput placeholder={`Search ${entityType.toLowerCase()}...`} />
                <CommandList className="max-h-[200px] overflow-auto">
                  <ScrollArea className="h-[200px]">
                    {availableItems.length > 0 ? (
                      availableItems.map((item) => (
                        <CommandItem
                          key={item.id}
                          onSelect={() => handleAdd(item.id)}
                          className="flex items-center cursor-pointer hover:bg-gray-100 p-2"
                        >
                          <div className="flex-1 truncate">
                            <div className="font-medium">{item.name}</div>
                            {item.description && (
                              <p className="text-xs text-gray-500 truncate mt-0.5">{item.description}</p>
                            )}
                          </div>
                        </CommandItem>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 px-2 py-4 text-center">
                        No {entityType.toLowerCase()}s available
                      </div>
                    )}
                  </ScrollArea>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="p-4">
        {attachedItems && attachedItems.length > 0 ? (
          <>
            <div className="mb-4 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder={`Search attached ${entityType.toLowerCase()}s...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="max-h-60 pr-2">
              <div className="space-y-2 overflow-y-auto">
                {filteredAttachedItems.length > 0 ? (
                  filteredAttachedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{item?.name}</div>
                        {item.description && (
                          <p className="text-xs text-gray-500 truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {canManage && onRemoveItem && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-400 hover:text-red-500 flex-shrink-0"
                          onClick={() => onRemoveItem(item.id)}
                          title={`Remove ${item?.name}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-sm text-gray-500">
                    No results match your search
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="mt-4 flex items-center justify-between border-t pt-3">
              <Badge variant="outline" className="text-xs text-gray-600">
                {attachedItems?.length} {entityType.toLowerCase()}
                {attachedItems?.length !== 1 && "s"}
              </Badge>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-sm text-gray-500">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}
