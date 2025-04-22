
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, Trash2, Plus } from "lucide-react";
import { Scope, FilterOption } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import { ActionMenu } from "@/components/common/ActionMenu";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scopeService } from "@/api/scopeService";
import { DataTable } from "@/components/common/DataTable";
import GenericPagination from "@/components/common/Pagination";
import { useForm } from "react-hook-form";
import GenericFilterCard from "@/components/common/GenricFilterCard";

const ScopesPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
      name: '',
      description: '',
      active: '',
  });
  const [scopeToDelete, setScopeToDelete] = useState<Scope | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get scopes with React Query
  const { 
    data: scopesResponse, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['scopes', page, pageSize, filters],
    queryFn: () => scopeService.getScopes({
      page,
      size: pageSize,
      ...filters
    }),
    meta: {
      onError: (err: any) => {
        toast.error(`Error loading scopes: ${err.message}`);
      }
    }
  });

  if (error) {
    console.error("Error fetching scopes:", error);
  }

  const scopes = scopesResponse?.data || [];

  // Delete scope mutation
  const deleteScopeMutation = useMutation({
    mutationFn: (scopeId: string) => scopeService.deleteScope(scopeId),
    onSuccess: () => {
      toast.success(`Scope "${scopeToDelete?.name}" deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['scopes'] });
      setScopeToDelete(null);
      setConfirmDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete scope: ${error.message}`);
      setConfirmDialogOpen(false);
    }
  });

  const handleDeleteScope = () => {
    if (!scopeToDelete) return;
    deleteScopeMutation.mutate(scopeToDelete.id);
  };

  
  const columns = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (info: any) => (
        <div>
          <div className="font-medium">{info.getValue() as string}</div>
          <div className="text-xs text-gray-500">ID: {info.row.original.id}</div>
        </div>
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (info: any) => (
        <div className="max-w-xs truncate">
          {info.getValue() as string || <span className="text-gray-400 text-xs">No description</span>}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "active",
      cell: (info: any) => (
        <StatusBadge active={info.getValue() as boolean} />
      ),
    },
    {
      header: "Resources",
      accessorKey: "resources",
      cell: (info: any) => {
        const resources = info.row.original.resources || [];
        const count = resources.length;
        return (
          <div className="text-sm">{count} resource{count !== 1 ? "s" : ""}</div>
        );
      },
    },
    {
      header: "Users",
      accessorKey: "users",
      cell: (info: any) => {
        const users = info.row.original.users || [];
        const count = users.length;
        return (
          <div className="text-sm">{count} user{count !== 1 ? "s" : ""}</div>
        );
      },
    },
    {
      header: "Groups",
      accessorKey: "groups",
      cell: (info: any) => {
        const groups = info.row.original.groups || [];
        const count = groups.length;
        return (
          <div className="text-sm">{count} group{count !== 1 ? "s" : ""}</div>
        );
      },
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
              onClick: () => navigate(`/scopes/${info.getValue()}`),
            },
            {
              label: "Delete",
              icon: <Trash2 className="h-4 w-4 mr-2" />,
              onClick: () => {
                const scope = scopes.find(s => s.id === info.getValue());
                if (scope) {
                  setScopeToDelete(scope);
                  setConfirmDialogOpen(true);
                }
              },
              variant: "destructive",
            },
          ]}
        />
      ),
      enableSorting: false,
    },
  ];

  const filterOptions: FilterOption[] = [
    { field: "name", label: "Name", type: "text" },
    { field: "description", label: "Description", type: "text" },
    { 
      field: "active", 
      label: "Status", 
      type: "select",
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ]
    },
  ];

  
   // Create form for filters
   const filterForm = useForm({
    defaultValues: {
      name: '',
      description: '',
      active: '',
    }
  });

   // Clear all filters
   const clearFilters = () => {
    filterForm.reset({
      name: '',
      description: '',
      active: '',
    });


    setFilters({
      name: '',
      description: '',
      active: '',
    });
    setPage(1);
  };

 
  return (
    <>
      <PageHeader
        title="Scopes"
        description="Manage authorization scopes in the system"
      >
        <Button asChild>
          <Link to="/scopes/new">
            <Plus className="h-4 w-4 mr-2" />
            New Scope
          </Link>
        </Button>
      </PageHeader>
      <GenericFilterCard 
        columns={filterOptions}
        queryKey="scopes"
        setFilters={setFilters}
        filterForm={filterForm}
        clearFilters={clearFilters}
        setPage={setPage}
      />

      <DataTable
        columns={columns}
        data={scopes}
        filterOptions={filterOptions}
        searchPlaceholder="Search scopes..."
        isLoading={isLoading}
       
      />
      <GenericPagination 
        totalItems={scopesResponse?.total || 0}
        pageSize={pageSize}
        currentPage={page}
        queryKey="scopes"
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Delete Scope"
        description={`Are you sure you want to delete the scope "${scopeToDelete?.name}"? This action cannot be undone and may affect users and groups with this scope.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteScope}
        variant="destructive"
        isLoading={deleteScopeMutation.isPending}
      />
    </>
  );
};

export default ScopesPage;
