import { Student, StudentStatus } from "@/types";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { generateInitials, formatStatus } from "@/utils/students";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

export function StatusBadge({ status }: { status: StudentStatus }) {
  if (status === "GROUPED") {
    return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium">{formatStatus(status)}</Badge>;
  }
  return <Badge variant="default" className="font-medium"><Users className="w-3 h-3 mr-1" />{formatStatus(status)}</Badge>;
}

export function StudentCard({ student, className }: { student: Student; className?: string }) {
  return (
    <div className={cn("flex flex-col p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow", className)} data-testid={`card-student-${student.enrollment}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border bg-muted/50">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {generateInitials(student.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold text-base truncate">{student.name}</span>
            <span className="text-sm text-muted-foreground truncate">{student.enrollment}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <Badge variant="outline" className="font-mono text-xs">{student.specialization}</Badge>
          <Badge variant="outline" className="font-mono text-xs bg-muted/30">Div {student.division}</Badge>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <StatusBadge status={student.status} />
        {student.group && (
          <Badge variant="secondary" className="text-xs">{student.group}</Badge>
        )}
      </div>
    </div>
  );
}
