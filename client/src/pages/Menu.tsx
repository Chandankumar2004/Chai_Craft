import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ShoppingBag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/hooks/use-cart";
import { ReviewSection } from "@/components/ReviewSection";
import { Product } from "@shared/schema";

const CATEGORIES = ["All", "Tea", "Coffee", "Snacks"];

export default function Menu() {
  const { data: products, isLoading } = useProducts();
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products?.filter((product) => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <div className="bg-primary/5 py-12 mb-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Our Menu</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our curated selection of fine teas, aromatic coffees, and delicious snacks.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col md:flex-row gap-8 mb-12 items-center justify-between">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className="rounded-full px-6"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search menu..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full"
            />
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredProducts?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-xl">No items found.</p>
            <Button variant="ghost" onClick={() => {setActiveCategory("All"); setSearchQuery("");}}>Clear filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts?.map((product) => (
              <div key={product.id} onClick={() => setSelectedProduct(product)} className="cursor-pointer">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <div className="space-y-8">
              <DialogHeader>
                <DialogTitle className="font-serif text-3xl font-bold flex items-center justify-between">
                  <span>{selectedProduct.name}</span>
                  <span className="text-primary">₹{(selectedProduct.price / 100).toFixed(0)}</span>
                </DialogTitle>
                {selectedProduct.hindiName && (
                  <p className="text-xl text-primary font-medium">{selectedProduct.hindiName}</p>
                )}
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.name} 
                  className="w-full rounded-2xl shadow-lg object-cover aspect-square"
                />
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">{selectedProduct.description}</p>
                  </div>
                  
                  {selectedProduct.ingredients && (
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg">Ingredients</h3>
                      <p className="text-muted-foreground">{selectedProduct.ingredients}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm font-medium">
                      Weight: <span className="text-muted-foreground">{selectedProduct.weight || "N/A"}</span>
                    </div>
                    <Button 
                      size="lg" 
                      className="rounded-full px-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(selectedProduct);
                        setSelectedProduct(null);
                      }}
                    >
                      <ShoppingBag className="w-5 h-5 mr-2" /> Add to Cart
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-8">
                <ReviewSection productId={selectedProduct.id} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
