
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { AppForm } from "@/components/forms/AppForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createApp } from "@/services/mockService";
import { toast } from "sonner";

const NewAppPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (appData: any) => {
    try {
      setIsLoading(true);
      await createApp(appData);
      toast.success("Application created successfully");
      navigate("/apps");
    } catch (error) {
      console.error("Error creating application:", error);
      toast.error("Failed to create application");
      setIsLoading(false);
    }
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
          <AppForm onSave={handleSave} isLoading={isLoading} />
        </CardContent>
      </Card>
    </>
  );
};

export default NewAppPage;
