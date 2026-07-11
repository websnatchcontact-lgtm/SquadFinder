import { useState } from "react";
import { Layout } from "@/components/layout";
import { useAvailableStudents } from "@/hooks/use-students";
import { StudentCard } from "@/components/student-card";
import { SkeletonStudentCard } from "@/components/loading-skeleton";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/empty-state";
import { Compass, Filter, Search } from "lucide-react";
import { SPECIALIZATION_LIST } from "@/constants";
import { Badge } from "@/components/ui/badge";

export default function Available() {
  const { students, isLoading } = useAvailableStudents();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);

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
            title="No students available"
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
              <StudentCard key={student.enrollment} student={student} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}