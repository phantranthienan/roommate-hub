import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useRules } from "@/hooks/useRules";

export function RuleBanner() {
  const { data: rules = [] } = useRules();
  const proposedRule = rules.find((r) => r.status === "proposed");

  if (!proposedRule) return null;

  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <Bell className="h-4 w-4 text-primary" />
      <p>
        New rule proposed:{" "}
        <Link to="/rules" className="text-primary hover:underline font-medium">
          "{proposedRule.title}"
        </Link>
      </p>
    </div>
  );
}
