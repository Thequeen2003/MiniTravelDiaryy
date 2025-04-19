import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Form validation schema
const authSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Login form
  const loginForm = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLoginSubmit = async (data: AuthFormValues) => {
    try {
      loginMutation.mutate(data, {
        onSuccess: () => {
          toast({
            title: "Login successful",
            description: "Welcome back to your Travel Diary!",
          });
          setLocation("/");
        },
        onError: (error: Error) => {
          toast({
            title: "Login failed",
            description: error.message || "Please check your credentials and try again.",
            variant: "destructive",
          });
        },
      });
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const onRegisterSubmit = async (data: AuthFormValues) => {
    try {
      registerMutation.mutate(data, {
        onSuccess: () => {
          toast({
            title: "Registration successful",
            description: "Welcome to Travel Diary! You're now logged in.",
          });
          setLocation("/");
        },
        onError: (error: Error) => {
          toast({
            title: "Registration failed",
            description: error.message || "Please try again with a different username.",
            variant: "destructive",
          });
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Auth form column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md p-4">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
            <div className="mb-4 text-center">
              <h1 className="text-3xl font-bold mb-2">Travel Diary</h1>
              <p className="text-muted-foreground">Capture and cherish your travel memories</p>
            </div>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome back</CardTitle>
                  <CardDescription>Login to access your travel memories</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Button variant="link" className="p-0" onClick={() => setActiveTab("register")}>
                      Register
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>Start logging your adventures today</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Register"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Button variant="link" className="p-0" onClick={() => setActiveTab("login")}>
                      Login
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hero column */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-primary/20 to-primary/30 items-center justify-center">
        <div className="max-w-md p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Capture Your Journey</h2>
          <p className="mb-6">
            Travel Diary helps you document and cherish your travel memories. 
            Capture photos, locations, and moments from your adventures around the world.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-white/10 backdrop-blur p-4 text-center">
              <h3 className="font-semibold mb-2">Document Memories</h3>
              <p className="text-sm">Store photos and captions from your journeys</p>
            </div>
            <div className="rounded-lg bg-white/10 backdrop-blur p-4 text-center">
              <h3 className="font-semibold mb-2">Track Locations</h3>
              <p className="text-sm">Automatically record where your memories were made</p>
            </div>
            <div className="rounded-lg bg-white/10 backdrop-blur p-4 text-center">
              <h3 className="font-semibold mb-2">Share Experiences</h3>
              <p className="text-sm">Share specific memories with friends and family</p>
            </div>
            <div className="rounded-lg bg-white/10 backdrop-blur p-4 text-center">
              <h3 className="font-semibold mb-2">Revisit Anytime</h3>
              <p className="text-sm">Look back at your adventures whenever you want</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}