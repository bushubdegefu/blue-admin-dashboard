
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, Trash2, Plus } from "lucide-react";
import { App as AppType, FilterOption } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import { ActionMenu } from "@/components/common/ActionMenu";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appService } from "@/api/appService";
import { DataTable } from "@/components/common/DataTable";
import GenericPagination from "@/components/common/Pagination";
import { useForm } from "react-hook-form";
import GenericFilterCard from "@/components/common/GenricFilterCard";

const AppsPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
      name: '',
      description: '',
      active: '',
  });
  const [appToDelete, setAppToDelete] = useState<AppType | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get apps with React Query
  const { 
    data: appsResponse, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['apps', page, pageSize, filters],
    queryFn: () => appService.getApps({
      page,
      size: pageSize,
      ...filters
    }),
    meta: {
      onError: (err: any) => {
        toast.error(`Error loading apps: ${err.message}`);
      }
    }
  });

  if (error) {
    console.error("Error fetching apps:", error);
  }

  const apps = appsResponse?.data || [];

  // Delete app mutation
  const deleteAppMutation = useMutation({
    mutationFn: (appId: string) => appService.deleteApp(appId),
    onSuccess: () => {
      toast.success(`App "${appToDelete?.name}" deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      setAppToDelete(null);
      setConfirmDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete app: ${error.message}`);
      setConfirmDialogOpen(false);
    }
  });

  const handleDeleteApp = () => {
    if (!appToDelete) return;
    deleteAppMutation.mutate(appToDelete.id);
  };

   const columns = [
    {
      id: "name",
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
      id: "uuid",
      header: "UUID",
      accessorKey: "uuid",
      cell: (info: any) => (
        <div className="font-mono text-xs truncate max-w-[200px]">
          {info.getValue() as string}
        </div>
      ),
    },
    {
      id: "description",
      header: "Description",
      accessorKey: "description",
      cell: (info: any) => (
        <div className="max-w-xs truncate">
          {info.getValue() as string || <span className="text-gray-400 text-xs">No description</span>}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "active",
      cell: (info: any) => (
        <StatusBadge active={info.getValue() as boolean} />
      ),
    },
    {
      id: "groups",
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
      id: "actions",
      header: "Actions",
      accessorKey: "id",
      cell: (info: any) => (
        <ActionMenu
          actions={[
            {
              label: "View Details",
              icon: <Eye className="h-4 w-4 mr-2" />,
              onClick: () => navigate(`/apps/${info.getValue()}`),
            },
            {
              label: "Delete",
              icon: <Trash2 className="h-4 w-4 mr-2" />,
              onClick: () => {
                const app = apps.find(a => a.id === info.getValue());
                if (app) {
                  setAppToDelete(app);
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
        title="Applications"
        description="Manage applications in the system"
      >
        <Button asChild>
          <Link to="/apps/new">
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Link>
        </Button>
      </PageHeader>
      <GenericFilterCard 
        columns={filterOptions}
        queryKey="apps"
        setFilters={setFilters}
        filterForm={filterForm}
        clearFilters={clearFilters}
        setPage={setPage}
      />
      <DataTable
        columns={columns}
        data={apps}
        filterOptions={filterOptions}
        isLoading={isLoading}
        searchPlaceholder="Search applications..."
        />
       <GenericPagination 
        totalItems={appsResponse?.total || 0}
        pageSize={pageSize}
        currentPage={page}
        queryKey="apps"
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Delete Application"
        description={`Are you sure you want to delete the application "${appToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteApp}
        variant="destructive"
        isLoading={deleteAppMutation.isPending}
      />
    </>
  );
};

export default AppsPage;
