import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, error, isLoading } = useQuery({
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
