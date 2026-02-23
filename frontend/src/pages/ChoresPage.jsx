import { AddChoreModal } from "@/components/Chores/AddChoreModal";
import { ChoreList } from "@/components/Chores/ChoreList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyRole } from "@/hooks/useMembers";

export default function ChoresPage() {
  const { isOwnerOrAdmin } = useMyRole();
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
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
        <TabsList className="bg-transparent border-b border-border/60 rounded-none w-full justify-start h-auto p-0 gap-8">
          <TabsTrigger
            value="all"
            className="relative rounded-none bg-transparent px-0 pb-3 pt-0 text-sm text-muted-foreground data-[state=active]:text-primary data-[state=active]:shadow-none after:absolute after:-bottom-[2px] after:left-0 after:right-0 after:h-[2px] after:bg-transparent data-[state=active]:after:bg-primary"
          >
            ALL
          </TabsTrigger>
          <TabsTrigger
            value="mine"
            className="relative rounded-none bg-transparent px-0 pb-3 pt-0 text-sm text-muted-foreground data-[state=active]:text-primary data-[state=active]:shadow-none after:absolute after:-bottom-[2px] after:left-0 after:right-0 after:h-[2px] after:bg-transparent data-[state=active]:after:bg-primary"
          >
            MY TASKS
          </TabsTrigger>
          <TabsTrigger
            value="upcoming"
            className="relative rounded-none bg-transparent px-0 pb-3 pt-0 text-sm text-muted-foreground data-[state=active]:text-primary data-[state=active]:shadow-none after:absolute after:-bottom-[2px] after:left-0 after:right-0 after:h-[2px] after:bg-transparent data-[state=active]:after:bg-primary"
          >
            UPCOMING
          </TabsTrigger>
          <TabsTrigger
            value="done"
            className="relative rounded-none bg-transparent px-0 pb-3 pt-0 text-sm text-muted-foreground data-[state=active]:text-primary data-[state=active]:shadow-none after:absolute after:-bottom-[2px] after:left-0 after:right-0 after:h-[2px] after:bg-transparent data-[state=active]:after:bg-primary"
          >
            COMPLETED
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-8">
          <ChoreList />
        </TabsContent>
        <TabsContent value="mine" className="mt-8">
          <ChoreList filter="mine" />
        </TabsContent>
        <TabsContent value="upcoming" className="mt-8">
          <ChoreList filter="upcoming" />
        </TabsContent>
        <TabsContent value="done" className="mt-8">
          <ChoreList filter="done" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
