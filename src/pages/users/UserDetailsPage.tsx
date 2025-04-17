
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserCog } from "lucide-react";
import { User } from "@/types";
import { getUserById, updateUser } from "@/services/mockService";
import PageHeader from "@/components/layout/PageHeader";
import { UserForm } from "@/components/forms/UserForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { RelatedItemsCard } from "@/components/common/RelatedItemsCard";
import { toast } from "sonner";

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const userData = await getUserById(id);
        
        if (!userData) {
          toast.error("User not found");
          navigate("/users");
          return;
        }
        
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load user details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  const handleSave = async (formData: any) => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      const updatedUser = await updateUser(user.id, formData);
      
      if (updatedUser) {
        setUser(updatedUser);
        toast.success("User updated successfully");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
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

  if (!user) {
    return null;
  }

  const groupItems = user.groups.map(group => ({
    id: group.id,
    name: group.name,
    description: group.description,
    link: `/groups/${group.id}`,
  }));

  const scopeItems = user.scopes.map(scope => ({
    id: scope.id,
    name: scope.name,
    description: scope.description,
    link: `/scopes/${scope.id}`,
  }));

  return (
    <>
      <PageHeader title="User Details">
        <Button variant="outline" onClick={() => navigate("/users")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCog className="h-5 w-5 mr-2" />
                User Information
              </CardTitle>
              <CardDescription>
                View and edit user details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList className="mb-4 bg-secondary">
                  <TabsTrigger value="details">User Details</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                  <UserForm user={user} onSave={handleSave} isLoading={isSaving} />
                </TabsContent>
                <TabsContent value="security">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-md bg-gray-50">
                        <div className="text-sm font-medium">User ID</div>
                        <div className="mt-1 text-xs font-mono bg-gray-100 p-2 rounded">
                          {user.id}
                        </div>
                      </div>
                      <div className="p-4 border rounded-md bg-gray-50">
                        <div className="text-sm font-medium">UUID</div>
                        <div className="mt-1 text-xs font-mono bg-gray-100 p-2 rounded break-all">
                          {user.uuid}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border rounded-md bg-gray-50">
                      <div className="text-sm font-medium">Registration Date</div>
                      <div className="mt-1">
                        {formatDate(user.date_registered, "PPpp")}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <RelatedItemsCard
            title="Groups"
            items={groupItems}
            entityType="Group"
            emptyMessage="This user is not a member of any groups."
          />
          
          <RelatedItemsCard
            title="Scopes"
            items={scopeItems}
            entityType="Scope"
            emptyMessage="This user has no assigned scopes."
          />
        </div>
      </div>
    </>
  );
};

export default UserDetailsPage;
