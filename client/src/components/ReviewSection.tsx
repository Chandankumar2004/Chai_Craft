import { useQuery, useMutation } from "@tanstack/react-query";
import { Review, InsertReview, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useUser } from "@/hooks/use-auth";
import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReviewSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

type ReviewWithUser = Review & { user: User };

interface ReviewSectionProps {
  productId: number;
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const { data: user } = useUser();
  const { toast } = useToast();
  const { data: reviews, isLoading } = useQuery<ReviewWithUser[]>({
    queryKey: ["/api/products", productId, "reviews"],
  });

  const form = useForm<InsertReview>({
    resolver: zodResolver(insertReviewSchema),
    defaultValues: {
      productId,
      rating: 5,
      comment: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: InsertReview) => {
      const res = await apiRequest("POST", `/api/products/${productId}/reviews`, values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "reviews"] });
      form.reset();
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
    },
  });

  const averageRating = reviews?.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-8 mt-12">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-3xl font-bold">Customer Reviews</h2>
        {reviews?.length ? (
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${Number(averageRating) >= s ? "fill-current" : ""}`}
                />
              ))}
            </div>
            <span className="font-bold text-lg">{averageRating}</span>
            <span className="text-muted-foreground">({reviews.length} reviews)</span>
          </div>
        ) : null}
      </div>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => field.onChange(s)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-8 h-8 ${field.value >= s ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                            />
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Share your thoughts about this product..."
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={mutation.isPending} className="w-full md:w-auto">
                  Submit Review
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : reviews?.length ? (
          reviews.map((review) => (
            <Card key={review.id} className="border-none bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={review.user.profilePhotoUrl || undefined} />
                    <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">{review.user.name}</p>
                        <div className="flex text-yellow-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${review.rating >= s ? "fill-current" : ""}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(review.createdAt!), "MMM d, yyyy")}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No reviews yet</h3>
            <p className="text-muted-foreground">Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  );
}
