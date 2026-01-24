import { Layout } from "@/components/Layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Job, insertJobSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, MapPin, Clock, Trash2, Plus } from "lucide-react";
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

export default function Careers() {
  const { data: user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const form = useForm({
    resolver: zodResolver(insertJobSchema),
    defaultValues: { role: "", description: "", location: "", type: "Full-time", salary: "" }
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
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl font-bold mb-4">Join Our Team</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're always looking for passionate tea enthusiasts to join the Chai Craft family.
          </p>
          {user?.role === "admin" && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="mt-8 gap-2"><Plus className="h-4 w-4" /> Add Job Role</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Post New Job</DialogTitle></DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                    <FormField control={form.control} name="role" render={({ field }) => (
                      <FormItem><FormLabel>Role</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" className="w-full" disabled={createMutation.isPending}>Post Job</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-6 max-w-4xl mx-auto">
          {jobs?.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">{job.role}</CardTitle>
                {user?.role === "admin" && (
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(job.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</div>
                  <div className="flex items-center gap-1"><Clock className="h-4 w-4" /> {job.type}</div>
                  <div className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.salary}</div>
                </div>
                <p className="text-sm line-clamp-3">{job.description}</p>
                <Button variant="outline" className="mt-4">Apply Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
