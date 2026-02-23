import { ChoresWidget } from "@/components/Home/ChoresWidget";
import { SuppliesWidget } from "@/components/Home/SuppliesWidget";
import { FeedbackWidget } from "@/components/Home/FeedbackWidget";
import { PresenceWidget } from "@/components/Home/PresenceWidget";
import { RuleBanner } from "@/components/Home/RuleBanner";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl">
          <span className="font-light">Good morning,</span>{" "}
          <span className="font-semibold italic">Roomie.</span>
        </h1>
        <p className="text-muted-foreground">
          Everything is in order in your shared home today.
        </p>
      </header>

      <RuleBanner />

      <PresenceWidget />

      <div className="grid gap-8 lg:grid-cols-2">
        <ChoresWidget />
        <SuppliesWidget />
        <FeedbackWidget className="lg:col-span-2" />
      </div>
    </div>
  );
}
