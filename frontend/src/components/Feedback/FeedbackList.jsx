import { cn } from "@/lib/cn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronUp, AlertCircle, Lightbulb, Loader2 } from "lucide-react";
import { useFeedback, useVoteFeedback, useUnvoteFeedback } from "@/hooks/useFeedback";
import { useAuthStore } from "@/stores/auth.store";

function getRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function FeedbackList() {
  const { data: allFeedback = [], isLoading, error } = useFeedback();
  const currentUser = useAuthStore((s) => s.user);

  const activeItems = allFeedback.filter((i) => i.status === "open");
  const resolvedItems = allFeedback.filter((i) => i.status === "done" || i.status === "rejected" || i.status === "archived");
  const myItems = allFeedback.filter((i) => i.author?.id === currentUser?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading feedback...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive py-8 text-center">{error.message}</p>;
  }

  return (
    <Tabs defaultValue="open" className="w-full">
      <TabsList variant="line" className="bg-transparent rounded-none w-full justify-start h-auto p-0 gap-8">
        <TabsTrigger value="open">ACTIVE</TabsTrigger>
        <TabsTrigger value="closed">RESOLVED</TabsTrigger>
        <TabsTrigger value="all">MY REPORTS</TabsTrigger>
      </TabsList>

      <TabsContent value="open" className="mt-8">
        <FeedbackItems items={activeItems} />
      </TabsContent>
      <TabsContent value="closed" className="mt-8">
        <FeedbackItems items={resolvedItems} />
      </TabsContent>
      <TabsContent value="all" className="mt-8">
        <FeedbackItems items={myItems} />
      </TabsContent>
    </Tabs>
  );
}

function FeedbackItems({ items }) {
  const voteFeedback = useVoteFeedback();
  const unvoteFeedback = useUnvoteFeedback();

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center">
        No feedback items
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const authorName = `${item.author.firstName} ${item.author.lastName}`

        return (
          <div
            key={item.id}
            className="flex items-center gap-4 py-5 border-b border-border/40 last:border-0"
          >
            <div className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
              item.type === "issue" ? "bg-destructive/10" : "bg-primary/10"
            )}>
              {item.type === "issue" ? (
                <AlertCircle className="h-5 w-5 text-destructive" />
              ) : (
                <Lightbulb className="h-5 w-5 text-primary" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-lg">{item.title}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span className="uppercase text-xs font-medium">{item.type}</span>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    {authorName[0]}
                  </span>
                  <span>{authorName}</span>
                </div>
                <span>·</span>
                <span>{getRelativeTime(item.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className={cn(
                  "transition-colors",
                  item.userVoted ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
                onClick={() => item.userVoted ? unvoteFeedback.mutate(item.id) : voteFeedback.mutate(item.id)}
              >
                <ChevronUp className="h-6 w-6" />
              </button>
              <span className="font-semibold text-xl w-8 text-center">
                {item.votes}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
