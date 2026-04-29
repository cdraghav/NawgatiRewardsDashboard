import { authClient } from "@/lib/auth-client";

export function useAuth() {
  const session = authClient.useSession();

  return {
    user: session.data?.user,
    session: session.data?.session,
    isAuthenticated: !!session.data,
    isLoading: session.isPending,
    error: session.error,
    refetch: session.refetch,
  };
}
