import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileCode } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resourceService } from "@/api/resourceService";
import { scopeService } from "@/api/scopeService";
import { Scope } from "@/types";
import ResourceForm  from "@/components/forms/ResourceForm";
import { toast } from "sonner";

const NewResourcePage = () => {
  const navigate = useNavigate();

  // Fetch scopes with React Query
  const { 
    data: scopesResponse,
    isLoading: isLoadingScopes
  } = useQuery({
    queryKey: ['scopes-for-resource'],
    queryFn: () => scopeService.getScopes({ page: 1, size: 100 }),
    select: (data) => data.data || []
  });

  // Create resource mutation
  const createResourceMutation = useMutation({
    mutationFn: (resourceData: any) => resourceService.createResource(resourceData),
    onSuccess: (data) => {
      toast.success("Resource created successfully");
      navigate(`/admin/resources/`);
    },
    onError: (error: any) => {
      console.error("Error creating resource:", error);
      toast.error("Failed to create resource");
    }
  });

  const handleSave = async (resourceData: any) => {
    try {
      const response = await resourceService.createResource(resourceData);
      if (response && response.data) {
        toast.success("Resource created successfully");
        navigate(`/resources/${response.data.id}`);
      }
    } catch (error: any) {
      toast.error(`Failed to create resource: ${error.message}`);
    }
  };

  return (
    <>
      <PageHeader title="Create Resource">
        <Button variant="outline" onClick={() => navigate("/admin/resources")}>
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
              resource={scopesResponse || []} 
              onSave={handleSave} 
              isLoading={false} 
            />
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default NewResourcePage;
