import { useState } from "react";
import { Layout } from "@/components/layout";
import { useAllRequests } from "@/hooks/use-requests";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RevokeRequestDialog } from "@/components/revoke-request-dialog";
import { EmptyState } from "@/components/empty-state";
import { Inbox, Trash2, Calendar, Clock, Hash, CheckCircle2 } from "lucide-react";
import type { JoinRequest } from "@/types";
import { useGroups } from "@/hooks/use-groups";

export default function RequestsPage() {
  const { requests } = useAllRequests();
  const { groups } = useGroups();
  const [revokeRequest, setRevokeRequest] = useState<JoinRequest | null>(null);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
              <Inbox className="w-8 h-8 text-primary" />
              Pending Requests
            </h1>
            <p className="text-muted-foreground text-balance">
              Manage your submitted group join requests. Only the student who created a request can revoke it using their Safety PIN.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
              {requests.length} Pending
            </Badge>
          </div>
        </div>

        {requests.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-8 h-8" />}
            title="No Pending Requests"
            description="There are currently no pending requests to join any group. When you submit a request, it will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <Card key={req.id} className="flex flex-col h-full border-amber-200/60 bg-amber-50/30 dark:bg-amber-900/10 hover:border-amber-300 transition-colors">
                <CardHeader className="p-5 pb-4 flex flex-row items-start justify-between space-y-0">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-lg">Student Name: {req.name}</h3>
                    <div className="text-sm font-mono text-muted-foreground">Enrollment Number: {req.enrollment}</div>
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    Pending
                  </Badge>
                </CardHeader>
                <CardContent className="p-5 pt-0 flex-grow flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-background">Division: {req.division}</Badge>
                    <Badge variant="outline" className="bg-background">Specialization: {req.specialization}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 p-3 bg-background/60 rounded-md border mt-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                        <Hash className="w-3 h-3" /> Requested Group
                      </span>
                      <span className="font-medium">{req.groupNumber}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Requested Time
                      </span>
                      <span className="text-sm">
                        {new Date(req.requestedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                        <Hash className="w-3 h-3" /> Group Number
                      </span>
                      <span className="font-medium">{req.groupNumber}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Created Date
                      </span>
                      <span className="text-sm">
                        {(() => {
                          const group = groups?.find(g => g.groupNumber === req.groupNumber);
                          return group?.createdAt ? new Date(group.createdAt).toLocaleDateString() : "Unknown";
                        })()}
                      </span>
                    </div>
                  </div>

                  {req.note && (
                    <div className="text-sm italic text-muted-foreground bg-background/50 p-3 rounded-md border border-dashed">
                      Optional Note: "{req.note}"
                    </div>
                  )}

                  <div className="mt-auto pt-4 flex justify-between items-center">
                    <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Pending Badge
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => setRevokeRequest(req)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Revoke Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <RevokeRequestDialog 
        request={revokeRequest} 
        open={!!revokeRequest} 
        onOpenChange={(open) => !open && setRevokeRequest(null)} 
      />
    </Layout>
  );
}
