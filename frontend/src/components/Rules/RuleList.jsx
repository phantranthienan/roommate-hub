import { cn } from "@/lib/cn";
import { BookOpen, ThumbsUp, Check, Loader2 } from "lucide-react";
import { useRules, useVoteRule, useAcceptRule } from "@/hooks/useRules";
import { Button } from "@/components/ui/button";

export function RuleList() {
  const { data: rules = [], isLoading, error } = useRules();
  const voteRule = useVoteRule();
  const acceptRule = useAcceptRule();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading rules...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive py-8 text-center">{error.message}</p>;
  }

  if (rules.length === 0) {
    return <p className="text-muted-foreground py-8 text-center">No rules yet.</p>;
  }

  return (
    <div className="space-y-2">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className="flex items-center gap-4 py-5 border-b border-border/40 last:border-0"
        >
          <div
            className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
              rule.status === "approved" ? "bg-green-500/10" : rule.status === "rejected" ? "bg-destructive/10" : "bg-primary/10"
            )}
          >
            <BookOpen
              className={cn(
                "h-5 w-5",
                rule.status === "approved" ? "text-green-600" : rule.status === "rejected" ? "text-destructive" : "text-primary"
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium">{rule.title}</p>
              {rule.status === "proposed" && (
                <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Proposed
                </span>
              )}
              {rule.status === "rejected" && (
                <span className="text-xs text-destructive bg-destructive/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Rejected
                </span>
              )}
            </div>
            {rule.description && (
              <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
            )}
          </div>

          {rule.status === "proposed" ? (
            <div className="flex items-center gap-3">
              <button
                className={cn(
                  "flex items-center gap-1.5 transition-colors",
                  rule.userVoted ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
                onClick={() => voteRule.mutate(rule.id)}
              >
                <ThumbsUp className="h-5 w-5" />
                <span className="font-medium">{rule.votes}</span>
              </button>
            </div>
          ) : rule.status === "approved" && !rule.userAccepted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => acceptRule.mutate(rule.id)}
              disabled={acceptRule.isPending}
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
          ) : (
            <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="h-4 w-4 text-green-600" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
