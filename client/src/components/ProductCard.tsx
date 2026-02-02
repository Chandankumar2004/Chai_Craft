import { type Product } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Star, StarHalf, MessageSquare } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-auth";

export function ProductCard({ product }: { product: Product }) {
  const { t, language } = useLanguage();
  const { data: user } = useUser();
  const { toast } = useToast();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  const addItem = useCart((state) => state.addItem);
  const updateQuantity = useCart((state) => state.updateQuantity);
  const items = useCart((state) => state.items);
  const itemInCart = items.find((item) => item.id === product.id);
  const quantity = itemInCart?.quantity || 0;

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<any[]>({
    queryKey: ["/api/products", product.id, "reviews"],
    enabled: isReviewOpen || true, // Small optimization: always fetch for rating display
  });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  const handleAddReview = async () => {
    if (!user) {
      toast({ title: "Please login to add a review", variant: "destructive" });
      return;
    }
    try {
      await apiRequest("POST", `/api/products/${product.id}/reviews`, {
        rating: newRating,
        comment: newComment
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products", product.id, "reviews"] });
      setNewComment("");
      toast({ title: "Review added successfully!" });
    } catch (e) {
      toast({ title: "Failed to add review", variant: "destructive" });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50 bg-card hover:-translate-y-1 h-full flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        {product.isBestSeller && (
          <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground font-semibold hover:bg-accent/90">
            {t("cart.bestseller")}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-5 flex-1">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="text-xs uppercase tracking-wider text-muted-foreground border-muted-foreground/30">
            {product.category}
          </Badge>
          <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-medium text-yellow-600 hover:text-yellow-700 transition-colors">
                <Star className={`w-4 h-4 ${averageRating > 0 ? 'fill-current' : ''}`} />
                <span>{averageRating > 0 ? averageRating.toFixed(1) : "New"}</span>
                <span className="text-muted-foreground text-xs">({reviews.length})</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Customer Reviews - {language === 'hi' && product.hindiName ? product.hindiName : product.name}</DialogTitle>
              </DialogHeader>
              
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4 mb-6">
                  {reviews.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8 italic">No reviews yet. Be the first to review!</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b border-border/50 pb-4">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-sm">{review.user?.name || "Anonymous"}</p>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {user && (
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setNewRating(star)}>
                          <Star className={`w-5 h-5 ${star <= newRating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <textarea 
                      className="w-full p-3 rounded-lg border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      rows={3}
                      placeholder="Share your experience..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button onClick={handleAddReview} className="w-full">Submit Review</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
        <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {language === 'hi' && product.hindiName ? product.hindiName : product.name}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
          {product.description}
        </p>
      </CardContent>

      <CardFooter className="p-5 pt-0 flex items-center justify-between mt-auto">
        <span className="text-lg font-bold text-primary">
          {formatPrice(product.price)}
        </span>
        {quantity > 0 ? (
          <div className="flex items-center gap-2 bg-accent/10 rounded-full p-1 border border-accent/20">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-accent hover:bg-accent/20"
              onClick={(e) => {
                e.stopPropagation();
                updateQuantity(product.id, quantity - 1);
              }}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-bold text-accent">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-accent hover:bg-accent/20"
              onClick={(e) => {
                e.stopPropagation();
                addItem(product);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              addItem(product);
            }}
            className="rounded-full bg-secondary hover:bg-secondary/90 text-white shadow-md hover:shadow-lg transition-all"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" /> {t("cart.add")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
