import { Layout } from "@/components/Layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Job, insertJobSchema, insertJobApplicationSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, MapPin, Clock, Trash2, Plus, Info, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { useUser } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

export default function Careers() {
  const { data: user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [step, setStep] = useState(1);

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
      gender: "Prefer not to say",
      resumeUrl: "",
      message: "",
      acceptedTerms: false,
      answers: {
        canCommute: "yes",
        hasExperience: "no"
      }
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
      queryClient.invalidateQueries({ queryKey: ["/api/my-applications"] });
      toast({ title: "Application Submitted", description: "We'll be in touch soon!" });
      setApplyingJob(null);
      setStep(1);
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

  const { data: myApplications } = useQuery<any[]>({
    queryKey: ["/api/my-applications"],
    enabled: !!user,
  });

  const withdrawMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/job-applications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-applications"] });
      toast({ title: "Application Withdrawn" });
    }
  });

  const validateStep = async () => {
    let fields: any[] = [];
    if (step === 1) fields = ["name", "email", "phone", "gender"];
    if (step === 2) fields = ["resumeUrl", "message"];
    if (step === 3) fields = ["acceptedTerms"];

    const result = await applyForm.trigger(fields as any);
    if (result) setStep(step + 1);
    else {
      toast({ 
        title: "Incomplete details", 
        description: "Please fill all required fields correctly.",
        variant: "destructive"
      });
    }
  };

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
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {user && myApplications && myApplications.length > 0 && (
          <div className="max-w-5xl mx-auto mb-16">
            <h2 className="font-serif text-2xl font-bold mb-6">Your Applications</h2>
            <div className="grid gap-4">
              {myApplications.map((app) => (
                <Card key={app.id} className="rounded-2xl border-none shadow-sm bg-muted/30">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg">{jobs?.find(j => j.id === app.jobId)?.role || "Unknown Role"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="capitalize">{app.status}</Badge>
                        <p className="text-xs text-muted-foreground">Applied on {new Date(app.createdAt!).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {app.status === 'pending' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => withdrawMutation.mutate(app.id)}
                      >
                        Withdraw
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-8 max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif text-3xl font-bold">Open Positions</h2>
          </div>
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
                    <Dialog open={applyingJob?.id === job.id} onOpenChange={(open) => {
                      if (!open) setStep(1);
                      setApplyingJob(open ? job : null);
                    }}>
                      <DialogTrigger asChild>
                        <Button className="rounded-full px-8 h-11 bg-primary hover:bg-primary/90 text-white font-bold group-hover:scale-105 transition-all">
                          Apply Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-serif">Apply for {job.role}</DialogTitle>
                          <DialogDescription>Step {step} of 3: {step === 1 ? "Personal Details" : step === 2 ? "Experience & Info" : "Terms"}</DialogDescription>
                        </DialogHeader>
                        <Form {...applyForm}>
                          <form onSubmit={applyForm.handleSubmit((data) => {
                            applyMutation.mutate({ ...data, jobId: job.id });
                          })} className="space-y-5 py-4">
                            {step === 1 && (
                              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
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
                                <FormField control={applyForm.control} name="gender" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <FormControl>
                                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="male" id="male" />
                                          <label htmlFor="male" className="text-sm font-medium">Male</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="female" id="female" />
                                          <label htmlFor="female" className="text-sm font-medium">Female</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="other" id="other" />
                                          <label htmlFor="other" className="text-sm font-medium">Other</label>
                                        </div>
                                      </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                              </div>
                            )}

                            {step === 2 && (
                              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                <FormField control={applyForm.control} name="resumeUrl" render={({ field }) => (
                                  <FormItem><FormLabel>Resume Link (Google Drive/Dropbox)</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={applyForm.control} name="message" render={({ field }) => (
                                  <FormItem><FormLabel>Tell us about yourself</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <div className="space-y-4">
                                  <FormLabel className="text-base">Quick Questions</FormLabel>
                                  <div className="grid gap-4 border rounded-xl p-4 bg-muted/30">
                                    <FormField control={applyForm.control} name="answers.canCommute" render={({ field }) => (
                                      <FormItem className="flex items-center justify-between">
                                        <FormLabel className="text-sm">Can you commute to our location?</FormLabel>
                                        <FormControl>
                                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-2">
                                            <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="q1-yes" /><label htmlFor="q1-yes" className="text-xs">Yes</label></div>
                                            <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="q1-no" /><label htmlFor="q1-no" className="text-xs">No</label></div>
                                          </RadioGroup>
                                        </FormControl>
                                      </FormItem>
                                    )} />
                                    <FormField control={applyForm.control} name="answers.hasExperience" render={({ field }) => (
                                      <FormItem className="flex items-center justify-between">
                                        <FormLabel className="text-sm">Do you have prior experience?</FormLabel>
                                        <FormControl>
                                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-2">
                                            <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="q2-yes" /><label htmlFor="q2-yes" className="text-xs">Yes</label></div>
                                            <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="q2-no" /><label htmlFor="q2-no" className="text-xs">No</label></div>
                                          </RadioGroup>
                                        </FormControl>
                                      </FormItem>
                                    )} />
                                  </div>
                                </div>
                              </div>
                            )}

                            {step === 3 && (
                              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="p-6 bg-muted/30 rounded-2xl text-sm space-y-4">
                                  <h3 className="font-bold text-lg">Terms & Conditions</h3>
                                  <p className="text-muted-foreground">By submitting this application, you agree to:</p>
                                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                    <li>Provide accurate and truthful information.</li>
                                    <li>Allow us to contact you regarding this application.</li>
                                    <li>Store your data for recruitment purposes only.</li>
                                  </ul>
                                </div>
                                <FormField control={applyForm.control} name="acceptedTerms" render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-xl bg-primary/5 border-primary/20">
                                    <FormControl>
                                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="text-sm font-bold cursor-pointer">I accept the terms and conditions</FormLabel>
                                      <p className="text-xs text-muted-foreground">Required to proceed with the application.</p>
                                    </div>
                                  </FormItem>
                                )} />
                              </div>
                            )}

                            <div className="flex gap-3 pt-4">
                              {step > 1 && (
                                <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={() => setStep(step - 1)}>
                                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                                </Button>
                              )}
                              {step < 3 ? (
                                <Button type="button" className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-white font-bold" onClick={validateStep}>
                                  Next <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                              ) : (
                                <Button type="submit" className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-white font-bold h-12" disabled={applyMutation.isPending || !applyForm.watch("acceptedTerms")}>
                                  {applyMutation.isPending ? "Submitting..." : "Send Application"}
                                </Button>
                              )}
                            </div>
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
