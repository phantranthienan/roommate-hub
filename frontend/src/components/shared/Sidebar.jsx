import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import {
  Home,
  CheckSquare,
  MessageSquare,
  ShoppingBag,
  BookOpen,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useRoomStore } from "@/stores/room.store";
import { useQueryClient } from "@tanstack/react-query";
import { RoomSwitcher } from "./RoomSwitcher";

export function Sidebar({ className, onClose, collapsed = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const clearRoom = useRoomStore((s) => s.clearRoom);
  const queryClient = useQueryClient();

  const routes = [
    { label: "Home",     icon: Home,        href: "/",         active: location.pathname === "/" },
    { label: "Chores",   icon: CheckSquare, href: "/chores",   active: location.pathname.startsWith("/chores") },
    { label: "Feedback", icon: MessageSquare, href: "/feedback", active: location.pathname.startsWith("/feedback") },
    { label: "Supplies", icon: ShoppingBag, href: "/supplies", active: location.pathname.startsWith("/supplies") },
    { label: "Rules",    icon: BookOpen,    href: "/rules",    active: location.pathname.startsWith("/rules") },
    { label: "Settings", icon: Settings,    href: "/settings", active: location.pathname.startsWith("/settings") },
  ];

  const handleLogout = () => {
    clearAuth();
    clearRoom();
    queryClient.clear();
    navigate("/auth");
  };

  // ── Desktop: icon-only collapsed sidebar ────────────────────────────────────
  if (collapsed) {
    return (
      <div className={cn("h-full bg-sidebar border-r flex flex-col items-center py-4", className)}>
        <div className="mb-6">
          <RoomSwitcher collapsed />
        </div>

        <nav className="flex-1 flex flex-col items-center gap-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              to={route.href}
              title={route.label}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
                route.active
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <route.icon className="h-5 w-5" />
            </Link>
          ))}
        </nav>

        <button
          title="Logout"
          onClick={handleLogout}
          className="flex items-center justify-center w-10 h-10 rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground mt-2"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    );
  }

  // ── Mobile: full sidebar with labels ────────────────────────────────────────
  return (
    <div className={cn("bg-sidebar h-full", className)}>
      <div className="py-4 h-full flex flex-col">
        <div className="px-4 flex-1">
          <div className="mb-6">
            <RoomSwitcher onSwitch={onClose} />
          </div>

          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={route.active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  route.active ? "bg-secondary text-primary font-medium" : "text-muted-foreground"
                )}
                asChild
                onClick={onClose}
              >
                <Link to={route.href}>
                  <route.icon className={cn("mr-3 h-5 w-5", route.active && "text-primary")} />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="px-4 mt-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={() => { onClose?.(); handleLogout(); }}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
