import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";
import { useQueryClient } from '@tanstack/react-query';

interface GenericPaginationProps {
    totalItems: number;
    pageSize: number;
    currentPage: number;
    queryKey: string;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

function GenericPagination({ totalItems, pageSize, currentPage, queryKey, onPageChange, onPageSizeChange }: GenericPaginationProps) {
    const queryClient = useQueryClient();
    const totalPages = Math.ceil(totalItems / pageSize);

    const handlePageChange = (newPage: number) => {
        onPageChange(newPage); 
        queryClient.invalidateQueries({ queryKey: [queryKey, newPage, currentPage] });
    };
    
    const handlePageSizeChange = (newPageSize: number) => {
        onPageChange(1); // Reset to the first page when page size changes
        onPageSizeChange(newPageSize);
        queryClient.invalidateQueries({ queryKey: [queryKey, 1, currentPage] });
    };

    const generateSizeOptions = [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    return (
        <div className="m-2 p-1 bg-white shadow-md rounded-lg">
            {/* Page Size Dropdown */}
            <div className="mb-1">
                <label htmlFor="pageSize" className="mr-2">Page Size:</label>
                <select
                    id="pageSize"
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="border rounded px-2 py-1"
                >
                    {generateSizeOptions.map((size) => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>
            </div>

            {/* Pagination Component */}
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <PaginationItem key={pageNum}>
                            <PaginationLink
                                isActive={currentPage === pageNum}
                                onClick={() => handlePageChange(pageNum)}
                            >
                                {pageNum}
                            </PaginationLink>
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>

            {/* Current Page Info */}
            <div className="mt-4 text-center">
                <span>
                    Page {currentPage} of {totalPages}
                </span>
            </div>
        </div>
    );
}

export default GenericPagination;