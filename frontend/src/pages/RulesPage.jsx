import { AddRuleModal } from "@/components/Rules/AddRuleModal";
import { RuleList } from "@/components/Rules/RuleList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

      <Tabs defaultValue="proposed" className="w-full">
        <TabsList variant="line" className="bg-transparent rounded-none w-full justify-start h-auto p-0 gap-8">
          <TabsTrigger value="proposed">PROPOSED</TabsTrigger>
          <TabsTrigger value="approved">APPROVED</TabsTrigger>
          <TabsTrigger value="rejected">REJECTED</TabsTrigger>
        </TabsList>

        <TabsContent value="proposed" className="mt-8">
          <RuleList filter="proposed" />
        </TabsContent>
        <TabsContent value="approved" className="mt-8">
          <RuleList filter="approved" />
        </TabsContent>
        <TabsContent value="rejected" className="mt-8">
          <RuleList filter="rejected" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
