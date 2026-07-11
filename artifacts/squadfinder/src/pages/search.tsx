import { useState } from "react";
import { Layout } from "@/components/layout";
import { useRegisterLookingForGroup } from "@/hooks/use-students";
import { useSearch } from "@/hooks/use-search";
import { SearchInput } from "@/components/ui/search-input";
import { StudentCard } from "@/components/student-card";
import { GroupCard } from "@/components/group-card";
import { useGroup } from "@/hooks/use-students";
import { EmptyState } from "@/components/empty-state";
import { Search, Loader2, UserPlus, Compass, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ROUTES, SPECIALIZATION_LIST } from "@/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { searchStudentsByQuery } from "@/services/student.service"; // Direct for custom search hook

const formSchema = z.object({
  enrollment: z.string().min(8, "Enrollment number is too short").max(20, "Enrollment number is too long"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  specialization: z.enum(["CS", "IT", "AI", "DS", "CY", "EC"]),
});

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { results, isSearching } = useSearch(query);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const showResults = query.trim().length > 0;
  
  const studentMatch = results.find(s => s.enrollment === selectedStudent) || (results.length === 1 ? results[0] : null);
  const studentGroup = useGroup(studentMatch?.group);

  const { register } = useRegisterLookingForGroup();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enrollment: "",
      name: "",
      specialization: "CS",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      register(values);
      toast({
        title: "Successfully registered!",
        description: "You are now listed as looking for a group.",
      });
      setIsRegisterOpen(false);
      setQuery(values.enrollment); // auto search for them
      form.reset();
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to register.",
        variant: "destructive"
      });
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col items-center max-w-4xl">
        <div className="text-center mb-10 w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Find Your Status</h1>
          <p className="text-xl text-muted-foreground text-balance">
            Enter your enrollment number to see your capstone group assignment and teammates.
          </p>
        </div>

        <div className="w-full max-w-2xl relative mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-colors opacity-50"></div>
            <SearchInput 
              placeholder="Enter your Enrollment Number (e.g. 21012345)" 
              className="h-16 text-lg pl-14 rounded-2xl shadow-lg border-primary/20 bg-background relative z-10"
              icon={isSearching ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Search className="h-6 w-6 text-primary" />}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedStudent(null);
              }}
              autoFocus
            />
          </div>

          {/* Quick results dropdown if multiple matches and none selected explicitly */}
          {showResults && results.length > 1 && !studentMatch && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
              <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Select a student ({results.length} matches)
                </div>
                {results.slice(0, 8).map(student => (
                  <button 
                    key={student.enrollment}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted flex items-center justify-between transition-colors"
                    onClick={() => {
                      setSelectedStudent(student.enrollment);
                      setQuery(student.enrollment); // Update input to exact match
                    }}
                  >
                    <div>
                      <div className="font-semibold">{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.enrollment}</div>
                    </div>
                    <div className="text-xs font-mono bg-muted-foreground/10 px-2 py-1 rounded">
                      {student.specialization}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Student View */}
        <div className="w-full">
          {!showResults ? (
            <div className="opacity-60 grayscale-[50%] pointer-events-none transition-opacity duration-500">
              <EmptyState 
                icon={<Search className="w-8 h-8" />}
                title="Awaiting Input"
                description="Type an enrollment number above to instantly search the roster."
                className="bg-transparent border-none"
              />
            </div>
          ) : results.length === 0 && !isSearching ? (
            <EmptyState 
              icon={<UserPlus className="w-8 h-8 text-primary" />}
              title="Student Not Found"
              description={`We couldn't find anyone matching "${query}". Double check your enrollment number.`}
              action={
                <Button onClick={() => setIsRegisterOpen(true)} className="mt-2 rounded-full px-6">
                  Register as "Looking for a Team"
                </Button>
              }
            />
          ) : studentMatch ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-8 w-full">
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Your Profile</h3>
                <StudentCard student={studentMatch} className="border-primary/20 shadow-md bg-primary/5" />
              </div>

              {studentMatch.group && studentGroup ? (
                <div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Your Group Info</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <GroupCard group={studentGroup} />
                    <div className="flex flex-col gap-3">
                      <h4 className="font-semibold text-sm">All Teammates</h4>
                      <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-2">
                        {studentGroup.members.filter(m => m.enrollment !== studentMatch.enrollment).map(member => (
                          <div key={member.enrollment} className="flex items-center justify-between p-3 rounded-lg border bg-card text-sm">
                            <div className="font-medium">{member.name}</div>
                            <div className="text-muted-foreground font-mono text-xs">{member.specialization}</div>
                          </div>
                        ))}
                        {studentGroup.members.length === 1 && (
                          <div className="p-4 text-center border border-dashed rounded-lg text-muted-foreground text-sm">
                            You are currently the only member in this group.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-dashed border-muted-foreground/30 rounded-2xl p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center mb-4">
                    <Compass className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No Group Assigned</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    You are currently marked as FREE. You don't have a capstone team yet.
                  </p>
                  
                  <div className="flex gap-4">
                    <Button asChild variant="outline">
                      <Link href={ROUTES.available}>Browse Available Students</Link>
                    </Button>
                    {studentMatch.status !== 'FREE' && (
                       <Button onClick={() => {
                        form.setValue("enrollment", studentMatch.enrollment);
                        form.setValue("name", studentMatch.name);
                        form.setValue("specialization", studentMatch.specialization);
                        setIsRegisterOpen(true);
                       }}>
                         List Myself as Available
                       </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Registration Dialog */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Looking for a Group</DialogTitle>
            <DialogDescription>
              Add yourself to the available students list so other teams can find you.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="enrollment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enrollment Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 21012345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SPECIALIZATION_LIST.map((spec) => (
                          <SelectItem key={spec.code} value={spec.code}>
                            {spec.label} ({spec.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-4 flex justify-end">
                <Button type="submit" className="w-full">Register Availability</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}