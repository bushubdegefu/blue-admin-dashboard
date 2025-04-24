import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, Trash2, Plus } from "lucide-react";
import { Group, FilterOption } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import { ActionMenu } from "@/components/common/ActionMenu";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupService } from "@/api/groupService";
import { DataTable } from "@/components/common/DataTable";
import GenericPagination from "@/components/common/Pagination";
import GenericFilterCard from "@/components/common/GenricFilterCard";
import { useForm } from "react-hook-form";
import { Description } from "@radix-ui/react-toast";

const GroupsPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    name: "",
    description: "",
  });
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get groups with React Query
  const {
    data: groupsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["groups", page, pageSize, filters],
    queryFn: () =>
      groupService.getGroups({
        page,
        size: pageSize,
        ...filters,
      }),
    meta: {
      onError: (err: any) => {
        toast.error(`Error loading groups: ${err.message}`);
      },
    },
  });

  if (error) {
    console.error("Error fetching groups:", error);
  }

  const groups = groupsResponse?.data || [];

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: string) => groupService.deleteGroup(groupId),
    onSuccess: () => {
      toast.success(`Group "${groupToDelete?.name}" deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setGroupToDelete(null);
      setConfirmDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete group: ${error.message}`);
      setConfirmDialogOpen(false);
    },
  });

  const handleDeleteGroup = () => {
    if (!groupToDelete) return;
    deleteGroupMutation.mutate(groupToDelete.id);
  };

 

  const columns = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      cell: (info: any) => (
        <div>
          <div className="font-medium">{info.getValue() as string}</div>
          <div className="text-xs text-gray-500">
            ID: {info.row.original.id}
          </div>
        </div>
      ),
    },
    {
      id: "description",
      header: "Description",
      accessorKey: "description",
      cell: (info: any) => (
        <div className="max-w-xs truncate">
          {(info.getValue() as string) || (
            <span className="text-gray-400 text-xs">No description</span>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "active",
      cell: (info: any) => <StatusBadge active={info.getValue() as boolean} />,
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
              onClick: () => navigate(`/groups/${info.getValue()}`),
            },
            {
              label: "Delete",
              icon: <Trash2 className="h-4 w-4 mr-2" />,
              onClick: () => {
                const group = groups.find((g) => g.id === info.getValue());
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
      ],
    },
  ];

  // Create form for filters
  const filterForm = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Clear all filters
  const clearFilters = () => {
    filterForm.reset({
      name: "",
      description: "",
    });
    setFilters({
      name: "",
      description: "",
    });
    setPage(1);
  };
  return (
    <>
      <PageHeader title="Groups" description="Manage user groups in the system">
        <Button asChild>
          <Link to="/groups/new">
            <Plus className="h-4 w-4 mr-2" />
            New Group
          </Link>
        </Button>
      </PageHeader>

      <GenericFilterCard
        columns={filterOptions}
        queryKey="groups"
        setFilters={setFilters}
        filterForm={filterForm}
        clearFilters={clearFilters}
        setPage={setPage}
      />

      <DataTable
        columns={columns}
        data={groups}
        filterOptions={filterOptions}
        searchPlaceholder="Search groups..."
        isLoading={isLoading}
      />
      <GenericPagination
        totalItems={groupsResponse?.total || 0}
        pageSize={pageSize}
        currentPage={page}
        queryKey="groups"
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
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
        isLoading={deleteGroupMutation.isPending}
      />
    </>
  );
};

export default GroupsPage;
