import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Coffee, Leaf, Sun } from "lucide-react";
import { useState, useEffect } from "react";

const heroImages = [
  "https://images.unsplash.com/photo-1544733422-251e532ca221?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1563911891280-14984576596e?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1594631252845-29fc458695d7?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1597481499666-130f8eb2c9cd?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512539130762-b9134a62589e?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582733306302-b445f4963c6b?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1611003228941-98a52e6dc4b5?q=80&w=2574&auto=format&fit=crop"
];

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const bestSellers = products?.filter(p => p.isBestSeller).slice(0, 3);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Images with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          {heroImages.map((src, index) => (
            <img 
              key={src}
              src={src} 
              alt="Tea Garden" 
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                index === currentImageIndex 
                  ? "translate-x-0 opacity-100 z-10" 
                  : index < currentImageIndex 
                    ? "-translate-x-full opacity-0 z-0" 
                    : "translate-x-full opacity-0 z-0"
              }`}
            />
          ))}
        </div>

        <div className="container relative z-20 text-center text-white space-y-6 max-w-4xl px-4">
          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Experience the Art of <br/> 
            <span className="text-accent italic">Perfect Chai</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Handpicked leaves, authentic spices, and brewed with passion. 
            Discover the flavors that bring people together.
          </p>
          <div className="pt-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Link href="/menu">
              <Button size="lg" className="rounded-full px-8 py-6 text-lg bg-accent text-accent-foreground hover:bg-white hover:text-primary transition-all duration-300 shadow-xl shadow-black/20">
                Explore Our Menu <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center space-y-4 p-6 rounded-2xl bg-white shadow-sm border border-border/50 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold">Organic Leaves</h3>
              <p className="text-muted-foreground">Sourced directly from the finest gardens in Darjeeling and Assam.</p>
            </div>
            <div className="text-center space-y-4 p-6 rounded-2xl bg-white shadow-sm border border-border/50 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <Sun className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold">Freshly Brewed</h3>
              <p className="text-muted-foreground">Every cup is brewed fresh to order, ensuring perfect taste and aroma.</p>
            </div>
            <div className="text-center space-y-4 p-6 rounded-2xl bg-white shadow-sm border border-border/50 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <Coffee className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold">Authentic Taste</h3>
              <p className="text-muted-foreground">Traditional recipes passed down through generations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-4xl font-bold mb-2">Our Best Sellers</h2>
              <p className="text-muted-foreground">Customer favorites you must try</p>
            </div>
            <Link href="/menu">
              <Button variant="outline" className="hidden md:flex">View Full Menu</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {bestSellers?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="mt-10 text-center md:hidden">
            <Link href="/menu">
              <Button variant="outline" className="w-full">View Full Menu</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-primary rounded-2xl z-0" />
              {/* Unsplash pouring tea image */}
              <img 
                src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=2487&auto=format&fit=crop" 
                alt="Pouring Tea" 
                className="rounded-2xl shadow-2xl relative z-10 w-full"
              />
            </div>
            <div className="space-y-6">
              <h2 className="font-serif text-4xl font-bold">A Tradition of Warmth</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Chai isn't just a drink; it's an emotion. It's the "Good Morning" to your day 
                and the "Relax" to your evening. At Chai Craft, we honor this tradition by 
                bringing you the most authentic tea experience.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span>100% Natural Ingredients</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span>No Artificial Flavors</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span>Hand-blended Spices</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
