import { ConflictRecord } from "@/types";
import { Card } from "@/components/ui/card";
import { AlertCircle, Calendar, User, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export function ConflictCard({ conflict }: { conflict: ConflictRecord }) {
  return (
    <Card className="border-l-4 border-l-destructive shadow-sm hover:shadow-md transition-shadow duration-300">
      <AccordionItem value={conflict.enrollment} className="border-none">
        <AccordionTrigger className="p-5 hover:no-underline hover:bg-muted/30 transition-colors [&[data-state=open]>svg]:rotate-180 rounded-r-xl">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 sm:gap-2 w-full pr-4 text-left">
            <div className="flex flex-col gap-3 sm:gap-1">
              <h4 className="font-bold text-xl sm:text-lg flex flex-col sm:flex-row items-start sm:items-center gap-2">
                {conflict.name}
                <Badge variant="outline" className="font-mono text-sm sm:text-xs w-fit">{conflict.enrollment}</Badge>
              </h4>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1 sm:mt-0">
                <Badge variant="secondary" className="text-xs">Div {conflict.division}</Badge>
                <Badge variant="secondary" className="text-xs">{conflict.specialization}</Badge>
              </div>
            </div>
            <div className="inline-flex w-fit items-center gap-1.5 text-destructive font-semibold text-sm bg-destructive/10 px-3 py-1.5 rounded-full mt-1 sm:mt-0">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{conflict.severity === 'multiple' ? 'Multiple Duplicates' : 'One Duplicate'}</span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-5 pb-5 pt-2">
          <div className="bg-muted/30 rounded-xl sm:rounded-lg p-4 sm:p-3 border">
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-3 sm:mb-2 tracking-wider">Appears In</p>
            <div className="flex flex-col gap-3 sm:gap-2">
              {conflict.appearsIn.map((appearance, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-1 text-sm bg-background p-4 sm:p-2 rounded-lg sm:rounded border border-border/50 hover:border-border transition-colors shadow-sm sm:shadow-none hover:shadow-md sm:hover:shadow-none">
                  <span className="font-semibold flex items-center gap-1.5 text-base sm:text-sm">
                    <Users className="w-4 h-4 text-muted-foreground sm:hidden" />
                    Group {appearance.groupNumber}
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 text-muted-foreground text-xs">
                    {appearance.createdBy && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-muted-foreground/70 sm:hidden">Added by:</span>
                        <User className="w-3.5 h-3.5 sm:w-3 sm:h-3" /> 
                        {appearance.createdBy}
                      </span>
                    )}
                    {appearance.createdAt && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 sm:w-3 sm:h-3" /> 
                        {new Date(appearance.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Card>
  );
}
