import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGroupActions } from "@/hooks/use-group-actions";
import { useGroups } from "@/hooks/use-groups";
import { useStatistics } from "@/hooks/use-statistics";
import { useConflicts } from "@/hooks/use-conflicts";
import { useStudents } from "@/hooks/use-students";
import { useToast } from "@/hooks/use-toast";
import { Group, RequestToJoinInput, DivisionCode, SpecializationCode } from "@/types";
import { DIVISION_LIST, SPECIALIZATION_LIST } from "@/constants";
import { AlertTriangle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function RequestToJoinDialog({ group, open, onOpenChange }: { group: Group, open: boolean, onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState("");
  const [enrollment, setEnrollment] = useState("");
  const [division, setDivision] = useState<DivisionCode>("A");
  const [specialization, setSpecialization] = useState<SpecializationCode>("CS");
  const [note, setNote] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [conflictConfirmOpen, setConflictConfirmOpen] = useState(false);

  const { validateJoin, checkJoinDuplicate, submitRequestToJoin } = useGroupActions();
  const { refresh: refreshGroups } = useGroups();
  const { refresh: refreshStats } = useStatistics();
  const { refresh: refreshConflicts } = useConflicts();
  const { students, refresh: refreshStudents } = useStudents();
  const { toast } = useToast();

  const registeredStudent = students.find(s => s.enrollment === enrollment && s.pin);
  const isRegistered = !!registeredStudent;

  const validateAndSubmit = () => {
    const finalPin = isRegistered ? registeredStudent.pin! : pin;
    if (!finalPin || finalPin.length < 4) {
      setError("Please enter a valid Safety PIN (at least 4 characters).");
      return;
    }
    
    const input: RequestToJoinInput = { name, enrollment, division, specialization, note, pin: finalPin };
    const validation = validateJoin(group, input);
    if (!validation.valid) {
      setError(validation.message || "Invalid input");
      return;
    }
    setError(null);
    
    if (checkJoinDuplicate(enrollment)) {
      setConflictConfirmOpen(true);
    } else {
      doSubmit();
    }
  };

  const doSubmit = () => {
    const finalPin = isRegistered ? registeredStudent.pin! : pin;
    const input: RequestToJoinInput = { name, enrollment, division, specialization, note, pin: finalPin };
    try {
      submitRequestToJoin(group.groupNumber, input);
      refreshGroups();
      refreshStats();
      refreshConflicts();
      refreshStudents();
      toast({ title: "Request submitted successfully" });
      handleClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit request");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setName("");
      setEnrollment("");
      setDivision("A");
      setSpecialization("CS");
      setNote("");
      setPin("");
      setError(null);
    }, 200);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request to Join {group.groupNumber}</DialogTitle>
            <DialogDescription>
              Submit your details to request an open seat in this group.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoFocus />
            </div>
            <div className="space-y-2">
              <Label>Enrollment Number</Label>
              <Input value={enrollment} onChange={e => setEnrollment(e.target.value)} placeholder="e.g. 21012345" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Division</Label>
                <Select value={division} onValueChange={(v: DivisionCode) => setDivision(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIVISION_LIST.map(d => <SelectItem key={d} value={d}>Div {d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Select value={specialization} onValueChange={(v: SpecializationCode) => setSpecialization(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SPECIALIZATION_LIST.map(s => <SelectItem key={s.code} value={s.code}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Note (Optional)</Label>
              <Textarea 
                value={note} 
                onChange={e => setNote(e.target.value)} 
                placeholder="Include a short message..."
                className="resize-none h-20"
              />
            </div>
            {!isRegistered && (
              <div className="space-y-2">
                <Label>Safety PIN</Label>
                <Input 
                  value={pin} 
                  onChange={e => setPin(e.target.value)} 
                  placeholder="Create or enter your PIN" 
                  type="password"
                />
                <p className="text-[10px] text-muted-foreground leading-tight">
                  This PIN is required to revoke your request later.
                </p>
              </div>
            )}
            <Button onClick={validateAndSubmit} className="w-full mt-2">Submit Request</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={conflictConfirmOpen} onOpenChange={setConflictConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conflict Detected</AlertDialogTitle>
            <AlertDialogDescription>
              Your enrollment already exists in another registered group. Continuing will create a conflict that will be visible on the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setConflictConfirmOpen(false);
              doSubmit();
            }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Continue Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
