"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, AlertCircle } from "lucide-react";
import { loginUser, setAuth } from "@/utils/auth";
import { useAuth } from "@/context/AuthContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Zod validation schema
const loginSchema = z.object({
  email: z
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const { refreshAuth } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await loginUser(data.email, data.password);
      setAuth(response.token, response.user);
      refreshAuth();
      router.push("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      form.setError("root", {
        type: "manual",
        message: errorMessage,
      });
      if (typeof window !== "undefined") {
        console.error("Login error:", errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">SpendWise</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {form.formState.errors.root && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                      />
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
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-muted rounded-lg text-xs">
            <p className="font-semibold mb-1">Demo Credentials:</p>
            <p className="text-muted-foreground">
              Email: <code className="bg-background px-1 rounded">demo@example.com</code>
            </p>
            <p className="text-muted-foreground">
              Password: <code className="bg-background px-1 rounded">demo</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
