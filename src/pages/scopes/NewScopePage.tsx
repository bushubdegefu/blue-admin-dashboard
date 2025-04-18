
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { ScopeForm } from "@/components/forms/ScopeForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { scopeService } from "@/api/scopeService";
import { toast } from "sonner";

const NewScopePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (scopeData: any) => {
    try {
      setIsLoading(true);
      const newScope = await scopeService.createScope(scopeData);
      toast.success("Scope created successfully");
      navigate(`/scopes/${newScope.id}`);
    } catch (error) {
      console.error("Error creating scope:", error);
      toast.error("Failed to create scope");
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Create Scope">
        <Button variant="outline" onClick={() => navigate("/scopes")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scopes
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <KeyRound className="h-5 w-5 mr-2" />
            New Scope
          </CardTitle>
          <CardDescription>
            Create a new scope for authorization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScopeForm onSave={handleSave} isLoading={isLoading} />
        </CardContent>
      </Card>
    </>
  );
};

export default NewScopePage;
