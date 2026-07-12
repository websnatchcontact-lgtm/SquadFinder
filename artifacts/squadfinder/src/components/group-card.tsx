import { Group } from "@/types";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Users, AlertCircle, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { generateInitials } from "@/utils/students";
import { cn } from "@/lib/utils";
import { HealthBadge } from "./badges";

export function GroupCard({ group, onClick, className }: { group: Group; onClick?: () => void; className?: string }) {
  const { groupNumber, totalMembers, seatsLeft, isFull, health, divisionCounts, specialization } = group;
  
  return (
    <Card 
      className={cn("flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1", onClick && "cursor-pointer hover:border-primary/50", className)}
      onClick={onClick}
      data-testid={`card-group-${groupNumber}`}
    >
      <CardHeader className="p-5 pb-4 flex flex-row items-start justify-between space-y-0">
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-lg tracking-tight">Group {groupNumber}</h3>
          <div className="flex items-center text-sm text-muted-foreground font-medium">
            <Users className="w-4 h-4 mr-1.5" />
            {totalMembers} member{totalMembers !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {isFull ? (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Full
            </Badge>
          ) : (
            <Badge variant="default" className="font-medium bg-primary hover:bg-primary/90">
              {seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} left
            </Badge>
          )}
          <HealthBadge health={health} />
        </div>
      </CardHeader>
      
      <CardContent className="p-5 pt-0 flex-grow flex flex-col gap-4">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="font-mono text-xs bg-muted/30">
            {specialization}
          </Badge>
          {Object.entries(divisionCounts).map(([div, count]) => (
            <Badge key={div} variant="outline" className="font-mono text-xs bg-muted/30">
              Div {div} <span className="opacity-50 ml-1 text-[10px]">x{count}</span>
            </Badge>
          ))}
        </div>
        
        <div className="mt-auto flex justify-between items-center pt-2">
          <div className="flex -space-x-2 overflow-hidden">
            {group.members.slice(0, 5).map((member, i) => (
              <Avatar key={member.enrollment} className="inline-block border-2 border-background ring-2 ring-transparent transition-all group-hover:ring-primary/20">
                <AvatarFallback className={cn("text-xs font-semibold", 
                  !member.confirmed ? "opacity-50 grayscale" : "",
                  i % 3 === 0 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                  i % 3 === 1 ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" :
                  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                )}>
                  {generateInitials(member.name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {group.members.length > 5 && (
              <Avatar className="inline-block border-2 border-background">
                <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
                  +{group.members.length - 5}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          {group.requests.length > 0 && (
             <div className="text-xs text-muted-foreground font-medium flex items-center bg-muted px-2 py-1 rounded-full">
               {group.requests.length} req
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
