import { cn } from "@/lib/cn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronUp, AlertCircle, Lightbulb, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useFeedback, useVoteFeedback, useUnvoteFeedback, useUpdateFeedbackStatus } from "@/hooks/useFeedback";
import { useMyRole } from "@/hooks/useMembers";

export function FeedbackList() {
  const { data: allFeedback = [], isLoading, error } = useFeedback();

  const activeItems = allFeedback.filter((i) => i.status === "open");
  const resolvedItems = allFeedback.filter((i) => i.status === "done");
  const rejectedItems = allFeedback.filter((i) => i.status === "rejected");

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
    <Tabs defaultValue="active" className="w-full">
      <TabsList variant="line" className="bg-transparent rounded-none w-full justify-start h-auto p-0 gap-8">
        <TabsTrigger value="active">ACTIVE</TabsTrigger>
        <TabsTrigger value="resolved">RESOLVED</TabsTrigger>
        <TabsTrigger value="rejected">REJECTED</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="mt-8">
        <FeedbackItems items={activeItems} />
      </TabsContent>
      <TabsContent value="resolved" className="mt-8">
        <FeedbackItems items={resolvedItems} />
      </TabsContent>
      <TabsContent value="rejected" className="mt-8">
        <FeedbackItems items={rejectedItems} />
      </TabsContent>
    </Tabs>
  );
}

function FeedbackItems({ items }) {
  const voteFeedback = useVoteFeedback();
  const unvoteFeedback = useUnvoteFeedback();
  const updateStatus = useUpdateFeedbackStatus();
  const { isOwnerOrAdmin } = useMyRole();

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center">
        No feedback items
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const authorName = `${item.author.firstName} ${item.author.lastName}`

        return (
          <div
            key={item.id}
            className="flex flex-col gap-3 py-5 border-b border-border/40 last:border-0 sm:flex-row sm:items-center"
          >
            <div className="flex items-start gap-4 flex-1 min-w-0">
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
                <div className="flex items-center gap-2">
                  <p className="font-medium">{item.title}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <span className="uppercase text-xs font-medium">{item.type}</span>
                  <span>·</span>
                  <div className="flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                      {authorName[0]}
                    </span>
                    <span>{authorName}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-auto sm:pl-2">
              {item.status === "open" && isOwnerOrAdmin && (
                <>
                  <Button
                    variant="outline"
                    size="xs"
                    className="text-green-600 border-green-500/30 hover:bg-green-500/10"
                    disabled={updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ feedbackId: item.id, status: 'done' })}
                  >
                    <CheckCircle className="h-3 w-3" />
                    Resolve
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    disabled={updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ feedbackId: item.id, status: 'rejected' })}
                  >
                    <XCircle className="h-3 w-3" />
                    Reject
                  </Button>
                </>
              )}
              {item.status === "open" ? (
                <button
                  className={cn(
                    "flex items-center gap-1 transition-colors text-xs",
                    item.userVoted ? "text-primary" : "text-muted-foreground hover:text-primary"
                  )}
                  onClick={() => item.userVoted ? unvoteFeedback.mutate(item.id) : voteFeedback.mutate(item.id)}
                >
                  <ChevronUp className="h-4 w-4" />
                  <span className="font-medium">{item.votes}</span>
                </button>
              ) : (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ChevronUp className="h-4 w-4" />
                  <span className="font-medium">{item.votes}</span>
                </span>
              )}
              {item.status === "done" ? (
                <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              ) : item.status === "rejected" ? (
                <div className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-destructive" />
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
