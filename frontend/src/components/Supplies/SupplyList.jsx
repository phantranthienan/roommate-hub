import { cn } from "@/lib/cn";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, ListTodo, Loader2, Trash2 } from "lucide-react";
import { useItems, useUpdateItemStatus, useDeleteItem } from "@/hooks/useItems";
import { useMyRole } from "@/hooks/useMembers";
import { AddChoreModal } from "@/components/Chores/AddChoreModal";

const statusIconClass = {
  available: "bg-green-500/10",
  low: "bg-yellow-500/10",
  out_of_stock: "bg-destructive/10",
};

const statusPackageClass = {
  available: "text-green-600",
  low: "text-yellow-600",
  out_of_stock: "text-destructive",
};

export function SupplyList() {
  const { data: items = [], isLoading, error } = useItems();
  const updateItemStatus = useUpdateItemStatus();
  const deleteItem = useDeleteItem();
  const { isOwnerOrAdmin } = useMyRole();

  const [choreModalOpen, setChoreModalOpen] = useState(false);
  const [choreInitialTitle, setChoreInitialTitle] = useState("");

  const handleAddTask = (itemName) => {
    setChoreInitialTitle(`Buy ${itemName}`);
    setChoreModalOpen(true);
  };

  const handleStatusChange = (itemId, status) => {
    updateItemStatus.mutate({ itemId, status });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading supplies...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive py-8 text-center">{error.message}</p>;
  }

  if (items.length === 0) {
    return <p className="text-muted-foreground py-8 text-center">No items yet.</p>;
  }

  return (
    <>
      <AddChoreModal
        open={choreModalOpen}
        onOpenChange={setChoreModalOpen}
        initialTitle={choreInitialTitle}
      />

      <div className="space-y-2">
        {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 py-5 border-b border-border/40 last:border-0 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div
                  className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                    statusIconClass[item.status]
                  )}
                >
                  <Package className={cn("h-5 w-5", statusPackageClass[item.status])} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.name}</p>
                  {item.category && (
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-auto flex-wrap sm:pl-2">
                <Select
                  value={item.status}
                  onValueChange={(v) => handleStatusChange(item.id, v)}
                  disabled={updateItemStatus.isPending}
                >
                  <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">In Stock</SelectItem>
                    <SelectItem value="low">Running Low</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>

                {isOwnerOrAdmin && item.status !== "available" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 shrink-0"
                    onClick={() => handleAddTask(item.name)}
                  >
                    <ListTodo className="h-4 w-4" />
                    Add Task
                  </Button>
                )}

                {isOwnerOrAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteItem.mutate(item.id)}
                    disabled={deleteItem.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
        ))}
      </div>
    </>
  );
}
