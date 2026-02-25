import { AddChoreModal } from "@/components/Chores/AddChoreModal";
import { ChoreList } from "@/components/Chores/ChoreList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyRole } from "@/hooks/useMembers";

export default function ChoresPage() {
  const { isOwnerOrAdmin } = useMyRole();
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl">
            <span className="font-light">Household</span>{" "}
            <span className="font-semibold italic">chores.</span>
          </h1>
          <p className="text-muted-foreground">
            Manage tasks and keep your shared home clean.
          </p>
        </div>
        {isOwnerOrAdmin && <AddChoreModal />}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList variant="line" className="bg-transparent rounded-none w-full justify-start h-auto p-0 gap-8">
          <TabsTrigger value="all">ALL</TabsTrigger>
          <TabsTrigger value="mine">MY TASKS</TabsTrigger>
          <TabsTrigger value="done">DONE</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-8">
          <ChoreList />
        </TabsContent>
        <TabsContent value="mine" className="mt-8">
          <ChoreList filter="mine" />
        </TabsContent>
        <TabsContent value="done" className="mt-8">
          <ChoreList filter="done" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
