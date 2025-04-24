import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, UserPlus } from "lucide-react";
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
import GenericPagination from "@/components/common/Pagination";
import GenericFilterCard from "@/components/common/GenricFilterCard";


const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
 
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
      <GenericFilterCard 
        columns={filterOptions}
        queryKey="users"
        setFilters={setFilters}
        filterForm={filterForm}
        clearFilters={clearFilters}
        setPage={setPage}
      />
      <DataTable
        columns={columns}
        data={users}
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
