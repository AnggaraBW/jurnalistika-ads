import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export function useAuth() {
  const { data: user, error, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchInterval: 100 * 1000,
  });

  return {
    error,
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
