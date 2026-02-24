import { cn } from "@/lib/cn";
import { BookOpen, ThumbsUp, Check, Shield, XCircle, Loader2 } from "lucide-react";
import { useRules, useVoteRule, useUnvoteRule, useApproveRule, useRejectRule } from "@/hooks/useRules";
import { useMyRole } from "@/hooks/useMembers";
import { Button } from "@/components/ui/button";

export function RuleList({ filter }) {
  const { data: allRules = [], isLoading, error } = useRules();
  const rules = filter
    ? allRules.filter((r) => r.status === filter)
    : allRules;
  const voteRule = useVoteRule();
  const unvoteRule = useUnvoteRule();
  const approveRuleMutation = useApproveRule();
  const rejectRuleMutation = useRejectRule();
  const { isOwnerOrAdmin } = useMyRole();

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
    const emptyMessage =
      filter === "proposed"
        ? "No proposed rules."
        : filter === "approved"
        ? "No approved rules."
        : filter === "rejected"
        ? "No rejected rules."
        : "No rules yet.";
    return <p className="text-muted-foreground py-8 text-center">{emptyMessage}</p>;
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
                onClick={() => rule.userVoted ? unvoteRule.mutate(rule.id) : voteRule.mutate(rule.id)}
              >
                <ThumbsUp className="h-5 w-5" />
                <span className="font-medium">
                  {rule.votes} / {rule.memberCount ? Math.floor(rule.memberCount / 2) + 1 : '?'}
                </span>
              </button>
              {isOwnerOrAdmin && rule.memberCount && (() => {
                const majorityNeeded = Math.floor(rule.memberCount / 2) + 1;
                const hasEnoughVotes = rule.votes >= majorityNeeded;
                const hoursSinceCreation = (Date.now() - new Date(rule.createdAt).getTime()) / (1000 * 60 * 60);
                const past24h = hoursSinceCreation >= 24;

                if (hasEnoughVotes) {
                  return (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => approveRuleMutation.mutate(rule.id)}
                      disabled={approveRuleMutation.isPending}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  );
                }
                if (past24h) {
                  return (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => rejectRuleMutation.mutate(rule.id)}
                      disabled={rejectRuleMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  );
                }
                return null;
              })()}
            </div>
          ) : rule.status === "approved" ? (
            <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="h-4 w-4 text-green-600" />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
