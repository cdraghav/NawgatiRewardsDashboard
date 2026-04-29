"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/loading";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email.trim()) {
      setIsLoading(false);
      setError("Email is required");
      toast.error("Email required", {
        description: "Please enter your email address.",
      });
      return;
    }

    if (!password.trim()) {
      setIsLoading(false);
      setError("Password is required");
      toast.error("Password required", {
        description: "Please enter your password.",
      });
      return;
    }

    try {
      const { error } = await authClient.signIn.email(
        {
          email,
          password,
        },
        {
          onSuccess: () => {
            setIsLoading(false);
            toast.success("Login successful", {
              description: "Redirecting to dashboard...",
            });
            router.push("/dashboard");
          },
          onError: (ctx) => {
            setIsLoading(false);
            const errorMessage = ctx.error.message || "Login failed";
            setError(errorMessage);
            toast.error("Login failed", {
              description: errorMessage,
            });
          },
        }
      );

      if (error) {
        setIsLoading(false);
        setError(error.message || "Login failed");
        toast.error("Login error", {
          description: error.message || "An unexpected error occurred.",
        });
      }
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error("Error", {
        description: errorMessage,
      });
    }
  }

  if (isLoading) {
    return <LoadingSpinner text="Logging you in..." />;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </Field>
              {error && (
                <div className="text-red-600 text-sm text-center border border-red-200 bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}
              <Field>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
