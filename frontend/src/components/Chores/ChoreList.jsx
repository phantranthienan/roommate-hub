import { useState } from "react";
import { cn } from "@/lib/cn";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTasks, useMarkDone, useDeleteTask, useUpdateTask, useRenewTask } from "@/hooks/useTasks";
import { useAuthStore } from "@/stores/auth.store";
import { useMembers, useMyRole } from "@/hooks/useMembers";
import { Loader2, Trash2, RefreshCw, CalendarIcon, Check } from "lucide-react";

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

function formatDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function toISODate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function ChoreList({ filter }) {
  const currentUser = useAuthStore((s) => s.user);
  const markDone = useMarkDone();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const renewTask = useRenewTask();
  const { isOwnerOrAdmin } = useMyRole();
  const { data: members = [] } = useMembers();

  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [renewingTask, setRenewingTask] = useState(null);
  const [renewDate, setRenewDate] = useState(undefined);
  const [renewAssignee, setRenewAssignee] = useState("");
  const [showRenewCalendar, setShowRenewCalendar] = useState(false);

  const { data: tasks = [], isLoading, error } = useTasks({
    status: filter === "done" ? "done" : undefined,
  });

  const activeTasks = tasks.filter((t) => t.status !== "done");
  const filteredTasks =
    filter === "mine"
      ? activeTasks.filter((t) => t.assignedUser?.id === currentUser?.id)
      : filter === "upcoming"
      ? activeTasks.filter((t) => t.dueDate)
      : filter === "done"
      ? tasks
      : activeTasks;

  const handleMarkDone = (taskId) => {
    markDone.mutate(taskId);
  };

  const handleAssign = (taskId, memberId) => {
    updateTask.mutate({
      taskId,
      data: { assignedTo: memberId === "unassigned" ? null : memberId },
    });
  };

  const openRenewDialog = (task) => {
    setRenewingTask(task);
    setRenewDate(undefined);
    setRenewAssignee(task.assignedTo ?? "");
    setShowRenewCalendar(false);
    setRenewDialogOpen(true);
  };

  const handleRenew = async () => {
    if (!renewingTask || !renewDate) return;
    await renewTask.mutateAsync({
      taskId: renewingTask.id,
      data: {
        dueDate: toISODate(renewDate),
        assignedTo: renewAssignee || undefined,
      },
    });
    setRenewDialogOpen(false);
    setRenewingTask(null);
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
    <>
      <div className="space-y-2">
        {filteredTasks.map((task) => {
          const isDone = task.status === "done";
          const dueLabel = isDone ? "" : formatDueDate(task.dueDate);
          const isOverdue = !isDone && task.dueDate && new Date(task.dueDate) < new Date();
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
                  <p className={cn("font-medium", isDone && "text-muted-foreground")}>
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
                {isOwnerOrAdmin && !isDone && (
                  <Select
                    value={task.assignedTo ?? "unassigned"}
                    onValueChange={(v) => handleAssign(task.id, v)}
                    disabled={updateTask.isPending}
                  >
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue placeholder="Assign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.userId === currentUser?.id
                            ? `Me (${m.firstName})`
                            : `${m.firstName} ${m.lastName}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {isOwnerOrAdmin && isDone && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => openRenewDialog(task)}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Renew
                  </Button>
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

                {isDone ? (
                  <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 border-0">
                    <Check className="h-3 w-3" />
                    Done
                  </Badge>
                ) : (isOwnerOrAdmin || isAssignedToMe) ? (
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => handleMarkDone(task.id)}
                    className="h-6 w-6 rounded-full border-2"
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Renew Task</DialogTitle>
            <DialogDescription>
              Set a new due date to reopen "{renewingTask?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">Due Date</Label>
              <div className="col-span-3 space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => setShowRenewCalendar((s) => !s)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className={renewDate ? "" : "text-muted-foreground"}>
                    {renewDate ? formatDate(renewDate) : "Pick a date"}
                  </span>
                </Button>
                {showRenewCalendar && (
                  <div className="rounded-md border flex justify-center">
                    <Calendar
                      mode="single"
                      selected={renewDate}
                      onSelect={(d) => {
                        setRenewDate(d);
                        setShowRenewCalendar(false);
                      }}
                      disabled={{ before: new Date() }}
                      initialFocus
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Assignee</Label>
              <Select value={renewAssignee} onValueChange={setRenewAssignee}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Keep current" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.userId === currentUser?.id
                        ? `Me (${m.firstName})`
                        : `${m.firstName} ${m.lastName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleRenew}
              disabled={!renewDate || renewTask.isPending}
            >
              {renewTask.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Renew Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
