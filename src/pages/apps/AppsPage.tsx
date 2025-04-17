
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import { Globe, Trash2, Plus } from "lucide-react";
import { App, TableColumn, FilterOption } from "@/types";
import { getApps, deleteApp } from "@/services/mockService";
import PageHeader from "@/components/layout/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { ActionMenu } from "@/components/common/ActionMenu";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";

const AppsPage = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appToDelete, setAppToDelete] = useState<App | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const data = await getApps();
        setApps(data);
      } catch (error) {
        console.error("Error fetching apps:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApps();
  }, []);

  const handleDeleteApp = async () => {
    if (!appToDelete) return;
    
    try {
      await deleteApp(appToDelete.id);
      setApps(apps.filter(app => app.id !== appToDelete.id));
      toast.success(`App "${appToDelete.name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting app:", error);
      toast.error("Failed to delete app");
    } finally {
      setAppToDelete(null);
      setConfirmDialogOpen(false);
    }
  };

  const columnHelper = createColumnHelper<App>();
  
  const columns: TableColumn<App>[] = [
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
      header: "UUID",
      accessorKey: "uuid",
      cell: (info) => (
        <div className="font-mono text-xs truncate max-w-[200px]">
          {info.getValue() as string}
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

      <DataTable
        columns={columns}
        data={apps}
        filterOptions={filterOptions}
        searchPlaceholder="Search applications..."
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
      />
    </>
  );
};

export default AppsPage;
