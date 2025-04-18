
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UsersRound } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [apps, setApps] = useState<App[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setIsLoadingApps(true);
        const data = await appService.getApps();
        setApps(data);
      } catch (error) {
        console.error("Error fetching apps:", error);
      } finally {
        setIsLoadingApps(false);
      }
    };

    fetchApps();
  }, []);

  const handleSave = async (groupData: any) => {
    try {
      setIsLoading(true);
      const newGroup = await groupService.createGroup(groupData);
      toast.success("Group created successfully");
      navigate(`/groups/${newGroup.id}`);
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
      setIsLoading(false);
    }
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
              apps={apps} 
              onSave={handleSave} 
              isLoading={isLoading} 
            />
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default NewGroupPage;
