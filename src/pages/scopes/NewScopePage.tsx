
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import PageHeader from "@/components/layout/PageHeader";
import { ScopeForm } from "@/components/forms/ScopeForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { scopeService } from "@/api/scopeService";
import { toast } from "sonner";

const NewScopePage = () => {
  const navigate = useNavigate();

  // Use React Query mutation for creating a scope
  const createScopeMutation = useMutation({
    mutationFn: (scopeData: any) => scopeService.createScope(scopeData),
    onSuccess: (data) => {
      toast.success("Scope created successfully");
      navigate(`/admin/scopes`);
    },
    onError: (error: any) => {
      console.error("Error creating scope:", error);
      toast.error("Failed to create scope");
    }
  });

  const handleSave = async (scopeData: any) => {
    createScopeMutation.mutate(scopeData);
  };

  return (
    <>
      <PageHeader title="Create Scope">
        <Button variant="outline" onClick={() => navigate("/admin/scopes")}>
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
          <ScopeForm onSave={handleSave} isLoading={createScopeMutation.isPending} />
        </CardContent>
      </Card>
    </>
  );
};

export default NewScopePage;
