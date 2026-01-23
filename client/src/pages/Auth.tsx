import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useLogin, useRegister, useUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function Auth() {
  const [_, setLocation] = useLocation();
  const { data: user } = useUser();
  const { mutateAsync: login } = useLogin();
  const { mutateAsync: register } = useRegister();

  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 bg-muted/30">
        <div className="w-full max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm onLogin={login} />
            </TabsContent>
            
            <TabsContent value="register">
              <RegisterForm onRegister={register} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

function LoginForm({ onLogin }: { onLogin: (data: any) => Promise<any> }) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setError(null);
      await onLogin(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-serif">Sign in</CardTitle>
        <CardDescription>
          Enter your username and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</div>}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username / Email</Label>
            <Input id="username" {...form.register("username")} />
            {form.formState.errors.username && (
              <p className="text-red-500 text-xs">{form.formState.errors.username.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...form.register("password")} />
             {form.formState.errors.password && (
              <p className="text-red-500 text-xs">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RegisterForm({ onRegister }: { onRegister: (data: InsertUser) => Promise<any> }) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      role: "customer"
    }
  });

  const onSubmit = async (data: InsertUser) => {
    try {
      setError(null);
      await onRegister(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-serif">Create an account</CardTitle>
        <CardDescription>
          Enter your details below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</div>}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reg-name">Full Name</Label>
              <Input id="reg-name" {...form.register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-phone">Phone</Label>
              <Input id="reg-phone" {...form.register("phone")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-username">Username / Email</Label>
            <Input id="reg-username" {...form.register("username")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <Input id="reg-password" type="password" {...form.register("password")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-address">Address</Label>
            <Input id="reg-address" {...form.register("address")} />
          </div>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
             {form.formState.isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
