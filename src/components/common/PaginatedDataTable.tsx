
import { useState, useEffect } from "react";
import { DataTable } from "./DataTable";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PaginatedDataTableProps {
  columns: any[];
  data: any[];
  isLoading?: boolean;
  filterOptions?: any[];
  searchPlaceholder?: string;
  pageCount?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onFilterChange?: (filters: any) => void;
  currentPage?: number;
  pageSize?: number;
}

export function PaginatedDataTable({
  columns,
  data,
  isLoading = false,
  filterOptions = [],
  searchPlaceholder = "Search...",
  pageCount = 1,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  onFilterChange,
  currentPage = 1,
  pageSize = 10,
}: PaginatedDataTableProps) {
  const [pagination, setPagination] = useState({
    pageIndex: currentPage - 1,
    pageSize: pageSize,
    pageCount: pageCount,
    total: totalItems,
  });

  // Update internal pagination when external props change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      pageIndex: currentPage - 1,
      pageSize: pageSize,
      pageCount: pageCount,
      total: totalItems
    }));
  }, [currentPage, pageSize, pageCount, totalItems]);

  // Custom pagination UI
  const renderPagination = () => {
    if (pageCount <= 1) return null;
    
    const maxVisiblePages = 5;
    const currentPageIndex = pagination.pageIndex;
    const totalPages = pagination.pageCount;
    
    let startPage = Math.max(0, currentPageIndex - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="page-size">Items per page:</Label>
          <Select 
            value={String(pagination.pageSize)} 
            onValueChange={(value) => handlePageSizeChange(parseInt(value))}
          >
            <SelectTrigger id="page-size" className="w-[80px]">
              <SelectValue placeholder={pagination.pageSize} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {pageCount}
          </span>
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(Math.max(0, currentPageIndex - 1))}
                className={currentPageIndex === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {startPage > 0 && (
              <>
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(0)}>1</PaginationLink>
                </PaginationItem>
                {startPage > 1 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
              </>
            )}
            
            {pageNumbers.map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPageIndex}
                  onClick={() => handlePageChange(page)}
                >
                  {page + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            {endPage < totalPages - 1 && (
              <>
                {endPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(totalPages - 1)}>
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(Math.min(totalPages - 1, currentPageIndex + 1))}
                className={currentPageIndex === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage + 1); // Convert to 1-based for API
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };

  return (
    <div>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        filterOptions={filterOptions}
        searchPlaceholder={searchPlaceholder}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onFilterChange={onFilterChange}
      />
      {renderPagination()}
    </div>
  );
}
