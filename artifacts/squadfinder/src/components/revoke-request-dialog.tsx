import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useGroupActions } from "@/hooks/use-group-actions";
import { useGroups } from "@/hooks/use-groups";
import { useStatistics } from "@/hooks/use-statistics";
import { useToast } from "@/hooks/use-toast";
import type { JoinRequest } from "@/types";
import { safetyPinSchema } from "@/lib/validation/common.schema";

interface RevokeRequestDialogProps {
  request: JoinRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RevokeRequestDialog({ request, open, onOpenChange }: RevokeRequestDialogProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { revoke } = useGroupActions();
  const { refresh: refreshGroups } = useGroups();
  const { refresh: refreshStats } = useStatistics();
  const { toast } = useToast();

  const handleRevoke = async () => {
    if (!request) return;
    
    const pinCheck = safetyPinSchema.safeParse(pin);
    if (!pinCheck.success) {
      setError(pinCheck.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      await revoke(request.groupNumber, request.id, pinCheck.data);
      refreshGroups();
      refreshStats();
      toast({
        title: "Request Revoked",
        description: "Your join request has been successfully removed.",
      });
      handleClose();
    } catch (e: any) {
      setError(e.message || "An error occurred while revoking the request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setPin("");
      setError(null);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] sm:w-full flex flex-col max-h-[90vh] md:max-h-[85vh] rounded-lg p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Revoke Join Request</DialogTitle>
          <DialogDescription>
            Enter your Safety PIN to verify that you are the person who submitted this request.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4 py-2 overflow-y-auto min-h-0">
          <Input
            type="password"
            placeholder="Enter your Safety PIN"
            value={pin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setPin(val);
            }}
            inputMode="numeric"
            pattern="[0-9]*"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevoke} disabled={!pin || isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Revoke Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
