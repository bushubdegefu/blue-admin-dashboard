
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import PageHeader from "@/components/layout/PageHeader";
import { AppForm } from "@/components/forms/AppForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { appService } from "@/api/appService";
import { toast } from "sonner";

const NewAppPage = () => {
  const navigate = useNavigate();

  // Create app mutation
  const createAppMutation = useMutation({
    mutationFn: (appData: any) => appService.createApp(appData),
    onSuccess: (data) => {
      toast.success("Application created successfully");
      navigate(`/apps/${data.id}`);
    },
    onError: (error: any) => {
      console.error("Error creating application:", error);
      toast.error("Failed to create application");
    }
  });

  const handleSave = async (appData: any) => {
    createAppMutation.mutate(appData);
  };

  return (
    <>
      <PageHeader title="Create Application">
        <Button variant="outline" onClick={() => navigate("/apps")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applications
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            New Application
          </CardTitle>
          <CardDescription>
            Create a new application in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppForm onSave={handleSave} isLoading={createAppMutation.isPending} />
        </CardContent>
      </Card>
    </>
  );
};

export default NewAppPage;
