
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Lock, User } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login({
        grant_type: "authorization_code",
        email: values.username,
        password: values.password,
        token: "Bearer",
      });
      navigate("/")
      // Auth context will handle the redirect and toast notifications
    } catch (error) {
      console.error("Login error:", error);
      // Error is handled by the auth context
    } finally {
    
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow-lg rounded-lg">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-admin-500 flex items-center justify-center">
            <span className="text-white text-xl font-bold">BA</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Blue Admin SSO</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to access your account</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input
                          {...field}
                          placeholder="Enter your username"
                          className="pl-10"
                          disabled={isLoading}
                          data-testid="username-input"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                          disabled={isLoading}
                          data-testid="password-input"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-admin-600 hover:bg-admin-700"
              disabled={isLoading}
              data-testid="login-button"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 rounded-full border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin mr-2"></div>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>

            <div className="text-center text-sm mt-4">
              <p className="text-gray-500">
                Demo credentials: <br />
                Username: <span className="font-semibold">admin</span>, Password: <span className="font-semibold">password</span>
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Connects to localhost:7500/api/v1 - Falls back to mock login if server is unavailable
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
