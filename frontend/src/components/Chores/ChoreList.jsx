import { cn } from "@/lib/cn";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useTasks, useToggleComplete, useDeleteTask } from "@/hooks/useTasks";
import { useAuthStore } from "@/stores/auth.store";
import { useMyRole } from "@/hooks/useMembers";
import { Loader2, Trash2 } from "lucide-react";

const priorityColors = {
  high: "text-orange-500",
  medium: "text-yellow-600",
  low: "text-muted-foreground",
};

function formatDueDate(dueDate) {
  if (!dueDate) return "";
  const date = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  const diff = due.getTime() - today.getTime();
  const days = Math.round(diff / 86400000);
  if (days === 0) return "Today";
  if (days === -1) return "Yesterday";
  if (days === 1) return "Tomorrow";
  if (days < 0) {
    const absDays = Math.abs(days);
    return `${absDays} ${absDays === 1 ? "day" : "days"} overdue`;
  }
  return `${days} ${days === 1 ? "day" : "days"}`;
}

export function ChoreList({ filter }) {
  const currentUser = useAuthStore((s) => s.user);
  const toggleComplete = useToggleComplete();
  const deleteTask = useDeleteTask();
  const { isOwnerOrAdmin } = useMyRole();

  const { data: tasks = [], isLoading, error } = useTasks({
    status: filter === "done" ? "completed" : undefined,
  });

  const activeTasks = tasks.filter((t) => t.status !== "completed");
  const filteredTasks =
    filter === "mine"
      ? activeTasks.filter((t) => t.assignedUser?.id === currentUser?.id)
      : filter === "upcoming"
      ? activeTasks.filter((t) => t.dueDate)
      : filter === "done"
      ? tasks
      : activeTasks;

  const handleToggle = (taskId) => {
    toggleComplete.mutate(taskId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading tasks...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive py-8 text-center">{error.message}</p>;
  }

  if (filteredTasks.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center">No tasks found</p>
    );
  }

  return (
    <div className="space-y-2">
      {filteredTasks.map((task) => {
        const isDone = task.status === "completed";
        const dueLabel = formatDueDate(task.dueDate);
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isDone;
        const assigneeName = task.assignedUser
          ? `${task.assignedUser.firstName} ${task.assignedUser.lastName}`
          : null;
        const isAssignedToMe = task.assignedUser?.id === currentUser?.id;

        return (
          <div
            key={task.id}
            className="flex flex-col gap-3 py-5 border-b border-border/40 last:border-0 sm:flex-row sm:items-center"
          >
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 text-muted-foreground font-semibold text-sm">
                {assigneeName ? assigneeName[0] : "?"}
              </div>

              <div className="flex-1 min-w-0">
                <p className={cn("font-medium", isDone && "line-through text-muted-foreground")}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  {dueLabel && (
                    <>
                      <span className={cn(isOverdue && "text-destructive")}>{dueLabel}</span>
                      <span>·</span>
                    </>
                  )}
                  {assigneeName && (
                    <div className="flex items-center gap-1.5">
                      <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                        {assigneeName[0]}
                      </span>
                      <span>{isAssignedToMe ? "You" : assigneeName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-auto flex-wrap sm:pl-2">
              {task.priority !== "low" && !isDone && (
                <span className={cn("text-xs font-medium uppercase tracking-wide", priorityColors[task.priority])}>
                  {task.priority}
                </span>
              )}

              {isOwnerOrAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteTask.mutate(task.id)}
                  disabled={deleteTask.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

              {(isOwnerOrAdmin || isAssignedToMe) && (
                <Checkbox
                  checked={isDone}
                  onCheckedChange={() => handleToggle(task.id)}
                  className="h-6 w-6 rounded-full border-2"
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
