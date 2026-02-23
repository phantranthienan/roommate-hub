import { cn } from "@/lib/cn";
import { Link } from "react-router-dom";
import { useItems } from "@/hooks/useItems";

export function SuppliesWidget({ className }) {
  const { data: allItems = [] } = useItems();
  const lowSupplies = allItems
    .filter((s) => s.status === "low" || s.status === "out_of_stock")
    .slice(0, 3);

  return (
    <section className={cn("", className)}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/40">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Supplies
        </h2>
        <Link to="/supplies" className="text-sm text-primary hover:underline">
          View All
        </Link>
      </div>

      <div className="space-y-1">
        {lowSupplies.length > 0 ? (
          lowSupplies.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0"
            >
              <div
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  item.status === "out_of_stock" && "bg-destructive",
                  item.status === "low" && "bg-yellow-500"
                )}
              />
              <span className="text-sm font-medium flex-1">{item.name}</span>
              <span
                className={cn(
                  "text-xs font-medium",
                  item.status === "out_of_stock"
                    ? "text-destructive"
                    : "text-yellow-600"
                )}
              >
                {item.status === "out_of_stock" ? "Out of stock" : "Running low"}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            All supplies stocked
          </p>
        )}
      </div>
    </section>
  );
}
