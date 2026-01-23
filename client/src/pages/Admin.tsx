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
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
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
                      {order.paymentStatus === 'pending_verification' && (
                        <Button size="sm" onClick={() => handleVerifyPayment(order.id)} className="bg-green-600 hover:bg-green-700">
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
