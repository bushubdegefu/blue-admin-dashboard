
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import { useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GenericPaginationProps {
    totalItems: number;
    pageSize: number;
    currentPage: number;
    queryKey: string;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

function GenericPagination({ 
    totalItems, 
    pageSize, 
    currentPage, 
    queryKey, 
    onPageChange, 
    onPageSizeChange 
}: GenericPaginationProps) {
    const queryClient = useQueryClient();
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    
    // Ensure currentPage is within valid range
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            onPageChange(1);
        }
    }, [totalPages, currentPage, onPageChange]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            onPageChange(newPage); 
            queryClient.invalidateQueries({ queryKey: [queryKey, newPage, pageSize] });
        }
    };
    
    const handlePageSizeChange = (newPageSize: number) => {
        onPageChange(1); // Reset to the first page when page size changes
        onPageSizeChange(newPageSize);
        queryClient.invalidateQueries({ queryKey: [queryKey, 1, newPageSize] });
    };

    // Generate pagination items
    const renderPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5;
        
        // Always show first page
        if (currentPage > 3) {
            items.push(
                <PaginationItem key="first">
                    <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
                </PaginationItem>
            );
            
            // Show ellipsis if needed
            if (currentPage > 4) {
                items.push(
                    <PaginationItem key="ellipsis-start">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }
        }
        
        // Calculate range of pages to show
        const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Generate page numbers
        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink 
                        isActive={i === currentPage}
                        onClick={() => handlePageChange(i)}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }
        
        // Show ellipsis and last page if needed
        if (endPage < totalPages - 1) {
            items.push(
                <PaginationItem key="ellipsis-end">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }
        
        if (endPage < totalPages) {
            items.push(
                <PaginationItem key="last">
                    <PaginationLink onClick={() => handlePageChange(totalPages)}>
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }
        
        return items;
    };

    // Page size options
    const pageSizeOptions = [5, 10, 20, 30, 50, 100];

    return (
        <Card className="mt-4 border-admin-100 shadow-sm">
            <CardContent className="pt-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Showing</span>
                        <Select
                            value={pageSize.toString()}
                            onValueChange={(value) => handlePageSizeChange(Number(value))}
                        >
                            <SelectTrigger className="w-[70px] h-8">
                                <SelectValue placeholder={pageSize} />
                            </SelectTrigger>
                            <SelectContent>
                                {pageSizeOptions.map((size) => (
                                    <SelectItem key={size} value={size.toString()}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span>of {totalItems} items</span>
                    </div>

                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                            
                            {renderPaginationItems()}
                            
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </CardContent>
            <CardFooter className="py-2 border-t bg-gray-50 flex justify-center">
                <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                </div>
            </CardFooter>
        </Card>
    );
}

export default GenericPagination;
