import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useRoomStore } from "@/stores/room.store";

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const selectedRoom = useRoomStore((s) => s.selectedRoom);

  if (!selectedRoom) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar - Icon only (60px) */}
      <aside className="hidden w-[60px] flex-col md:flex fixed inset-y-0 z-50">
        <Sidebar collapsed className="border-r border-border bg-sidebar" />
      </aside>

      {/* Mobile Menu Button - Fixed position */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-background">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r border-border">
            <Sidebar onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content - Centered with consistent padding */}
      <main className="flex-1 md:ml-[60px] h-full overflow-auto">
        <div className="min-h-full flex justify-center px-8 md:px-12 lg:px-16 pt-16 md:pt-10 pb-10">
          <div className="w-full max-w-4xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
