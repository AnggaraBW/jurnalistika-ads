import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Register from "@/pages/register";
import AdvertiserDashboard from "@/pages/advertiser/dashboard";
import CreateAd from "@/pages/advertiser/create-ad";
import MyAds from "@/pages/advertiser/my-ads";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminAds from "./pages/admin/ads";
import AdminAdDetail from "./pages/admin/ad-detail";
import AdminNotifications from "./pages/admin/notifications";
import AdvertiserAdDetail from "./pages/advertiser/ad-detail";
import { useEffect } from "react";
import AdminAdCategories from "./pages/admin/categories";

function Router() {
  const { error, isAuthenticated, isLoading, user } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Debug logging
    if (process.env.NODE_ENV === "development") {
      console.log(
        "Auth State - isAuthenticated:",
        isAuthenticated,
        "isLoading:",
        isLoading,
        "user:",
        user
      );
    }
    if (error && (error as any).status === 401) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, user, error, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // Role-based routing
  if ((user as any)?.role === "admin" && isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={AdminDashboard} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/ads" component={AdminAds} />
        <Route path="/ads/:id" component={AdminAdDetail} />
        <Route path="/categories" component={AdminAdCategories} />
        <Route path="/notifications" component={AdminNotifications} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Advertiser routes
  return (
    <Switch>
      <Route path="/" component={AdvertiserDashboard} />
      <Route path="/advertiser/dashboard" component={AdvertiserDashboard} />
      <Route path="/advertiser/create-ad" component={CreateAd} />
      <Route path="/advertiser/my-ads" component={MyAds} />
      <Route path="/advertiser/:id" component={AdvertiserAdDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {

  // const queryClient = new QueryClient({
  //   queryCache: new QueryCache({
  //     onError: (error) => {
  //       console.log("captured error by the query client:", error.message );

  //     }
  //   })
  // });

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
