import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import { Trash2, Plus, ExternalLink } from "lucide-react";
import { Resource, TableColumn, FilterOption } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { ActionMenu } from "@/components/common/ActionMenu";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService } from "@/api/resourceService";

const ResourcesPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({});
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get resources with React Query
  const { 
    data: resourcesResponse, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['resources', page, pageSize, filters],
    queryFn: () => resourceService.getResources({
      page,
      size: pageSize,
      ...filters
    }),
    meta: {
      onError: (err: any) => {
        toast.error(`Error loading resources: ${err.message}`);
      }
    }
  });

  if (error) {
    console.error("Error fetching resources:", error);
  }

  const resources = resourcesResponse?.data || [];

  // Delete resource mutation
  const deleteResourceMutation = useMutation({
    mutationFn: (resourceId: string) => resourceService.deleteResource(resourceId),
    onSuccess: () => {
      toast.success(`Resource "${resourceToDelete?.name}" deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      setResourceToDelete(null);
      setConfirmDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete resource: ${error.message}`);
      setConfirmDialogOpen(false);
    }
  });

  const handleDeleteResource = () => {
    if (!resourceToDelete) return;
    deleteResourceMutation.mutate(resourceToDelete.id);
  };

  const columnHelper = createColumnHelper<Resource>();
  
  const columns = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (info) => (
        <div>
          <div className="font-medium">{info.getValue() as string}</div>
          <div className="text-xs text-gray-500">ID: {info.row.original.id}</div>
        </div>
      ),
    },
    {
      header: "Route Path",
      accessorKey: "route_path",
      cell: (info) => (
        <div className="font-mono text-xs">{info.getValue() as string}</div>
      ),
    },
    {
      header: "Method",
      accessorKey: "method",
      cell: (info) => {
        const method = info.getValue() as string;
        let color = "";
        
        switch (method) {
          case "GET":
            color = "bg-green-100 text-green-800";
            break;
          case "POST":
            color = "bg-blue-100 text-blue-800";
            break;
          case "PUT":
            color = "bg-yellow-100 text-yellow-800";
            break;
          case "PATCH":
            color = "bg-purple-100 text-purple-800";
            break;
          case "DELETE":
            color = "bg-red-100 text-red-800";
            break;
          default:
            color = "bg-gray-100 text-gray-800";
        }
        
        return (
          <Badge variant="outline" className={`${color} font-mono`}>
            {method}
          </Badge>
        );
      },
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (info) => (
        <div className="max-w-xs truncate">
          {info.getValue() as string || <span className="text-gray-400 text-xs">No description</span>}
        </div>
      ),
    },
    {
      header: "Scope",
      accessorKey: "scope_id",
      cell: (info) => {
        const scope = info.row.original.scope;
        return scope ? (
          <Link 
            to={`/scopes/${scope.id}`} 
            className="text-admin-600 hover:text-admin-800 hover:underline flex items-center"
          >
            {scope.name}
            <ExternalLink className="h-3 w-3 ml-1" />
          </Link>
        ) : (
          <span className="text-gray-400 text-xs">No scope</span>
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (info) => (
        <ActionMenu
          actions={[
            {
              label: "Delete",
              icon: <Trash2 className="h-4 w-4 mr-2" />,
              onClick: () => {
                const resource = resources.find(r => r.id === info.getValue());
                if (resource) {
                  setResourceToDelete(resource);
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
    { field: "route_path", label: "Route Path", type: "text" },
    { 
      field: "method", 
      label: "Method", 
      type: "select",
      options: [
        { label: "GET", value: "GET" },
        { label: "POST", value: "POST" },
        { label: "PUT", value: "PUT" },
        { label: "PATCH", value: "PATCH" },
        { label: "DELETE", value: "DELETE" },
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

  return (
    <>
      <PageHeader
        title="Resources"
        description="Manage API resources in the system"
      >
        <Button asChild>
          <Link to="/resources/new">
            <Plus className="h-4 w-4 mr-2" />
            New Resource
          </Link>
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={resources}
        filterOptions={filterOptions}
        searchPlaceholder="Search resources..."
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onFilterChange={handleFilterChange}
        pagination={{
          pageIndex: page - 1,
          pageSize,
          pageCount: resourcesResponse?.pages || 1,
          total: resourcesResponse?.total || 0
        }}
      />

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Delete Resource"
        description={`Are you sure you want to delete the resource "${resourceToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteResource}
        variant="destructive"
        isLoading={deleteResourceMutation.isPending}
      />
    </>
  );
};

export default ResourcesPage;
