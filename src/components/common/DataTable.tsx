
import { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  PaginationState,
  getFilteredRowModel,
  ColumnFiltersState,
  useReactTable
} from "@tanstack/react-table";
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  X,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterOption } from "@/types";
import { cn } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterOptions?: FilterOption[];
  searchPlaceholder?: string;
  isLoading?: boolean;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onFilterChange?: (filters: any) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterOptions = [],
  searchPlaceholder = "Search...",
  isLoading = false,
  pagination,
  onPageChange,
  onPageSizeChange,
  onFilterChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [localPagination, setLocalPagination] = useState<PaginationState>({
    pageIndex: pagination?.pageIndex ?? 0,
    pageSize: pagination?.pageSize ?? 10,
  });
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  
  // Use debounce for search to avoid too many API calls
  const debouncedSearchTerm = useDebounce(globalFilter, 500);
  
  // Effect to call onFilterChange when debounced search term changes
  useEffect(() => {
    if (onFilterChange) {
      const newFilters = { ...activeFilters };
      if (debouncedSearchTerm) {
        newFilters._search = debouncedSearchTerm;
      } else {
        delete newFilters._search;
      }
      onFilterChange(newFilters);
    }
  }, [debouncedSearchTerm, activeFilters, onFilterChange]);

  // Update local pagination when external pagination changes
  useEffect(() => {
    if (pagination) {
      setLocalPagination({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      });
    }
  }, [pagination]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    manualPagination: !!onPageChange, // If onPageChange is provided, we're using external pagination
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' 
        ? updater(localPagination)
        : updater;
      
      setLocalPagination(newPagination);
      
      // Call external handlers if provided
      if (onPageChange && newPagination.pageIndex !== localPagination.pageIndex) {
        onPageChange(newPagination.pageIndex + 1); // Convert to 1-based for API
      }
      
      if (onPageSizeChange && newPagination.pageSize !== localPagination.pageSize) {
        onPageSizeChange(newPagination.pageSize);
      }
    },
    state: {
      sorting,
      globalFilter,
      columnFilters,
      pagination: localPagination,
    },
    pageCount: pagination?.pageCount ?? Math.ceil(data.length / localPagination.pageSize),
  });

  const handleFilterChange = (field: string, value: string) => {
    if (!value) {
      const newFilters = { ...activeFilters };
      delete newFilters[field];
      setActiveFilters(newFilters);
      table.getColumn(field)?.setFilterValue(undefined);
    } else {
      setActiveFilters({ ...activeFilters, [field]: value });
      table.getColumn(field)?.setFilterValue(value);
    }

    // Call external filter handler if provided
    if (onFilterChange) {
      const newFilters = { ...activeFilters };
      if (!value) {
        delete newFilters[field];
      } else {
        newFilters[field] = value;
      }
      onFilterChange(newFilters);
    }
  };

  const clearFilter = (field: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[field];
    setActiveFilters(newFilters);
    table.getColumn(field)?.setFilterValue(undefined);
    
    // Call external filter handler if provided
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    table.resetColumnFilters();
    setGlobalFilter("");
    
    // Call external filter handler if provided
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  const handleGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGlobalFilter(value);
    // onFilterChange is called by the debounce effect
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0 || globalFilter;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={handleGlobalFilterChange}
            className="pl-9"
          />
          {globalFilter && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => {
                setGlobalFilter("");
                if (onFilterChange) {
                  const newFilters = { ...activeFilters };
                  delete newFilters._search;
                  onFilterChange(newFilters);
                }
              }}
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>
        {filterOptions.length > 0 && (
          <Select 
            onValueChange={(value) => {
              if (!value) return;
              const [field, filterValue] = value.split('::');
              handleFilterChange(field, filterValue);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                option.type === 'select' && option.options ? (
                  option.options.map((opt) => (
                    <SelectItem 
                      key={`${option.field}::${opt.value}`} 
                      value={`${option.field}::${opt.value}`}
                    >
                      {option.label}: {opt.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem 
                    key={option.field} 
                    value={option.field}
                  >
                    {option.label}
                  </SelectItem>
                )
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <div className="text-sm font-medium text-gray-500">Active filters:</div>
          {globalFilter && (
            <div className="px-3 py-1 text-xs rounded-full bg-admin-100 text-admin-800 flex items-center">
              <span>Search: {globalFilter}</span>
              <button onClick={() => {
                setGlobalFilter("");
                if (onFilterChange) {
                  const newFilters = { ...activeFilters };
                  delete newFilters._search;
                  onFilterChange(newFilters);
                }
              }} className="ml-2">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {Object.entries(activeFilters).map(([field, value]) => (
            <div 
              key={field} 
              className="px-3 py-1 text-xs rounded-full bg-admin-100 text-admin-800 flex items-center"
            >
              <span>
                {filterOptions.find(f => f.field === field)?.label || field}: {value}
              </span>
              <button onClick={() => clearFilter(field)} className="ml-2">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-xs text-gray-500"
          >
            Clear all
          </Button>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden bg-white">
        {isLoading ? (
          <div className="w-full h-48 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-admin-600" />
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full data-table">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="whitespace-nowrap">
                        {header.isPlaceholder ? null : (
                          <div
                            className={cn(
                              "flex items-center gap-1",
                              header.column.getCanSort() && "cursor-pointer select-none"
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: <ChevronUp className="ml-1 h-4 w-4" />,
                              desc: <ChevronDown className="ml-1 h-4 w-4" />,
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="py-6 text-center text-gray-500">
                      No results found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
