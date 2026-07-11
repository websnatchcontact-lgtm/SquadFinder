import { Layout } from "@/components/layout";
import { useStatistics } from "@/hooks/use-statistics";
import { useGroups } from "@/hooks/use-groups";
import { SkeletonStats } from "@/components/loading-skeleton";
import { StatCard } from "@/components/stat-card";
import { Users, Layers, Users2, AlertCircle, Search, Compass, ShieldAlert } from "lucide-react";
import { RevokeRequestDialog } from "@/components/revoke-request-dialog";
import { GroupCard } from "@/components/group-card";
import { useState, useMemo } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { StudentCard } from "@/components/student-card";
import { Group, GroupFilters, GroupSortKey, JoinRequest } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ROUTES } from "@/constants";
import { GroupFilterBar } from "@/components/group-filter-bar";
import { sortGroups, filterGroups } from "@/utils/groups";
import { CreateGroupDialog } from "@/components/create-group-dialog";
import { Button } from "@/components/ui/button";
import { ConflictCard } from "@/components/conflict-card";
import { useConflicts } from "@/hooks/use-conflicts";
import { HealthBadge, ConfirmationBadge } from "@/components/badges";
import { RequestToJoinDialog } from "@/components/request-to-join-dialog";
import { useGroupActions } from "@/hooks/use-group-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { generateInitials } from "@/utils/students";
import { Textarea } from "@/components/ui/textarea";

export default function Dashboard() {
  const { stats, isLoading: statsLoading, refresh: refreshStats } = useStatistics();
  const { groups, isLoading: groupsLoading, refresh: refreshGroups } = useGroups();
  const { conflicts, isLoading: conflictsLoading, refresh: refreshConflicts } = useConflicts();
  const { saveNotes, revoke } = useGroupActions();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [filters, setFilters] = useState<GroupFilters>({});
  const [sortKey, setSortKey] = useState<GroupSortKey>('alphabetical');
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [requestJoinGroup, setRequestJoinGroup] = useState<Group | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [noteValue, setNoteValue] = useState("");
  const [revokeRequest, setRevokeRequest] = useState<JoinRequest | null>(null);

  const displayGroups = useMemo(() => {
    let result = groups;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g => 
        g.groupNumber.toLowerCase().includes(q) || 
        g.members.some(m => 
          m.name.toLowerCase().includes(q) || 
          m.enrollment.toLowerCase().includes(q)
        )
      );
    }
    result = filterGroups(result, filters);
    result = sortGroups(result, sortKey);
    return result;
  }, [groups, searchQuery, filters, sortKey]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col gap-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Dashboard</h1>
            <p className="text-muted-foreground text-lg">Real-time overview of the capstone cohort.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button onClick={() => setCreateGroupOpen(true)} className="rounded-full shadow-sm" size="lg">
              <Users className="w-4 h-4 mr-2" /> Create Group
            </Button>
            <Link href={ROUTES.search} className="text-sm font-medium text-primary hover:underline flex items-center ml-2">
              <Search className="w-4 h-4 mr-1" /> Find student
            </Link>
          </div>
        </div>

        <section>
          {statsLoading || !stats ? (
            <SkeletonStats />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Total Students" 
                value={stats.totalStudents} 
                icon={<Users className="w-5 h-5" />} 
                description={`${stats.studentsInGroups} grouped, ${stats.studentsLooking} looking`}
              />
              <StatCard 
                title="Total Groups" 
                value={stats.totalGroups} 
                icon={<Layers className="w-5 h-5" />} 
                description={`${stats.totalGroups - stats.openSeats > 0 ? 'Some full' : ''}`}
                trend={`${stats.openSeats} open seats`}
                trendUp={stats.openSeats > 0}
              />
              <StatCard 
                title="Confirmations" 
                value={stats.confirmedMembers} 
                icon={<Compass className="w-5 h-5" />} 
                description={`${stats.unconfirmedMembers} pending, ${stats.pendingRequests} requests`}
              />
              <StatCard 
                title="System Health" 
                value={stats.conflictCount} 
                icon={<ShieldAlert className={`w-5 h-5 ${stats.conflictCount > 0 ? 'text-destructive' : 'text-emerald-500'}`} />} 
                description={stats.conflictCount === 0 ? 'All clean' : 'Conflicts detected'}
                trend={stats.conflictCount > 0 ? "Requires attention" : "Healthy"}
                trendUp={stats.conflictCount === 0}
              />
            </div>
          )}
        </section>

        {!conflictsLoading && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className={`w-6 h-6 ${conflicts.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
              <h2 className="text-2xl font-bold tracking-tight">Conflict Center</h2>
              {conflicts.length > 0 && <Badge variant="destructive" className="ml-2 rounded-full px-2.5">{conflicts.length}</Badge>}
            </div>
            
            {conflicts.length > 0 ? (
              <>
                <p className="text-muted-foreground">These students appear in multiple groups and must resolve their status.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {conflicts.map(c => <ConflictCard key={c.enrollment} conflict={c} />)}
                </div>
              </>
            ) : (
              <div className="py-8 text-center border border-border/60 border-dashed rounded-2xl bg-card shadow-sm">
                <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold">No conflicts detected.</h3>
                <p className="text-muted-foreground mt-1">All student group assignments are valid.</p>
              </div>
            )}
          </section>
        )}

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold tracking-tight">All Groups</h2>
              <div className="w-full sm:w-72">
                <SearchInput 
                  placeholder="Search groups or students..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <GroupFilterBar 
              filters={filters} 
              setFilters={setFilters} 
              sortKey={sortKey} 
              setSortKey={setSortKey} 
            />
          </div>

          {groupsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="py-20 text-center border border-border/60 border-dashed rounded-2xl bg-card shadow-sm">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold">No groups have been created yet.</h3>
              <p className="text-muted-foreground mt-1">Create your first group to get started.</p>
            </div>
          ) : displayGroups.length === 0 ? (
            <div className="py-20 text-center border border-border/60 border-dashed rounded-2xl bg-card shadow-sm">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold">No groups available.</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayGroups.map(group => (
                <GroupCard 
                  key={group.groupNumber} 
                  group={group} 
                  onClick={() => {
                    setSelectedGroup(group);
                    setNoteValue(group.notes);
                    setEditingNotes(false);
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <CreateGroupDialog open={createGroupOpen} onOpenChange={setCreateGroupOpen} />

      {requestJoinGroup && (
        <RequestToJoinDialog 
          group={requestJoinGroup} 
          open={!!requestJoinGroup} 
          onOpenChange={(open) => !open && setRequestJoinGroup(null)} 
        />
      )}

      <Dialog open={!!selectedGroup} onOpenChange={(open) => !open && setSelectedGroup(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col p-0 gap-0">
          {selectedGroup && (
            <>
              <div className="p-6 pb-4 border-b bg-muted/10">
                <DialogHeader>
                  <div className="flex items-center justify-between mb-2">
                    <DialogTitle className="text-2xl">{selectedGroup.groupNumber}</DialogTitle>
                    <div className="flex gap-2">
                      <HealthBadge health={selectedGroup.health} />
                      {!selectedGroup.isFull && (
                        <Button size="sm" className="h-6 text-xs px-2 rounded" onClick={() => setRequestJoinGroup(selectedGroup)}>
                          Request to Join
                        </Button>
                      )}
                    </div>
                  </div>
                  <DialogDescription className="flex items-center gap-2">
                    <span>Created by {selectedGroup.createdBy || 'System'}</span>
                    {selectedGroup.createdAt && (
                      <>
                        <span>•</span>
                        <span>{new Date(selectedGroup.createdAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline" className="font-mono bg-background">
                    {selectedGroup.specialization}
                  </Badge>
                  {Object.entries(selectedGroup.divisionCounts).map(([div, count]) => (
                    <Badge key={div} variant="outline" className="font-mono bg-background">
                      Div {div} <span className="opacity-50 ml-1 text-[10px]">x{count}</span>
                    </Badge>
                  ))}
                  <div className="ml-auto text-sm text-muted-foreground flex items-center">
                     <Users className="w-4 h-4 mr-1" />
                     {selectedGroup.confirmedMembers}/{selectedGroup.totalMembers} Confirmed
                  </div>
                </div>
              </div>

              <div className="p-6 pt-4 flex flex-col gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Members</h4>
                  <div className="flex flex-col gap-3">
                    {selectedGroup.members.map(member => (
                      <div key={member.enrollment} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-card shadow-sm gap-2">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-8 w-8 border bg-muted/50">
                             <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                               {generateInitials(member.name)}
                             </AvatarFallback>
                           </Avatar>
                           <div className="flex flex-col">
                             <span className="font-semibold text-sm flex flex-wrap items-center gap-2">
                               {member.name}
                               {member.isCreator && <Badge variant="secondary" className="text-[10px] h-4 px-1 rounded-sm uppercase tracking-wider">Creator</Badge>}
                             </span>
                             <span className="text-xs text-muted-foreground font-mono">{member.enrollment}</span>
                           </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">Div {member.division}</Badge>
                          <ConfirmationBadge confirmed={member.confirmed} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedGroup.requests.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Pending Requests</h4>
                    <div className="flex flex-col gap-3">
                      {selectedGroup.requests.map(req => (
                        <div key={req.id} className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">{req.name}</span>
                              <span className="text-xs text-muted-foreground font-mono">{req.enrollment}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="text-xs bg-background">Div {req.division}</Badge>
                              <Badge variant="outline" className="text-xs bg-background">{req.specialization}</Badge>
                              <Badge variant="secondary" className="text-xs bg-amber-200/50 text-amber-900 dark:text-amber-200">Pending</Badge>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-6 text-xs px-2 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => setRevokeRequest(req)}
                              >
                                Revoke Request
                              </Button>
                            </div>
                          </div>
                          {req.note && (
                            <p className="text-sm italic text-muted-foreground bg-background/50 p-2 rounded border mt-2">"{req.note}"</p>
                          )}
                          <div className="text-[10px] text-muted-foreground mt-2 text-right">
                            Requested {new Date(req.requestedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Group Notes</h4>
                    {selectedGroup.source === 'local' && (
                      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => {
                        if (editingNotes) {
                          saveNotes(selectedGroup.groupNumber, noteValue);
                          setSelectedGroup(prev => prev ? {...prev, notes: noteValue} : prev);
                        }
                        setEditingNotes(!editingNotes);
                      }}>
                        {editingNotes ? "Save" : "Edit"}
                      </Button>
                    )}
                  </div>
                  {editingNotes ? (
                    <Textarea 
                      value={noteValue} 
                      onChange={e => setNoteValue(e.target.value)} 
                      placeholder="Add notes for this group..."
                      className="min-h-[100px] resize-none"
                    />
                  ) : (
                    <div className="p-4 rounded-lg bg-muted/30 text-sm whitespace-pre-wrap min-h-[60px]">
                      {selectedGroup.notes ? selectedGroup.notes : <span className="text-muted-foreground italic">No notes added.</span>}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <RevokeRequestDialog 
        request={revokeRequest} 
        open={!!revokeRequest} 
        onOpenChange={(open) => !open && setRevokeRequest(null)} 
      />
    </Layout>
  );
}
