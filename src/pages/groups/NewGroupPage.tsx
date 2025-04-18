
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UsersRound } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import PageHeader from "@/components/layout/PageHeader";
import { GroupForm } from "@/components/forms/GroupForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { groupService } from "@/api/groupService";
import { appService } from "@/api/appService";
import { App } from "@/types";
import { toast } from "sonner";

const NewGroupPage = () => {
  const navigate = useNavigate();

  // Fetch apps with React Query
  const { 
    data: appsResponse,
    isLoading: isLoadingApps
  } = useQuery({
    queryKey: ['apps-for-group'],
    queryFn: () => appService.getApps({ page: 1, size: 100 }),
    select: (data) => data.data || []
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: (groupData: any) => groupService.createGroup(groupData),
    onSuccess: (data) => {
      toast.success("Group created successfully");
      navigate(`/groups`);
    },
    onError: (error: any) => {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    }
  });

  const handleSave = async (groupData: any) => {
    createGroupMutation.mutate(groupData);
  };

  return (
    <>
      <PageHeader title="Create Group">
        <Button variant="outline" onClick={() => navigate("/groups")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UsersRound className="h-5 w-5 mr-2" />
            New Group
          </CardTitle>
          <CardDescription>
            Create a new user group in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingApps ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-admin-500"></div>
            </div>
          ) : (
            <GroupForm 
              apps={appsResponse || []} 
              onSave={handleSave} 
              isLoading={createGroupMutation.isPending} 
            />
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default NewGroupPage;
