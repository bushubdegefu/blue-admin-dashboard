import { FilterCard } from "@/components/common/FilterCard";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { FilterOption } from "@/types";
import { FC, useState } from "react";
interface FilterCardProps { 
    columns: FilterOption[];
    queryKey: string;
    setFilters: (filters: any) => void;
    filterForm: any;
    clearFilters: () => void;
    setPage: (oageNum: number) => void;
  }

const GenericFilterCard: FC<FilterCardProps> = ({
    columns,
    queryKey,
    setFilters,
    filterForm,
    clearFilters,
    setPage,
}) => {
    const queryClient = useQueryClient();
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);
    const applyFilters = (data: any) => {
        console.log(data)
        setFilters(data);
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        setPage(1);
    };

    return (
        <FilterCard
            title="Filters"
            description="Filter data by any combination of fields"
            isOpen={isFiltersVisible}
            onToggle={setIsFiltersVisible}
            onApply={() => filterForm.handleSubmit(applyFilters)()}
            onReset={clearFilters}
        >
            <Form {...filterForm}>
                <form onSubmit={filterForm.handleSubmit(applyFilters)} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {columns?.map((column: FilterOption) => (
                            <FormField
                                key={column.field}
                                control={filterForm.control}
                                name={column.field}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{column.label}</FormLabel>
                                        <FormControl>
                                            {column.type === "text" ? (
                                                <Input placeholder={`Filter by ${column.label}`} {...field} />
                                            ) : column.type === "select" && column.options ? (
                                                <select
                                                    {...field}
                                                    className="border rounded-md p-2 w-full"
                                                >
                                                    <option value="">Select {column.label}</option>
                                                    {column.options.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : null}
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>
                </form>
            </Form>
        </FilterCard>
    );
};

  export default GenericFilterCard;
