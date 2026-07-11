import { ConflictRecord } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ConflictCard({ conflict }: { conflict: ConflictRecord }) {
  return (
    <Card className="border-l-4 border-l-destructive shadow-sm">
      <CardContent className="p-5 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-lg flex items-center gap-2">
              {conflict.name}
              <Badge variant="outline" className="font-mono text-xs">{conflict.enrollment}</Badge>
            </h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Badge variant="secondary" className="text-xs">Div {conflict.division}</Badge>
              <Badge variant="secondary" className="text-xs">{conflict.specialization}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-destructive font-semibold text-sm bg-destructive/10 px-2.5 py-1 rounded-full">
            <AlertCircle className="w-4 h-4" />
            {conflict.severity === 'multiple' ? 'Multiple Duplicates' : 'One Duplicate'}
          </div>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-3 border">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 tracking-wider">Appears In</p>
          <div className="flex flex-col gap-2">
            {conflict.appearsIn.map((appearance, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm bg-background p-2 rounded border">
                <span className="font-semibold">{appearance.groupNumber}</span>
                <div className="flex items-center gap-3 text-muted-foreground text-xs">
                  {appearance.createdBy && (
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {appearance.createdBy}</span>
                  )}
                  {appearance.createdAt && (
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(appearance.createdAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
