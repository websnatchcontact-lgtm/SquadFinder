import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGroupActions } from "@/hooks/use-group-actions";
import { useGroups } from "@/hooks/use-groups";
import { useStatistics } from "@/hooks/use-statistics";
import { useConflicts } from "@/hooks/use-conflicts";
import { useStudents } from "@/hooks/use-students";
import { useToast } from "@/hooks/use-toast";
import { CreateGroupInput, CreateGroupMemberInput, DivisionCode, SpecializationCode } from "@/types";
import { DIVISION_LIST, SPECIALIZATION_LIST, MIN_GROUP_MEMBERS, MAX_GROUP_MEMBERS } from "@/constants";
import { Plus, Trash2, UserPlus, AlertTriangle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function CreateGroupDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [creatorName, setCreatorName] = useState("");
  const [members, setMembers] = useState<CreateGroupMemberInput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [conflictConfirmOpen, setConflictConfirmOpen] = useState(false);

  const { validateCreate, checkCrossGroupDuplicates, submitCreateGroup } = useGroupActions();
  const { refresh: refreshGroups } = useGroups();
  const { refresh: refreshStats } = useStatistics();
  const { refresh: refreshConflicts } = useConflicts();
  const { refresh: refreshStudents } = useStudents();
  const { toast } = useToast();

  const handleNext = () => {
    if (!creatorName.trim()) {
      setError("Creator name is required.");
      return;
    }
    setError(null);
    if (members.length === 0) {
      setMembers([{ name: creatorName.trim(), enrollment: "", division: "A", specialization: "CS" }]);
    }
    setStep(2);
  };

  const addMember = () => {
    if (members.length >= MAX_GROUP_MEMBERS) return;
    setMembers([...members, { name: "", enrollment: "", division: "A", specialization: "CS" }]);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof CreateGroupMemberInput, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value } as CreateGroupMemberInput;
    setMembers(updated);
  };

  const validateAndSubmit = () => {
    const input: CreateGroupInput = { creatorName, members };
    const validation = validateCreate(input);
    if (!validation.valid) {
      setError(validation.message || "Invalid input");
      return;
    }
    setError(null);
    
    const duplicates = checkCrossGroupDuplicates(input);
    if (duplicates.length > 0) {
      setConflictConfirmOpen(true);
    } else {
      doSubmit();
    }
  };

  const doSubmit = () => {
    const input: CreateGroupInput = { creatorName, members };
    try {
      submitCreateGroup(input);
      refreshGroups();
      refreshStats();
      refreshConflicts();
      refreshStudents();
      toast({ title: "Group created successfully" });
      handleClose();
    } catch (err: any) {
      setError(err.message || "Failed to create group");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setCreatorName("");
      setMembers([]);
      setError(null);
    }, 200);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              {step === 1 ? "Start by telling us who is creating this group." : `Add ${MIN_GROUP_MEMBERS}-${MAX_GROUP_MEMBERS} members. All members must share the same specialization.`}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="creatorName">Your Name (Creator)</Label>
                <Input 
                  id="creatorName" 
                  placeholder="Enter your full name" 
                  value={creatorName} 
                  onChange={e => setCreatorName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                  autoFocus
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleNext}>Continue</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 py-2">
              <div className="space-y-4">
                {members.map((member, index) => (
                  <div key={index} className="p-4 bg-muted/30 border rounded-xl relative space-y-3">
                    {index === 0 && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] uppercase font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-xl">
                        Creator
                      </div>
                    )}
                    {index > 0 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeMember(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Full Name</Label>
                        <Input value={member.name} onChange={e => updateMember(index, 'name', e.target.value)} placeholder="Name" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Enrollment</Label>
                        <Input value={member.enrollment} onChange={e => updateMember(index, 'enrollment', e.target.value)} placeholder="Enrollment #" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Division</Label>
                        <Select value={member.division} onValueChange={v => updateMember(index, 'division', v)}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {DIVISION_LIST.map(d => <SelectItem key={d} value={d}>Div {d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Specialization</Label>
                        <Select value={member.specialization} onValueChange={v => updateMember(index, 'specialization', v)}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {SPECIALIZATION_LIST.map(s => <SelectItem key={s.code} value={s.code}>{s.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {members.length < MAX_GROUP_MEMBERS && (
                <Button variant="outline" className="w-full border-dashed" onClick={addMember}>
                  <Plus className="w-4 h-4 mr-2" /> Add Member
                </Button>
              )}

              <div className="flex justify-between pt-4 border-t">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={validateAndSubmit} className="min-w-[120px]">
                  Create Group
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={conflictConfirmOpen} onOpenChange={setConflictConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conflict Detected</AlertDialogTitle>
            <AlertDialogDescription>
              One or more students in this group already belong to another registered group. Continuing will create a conflict that will be visible on the dashboard.
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
