
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, UserPlus,Filter, X } from "lucide-react";
import { User, FilterOption } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { ActionMenu } from "@/components/common/ActionMenu";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/utils";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from "@/api/userService";
import { toast } from "sonner";
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import GenericPagination from "@/components/common/Pagination";
import { set } from "date-fns";

const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  });

   // Create form for filters
   const filterForm = useForm({
    defaultValues: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
    }
  });

   // Clear all filters
   const clearFilters = () => {
    filterForm.reset({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
    });
    setFilters({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
    });
    setPage(1);
  };

  // Toggle filter visibility
  const toggleFilters = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };

  const navigate = useNavigate();

  // API query with filters
  const { 
    data: usersResponse, 
    isLoading, 
    error
  } = useQuery({
    queryKey: ['users', page, pageSize, filters],
    queryFn: () => userService.getUsers({
      page,
      size: pageSize,
      ...filters
    }),
    meta: {
      onError: (err: any) => {
        toast.error(`Error loading users: ${err.message}`);
      }
    }
  });

  if (error) {
    console.error("Error fetching users:", error);
  }

  const users = usersResponse?.data || [];
  
  const columnHelper = createColumnHelper<User>();
  
  const columns = [
    {
      header: "Username",
      accessorKey: "username",
      cell: (info: any) => (
        <div>
          <div className="font-medium">{info.getValue() as string}</div>
          <div className="text-xs text-gray-500">ID: {info.row.original.id}</div>
        </div>
      ),
    },
    {
      header: "Name",
      accessorKey: "first_name",
      cell: (info: any) => {
        const user = info.row.original;
        const fullName = `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}`;
        return fullName;
      },
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Status",
      accessorKey: "disabled",
      cell: (info: any) => (
        <StatusBadge 
          active={!(info.getValue() as boolean)} 
          activeText="Active"
          inactiveText="Disabled"
        />
      ),
    },
    {
      header: "Groups",
      accessorKey: "groups",
      cell: (info: any) => {
        const groups = info.row.original.groups || [];
        return groups.length > 0 ? (
          <div className="space-y-1">
            {groups.slice(0, 2).map((group: any) => (
              <div key={group.id} className="text-xs px-2 py-1 bg-gray-100 rounded-full inline-block mr-1">
                {group.name}
              </div>
            ))}
            {groups.length > 2 && (
              <div className="text-xs text-gray-500">
                +{groups.length - 2} more
              </div>
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-xs">No groups</span>
        );
      },
      enableSorting: false,
    },
    {
      header: "Scopes",
      accessorKey: "scopes",
      cell: (info: any) => {
        const scopes = info.row.original.scopes || [];
        return scopes.length > 0 ? (
          <div className="space-y-1">
            {scopes.slice(0, 2).map((scope: any) => (
              <div key={scope.id} className="text-xs px-2 py-1 bg-gray-100 rounded-full inline-block mr-1">
                {scope.name}
              </div>
            ))}
            {scopes.length > 2 && (
              <div className="text-xs text-gray-500">
                +{scopes.length - 2} more
              </div>
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-xs">No scopes</span>
        );
      },
      enableSorting: false,
    },
    {
      header: "Registered",
      accessorKey: "date_registered",
      cell: (info: any) => formatDate(info.getValue() as string, "PP"),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (info: any) => (
        <ActionMenu
          actions={[
            {
              label: "View Details",
              icon: <Eye className="h-4 w-4 mr-2" />,
              onClick: () => navigate(`/users/${info.getValue()}`),
            },
          ]}
        />
      ),
      enableSorting: false,
    },
  ];

  const filterOptions: FilterOption[] = [
    { field: "username", label: "Username", type: "text" },
    { field: "email", label: "Email", type: "text" },
    { field: "first_name", label: "First Name", type: "text" },
    { field: "last_name", label: "Last Name", type: "text" },
    { 
      field: "disabled", 
      label: "Status", 
      type: "select",
      options: [
        { label: "Active", value: "false" },
        { label: "Disabled", value: "true" },
      ]
    },
  ];

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
  };

  const handleFilterChange = (filters: any) => {
    setFilters(filters);
  };

    // Apply filters from form
    const applyFilters = (data) => {
      setFilters(data);
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setPage(1); // Reset to first page when applying new filters
    };

  const FilterCard= () => (
    <Card>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle>Filters</CardTitle>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleFilters}
          className="h-8 w-8"
        >
          {isFiltersVisible ? <X size={16} /> : <Filter size={16} />}
        </Button>
      </div>
      <CardDescription>
        Filter users by any combination of fields
      </CardDescription>
    </CardHeader>
    
    {isFiltersVisible && (
      <CardContent>
        <Form {...filterForm}>
          <form onSubmit={filterForm.handleSubmit(applyFilters)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <FormField
                control={filterForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Filter by username" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={filterForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Filter by email" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={filterForm.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Filter by first name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={filterForm.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Filter by last name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={clearFilters}
              >
                Reset
              </Button>
              <Button type="submit">
                Apply Filters
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    )}
  </Card>
  );
  
  return (
    <>
      <PageHeader
        title="Users"
        description="Manage user accounts in the system"
      >
        <Button asChild>
          <Link to="/users/new">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Link>
        </Button>
      </PageHeader>
      
      <DataTable
        columns={columns}
        data={users}
        filterCard={FilterCard}
        isLoading={isLoading}
        filterOptions={filterOptions}
        searchPlaceholder="Search users..."
        

      />
      <GenericPagination 
        totalItems={usersResponse?.total || 0}
        pageSize={pageSize}
        currentPage={page}
        queryKey="users"
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </>
  );
};

export default UsersPage;
