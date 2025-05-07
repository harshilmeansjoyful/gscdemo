import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";
import GateIn from "@/pages/gate-in";
import WeighbridgeEntry from "@/pages/weighbridge-entry";
import YardAllocation from "@/pages/yard-allocation";
import BayAssignment from "@/pages/bay-assignment";
import ExitWeighbridge from "@/pages/exit-weighbridge";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import UserManagement from "@/pages/user-management";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected Routes with Sidebar Layout */}
      <ProtectedRoute path="/" component={() => (
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
            <Dashboard />
          </main>
        </div>
      )} />
      
      {/* Admin only routes */}
      <ProtectedRoute 
        path="/user-management" 
        allowedRoles={["admin"]}
        component={() => (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
              <UserManagement />
            </main>
          </div>
        )} 
      />
      
      {/* Security guard routes */}
      <ProtectedRoute 
        path="/gate-in" 
        allowedRoles={["admin", "security"]}
        component={() => (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
              <GateIn />
            </main>
          </div>
        )} 
      />
      
      {/* Weighbridge operator routes */}
      <ProtectedRoute 
        path="/weighbridge-entry" 
        allowedRoles={["admin", "security"]}
        component={() => (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
              <WeighbridgeEntry />
            </main>
          </div>
        )} 
      />
      
      <ProtectedRoute 
        path="/exit-weighbridge" 
        allowedRoles={["admin", "security"]}
        component={() => (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
              <ExitWeighbridge />
            </main>
          </div>
        )} 
      />
      
      {/* Yard management routes - accessible to security and manufacturers */}
      <ProtectedRoute 
        path="/yard-allocation" 
        allowedRoles={["admin", "security", "manufacturer"]}
        component={() => (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
              <YardAllocation />
            </main>
          </div>
        )} 
      />
      
      <ProtectedRoute 
        path="/bay-assignment" 
        allowedRoles={["admin", "security", "manufacturer"]}
        component={() => (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
              <BayAssignment />
            </main>
          </div>
        )} 
      />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
