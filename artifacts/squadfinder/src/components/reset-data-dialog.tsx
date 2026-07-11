import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useGroupActions } from "@/hooks/use-group-actions";
import { useGroups } from "@/hooks/use-groups";
import { useStatistics } from "@/hooks/use-statistics";
import { useConflicts } from "@/hooks/use-conflicts";
import { useStudents } from "@/hooks/use-students";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

export function ResetDemoDataDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { reset } = useGroupActions();
  const { refresh: refreshGroups } = useGroups();
  const { refresh: refreshStats } = useStatistics();
  const { refresh: refreshConflicts } = useConflicts();
  const { refresh: refreshStudents } = useStudents();
  const { toast } = useToast();

  const handleReset = () => {
    reset();
    refreshGroups();
    refreshStats();
    refreshConflicts();
    refreshStudents();
    setOpen(false);
    toast({
      title: "Data Reset",
      description: "All locally created data has been cleared.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="w-4 h-4 mr-2" />
            Reset Local Data
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="w-5 h-5" /> Reset Local Data
          </DialogTitle>
          <DialogDescription className="pt-2">
            This will remove all locally created groups, requests, confirmations, notes, and conflicts. The original demo dataset will remain unchanged.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleReset}>Reset Everything</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
