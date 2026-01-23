import { Layout } from "@/components/Layout";
import { useUser, useLogout } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, User, Clock } from "lucide-react";

export default function Profile() {
  const { data: user } = useUser();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { mutate: logout } = useLogout();

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <Card className="text-center p-6">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary/20">
                <AvatarImage src={user.profilePhotoUrl || ""} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="font-bold text-xl">{user.name}</h2>
              <p className="text-muted-foreground text-sm mb-4">{user.username}</p>
              <Badge variant="secondary" className="mb-6 uppercase text-xs">{user.role}</Badge>
              
              <Button variant="outline" className="w-full" onClick={() => logout()}>
                Sign Out
              </Button>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
             <Tabs defaultValue="orders">
              <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8">
                <TabsTrigger value="orders">Order History</TabsTrigger>
                <TabsTrigger value="details">Account Details</TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="space-y-4">
                <h3 className="text-2xl font-serif font-bold mb-4">Your Orders</h3>
                {ordersLoading ? (
                   <div className="space-y-4">
                     {[1,2].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />)}
                   </div>
                ) : orders?.length === 0 ? (
                  <Card className="p-12 text-center text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No orders yet.</p>
                  </Card>
                ) : (
                  orders?.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <div className="bg-muted/30 p-4 flex justify-between items-center border-b">
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="block text-xs font-semibold uppercase">Order Placed</span>
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="block text-xs font-semibold uppercase">Total</span>
                            <span>₹{order.totalAmount}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-muted-foreground">Order #{order.id}</span>
                          <OrderStatusBadge status={order.status} />
                          <PaymentStatusBadge status={order.paymentStatus} />
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>View your personal details.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <p className="font-medium">{user.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="font-medium">{user.phone || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="font-medium">{user.username}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Address</label>
                        <p className="font-medium">{user.address || "-"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending_verification: "text-orange-600",
    paid: "text-green-600",
    failed: "text-red-600",
  };
  return (
    <span className={`text-xs font-medium flex items-center gap-1 ${styles[status] || ""}`}>
       {status === 'pending_verification' ? 'Verifying Payment' : status.toUpperCase()}
    </span>
  );
}
