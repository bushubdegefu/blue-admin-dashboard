import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/layout/PageHeader";
import ErrorBoundary from "@/components/common/ErrorBoundary";

const swaggerUrls: Record<string, string> = {
    "Admin Portal": "/blue_admin/docs/",
    "Shipping Portal": "/blue_admin/docs/",
};

const SwaggerPage = () => {
    const [selectedApp, setSelectedApp] = useState("App One");

    return (
        <>
            <PageHeader
                title="API Documentation"
                description="View API reference for different applications"
            />

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="api">API Reference</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome to API Docs</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-4">
                            <p>
                                This Swagger API documentation is provided for development and integration purposes for supported applications.
                            </p>
                            <p>
                                <strong>⚠️ Use with caution:</strong> It is strongly advised that all administrative tasks and operations be performed through the official Admin UI whenever possible.
                            </p>
                            <p>
                                Making <strong>POST, PUT, or DELETE</strong> API calls directly through Swagger can affect critical system data.
                                Do not execute these operations unless you fully understand the impact of the changes.
                            </p>
                            <p>
                                For questions or support, please contact the platform maintainers or development team.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>


                <TabsContent value="api">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Select Application</h2>
                        <Select
                            value={selectedApp}
                            onValueChange={(value) => setSelectedApp(value)}
                        >
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder="Select App" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(swaggerUrls).map((app) => (
                                    <SelectItem key={app} value={app}>
                                        {app}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="border rounded-md overflow-hidden h-[80vh]">
                        <ErrorBoundary>
                            <iframe
                                src={swaggerUrls[selectedApp]}
                                title="Swagger UI"
                                width="100%"
                                height="100%"
                                style={{ border: "none" }}
                            />
                        </ErrorBoundary>
                    </div>
                </TabsContent>
            </Tabs>
        </>
    );
};

export default SwaggerPage;
