import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  Home,
  Scale,
  Map,
  Calendar,
  LogOut,
  BarChart2,
  User,
  Users,
  Loader2,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Define navigation items with role-based access control
const navigationConfig = [
  {
    name: "Dashboard",
    path: "/",
    icon: BarChart2,
    roles: ["admin", "manufacturer", "transporter", "security"],
  },
  {
    name: "Gate-In (Entry)",
    path: "/gate-in",
    icon: Home,
    roles: ["admin", "security"],
  },
  {
    name: "Weighbridge Entry",
    path: "/weighbridge-entry",
    icon: Scale,
    roles: ["admin", "security"],
  },
  {
    name: "Yard Allocation",
    path: "/yard-allocation",
    icon: Map,
    roles: ["admin", "security", "manufacturer"],
  },
  {
    name: "Bay Assignment",
    path: "/bay-assignment",
    icon: Calendar,
    roles: ["admin", "security", "manufacturer"],
  },
  {
    name: "Exit & Gate-Out",
    path: "/exit-weighbridge",
    icon: LogOut,
    roles: ["admin", "security"],
  },
  {
    name: "User Management",
    path: "/user-management",
    icon: Users,
    roles: ["admin"],
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [open, setOpen] = useState(false);

  const navigation = user
    ? navigationConfig.filter((item) => item.roles.includes(user.role))
    : [];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-primary text-white px-4 py-3">
        <div className="text-xl font-bold tracking-wide">
          <span>g</span>
          <span className="opacity-90">S</span>
          <span className="opacity-80">c</span>
        </div>
        <button onClick={() => setOpen(!open)} aria-label="Toggle Sidebar">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Backdrop for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:static md:block"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 bg-primary-dark">
            <span className="text-3xl font-extrabold">
              <span>g</span>
              <span className="opacity-90">S</span>
              <span className="opacity-80">c</span>
            </span>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                    isActive
                      ? "bg-primary-light text-white"
                      : "text-white hover:bg-primary-light"
                  )}
                  onClick={() => setOpen(false)} // close on mobile
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {user && (
            <div className="border-t border-primary-light p-4">
              <div className="flex items-center mb-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-white">
                  <User className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs capitalize opacity-75">{user.role}</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="w-full"
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                Log Out
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
