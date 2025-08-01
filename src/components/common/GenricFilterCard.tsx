import { FilterCard } from "@/components/common/FilterCard";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { FilterOption } from "@/types";
import { FC, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterCardProps {
  columns: FilterOption[];
  queryKey: string;
  setFilters: (filters: any) => void;
  filterForm: any;
  clearFilters: () => void;
  setPage: (pageNum: number) => void;
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
        <form
          onSubmit={filterForm.handleSubmit(applyFilters)}
          className="space-y-4"
        >
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
                        <Input
                          placeholder={`Filter by ${column.label}`}
                          {...field}
                        />
                      ) : column.type === "select" && column.options ? (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={`Select ${column.label}`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {column.options?.map((option) => (
                              <SelectItem
                                key={option?.value}
                                value={option?.value} // ensure no empty string here
                              >
                                {option?.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
