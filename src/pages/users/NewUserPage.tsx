
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { UserForm } from "@/components/forms/UserForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { userService } from "@/api/userService"
import { toast } from "sonner";

const NewUserPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (userData: any) => {
    try {
      setIsLoading(true);
      const newUser = await userService.createUser(userData);
      toast.success("User created successfully");
      navigate(`/users`);
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user");
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Create User">
        <Button variant="outline" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            New User
          </CardTitle>
          <CardDescription>
            Create a new user in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm onSave={handleSave} isLoading={isLoading} />
        </CardContent>
      </Card>
    </>
  );
};

export default NewUserPage;
