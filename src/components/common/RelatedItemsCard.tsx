
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, PlusCircle, X } from "lucide-react";
import { Link } from "react-router-dom";

export interface RelatedItem {
  id: string;
  name: string;
  description?: string;
  link?: string;
}

interface RelatedItemsCardProps {
  title: string;
  items: RelatedItem[];
  entityType: string;
  emptyMessage?: string;
  onAddItems?: () => void;
  onRemoveItem?: (id: string) => void;
  canManage?: boolean;
}

export function RelatedItemsCard({
  title,
  items,
  entityType,
  emptyMessage = "No items found",
  onAddItems,
  onRemoveItem,
  canManage = false,
}: RelatedItemsCardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          {canManage && onAddItems && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 text-xs"
              onClick={onAddItems}
            >
              <PlusCircle className="h-3 w-3" />
              Add {entityType}
            </Button>
          )}
        </div>
      </div>
      <div className="p-4">
        {items.length > 0 ? (
          <>
            <div className="mb-4 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder={`Search ${entityType.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <div className="flex-1">
                      {item.link ? (
                        <Link 
                          to={item.link} 
                          className="font-medium text-admin-600 hover:text-admin-800"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <span className="font-medium">{item.name}</span>
                      )}
                      {item.description && (
                        <p className="text-xs text-gray-500 truncate">{item.description}</p>
                      )}
                    </div>
                    {canManage && onRemoveItem && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-red-500"
                        onClick={() => onRemoveItem(item.id)}
                        title={`Remove ${item.name}`}
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
            <div className="mt-2 flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {items.length} {entityType.toLowerCase()}
                {items.length !== 1 && "s"}
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
