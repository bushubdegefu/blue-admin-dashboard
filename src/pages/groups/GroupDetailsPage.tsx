
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, UserPlus, UserMinus } from "lucide-react";
import { Group, User, Scope } from "@/types";
import { getGroupById, updateGroup, addUserToGroup, removeUserFromGroup } from "@/services/mockService";
import { getUsers } from "@/services/mockService";
import { getScopes } from "@/services/mockService";
import PageHeader from "@/components/layout/PageHeader";
import { GroupForm } from "@/components/forms/GroupForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RelatedItemsCard } from "@/components/common/RelatedItemsCard";
import { getApps } from "@/services/mockService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const GroupDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [allApps, setAllApps] = useState([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allScopes, setAllScopes] = useState<Scope[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddScopeDialogOpen, setIsAddScopeDialogOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [scopeSearchTerm, setScopeSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const [groupData, appsData, usersData, scopesData] = await Promise.all([
          getGroupById(id),
          getApps(),
          getUsers(),
          getScopes()
        ]);
        
        if (!groupData) {
          toast.error("Group not found");
          navigate("/groups");
          return;
        }
        
        setGroup(groupData);
        setAllApps(appsData);
        setAllUsers(usersData);
        setAllScopes(scopesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load group details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleSave = async (formData: any) => {
    if (!group) return;
    
    try {
      setIsSaving(true);
      const updatedGroup = await updateGroup(group.id, formData);
      
      if (updatedGroup) {
        setGroup(updatedGroup);
        toast.success("Group updated successfully");
      }
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error("Failed to update group");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddUserToGroup = async (userId: string) => {
    if (!group) return;
    
    try {
      await addUserToGroup(group.id, userId);
      const updatedGroup = await getGroupById(group.id);
      if (updatedGroup) {
        setGroup(updatedGroup);
        toast.success("User added to group");
      }
    } catch (error) {
      console.error("Error adding user to group:", error);
      toast.error("Failed to add user to group");
    }
  };

  const handleRemoveUserFromGroup = async (userId: string) => {
    if (!group) return;
    
    try {
      await removeUserFromGroup(group.id, userId);
      const updatedGroup = await getGroupById(group.id);
      if (updatedGroup) {
        setGroup(updatedGroup);
        toast.success("User removed from group");
      }
    } catch (error) {
      console.error("Error removing user from group:", error);
      toast.error("Failed to remove user from group");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-500"></div>
      </div>
    );
  }

  if (!group) {
    return null;
  }

  const userItems = group.users.map(user => ({
    id: user.id,
    name: `${user.first_name} ${user.last_name}`,
    description: user.username,
    link: `/users/${user.id}`,
  }));

  const scopeItems = group.scopes.map(scope => ({
    id: scope.id,
    name: scope.name,
    description: scope.description,
    link: `/scopes/${scope.id}`,
  }));

  const filteredUsers = allUsers
    .filter(user => !group.users.some(u => u.id === user.id))
    .filter(user => 
      user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

  const filteredScopes = allScopes
    .filter(scope => !group.scopes.some(s => s.id === scope.id))
    .filter(scope => 
      scope.name.toLowerCase().includes(scopeSearchTerm.toLowerCase()) ||
      (scope.description && scope.description.toLowerCase().includes(scopeSearchTerm.toLowerCase()))
    );

  return (
    <>
      <PageHeader title="Group Details">
        <Button variant="outline" onClick={() => navigate("/groups")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Group Information
              </CardTitle>
              <CardDescription>
                View and edit group details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GroupForm 
                group={group} 
                apps={allApps} 
                onSave={handleSave} 
                isLoading={isSaving} 
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <RelatedItemsCard
            title="Users"
            items={userItems}
            entityType="User"
            emptyMessage="This group has no members."
            onAddItems={() => setIsAddUserDialogOpen(true)}
            onRemoveItem={(userId) => handleRemoveUserFromGroup(userId)}
            canManage={true}
          />
          
          <RelatedItemsCard
            title="Scopes"
            items={scopeItems}
            entityType="Scope"
            emptyMessage="This group has no assigned scopes."
            onAddItems={() => setIsAddScopeDialogOpen(true)}
            canManage={true}
          />
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add User to Group</DialogTitle>
            <DialogDescription>
              Select a user to add to this group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Search users..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="mb-4"
            />
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      handleAddUserToGroup(user.id);
                      setIsAddUserDialogOpen(false);
                    }}
                  >
                    <div>
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.username} • {user.email}
                      </div>
                    </div>
                    <UserPlus className="h-4 w-4 text-admin-500" />
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  No matching users found or all users already added
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Scope Dialog */}
      <Dialog open={isAddScopeDialogOpen} onOpenChange={setIsAddScopeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Scope to Group</DialogTitle>
            <DialogDescription>
              Select a scope to add to this group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Search scopes..."
              value={scopeSearchTerm}
              onChange={(e) => setScopeSearchTerm(e.target.value)}
              className="mb-4"
            />
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredScopes.length > 0 ? (
                filteredScopes.map((scope) => (
                  <div
                    key={scope.id}
                    className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      // handleAddScopeToGroup(scope.id);
                      toast.success(`Added scope ${scope.name} to group`);
                      setIsAddScopeDialogOpen(false);
                    }}
                  >
                    <div>
                      <div className="font-medium">{scope.name}</div>
                      <div className="text-sm text-gray-500">
                        {scope.description || "No description"}
                      </div>
                    </div>
                    <CheckCircle2Icon className="h-4 w-4 text-admin-500" />
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  No matching scopes found or all scopes already added
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GroupDetailsPage;
