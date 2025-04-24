
import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Item {
  id: string;
  name: string;
  [key: string]: any;
}

interface EntitySelectorProps {
  title: string;
  description: string;
  availableItems: Item[];
  selectedItems: Item[];
  isLoading: boolean;
  onSelect: (item: Item) => void;
  onRemove: (item: Item) => void;
  emptyMessage?: string;
}

export function EntitySelector({
  title,
  description,
  availableItems,
  selectedItems,
  isLoading,
  onSelect,
  onRemove,
  emptyMessage = "No items available"
}: EntitySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredAvailableItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredSelectedItems = selectedItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-2 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Available Items */}
          <div>
            <h4 className="text-sm font-medium mb-2">Available</h4>
            <Card className="border-gray-200">
              <ScrollArea className="h-64">
                <div className="p-2">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : filteredAvailableItems.length > 0 ? (
                    <ul className="space-y-1">
                      {filteredAvailableItems.map(item => (
                        <li key={item.id}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between text-left font-normal"
                            onClick={() => onSelect(item)}
                          >
                            <span className="truncate">{item.name}</span>
                            <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex justify-center items-center h-32 text-gray-400 text-sm">
                      {emptyMessage}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Selected Items */}
          <div>
            <h4 className="text-sm font-medium mb-2">Selected</h4>
            <Card className="border-gray-200">
              <ScrollArea className="h-64">
                <div className="p-2">
                  {filteredSelectedItems.length > 0 ? (
                    <ul className="space-y-1">
                      {filteredSelectedItems.map(item => (
                        <li key={item.id}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between text-left font-normal"
                            onClick={() => onRemove(item)}
                          >
                            <ChevronLeft className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{item.name}</span>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex justify-center items-center h-32 text-gray-400 text-sm">
                      No items selected
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="text-sm text-gray-500">
          {selectedItems.length} items selected
        </div>
      </CardFooter>
    </Card>
  );
}


export function EntitySelectorUser({
  title,
  description,
  availableItems,
  selectedItems,
  isLoading,
  onSelect,
  onRemove,
  emptyMessage = "No items available"
}: EntitySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredAvailableItems = availableItems.filter(item =>
    item?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredSelectedItems = selectedItems.filter(item =>
    item?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-2 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Available Items */}
          <div>
            <h4 className="text-sm font-medium mb-2">Available</h4>
            <Card className="border-gray-200">
              <ScrollArea className="h-64">
                <div className="p-2">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : filteredAvailableItems.length > 0 ? (
                    <ul className="space-y-1">
                      {filteredAvailableItems.map(item => (
                        <li key={item.id}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between text-left font-normal"
                            onClick={() => onSelect(item)}
                          >
                            <span className="truncate">{item?.username}</span>
                            <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex justify-center items-center h-32 text-gray-400 text-sm">
                      {emptyMessage}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Selected Items */}
          <div>
            <h4 className="text-sm font-medium mb-2">Selected</h4>
            <Card className="border-gray-200">
              <ScrollArea className="h-64">
                <div className="p-2">
                  {filteredSelectedItems.length > 0 ? (
                    <ul className="space-y-1">
                      {filteredSelectedItems?.map(item => (
                        <li key={item.id}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between text-left font-normal"
                            onClick={() => onRemove(item)}
                          >
                            <ChevronLeft className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{item?.username}</span>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex justify-center items-center h-32 text-gray-400 text-sm">
                      No items selected
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="text-sm text-gray-500">
          {selectedItems.length} items selected
        </div>
      </CardFooter>
    </Card>
  );
}

