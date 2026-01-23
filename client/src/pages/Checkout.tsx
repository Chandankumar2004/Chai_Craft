import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useCart } from "@/hooks/use-cart";
import { useUser } from "@/hooks/use-auth";
import { useCreateOrder } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { QrCode, CheckCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const checkoutSchema = z.object({
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  paymentConfirmed: z.boolean().refine(val => val === true, "You must confirm payment"),
});

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { data: user } = useUser();
  const { mutateAsync: createOrder } = useCreateOrder();
  const [_, setLocation] = useLocation();
  const cartTotal = total();
  
  const form = useForm<{deliveryAddress: string; paymentConfirmed: boolean}>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryAddress: user?.address || "",
      paymentConfirmed: false
    }
  });

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Please login to checkout</h2>
          <Button onClick={() => setLocation("/auth")}>Go to Login</Button>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const onSubmit = async (data: {deliveryAddress: string}) => {
    try {
      await createOrder({
        items: items.map(item => ({ productId: item.id, quantity: item.quantity })),
        deliveryAddress: data.deliveryAddress,
        totalAmount: cartTotal,
      });
      clearCart();
      setLocation("/profile"); // Redirect to orders
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl font-bold mb-8 text-center">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Address Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                  Delivery Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={user.name} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Delivery Address</Label>
                  <Input 
                    placeholder="Enter your full address" 
                    {...form.register("deliveryAddress")} 
                  />
                  {form.formState.errors.deliveryAddress && (
                    <p className="text-destructive text-sm">{form.formState.errors.deliveryAddress.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                  Manual UPI Payment
                </CardTitle>
                <CardDescription>
                  Scan the QR code or use the details below to pay.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-border">
                  {/* Placeholder QR Code - Using a generic icon representation or a placeholder image URL if available */}
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-lg mb-4 border-2 border-dashed border-gray-300">
                    <QrCode className="w-16 h-16 text-gray-400" />
                    <span className="sr-only">QR Code Placeholder</span>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-bold text-lg text-primary">chandan32005c-2@oksbi</p>
                    <p className="text-sm text-muted-foreground">Mobile: 9304335185</p>
                    <p className="font-bold text-xl mt-2">Amount: ₹{cartTotal}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-border">
                  <Checkbox 
                    id="payment-confirmed" 
                    onCheckedChange={(c) => form.setValue("paymentConfirmed", c as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="payment-confirmed"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I have completed the payment
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Your order will be verified by the admin after submission.
                    </p>
                    {form.formState.errors.paymentConfirmed && (
                      <p className="text-destructive text-sm mt-2">{form.formState.errors.paymentConfirmed.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full h-12 text-lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Placing Order..." : "Place Order"}
            </Button>
          </form>

          {/* Order Summary */}
          <div className="space-y-6">
             <Card>
               <CardHeader>
                 <CardTitle>Order Summary</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 {items.map((item) => (
                   <div key={item.id} className="flex justify-between text-sm">
                     <span>{item.name} x {item.quantity}</span>
                     <span className="font-medium">₹{item.price * item.quantity}</span>
                   </div>
                 ))}
                 <Separator />
                 <div className="flex justify-between text-lg font-bold text-primary">
                   <span>Total Payable</span>
                   <span>₹{cartTotal}</span>
                 </div>
               </CardContent>
             </Card>

             <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex gap-3 text-yellow-800 text-sm">
               <AlertCircle className="w-5 h-5 flex-shrink-0" />
               <p>Please insure you put the correct reference number in your UPI payment comments if possible to help us verify faster.</p>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
