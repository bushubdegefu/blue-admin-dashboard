
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileCode } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { ResourceForm } from "@/components/forms/ResourceForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createResource, getScopes } from "@/services/mockService";
import { Scope } from "@/types";
import { toast } from "sonner";

const NewResourcePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [isLoadingScopes, setIsLoadingScopes] = useState(true);

  useEffect(() => {
    const fetchScopes = async () => {
      try {
        setIsLoadingScopes(true);
        const data = await getScopes();
        setScopes(data);
      } catch (error) {
        console.error("Error fetching scopes:", error);
      } finally {
        setIsLoadingScopes(false);
      }
    };

    fetchScopes();
  }, []);

  const handleSave = async (resourceData: any) => {
    try {
      setIsLoading(true);
      await createResource(resourceData);
      toast.success("Resource created successfully");
      navigate("/resources");
    } catch (error) {
      console.error("Error creating resource:", error);
      toast.error("Failed to create resource");
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Create Resource">
        <Button variant="outline" onClick={() => navigate("/resources")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Resources
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileCode className="h-5 w-5 mr-2" />
            New Resource
          </CardTitle>
          <CardDescription>
            Create a new API resource in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingScopes ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-admin-500"></div>
            </div>
          ) : (
            <ResourceForm 
              scopes={scopes} 
              onSave={handleSave} 
              isLoading={isLoading} 
            />
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default NewResourcePage;
