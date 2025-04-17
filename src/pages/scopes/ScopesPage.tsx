
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, Trash2, Plus } from "lucide-react";
import { Scope, TableColumn, FilterOption } from "@/types";
import { getScopes, deleteScope } from "@/services/mockService";
import PageHeader from "@/components/layout/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { ActionMenu } from "@/components/common/ActionMenu";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";

const ScopesPage = () => {
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scopeToDelete, setScopeToDelete] = useState<Scope | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScopes = async () => {
      try {
        const data = await getScopes();
        setScopes(data);
      } catch (error) {
        console.error("Error fetching scopes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScopes();
  }, []);

  const handleDeleteScope = async () => {
    if (!scopeToDelete) return;
    
    try {
      await deleteScope(scopeToDelete.id);
      setScopes(scopes.filter(scope => scope.id !== scopeToDelete.id));
      toast.success(`Scope "${scopeToDelete.name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting scope:", error);
      toast.error("Failed to delete scope");
    } finally {
      setScopeToDelete(null);
      setConfirmDialogOpen(false);
    }
  };

  const columnHelper = createColumnHelper<Scope>();
  
  const columns: TableColumn<Scope>[] = [
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
      header: "Description",
      accessorKey: "description",
      cell: (info) => (
        <div className="max-w-xs truncate">
          {info.getValue() as string || <span className="text-gray-400 text-xs">No description</span>}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "active",
      cell: (info) => (
        <StatusBadge active={info.getValue() as boolean} />
      ),
    },
    {
      header: "Resources",
      accessorKey: "resources",
      cell: (info) => {
        const count = (info.getValue() as any[]).length;
        return (
          <div className="text-sm">{count} resource{count !== 1 ? "s" : ""}</div>
        );
      },
    },
    {
      header: "Users",
      accessorKey: "users",
      cell: (info) => {
        const count = (info.getValue() as any[]).length;
        return (
          <div className="text-sm">{count} user{count !== 1 ? "s" : ""}</div>
        );
      },
    },
    {
      header: "Groups",
      accessorKey: "groups",
      cell: (info) => {
        const count = (info.getValue() as any[]).length;
        return (
          <div className="text-sm">{count} group{count !== 1 ? "s" : ""}</div>
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

      <DataTable
        columns={columns}
        data={scopes}
        filterOptions={filterOptions}
        searchPlaceholder="Search scopes..."
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
      />
    </>
  );
};

export default ScopesPage;
