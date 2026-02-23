import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { usePresence, useUpdatePresence } from "@/hooks/usePresence";
import { useAuthStore } from "@/stores/auth.store";

export function PresenceWidget() {
  const { data: members = [], isLoading } = usePresence();
  const updatePresence = useUpdatePresence();
  const currentUser = useAuthStore((s) => s.user);

  const me = members.find((m) => m.userId === currentUser?.id);
  const atHomeCount = members.filter((m) => m.isPresent).length;

  if (isLoading || members.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/40">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Who's Home
        </h2>
        <span className="text-xs text-muted-foreground">
          {atHomeCount} of {members.length} home
        </span>
      </div>

      <div className="flex items-center gap-5 flex-wrap">
        {members.map((member) => {
          const isMe = member.userId === currentUser?.id;
          const initials = `${member.firstName[0] ?? ""}${member.lastName[0] ?? ""}`.toUpperCase();

          return (
            <div key={member.id} className="flex flex-col items-center gap-1.5">
              <div className="relative">
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                    member.isPresent
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {initials}
                </div>
                <span
                  className={cn(
                    "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background transition-colors",
                    member.isPresent ? "bg-green-500" : "bg-muted-foreground/30"
                  )}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {isMe ? "You" : member.firstName}
              </span>
            </div>
          );
        })}

        {me && (
          <div className="ml-auto">
            <Button
              size="sm"
              variant={me.isPresent ? "outline" : "default"}
              onClick={() => updatePresence.mutate(!me.isPresent)}
              disabled={updatePresence.isPending}
              className="text-xs h-8"
            >
              {me.isPresent ? "Mark as Away" : "I'm Home"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
