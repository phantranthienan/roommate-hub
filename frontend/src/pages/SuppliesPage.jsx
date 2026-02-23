import { AddSupplyModal } from "@/components/Supplies/AddSupplyModal";
import { SupplyList } from "@/components/Supplies/SupplyList";
import { useMyRole } from "@/hooks/useMembers";

export default function SuppliesPage() {
  const { isOwnerOrAdmin } = useMyRole();
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl">
            <span className="font-light">Shared</span>{" "}
            <span className="font-semibold italic">supplies.</span>
          </h1>
          <p className="text-muted-foreground">
            Track shared supplies and never run out.
          </p>
        </div>
        {isOwnerOrAdmin && <AddSupplyModal />}
      </div>

      <SupplyList />
    </div>
  );
}
