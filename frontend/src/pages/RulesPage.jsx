import { AddRuleModal } from "@/components/Rules/AddRuleModal";
import { RuleList } from "@/components/Rules/RuleList";

export default function RulesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl">
            <span className="font-light">House</span>{" "}
            <span className="font-semibold italic">rules.</span>
          </h1>
          <p className="text-muted-foreground">
            Agreements that keep the peace.
          </p>
        </div>
        <AddRuleModal />
      </div>

      <RuleList />
    </div>
  );
}
