import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Trash2, Plus } from "lucide-react";
import { Group, TableColumn, FilterOption } from "@/types";
import { getGroups, deleteGroup } from "@/services/mockService";
import PageHeader from "@/components/layout/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { ActionMenu } from "@/components/common/ActionMenu";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";

const GroupsPage = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await getGroups();
        setGroups(data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    
    try {
      await deleteGroup(groupToDelete.id);
      setGroups(groups.filter(group => group.id !== groupToDelete.id));
      toast.success(`Group "${groupToDelete.name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group");
    } finally {
      setGroupToDelete(null);
      setConfirmDialogOpen(false);
    }
  };

  const columnHelper = createColumnHelper<Group>();
  
  const columns: TableColumn<Group>[] = [
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
      header: "App",
      accessorKey: "app",
      cell: (info) => {
        const app = info.getValue() as any;
        return app ? (
          <Link 
            to={`/apps/${app.id}`} 
            className="text-admin-600 hover:text-admin-800 hover:underline"
          >
            {app.name}
          </Link>
        ) : (
          <span className="text-gray-400 text-xs">No app</span>
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
              onClick: () => navigate(`/groups/${info.getValue()}`),
            },
            {
              label: "Delete",
              icon: <Trash2 className="h-4 w-4 mr-2" />,
              onClick: () => {
                const group = groups.find(g => g.id === info.getValue());
                if (group) {
                  setGroupToDelete(group);
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
        title="Groups"
        description="Manage user groups in the system"
      >
        <Button asChild>
          <Link to="/groups/new">
            <Plus className="h-4 w-4 mr-2" />
            New Group
          </Link>
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={groups}
        filterOptions={filterOptions}
        searchPlaceholder="Search groups..."
      />

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Delete Group"
        description={`Are you sure you want to delete the group "${groupToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteGroup}
        variant="destructive"
      />
    </>
  );
};

export default GroupsPage;
