
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";

interface GenericPaginationProps {
    totalItems: number;
    pageSize: number;
    queryKey: string;
    currentPage: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

function GenericPagination({ 
    totalItems, 
    pageSize, 
    queryKey,
    currentPage, 
    onPageChange, 
    onPageSizeChange 
}: GenericPaginationProps) {
    const queryClient = useQueryClient();
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            onPageChange(newPage);
            queryClient.invalidateQueries({ queryKey: [queryKey, newPage, currentPage] });
        }
    };
    
    const handlePageSizeChange = (newPageSize: string) => {
        onPageChange(1);
        onPageSizeChange(Number(newPageSize));
        queryClient.invalidateQueries({ queryKey: [queryKey, 1, currentPage] });
    };

    const renderPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5;
        
        if (currentPage > 3) {
            items.push(
                <PaginationItem key="first">
                    <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
                </PaginationItem>
            );
            
            if (currentPage > 4) {
                items.push(
                    <PaginationItem key="ellipsis-start">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }
        }
        
        const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
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

    const pageSizeOptions = [1, 5, 10, 20, 30, 50, 100];

    return (
        <Card className="mt-4 border-gray-200 shadow-sm bg-white">
            <CardContent className="pt-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Showing</span>
                        <Select
                            value={pageSize.toString()}
                            onValueChange={handlePageSizeChange}
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
                        <span>items</span>
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
