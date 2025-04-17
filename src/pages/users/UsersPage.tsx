
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, UserPlus } from "lucide-react";
import { User, TableColumn, FilterOption } from "@/types";
import { getUsers } from "@/services/mockService";
import PageHeader from "@/components/layout/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { ActionMenu } from "@/components/common/ActionMenu";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/utils";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columnHelper = createColumnHelper<User>();
  
  const columns: TableColumn<User>[] = [
    {
      header: "Username",
      accessorKey: "username",
      cell: (info) => (
        <div>
          <div className="font-medium">{info.getValue() as string}</div>
          <div className="text-xs text-gray-500">ID: {info.row.original.id}</div>
        </div>
      ),
    },
    {
      header: "Name",
      accessorKey: "first_name",
      cell: (info) => {
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
      cell: (info) => (
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
      cell: (info) => {
        const groups = info.row.original.groups;
        return groups.length > 0 ? (
          <div className="space-y-1">
            {groups.slice(0, 2).map((group) => (
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
      cell: (info) => {
        const scopes = info.row.original.scopes;
        return scopes.length > 0 ? (
          <div className="space-y-1">
            {scopes.slice(0, 2).map((scope) => (
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
      cell: (info) => formatDate(info.getValue() as string, "PP"),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (info) => (
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

      <DataTable
        columns={columns}
        data={users}
        filterOptions={filterOptions}
        searchPlaceholder="Search users..."
      />
    </>
  );
};

export default UsersPage;
