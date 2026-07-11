import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Megaphone } from "lucide-react";
import { LOCAL_STORAGE_KEYS } from "@/constants";

export function AnnouncementModal() {
  const [open, setOpen] = React.useState(() => {
    const hiddenForever = localStorage.getItem(LOCAL_STORAGE_KEYS.hideAnnouncement) === "true";
    const shownThisSession = sessionStorage.getItem("squadfinder:shown-announcement-v2") === "true";
    return !hiddenForever && !shownThisSession;
  });
  const [countdown, setCountdown] = React.useState(10);
  const [dontShowAgain, setDontShowAgain] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      sessionStorage.setItem("squadfinder:shown-announcement-v2", "true");
    }
  }, [open]);

  React.useEffect(() => {
    if (!open || countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [open, countdown]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.hideAnnouncement, "true");
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      // Only allow closing if countdown is 0
      if (!val && countdown <= 0) {
        handleClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] sm:w-full flex flex-col max-h-[90vh] md:max-h-[85vh] rounded-lg">
        <DialogHeader className="gap-2 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight pr-6">
            <Megaphone className="w-6 h-6 text-primary shrink-0" />
            <span>📢 Capstone Registration Reminder</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Important announcement regarding the capstone project deadline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 text-sm leading-relaxed text-muted-foreground overflow-y-auto min-h-0">
          <p>Dear GLS students,</p>
          <p>
            The college has announced that all Capstone Project groups and project ideas must be submitted through the official Google Form before <strong>14 July at 4:00 PM</strong>.
          </p>
          <p>
            To help everyone find teammates in time, please register your group or, if you're still looking for a team, add yourself to the <strong>Available Students</strong> section as early as possible.
          </p>
          <p>
            Early registration makes it much easier for students without a group to connect with others before the official submission deadline.
          </p>
          <p>
            We encourage everyone to keep their group information up to date and use SquadFinder responsibly to help fellow classmates complete their teams.
          </p>
          <p>We wish everyone the very best for their Capstone Project!</p>
        </div>

        <div className="flex flex-col gap-4 pt-4 border-t shrink-0">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="dont-show-again" 
              checked={dontShowAgain} 
              onCheckedChange={(checked) => setDontShowAgain(checked as boolean)} 
            />
            <Label htmlFor="dont-show-again" className="text-sm font-normal cursor-pointer">
              Don't show this message again on this device.
            </Label>
          </div>
          
          <Button 
            onClick={handleClose} 
            disabled={countdown > 0} 
            className="w-full"
          >
            {countdown > 0 ? `You can close this message in ${countdown} seconds...` : "Close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
