
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/layout/PageHeader";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserCircle, Key, FolderKey, Layers } from "lucide-react";
import { userService } from "@/api/userService";
import { groupService } from "@/api/groupService";
import { scopeService } from "@/api/scopeService";
import { resourceService } from "@/api/resourceService";
import { appService } from "@/api/appService";
import { User, Group, Scope, Resource, App } from "@/types";

interface StatusCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const StatusCard = ({ title, count, icon, href, color }: StatusCardProps) => {
  return (
    <Card>
      <CardContent className="p-6 flex items-center">
        <div className={`mr-4 p-3 rounded-full ${color}`}>
          {icon}
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>
        <div className="ml-auto">
          <Link
            to={href}
            className="text-sm font-medium text-admin-600 hover:underline"
          >
            View all
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, groupsData, scopesData, resourcesData, appsData] = await Promise.all([
          userService.getUsers(),
          groupService.getGroups(),
          scopeService.getScopes(),
          resourceService.getResources(),
          appService.getApps(),
        ]);
        
        setUsers(usersData);
        setGroups(groupsData);
        setScopes(scopesData);
        setResources(resourcesData);
        setApps(appsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = [
    { name: 'Users', active: users.filter(u => !u.disabled).length, disabled: users.filter(u => u.disabled).length },
    { name: 'Groups', active: groups.filter(g => g.active).length, disabled: groups.filter(g => !g.active).length },
    { name: 'Scopes', active: scopes.filter(s => s.active).length, disabled: scopes.filter(s => !s.active).length },
    { name: 'Apps', active: apps.filter(a => a.active).length, disabled: apps.filter(a => !a.active).length },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of your SSO system" />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Total Users"
          count={users.length}
          icon={<Users className="h-6 w-6 text-white" />}
          href="/users"
          color="bg-admin-500"
        />
        <StatusCard
          title="Total Groups"
          count={groups.length}
          icon={<UserCircle className="h-6 w-6 text-white" />}
          href="/groups"
          color="bg-admin-600"
        />
        <StatusCard
          title="Active Scopes"
          count={scopes.filter(scope => scope.active).length}
          icon={<Key className="h-6 w-6 text-white" />}
          href="/scopes"
          color="bg-admin-700"
        />
        <StatusCard
          title="Active Apps"
          count={apps.filter(app => app.active).length}
          icon={<Layers className="h-6 w-6 text-white" />}
          href="/apps"
          color="bg-admin-800"
        />
      </div>

      <div className="grid gap-4 mt-4 grid-cols-1">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  stackOffset="sign"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="active" fill="#1e88e5" name="Active" stackId="stack" />
                  <Bar dataKey="disabled" fill="#e57373" name="Inactive" stackId="stack" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 mt-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="px-2 py-3 bg-gray-50 rounded-md flex justify-between">
                <span>User <strong>johndoe</strong> was created</span>
                <span className="text-xs text-gray-500">5 min ago</span>
              </li>
              <li className="px-2 py-3 bg-gray-50 rounded-md flex justify-between">
                <span>Group <strong>Administrators</strong> was updated</span>
                <span className="text-xs text-gray-500">1 hour ago</span>
              </li>
              <li className="px-2 py-3 bg-gray-50 rounded-md flex justify-between">
                <span>Scope <strong>user:read</strong> was created</span>
                <span className="text-xs text-gray-500">2 hours ago</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm">Authentication Status</h4>
                <p className="text-green-600 flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-600 mr-2"></span>
                  Operational
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Authorization Status</h4>
                <p className="text-green-600 flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-600 mr-2"></span>
                  Operational
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Resource Server</h4>
                <p className="text-green-600 flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-600 mr-2"></span>
                  Operational
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Last System Update</h4>
                <p className="text-gray-600">Today at 9:30 AM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
