import { cn } from "@/lib/cn";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { useTasks } from "@/hooks/useTasks";

export function ChoresWidget({ className }) {
  const { data: tasks = [] } = useTasks({ status: "pending" });
  const chores = tasks.slice(0, 3);

  return (
    <section className={cn("", className)}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/40">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Upcoming Chores
        </h2>
        <Link to="/chores" className="text-sm text-primary hover:underline">
          View All
        </Link>
      </div>

      <div className="space-y-1">
        {chores.map((chore) => {
          const assigneeName = chore.assignedUser
            ? `${chore.assignedUser.firstName} ${chore.assignedUser.lastName}`
            : null;
          return (
            <div
              key={chore.id}
              className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0"
            >
              <Checkbox
                checked={false}
                className="h-5 w-5 rounded-full border-2"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{chore.title}</p>
                <p className="text-xs text-muted-foreground">
                  {assigneeName || "Unassigned"}
                  {chore.dueDate && ` · ${new Date(chore.dueDate).toLocaleDateString()}`}
                </p>
              </div>
            </div>
          );
        })}
        {chores.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">
            No chores scheduled
          </p>
        )}
      </div>
    </section>
  );
}
