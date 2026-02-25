import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Loader2, CalendarIcon, X } from "lucide-react";
import { useCreateTask } from "@/hooks/useTasks";
import { useMembers } from "@/hooks/useMembers";
import { useAuthStore } from "@/stores/auth.store";

function formatDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function toISODate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function AddChoreModal({ open: openProp, onOpenChange: onOpenChangeProp, initialTitle } = {}) {
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? openProp : internalOpen;

  const [title, setTitle] = useState(initialTitle ?? "");
  const [assignedTo, setAssignedTo] = useState("");
  const [date, setDate] = useState(undefined);
  const [showCalendar, setShowCalendar] = useState(false);

  const createTask = useCreateTask();
  const { data: members = [] } = useMembers();
  const currentUser = useAuthStore((s) => s.user);
  const myMember = members.find((m) => m.userId === currentUser?.id);

  useEffect(() => {
    if (open) {
      setTitle(initialTitle ?? "");
    }
  }, [open, initialTitle]);

  const resetForm = () => {
    setTitle("");
    setAssignedTo("");
    setDate(undefined);
    setShowCalendar(false);
  };

  const handleOpenChange = (next) => {
    if (isControlled) {
      onOpenChangeProp?.(next);
    } else {
      setInternalOpen(next);
    }
    if (!next) {
      resetForm();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createTask.mutateAsync({
      title,
      assignedTo: assignedTo || undefined,
      dueDate: date ? toISODate(date) : undefined,
    });
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Chore
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Add New Chore</DialogTitle>
          <DialogDescription>
            Create a task for your roommates.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Clean Kitchen"
                className="col-span-3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Assignee</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select roommate" />
                </SelectTrigger>
                <SelectContent>
                  {currentUser && myMember && (
                    <SelectItem value={myMember.id}>Me ({currentUser.firstName})</SelectItem>
                  )}
                  {members
                    .filter((m) => m.userId !== currentUser?.id)
                    .map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.firstName} {m.lastName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">Due Date</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 justify-start text-left font-normal"
                    onClick={() => setShowCalendar((s) => !s)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className={date ? "" : "text-muted-foreground"}>
                      {date ? formatDate(date) : "Pick a date"}
                    </span>
                  </Button>
                  {date && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => { setDate(undefined); setShowCalendar(false); }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {showCalendar && (
                  <div className="rounded-md border flex justify-center">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => {
                        setDate(d);
                        setShowCalendar(false);
                      }}
                      disabled={{ before: new Date() }}
                      initialFocus
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createTask.isPending}>
              {createTask.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Chore
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
