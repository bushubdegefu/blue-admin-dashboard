
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { UserRound, Users, Key, FileCode, AppWindow } from "lucide-react";
import { userService } from "@/api/userService";
import { groupService } from "@/api/groupService";
import { scopeService } from "@/api/scopeService";
import { resourceService } from "@/api/resourceService";
import { appService } from "@/api/appService";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Fetch summary data using React Query
  const { data: users = { total: 0 } } = useQuery({
    queryKey: ["users-count"],
    queryFn: () => userService.getUsers({ page: 1, size: 1 }),
    select: (data) => ({ total: data.total || 0 }),
  });

  const { data: groups = { total: 0 } } = useQuery({
    queryKey: ["groups-count"],
    queryFn: () => groupService.getGroups({ page: 1, size: 1 }),
    select: (data) => ({ total: data.total || 0 }),
  });

  const { data: scopes = { total: 0 } } = useQuery({
    queryKey: ["scopes-count"],
    queryFn: () => scopeService.getScopes({ page: 1, size: 1 }),
    select: (data) => ({ total: data.total || 0 }),
  });

  const { data: resources = { total: 0 } } = useQuery({
    queryKey: ["resources-count"],
    queryFn: () => resourceService.getResources({ page: 1, size: 1 }),
    select: (data) => ({ total: data.total || 0 }),
  });

  const { data: apps = { total: 0 } } = useQuery({
    queryKey: ["apps-count"],
    queryFn: () => appService.getApps({ page: 1, size: 1 }),
    select: (data) => ({ total: data.total || 0 }),
  });

  // Define the data for the summary cards
  const summaryItems = [
    {
      title: "Users",
      icon: <UserRound className="h-5 w-5 text-admin-500" />,
      count: users.total,
      description: "Total users in the system",
      link: "/users",
    },
    {
      title: "Groups",
      icon: <Users className="h-5 w-5 text-admin-600" />,
      count: groups.total,
      description: "User groups defined",
      link: "/groups",
    },
    {
      title: "Scopes",
      icon: <Key className="h-5 w-5 text-admin-700" />,
      count: scopes.total,
      description: "Authorization scopes",
      link: "/scopes",
    },
    {
      title: "Resources",
      icon: <FileCode className="h-5 w-5 text-admin-800" />,
      count: resources.total,
      description: "API resources registered",
      link: "/resources",
    },
    {
      title: "Applications",
      icon: <AppWindow className="h-5 w-5 text-admin-900" />,
      count: apps.total,
      description: "Connected applications",
      link: "/apps",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {summaryItems.map((item, index) => (
          <Link to={item.link} key={index} className="no-underline">
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  {item.icon}
                </div>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{item.count}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
