import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appService } from "@/api/appService";
import { scopeService } from "@/api/scopeService";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RelatedItemsCard } from "@/components/common/RelatedItemsCard";
import { ChevronRight } from "lucide-react";

const AppDetailsPage = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newAppName, setNewAppName] = useState("");

  // Fetch app details
  const { data: app, isLoading: isAppLoading, error: appError } = useQuery({
    queryKey: ['app', appId],
    queryFn: () => appService.getAppById(appId),
    enabled: !!appId,
  });

  // Fetch scopes for the app
  const { data: appScopes, isLoading: isAppScopesLoading, error: appScopesError } = useQuery({
    queryKey: ['app-scopes', appId],
    queryFn: () => appService.getAppScopes(appId),
    enabled: !!appId,
  });

  // Fetch available scopes
  const { data: availableScopes, isLoading: isAvailableScopesLoading, error: availableScopesError } = useQuery({
    queryKey: ['available-scopes'],
    queryFn: () => scopeService.getScopes(),
  });

  useEffect(() => {
    if (app) {
      setNewAppName(app.name);
    }
  }, [app]);

  // Handlers for adding and removing scopes
  const handleAddScope = async (scopeId: string): Promise<void> => {
  try {
    await appService.addAppScope({
      appId: appId,
      scopeId: scopeId
    });
    queryClient.invalidateQueries({ queryKey: ['app-scopes', appId] });
    toast.success("Scope added successfully");
    return Promise.resolve();
  } catch (error: any) {
    toast.error(`Failed to add scope: ${error.message}`);
    return Promise.resolve();
  }
};

const handleRemoveScope = async (scopeId: string): Promise<void> => {
  try {
    await appService.deleteAppScope({
      appId: appId,
      scopeId: scopeId
    });
    queryClient.invalidateQueries({ queryKey: ['app-scopes', appId] });
    toast.success("Scope removed successfully");
    return Promise.resolve();
  } catch (error: any) {
    toast.error(`Failed to remove scope: ${error.message}`);
    return Promise.resolve();
  }
};


  const handleEditName = () => {
    setIsEditingName(true);
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setNewAppName(app.name);
  };

  const handleNameUpdate = async (newName: string): Promise<void> => {
  try {
    await appService.updateApp({
      appId: app.id,
      appData: { name: newName }
    });
    queryClient.invalidateQueries({ queryKey: ['app', appId] });
    toast.success("App name updated");
    return Promise.resolve();
  } catch (error: any) {
    toast.error(`Failed to update app name: ${error.message}`);
    return Promise.reject(error);
  }
};


  const handleSaveName = async () => {
    if (newAppName && newAppName !== app.name) {
      await handleNameUpdate(newAppName);
    }
    setIsEditingName(false);
  };

  if (isAppLoading) {
    return <div>Loading app details...</div>;
  }

  if (appError) {
    return <div>Error: {appError.message}</div>;
  }

  if (!app) {
    return <div>App not found</div>;
  }

  const availableScopesForApp = availableScopes?.data?.filter(scope => {
    return !appScopes?.data?.some(appScope => appScope.id === scope.id);
  }) || [];

  return (
    <>
      <PageHeader
        title={isEditingName ? (
          <Input
            value={newAppName}
            onChange={(e) => setNewAppName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveName();
              }
            }}
          />
        ) : (
          <div className="flex items-center">
            {app.name}
            <Button variant="ghost" size="sm" onClick={handleEditName}>
              Edit
            </Button>
          </div>
        )}
        description="Manage app details and associated scopes"
      >
        {!isEditingName && (
          <Button variant="outline" onClick={handleCancelEditName}>
            Cancel
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">App Details</h3>
              <p>
                <strong>ID:</strong> {app.id}
              </p>
              <p>
                <strong>Name:</strong> {app.name}
              </p>
            </div>
          </CardContent>
        </Card>

        <RelatedItemsCard
          title={`Scopes (${appScopes?.data?.length || 0})`}
          availableItems={availableScopesForApp}
          attachedItems={appScopes?.data || []}
          entityType="Scope"
          onAddItems={handleAddScope}
          onRemoveItem={handleRemoveScope}
          canManage={true}
          emptyMessage="No scopes associated with this app."
        />
      </div>
    </>
  );
};

export default AppDetailsPage;
