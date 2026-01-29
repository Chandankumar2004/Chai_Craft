import { Layout } from "@/components/Layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Job, insertJobSchema, insertJobApplicationSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, MapPin, Clock, Trash2, Plus, Info, CheckCircle2 } from "lucide-react";
import { useUser } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function Careers() {
  const { data: user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const form = useForm({
    resolver: zodResolver(insertJobSchema),
    defaultValues: { 
      role: "", 
      description: "", 
      location: "", 
      type: "Full-time", 
      salary: "",
      requirements: "",
      benefits: "",
      status: "open"
    }
  });

  const applyForm = useForm({
    resolver: zodResolver(insertJobApplicationSchema),
    defaultValues: {
      jobId: 0,
      name: "",
      email: "",
      phone: "",
      resumeUrl: "",
      message: ""
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/jobs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Job Posted" });
      setIsAddOpen(false);
      form.reset();
    }
  });

  const applyMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/job-applications", data);
    },
    onSuccess: () => {
      toast({ title: "Application Submitted", description: "We'll be in touch soon!" });
      setApplyingJob(null);
      applyForm.reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/jobs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Job Deleted" });
    }
  });

  return (
    <Layout>
      <div className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1">Careers</Badge>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 text-primary">Join Our Craft</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            We're building more than just a tea shop. We're creating experiences. 
            Join the Chai Craft family and brew something amazing.
          </p>
          {user?.role === "admin" && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="mt-10 gap-2 h-12 px-8 rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                  <Plus className="h-5 w-5" /> Post New Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle className="text-2xl font-serif">Post New Job Opening</DialogTitle></DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="role" render={({ field }) => (
                        <FormItem><FormLabel>Role Title</FormLabel><FormControl><Input placeholder="e.g. Master Brewer" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="location" render={({ field }) => (
                        <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g. Mumbai, India" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="type" render={({ field }) => (
                        <FormItem><FormLabel>Employment Type</FormLabel><FormControl><Input placeholder="e.g. Full-time" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="salary" render={({ field }) => (
                        <FormItem><FormLabel>Salary Range</FormLabel><FormControl><Input placeholder="e.g. ₹30k - ₹45k" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={4} placeholder="What does this role involve?" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="requirements" render={({ field }) => (
                      <FormItem><FormLabel>Requirements</FormLabel><FormControl><Textarea placeholder="What are we looking for?" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" className="w-full h-12 text-lg" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Posting..." : "Post Job Opportunity"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid gap-8 max-w-5xl mx-auto">
          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />)
          ) : jobs?.filter(j => j.status === 'open').length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
              <p className="text-xl text-muted-foreground font-medium">No active openings at the moment.</p>
              <p className="text-sm text-muted-foreground mt-2">Check back soon or drop us a message!</p>
            </div>
          ) : (
            jobs?.filter(j => j.status === 'open').map((job) => (
              <Card key={job.id} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-3xl bg-white">
                <CardHeader className="flex flex-row items-start justify-between p-8 pb-0">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-serif text-primary group-hover:text-secondary transition-colors">{job.role}</CardTitle>
                    <div className="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground mt-2">
                      <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-secondary" /> {job.location}</div>
                      <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-secondary" /> {job.type}</div>
                      <div className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-secondary" /> {job.salary}</div>
                    </div>
                  </div>
                  {user?.role === "admin" && (
                    <Button variant="ghost" size="icon" className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteMutation.mutate(job.id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-muted-foreground leading-relaxed line-clamp-3 mb-6">{job.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <Dialog open={applyingJob?.id === job.id} onOpenChange={(open) => setApplyingJob(open ? job : null)}>
                      <DialogTrigger asChild>
                        <Button className="rounded-full px-8 h-11 bg-primary hover:bg-primary/90 text-white font-bold group-hover:scale-105 transition-all">
                          Apply Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-serif">Apply for {job.role}</DialogTitle>
                          <DialogDescription>Submit your details and we'll get back to you shortly.</DialogDescription>
                        </DialogHeader>
                        <Form {...applyForm}>
                          <form onSubmit={applyForm.handleSubmit((data) => {
                            applyMutation.mutate({ ...data, jobId: job.id });
                          })} className="space-y-5 py-4">
                            <FormField control={applyForm.control} name="name" render={({ field }) => (
                              <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField control={applyForm.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={applyForm.control} name="phone" render={({ field }) => (
                                <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="+91 XXXX XXX XXX" {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                            </div>
                            <FormField control={applyForm.control} name="resumeUrl" render={({ field }) => (
                              <FormItem><FormLabel>Resume Link (Google Drive/Dropbox)</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={applyForm.control} name="message" render={({ field }) => (
                              <FormItem><FormLabel>Why do you want to join us?</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={applyMutation.isPending}>
                              {applyMutation.isPending ? "Submitting..." : "Send Application"}
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    
                    {job.requirements && (
                      <div className="flex items-center gap-2 text-xs font-bold text-primary/60 uppercase tracking-widest">
                        <Info className="w-4 h-4" /> Requirements Listed
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
