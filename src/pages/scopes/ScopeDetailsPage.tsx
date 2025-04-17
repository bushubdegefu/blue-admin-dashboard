
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Key } from "lucide-react";
import { Scope } from "@/types";
import { getScopeById, updateScope } from "@/services/mockService";
import PageHeader from "@/components/layout/PageHeader";
import { ScopeForm } from "@/components/forms/ScopeForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RelatedItemsCard } from "@/components/common/RelatedItemsCard";
import { toast } from "sonner";

const ScopeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scope, setScope] = useState<Scope | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchScope = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const scopeData = await getScopeById(id);
        
        if (!scopeData) {
          toast.error("Scope not found");
          navigate("/scopes");
          return;
        }
        
        setScope(scopeData);
      } catch (error) {
        console.error("Error fetching scope:", error);
        toast.error("Failed to load scope details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchScope();
  }, [id, navigate]);

  const handleSave = async (formData: any) => {
    if (!scope) return;
    
    try {
      setIsSaving(true);
      const updatedScope = await updateScope(scope.id, formData);
      
      if (updatedScope) {
        setScope(updatedScope);
        toast.success("Scope updated successfully");
      }
    } catch (error) {
      console.error("Error updating scope:", error);
      toast.error("Failed to update scope");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-500"></div>
      </div>
    );
  }

  if (!scope) {
    return null;
  }

  const resourceItems = scope.resources.map(resource => ({
    id: resource.id,
    name: resource.name,
    description: `${resource.method} ${resource.route_path}`,
  }));

  const userItems = scope.users.map(user => ({
    id: user.id,
    name: `${user.first_name} ${user.last_name}`,
    description: user.username,
    link: `/users/${user.id}`,
  }));

  const groupItems = scope.groups.map(group => ({
    id: group.id,
    name: group.name,
    description: group.description,
    link: `/groups/${group.id}`,
  }));

  return (
    <>
      <PageHeader title="Scope Details">
        <Button variant="outline" onClick={() => navigate("/scopes")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scopes
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Scope Information
              </CardTitle>
              <CardDescription>
                View and edit scope details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScopeForm 
                scope={scope} 
                onSave={handleSave} 
                isLoading={isSaving} 
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Tabs defaultValue="resources">
            <TabsList className="w-full">
              <TabsTrigger value="resources" className="flex-1">Resources</TabsTrigger>
              <TabsTrigger value="groups" className="flex-1">Groups</TabsTrigger>
              <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
            </TabsList>
            
            <TabsContent value="resources">
              <RelatedItemsCard
                title="Resources"
                items={resourceItems}
                entityType="Resource"
                emptyMessage="No resources assigned to this scope."
                canManage={true}
                onAddItems={() => navigate("/resources/new")}
              />
            </TabsContent>
            
            <TabsContent value="groups">
              <RelatedItemsCard
                title="Groups"
                items={groupItems}
                entityType="Group"
                emptyMessage="No groups have this scope."
                canManage={false}
              />
            </TabsContent>
            
            <TabsContent value="users">
              <RelatedItemsCard
                title="Users"
                items={userItems}
                entityType="User"
                emptyMessage="No users have this scope."
                canManage={false}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default ScopeDetailsPage;
