import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Factory, Truck, Shield, User } from "lucide-react";

// Custom components for role selection
function RoleButton({ icon: Icon, label, description, onClick, selected }: {
  icon: React.FC<any>;
  label: string;
  description: string;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <Button
      variant={selected ? "default" : "outline"}
      className={`w-full h-28 flex flex-col items-center justify-center space-y-2 ${selected ? "border-2 border-primary" : ""}`}
      onClick={onClick}
    >
      <Icon className="h-8 w-8" />
      <div className="text-center">
        <div className="font-medium">{label}</div>
        <div className="text-xs opacity-70">{description}</div>
      </div>
    </Button>
  );
}

export default function AuthPage() {
  const [_, setLocation] = useLocation();
  const { loginMutation } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const formSchema = z.object({
    identifier: z.string().min(1, "Email or mobile number is required"),
    password: z.string().min(1, "Password is required"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedRole) return;

    loginMutation.mutate(
      {
        username: values.identifier,
        password: values.password,
        role: selectedRole,
      },
      {
        onSuccess: () => setLocation("/"),
      }
    );
  }

  const { user, isLoading } = useAuth();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (user && !redirected) {
      setRedirected(true);
      setLocation("/");
    }
  }, [user, redirected, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Column - Login Form */}
      <div className="flex-1 p-6 sm:p-10 flex items-center justify-center bg-white">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="text-5xl font-extrabold text-primary">
                <span>g</span><span className="opacity-90">S</span><span className="opacity-80">c</span>
              </span>
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-sm">
              Login to access the Gate Management System
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Select Your Role</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <RoleButton
                    icon={Factory}
                    label="Manufacturer"
                    description="Material producers"
                    onClick={() => setSelectedRole("manufacturer")}
                    selected={selectedRole === "manufacturer"}
                  />
                  <RoleButton
                    icon={Truck}
                    label="Transporter"
                    description="Logistics providers"
                    onClick={() => setSelectedRole("transporter")}
                    selected={selectedRole === "transporter"}
                  />
                  <RoleButton
                    icon={Shield}
                    label="Security"
                    description="Gate operators"
                    onClick={() => setSelectedRole("security")}
                    selected={selectedRole === "security"}
                  />
                </div>
              </div>

              {/* Login Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email / Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email or mobile number" {...field} />
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
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-right text-sm">
                    <a href="#" className="text-primary hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <Button type="submit" className="w-full" disabled={loginMutation.isPending || !selectedRole}>
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Hero Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/90 to-primary/70 text-white p-10 lg:p-16 flex-col justify-center">
        <div className="max-w-lg">
          <div className="flex items-center mb-6">
            <span className="text-5xl font-extrabold">
              <span>g</span><span className="opacity-90">S</span><span className="opacity-80">c</span>
            </span>
            <div className="h-10 w-1 bg-white opacity-50 mx-4" />
            <div className="text-xl font-light">Gate System Control</div>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Smart Gate Management System</h1>
          <p className="text-base lg:text-lg mb-8 opacity-90">
            Monitor and manage vehicle movement in real-time — from entry to exit — with ease.
          </p>
          <div className="space-y-4">
            {[
              {
                icon: <Shield className="h-6 w-6" />,
                title: "Enhanced Security",
                desc: "Secure entry and exit with ANPR integration"
              },
              {
                icon: <Truck className="h-6 w-6" />,
                title: "Logistics Optimization",
                desc: "Efficient yard and bay management"
              },
              {
                icon: <User className="h-6 w-6" />,
                title: "Role-Based Access",
                desc: "Secure workflows based on user responsibilities"
              }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start">
                <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">{item.icon}</div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="opacity-90 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    
  );
}
