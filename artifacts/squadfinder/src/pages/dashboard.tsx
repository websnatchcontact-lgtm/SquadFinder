import { Layout } from "@/components/layout";
import { useStatistics, useGroups } from "@/hooks/use-statistics";
import { SkeletonStats } from "@/components/loading-skeleton";
import { StatCard } from "@/components/stat-card";
import { Users, Layers, Users2, AlertCircle, Search, Compass, BookOpen } from "lucide-react";
import { GroupCard } from "@/components/group-card";
import { useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StudentCard } from "@/components/student-card";
import { Group } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ROUTES } from "@/constants";

export default function Dashboard() {
  const { stats, isLoading: statsLoading } = useStatistics();
  const { groups, isLoading: groupsLoading } = useGroups();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const filteredGroups = groups.filter(g => 
    g.groupNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.members.some(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.enrollment.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col gap-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Dashboard</h1>
            <p className="text-muted-foreground text-lg">Real-time overview of the capstone cohort.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href={ROUTES.search} className="text-sm font-medium text-primary hover:underline flex items-center">
              <Search className="w-4 h-4 mr-1" /> Find a student
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <section>
          {statsLoading || !stats ? (
            <SkeletonStats />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Total Students" 
                value={stats.totalStudents} 
                icon={<Users className="w-5 h-5" />} 
                description={`${stats.studentsInGroups} grouped`}
              />
              <StatCard 
                title="Total Groups" 
                value={stats.totalGroups} 
                icon={<Layers className="w-5 h-5" />} 
                description={`${stats.groupsFull} full, ${stats.groupsWithOpenSeats} open`}
              />
              <StatCard 
                title="Looking For Team" 
                value={stats.studentsLooking} 
                icon={<Compass className="w-5 h-5" />} 
                trend={`${stats.availableSeatsRemaining} seats left`}
                trendUp={stats.availableSeatsRemaining > stats.studentsLooking}
              />
              <StatCard 
                title="Average Group Size" 
                value={stats.averageGroupSize} 
                icon={<Users2 className="w-5 h-5" />} 
                description={`Min ${stats.smallestGroupSize}, Max ${stats.largestGroupSize}`}
              />
            </div>
          )}
        </section>

        {/* Branch breakdown - Optional extra data visualization */}
        {!statsLoading && stats && (
          <section>
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  Specialization Breakdown
                </div>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(stats.specializationBreakdown).map(([spec, count]) => (
                    <div key={spec} className="flex items-center bg-background border rounded-lg px-4 py-2 shadow-sm">
                      <span className="font-bold mr-2 text-lg">{count}</span>
                      <Badge variant="outline" className="font-mono text-xs">{spec}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Groups Grid */}
        <section className="flex flex-col gap-6">
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

          {groupsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="py-20 text-center border rounded-2xl bg-card">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold">No groups found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGroups.map(group => (
                <GroupCard 
                  key={group.groupNumber} 
                  group={group} 
                  onClick={() => setSelectedGroup(group)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Group Detail Modal */}
      <Dialog open={!!selectedGroup} onOpenChange={(open) => !open && setSelectedGroup(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          {selectedGroup && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between mb-1">
                  <DialogTitle className="text-2xl">Group {selectedGroup.groupNumber}</DialogTitle>
                  <Badge variant={selectedGroup.isFull ? "secondary" : "default"}>
                    {selectedGroup.isFull ? "Full Team" : `${selectedGroup.seatsLeft} Seats Open`}
                  </Badge>
                </div>
                <DialogDescription>
                  {selectedGroup.totalMembers} members • {Object.keys(selectedGroup.specializationCounts).length} specializations mixed
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-wrap gap-2 py-4 border-y my-2 bg-muted/20 -mx-6 px-6">
                {Object.entries(selectedGroup.specializationCounts).map(([spec, count]) => (
                  <Badge key={spec} variant="outline" className="font-mono bg-background">
                    {spec} <span className="opacity-50 ml-1 text-[10px]">x{count}</span>
                  </Badge>
                ))}
              </div>

              <div className="overflow-y-auto pr-2 flex-1 pb-4">
                <h4 className="font-semibold mb-4 sticky top-0 bg-background pt-2 pb-2 z-10 text-sm text-muted-foreground uppercase tracking-wider">Team Members</h4>
                <div className="flex flex-col gap-3">
                  {selectedGroup.members.map(member => (
                    <StudentCard key={member.enrollment} student={member} />
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}