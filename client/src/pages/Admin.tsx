import { Layout } from "@/components/Layout";
import { useUser } from "@/hooks/use-auth";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct } from "@shared/schema";
import { useState } from "react";
import { Edit, Trash2, Plus, CheckCircle, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { insertJobSchema } from "@shared/schema";
function JobsManager() {
  const { data: jobs } = useQuery<any[]>({ queryKey: ["/api/jobs"] });
  const { data: applications } = useQuery<any[]>({ queryKey: ["/api/job-applications"] });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);

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

  const updateJobStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      await apiRequest("PATCH", `/api/jobs/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Job Status Updated" });
    }
  });

  const updateAppStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      await apiRequest("PATCH", `/api/job-applications/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-applications"] });
      toast({ title: "Application Status Updated" });
    }
  });

  return (
    <div className="space-y-10">
      <div className="flex justify-end">
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add New Job
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
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Job Openings</CardTitle>
          <CardDescription>Control visibility of current job roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs?.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-bold">{job.role}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>
                    <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => updateJobStatus.mutate({ 
                        id: job.id, 
                        status: job.status === 'open' ? 'closed' : 'open' 
                      })}
                    >
                      {job.status === 'open' ? 'Close Opening' : 'Re-open'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications Received</CardTitle>
          <CardDescription>Review candidates who applied for roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Job Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications?.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <p className="font-bold">{app.name}</p>
                      <p className="text-xs text-muted-foreground">{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </TableCell>
                  <TableCell>{jobs?.find(j => j.id === app.jobId)?.role || "N/A"}</TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <p>{app.email}</p>
                      <p>{app.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs">View Resume</a>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{app.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <select 
                      className="text-xs border rounded p-1"
                      value={app.status}
                      onChange={(e) => updateAppStatus.mutate({ id: app.id, status: e.target.value })}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Admin() {
  const { data: user } = useUser();
  const [_, setLocation] = useLocation();

  if (!user || user.role !== 'admin') {
    setLocation("/");
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-3xl font-bold">Admin Dashboard</h1>
          <Badge className="bg-primary text-primary-foreground">Admin Access</Badge>
        </div>

        <Tabs defaultValue="stats">
          <TabsList className="mb-8">
            <TabsTrigger value="stats">Overview</TabsTrigger>
            <TabsTrigger value="products">Menu Management</TabsTrigger>
            <TabsTrigger value="orders">Orders & Payments</TabsTrigger>
            <TabsTrigger value="jobs">Job Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <StatsView />
          </TabsContent>

          <TabsContent value="products">
            <ProductsManager />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManager />
          </TabsContent>

          <TabsContent value="jobs">
            <JobsManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

// --- SUB COMPONENTS ---

function StatsView() {
  const { data: orders } = useOrders();
  
  const totalRevenue = orders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0;
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  const totalOrders = orders?.length || 0;

  // Simple chart data
  const data = [
    { name: 'Pending', value: pendingOrders },
    { name: 'Completed', value: (orders?.filter(o => o.status === 'delivered').length || 0) },
    { name: 'Cancelled', value: (orders?.filter(o => o.status === 'cancelled').length || 0) },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">₹{totalRevenue}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{pendingOrders}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalOrders}</div>
        </CardContent>
      </Card>

      <Card className="col-span-full h-[400px]">
        <CardHeader>
          <CardTitle>Order Status Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={data}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis dataKey="name" />
               <YAxis />
               <Tooltip />
               <Bar dataKey="value" fill="#8D6E63" />
             </BarChart>
           </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductsManager() {
  const { data: products } = useProducts();
  const { mutate: deleteProduct } = useDeleteProduct();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => { setEditingProduct(null); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <ProductForm 
            defaultValues={editingProduct} 
            onSuccess={() => setIsDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded object-cover" />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>₹{product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(product); setIsDialogOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteProduct(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ProductForm({ defaultValues, onSuccess }: { defaultValues?: any; onSuccess: () => void }) {
  const { mutateAsync: createProduct } = useCreateProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  
  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: defaultValues || {
      name: "",
      price: 0,
      stock: 0,
      category: "Tea",
      imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=1000",
      description: "",
      ingredients: "",
      hindiName: "",
      isBestSeller: false
    }
  });

  const onSubmit = async (data: InsertProduct) => {
    try {
      if (defaultValues?.id) {
        await updateProduct({ id: defaultValues.id, ...data });
      } else {
        await createProduct(data);
      }
      onSuccess();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...form.register("name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hindiName">Hindi Name (Optional)</Label>
          <Input id="hindiName" {...form.register("hindiName")} />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹)</Label>
          <Input id="price" type="number" {...form.register("price", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" {...form.register("stock", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
           <Label htmlFor="category">Category</Label>
           <select 
              id="category" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              {...form.register("category")}
           >
             <option value="Tea">Tea</option>
             <option value="Coffee">Coffee</option>
             <option value="Snacks">Snacks</option>
           </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...form.register("description")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input id="imageUrl" {...form.register("imageUrl")} />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="bestSeller" {...form.register("isBestSeller")} className="rounded border-gray-300" />
        <Label htmlFor="bestSeller">Mark as Best Seller</Label>
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving..." : "Save Product"}
      </Button>
    </form>
  );
}

function OrdersManager() {
  const { data: orders } = useOrders();
  const { mutate: updateStatus } = useUpdateOrderStatus();

  const handleVerifyPayment = (orderId: number) => {
    updateStatus({ id: orderId, status: "confirmed", paymentStatus: "paid" });
  };

  const handleDeliver = (orderId: number) => {
    updateStatus({ id: orderId, status: "delivered" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Verify payments and manage order fulfillment.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>₹{order.totalAmount}</TableCell>
                  <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'} className={order.paymentStatus === 'paid' ? 'bg-green-600' : ''}>
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <Badge variant="outline">{order.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {(order.paymentStatus === 'pending_verification' || order.paymentStatus === 'pending') && (
                        <Button 
                          size="sm" 
                          onClick={() => handleVerifyPayment(order.id)} 
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Verify Payment
                        </Button>
                      )}
                      {order.status === 'confirmed' && (
                        <Button size="sm" variant="outline" onClick={() => handleDeliver(order.id)}>
                          Mark Delivered
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
