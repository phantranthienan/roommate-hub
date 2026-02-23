import { cn } from "@/lib/cn";
import { Link } from "react-router-dom";
import { useFeedback } from "@/hooks/useFeedback";

export function FeedbackWidget({ className }) {
  const { data: allFeedback = [] } = useFeedback();
  const feedback = allFeedback
    .filter((f) => f.status === "open")
    .slice(0, 2);

  return (
    <section className={cn("", className)}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/40">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Top Feedback
        </h2>
        <Link to="/feedback" className="text-sm text-primary hover:underline">
          View All
        </Link>
      </div>

      <div className="space-y-1">
        {feedback.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 py-3 border-b border-border/40 last:border-0"
          >
            <span className="text-sm font-semibold w-6 text-center text-foreground">
              {item.votes}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <span
                className={cn(
                  "text-xs font-medium capitalize",
                  item.type === "issue"
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {item.type}
              </span>
            </div>
          </div>
        ))}
        {feedback.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">
            No feedback yet
          </p>
        )}
      </div>
    </section>
  );
}
