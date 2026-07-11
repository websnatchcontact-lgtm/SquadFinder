import { Badge } from "@/components/ui/badge";
import { GroupHealth } from "@/types";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function HealthBadge({ health, className }: { health: GroupHealth; className?: string }) {
  if (health === "healthy") {
    return (
      <Badge variant="secondary" className={cn("bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium", className)}>
        <CheckCircle2 className="w-3 h-3 mr-1" /> Healthy
      </Badge>
    );
  }
  if (health === "pending") {
    return (
      <Badge variant="secondary" className={cn("bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 font-medium", className)}>
        <Clock className="w-3 h-3 mr-1" /> Pending
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className={cn("font-medium", className)}>
      <AlertCircle className="w-3 h-3 mr-1" /> Conflict
    </Badge>
  );
}

export function ConfirmationBadge({ confirmed, className }: { confirmed: boolean; className?: string }) {
  if (confirmed) {
    return (
      <Badge variant="secondary" className={cn("bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium", className)}>
        <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className={cn("bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 font-medium", className)}>
      <Clock className="w-3 h-3 mr-1" /> Unconfirmed
    </Badge>
  );
}
