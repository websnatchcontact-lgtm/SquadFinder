import { useState } from "react";
import { Layout } from "@/components/layout";
import { useAvailableStudents } from "@/hooks/use-students";
import { StudentCard } from "@/components/student-card";
import { SkeletonStudentCard } from "@/components/loading-skeleton";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/empty-state";
import { Compass, Filter, Search, AlertTriangle } from "lucide-react";
import { SPECIALIZATION_LIST } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRemoveLookingForGroup } from "@/hooks/use-students";
import { useToast } from "@/hooks/use-toast";
import type { Student } from "@/types";

export default function Available() {
  const { students, isLoading, refresh } = useAvailableStudents();
  const { remove } = useRemoveLookingForGroup();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);

  const [selectedStudentToRemove, setSelectedStudentToRemove] = useState<Student | null>(null);
  const [removePin, setRemovePin] = useState("");
  const [removeError, setRemoveError] = useState<string | null>(null);

  const handleRemove = async () => {
    if (!selectedStudentToRemove) return;
    setRemoveError(null);
    const success = await remove(selectedStudentToRemove.enrollment, removePin);
    if (success) {
      toast({ title: "You have been removed from the Available Students list." });
      refresh();
      handleCloseRemove();
    } else {
      setRemoveError("The Safety PIN you entered is incorrect.");
    }
  };

  const handleCloseRemove = () => {
    setSelectedStudentToRemove(null);
    setRemovePin("");
    setRemoveError(null);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.enrollment.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpec = selectedSpec ? s.specialization === selectedSpec : true;
    
    return matchesSearch && matchesSpec;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Available Students</h1>
            <p className="text-muted-foreground text-lg">Find teammates to complete your capstone group.</p>
          </div>
          
          <div className="w-full md:w-80">
            <SearchInput 
              placeholder="Search by name or enrollment..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <div className="flex items-center text-sm font-medium text-muted-foreground mr-2">
            <Filter className="w-4 h-4 mr-1" /> Filters:
          </div>
          <Badge 
            variant={selectedSpec === null ? "default" : "outline"} 
            className="cursor-pointer text-sm py-1 px-3"
            onClick={() => setSelectedSpec(null)}
          >
            All
          </Badge>
          {SPECIALIZATION_LIST.map(spec => (
            <Badge 
              key={spec.code}
              variant={selectedSpec === spec.code ? "default" : "outline"} 
              className="cursor-pointer text-sm py-1 px-3"
              onClick={() => setSelectedSpec(spec.code)}
            >
              {spec.code}
            </Badge>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <SkeletonStudentCard key={i} />
            ))}
          </div>
        ) : students.length === 0 ? (
          <EmptyState 
            icon={<Compass className="w-10 h-10" />}
            title="No students are currently looking for a group."
            description="Everyone seems to have found a team! Check back later as more students register their availability."
            className="mt-12"
          />
        ) : filteredStudents.length === 0 ? (
          <EmptyState 
            icon={<Search className="w-10 h-10" />}
            title="No matches found"
            description="No available students match your current search and filter criteria."
            className="mt-12"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStudents.map(student => (
              <StudentCard 
                key={student.enrollment} 
                student={student} 
                onRemoveClick={() => setSelectedStudentToRemove(student)}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedStudentToRemove} onOpenChange={(open) => !open && handleCloseRemove()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remove Yourself from Available Students?</DialogTitle>
            <DialogDescription>
              To prevent someone else from removing your listing, please enter the Safety PIN you created when you registered.
            </DialogDescription>
          </DialogHeader>
          
          {removeError && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-start gap-2 mt-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{removeError}</p>
            </div>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pin">Safety PIN</Label>
              <Input 
                id="pin" 
                type="password"
                placeholder="Enter your PIN" 
                value={removePin}
                onChange={(e) => setRemovePin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRemove()}
                autoFocus
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseRemove}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemove}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}