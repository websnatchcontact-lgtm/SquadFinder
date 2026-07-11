import { useState } from "react";
import { Layout } from "@/components/layout";
import { useRegisterLookingForGroup } from "@/hooks/use-students";
import { useSearch } from "@/hooks/use-search";
import { SearchInput } from "@/components/ui/search-input";
import { StudentCard } from "@/components/student-card";
import { GroupCard } from "@/components/group-card";
import { useStudents } from "@/hooks/use-students";
import { useGroup as useGroupFull } from "@/hooks/use-groups";
import { useGroupActions } from "@/hooks/use-group-actions";
import { EmptyState } from "@/components/empty-state";
import { Search, Loader2, UserPlus, Compass, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ROUTES, SPECIALIZATION_LIST, DIVISION_LIST } from "@/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ConfirmationBadge } from "@/components/badges";

const formSchema = z.object({
  enrollment: z.string().min(8, "Enrollment number is too short").max(20, "Enrollment number is too long"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  specialization: z.enum(["CS", "AIML"]),
  division: z.enum(["A", "B"]),
});

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { results, isSearching } = useSearch(query);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const showResults = query.trim().length > 0;
  
  const studentMatch = results.find(s => s.enrollment === selectedStudent) || (results.length === 1 ? results[0] : null);
  const { group: fullGroup, refresh: refreshGroup } = useGroupFull(studentMatch?.group);
  const { confirm } = useGroupActions();

  const { register } = useRegisterLookingForGroup();
  const { refresh: refreshStudents } = useStudents();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enrollment: "",
      name: "",
      specialization: "CS",
      division: "A",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      register(values);
      refreshStudents();
      toast({
        title: "Successfully registered!",
        description: "You are now listed as looking for a group.",
      });
      setIsRegisterOpen(false);
      setQuery(values.enrollment);
      form.reset();
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to register.",
        variant: "destructive"
      });
    }
  }

  const handleConfirmMembership = () => {
    if (studentMatch && fullGroup) {
      confirm(fullGroup.groupNumber, studentMatch.enrollment);
      refreshGroup();
      refreshStudents();
      toast({
        title: "Membership Confirmed",
        description: `You are now confirmed in ${fullGroup.groupNumber}`,
      });
    }
  };

  const isConfirmed = fullGroup?.members.find(m => m.enrollment === studentMatch?.enrollment)?.confirmed;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col items-center max-w-4xl">
        <div className="text-center mb-10 w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Find Any Student</h1>
          <p className="text-xl text-muted-foreground text-balance">
            Search by name or enrollment number to see group assignments, status, and confirmations.
          </p>
        </div>

        <div className="w-full max-w-2xl relative mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-colors opacity-50"></div>
            <SearchInput 
              placeholder="Search by Name or Enrollment Number..." 
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
                      setQuery(student.enrollment);
                    }}
                  >
                    <div>
                      <div className="font-semibold">{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.enrollment}</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="text-xs font-mono bg-muted-foreground/10 px-2 py-1 rounded">
                        Div {student.division}
                      </div>
                      <div className="text-xs font-mono bg-muted-foreground/10 px-2 py-1 rounded">
                        {student.specialization}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full">
          {!showResults ? (
            <div className="opacity-60 grayscale-[50%] pointer-events-none transition-opacity duration-500">
              <EmptyState 
                icon={<Search className="w-8 h-8" />}
                title="Awaiting Input"
                description="Type a name or enrollment number above to search the roster."
                className="bg-transparent border-none"
              />
            </div>
          ) : results.length === 0 && !isSearching ? (
            <EmptyState 
              icon={<UserPlus className="w-8 h-8 text-primary" />}
              title="Student Not Found"
              description={`We couldn't find anyone matching "${query}". Double check your search term.`}
              action={
                <Button onClick={() => setIsRegisterOpen(true)} className="mt-2 rounded-full px-6">
                  Register as "Looking for a Team"
                </Button>
              }
            />
          ) : studentMatch ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-8 w-full">
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Profile</h3>
                <StudentCard student={studentMatch} className="border-primary/20 shadow-md bg-primary/5" />
              </div>

              {studentMatch.group && fullGroup ? (
                <div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Group Info</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4">
                      <GroupCard group={fullGroup} />
                      {!isConfirmed && (
                         <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-5 flex flex-col items-center text-center gap-3">
                           <h4 className="font-semibold text-amber-900 dark:text-amber-200">Confirmation Needed</h4>
                           <p className="text-sm text-amber-800/80 dark:text-amber-200/80">
                             You have been added to this group but haven't confirmed your membership yet.
                           </p>
                           <Button onClick={handleConfirmMembership} className="w-full mt-2">
                             I Confirm I'm In This Group
                           </Button>
                         </div>
                      )}
                      {fullGroup.notes && (
                        <div className="bg-muted/30 border rounded-xl p-4">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Group Notes</h4>
                          <p className="text-sm whitespace-pre-wrap">{fullGroup.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <h4 className="font-semibold text-sm">All Teammates</h4>
                      <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px] pr-2">
                        {fullGroup.members.map(member => (
                          <div key={member.enrollment} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-card shadow-sm gap-2">
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {member.name}
                                {member.enrollment === studentMatch.enrollment && " (You)"}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono">{member.specialization} • Div {member.division}</span>
                            </div>
                            <ConfirmationBadge confirmed={member.confirmed} />
                          </div>
                        ))}
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
                    This student is currently marked as FREE and doesn't have a capstone team yet.
                  </p>
                  
                  <div className="flex gap-4">
                    <Button asChild variant="outline">
                      <Link href={ROUTES.available}>Browse Available Students</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="division"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Division</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select division" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DIVISION_LIST.map((div) => (
                            <SelectItem key={div} value={div}>Div {div}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                          <SelectTrigger><SelectValue placeholder="Select spec" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SPECIALIZATION_LIST.map((spec) => (
                            <SelectItem key={spec.code} value={spec.code}>{spec.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
