import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type InsertOrder, type Order } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";

type CreateOrderInput = {
  items: { productId: number; quantity: number }[];
  deliveryAddress: string;
  totalAmount: number;
};

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      return await res.json();
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const clearCart = useCart((state) => state.clearCart);

  return useMutation({
    mutationFn: async (orderData: CreateOrderInput) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) throw new Error("Failed to place order");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      clearCart();
      toast({ 
        title: "Order Placed!", 
        description: "Your order has been received. Please verify payment if using UPI." 
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, paymentStatus }: { id: number; status?: string; paymentStatus?: string }) => {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update order status");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Success", description: "Order status updated" });
    },
  });
}
