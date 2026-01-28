import { type Product } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((state) => state.addItem);
  const { t, language } = useLanguage();

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
        <Button 
          onClick={() => addItem(product)}
          className="rounded-full bg-secondary hover:bg-secondary/90 text-white shadow-md hover:shadow-lg transition-all"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" /> {t("cart.add")}
        </Button>
      </CardFooter>
    </Card>
  );
}
