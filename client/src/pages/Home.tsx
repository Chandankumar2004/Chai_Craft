import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Coffee, Leaf, Sun } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const teaGardenImages = [
  "https://images.unsplash.com/photo-1544733422-251e532ca221?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1594631252845-29fc458695d7?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512727317027-4174b33fbfa0?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506459225024-1428097a7e18?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523906630133-f113565a4d56?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542601906970-34f970404f5d?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1563911891280-14984576596e?q=80&w=2574&auto=format&fit=crop"
];

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const [scrollPos, setScrollPos] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left

  useEffect(() => {
    let animationId: number;
    const scroll = () => {
      setScrollPos((prev) => {
        const next = prev + (0.5 * direction);
        // Infinite scroll logic: if we move too far, we'll loop
        // But for a simple smooth transition, we just let it flow
        return next;
      });
      animationId = requestAnimationFrame(scroll);
    };
    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [direction]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX } = e;
    const { innerWidth } = window;
    // If mouse is on the right half, move right (direction 1)
    // If mouse is on the left half, move left (direction -1)
    if (clientX > innerWidth / 2) {
      setDirection(1);
    } else {
      setDirection(-1);
    }
  };

  const bestSellers = products?.filter(p => p.isBestSeller).slice(0, 3);

  return (
    <Layout>
      {/* Hero Section */}
      <section 
        className="relative h-[600px] flex items-center justify-center overflow-hidden cursor-none"
        onMouseMove={handleMouseMove}
      >
        {/* Continuous Scrolling Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <div 
            className="flex h-full transition-transform duration-100 ease-linear"
            style={{ 
              transform: `translateX(${-scrollPos % (teaGardenImages.length * 100)}vw)`,
              width: `${teaGardenImages.length * 300}vw`
            }}
          >
            {/* Render images multiple times for seamless looping */}
            {[...teaGardenImages, ...teaGardenImages, ...teaGardenImages].map((src, index) => (
              <div key={`${src}-${index}`} className="relative h-full w-[100vw] shrink-0">
                <img 
                  src={src} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="container relative z-20 text-center text-white space-y-6 max-w-4xl px-4 pointer-events-none">
          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight drop-shadow-2xl">
            Experience the Art of <br/> 
            <span className="text-accent italic">Perfect Chai</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-lg">
            Handpicked leaves from the finest tea gardens, authentic spices, and brewed with passion. 
            Discover the flavors that bring people together.
          </p>
          <div className="pt-4 pointer-events-auto">
            <Link href="/menu">
              <Button size="lg" className="rounded-full px-8 py-6 text-lg bg-accent text-accent-foreground hover:bg-white hover:text-primary transition-all duration-300 shadow-xl shadow-black/40">
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
