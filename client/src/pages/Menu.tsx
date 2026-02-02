import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ShoppingBag, SlidersHorizontal, ArrowUpDown, Plus, Minus, Leaf } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/hooks/use-language";
import { ReviewSection } from "@/components/ReviewSection";
import { Product } from "@shared/schema";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";

const CATEGORIES = ["All", "Tea", "Coffee", "Snacks"];

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc";

export default function Menu() {
  const { data: products, isLoading } = useProducts();
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]); // in rupees

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products.filter((product) => {
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const priceInRupees = product.price / 100;
      const matchesPrice = priceInRupees >= priceRange[0] && priceInRupees <= priceRange[1];
      
      return matchesCategory && matchesSearch && matchesPrice;
    });

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc": return b.name.localeCompare(a.name);
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        default: return 0;
      }
    });
  }, [products, activeCategory, searchQuery, sortOption, priceRange]);

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
        <div className="flex flex-col gap-6 mb-12">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 justify-center">
              {CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  onClick={() => setActiveCategory(category)}
                  className="rounded-full px-6"
                  data-testid={`button-category-${category.toLowerCase()}`}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary h-4 w-4" />
                <Input 
                  placeholder="Search menu..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full border-primary/20 focus-visible:ring-primary h-10"
                  data-testid="input-search-menu"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-center">
                {/* Sorting */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="default" className="rounded-full flex items-center gap-2 border-primary/20 hover:border-primary h-10 px-4" data-testid="button-sort">
                      <ArrowUpDown className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Sort</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem 
                      checked={sortOption === "name-asc"} 
                      onCheckedChange={() => setSortOption("name-asc")}
                    >
                      Name (A-Z)
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                      checked={sortOption === "name-desc"} 
                      onCheckedChange={() => setSortOption("name-desc")}
                    >
                      Name (Z-A)
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                      checked={sortOption === "price-asc"} 
                      onCheckedChange={() => setSortOption("price-asc")}
                    >
                      Price (Low to High)
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                      checked={sortOption === "price-desc"} 
                      onCheckedChange={() => setSortOption("price-desc")}
                    >
                      Price (High to Low)
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Filters */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="default" className="rounded-full flex items-center gap-2 border-primary/20 hover:border-primary h-10 px-4" data-testid="button-filter">
                      <SlidersHorizontal className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Filter</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2">
                    <DropdownMenuLabel className="px-2 pt-2">Price Range</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="space-y-3 p-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-semibold text-primary">₹{priceRange[0]}</span>
                        <span className="text-xs font-semibold text-primary">₹{priceRange[1]}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant={priceRange[1] <= 50 ? "default" : "outline"} 
                          size="sm" 
                          onClick={() => setPriceRange([0, 50])}
                          className="text-[11px] h-8 rounded-lg"
                        >
                          Under ₹50
                        </Button>
                        <Button 
                          variant={priceRange[0] === 50 && priceRange[1] === 100 ? "default" : "outline"} 
                          size="sm" 
                          onClick={() => setPriceRange([50, 100])}
                          className="text-[11px] h-8 rounded-lg"
                        >
                          ₹50 - ₹100
                        </Button>
                        <Button 
                          variant={priceRange[0] === 100 ? "default" : "outline"} 
                          size="sm" 
                          onClick={() => setPriceRange([100, 1000])}
                          className="text-[11px] h-8 rounded-lg"
                        >
                          Over ₹100
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setPriceRange([0, 1000])}
                          className="text-[11px] h-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-xl">No items found.</p>
            <Button variant="ghost" onClick={() => {
              setActiveCategory("All"); 
              setSearchQuery(""); 
              setPriceRange([0, 1000]);
              setSortOption("name-asc");
            }}>
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAndSortedProducts.map((product) => (
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
                      <div className="flex flex-col items-end gap-3">
                        {(() => {
                          const itemInCart = useCart.getState().items.find(i => i.id === selectedProduct.id);
                          const quantity = itemInCart?.quantity || 0;
                          
                          return quantity > 0 ? (
                            <div className="flex items-center gap-4 bg-primary/5 rounded-full p-1 border border-primary/20">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full text-primary hover:bg-primary/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  useCart.getState().updateQuantity(selectedProduct.id, quantity - 1);
                                }}
                              >
                                <Minus className="h-5 w-5" />
                              </Button>
                              <span className="w-8 text-center font-bold text-xl">{quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full text-primary hover:bg-primary/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  useCart.getState().addItem(selectedProduct);
                                }}
                              >
                                <Plus className="h-5 w-5" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="lg" 
                              className="rounded-full px-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                addItem(selectedProduct);
                              }}
                            >
                              <ShoppingBag className="w-5 h-5 mr-2" /> 
                              {t("cart.add")}
                            </Button>
                          );
                        })()}
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full flex items-center gap-2 border-accent/30 text-accent hover:bg-accent/10"
                          onClick={() => {
                            // This would ideally open a guide or trigger a tip
                            const guide = selectedProduct.category === "Tea" 
                              ? "Steep in boiling water for 3-5 minutes with a splash of milk and ginger for the perfect cup."
                              : "Best enjoyed hot with a sprinkle of cocoa or cold over ice.";
                            alert(`Brewing Guide: ${guide}`);
                          }}
                        >
                          <Leaf className="w-4 h-4" />
                          Brewing Guide
                        </Button>
                      </div>
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
