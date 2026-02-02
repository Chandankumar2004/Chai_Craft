import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "./ProductCard";
import { Product } from "@shared/schema";
import { Sparkles } from "lucide-react";

export function Recommendations() {
  const { data: recommendations, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/recommendations"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-96 bg-gray-200 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <section className="py-20 bg-primary/5 rounded-3xl my-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-10 justify-center md:justify-start">
          <div className="p-2 bg-primary/10 rounded-full">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-serif text-3xl font-bold">Recommended For You</h2>
            <p className="text-muted-foreground">AI-powered suggestions based on your taste</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recommendations.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
